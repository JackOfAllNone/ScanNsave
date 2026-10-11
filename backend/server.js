import cors from 'cors';
import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import dotenv from 'dotenv';
import express from 'express';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import { promisify } from 'node:util';

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 4000);
const allowedOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';
const scrypt = promisify(scryptCallback);
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const emailTokenLifetimeMs = 24 * 60 * 60 * 1000;
const sessionLifetimeMs = 30 * 24 * 60 * 60 * 1000;
const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	limit: 10,
	standardHeaders: 'draft-8',
	legacyHeaders: false,
	message: { error: 'Too many authentication requests. Please try again later.' },
});

app.use(cors({ origin: allowedOrigin }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));
app.use((request, _response, next) => {
	if (!request.body || typeof request.body !== 'object') request.body = {};
	next();
});

const userSchema = new mongoose.Schema(
	{
		email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
		passwordHash: { type: String, required: true },
		emailVerified: { type: Boolean, default: false },
		verificationTokenHash: { type: String, default: null },
		verificationTokenExpiresAt: { type: Date, default: null },
		passwordResetTokenHash: { type: String, default: null },
		passwordResetTokenExpiresAt: { type: Date, default: null },
	},
	{ timestamps: true }
);

const User = mongoose.model('User', userSchema);

const authSessionSchema = new mongoose.Schema(
	{
		userId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
		tokenHash: { type: String, required: true, unique: true },
		expiresAt: { type: Date, required: true, index: { expires: 0 } },
	},
	{ timestamps: true }
);

const AuthSession = mongoose.model('AuthSession', authSessionSchema);

const historySchema = new mongoose.Schema(
	{
		owner: { type: String, unique: true, default: 'default' },
		items: { type: [mongoose.Schema.Types.Mixed], default: [] },
	},
	{ timestamps: true }
);

const History = mongoose.model('History', historySchema);

const productSchema = new mongoose.Schema(
	{
		barcode: { type: String, required: true, unique: true, index: true },
		name: { type: String, required: true },
		image: { type: String, default: '' },
		product: { type: mongoose.Schema.Types.Mixed, required: true },
	},
	{ timestamps: true }
);

const Product = mongoose.model('Product', productSchema);

function httpError(status, message) {
	const error = new Error(message);
	error.status = status;
	return error;
}

function normalizeEmail(value) {
	if (typeof value !== 'string') throw httpError(400, 'A valid email address is required.');
	const email = value.trim().toLowerCase();
	if (email.length > 254 || !emailPattern.test(email)) {
		throw httpError(400, 'A valid email address is required.');
	}
	return email;
}

function validatePassword(value) {
	if (typeof value !== 'string' || value.length < 8 || value.length > 128) {
		throw httpError(400, 'Password must be between 8 and 128 characters.');
	}
	return value;
}

function makeToken() {
	return randomBytes(32).toString('base64url');
}

function hashToken(token) {
	return createHash('sha256').update(token).digest('hex');
}

async function hashPassword(password) {
	const salt = randomBytes(16);
	const derivedKey = await scrypt(password, salt, 64, {
		N: 16384,
		r: 8,
		p: 1,
		maxmem: 64 * 1024 * 1024,
	});
	return `scrypt$16384$8$1$${salt.toString('base64url')}$${Buffer.from(derivedKey).toString('base64url')}`;
}

async function verifyPassword(password, storedHash) {
	const [algorithm, cost, blockSize, parallelization, saltText, keyText] = storedHash.split('$');
	if (algorithm !== 'scrypt' || cost !== '16384' || blockSize !== '8' || parallelization !== '1' || !saltText || !keyText) {
		return false;
	}
	const salt = Buffer.from(saltText, 'base64url');
	const expectedKey = Buffer.from(keyText, 'base64url');
	if (salt.length !== 16 || expectedKey.length !== 64) return false;
	const derivedKey = Buffer.from(await scrypt(password, salt, expectedKey.length, {
		N: 16384,
		r: 8,
		p: 1,
		maxmem: 64 * 1024 * 1024,
	}));
	return timingSafeEqual(derivedKey, expectedKey);
}

function publicUser(user) {
	return { id: String(user._id), email: user.email };
}

function publicApiUrl() {
	const baseUrl = process.env.PUBLIC_API_URL?.trim().replace(/\/+$/, '');
	if (!baseUrl) throw httpError(503, 'Email links are not configured. Set PUBLIC_API_URL on the API server.');
	try {
		const url = new URL(baseUrl);
		const isLocalHttp = url.protocol === 'http:' && url.hostname === 'localhost';
		if (url.protocol !== 'https:' && !isLocalHttp) {
			throw new Error('PUBLIC_API_URL must use HTTPS.');
		}
		if (url.username || url.password || url.search || url.hash) {
			throw new Error('PUBLIC_API_URL must not contain credentials, a query, or a fragment.');
		}
		return `${url.origin}${url.pathname.replace(/\/+$/, '')}`;
	} catch (error) {
		throw httpError(503, error.message.startsWith('PUBLIC_API_URL')
			? error.message
			: 'Email links are not configured with a valid PUBLIC_API_URL.');
	}
}

async function sendBrevoEmail({ email, subject, htmlContent, textContent }) {
	const apiKey = process.env.BREVO_API_KEY;
	const senderEmail = process.env.BREVO_SENDER_EMAIL;
	if (!apiKey || !senderEmail) {
		throw httpError(503, 'Brevo email is not configured. Set BREVO_API_KEY and BREVO_SENDER_EMAIL.');
	}

	let response;
	try {
		response = await fetch('https://api.brevo.com/v3/smtp/email', {
			method: 'POST',
			headers: { 'api-key': apiKey, 'content-type': 'application/json' },
			body: JSON.stringify({
				sender: { email: senderEmail, name: process.env.BREVO_SENDER_NAME || 'ScanNsave' },
				to: [{ email }],
				subject,
				htmlContent,
				textContent,
			}),
		});
	} catch (error) {
		console.error('Brevo email request failed:', error.message);
		throw httpError(502, 'Brevo could not send the email. Please try again later.');
	}

	if (!response.ok) {
		console.error(`Brevo email request failed with status ${response.status}.`);
		throw httpError(502, 'Brevo could not send the email. Please try again later.');
	}
}

function createEmailLink(path, token) {
	const url = new URL(`${publicApiUrl()}${path}`);
	url.searchParams.set('token', token);
	return url.toString();
}

function emailLinkPage(title, message, form = '') {
	return `<!doctype html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width,initial-scale=1">
	<title>${title} | ScanNsave</title>
	<style>
		body{margin:0;padding:24px;background:#08110f;color:#f2f7f3;font:16px system-ui,sans-serif}
		main{max-width:420px;margin:10vh auto;padding:28px;border:1px solid #293a33;border-radius:18px;background:#101b17}
		h1{font-size:24px;margin:0 0 12px}p{color:#96a69d;line-height:1.5}
		label{display:block;margin:18px 0 8px}input{box-sizing:border-box;width:100%;padding:13px;border:1px solid #293a33;border-radius:10px;background:#08110f;color:#f2f7f3}
		button{width:100%;margin-top:18px;padding:13px;border:0;border-radius:10px;background:#4bd69a;color:#08110f;font-weight:700;font-size:15px}
	</style>
</head>
<body><main><h1>${title}</h1><p>${message}</p>${form}</main></body>
</html>`;
}

async function requireAuth(request, response, next) {
	try {
		const authorization = request.get('authorization') || '';
		const match = authorization.match(/^Bearer\s+([A-Za-z0-9_-]+)$/i);
		if (!match) return response.status(401).json({ error: 'Sign in to continue.' });

		const session = await AuthSession.findOne({
			tokenHash: hashToken(match[1]),
			expiresAt: { $gt: new Date() },
		}).lean();
		if (!session) return response.status(401).json({ error: 'Your session has expired. Please sign in again.' });

		const user = await User.findById(session.userId).select('_id email emailVerified').lean();
		if (!user?.emailVerified) return response.status(401).json({ error: 'Sign in to continue.' });
		request.authUser = user;
		request.authSessionId = session._id;
		return next();
	} catch (error) {
		return next(error);
	}
}

app.post('/api/auth/register', authLimiter, async (request, response, next) => {
	try {
		const email = normalizeEmail(request.body.email);
		const password = validatePassword(request.body.password);
		let user = await User.findOne({ email });
		if (user?.emailVerified) throw httpError(409, 'An account with this email already exists.');

		const token = makeToken();
		if (user) {
			user.passwordHash = await hashPassword(password);
			user.verificationTokenHash = hashToken(token);
			user.verificationTokenExpiresAt = new Date(Date.now() + emailTokenLifetimeMs);
			await user.save();
		} else {
			user = await User.create({
				email,
				passwordHash: await hashPassword(password),
				verificationTokenHash: hashToken(token),
				verificationTokenExpiresAt: new Date(Date.now() + emailTokenLifetimeMs),
			});
		}

		const link = createEmailLink('/auth/verify-email', token);
		await sendBrevoEmail({
			email,
			subject: 'Verify your ScanNsave email',
			htmlContent: `<p>Confirm your email address to finish setting up your ScanNsave account.</p><p><a href="${link}">Verify email address</a></p><p>This link expires in 24 hours.</p>`,
			textContent: `Verify your ScanNsave email: ${link}\nThis link expires in 24 hours.`,
		});
		response.status(201).json({ message: 'Check your inbox for a link to verify your email.' });
	} catch (error) {
		if (error.code === 11000) return response.status(409).json({ error: 'An account with this email already exists.' });
		return next(error);
	}
});

app.post('/api/auth/login', authLimiter, async (request, response, next) => {
	try {
		const email = normalizeEmail(request.body.email);
		const password = validatePassword(request.body.password);
		const user = await User.findOne({ email });
		if (!user || !(await verifyPassword(password, user.passwordHash))) {
			throw httpError(401, 'Email or password is incorrect.');
		}
		if (!user.emailVerified) {
			throw httpError(403, 'Please verify your email before signing in.');
		}

		const token = makeToken();
		await AuthSession.create({
			userId: user._id,
			tokenHash: hashToken(token),
			expiresAt: new Date(Date.now() + sessionLifetimeMs),
		});
		response.json({ token, user: publicUser(user) });
	} catch (error) {
		return next(error);
	}
});

app.post('/api/auth/resend-verification', authLimiter, async (request, response, next) => {
	try {
		const email = normalizeEmail(request.body.email);
		const user = await User.findOne({ email });
		if (user && !user.emailVerified) {
			const token = makeToken();
			user.verificationTokenHash = hashToken(token);
			user.verificationTokenExpiresAt = new Date(Date.now() + emailTokenLifetimeMs);
			await user.save();
			const link = createEmailLink('/auth/verify-email', token);
			await sendBrevoEmail({
				email,
				subject: 'Verify your ScanNsave email',
				htmlContent: `<p>Confirm your email address to finish setting up your ScanNsave account.</p><p><a href="${link}">Verify email address</a></p><p>This link expires in 24 hours.</p>`,
				textContent: `Verify your ScanNsave email: ${link}\nThis link expires in 24 hours.`,
			});
		}
		response.json({ message: 'If an unverified account exists, a verification link has been sent.' });
	} catch (error) {
		return next(error);
	}
});

app.get('/api/auth/verify-email', (request, response) => {
	const token = typeof request.query.token === 'string' ? request.query.token : '';
	if (!/^[A-Za-z0-9_-]{43}$/.test(token)) {
		return response.status(400).type('html').send(emailLinkPage('Verify your email', 'This verification link is invalid or has expired.'));
	}
	const actionUrl = `${publicApiUrl()}/auth/verify-email`;
	const form = `<form method="post" action="${actionUrl}"><input type="hidden" name="token" value="${token}"><button type="submit">Verify email</button></form>`;
	return response.type('html').send(emailLinkPage('Verify your email', 'Confirm your email address to activate your ScanNsave account.', form));
});

app.post('/api/auth/verify-email', async (request, response, next) => {
	try {
		const token = typeof request.body.token === 'string' ? request.body.token : '';
		if (!token) throw httpError(400, 'This verification link is invalid or has expired.');
		const user = await User.findOne({
			verificationTokenHash: hashToken(token),
			verificationTokenExpiresAt: { $gt: new Date() },
		});
		if (!user) throw httpError(400, 'This verification link is invalid or has expired.');
		user.emailVerified = true;
		user.verificationTokenHash = null;
		user.verificationTokenExpiresAt = null;
		await user.save();

		if (request.is('application/x-www-form-urlencoded')) {
			return response.type('html').send(emailLinkPage('Email verified', 'Your ScanNsave account is ready. Return to the app and sign in.'));
		}
		return response.json({ message: 'Your email is verified. You can now sign in.' });
	} catch (error) {
		if (request.is('application/x-www-form-urlencoded')) {
			if (!error.status) console.error('Email verification form submission failed:', error);
			const message = error.status ? error.message : 'The verification could not be completed. Please try again.';
			return response.status(error.status || 500).type('html').send(emailLinkPage('Verification failed', message));
		}
		return next(error);
	}
});

app.post('/api/auth/forgot-password', authLimiter, async (request, response, next) => {
	try {
		const email = normalizeEmail(request.body.email);
		const user = await User.findOne({ email, emailVerified: true });
		if (user) {
			const token = makeToken();
			user.passwordResetTokenHash = hashToken(token);
			user.passwordResetTokenExpiresAt = new Date(Date.now() + emailTokenLifetimeMs);
			await user.save();
			const link = createEmailLink('/auth/reset-password', token);
			await sendBrevoEmail({
				email,
				subject: 'Reset your ScanNsave password',
				htmlContent: `<p>A password reset was requested for your ScanNsave account.</p><p><a href="${link}">Choose a new password</a></p><p>This link expires in 24 hours. If you did not request a reset, you can ignore this email.</p>`,
				textContent: `Reset your ScanNsave password: ${link}\nThis link expires in 24 hours. If you did not request a reset, you can ignore this email.`,
			});
		}
		response.json({ message: 'If a verified account exists, a password reset link has been sent.' });
	} catch (error) {
		return next(error);
	}
});

app.get('/api/auth/reset-password', (request, response) => {
	const token = typeof request.query.token === 'string' ? request.query.token : '';
	if (!/^[A-Za-z0-9_-]{43}$/.test(token)) {
		return response.status(400).type('html').send(emailLinkPage('Reset your password', 'This reset link is invalid or has expired.'));
	}
	const actionUrl = `${publicApiUrl()}/auth/reset-password`;
	const form = `<form method="post" action="${actionUrl}"><input type="hidden" name="token" value="${token}"><label for="password">New password</label><input id="password" name="password" type="password" minlength="8" maxlength="128" autocomplete="new-password" required><button type="submit">Update password</button></form>`;
	return response.type('html').send(emailLinkPage('Reset your password', 'Choose a new password for your ScanNsave account.', form));
});

app.post('/api/auth/reset-password', authLimiter, async (request, response, next) => {
	try {
		const token = typeof request.body.token === 'string' ? request.body.token : '';
		const password = validatePassword(request.body.password);
		if (!token) throw httpError(400, 'This reset link is invalid or has expired.');
		const user = await User.findOne({
			passwordResetTokenHash: hashToken(token),
			passwordResetTokenExpiresAt: { $gt: new Date() },
		});
		if (!user) throw httpError(400, 'This reset link is invalid or has expired.');
		user.passwordHash = await hashPassword(password);
		user.passwordResetTokenHash = null;
		user.passwordResetTokenExpiresAt = null;
		await user.save();
		await AuthSession.deleteMany({ userId: user._id });

		if (request.is('application/x-www-form-urlencoded')) {
			return response.type('html').send(emailLinkPage('Password updated', 'Your password has been changed. Return to the app and sign in.'));
		}
		return response.json({ message: 'Your password has been changed. You can now sign in.' });
	} catch (error) {
		if (request.is('application/x-www-form-urlencoded')) {
			if (!error.status) console.error('Password reset form submission failed:', error);
			const message = error.status ? error.message : 'The password reset could not be completed. Please try again.';
			return response.status(error.status || 500).type('html').send(emailLinkPage('Password reset failed', message));
		}
		return next(error);
	}
});

app.get('/api/auth/me', requireAuth, (request, response) => {
	response.json({ user: publicUser(request.authUser) });
});

app.post('/api/auth/logout', requireAuth, async (request, response, next) => {
	try {
		await AuthSession.deleteOne({ _id: request.authSessionId });
		response.status(204).end();
	} catch (error) {
		next(error);
	}
});

app.get('/api/health', (_request, response) => {
	response.json({ ok: true, database: mongoose.connection.readyState === 1 });
});

app.get('/api/prices/:barcode', async (request, response) => {
	const barcode = request.params.barcode.trim();
	if (!barcode || barcode.length > 50) {
		return response.status(400).json({ error: 'A valid product barcode is required.' });
	}

	const params = new URLSearchParams({
		product_code: barcode,
		'location__osm_address_country_code': 'PH',
		currency: 'PHP',
		size: '100',
	});

	let data;
	try {
		const upstream = await fetch(`https://prices.openfoodfacts.org/api/v1/prices?${params}`);
		if (!upstream.ok) {
			console.error(`Open Prices lookup failed with status ${upstream.status}.`);
			return response.status(502).json({ error: 'Open Prices could not complete the lookup.' });
		}
		data = await upstream.json();
	} catch (error) {
		console.error('Open Prices lookup request failed:', error.message);
		return response.status(502).json({ error: 'Open Prices is currently unavailable.' });
	}

	if (!Array.isArray(data.items)) {
		console.error('Open Prices returned an invalid response.');
		return response.status(502).json({ error: 'Open Prices returned an invalid response.' });
	}

	const offers = data.items
		.filter((item) => item.location?.osm_address_country_code === 'PH'
			&& item.currency === 'PHP'
			&& String(item.product_code || '') === barcode)
		.map((item) => ({
			id: String(item.id),
			title: String(item.product?.product_name || item.product_name || `Barcode ${barcode}`),
			store: String(item.location?.osm_brand || item.location?.osm_name || 'Community price report'),
			city: String(item.location?.osm_address_city || ''),
			price: Number(item.price),
			currency: 'PHP',
			date: typeof item.date === 'string' ? item.date : null,
		}))
		.filter((item) => Number.isFinite(item.price) && item.price > 0)
		.sort((first, second) => second.date?.localeCompare(first.date || '') || first.price - second.price);

	response.json({ offers, checkedAt: new Date().toISOString() });
});

app.get('/api/history', requireAuth, async (request, response, next) => {
	try {
		const history = await History.findOne({ owner: String(request.authUser._id) }).lean();
		response.json(history?.items || []);
	} catch (error) {
		next(error);
	}
});

app.get('/api/products/:barcode', async (request, response, next) => {
	try {
		const barcode = request.params.barcode.trim();
		const product = await Product.findOne({ barcode }).lean();
		if (!product) return response.status(404).json({ error: 'Product not found.' });
		response.json(product.product);
	} catch (error) {
		next(error);
	}
});

app.post('/api/products', async (request, response, next) => {
	try {
		const product = request.body;
		if (!product || typeof product !== 'object' || !product.barcode || !product.name) {
			return response.status(400).json({ error: 'A product barcode and name are required.' });
		}

		const saved = await Product.findOneAndUpdate(
			{ barcode: String(product.barcode).trim() },
			{
				barcode: String(product.barcode).trim(),
				name: product.name,
				image: product.image || '',
				product,
			},
			{ new: true, upsert: true, runValidators: true }
		).lean();

		response.status(201).json(saved.product);
	} catch (error) {
		next(error);
	}
});

app.put('/api/history', requireAuth, async (request, response, next) => {
	try {
		if (!Array.isArray(request.body)) {
			return response.status(400).json({ error: 'History must be an array.' });
		}

		const history = await History.findOneAndUpdate(
			{ owner: String(request.authUser._id) },
			{ owner: String(request.authUser._id), items: request.body },
			{ new: true, upsert: true, runValidators: true }
		).lean();

		response.json(history.items);
	} catch (error) {
		next(error);
	}
});

app.delete('/api/history', requireAuth, async (request, response, next) => {
	try {
		await History.findOneAndUpdate(
			{ owner: String(request.authUser._id) },
			{ owner: String(request.authUser._id), items: [] },
			{ upsert: true }
		);
		response.status(204).end();
	} catch (error) {
		next(error);
	}
});

app.use((error, _request, response, _next) => {
	if (error.status) return response.status(error.status).json({ error: error.message });
	console.error(error);
	response.status(500).json({ error: 'The server could not complete the request.' });
});

async function start() {
	const mongoUri = process.env.MONGODB_URI;
	if (!mongoUri) {
		throw new Error('MONGODB_URI is required. Configure it in backend/.env before starting the API.');
	}

	await mongoose.connect(mongoUri, {
		dbName: process.env.DATABASE_NAME || 'ScanNSave',
	});

	app.listen(port, () => {
		console.log(`ScanNsave API listening on http://localhost:${port}`);
	});
}

start().catch((error) => {
	console.error('Unable to start ScanNsave API:', error.message);
	process.exitCode = 1;
});

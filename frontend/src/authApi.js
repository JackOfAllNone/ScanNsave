import { API_URL } from './apiConfig';

async function authRequest(path, body, token, method = 'POST') {
	const response = await fetch(`${API_URL}/auth/${path}`, {
		method,
		headers: {
			'content-type': 'application/json',
			...(token ? { authorization: `Bearer ${token}` } : {}),
		},
		...(body ? { body: JSON.stringify(body) } : {}),
	});

	const result = response.status === 204 ? {} : await response.json();
	if (!response.ok) {
		const error = new Error(result.error || 'The request could not be completed.');
		error.status = response.status;
		throw error;
	}
	return result;
}

export const authApi = {
	register(email, password) {
		return authRequest('register', { email, password });
	},
	login(email, password) {
		return authRequest('login', { email, password });
	},
	resendVerification(email) {
		return authRequest('resend-verification', { email });
	},
	requestPasswordReset(email) {
		return authRequest('forgot-password', { email });
	},
	getCurrentUser(token) {
		return authRequest('me', null, token, 'GET');
	},
	logout(token) {
		return authRequest('logout', null, token);
	},
};

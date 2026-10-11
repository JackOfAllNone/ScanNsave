import React, { useState } from 'react';
import {
	ActivityIndicator,
	KeyboardAvoidingView,
	Platform,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	View,
} from 'react-native';
import { Camera, Mail, ScanLine } from 'lucide-react-native';
import { authApi } from '../authApi';
import { colors } from '../nativeTheme';

export function AuthScreen({ onAuthenticated, startupError, onRetryStartup }) {
	const [mode, setMode] = useState('login');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState('');
	const [message, setMessage] = useState('');
	const [needsVerification, setNeedsVerification] = useState(false);

	const clearNotices = () => {
		setError('');
		setMessage('');
		setNeedsVerification(false);
	};

	const changeMode = (nextMode) => {
		clearNotices();
		setPassword('');
		setMode(nextMode);
	};

	const handleSubmit = async () => {
		clearNotices();
		setBusy(true);
		try {
			const cleanEmail = email.trim().toLowerCase();
			if (mode === 'register') {
				const result = await authApi.register(cleanEmail, password);
				setMessage(result.message);
				setMode('verification-sent');
			} else if (mode === 'login') {
				const result = await authApi.login(cleanEmail, password);
				await onAuthenticated(result);
			} else if (mode === 'forgot') {
				const result = await authApi.requestPasswordReset(cleanEmail);
				setMessage(result.message);
			}
		} catch (requestError) {
			setError(requestError.message);
			setNeedsVerification(requestError.status === 403);
		} finally {
			setBusy(false);
		}
	};

	const handleResendVerification = async () => {
		clearNotices();
		setBusy(true);
		try {
			const result = await authApi.resendVerification(email.trim().toLowerCase());
			setMessage(result.message);
		} catch (requestError) {
			setError(requestError.message);
		} finally {
			setBusy(false);
		}
	};

	const isVerificationMessage = mode === 'verification-sent';
	const isForgot = mode === 'forgot';
	const isRegister = mode === 'register';

	return (
		<KeyboardAvoidingView
			style={styles.safeArea}
			behavior={Platform.OS === 'ios' ? 'padding' : undefined}
		>
			<ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
				<View style={styles.card}>
					<View style={styles.brandMark}>
						<Camera size={22} color={colors.background} strokeWidth={2.5} />
					</View>
					<Text style={styles.brand}>Scan<Text style={styles.brandAccent}>N</Text>Save</Text>
					<Text style={styles.title}>
						{isVerificationMessage ? 'Check your inbox'
							: isForgot ? 'Reset your password'
								: isRegister ? 'Create your account'
									: 'Welcome back'}
					</Text>
					<Text style={styles.subtitle}>
						{isVerificationMessage
							? `We sent a verification link to ${email.trim()}. Open it in your browser, then return here to sign in.`
							: isForgot
								? 'Enter your account email and we will send a secure password reset link.'
								: isRegister
									? 'Verify your email to securely save your product scans.'
									: 'Sign in to start scanning and saving product prices.'}
					</Text>

					{startupError ? (
						<View style={styles.noticeError}>
							<Text style={styles.noticeText}>{startupError}</Text>
							<Pressable onPress={onRetryStartup} disabled={busy}>
								<Text style={styles.inlineAction}>Try again</Text>
							</Pressable>
						</View>
					) : null}

					{isVerificationMessage ? (
						<>
							<View style={styles.noticeSuccess}>
								<Mail size={18} color={colors.green} />
								<Text style={styles.noticeText}>{message}</Text>
							</View>
							<ActionButton label="Resend verification email" busy={busy} onPress={handleResendVerification} />
							<TextButton label="Back to sign in" onPress={() => changeMode('login')} />
						</>
					) : (
						<>
							<TextInput
								style={styles.input}
								value={email}
								onChangeText={setEmail}
								placeholder="Email address"
								placeholderTextColor={colors.muted}
								keyboardType="email-address"
								autoCapitalize="none"
								autoComplete="email"
								textContentType="emailAddress"
								maxLength={254}
								editable={!busy}
							/>
							{!isForgot ? (
								<TextInput
									style={styles.input}
									value={password}
									onChangeText={setPassword}
									placeholder={isRegister ? 'Password (8 characters minimum)' : 'Password'}
									placeholderTextColor={colors.muted}
									secureTextEntry
									autoCapitalize="none"
									autoComplete={isRegister ? 'new-password' : 'current-password'}
									textContentType={isRegister ? 'newPassword' : 'password'}
									maxLength={128}
									editable={!busy}
								/>
							) : null}
							{error ? <Text style={styles.errorText}>{error}</Text> : null}
							{message ? <Text style={styles.successText}>{message}</Text> : null}

							<ActionButton
								label={isForgot ? 'Send reset link' : isRegister ? 'Create account' : 'Sign in'}
								busy={busy}
								onPress={handleSubmit}
							/>
							{needsVerification ? (
								<TextButton label="Resend verification email" onPress={handleResendVerification} disabled={busy} />
							) : null}
							{mode === 'login' ? (
								<>
									<TextButton label="Forgot password?" onPress={() => changeMode('forgot')} disabled={busy} />
									<Text style={styles.switchPrompt}>New to ScanNsave?</Text>
									<TextButton label="Create an account" onPress={() => changeMode('register')} disabled={busy} />
								</>
							) : (
								<TextButton
									label={isForgot ? 'Back to sign in' : 'Already have an account? Sign in'}
									onPress={() => changeMode('login')}
									disabled={busy}
								/>
							)}
						</>
					)}
					<View style={styles.privacyNote}>
						<ScanLine size={16} color={colors.muted} />
						<Text style={styles.privacyText}>Your account is protected with email verification.</Text>
					</View>
				</View>
			</ScrollView>
		</KeyboardAvoidingView>
	);
}

function ActionButton({ label, busy, onPress }) {
	return (
		<Pressable
			style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed, busy && styles.disabledButton]}
			onPress={onPress}
			disabled={busy}
		>
			{busy ? <ActivityIndicator color={colors.background} /> : <Text style={styles.primaryButtonText}>{label}</Text>}
		</Pressable>
	);
}

function TextButton({ label, onPress, disabled = false }) {
	return (
		<Pressable onPress={onPress} disabled={disabled} style={styles.textButton}>
			<Text style={[styles.textButtonLabel, disabled && styles.disabledText]}>{label}</Text>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	safeArea: { flex: 1, backgroundColor: colors.background },
	scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 22 },
	card: { padding: 24, borderWidth: 1, borderColor: colors.border, borderRadius: 22, backgroundColor: colors.surface },
	brandMark: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.green, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
	brand: { color: colors.text, fontSize: 19, fontWeight: '800' },
	brandAccent: { color: colors.green },
	title: { color: colors.text, fontSize: 25, fontWeight: '800', marginTop: 28 },
	subtitle: { color: colors.muted, fontSize: 14, lineHeight: 21, marginTop: 8, marginBottom: 22 },
	input: { minHeight: 52, borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background, paddingHorizontal: 15, color: colors.text, fontSize: 15, marginBottom: 12 },
	primaryButton: { minHeight: 50, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, marginTop: 8, borderRadius: 12, backgroundColor: colors.green },
	buttonPressed: { opacity: 0.82 },
	disabledButton: { opacity: 0.65 },
	primaryButtonText: { color: colors.background, fontSize: 15, fontWeight: '800' },
	textButton: { minHeight: 42, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
	textButtonLabel: { color: colors.green, fontSize: 14, fontWeight: '700', textAlign: 'center' },
	disabledText: { opacity: 0.55 },
	switchPrompt: { color: colors.muted, fontSize: 13, textAlign: 'center', marginTop: 8 },
	errorText: { color: '#FF9B91', fontSize: 13, lineHeight: 19, marginBottom: 4 },
	successText: { color: colors.green, fontSize: 13, lineHeight: 19, marginBottom: 4 },
	noticeError: { padding: 14, marginBottom: 16, borderRadius: 12, backgroundColor: '#3A211F' },
	noticeSuccess: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, marginBottom: 12, borderRadius: 12, backgroundColor: colors.greenDark },
	noticeText: { flex: 1, color: colors.text, fontSize: 13, lineHeight: 19 },
	inlineAction: { color: colors.green, fontSize: 13, fontWeight: '700', marginTop: 8 },
	privacyNote: { flexDirection: 'row', alignItems: 'center', gap: 8, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 16, marginTop: 20 },
	privacyText: { flex: 1, color: colors.muted, fontSize: 11, lineHeight: 16 },
});

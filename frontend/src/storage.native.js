import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const LEGACY_STORAGE_KEY = '@scannsave_history_v1';
const STORAGE_KEY_PREFIX = '@scannsave_history_v1:';
const AUTH_TOKEN_KEY = '@scannsave_auth_token_v1';

function historyStorageKey(userId) {
	if (typeof userId !== 'string' || !userId) throw new TypeError('A signed-in user is required to access scan history.');
	return `${STORAGE_KEY_PREFIX}${userId}`;
}

async function readHistory(userId) {
	const key = historyStorageKey(userId);
	try {
		let saved = await AsyncStorage.getItem(key);
		if (!saved) {
			const legacy = await AsyncStorage.getItem(LEGACY_STORAGE_KEY);
			if (legacy) {
				await AsyncStorage.setItem(key, legacy);
				await AsyncStorage.removeItem(LEGACY_STORAGE_KEY);
				saved = legacy;
			}
		}
		const history = saved ? JSON.parse(saved) : [];
		if (!Array.isArray(history)) throw new Error('Saved scan history is not a list.');
		return history;
	} catch (error) {
		console.error('Phone scan history read failed.', error);
		throw error;
	}
}

export const storage = {
	getHistory: readHistory,
	async getAuthToken() {
		try {
			return await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
		} catch (error) {
			console.error('Saved sign-in read failed.', error);
			throw error;
		}
	},
	async setAuthToken(token) {
		if (typeof token !== 'string' || !token) throw new TypeError('A valid sign-in token is required.');
		try {
			await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
		} catch (error) {
			console.error('Sign-in token save failed.', error);
			throw error;
		}
	},
	async clearAuthToken() {
		try {
			await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
		} catch (error) {
			console.error('Sign-in token clear failed.', error);
			throw error;
		}
	},
	async setHistory(userId, history) {
		if (!Array.isArray(history)) throw new TypeError('Scan history must be a list.');
		try {
			await AsyncStorage.setItem(historyStorageKey(userId), JSON.stringify(history));
		} catch (error) {
			console.error('Phone scan history save failed.', error);
			throw error;
		}
	},
	async clearHistory(userId) {
		try {
			await AsyncStorage.removeItem(historyStorageKey(userId));
		} catch (error) {
			console.error('Phone scan history clear failed.', error);
			throw error;
		}
	},
};
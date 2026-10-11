import Constants from 'expo-constants';

const hostUri = Constants.expoConfig?.hostUri;
const host = hostUri?.split(':')[0];

export const API_URL =
	process.env.EXPO_PUBLIC_API_URL ||
	(host ? `http://${host}:4000/api` : 'http://localhost:4000/api');
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
	Camera,
	Clock3,
	PackageSearch,
	Scale,
} from 'lucide-react-native';
import { ScanScreen } from './src/components/ScanScreen';
import { CompareScreen } from './src/components/CompareScreen';
import { HistoryScreen } from './src/components/HistoryScreen';
import { CatalogScreen } from './src/components/CatalogScreen';
import { AuthScreen } from './src/components/AuthScreen';
import { authApi } from './src/authApi';
import { lookupProductByBarcode, PRODUCTS_DATABASE, saveProductToApi, searchProductPrices } from './src/productsApi';
import { storage } from './src/storage';
import { colors } from './src/nativeTheme';

const tabs = [
	{ id: 'scan', label: 'Scan', Icon: Camera },
	{ id: 'compare', label: 'Compare', Icon: Scale },
	{ id: 'history', label: 'History', Icon: Clock3 },
	{ id: 'catalog', label: 'Catalog', Icon: PackageSearch },
];

export default function App() {
	const [authStatus, setAuthStatus] = useState('loading');
	const [authSession, setAuthSession] = useState(null);
	const [authStartupError, setAuthStartupError] = useState('');
	const [activeTab, setActiveTab] = useState('scan');
	const [currentProduct, setCurrentProduct] = useState(null);
	const [history, setHistory] = useState([]);
	const [toast, setToast] = useState('');
	const [priceSearch, setPriceSearch] = useState({ status: 'idle', offers: [], checkedAt: null, error: '' });
	const priceSearchRequest = useRef(0);

	const restoreAuthSession = async () => {
		setAuthStatus('loading');
		setAuthStartupError('');
		try {
			const token = await storage.getAuthToken();
			if (!token) {
				setAuthSession(null);
				setAuthStatus('signed-out');
				return;
			}
			const result = await authApi.getCurrentUser(token);
			setAuthSession({ token, user: result.user });
			setAuthStatus('signed-in');
		} catch (error) {
			if (error.status === 401) {
				try {
					await storage.clearAuthToken();
				} catch (storageError) {
					console.error('Unable to clear expired sign-in.', storageError);
					setAuthStartupError('Your saved sign-in expired but could not be cleared from this device.');
					setAuthStatus('error');
					return;
				}
				setAuthSession(null);
				setAuthStatus('signed-out');
				return;
			}
			console.error('Unable to restore sign-in.', error);
			setAuthStartupError(error.message);
			setAuthStatus('error');
		}
	};

	useEffect(() => {
		void restoreAuthSession();
	}, []);

	useEffect(() => {
		if (authStatus !== 'signed-in' || !authSession) {
			setHistory([]);
			return undefined;
		}
		let mounted = true;
		storage.getHistory(authSession.user.id).then((saved) => {
			if (mounted) setHistory(saved);
		}).catch((error) => {
			console.error('Unable to load phone scan history.', error);
			if (mounted) setToast('Unable to load saved scans');
		});
		return () => { mounted = false; };
	}, [authStatus, authSession?.user.id]);

	useEffect(() => {
		if (!toast) return undefined;
		const timer = setTimeout(() => setToast(''), 2600);
		return () => clearTimeout(timer);
	}, [toast]);

	const handleAuthenticated = async (session) => {
		try {
			await storage.setAuthToken(session.token);
		} catch (error) {
			try {
				await authApi.logout(session.token);
			} catch (revokeError) {
				console.error('Unable to revoke a session after local token storage failed.', revokeError);
			}
			throw error;
		}
		setAuthSession(session);
		setAuthStartupError('');
		setAuthStatus('signed-in');
	};

	const handleSignOut = async () => {
		let revokeFailed = false;
		try {
			await authApi.logout(authSession.token);
		} catch (error) {
			if (error.status !== 401) {
				console.error('Unable to revoke sign-in session.', error);
				revokeFailed = true;
			}
		} finally {
			try {
				await storage.clearAuthToken();
			} catch (error) {
				console.error('Unable to clear sign-in from this device.', error);
				setAuthStartupError('Could not clear sign-in from this device. Please try again.');
				setAuthStatus('error');
				return;
			}
			setAuthSession(null);
			setAuthStatus('signed-out');
			if (revokeFailed) {
				Alert.alert(
					'Signed out on this device',
					'The server could not revoke this session. It will expire automatically after 30 days.'
				);
			}
		}
	};

	if (authStatus === 'loading') {
		return (
			<SafeAreaView style={styles.loadingArea}>
				<StatusBar barStyle="light-content" backgroundColor={colors.background} />
				<ActivityIndicator size="large" color={colors.green} />
			</SafeAreaView>
		);
	}

	if (authStatus !== 'signed-in') {
		return (
			<SafeAreaView style={styles.loadingArea}>
				<StatusBar barStyle="light-content" backgroundColor={colors.background} />
				<AuthScreen
					onAuthenticated={handleAuthenticated}
					startupError={authStartupError}
					onRetryStartup={restoreAuthSession}
				/>
			</SafeAreaView>
		);
	}

	const addHistoryItem = async (product) => {
		const savedProduct = Object.fromEntries(
			Object.entries(product).filter(([key]) => key !== 'usage' && key !== 'alternatives')
		);
		const entry = {
			id: `scan-${Date.now()}`,
			timestamp: Date.now(),
			product: savedProduct,
			price: Number(product.price),
		};
		const updated = [entry, ...history.filter((item) => item.product.barcode !== product.barcode)];
		setHistory(updated);
		await storage.setHistory(authSession.user.id, updated);
	};

	const loadPriceOffers = async (product) => {
		const requestId = ++priceSearchRequest.current;
		setPriceSearch({ status: 'loading', offers: [], checkedAt: null, error: '' });
		try {
			const result = await searchProductPrices(product);
			if (requestId === priceSearchRequest.current) {
				setPriceSearch({ status: 'success', offers: result.offers, checkedAt: result.checkedAt, error: '' });
			}
		} catch (error) {
			console.warn('Price search error', error);
			if (requestId === priceSearchRequest.current) {
				setPriceSearch({ status: 'error', offers: [], checkedAt: null, error: error.message });
			}
		}
	};

	const handleBarcodeScanned = async (barcode) => {
		const cleanBarcode = String(barcode || '').trim();
		if (!cleanBarcode) return;

		let product = await lookupProductByBarcode(cleanBarcode);
		if (!product) {
			product = {
				barcode: cleanBarcode,
				name: `Product #${cleanBarcode.slice(-6)}`,
				brand: 'Retail Item',
				category: 'General Goods',
				description: 'Retail product scanned by barcode.',
				price: 9.99,
				unitPrice: '$9.99 each',
				store: 'Local Retailer',
				size: '1 unit',
				rating: 0,
				reviewsCount: 0,
				image: '',
				keySpecs: ['Retail barcode'],
			};
			await saveProductToApi(product);
		}

		setCurrentProduct(product);
		void loadPriceOffers(product);
		await addHistoryItem(product);
		setActiveTab('compare');
		setToast(`Scanned ${product.name}`);
	};

	const handleClearHistory = async () => {
		setHistory([]);
		await storage.clearHistory(authSession.user.id);
		setToast('Scan history cleared');
	};

	const handleDeleteHistoryItem = async (id) => {
		const updated = history.filter((item) => item.id !== id);
		setHistory(updated);
		await storage.setHistory(authSession.user.id, updated);
	};

	return (
		<SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
			<StatusBar barStyle="light-content" backgroundColor={colors.background} />
			<View style={styles.header}>
				<View style={styles.brandMark}><Camera size={19} color={colors.background} strokeWidth={2.6} /></View>
				<View style={styles.brandCopy}>
					<Text style={styles.brand}>Scan<Text style={styles.brandAccent}>N</Text>Save</Text>
					<Text style={styles.tagline}>Scan products. Save their prices.</Text>
				</View>
				<View style={styles.headerActions}>
					<Text style={styles.savedCount}>{history.length} saved</Text>
					<Pressable onPress={handleSignOut} accessibilityRole="button">
						<Text style={styles.signOut}>Sign out</Text>
					</Pressable>
				</View>
			</View>

			<View style={styles.content}>
				{activeTab === 'scan' && <ScanScreen onProductScanned={handleBarcodeScanned} />}
				{activeTab === 'compare' && (
					<CompareScreen
						product={currentProduct}
						priceSearch={priceSearch}
						onScanNext={() => setActiveTab('scan')}
					/>
				)}
				{activeTab === 'history' && (
					<HistoryScreen
						history={history}
						onSelectItem={(item) => {
							setCurrentProduct(item.product);
							void loadPriceOffers(item.product);
							setActiveTab('compare');
						}}
						onClearHistory={handleClearHistory}
						onDeleteItem={handleDeleteHistoryItem}
						onStartScanning={() => setActiveTab('scan')}
					/>
				)}
				{activeTab === 'catalog' && <CatalogScreen onSelectBarcode={handleBarcodeScanned} />}
			</View>

			{toast ? <View pointerEvents="none" style={styles.toast}><Text style={styles.toastText}>{toast}</Text></View> : null}

			<View style={styles.tabBar}>
				{tabs.map(({ id, label, Icon }) => {
					const active = activeTab === id;
					return (
						<Pressable
							key={id}
							onPress={() => setActiveTab(id)}
							accessibilityRole="tab"
							accessibilityState={{ selected: active }}
							style={styles.tab}
						>
							<Icon size={20} color={active ? colors.green : colors.muted} strokeWidth={active ? 2.4 : 1.8} />
							<Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text>
							{id === 'history' && history.length > 0 ? <View style={styles.tabDot} /> : null}
						</Pressable>
					);
				})}
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: { flex: 1, backgroundColor: colors.background },
	loadingArea: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
	header: { minHeight: 66, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, gap: 11, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.surface },
	brandMark: { width: 36, height: 36, borderRadius: 11, backgroundColor: colors.green, alignItems: 'center', justifyContent: 'center' },
	brandCopy: { flex: 1 },
	brand: { color: colors.text, fontSize: 18, fontWeight: '800' },
	brandAccent: { color: colors.green, fontSize: 18, fontWeight: '800' },
	tagline: { color: colors.muted, fontSize: 10, marginTop: 2 },
	savedCount: { color: colors.muted, fontSize: 11, fontWeight: '600' },
	headerActions: { alignItems: 'flex-end', gap: 5 },
	signOut: { color: colors.green, fontSize: 11, fontWeight: '700' },
	content: { flex: 1 },
	tabBar: { flexDirection: 'row', backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 8, paddingBottom: 5 },
	tab: { flex: 1, minHeight: 48, alignItems: 'center', justifyContent: 'center', gap: 3, position: 'relative' },
	tabLabel: { color: colors.muted, fontSize: 10, fontWeight: '600' },
	tabLabelActive: { color: colors.green },
	tabDot: { position: 'absolute', top: 3, right: '27%', width: 6, height: 6, borderRadius: 3, backgroundColor: colors.amber },
	toast: { position: 'absolute', top: 76, left: 18, right: 18, zIndex: 20, borderRadius: 12, padding: 12, backgroundColor: colors.green },
	toastText: { color: colors.background, fontSize: 13, fontWeight: '700', textAlign: 'center' },
});
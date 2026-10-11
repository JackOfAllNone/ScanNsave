import React, { useState } from 'react';
import {
	ActivityIndicator,
	Image,
	Modal,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	View,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { Camera, Flashlight, Keyboard, RefreshCw, ScanLine } from 'lucide-react-native';
import { PRODUCTS_DATABASE } from '../productsApi';
import { colors } from '../nativeTheme';

const barcodeTypes = [
	'upc_a', 'upc_e', 'ean13', 'ean8', 'code128', 'code39', 'code93', 'itf14', 'qr', 'datamatrix',
];

export function ScanScreen({ onProductScanned }) {
	const [permission, requestPermission] = useCameraPermissions();
	const [facing, setFacing] = useState('back');
	const [torchOn, setTorchOn] = useState(false);
	const [scanned, setScanned] = useState(false);
	const [manualOpen, setManualOpen] = useState(false);
	const [manualCode, setManualCode] = useState('');

	const handleScan = ({ data }) => {
		if (scanned || !data) return;
		setScanned(true);
		Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
		onProductScanned(data);
	};

	const submitManualCode = () => {
		const code = manualCode.trim();
		if (!code) return;
		setManualOpen(false);
		setManualCode('');
		onProductScanned(code);
	};

	return (
		<ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
			<View style={styles.titleRow}>
				<View>
					<Text style={styles.eyebrow}>PRODUCT LOOKUP</Text>
					<Text style={styles.title}>Scan a barcode</Text>
				</View>
				<Pressable onPress={() => setManualOpen(true)} style={styles.outlineButton} accessibilityRole="button">
					<Keyboard size={16} color={colors.green} />
					<Text style={styles.outlineButtonText}>Enter code</Text>
				</Pressable>
			</View>

			<View style={styles.cameraFrame}>
				{permission?.granted ? (
					<>
						<CameraView
							style={StyleSheet.absoluteFill}
							facing={facing}
							enableTorch={torchOn}
							barcodeScannerSettings={{ barcodeTypes }}
							onBarcodeScanned={scanned ? undefined : handleScan}
						/>
						<View pointerEvents="none" style={styles.viewfinder}>
							<View style={styles.scanCorners} />
							<Text style={styles.viewfinderLabel}>Align barcode inside frame</Text>
						</View>
						<View style={styles.cameraControls}>
							<Pressable style={styles.cameraButton} onPress={() => setTorchOn((value) => !value)} accessibilityLabel="Toggle flashlight">
								<Flashlight size={18} color={torchOn ? colors.amber : colors.text} />
								<Text style={styles.cameraButtonText}>{torchOn ? 'Flash on' : 'Flash'}</Text>
							</Pressable>
							<Pressable style={styles.cameraButton} onPress={() => setFacing((value) => value === 'back' ? 'front' : 'back')} accessibilityLabel="Switch camera">
								<RefreshCw size={17} color={colors.text} />
								<Text style={styles.cameraButtonText}>Flip</Text>
							</Pressable>
						</View>
					</>
				) : (
					<View style={styles.permissionPanel}>
						<View style={styles.cameraIcon}><Camera size={23} color={colors.green} /></View>
						<Text style={styles.permissionTitle}>Camera access</Text>
						<Text style={styles.permissionCopy}>
							{permission?.canAskAgain === false
								? 'Enable camera access in your device settings to scan products.'
								: 'Allow camera access to scan product barcodes.'}
						</Text>
						<Pressable onPress={requestPermission} style={styles.primaryButton}>
							<Text style={styles.primaryButtonText}>{permission ? 'Allow camera' : 'Checking camera...'}</Text>
						</Pressable>
						{!permission ? <ActivityIndicator color={colors.green} style={styles.spinner} /> : null}
					</View>
				)}
			</View>

			<View style={styles.sectionHeading}>
				<View style={styles.headingIcon}><ScanLine size={16} color={colors.green} /></View>
				<View style={{ flex: 1 }}>
					<Text style={styles.sectionTitle}>Try a product</Text>
					<Text style={styles.sectionSubtitle}>Tap an item to view its saved price</Text>
				</View>
			</View>

			{PRODUCTS_DATABASE.slice(0, 6).map((item) => (
				<Pressable key={item.barcode} onPress={() => onProductScanned(item.barcode)} style={styles.productRow}>
					<Image source={{ uri: item.image }} style={styles.productImage} />
					<View style={styles.productInfo}>
						<Text numberOfLines={1} style={styles.productName}>{item.name}</Text>
						<Text numberOfLines={1} style={styles.productMeta}>{item.brand} · {item.store} · {item.size}</Text>
						<Text style={styles.barcode}>{item.barcode}</Text>
					</View>
					<View style={styles.priceColumn}>
						<Text style={styles.price}>${item.price.toFixed(2)}</Text>
						<Text style={styles.savings}>View price</Text>
					</View>
				</Pressable>
			))}

			<Modal transparent animationType="fade" visible={manualOpen} onRequestClose={() => setManualOpen(false)}>
				<View style={styles.modalBackdrop}>
					<View style={styles.modalCard}>
						<Text style={styles.modalTitle}>Enter barcode</Text>
						<Text style={styles.modalCopy}>Type the UPC or EAN printed below the barcode.</Text>
						<TextInput
							value={manualCode}
							onChangeText={setManualCode}
							placeholder="e.g. 037000140228"
							placeholderTextColor={colors.muted}
							keyboardType="number-pad"
							returnKeyType="search"
							onSubmitEditing={submitManualCode}
							style={styles.input}
							autoFocus
						/>
						<View style={styles.modalActions}>
							<Pressable onPress={() => setManualOpen(false)} style={styles.cancelButton}><Text style={styles.cancelText}>Cancel</Text></Pressable>
							<Pressable onPress={submitManualCode} style={[styles.primaryButton, !manualCode.trim() && styles.disabledButton]} disabled={!manualCode.trim()}>
								<Text style={styles.primaryButtonText}>Look up</Text>
							</Pressable>
						</View>
					</View>
				</View>
			</Modal>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	screen: { flex: 1, backgroundColor: colors.background },
	content: { padding: 16, paddingBottom: 28, gap: 12 },
	titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 },
	eyebrow: { color: colors.green, fontSize: 10, fontWeight: '800', letterSpacing: 1.2 },
	title: { color: colors.text, fontSize: 13, fontWeight: '800', marginTop: 3 },
	outlineButton: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 11, paddingVertical: 9, borderColor: colors.border, borderWidth: 1, borderRadius: 10, backgroundColor: colors.surface },
	outlineButtonText: { color: colors.text, fontSize: 12, fontWeight: '700' },
	cameraFrame: { height: 300, overflow: 'hidden', borderRadius: 17, backgroundColor: '#050807', borderWidth: 1, borderColor: colors.border },
	viewfinder: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.14)' },
	scanCorners: { width: 230, height: 142, borderColor: colors.green, borderWidth: 2, borderRadius: 15, backgroundColor: 'rgba(5,18,13,0.12)' },
	viewfinderLabel: { color: colors.text, backgroundColor: 'rgba(8,17,15,0.86)', overflow: 'hidden', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7, fontSize: 11, marginTop: 15 },
	cameraControls: { position: 'absolute', left: 12, right: 12, bottom: 12, flexDirection: 'row', justifyContent: 'space-between' },
	cameraButton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 11, paddingVertical: 9, borderRadius: 10, backgroundColor: 'rgba(8,17,15,0.88)' },
	cameraButtonText: { color: colors.text, fontSize: 11, fontWeight: '700' },
	permissionPanel: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
	cameraIcon: { width: 46, height: 46, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: colors.greenDark, marginBottom: 11 },
	permissionTitle: { color: colors.text, fontSize: 17, fontWeight: '800' },
	permissionCopy: { color: colors.muted, fontSize: 12, lineHeight: 18, textAlign: 'center', maxWidth: 270, marginTop: 6, marginBottom: 14 },
	primaryButton: { minHeight: 40, paddingHorizontal: 15, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: colors.green },
	primaryButtonText: { color: colors.background, fontSize: 12, fontWeight: '800' },
	spinner: { marginTop: 12 },
	sectionHeading: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 7 },
	headingIcon: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: colors.greenDark },
	sectionTitle: { color: colors.text, fontSize: 14, fontWeight: '800' },
	sectionSubtitle: { color: colors.muted, fontSize: 11, marginTop: 2 },
	productRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderWidth: 1, borderColor: colors.border, borderRadius: 13, backgroundColor: colors.surface },
	productImage: { width: 48, height: 48, borderRadius: 9, backgroundColor: colors.surfaceRaised },
	productInfo: { flex: 1, minWidth: 0 },
	productName: { color: colors.text, fontSize: 12, fontWeight: '700' },
	productMeta: { color: colors.muted, fontSize: 10, marginTop: 4 },
	barcode: { color: colors.muted, fontSize: 9, marginTop: 3, fontVariant: ['tabular-nums'] },
	priceColumn: { alignItems: 'flex-end' },
	price: { color: colors.text, fontSize: 14, fontWeight: '800' },
	savings: { color: colors.green, fontSize: 9, fontWeight: '700', marginTop: 4 },
	modalBackdrop: { flex: 1, justifyContent: 'center', padding: 22, backgroundColor: 'rgba(0,0,0,0.72)' },
	modalCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 18, padding: 18 },
	modalTitle: { color: colors.text, fontSize: 18, fontWeight: '800' },
	modalCopy: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 6, marginBottom: 15 },
	input: { height: 46, borderRadius: 10, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12, color: colors.text, backgroundColor: colors.background, fontSize: 15, fontVariant: ['tabular-nums'] },
	modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 16 },
	cancelButton: { minHeight: 40, justifyContent: 'center', paddingHorizontal: 13 },
	cancelText: { color: colors.muted, fontSize: 12, fontWeight: '700' },
	disabledButton: { opacity: 0.45 },
});
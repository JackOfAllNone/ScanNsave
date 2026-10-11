import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ScanLine, Store, Tag } from 'lucide-react-native';
import { colors } from '../nativeTheme';

export function CompareScreen({ product, priceSearch, onScanNext }) {
	if (!product) {
		return (
			<View style={styles.empty}>
				<View style={styles.emptyIcon}><ScanLine size={27} color={colors.green} /></View>
				<Text style={styles.emptyTitle}>No scanned product</Text>
				<Text style={styles.emptyCopy}>Scan a barcode to view and save the product and its price.</Text>
				<Pressable onPress={onScanNext} style={styles.primaryButton}><ScanLine size={16} color={colors.background} /><Text style={styles.primaryText}>Start scanning</Text></Pressable>
			</View>
		);
	}

	return (
		<ScrollView style={styles.screen} contentContainerStyle={styles.content}>
			<View style={styles.header}>
				<View style={styles.headerCopy}>
					<Text style={styles.title}>Scanned product</Text>
					<Text style={styles.subtitle}>Product and price are saved on this phone.</Text>
				</View>
				<Pressable onPress={onScanNext} style={styles.nextButton}><ScanLine size={15} color={colors.background} /><Text style={styles.nextText}>Scan</Text></Pressable>
			</View>

			<View style={styles.productCard}>
				<View style={styles.productRow}>
					{product.image ? <Image source={{ uri: product.image }} style={styles.productImage} /> : <View style={styles.imagePlaceholder}><Tag size={21} color={colors.muted} /></View>}
					<View style={styles.productInfo}>
						<View style={styles.storeLine}><Store size={13} color={colors.muted} /><Text style={styles.storeName}>{product.store || 'Store not specified'}</Text></View>
						<Text style={styles.productName}>{product.name}</Text>
						<Text style={styles.brand}>{product.brand}</Text>
					</View>
				</View>
				<View style={styles.pricePanel}>
					<Text style={styles.priceLabel}>SAVED PRICE</Text>
					<Text style={styles.price}>{Number(product.price).toFixed(2)}</Text>
					<Text style={styles.unitPrice}>{product.unitPrice || product.size || ''}</Text>
				</View>
				<Text style={styles.barcode}>Barcode: {product.barcode}</Text>
			</View>

			<View style={styles.sectionHeader}>
				<View style={styles.headerCopy}>
					<Text style={styles.sectionTitle}>Reported prices</Text>
					<Text style={styles.sectionSubtitle}>Open Prices community reports · may be outdated</Text>
				</View>
				<Store size={18} color={colors.green} />
			</View>
			{priceSearch?.status === 'loading' ? <Text style={styles.message}>Looking up reported prices…</Text> : null}
			{priceSearch?.status === 'error' ? <Text style={styles.error}>{priceSearch.error}</Text> : null}
			{priceSearch?.status === 'success' && priceSearch.offers.length === 0
				? <Text style={styles.message}>No Philippine price reports were found for this barcode.</Text>
				: null}
			{(priceSearch?.offers || []).map((offer) => (
				<View key={offer.id} style={styles.offer}>
					<View style={styles.offerCopy}>
						<Text style={styles.offerName} numberOfLines={2}>{offer.title}</Text>
						<Text style={styles.offerStore}>{[offer.store, offer.city].filter(Boolean).join(' · ')}</Text>
						<Text style={styles.offerDate}>{offer.date ? `Reported ${offer.date}` : 'Report date unavailable'}</Text>
					</View>
					<Text style={styles.offerPrice}>₱{offer.price.toFixed(2)}</Text>
				</View>
			))}
			{priceSearch?.checkedAt
				? <Text style={styles.checkedAt}>Data checked {new Date(priceSearch.checkedAt).toLocaleString()}</Text>
				: null}
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	screen: { flex: 1, backgroundColor: colors.background },
	content: { padding: 15, paddingBottom: 28, gap: 12 },
	header: { flexDirection: 'row', alignItems: 'center', gap: 10 },
	headerCopy: { flex: 1 },
	title: { color: colors.text, fontSize: 17, fontWeight: '800' },
	subtitle: { color: colors.muted, fontSize: 10, marginTop: 3 },
	nextButton: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 9, backgroundColor: colors.green },
	nextText: { color: colors.background, fontSize: 11, fontWeight: '800' },
	productCard: { padding: 13, borderWidth: 1, borderColor: colors.border, borderRadius: 15, backgroundColor: colors.surface },
	productRow: { flexDirection: 'row', gap: 11 },
	productImage: { width: 74, height: 74, borderRadius: 11, backgroundColor: colors.surfaceRaised },
	imagePlaceholder: { width: 74, height: 74, borderRadius: 11, backgroundColor: colors.surfaceRaised, alignItems: 'center', justifyContent: 'center' },
	productInfo: { flex: 1, justifyContent: 'center' },
	storeLine: { flexDirection: 'row', alignItems: 'center', gap: 5 },
	storeName: { color: colors.muted, fontSize: 10 },
	productName: { color: colors.text, fontSize: 13, lineHeight: 18, fontWeight: '700', marginTop: 4 },
	brand: { color: colors.muted, fontSize: 10, marginTop: 3 },
	pricePanel: { marginTop: 13, padding: 12, borderRadius: 10, backgroundColor: colors.background },
	priceLabel: { color: colors.muted, fontSize: 9, fontWeight: '800', letterSpacing: 1 },
	price: { color: colors.green, fontSize: 24, fontWeight: '900', marginTop: 3 },
	unitPrice: { color: colors.muted, fontSize: 10, marginTop: 2 },
	barcode: { color: colors.muted, fontSize: 10, marginTop: 11, fontVariant: ['tabular-nums'] },
	sectionHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 2, paddingTop: 4 },
	sectionTitle: { color: colors.text, fontSize: 15, fontWeight: '800' },
	sectionSubtitle: { color: colors.muted, fontSize: 10, marginTop: 3 },
	message: { color: colors.muted, padding: 13, textAlign: 'center', fontSize: 11, backgroundColor: colors.surface, borderRadius: 12 },
	error: { color: colors.amber, padding: 13, fontSize: 11, lineHeight: 16, backgroundColor: colors.surface, borderRadius: 12 },
	offer: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderWidth: 1, borderColor: colors.border, borderRadius: 12, backgroundColor: colors.surface },
	offerCopy: { flex: 1 },
	offerName: { color: colors.text, fontSize: 11, lineHeight: 16, fontWeight: '700' },
	offerStore: { color: colors.muted, fontSize: 10, marginTop: 4 },
	offerDate: { color: colors.muted, fontSize: 9, marginTop: 3 },
	offerPrice: { color: colors.green, fontSize: 14, fontWeight: '900' },
	checkedAt: { color: colors.muted, fontSize: 9, textAlign: 'right', marginTop: -7 },
	empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28, backgroundColor: colors.background },
	emptyIcon: { width: 58, height: 58, alignItems: 'center', justifyContent: 'center', borderRadius: 17, backgroundColor: colors.surfaceRaised, marginBottom: 14 },
	emptyTitle: { color: colors.text, fontSize: 18, fontWeight: '800' },
	emptyCopy: { color: colors.muted, fontSize: 12, lineHeight: 18, textAlign: 'center', maxWidth: 300, marginTop: 7, marginBottom: 17 },
	primaryButton: { minHeight: 41, flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 14, borderRadius: 10, backgroundColor: colors.green },
	primaryText: { color: colors.background, fontSize: 12, fontWeight: '800' },
});

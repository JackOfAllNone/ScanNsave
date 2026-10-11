import React, { useMemo, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Clock3, Search, Trash2 } from 'lucide-react-native';
import { colors } from '../nativeTheme';

export function HistoryScreen({ history, onSelectItem, onClearHistory, onDeleteItem, onStartScanning }) {
	const [query, setQuery] = useState('');
	const filtered = useMemo(() => {
		const search = query.trim().toLowerCase();
		if (!search) return history;
		return history.filter(({ product }) => [product.name, product.brand, product.barcode]
			.some((value) => String(value || '').toLowerCase().includes(search)));
	}, [history, query]);

	const confirmClear = () => Alert.alert(
		'Clear scan history?',
		'This removes all scanned products and prices saved on this phone.',
		[
			{ text: 'Cancel', style: 'cancel' },
			{ text: 'Clear history', onPress: onClearHistory },
		],
	);

	return (
		<View style={styles.screen}>
			<View style={styles.summary}>
				<View>
					<Text style={styles.eyebrow}>PHONE STORAGE</Text>
					<Text style={styles.total}>{history.length} saved scans</Text>
					<Text style={styles.summaryCopy}>Product details and scanned prices are stored on this phone.</Text>
				</View>
			</View>

			<View style={styles.searchRow}>
				<View style={styles.searchBox}><Search size={16} color={colors.muted} /><TextInput value={query} onChangeText={setQuery} placeholder="Search name, brand, barcode" placeholderTextColor={colors.muted} style={styles.searchInput} /></View>
				{history.length > 0 ? <Pressable onPress={confirmClear} style={styles.clearButton} accessibilityLabel="Clear all history"><Trash2 size={17} color={colors.amber} /></Pressable> : null}
			</View>

			<ScrollView contentContainerStyle={styles.list}>
				{filtered.length === 0 ? (
					<View style={styles.empty}>
						<View style={styles.emptyIcon}><Clock3 size={25} color={colors.muted} /></View>
						<Text style={styles.emptyTitle}>{history.length === 0 ? 'No scans saved yet' : 'No matching scans'}</Text>
						<Text style={styles.emptyCopy}>{history.length === 0 ? 'Scan an item to save its product details and price on this phone.' : 'Try another name, brand, or barcode.'}</Text>
						{history.length === 0 ? <Pressable onPress={onStartScanning} style={styles.scanButton}><Text style={styles.scanButtonText}>Scan a product</Text></Pressable> : null}
					</View>
				) : filtered.map((item) => {
					const price = Number(item.price ?? item.product.price);
					return (
						<View key={item.id} style={styles.card}>
							<Pressable style={styles.itemTop} onPress={() => onSelectItem(item)}>
								{item.product.image ? <Image source={{ uri: item.product.image }} style={styles.image} /> : <View style={styles.imagePlaceholder}><Clock3 size={18} color={colors.muted} /></View>}
								<View style={styles.productInfo}>
									<View style={styles.nameRow}><Text numberOfLines={2} style={styles.name}>{item.product.name}</Text><Text style={styles.price}>{Number.isFinite(price) ? price.toFixed(2) : '—'}</Text></View>
									<Text style={styles.meta}>{item.product.brand} · Barcode {item.product.barcode}</Text>
									<Text style={styles.meta}>{item.product.store || 'Store not specified'} · {new Date(item.timestamp).toLocaleDateString()}</Text>
								</View>
							</Pressable>
							<View style={styles.cardFooter}>
								<Pressable onPress={() => onSelectItem(item)} style={styles.viewButton}><Text style={styles.viewText}>View saved scan</Text></Pressable>
								<Pressable onPress={() => onDeleteItem(item.id)} style={styles.deleteButton} accessibilityLabel="Delete scan"><Trash2 size={16} color={colors.amber} /></Pressable>
							</View>
						</View>
					);
				})}
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	screen: { flex: 1, backgroundColor: colors.background },
	summary: { paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.surface },
	eyebrow: { color: colors.green, fontSize: 9, fontWeight: '800', letterSpacing: 1 },
	total: { color: colors.text, fontSize: 22, fontWeight: '900', marginTop: 5 },
	summaryCopy: { color: colors.muted, fontSize: 11, marginTop: 3 },
	searchRow: { flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
	searchBox: { flex: 1, height: 40, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 10, borderWidth: 1, borderColor: colors.border, borderRadius: 10, backgroundColor: colors.surface },
	searchInput: { flex: 1, color: colors.text, paddingVertical: 0, fontSize: 12 },
	clearButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: '#332A1D' },
	list: { padding: 14, paddingBottom: 28, gap: 10, flexGrow: 1 },
	card: { padding: 11, borderWidth: 1, borderColor: colors.border, borderRadius: 13, backgroundColor: colors.surface },
	itemTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
	image: { width: 52, height: 52, borderRadius: 9, backgroundColor: colors.surfaceRaised },
	imagePlaceholder: { width: 52, height: 52, alignItems: 'center', justifyContent: 'center', borderRadius: 9, backgroundColor: colors.surfaceRaised },
	productInfo: { flex: 1, minWidth: 0 },
	nameRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6 },
	name: { color: colors.text, flex: 1, fontSize: 11, fontWeight: '700' },
	price: { color: colors.green, fontSize: 12, fontWeight: '800' },
	meta: { color: colors.muted, fontSize: 9, marginTop: 4 },
	cardFooter: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 7, borderTopWidth: 1, borderTopColor: colors.border, marginTop: 10, paddingTop: 9 },
	viewButton: { paddingHorizontal: 10, paddingVertical: 7, borderRadius: 8, backgroundColor: colors.surfaceRaised },
	viewText: { color: colors.text, fontSize: 10, fontWeight: '700' },
	deleteButton: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: '#332A1D' },
	empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, paddingVertical: 40 },
	emptyIcon: { width: 54, height: 54, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface, marginBottom: 12 },
	emptyTitle: { color: colors.text, fontSize: 16, fontWeight: '800' },
	emptyCopy: { color: colors.muted, fontSize: 11, lineHeight: 17, textAlign: 'center', marginTop: 6, marginBottom: 14 },
	scanButton: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 9, backgroundColor: colors.green },
	scanButtonText: { color: colors.background, fontSize: 11, fontWeight: '800' },
});

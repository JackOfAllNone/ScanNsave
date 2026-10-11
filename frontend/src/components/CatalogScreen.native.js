import React, { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Search, ScanLine } from 'lucide-react-native';
import { PRODUCTS_DATABASE } from '../productsApi';
import { colors } from '../nativeTheme';

export function CatalogScreen({ onSelectBarcode }) {
	const [query, setQuery] = useState('');
	const [selectedCategory, setSelectedCategory] = useState('All');
	const categories = useMemo(() => ['All', ...new Set(PRODUCTS_DATABASE.map((item) => item.category))], []);
	const filtered = PRODUCTS_DATABASE.filter((item) => {
		const search = query.trim().toLowerCase();
		const matchesQuery = !search || [item.name, item.brand, item.barcode].some((value) => value.toLowerCase().includes(search));
		return matchesQuery && (selectedCategory === 'All' || item.category === selectedCategory);
	});

	return (
		<View style={styles.screen}>
			<View style={styles.header}>
				<Text style={styles.eyebrow}>PRODUCTS</Text>
				<Text style={styles.title}>Browse catalog</Text>
				<View style={styles.searchBox}>
					<Search size={17} color={colors.muted} />
					<TextInput value={query} onChangeText={setQuery} placeholder="Search name, brand, barcode" placeholderTextColor={colors.muted} style={styles.searchInput} />
				</View>
				<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categories}>
					{categories.map((category) => {
						const active = selectedCategory === category;
						return <Pressable key={category} onPress={() => setSelectedCategory(category)} style={[styles.category, active && styles.categoryActive]}><Text style={[styles.categoryText, active && styles.categoryTextActive]}>{category}</Text></Pressable>;
					})}
				</ScrollView>
			</View>
			<ScrollView contentContainerStyle={styles.list}>
				{filtered.map((item) => {
					return (
						<View key={item.barcode} style={styles.card}>
							<View style={styles.productRow}>
								<Image source={{ uri: item.image }} style={styles.image} />
								<View style={styles.productInfo}>
									<Text style={styles.categoryLabel}>{item.category}</Text>
									<Text style={styles.name} numberOfLines={2}>{item.name}</Text>
									<Text style={styles.meta}>{item.brand} · {item.store}</Text>
								</View>
								<View style={styles.priceBlock}><Text style={styles.price}>${item.price.toFixed(2)}</Text><Text style={styles.unit}>{item.unitPrice}</Text></View>
							</View>
							<View style={styles.cardFooter}>
								<Pressable onPress={() => onSelectBarcode(item.barcode)} style={styles.compareButton}><ScanLine size={15} color={colors.background} /><Text style={styles.compareText}>View price</Text></Pressable>
							</View>
						</View>
					);
				})}
				{filtered.length === 0 ? <Text style={styles.empty}>No products match that search.</Text> : null}
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	screen: { flex: 1, backgroundColor: colors.background },
	header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.surface },
	eyebrow: { color: colors.green, fontSize: 10, fontWeight: '800', letterSpacing: 1.2 },
	title: { color: colors.text, fontSize: 22, fontWeight: '800', marginTop: 3, marginBottom: 12 },
	searchBox: { height: 42, flexDirection: 'row', alignItems: 'center', gap: 9, borderWidth: 1, borderColor: colors.border, borderRadius: 11, paddingHorizontal: 11, backgroundColor: colors.background },
	searchInput: { flex: 1, color: colors.text, fontSize: 13, paddingVertical: 0 },
	categories: { gap: 7, paddingTop: 11, paddingBottom: 1 },
	category: { paddingHorizontal: 11, paddingVertical: 7, borderRadius: 9, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border },
	categoryActive: { backgroundColor: colors.greenDark, borderColor: colors.green },
	categoryText: { color: colors.muted, fontSize: 11, fontWeight: '600' },
	categoryTextActive: { color: colors.green, fontWeight: '800' },
	list: { padding: 14, paddingBottom: 28, gap: 11 },
	card: { padding: 12, borderWidth: 1, borderColor: colors.border, borderRadius: 14, backgroundColor: colors.surface },
	productRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
	image: { width: 52, height: 52, borderRadius: 10, backgroundColor: colors.surfaceRaised },
	productInfo: { flex: 1, minWidth: 0 },
	categoryLabel: { color: colors.sky, fontSize: 9, fontWeight: '800', textTransform: 'uppercase' },
	name: { color: colors.text, fontSize: 12, fontWeight: '700', marginTop: 3 },
	meta: { color: colors.muted, fontSize: 10, marginTop: 4 },
	priceBlock: { alignItems: 'flex-end' },
	price: { color: colors.text, fontSize: 14, fontWeight: '800' },
	unit: { color: colors.muted, fontSize: 9, marginTop: 3 },
	cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 11 },
	compareButton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 9, backgroundColor: colors.green },
	compareText: { color: colors.background, fontSize: 11, fontWeight: '800' },
	empty: { color: colors.muted, textAlign: 'center', paddingVertical: 32, fontSize: 13 },
});
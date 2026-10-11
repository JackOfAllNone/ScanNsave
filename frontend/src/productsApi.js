// productsApi.js - Static Mock API for ScanNsave
// Ready for Mobile and Web runtime in pure JavaScript format
import { API_URL } from './apiConfig';

export const PRODUCTS_DATABASE = [
  {
    barcode: '037000140228',
    name: 'Tide PODS 3-in-1 Clean Breeze Detergent',
    brand: 'Tide',
    category: 'Household & Laundry',
    usage: 'Deep fabric stain removal, odor defense & color protection for laundry loads',
    description: '3-in-1 laundry detergent pacs that clean, brighten colors, and fight tough stains with fresh Clean Breeze scent.',
    price: 19.99,
    unitPrice: '$0.24 / pod',
    store: 'Target',
    size: '81 ct Tub',
    rating: 4.7,
    reviewsCount: 14200,
    image: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=600&q=80',
    keySpecs: ['81 Pacs', 'HE Compatible', 'Cold water active', '3-in-1 Tech'],
    alternatives: [
      {
        id: 'alt-tide-1',
        name: 'Kirkland Signature Ultra Clean Detergent Pacs',
        brand: 'Kirkland Signature',
        price: 13.49,
        originalPrice: 15.99,
        store: 'Costco',
        unitPrice: '$0.09 / pod',
        rating: 4.8,
        reviewsCount: 8900,
        badge: 'Best Value',
        image: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&w=600&q=80',
        whyCompare: 'Same 3-in-1 concentrated stain removal at less than half the unit price',
        keyDifferentiator: 'Save $6.50 + 152 pods per container vs 81',
        inStock: true
      },
      {
        id: 'alt-tide-2',
        name: 'Seventh Generation Free & Clear Laundry Detergent Packs',
        brand: 'Seventh Generation',
        price: 16.29,
        store: 'Amazon',
        unitPrice: '$0.21 / pod',
        rating: 4.6,
        reviewsCount: 4200,
        badge: 'Eco Friendly',
        image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=600&q=80',
        whyCompare: 'Plant-based alternative without synthetic dyes or artificial fragrances',
        keyDifferentiator: 'Hypoallergenic, EPA Safer Choice certified',
        inStock: true
      },
      {
        id: 'alt-tide-3',
        name: 'Great Value Oxi Stain Fighting Laundry Packs',
        brand: 'Great Value',
        price: 9.88,
        store: 'Walmart',
        unitPrice: '$0.15 / pod',
        rating: 4.3,
        reviewsCount: 3100,
        badge: 'Cheapest',
        image: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=600&q=80',
        whyCompare: 'Budget-friendly oxygen-based stain fighting pods for daily loads',
        keyDifferentiator: 'Lowest upfront price at under $10',
        inStock: true
      }
    ]
  },
  {
    barcode: '035000445678',
    name: 'Colgate Total Whitening Toothpaste',
    brand: 'Colgate',
    category: 'Personal Care',
    usage: 'Enamel cavity defense, plaque prevention & surface teeth whitening',
    description: '10-benefit oral health formula that whitens teeth, eliminates bacteria on teeth, tongue, cheeks and gums.',
    price: 4.99,
    unitPrice: '$1.04 / oz',
    store: 'CVS Pharmacy',
    size: '4.8 oz Tube',
    rating: 4.6,
    reviewsCount: 7850,
    image: 'https://images.unsplash.com/photo-1559591937-e10698188174?auto=format&fit=crop&w=600&q=80',
    keySpecs: ['Fluoride 0.454%', 'Stannous Fluoride', '12hr Antibacterial shield', 'Mint'],
    alternatives: [
      {
        id: 'alt-colgate-1',
        name: 'Crest 3D White Brilliance Teeth Whitening Paste',
        brand: 'Crest',
        price: 3.97,
        store: 'Walmart',
        unitPrice: '$0.97 / oz',
        rating: 4.8,
        reviewsCount: 19400,
        badge: 'Most Popular',
        image: 'https://images.unsplash.com/photo-1559591937-e10698188174?auto=format&fit=crop&w=600&q=80',
        whyCompare: 'Identical micro-cleansing whitening technology with enamel-safe formula',
        keyDifferentiator: 'Removes up to 100% more stains in 5 days; $1.02 cheaper',
        inStock: true
      },
      {
        id: 'alt-colgate-2',
        name: 'Equate Complete Whitening Antibacterial Toothpaste',
        brand: 'Equate',
        price: 2.18,
        store: 'Walmart',
        unitPrice: '$0.40 / oz',
        rating: 4.5,
        reviewsCount: 2200,
        badge: 'Cheapest',
        image: 'https://images.unsplash.com/photo-1559591937-e10698188174?auto=format&fit=crop&w=600&q=80',
        whyCompare: 'Store-brand bio-equivalent active ingredients comparing to Colgate Total',
        keyDifferentiator: 'Over 56% savings for identical active ingredient concentration',
        inStock: true
      },
      {
        id: 'alt-colgate-3',
        name: 'Tom\'s of Maine Simply White Natural Fluoride Paste',
        brand: 'Tom\'s of Maine',
        price: 5.49,
        store: 'Whole Foods',
        unitPrice: '$1.17 / oz',
        rating: 4.5,
        reviewsCount: 3800,
        badge: 'Eco Friendly',
        image: 'https://images.unsplash.com/photo-1559591937-e10698188174?auto=format&fit=crop&w=600&q=80',
        whyCompare: 'Natural silica whitening with no artificial sweeteners or sodium lauryl sulfate',
        keyDifferentiator: 'Cruelty-free, recyclable tube, naturally derived',
        inStock: true
      }
    ]
  },
  {
    barcode: '076211124424',
    name: 'Starbucks French Roast Dark Roast Whole Bean Coffee',
    brand: 'Starbucks',
    category: 'Groceries & Beverages',
    usage: 'Full-bodied dark roast morning brew with intense smokiness',
    description: 'Dark, bold, and smoky coffee crafted with Latin American Arabica beans.',
    price: 11.99,
    unitPrice: '$1.00 / oz',
    store: 'Safeway',
    size: '12 oz Bag',
    rating: 4.5,
    reviewsCount: 11200,
    image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=600&q=80',
    keySpecs: ['100% Arabica', 'Dark Roast Level', 'Whole Bean', '12 oz'],
    alternatives: [
      {
        id: 'alt-sbux-1',
        name: 'Mayorga Organic Café Cubano Dark Roast',
        brand: 'Mayorga',
        price: 7.99,
        store: 'Costco / Amazon',
        unitPrice: '$0.39 / oz',
        rating: 4.8,
        reviewsCount: 6400,
        badge: 'Best Value',
        image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=600&q=80',
        whyCompare: 'Same rich, dark, smoky profile with certified USDA Organic slow-roasting',
        keyDifferentiator: 'Save $4.00 per bag + USDA Organic & Direct Trade',
        inStock: true
      },
      {
        id: 'alt-sbux-2',
        name: 'Peet\'s Coffee Major Dickason\'s Blend',
        brand: 'Peet\'s Coffee',
        price: 10.49,
        store: 'Target',
        unitPrice: '$0.95 / oz',
        rating: 4.8,
        reviewsCount: 8900,
        badge: 'Premium Pick',
        image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
        whyCompare: 'Renowned rich complex dark roast blend from heritage master roasters',
        keyDifferentiator: 'More complex berry & dark chocolate flavor notes',
        inStock: true
      },
      {
        id: 'alt-sbux-3',
        name: 'Trader Joe\'s Dark Roast Colombian Supremo',
        brand: 'Trader Joe\'s',
        price: 6.99,
        store: 'Trader Joe\'s',
        unitPrice: '$0.50 / oz',
        rating: 4.6,
        reviewsCount: 4500,
        badge: 'Cheapest',
        image: 'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?auto=format&fit=crop&w=600&q=80',
        whyCompare: 'High quality single-origin dark roast Arabica at budget grocery price',
        keyDifferentiator: '$5.00 cheaper with smooth, low-acid finish',
        inStock: true
      }
    ]
  },
  {
    barcode: '305730164400',
    name: 'Advil Ibuprofen 200 mg Pain Reliever & Fever Reducer',
    brand: 'Advil',
    category: 'Health & Pharmacy',
    usage: 'Temporary relief of headaches, muscle aches, toothaches & minor arthritis',
    description: 'Fast-acting coated tablets containing 200mg Ibuprofen NSAID.',
    price: 12.49,
    unitPrice: '$0.12 / tablet',
    store: 'Walgreens',
    size: '100 Coated Tablets',
    rating: 4.8,
    reviewsCount: 19800,
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80',
    keySpecs: ['Ibuprofen 200mg (NSAID)', '100 Tablets', 'Coated for easy swallowing'],
    alternatives: [
      {
        id: 'alt-advil-1',
        name: 'Kirkland Signature Ibuprofen 200 mg (1,000 count)',
        brand: 'Kirkland Signature',
        price: 11.99,
        store: 'Costco',
        unitPrice: '$0.012 / tablet',
        rating: 4.9,
        reviewsCount: 24000,
        badge: 'Best Value',
        image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=600&q=80',
        whyCompare: 'FDA-regulated identical 200mg Ibuprofen active ingredient, 10x the quantity',
        keyDifferentiator: '10x more tablets (1,000 count) for 50¢ LESS than 100 Advil tablets!',
        inStock: true
      },
      {
        id: 'alt-advil-2',
        name: 'Up & Up Ibuprofen Tablets 200 mg (100 ct)',
        brand: 'Up & Up',
        price: 4.19,
        store: 'Target',
        unitPrice: '$0.04 / tablet',
        rating: 4.7,
        reviewsCount: 5100,
        badge: 'Cheapest',
        image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80',
        whyCompare: 'Target house brand with exact same active ingredient and strength',
        keyDifferentiator: 'Save $8.30 (66% off) for identical 100-tablet dosage',
        inStock: true
      }
    ]
  },
  {
    barcode: '840006623199',
    name: 'Anker Powerline III USB-C to USB-C Cable (6 ft)',
    brand: 'Anker',
    category: 'Electronics & Accessories',
    usage: 'Fast charging & 480Mbps data transfer for phones, tablets & laptops',
    description: 'Ultra-durable 60W USB-C cable built with bulletproof fiber core withstands 25,000 bends.',
    price: 14.99,
    unitPrice: '$14.99 each',
    store: 'Best Buy',
    size: '6 ft (1.8m)',
    rating: 4.8,
    reviewsCount: 31000,
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    keySpecs: ['60W Power Delivery', '6 ft Length', '25,000 bend lifespan', 'USB 2.0 480Mbps'],
    alternatives: [
      {
        id: 'alt-anker-1',
        name: 'UGREEN 100W Right-Angle Braided USB-C Cable 2-Pack',
        brand: 'UGREEN',
        price: 11.99,
        store: 'Amazon',
        unitPrice: '$6.00 / cable',
        rating: 4.7,
        reviewsCount: 15400,
        badge: 'Best Value',
        image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=80',
        whyCompare: 'Supports higher 100W PD charging and includes 2 cables for less money',
        keyDifferentiator: '100W vs 60W + 2 cables for $3 less than 1 Anker cable',
        inStock: true
      },
      {
        id: 'alt-anker-2',
        name: 'Amazon Basics Double Braided Nylon USB-C Cable',
        brand: 'Amazon Basics',
        price: 7.49,
        store: 'Amazon',
        unitPrice: '$7.49 each',
        rating: 4.5,
        reviewsCount: 28000,
        badge: 'Cheapest',
        image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
        whyCompare: 'Everyday standard USB-C 60W charging with rugged braided nylon exterior',
        keyDifferentiator: '50% cheaper with solid aluminum connectors',
        inStock: true
      }
    ]
  },
  {
    barcode: '028400040112',
    name: 'Doritos Nacho Cheese Flavored Tortilla Chips',
    brand: 'Doritos',
    category: 'Groceries & Snacks',
    usage: 'Party snack, game day chips & crunchy savory appetizer',
    description: 'Bold crunch and savory cheese flavor made with real cheddar and romano cheese.',
    price: 4.79,
    unitPrice: '$0.52 / oz',
    store: 'Kroger',
    size: '9.25 oz Bag',
    rating: 4.7,
    reviewsCount: 22100,
    image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=600&q=80',
    keySpecs: ['9.25 oz', 'Corn Tortilla', 'Cheddar & Romano', 'Zero trans fat'],
    alternatives: [
      {
        id: 'alt-doritos-1',
        name: 'Late July Organic Nacho Cheese Tortilla Chips',
        brand: 'Late July',
        price: 4.29,
        store: 'Sprouts / Whole Foods',
        unitPrice: '$0.54 / oz',
        rating: 4.6,
        reviewsCount: 3100,
        badge: 'Eco Friendly',
        image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=600&q=80',
        whyCompare: 'Non-GMO Project verified and organic alternative with bold nacho taste',
        keyDifferentiator: 'Made with organic whole ground corn, no artificial coloring',
        inStock: true
      },
      {
        id: 'alt-doritos-2',
        name: 'Clancy\'s Nacho Cheese Tortilla Chips',
        brand: 'Clancy\'s / ALDI',
        price: 1.89,
        store: 'ALDI',
        unitPrice: '$0.19 / oz',
        rating: 4.4,
        reviewsCount: 2800,
        badge: 'Cheapest',
        image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=600&q=80',
        whyCompare: 'ALDI fan-favorite budget alternative with classic zesty nacho cheese seasoning',
        keyDifferentiator: 'Save $2.90 per bag (60% cheaper)',
        inStock: true
      }
    ]
  },
  {
    barcode: '051500022344',
    name: 'Jif Extra Crunchy Peanut Butter',
    brand: 'Jif',
    category: 'Groceries & Pantry',
    usage: 'Sandwich spread, protein booster for smoothies & baking ingredient',
    description: 'Fresh roasted peanut taste with crunchy peanut bits in every spoonful.',
    price: 4.49,
    unitPrice: '$0.28 / oz',
    store: 'Target',
    size: '16 oz Jar',
    rating: 4.8,
    reviewsCount: 16500,
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
    keySpecs: ['16 oz Jar', '7g Protein per serving', 'Extra Crunchy', 'Gluten Free'],
    alternatives: [
      {
        id: 'alt-jif-1',
        name: 'Skippy Super Chunk Peanut Butter',
        brand: 'Skippy',
        price: 3.99,
        store: 'Walmart',
        unitPrice: '$0.25 / oz',
        rating: 4.7,
        reviewsCount: 12400,
        badge: 'Most Popular',
        image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
        whyCompare: 'Equally beloved classic chunky peanut butter with 7g protein per serving',
        keyDifferentiator: '50¢ cheaper per jar with smooth spreadability',
        inStock: true
      },
      {
        id: 'alt-jif-2',
        name: 'Great Value Crunchy Peanut Butter (40 oz)',
        brand: 'Great Value',
        price: 3.98,
        store: 'Walmart',
        unitPrice: '$0.10 / oz',
        rating: 4.6,
        reviewsCount: 6800,
        badge: 'Best Value',
        image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
        whyCompare: 'Huge 40 oz family jar for less than a single 16 oz name brand',
        keyDifferentiator: '2.5x more peanut butter for less money ($0.10 vs $0.28/oz)',
        inStock: true
      }
    ]
  },
  {
    barcode: '071249211458',
    name: 'L\'Oréal Paris Elvive Total Repair 5 Shampoo',
    brand: 'L\'Oréal',
    category: 'Personal Care & Hair',
    usage: 'Daily hair washing, split end repair & strengthening damaged hair',
    description: 'Formulated with caring ingredients featuring 9% Repair Concentrate with Protein to fight 5 signs of damaged hair.',
    price: 8.99,
    unitPrice: '$0.32 / fl oz',
    store: 'Ulta Beauty',
    size: '28 fl oz Pump',
    rating: 4.5,
    reviewsCount: 8900,
    image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=600&q=80',
    keySpecs: ['28 fl oz', 'Protein + Ceramide', 'Damaged hair treatment'],
    alternatives: [
      {
        id: 'alt-loreal-1',
        name: 'Garnier Fructis Damage Repairing Treat Shampoo',
        brand: 'Garnier',
        price: 6.49,
        store: 'Target',
        unitPrice: '$0.23 / fl oz',
        rating: 4.6,
        reviewsCount: 7100,
        badge: 'Eco Friendly',
        image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=600&q=80',
        whyCompare: '98% naturally derived ingredients formulated for hair damage repair',
        keyDifferentiator: 'Save $2.50 + vegan formula with Papaya extract',
        inStock: true
      },
      {
        id: 'alt-loreal-2',
        name: 'Suave Professionals Keratin Infusion Smoothing Shampoo',
        brand: 'Suave',
        price: 3.48,
        store: 'Walmart',
        unitPrice: '$0.12 / fl oz',
        rating: 4.4,
        reviewsCount: 5200,
        badge: 'Cheapest',
        image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=600&q=80',
        whyCompare: 'Keratin protein treatment providing 48-hour frizz control and repair',
        keyDifferentiator: 'Save $5.51 (over 60% savings)',
        inStock: true
      }
    ]
  }
];

export async function saveProductToApi(product) {
  try {
    const response = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    if (!response.ok) throw new Error(`Product request failed: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn('Product sync error', error);
    return product;
  }
}

export async function searchProductPrices(product) {
  const barcode = String(product?.barcode || '').trim();
  if (!barcode) throw new Error('This product does not have a barcode to look up prices.');

  const response = await fetch(`${API_URL}/prices/${encodeURIComponent(barcode)}`);
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || `Price search failed: ${response.status}`);
  }
  if (!Array.isArray(result.offers)) {
    throw new Error('The price search returned an invalid response.');
  }
  return result;
}

export async function lookupProductByBarcode(barcode) {
  const cleanCode = (barcode || '').trim();
  if (!cleanCode) return null;

  try {
    const response = await fetch(`${API_URL}/products/${encodeURIComponent(cleanCode)}`);
    if (response.ok) return await response.json();
    if (response.status !== 404) throw new Error(`Product request failed: ${response.status}`);
  } catch (error) {
    console.warn('Product lookup error', error);
  }

  const matched = PRODUCTS_DATABASE.find((p) => p.barcode === cleanCode);
  if (matched) {
    void saveProductToApi(matched);
    return matched;
  }

  // Partial match check
  const partial = PRODUCTS_DATABASE.find(
    (p) => p.barcode.includes(cleanCode) || cleanCode.includes(p.barcode)
  );
  if (partial) {
    void saveProductToApi(partial);
    return partial;
  }

  return null;
}

export function searchCatalog(query, category) {
  const q = (query || '').toLowerCase().trim();
  return PRODUCTS_DATABASE.filter((p) => {
    const matchesQuery =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.barcode.includes(q);

    const matchesCategory = !category || category === 'All' || p.category === category;
    return matchesQuery && matchesCategory;
  });
}

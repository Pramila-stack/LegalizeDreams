function slugify(name) {
  return name
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

const raw = [
  // Skincare
  { name: 'Dewy Glow Water Tint', categorySlug: 'skincare', price: 1600, mrp: 1800, rating: 4.7, reviews: 214, badge: 'Bestseller', description: 'A lightweight, buildable water tint that gives your lips and cheeks a fresh, dewy flush that lasts all day.' },
  { name: 'Juicy Berry Plumping Lip Oil', categorySlug: 'skincare', price: 1700, mrp: 1900, rating: 4.6, reviews: 158, badge: 'New', description: 'Nourishing lip oil infused with berry extract for a glossy, plumped-up pout without the stickiness.' },
  { name: 'Niacinamide 10% Brightening Serum', categorySlug: 'skincare', price: 950, mrp: 1100, rating: 4.5, reviews: 302, description: 'A daily serum that visibly brightens skin tone and minimizes the look of pores over time.' },
  { name: 'Centella Calming Toner', categorySlug: 'skincare', price: 780, mrp: 900, rating: 4.4, reviews: 121, description: 'Soothes redness and irritation while restoring your skin barrier with centella asiatica extract.' },
  { name: 'SPF 50+ Featherlight Sunscreen', categorySlug: 'skincare', price: 890, mrp: 990, rating: 4.8, reviews: 267, badge: 'Bestseller', description: 'No white-cast, non-greasy daily sunscreen that layers beautifully under makeup.' },

  // Makeup
  { name: 'Glass Melting Balm', categorySlug: 'makeup', price: 1650, mrp: 1800, rating: 4.6, reviews: 189, description: 'A multi-use balm that melts into skin for a glassy, luminous finish on lips and cheeks.' },
  { name: 'Velvet Matte Lip Tint Set', categorySlug: 'makeup', price: 1500, mrp: 1800, rating: 4.5, reviews: 176, badge: 'New', description: 'Four richly pigmented mattes in a travel-friendly set — comfortable wear with zero drying feel.' },
  { name: '9-Shade Eyeshadow Palette', categorySlug: 'makeup', price: 1350, mrp: 1550, rating: 4.7, reviews: 233, description: 'A versatile mix of mattes and shimmers designed for everyday looks to soft-glam nights out.' },
  { name: 'Featherweight Blush Duo', categorySlug: 'makeup', price: 990, mrp: 1150, rating: 4.4, reviews: 98, description: 'Buildable cream-to-powder blush duo for a natural, second-skin flush.' },
  { name: 'Precision Volume Mascara', categorySlug: 'makeup', price: 850, mrp: 950, rating: 4.3, reviews: 141, description: 'Smudge-proof, clump-free mascara that lifts and separates every lash.' },

  // Accessories
  { name: 'Pearl Drop Hair Clip Set', categorySlug: 'accessories', price: 450, mrp: 550, rating: 4.5, reviews: 88, description: 'A set of three pearl-embellished claw clips that dress up any hairstyle in seconds.' },
  { name: 'Ribbon Bow Scrunchie Pack', categorySlug: 'accessories', price: 380, mrp: 450, rating: 4.3, reviews: 64, description: 'Soft satin scrunchies with an oversized bow — gentle on hair, cute on the wrist.' },
  { name: 'Layered Charm Necklace', categorySlug: 'accessories', price: 620, mrp: 750, rating: 4.6, reviews: 112, badge: 'New', description: 'Delicate layered chains finished with a dainty star charm for everyday wear.' },

  // Keychains & Phonecharms
  { name: 'Cloud Bear Keychain', categorySlug: 'keychains-phonecharms', price: 420, mrp: 480, rating: 4.7, reviews: 145, badge: 'Bestseller', description: 'A plush cloud-bear keychain that clips onto bags, keys, or backpacks.' },
  { name: 'Beaded Heart Phone Charm', categorySlug: 'keychains-phonecharms', price: 390, mrp: 460, rating: 4.5, reviews: 97, description: 'Hand-strung beaded heart charm with an adjustable strap for phone cases.' },
  { name: 'Mini Star Bag Charm Trio', categorySlug: 'keychains-phonecharms', price: 510, mrp: 600, rating: 4.4, reviews: 73, description: 'Three coordinating star charms to layer onto your favorite bag or lanyard.' },

  // Wallets
  { name: 'Quilted Mini Wallet', categorySlug: 'wallets', price: 1200, mrp: 1400, rating: 4.6, reviews: 132, description: 'A compact quilted wallet with card slots, a coin pocket, and a wrist strap.' },
  { name: 'Pastel Trifold Wallet', categorySlug: 'wallets', price: 990, mrp: 1150, rating: 4.4, reviews: 87, badge: 'New', description: 'Soft pastel faux-leather trifold with plenty of room for cards and cash.' },

  // Bags & Sleeves
  { name: 'Structured Crossbody Bag', categorySlug: 'bags-sleeves', price: 2400, mrp: 2800, rating: 4.7, reviews: 156, badge: 'Bestseller', description: 'A structured crossbody with a detachable chain strap — fits all your daily essentials.' },
  { name: 'Laptop Sleeve 13-inch', categorySlug: 'bags-sleeves', price: 1450, mrp: 1650, rating: 4.5, reviews: 94, description: 'Padded, water-resistant sleeve that keeps your laptop protected in soft pastel tones.' },
  { name: 'Canvas Tote Bag', categorySlug: 'bags-sleeves', price: 890, mrp: 1000, rating: 4.3, reviews: 68, description: 'A roomy canvas tote with reinforced handles, perfect for everyday errands.' },

  // Pouches
  { name: 'Ruffle Trim Makeup Pouch', categorySlug: 'pouches', price: 650, mrp: 750, rating: 4.5, reviews: 79, description: 'A ruffle-trimmed pouch sized just right for your everyday makeup kit.' },
  { name: 'Clear Travel Pouch Set', categorySlug: 'pouches', price: 520, mrp: 600, rating: 4.2, reviews: 51, description: 'Set of three clear pouches in graduated sizes — ideal for travel organization.' },

  // Jewelry
  { name: 'Freshwater Pearl Studs', categorySlug: 'jewelry', price: 580, mrp: 680, rating: 4.7, reviews: 121, description: 'Timeless freshwater pearl studs with hypoallergenic posts.' },
  { name: 'Stacking Ring Set', categorySlug: 'jewelry', price: 490, mrp: 560, rating: 4.4, reviews: 66, badge: 'New', description: 'Five delicate stacking rings you can mix, match, and wear together or solo.' },

  // Hair Accessories
  { name: 'Silk-Feel Headband', categorySlug: 'hair-accessories', price: 340, mrp: 400, rating: 4.3, reviews: 58, description: 'A smooth, silk-feel headband that keeps flyaways in place without creasing hair.' },
  { name: 'Pastel Hair Pin Set', categorySlug: 'hair-accessories', price: 300, mrp: 360, rating: 4.2, reviews: 44, description: 'Set of six mixed pastel hairpins for effortless everyday styling.' },

  // Stationery
  { name: 'Dot Grid Journal', categorySlug: 'stationery', price: 480, mrp: 560, rating: 4.6, reviews: 102, description: 'A softcover dot-grid journal with thick, pen-friendly pages and a ribbon marker.' },
  { name: 'Aesthetic Sticker Pack', categorySlug: 'stationery', price: 220, mrp: 260, rating: 4.5, reviews: 76, description: 'A curated pack of 50+ decorative stickers for journals, laptops, and planners.' },
]

export const products = raw.map((p, i) => ({
  id: `prod-${i + 1}`,
  slug: slugify(p.name),
  stock: 12,
  ...p,
}))

export function getProductBySlug(slug) {
  return products.find((p) => p.slug === slug)
}

export function getProductsByCategory(categorySlug) {
  return products.filter((p) => p.categorySlug === categorySlug)
}

export function getRelatedProducts(product, limit = 4) {
  return products
    .filter((p) => p.categorySlug === product.categorySlug && p.id !== product.id)
    .slice(0, limit)
}

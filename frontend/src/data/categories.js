export const categories = [
  { id: 'cat-1', name: 'Skincare', slug: 'skincare', icon: '🧴', swatch: ['#eef5fb', '#b7d5ea'] },
  { id: 'cat-2', name: 'Makeup', slug: 'makeup', icon: '💄', swatch: ['#fdf1f4', '#f6c0cd'] },
  { id: 'cat-3', name: 'Accessories', slug: 'accessories', icon: '🎀', swatch: ['#fdf6ee', '#f3d9b1'] },
  { id: 'cat-4', name: 'Keychains & Phonecharms', slug: 'keychains-phonecharms', icon: '🔑', swatch: ['#f2f0fb', '#c9c1ee'] },
  { id: 'cat-5', name: 'Wallets', slug: 'wallets', icon: '👛', swatch: ['#eefaf3', '#a9dfc2'] },
  { id: 'cat-6', name: 'Bags & Sleeves', slug: 'bags-sleeves', icon: '👜', swatch: ['#fef2f2', '#f3b6b6'] },
  { id: 'cat-7', name: 'Pouches', slug: 'pouches', icon: '👝', swatch: ['#f0f9fb', '#a7d8e0'] },
  { id: 'cat-8', name: 'Jewelry', slug: 'jewelry', icon: '💍', swatch: ['#fffaf0', '#f5deac'] },
  { id: 'cat-9', name: 'Hair Accessories', slug: 'hair-accessories', icon: '🎗️', swatch: ['#f6f1fb', '#d8c2ef'] },
  { id: 'cat-10', name: 'Stationery', slug: 'stationery', icon: '✏️', swatch: ['#f0f6ee', '#bfe0ac'] },
]

export function getCategoryBySlug(slug) {
  return categories.find((c) => c.slug === slug)
}

export const categories = [
  { id: 'cat-1', name: 'Skincare', slug: 'skincare', icon: '🧴', swatch: ['#fdf5f5', '#f2ccd3'] },
  { id: 'cat-2', name: 'Makeup', slug: 'makeup', icon: '💄', swatch: ['#fdf1f4', '#f6c0cd'] },
  { id: 'cat-3', name: 'Accessories', slug: 'accessories', icon: '🎀', swatch: ['#fdf6ee', '#f3d9b1'] },
  { id: 'cat-4', name: 'Keychains & Phonecharms', slug: 'keychains-phonecharms', icon: '🔑', swatch: ['#faf1f4', '#e6b3c4'] },
  { id: 'cat-5', name: 'Wallets', slug: 'wallets', icon: '👛', swatch: ['#fdf4f0', '#f1c6ad'] },
  { id: 'cat-6', name: 'Bags & Sleeves', slug: 'bags-sleeves', icon: '👜', swatch: ['#fef2f2', '#f3b6b6'] },
  { id: 'cat-7', name: 'Pouches', slug: 'pouches', icon: '👝', swatch: ['#fdf4f6', '#edb8c6'] },
  { id: 'cat-8', name: 'Jewelry', slug: 'jewelry', icon: '💍', swatch: ['#fffaf0', '#f5deac'] },
  { id: 'cat-9', name: 'Hair Accessories', slug: 'hair-accessories', icon: '🎗️', swatch: ['#fbf2f6', '#e7bad0'] },
  { id: 'cat-10', name: 'Stationery', slug: 'stationery', icon: '✏️', swatch: ['#fdf5f0', '#f0ccb4'] },
]

export function getCategoryBySlug(slug) {
  return categories.find((c) => c.slug === slug)
}

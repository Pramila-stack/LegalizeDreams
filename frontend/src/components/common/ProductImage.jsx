import { useState } from 'react'
import { getCategoryBySlug } from '../../data/categories'

const sizeStyles = {
  sm: 'text-2xl',
  md: 'text-4xl',
  lg: 'text-6xl',
}

export default function ProductImage({ product, size = 'md', className = '' }) {
  const [imageError, setImageError] = useState(false)
  const category = getCategoryBySlug(product.category_name)
  const [from, to] = category?.swatch ?? ['#eef5fb', '#b7d5ea']

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden rounded-xl ${className}`}
      style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
    >
      {product.image && !imageError ? (
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <span className={sizeStyles[size]} aria-hidden="true">
          {category?.icon ?? '✨'}
        </span>
      )}
      {product.badge && (
        <span className="absolute left-2 top-2 rounded-full bg-brand-900/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
          {product.badge}
        </span>
      )}
    </div>
  )
}

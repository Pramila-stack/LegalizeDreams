import { useState } from 'react'
import { mediaUrl } from '../../utils/mediaUrl'

const sizeStyles = {
  sm: 'text-2xl',
  md: 'text-4xl',
  lg: 'text-6xl',
}

const defaultGradients = {
  0: ['#fdf5f5', '#f2ccd3'],
  1: ['#fef3e0', '#fdd79d'],
  2: ['#fbf2f6', '#e7bad0'],
  3: ['#ffe5e5', '#ffb3b3'],
  4: ['#fdf4f6', '#edb8c6'],
}

export default function ProductImage({ product, size = 'md', className = '' }) {
  const [imageError, setImageError] = useState(false)
  const gradientIndex = (product.id || 0) % Object.keys(defaultGradients).length
  const [from, to] = defaultGradients[gradientIndex]

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden rounded-xl ${className}`}
      style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
    >
      {product.image && !imageError ? (
        <img
          src={mediaUrl(product.image)}
          alt={product.name}
          className="h-full w-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <span className={sizeStyles[size]} aria-hidden="true">
          ✨
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

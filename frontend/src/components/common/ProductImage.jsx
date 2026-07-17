import { useState } from 'react'

const sizeStyles = {
  sm: 'text-2xl',
  md: 'text-4xl',
  lg: 'text-6xl',
}

const defaultGradients = {
  0: ['#eef5fb', '#b7d5ea'],
  1: ['#fef3e0', '#fdd79d'],
  2: ['#f0e5ff', '#d9a6ff'],
  3: ['#ffe5e5', '#ffb3b3'],
  4: ['#e5f5ff', '#99d9ff'],
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
          src={typeof product.image === 'string' && !product.image.startsWith('http')
            ? `http://localhost:8000${product.image}`
            : product.image}
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

export default function Price({ price, mrp, size = 'md' }) {
  const hasDiscount = mrp && mrp > price
  const discountPct = hasDiscount ? Math.round(((mrp - price) / mrp) * 100) : 0
  const priceClass = size === 'lg' ? 'text-2xl' : 'text-base'

  return (
    <div className="flex items-center gap-2">
      <span className={`font-semibold text-brand-900 ${priceClass}`}>Rs {price.toLocaleString()}</span>
      {hasDiscount && (
        <>
          <span className="text-sm text-brand-400 line-through">Rs {mrp.toLocaleString()}</span>
          <span className="text-xs font-medium text-blush-400">-{discountPct}%</span>
        </>
      )}
    </div>
  )
}

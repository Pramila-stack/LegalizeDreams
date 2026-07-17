export default function StarRating({ rating, reviews, size = 'sm' }) {
  const fontSize = size === 'sm' ? 'text-xs' : 'text-sm'
  const numRating = typeof rating === 'string' ? parseFloat(rating) : rating

  return (
    <div className={`flex items-center gap-1 text-brand-600 ${fontSize}`}>
      <span aria-hidden="true" className="text-amber-400">
        {'★'.repeat(Math.round(numRating))}
        {'☆'.repeat(5 - Math.round(numRating))}
      </span>
      <span className="text-brand-400">
        {numRating.toFixed(1)}
        {typeof reviews === 'number' && ` (${reviews})`}
      </span>
    </div>
  )
}

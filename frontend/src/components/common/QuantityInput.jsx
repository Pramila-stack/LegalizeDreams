export default function QuantityInput({ value, onChange, min = 1, max = 99 }) {
  function clamp(v) {
    return Math.min(max, Math.max(min, v))
  }

  return (
    <div className="inline-flex items-center rounded-full border border-brand-200">
      <button
        type="button"
        onClick={() => onChange(clamp(value - 1))}
        className="flex h-9 w-9 items-center justify-center text-brand-600 hover:text-brand-900 disabled:opacity-40"
        disabled={value <= min}
        aria-label="Decrease quantity"
      >
        −
      </button>
      <span className="w-8 text-center text-sm font-medium text-brand-900">{value}</span>
      <button
        type="button"
        onClick={() => onChange(clamp(value + 1))}
        className="flex h-9 w-9 items-center justify-center text-brand-600 hover:text-brand-900 disabled:opacity-40"
        disabled={value >= max}
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  )
}

export default function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-brand-100 bg-white">
      <div className="aspect-square w-full animate-pulse bg-brand-100" />
      <div className="flex flex-col gap-2 p-4">
        <div className="h-3.5 w-3/4 animate-pulse rounded bg-brand-100" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-brand-100" />
        <div className="h-3.5 w-1/3 animate-pulse rounded bg-brand-100" />
        <div className="mt-2 h-8 w-full animate-pulse rounded-full bg-brand-100" />
      </div>
    </div>
  )
}

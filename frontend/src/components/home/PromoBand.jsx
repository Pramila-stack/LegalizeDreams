import { Link } from 'react-router-dom'

export default function PromoBand() {
  return (
    <section className="bg-brand-200 py-16 text-center animate-on-scroll">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-brand-700">
          The New Season Edit
        </p>
        <h2 className="font-display mt-3 text-3xl font-semibold text-brand-800 sm:text-4xl">
          Free shipping on orders over Rs 3,000
        </h2>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-brand-700">
          Skincare, makeup and fashion accessories curated for your everyday glow —
          fresh picks added every week.
        </p>
        <Link
          to="/shop"
          className="mt-8 inline-block rounded-full bg-brand-600 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          Shop New Arrivals
        </Link>
      </div>
    </section>
  )
}

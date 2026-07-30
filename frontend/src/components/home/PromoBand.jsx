import { Link } from 'react-router-dom'

export default function PromoBand() {
  return (
    <section className="bg-brand-800 py-16 text-center animate-on-scroll">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-brand-300">
          The New Season Edit
        </p>
        <h2 className="font-display mt-3 text-3xl font-semibold text-white sm:text-4xl">
          Free shipping on orders over Rs 3,000
        </h2>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-brand-100">
          Skincare, makeup and fashion accessories curated for your everyday glow —
          fresh picks added every week.
        </p>
        <Link
          to="/shop"
          className="mt-8 inline-block rounded-full bg-white px-8 py-3 text-sm font-semibold text-brand-900 transition-colors hover:bg-brand-100"
        >
          Shop New Arrivals
        </Link>
      </div>
    </section>
  )
}

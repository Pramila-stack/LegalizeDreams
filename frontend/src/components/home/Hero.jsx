import { Link } from 'react-router-dom'

export default function Hero() {
  return (
    <section className="bg-gradient-to-br from-brand-50 via-blush-50 to-brand-100">
      <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24 lg:px-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-blush-400">New Season Edit</p>
          <h1 className="font-display mt-3 text-4xl font-semibold leading-tight text-brand-900 sm:text-5xl">
            Little joys for your everyday glow
          </h1>
          <p className="mt-4 max-w-md text-brand-600">
            Skincare, makeup and fashion accessories curated in one place — cute, considered, and made to be loved.
          </p>
          <div className="mt-8 flex gap-3">
            <Link
              to="/category/makeup"
              className="rounded-full bg-brand-900 px-7 py-3 text-sm font-medium text-white hover:bg-brand-800"
            >
              Shop New Arrivals
            </Link>
            <a
              href="#categories"
              className="rounded-full border border-brand-800 px-7 py-3 text-sm font-medium text-brand-800 hover:bg-white"
            >
              Browse Categories
            </a>
          </div>
        </div>

        <div className="relative mx-auto flex aspect-square w-full max-w-md items-center justify-center rounded-[2rem] bg-gradient-to-br from-blush-100 to-brand-200 shadow-inner">
          <span className="text-8xl" aria-hidden="true">🌙</span>
          <span className="absolute -left-4 top-8 rounded-2xl bg-white px-4 py-3 text-2xl shadow-lg" aria-hidden="true">💄</span>
          <span className="absolute -right-2 bottom-10 rounded-2xl bg-white px-4 py-3 text-2xl shadow-lg" aria-hidden="true">🎀</span>
          <span className="absolute bottom-0 left-10 rounded-2xl bg-white px-4 py-3 text-2xl shadow-lg" aria-hidden="true">🧴</span>
        </div>
      </div>
    </section>
  )
}

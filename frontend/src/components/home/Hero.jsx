import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'

const VIDEOS = [
  {
    id: 1,
    src: 'http://localhost:8000/media/products/army.MP4',
    title: 'Army Collection',
  },
  {
    id: 2,
    src: 'http://localhost:8000/media/products/lowrise.MP4',
    title: 'Lowrise Collection',
  },
]

const VIDEO_DURATION = 5000 // 5 seconds per video

export default function Hero() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % VIDEOS.length)
        setIsTransitioning(false)
      }, 500)
    }, VIDEO_DURATION)

    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative bg-white">
      <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24 lg:px-8">
        {/* Left side - Flower image (hidden on mobile) */}
        <div className="hidden lg:flex items-center justify-center animate-fade-in-left">
          <div className="relative w-full max-w-sm overflow-hidden rounded-3xl shadow-2xl">
            <img
              src="http://localhost:8000/media/logo/flower.jpg"
              alt="Legalize Dreams Flower"
              className="h-full w-full object-cover aspect-square"
            />
          </div>
        </div>

        {/* Right side - Text and video */}
        <div className="flex flex-col gap-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-blush-400 animate-slide-up">
              New Season Edit
            </p>
            <h1 className="font-display mt-3 text-4xl font-semibold leading-tight text-black sm:text-5xl animate-slide-up" style={{animationDelay: '0.1s'}}>
              Little joys for your everyday glow
            </h1>
            <p className="mt-4 max-w-md text-gray-700 animate-slide-up" style={{animationDelay: '0.2s'}}>
              Skincare, makeup and fashion accessories curated in one place — cute, considered, and made to be loved.
            </p>
            <div className="mt-8 flex gap-3 animate-slide-up" style={{animationDelay: '0.3s'}}>
              <Link
                to="/shop"
                className="rounded-full bg-brand-600 px-7 py-3 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
              >
                Shop New Arrivals
              </Link>
              <a
                href="#categories"
                className="rounded-full border border-brand-800 px-7 py-3 text-sm font-medium text-brand-800 hover:bg-white transition-colors"
              >
                Browse Categories
              </a>
            </div>
          </div>

          {/* Video Container */}
          <div className="relative mx-auto w-full max-w-md overflow-hidden rounded-[2rem] bg-gradient-to-br from-blush-100 to-brand-200 shadow-xl border-4 border-white/50 animate-fade-in" style={{animationDelay: '0.2s'}}>
            <div className={`relative aspect-square w-full bg-brand-900 ${isTransitioning ? 'video-transitioning' : ''}`}>
              {VIDEOS.map((video, idx) => (
                <div
                  key={video.id}
                  className={`absolute inset-0 transition-opacity duration-500 ${
                    idx === currentIndex && !isTransitioning ? 'opacity-100' : 'opacity-0'
                  }`}
                  style={{
                    zIndex: idx === currentIndex ? 10 : 0,
                  }}
                >
                  <video
                    src={video.src}
                    autoPlay
                    muted
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}

              {/* Video Navigation Dots */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 pointer-events-auto z-20">
                {VIDEOS.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentIndex(idx)
                      setIsTransitioning(false)
                    }}
                    className={`transition-all duration-300 rounded-full ${
                      idx === currentIndex
                        ? 'bg-white w-6 h-2'
                        : 'bg-white/40 w-2 h-2 hover:bg-white/70'
                    }`}
                    aria-label={`Go to video ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

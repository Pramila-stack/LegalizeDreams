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
    <section
      className="relative bg-white"
      style={{
        backgroundImage: 'url(http://localhost:8000/media/logo/flower.jpg)',
        backgroundPosition: 'left center',
        backgroundSize: '40%',
        backgroundRepeat: 'no-repeat',
        backgroundBlendMode: 'multiply',
        backgroundColor: '#ffffff'
      }}
    >
      <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24 lg:px-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-blush-400 animate-on-load">New Season Edit</p>
          <h1 className="font-display mt-3 text-4xl font-semibold leading-tight text-black sm:text-5xl animate-on-load animate-stagger-1">
            Little joys for your everyday glow
          </h1>
          <p className="mt-4 max-w-md text-gray-700 animate-on-load animate-stagger-2">
            Skincare, makeup and fashion accessories curated in one place — cute, considered, and made to be loved.
          </p>
          <div className="mt-8 flex gap-3 animate-on-load animate-stagger-3">
            <Link
              to="/shop"
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

        {/* Video Container */}
        <div className="relative mx-auto w-full max-w-md overflow-hidden rounded-[2rem] bg-gradient-to-br from-blush-100 to-brand-200 shadow-xl border-4 border-white/50">
          {/* Audio Player - Hidden but plays background audio from lowrise.mp4 */}
          <audio autoPlay loop muted={false} style={{display: 'none'}}>
            <source src="http://localhost:8000/media/products/lowrise.MP4" type="audio/mp4" />
          </audio>
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
    </section>
  )
}

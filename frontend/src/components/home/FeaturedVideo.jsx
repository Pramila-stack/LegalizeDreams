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

export default function FeaturedVideo() {
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

  const currentVideo = VIDEOS[currentIndex]

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="relative">
        {/* Large Rounded Video Container */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 shadow-2xl border-4 border-white/50">
          {/* Video Player */}
          <div className="relative w-full bg-brand-900" style={{ aspectRatio: '16 / 9' }}>
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
                  controls
                  className="h-full w-full object-cover"
                />
              </div>
            ))}

            {/* Title Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-8 pointer-events-none">
              <h3 className={`font-display text-3xl font-bold text-white transition-all duration-500 ${
                isTransitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
              }`}>
                {currentVideo.title}
              </h3>
            </div>
          </div>

          {/* Navigation Dots - Positioned at bottom center */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 pointer-events-auto z-20">
            {VIDEOS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCurrentIndex(idx)
                  setIsTransitioning(false)
                }}
                className={`transition-all duration-300 rounded-full ${
                  idx === currentIndex
                    ? 'bg-white w-10 h-2'
                    : 'bg-white/40 w-2 h-2 hover:bg-white/70'
                }`}
                aria-label={`Go to video ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Decorative corner badges */}
        {/* Top Left Badge */}
        <div className="absolute -top-6 -left-6 bg-white rounded-3xl p-4 shadow-xl border-2 border-pink-100">
          <div className="text-3xl">✨</div>
        </div>

        {/* Bottom Left Badge */}
        <div className="absolute -bottom-6 -left-8 bg-white rounded-3xl p-4 shadow-xl border-2 border-pink-100">
          <div className="text-3xl">💐</div>
        </div>

        {/* Bottom Right Badge */}
        <div className="absolute -bottom-6 -right-6 bg-white rounded-3xl p-4 shadow-xl border-2 border-pink-100">
          <div className="text-3xl">🎀</div>
        </div>
      </div>

      {/* Info Text Below */}
      <div className="mt-12 text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-blush-400">Trending Collections</p>
        <h2 className="font-display mt-2 text-2xl font-semibold text-brand-900">
          Watch Our Latest Collections
        </h2>
        <p className="mt-4 text-brand-600 max-w-2xl mx-auto">
          Explore our newest styles and trending designs. Videos switch automatically to showcase different collections.
        </p>
      </div>
    </section>
  )
}

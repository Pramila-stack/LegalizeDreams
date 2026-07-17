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

const VIDEO_DURATION = 6000 // 6 seconds per video

export default function VideoCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % VIDEOS.length)
        setIsTransitioning(false)
      }, 600) // Duration of fade animation
    }, VIDEO_DURATION)

    return () => clearInterval(interval)
  }, [])

  const currentVideo = VIDEOS[currentIndex]

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-blush-400">Featured</p>
        <h2 className="font-display mt-2 text-3xl font-semibold text-brand-900">Collection Showcase</h2>
      </div>

      <div className="relative w-full overflow-hidden rounded-3xl border-4 border-brand-100 shadow-2xl">
        {/* Video Container */}
        <div className="relative w-full bg-brand-900" style={{ aspectRatio: '16 / 9' }}>
          {VIDEOS.map((video, idx) => (
            <div
              key={video.id}
              className={`absolute inset-0 transition-opacity duration-600 ${
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

          {/* Video Title Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end justify-start p-8 pointer-events-none">
            <div className="text-white">
              <h3 className="font-display text-3xl font-bold mb-2 animate-fade-in">{currentVideo.title}</h3>
              <p className="text-sm text-brand-100">Video {currentIndex + 1} of {VIDEOS.length}</p>
            </div>
          </div>

          {/* Navigation Dots */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 pointer-events-auto z-20">
            {VIDEOS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCurrentIndex(idx)
                  setIsTransitioning(false)
                }}
                className={`transition-all duration-300 ${
                  idx === currentIndex
                    ? 'bg-white w-8 h-3 rounded-full'
                    : 'bg-white/40 w-3 h-3 rounded-full hover:bg-white/60'
                }`}
                aria-label={`Go to video ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Info Cards Below Video */}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {VIDEOS.map((video, idx) => (
          <div
            key={video.id}
            className={`rounded-2xl border-2 p-6 transition-all duration-300 cursor-pointer ${
              idx === currentIndex
                ? 'border-brand-600 bg-brand-50 shadow-lg'
                : 'border-brand-100 bg-white hover:border-brand-300'
            }`}
            onClick={() => setCurrentIndex(idx)}
          >
            <div className="flex items-center gap-4">
              <div className={`text-4xl font-bold ${idx === currentIndex ? 'text-brand-600' : 'text-brand-300'}`}>
                {idx + 1}
              </div>
              <div className="flex-1">
                <h3 className="font-display text-lg font-semibold text-brand-900">{video.title}</h3>
                <p className="text-sm text-brand-600 mt-1">Click to play</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

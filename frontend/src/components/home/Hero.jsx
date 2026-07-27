import { Link } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'
import { mediaUrl } from '../../utils/mediaUrl'
import { api } from '../../services/api'
import flowerBg from '../../assets/logo/flower.jpg'

// Used only until the admin adds hero videos / edits the CTA.
const FALLBACK_VIDEOS = [
  {
    id: 'fallback-1',
    src: mediaUrl('/media/products/army.MP4'),
    title: 'Army Collection',
  },
  {
    id: 'fallback-2',
    src: mediaUrl('/media/products/lowrise.MP4'),
    title: 'Lowrise Collection',
  },
]

const FALLBACK_CTA = { label: 'Shop New Arrivals', link: '/shop' }

const VIDEO_DURATION = 5000 // 5 seconds per video

export default function Hero() {
  const [videos, setVideos] = useState(FALLBACK_VIDEOS)
  const [cta, setCta] = useState(FALLBACK_CTA)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const videoRef = useRef(null)

  // Load admin-managed hero content; keep fallbacks if empty or unreachable.
  useEffect(() => {
    let cancelled = false
    api
      .getHero()
      .then((data) => {
        if (cancelled) return
        if (data?.videos?.length > 0) {
          setVideos(
            data.videos.map((v) => ({
              id: v.id,
              src: mediaUrl(v.src),
              title: v.title || '',
            }))
          )
          setCurrentIndex(0)
        }
        if (data?.cta?.label && data?.cta?.link) {
          setCta({ label: data.cta.label, link: data.cta.link })
        }
      })
      .catch((error) => {
        console.error('Failed to load hero content:', error)
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      if (isVisible) {
        setIsTransitioning(true)
        setTimeout(() => {
          setCurrentIndex((prev) => (prev + 1) % videos.length)
          setIsTransitioning(false)
        }, 500)
      }
    }, VIDEO_DURATION)

    return () => clearInterval(interval)
  }, [isVisible, videos.length])

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      { threshold: 0.5 }
    )

    if (videoRef.current) {
      observer.observe(videoRef.current)
    }

    return () => {
      if (videoRef.current) {
        observer.unobserve(videoRef.current)
      }
    }
  }, [])

  return (
    <section className="relative bg-white">
      <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24 lg:px-8">
        <div
          className="relative"
          style={{
            backgroundImage: `url(${flowerBg})`,
            backgroundPosition: 'left center',
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'scroll',
          }}
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-blush-400 animate-slow-text" style={{animationDelay: '0s'}}>New Season Edit</p>
          <h1 className="font-display mt-3 text-4xl font-semibold leading-tight text-black sm:text-5xl animate-slow-text" style={{animationDelay: '0.15s'}}>
            Little joys for your everyday glow
          </h1>
          <p className="mt-4 max-w-md text-gray-700 animate-slow-text" style={{animationDelay: '0.3s'}}>
            Skincare, makeup and fashion accessories curated in one place — cute, considered, and made to be loved.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 animate-slow-text" style={{animationDelay: '0.45s'}}>
            <Link
              to={cta.link}
              className="rounded-full bg-brand-900 px-7 py-3 text-sm font-medium text-white hover:bg-brand-800 transition-colors"
            >
              {cta.label}
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
        <div ref={videoRef} className="relative mx-auto w-full max-w-md overflow-hidden rounded-[2rem] bg-gradient-to-br from-blush-100 to-brand-200 shadow-xl border-4 border-white/50 animate-slow-text" style={{animationDelay: '0.45s'}}>
          <div className={`relative aspect-square w-full bg-brand-900 ${isTransitioning ? 'video-transitioning' : ''}`}>
            {videos.map((video, idx) => (
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
                  loop
                  playsInline
                  preload="auto"
                  className="h-full w-full object-cover"
                />
              </div>
            ))}

            {/* Video Navigation Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 pointer-events-auto z-20">
              {videos.map((_, idx) => (
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

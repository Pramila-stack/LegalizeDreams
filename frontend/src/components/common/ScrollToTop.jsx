import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export default function ScrollToTop() {
  const { pathname, state } = useLocation()
  const scrollTarget = state?.scrollTarget

  useEffect(() => {
    // Give the page a moment to render before scrolling
    const timer = setTimeout(() => {
      if (scrollTarget) {
        // Scroll to specific element
        const target = document.getElementById(scrollTarget)
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      } else {
        // Scroll to top of page
        window.scrollTo(0, 0)
      }
    }, 0)

    return () => clearTimeout(timer)
  }, [pathname, scrollTarget])

  return null
}

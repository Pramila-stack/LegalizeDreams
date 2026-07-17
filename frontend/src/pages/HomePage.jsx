import Hero from '../components/home/Hero'
import VideoCarousel from '../components/home/VideoCarousel'
import CategoryGrid from '../components/home/CategoryGrid'
import FeaturedProducts from '../components/home/FeaturedProducts'
import FaqAccordion from '../components/home/FaqAccordion'

export default function HomePage() {
  return (
    <>
      <Hero />
      <VideoCarousel />
      <CategoryGrid />
      <FeaturedProducts />
      <FaqAccordion />
    </>
  )
}

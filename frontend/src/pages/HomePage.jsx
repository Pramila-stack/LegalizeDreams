import Hero from '../components/home/Hero'
import CategoryGrid from '../components/home/CategoryGrid'
import FeaturedProducts from '../components/home/FeaturedProducts'
import FaqAccordion from '../components/home/FaqAccordion'

export default function HomePage() {
  return (
    <>
      <Hero />
      <CategoryGrid />
      <FeaturedProducts />
      <FaqAccordion />
    </>
  )
}

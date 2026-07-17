import Hero from '../components/home/Hero'
import FeaturedVideo from '../components/home/FeaturedVideo'
import CategoryGrid from '../components/home/CategoryGrid'
import FeaturedProducts from '../components/home/FeaturedProducts'
import FaqAccordion from '../components/home/FaqAccordion'

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedVideo />
      <CategoryGrid />
      <FeaturedProducts />
      <FaqAccordion />
    </>
  )
}

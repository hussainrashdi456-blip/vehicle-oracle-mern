import Hero from '../components/home/Hero'
import Stats from '../components/home/Stats'
import HowItWorks from '../components/home/HowItWorks'
import FeatureGrid from '../components/home/FeatureGrid'
import CTA from '../components/home/CTA'

export default function HomePage() {
  return (
    <>
      <Hero />
      <Stats />
      <HowItWorks />
      <FeatureGrid />
      <CTA />
    </>
  )
}

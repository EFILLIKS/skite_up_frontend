import { useState } from 'react'
import LandingNavbar from '../components/landing/LandingNavbar'
import HeroSection from '../components/landing/HeroSection'
import RoleSection from '../components/landing/RoleSection'
import PlatformIntro from '../components/landing/PlatformIntro'
import FeatureSection from '../components/landing/FeatureSection'
import AIEngineSection from '../components/landing/AIEngineSection'
import DashboardShowcase from '../components/landing/DashboardShowcase'
import StudentJourney from '../components/landing/StudentJourney'
import AnalyticsSection from '../components/landing/AnalyticsSection'
import PlacementReadinessSection from '../components/landing/PlacementReadinessSection'
import ComparisonSection from '../components/landing/ComparisonSection'
import FAQSection from '../components/landing/FAQSection'
import CTASection from '../components/landing/CTASection'
import LandingFooter from '../components/landing/LandingFooter'
import TrustSection from '../components/landing/TrustSection'
import EnquiryForm from '../components/enquiry/EnquiryForm'

export default function LandingPage() {
  const [enquiryOpen, setEnquiryOpen] = useState(false)
  const openEnquiry = () => setEnquiryOpen(true)

  return (
    <>
      <LandingNavbar onContactClick={openEnquiry} />
      <main>
        <HeroSection onContactClick={openEnquiry} />
        <RoleSection />
        <PlatformIntro />
        <StudentJourney />
        <FeatureSection />
        <AIEngineSection />
        <DashboardShowcase />
        <AnalyticsSection />
        <PlacementReadinessSection />
        <ComparisonSection />
        <TrustSection />
        <FAQSection onContactClick={openEnquiry} />
        <CTASection onContactClick={openEnquiry} />
      </main>
      <LandingFooter onContactClick={openEnquiry} />
      <EnquiryForm open={enquiryOpen} onClose={() => setEnquiryOpen(false)} />
    </>
  )
}
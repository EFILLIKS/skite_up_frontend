import { Box } from '@mui/material'
import { faqItems } from '../../data/landingData'
import FAQAccordion from '../common/FAQAccordion'
import SectionContainer from '../common/SectionContainer'
import SectionHeader from '../common/SectionHeader'

interface FAQSectionProps {
  onContactClick: () => void
}

export default function FAQSection({ onContactClick }: FAQSectionProps) {
  return (
    <SectionContainer id="faq" className="faq-section">
      <Box className="faq-layout"><Box className="faq-aside"><SectionHeader eyebrow="Good questions" title="A few things you might be wondering." description="A little more about how SkiteUp fits into your institution." /><button type="button" onClick={onContactClick} className="text-link faq-contact">Talk to our team <span>↗</span></button></Box><Box className="faq-list">{faqItems.map((faq) => <FAQAccordion key={faq.question} {...faq} />)}</Box></Box>
    </SectionContainer>
  )
}
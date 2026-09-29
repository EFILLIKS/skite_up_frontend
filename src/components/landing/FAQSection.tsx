import { Box } from '@mui/material'
import { faqItems } from '../../data/landingData'
import FAQAccordion from '../common/FAQAccordion'
import SectionContainer from '../common/SectionContainer'
import SectionHeader from '../common/SectionHeader'

export default function FAQSection() {
  return (
    <SectionContainer id="faq" className="faq-section">
      <Box className="faq-layout"><Box className="faq-aside"><SectionHeader eyebrow="Good questions" title="A few things you might be wondering." description="A little more about how SkiteUp fits into your institution." /><a href="mailto:info@efilliks.com" className="text-link">Talk to our team <span>↗</span></a></Box><Box className="faq-list">{faqItems.map((faq) => <FAQAccordion key={faq.question} {...faq} />)}</Box></Box>
    </SectionContainer>
  )
}
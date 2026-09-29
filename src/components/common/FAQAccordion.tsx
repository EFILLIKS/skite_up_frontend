import ExpandMoreRounded from '@mui/icons-material/ExpandMoreRounded'
import { Accordion, AccordionDetails, AccordionSummary, Typography } from '@mui/material'

interface FAQAccordionProps {
  question: string
  answer: string
}

export default function FAQAccordion({ question, answer }: FAQAccordionProps) {
  return (
    <Accordion disableGutters elevation={0} className="faq-item">
      <AccordionSummary expandIcon={<ExpandMoreRounded />} aria-label={question}>
        <Typography className="faq-item__question">{question}</Typography>
      </AccordionSummary>
      <AccordionDetails><Typography className="faq-item__answer">{answer}</Typography></AccordionDetails>
    </Accordion>
  )
}
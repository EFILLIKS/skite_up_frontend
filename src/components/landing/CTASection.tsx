import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded'
import AutoAwesomeRounded from '@mui/icons-material/AutoAwesomeRounded'
import { Box, Typography } from '@mui/material'
import { Link } from 'react-router-dom'
import SectionContainer from '../common/SectionContainer'

interface CTASectionProps {
  onContactClick: () => void
}

export default function CTASection({ onContactClick }: CTASectionProps) {
  return (
    <SectionContainer className="cta-section">
      <div className="cta-pattern" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /><i /><i /></div>
      <Box className="cta-content"><span className="cta-kicker"><AutoAwesomeRounded /> THE FUTURE OF LEARNING, CONNECTED</span><Typography component="h2">Bring Your Entire<br /><span>Education Ecosystem Together.</span></Typography><Typography className="cta-description">Learning, assessments, coding, AI evaluation, analytics and placement readiness — connected in one intelligent platform.</Typography><div className="cta-actions"><Link to="/login" className="cta-button">Launch SkiteUp <ArrowForwardRounded /></Link><button type="button" onClick={onContactClick} className="cta-contact">Contact Us</button></div></Box>
      <div className="cta-side-note"><span>SKITEUP / 2026</span><b>One intelligent<br />education ecosystem.</b></div>
    </SectionContainer>
  )
}
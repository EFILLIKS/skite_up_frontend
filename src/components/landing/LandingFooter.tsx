import ArrowOutwardRounded from '@mui/icons-material/ArrowOutwardRounded'
import { Box, Container, Typography } from '@mui/material'
import { footerGroups } from '../../data/landingData'
import BrandLockup from '../common/Branding'

interface LandingFooterProps {
  onContactClick: () => void
}

const footerTargets: Record<string, string> = {
  'Learning Management': '#features',
  'Assessment Player': '#features',
  'Coding Sandbox': '#features',
  'AI LSRW Lab': '#features',
  'Analytics & Insights': '#analytics',
  'Placement Readiness': '#analytics',
  'For Organizations': '#solutions',
  'For Administrators': '#solutions',
  'For Students': '#solutions',
  'About Us': '#platform',
  'Privacy Policy': '#privacy',
}

export default function LandingFooter({ onContactClick }: LandingFooterProps) {
  return (
    <Box component="footer" className="site-footer">
      <Container maxWidth="lg">
        <div className="footer-main"><div className="footer-brand"><a href="#home" className="brand" aria-label="SKITEUP home"><BrandLockup /></a><Typography>SkiteUp is a next-generation AI-powered educational ecosystem that connects learning, assessments, coding, LSRW evaluation, analytics and placement readiness in one unified platform.</Typography></div>{footerGroups.map((group) => <div className="footer-nav" key={group.title}><span>{group.title.toUpperCase()}</span>{group.links.map((label) => label === 'Contact' ? <button type="button" className="footer-contact-trigger" key={label} onClick={onContactClick}>{label}<ArrowOutwardRounded fontSize="inherit" /></button> : <a href={footerTargets[label]} key={label}>{label}<ArrowOutwardRounded fontSize="inherit" /></a>)}</div>)}<div className="footer-contact"><span>CONTACT</span><b>Efilliks</b><Typography component="p">info@efilliks.com</Typography></div></div>
        <div className="footer-bottom"><span>© 2026 SkiteUp. All rights reserved.</span><span>One intelligent education ecosystem.</span></div>
      </Container>
    </Box>
  )
}
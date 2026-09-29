import ArrowOutwardRounded from '@mui/icons-material/ArrowOutwardRounded'
import { Box, Container, Typography } from '@mui/material'
import { footerGroups } from '../../data/landingData'
import BrandLockup from '../common/Branding'

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
  Contact: 'mailto:info@efilliks.com',
  'Privacy Policy': '#privacy',
}

export default function LandingFooter() {
  return (
    <Box component="footer" className="site-footer">
      <Container maxWidth="lg">
        <div className="footer-main"><div className="footer-brand"><a href="#home" className="brand" aria-label="SKITEUP home"><BrandLockup /></a><Typography>SkiteUp is a next-generation AI-powered educational ecosystem that connects learning, assessments, coding, LSRW evaluation, analytics and placement readiness in one unified platform.</Typography></div>{footerGroups.map((group) => <div className="footer-nav" key={group.title}><span>{group.title.toUpperCase()}</span>{group.links.map((label) => <a href={footerTargets[label]} key={label}>{label}<ArrowOutwardRounded fontSize="inherit" /></a>)}</div>)}<div className="footer-contact"><span>CONTACT</span><b>Efilliks</b><a href="mailto:info@efilliks.com">info@efilliks.com <ArrowOutwardRounded /></a></div></div>
        <div className="footer-bottom"><span>© 2026 SkiteUp. All rights reserved.</span><span>One intelligent education ecosystem.</span></div>
      </Container>
    </Box>
  )
}
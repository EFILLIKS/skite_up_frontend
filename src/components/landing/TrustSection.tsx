import { Box, Typography } from '@mui/material'
import { trustAudiences } from '../../data/landingData'
import IconGlyph from '../common/IconGlyph'
import SectionContainer from '../common/SectionContainer'

export default function TrustSection() {
  return (
    <SectionContainer className="trust-section">
      <Box className="trust-strip"><div className="trust-strip__intro"><small>BUILT FOR MODERN INSTITUTIONS</small><Typography component="b">One ecosystem. Every team.</Typography></div>{trustAudiences.map((audience) => <div className="trust-item" key={audience.label}><IconGlyph name={audience.icon} /><span>{audience.label}</span></div>)}</Box>
    </SectionContainer>
  )
}
import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded'
import AutoAwesomeRounded from '@mui/icons-material/AutoAwesomeRounded'
import { Box, Typography } from '@mui/material'
import AppButton from '../common/AppButton'
import SectionContainer from '../common/SectionContainer'
import IconGlyph from '../common/IconGlyph'
import ProductSlider from '../common/ProductSlider'
import ProductVisual from '../common/ProductVisual'
import { BrandMark } from '../common/Branding'
import { heroEcosystemModules, heroProductSlides, heroStats } from '../../data/landingData'

interface HeroSectionProps {
  onContactClick: () => void
}

export default function HeroSection({ onContactClick }: HeroSectionProps) {
  return (
    <SectionContainer id="home" className="hero-section">
      <Box className="hero-layout">
        <Box className="hero-copy">
          <span className="hero-kicker"><AutoAwesomeRounded fontSize="small" /> EDUCATION, CONNECTED</span>
          <Typography component="h1">Empowering Institutions with <span>AI Intelligence</span></Typography>
          <Typography className="hero-description">One intelligent platform connecting learning, assessments, coding, LSRW evaluation, analytics and placement readiness.</Typography>
          <Box className="hero-actions">
            <AppButton href="#platform" endIcon={<ArrowForwardRounded />}>Explore SkiteUp</AppButton>
            <button type="button" onClick={onContactClick} className="hero-secondary-link">Contact us <ArrowForwardRounded fontSize="small" /></button>
          </Box>
          <Box className="hero-proof"><span className="avatar-stack"><i>R</i><i>A</i><i>M</i><i>+</i></span><span><b>Built for every learner</b><small>One connected academic experience</small></span></Box>
        </Box>
        <Box className="hero-art hero-art--ecosystem" aria-label="Learning, assessment, coding, AI LSRW, analytics and placement connected through the SkiteUp platform" role="img">
          <div className="hero-art__orbit hero-art__orbit--one" />
          <div className="hero-art__orbit hero-art__orbit--two" />
          <div className="ecosystem-hub"><span className="ecosystem-hub__mark"><BrandMark /></span><small>ONE INTELLIGENT</small><b>SKITEUP AI<br />Education Platform</b><span className="ecosystem-hub__status"><i /> CONNECTED ECOSYSTEM</span></div>
          {heroEcosystemModules.map((module, index) => <div className={`ecosystem-node ecosystem-node--${index + 1}`} key={module.label}><span><IconGlyph name={module.icon} /></span><b>{module.label}</b></div>)}
          {heroStats.map((stat, index) => <div className={`ecosystem-stat ecosystem-stat--${index + 1}`} key={stat.label}><b>{stat.value}</b><span>{stat.label}</span></div>)}
          <div className="hero-art__caption"><span className="live-dot" /> The whole journey, connected</div>
        </Box>
      </Box>
      <Box className="hero-bottomline"><span>ONE PLATFORM.</span><i /><span>EVERY ROLE.</span><i /><span>MEASURABLE GROWTH.</span></Box>
      <ProductSlider title="SkiteUp product tour" slides={heroProductSlides} renderVisual={(slide) => <ProductVisual slide={slide} />} className="hero-product-slider" interval={5200} />
    </SectionContainer>
  )
}
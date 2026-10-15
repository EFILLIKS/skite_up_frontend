import { useState } from 'react'
import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded'
import { Box, ButtonBase, Paper, Typography } from '@mui/material'
import { featureSlides, lsrwScores, platformModules } from '../../data/landingData'
import IconGlyph from '../common/IconGlyph'
import ProductSlider from '../common/ProductSlider'
import ProductVisual from '../common/ProductVisual'
import SectionContainer from '../common/SectionContainer'
import SectionHeader from '../common/SectionHeader'

export default function FeatureSection() {
  const [activeModule, setActiveModule] = useState(0)
  const module = platformModules[activeModule]

  return (
    <SectionContainer id="features" className="feature-section modules-section">
      <SectionHeader eyebrow="The institutional operating system" title="Everything Your Institution Needs. One Intelligent Platform." description="Connected modules work together across learning, assessment, coding, communication and career readiness." />
      <Box className="module-explorer">
        <div className="module-selector" role="tablist" aria-label="Platform modules">
          {platformModules.map((item, index) => (
            <ButtonBase key={item.number} className={`module-selector__item ${activeModule === index ? 'is-active' : ''}`} role="tab" aria-selected={activeModule === index} onClick={() => setActiveModule(index)}>
              <span className="module-selector__icon"><IconGlyph name={item.icon} /></span><span><small>{item.number}</small><b>{item.title}</b></span><ArrowForwardRounded className="module-selector__arrow" />
            </ButtonBase>
          ))}
        </div>
        <Paper elevation={0} className={`module-detail module-detail--${module.tone}`} role="tabpanel">
          <div className="module-detail__index">MODULE / {module.number}</div>
          <span className="module-detail__icon"><IconGlyph name={module.icon} /></span>
          <Typography component="h3">{module.title}</Typography>
          <Typography className="module-detail__description">{module.description}</Typography>
          <ul>{module.details.map((detail) => <li key={detail}><span>+</span>{detail}</li>)}</ul>
          {activeModule === 3 && <div className="lsrw-score-row">{lsrwScores.map((score) => <div key={score.label}><small>{score.label}</small><b>{score.score}</b></div>)}</div>}
          {activeModule === 4 && <div className="module-flow">{['Speaking', 'AI transcription', 'Language analysis', 'Score + feedback'].map((step, index) => <span key={step}><b>{step}</b>{index < 3 && <i>→</i>}</span>)}</div>}
          <span className="module-detail__watermark">{module.number}</span>
        </Paper>
      </Box>
      <div className="feature-product-tour"><div className="feature-product-tour__heading"><span>SEE IT IN ACTION</span><b>Made for real academic work.</b></div><ProductSlider title="Core platform modules" slides={featureSlides} renderVisual={(slide) => <ProductVisual slide={slide} />} className="feature-product-slider" /></div>
    </SectionContainer>
  )
}
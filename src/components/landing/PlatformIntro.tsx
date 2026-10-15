import AutoAwesomeRounded from '@mui/icons-material/AutoAwesomeRounded'
import { Box, Paper, Typography } from '@mui/material'
import { platformTransformation } from '../../data/landingData'
import IconGlyph from '../common/IconGlyph'
import { BrandMark } from '../common/Branding'
import SectionContainer from '../common/SectionContainer'
import SectionHeader from '../common/SectionHeader'

const introMetrics = [
  { value: '01', label: 'Connected ecosystem' },
  { value: '360°', label: 'Student visibility' },
  { value: 'AI', label: 'Actionable feedback' },
]

export default function PlatformIntro() {
  return (
    <SectionContainer id="platform" className="intro-section">
      <Box className="intro-layout">
        <Box className="intro-copy">
          <SectionHeader eyebrow="Meet SkiteUp" title="One intelligent education ecosystem." description="SkiteUp is a next-generation AI-powered educational ecosystem built for modern institutions. It brings learning management, assessments, coding environments, AI-powered language evaluation, performance analytics, and placement readiness into one unified platform." />
          <p className="intro-disconnected-copy">No more disconnected systems for learning management, assessments, coding tests, LSRW evaluation, student performance, analytics and placement preparation. Everything is connected through one intelligent platform.</p>
          <Box className="intro-metrics">{introMetrics.map((item) => <div key={item.label}><b>{item.value}</b><span>{item.label}</span></div>)}</Box>
          <a href="#features" className="text-link intro-link">Get to know the platform <span>↗</span></a>
        </Box>
        <Box className="intro-visual intro-visual--transform">
          <div className="transformation-flow"><div className="transformation-sources"><span className="transformation-caption">YOUR CURRENT TOOLKIT</span>{platformTransformation.map((item) => <div className="transformation-source" key={item.label}><IconGlyph name={item.icon} /><span>{item.label}</span><i>↗</i></div>)}</div><div className="transformation-converge"><span /><span /><span /><AutoAwesomeRounded /></div><Paper elevation={0} className="transformation-result"><span className="transformation-result__mark"><BrandMark /></span><small>ONE CONNECTED PLATFORM</small><b>SKITEUP</b><span>One intelligent education ecosystem.</span><i className="transformation-result__pulse" /></Paper></div>
          <Paper elevation={0} className="intro-panel intro-panel--compact">
            <div className="intro-panel__header"><span>ACADEMIC PULSE</span><span className="live-label"><i /> LIVE DATA</span></div>
            <Typography component="h3">A clearer view of progress.</Typography>
            <div className="intro-panel__chart">
              <div className="intro-panel__axis"><span>100</span><span>75</span><span>50</span><span>25</span></div>
              <div className="intro-panel__plot"><div className="intro-panel__gridlines"><i /><i /><i /><i /></div><svg viewBox="0 0 480 180" preserveAspectRatio="none" aria-label="Student progress rises over the semester"><defs><linearGradient id="areaFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#4F46E5" stopOpacity=".22" /><stop offset="1" stopColor="#4F46E5" stopOpacity="0" /></linearGradient></defs><path d="M0 151 C40 140 45 111 88 119 S145 94 183 104 S225 72 267 86 S320 61 354 65 S414 24 480 19 L480 180 L0 180 Z" fill="url(#areaFill)" /><path d="M0 151 C40 140 45 111 88 119 S145 94 183 104 S225 72 267 86 S320 61 354 65 S414 24 480 19" fill="none" stroke="#4F46E5" strokeWidth="3" vectorEffect="non-scaling-stroke" /></svg><div className="intro-panel__months"><span>MAR</span><span>APR</span><span>MAY</span><span>JUN</span><span>JUL</span><span>AUG</span></div></div>
            </div>
            <div className="intro-panel__footer"><span><i className="legend-dot" /> Performance index</span><span>+18.4% <AutoAwesomeRounded fontSize="small" /></span></div>
          </Paper>
          <div className="intro-note"><span><AutoAwesomeRounded /></span><div><b>From activity to insight</b><small>Every learner’s next step, made visible.</small></div></div>
        </Box>
      </Box>
    </SectionContainer>
  )
}
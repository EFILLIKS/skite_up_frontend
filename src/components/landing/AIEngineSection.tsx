import { useState } from 'react'
import AutoAwesomeRounded from '@mui/icons-material/AutoAwesomeRounded'
import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded'
import GraphicEqRounded from '@mui/icons-material/GraphicEqRounded'
import { Box, ButtonBase, LinearProgress, Paper } from '@mui/material'
import { assessmentIntegrations, evaluationModes, type EvaluationMode } from '../../data/landingData'
import IconGlyph from '../common/IconGlyph'
import SectionContainer from '../common/SectionContainer'
import SectionHeader from '../common/SectionHeader'

export default function AIEngineSection() {
  const [activeMode, setActiveMode] = useState<EvaluationMode>('Speaking')
  const mode = evaluationModes.find((item) => item.title === activeMode) ?? evaluationModes[0]

  return (
    <SectionContainer className="ai-section ai-studio-section">
      <Box className="ai-section__glow" />
      <Box className="ai-section__layout">
        <Box className="ai-section__intro"><SectionHeader eyebrow="Intelligence that evaluates" title="AI That Understands More Than Answers." description="Speaking, writing and coding each need a different kind of evaluation. Choose a response type to see how SkiteUp turns student work into useful, specific feedback." light /><div className="ai-section__footnote"><AutoAwesomeRounded /><span>One engine. Context-aware evaluation.<br />Feedback students can act on.</span></div></Box>
        <Box className="evaluation-studio">
          <div className="evaluation-mode-tabs" role="tablist" aria-label="AI evaluation modes">{evaluationModes.map((item) => <ButtonBase key={item.title} className={`evaluation-mode-tab ${activeMode === item.title ? 'is-active' : ''}`} role="tab" aria-selected={activeMode === item.title} onClick={() => setActiveMode(item.title)}><IconGlyph name={item.icon} /><span>{item.title}</span></ButtonBase>)}</div>
          <Paper elevation={0} className="evaluation-workspace" role="tabpanel" key={activeMode}>
            <div className="evaluation-workspace__head"><div><span>AI EVALUATION / {activeMode.toUpperCase()}</span><b>{mode.subtitle}</b></div><span className="evaluation-workspace__complete"><CheckCircleRounded /> COMPLETE</span></div>
            {activeMode === 'Speaking' && <div className="evaluation-artifact evaluation-artifact--speaking"><div className="evaluation-waveform"><span className="evaluation-waveform__play"><GraphicEqRounded /></span><div>{Array.from({ length: 42 }, (_, index) => <i key={index} style={{ height: `${9 + ((index * 19) % 33)}px` }} />)}</div><small>00:42</small></div><div className="evaluation-transcript"><small>TRANSCRIPT</small><p>“Technology helps us learn in ways that feel more <b>personal and engaging</b>...”</p></div></div>}
            {activeMode === 'Writing' && <div className="evaluation-artifact evaluation-artifact--writing"><div className="evaluation-essay"><span>STUDENT ESSAY · 248 WORDS</span><p>Digital learning gives students more ways to explore new ideas. It can make lessons <mark>personalized</mark> and help learners practice at their own pace.</p><p>When teachers combine useful tools with thoughtful guidance, students can build confidence and <mark>communicate clearly</mark>.</p></div><div className="evaluation-feedback"><AutoAwesomeRounded /><span><b>Clear, well-structured response</b><small>Consider supporting your second point with a specific example.</small></span></div></div>}
            {activeMode === 'Coding' && <div className="evaluation-artifact evaluation-artifact--coding"><div className="evaluation-code__top"><span>Python 3.12⌄</span><b><i /> Run complete</b></div><div className="evaluation-code__lines">{['def solve(values):', '    best = 0', '    for item in values:', '        best = max(best, item)', '    return best'].map((line, index) => <code key={line}><small>{String(index + 1).padStart(2, '0')}</small>{line}</code>)}</div><div className="evaluation-tests">{['Test 01', 'Test 02', 'Test 03'].map((test) => <span key={test}><CheckCircleRounded />{test}</span>)}<b>{mode.score}</b></div></div>}
            <div className="evaluation-workspace__scores">{mode.details.map((detail) => <div key={detail.label}><span>{detail.label}</span><b>{detail.value}<small>{activeMode === 'Coding' && detail.label === 'Test cases' ? '' : '/ 10'}</small></b><LinearProgress variant="determinate" value={detail.progress} /></div>)}</div>
          </Paper>
        </Box>
      </Box>
      <div className="integration-strip"><span className="integration-strip__label">POWERED BY</span>{assessmentIntegrations.map((integration) => <div className="integration-item" key={integration.name}><b>{integration.name}</b><small>{integration.detail}</small></div>)}</div>
    </SectionContainer>
  )
}
import { useState } from 'react'
import { Box, ButtonBase, LinearProgress, Paper, Typography } from '@mui/material'
import { analyticsViews, type AnalyticsView } from '../../data/landingData'
import SectionContainer from '../common/SectionContainer'
import SectionHeader from '../common/SectionHeader'

const views: AnalyticsView[] = ['Students', 'Departments', 'Assessments', 'Placement']
const readiness = [
  { label: 'Coding skills', value: 92, color: 'blue' },
  { label: 'Communication', value: 87, color: 'magenta' },
  { label: 'Aptitude', value: 78, color: 'blue' },
  { label: 'Academic performance', value: 84, color: 'magenta' },
]

export default function AnalyticsSection() {
  const [activeView, setActiveView] = useState<AnalyticsView>('Students')
  const selected = analyticsViews[activeView]

  return (
    <SectionContainer id="analytics" className="analytics-section">
      <Box className="analytics-heading"><SectionHeader eyebrow="Institutional intelligence" title="See progress. Spot what’s next." description="From an individual skill gap to a department-wide trend, make performance visible and actionable." /><span className="analytics-heading__stamp">INSIGHTS / LIVE</span></Box>
      <Paper elevation={0} className="analytics-board">
        <div className="analytics-board__top"><div><span className="analytics-board__eyebrow">PERFORMANCE INTELLIGENCE</span><Typography component="h3">Analytics &amp; insights</Typography></div><div className="analytics-period">This semester <span>⌄</span></div></div>
        <div className="analytics-tabs" role="tablist" aria-label="Analytics views">{views.map((view) => <ButtonBase key={view} className={`analytics-tabs__item ${activeView === view ? 'is-active' : ''}`} role="tab" aria-selected={activeView === view} onClick={() => setActiveView(view)}>{view}</ButtonBase>)}</div>
        <div className="analytics-board__body">
          <Paper elevation={0} className="analytics-chart-card" role="tabpanel">
            <div className="analytics-chart-card__head"><div><small>{selected.label}</small><b>{selected.value}</b><span>↗ {selected.change}</span></div><div className="analytics-chart-legend"><i /> Performance index</div></div>
            <div className="analytics-chart"><div className="analytics-chart__scale"><span>100</span><span>75</span><span>50</span><span>25</span></div><div className="analytics-chart__plot"><div className="analytics-chart__grid"><i /><i /><i /><i /></div><div className="analytics-chart__bars">{selected.bars.map((height, index) => <span key={`${activeView}-${index}`} style={{ height: `${height}%` }} className={index === selected.bars.length - 1 ? 'is-current' : ''} />)}</div></div></div>
            <div className="analytics-chart__labels"><span>MAR</span><span>APR</span><span>MAY</span><span>JUN</span><span>JUL</span><span>AUG</span></div>
          </Paper>
          <Paper elevation={0} className="readiness-card"><div className="readiness-card__head"><div><span>PLACEMENT READINESS</span><b>78%</b></div><div className="readiness-ring"><span>78<small>%</small></span></div></div><Typography>Skills moving in the right direction</Typography><div className="readiness-breakdown">{readiness.map((item) => <div className="readiness-row" key={item.label}><span>{item.label}</span><b>{item.value}%</b><LinearProgress className={`readiness-row--${item.color}`} variant="determinate" value={item.value} aria-label={`${item.label} ${item.value}%`} /></div>)}</div><div className="readiness-insight"><span>↗</span><p><b>Communication is up 8%</b><br />compared with the previous term.</p></div></Paper>
        </div>
        <div className="analytics-board__footer"><span>TRACKING <b>8 CORE INDICATORS</b></span><span>Student · Department · Assessment · Coding · LSRW · Attendance · Trends · Placement</span></div>
      </Paper>
    </SectionContainer>
  )
}
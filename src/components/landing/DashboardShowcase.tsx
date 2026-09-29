import { useState } from 'react'
import AutoAwesomeRounded from '@mui/icons-material/AutoAwesomeRounded'
import NotificationsNoneRounded from '@mui/icons-material/NotificationsNoneRounded'
import SearchRounded from '@mui/icons-material/SearchRounded'
import { Box, Paper, Typography } from '@mui/material'
import { dashboardModules, dashboardStats, studentPerformanceViews, studentProductSlides, studentStats, upcomingAssessments } from '../../data/landingData'
import IconGlyph from '../common/IconGlyph'
import ProductSlider from '../common/ProductSlider'
import ProductVisual from '../common/ProductVisual'
import SectionContainer from '../common/SectionContainer'
import SectionHeader from '../common/SectionHeader'
import StatCard from '../common/StatCard'
import BrandLockup from '../common/Branding'

const moduleIcons = ['book', 'code', 'language', 'ai', 'person', 'chart', 'trend', 'groups'] as const
export default function DashboardShowcase() {
  const [activePerformance, setActivePerformance] = useState(0)
  const performance = studentPerformanceViews[activePerformance]

  return (
    <SectionContainer id="dashboard" className="showcase-section">
      <SectionHeader eyebrow="A connected student experience" title="ONE PLATFORM. EVERY ROLE" description="One platform. Every role. A connected academic experience." align="center" />
      <Box className="showcase-stats">{dashboardStats.map((stat) => <StatCard key={stat.label} {...stat} />)}</Box>
      <Paper elevation={0} className="student-dashboard">
        <aside className="student-dashboard__sidebar"><a href="#home" className="student-dashboard__brand" aria-label="SKITEUP home"><BrandLockup /></a><span className="student-dashboard__side-label">WORKSPACE</span><nav aria-label="Student dashboard preview">{dashboardModules.map((module, index) => <a href="#dashboard" key={module} className={index === 0 ? 'active' : ''}><IconGlyph name={moduleIcons[index]} />{module}</a>)}</nav><div className="student-dashboard__support"><span>?</span><div><b>Need a hand?</b><small>Visit student support</small></div></div></aside>
        <div className="student-dashboard__main">
          <header className="student-dashboard__topbar"><div><span className="dashboard-breadcrumb">Student workspace / Overview</span></div><div className="student-dashboard__tools"><button aria-label="Search"><SearchRounded /></button><button aria-label="Notifications"><NotificationsNoneRounded /></button><span className="student-avatar">R</span></div></header>
          <div className="student-dashboard__welcome"><div><span className="welcome-date">MONDAY, 12 AUGUST 2024</span><Typography component="h2">Good Morning, Ramya! <span aria-hidden="true">👋</span></Typography><p>You’re building great momentum. Keep it going.</p></div><div className="student-dashboard__streak"><span>✦</span><b>08</b><small>DAY STREAK</small></div></div>
          <div className="student-dashboard__stats">{studentStats.map((stat, index) => <div className="student-mini-stat" key={stat.label}><span className={`student-mini-stat__icon student-mini-stat__icon--${index}`}><IconGlyph name={moduleIcons[index === 0 ? 5 : index === 1 ? 0 : index === 2 ? 1 : 3]} /></span><small>{stat.label}</small><b>{stat.value}</b><em>{stat.note}</em></div>)}</div>
          <div className="student-dashboard__content">
            <Paper elevation={0} className="student-panel progress-panel"><div className="student-panel__head"><div><b>Performance overview</b><small>{performance.label}</small></div><span className="performance-current">{performance.score}</span></div><div className="performance-tabs" role="tablist" aria-label="Student performance metrics">{studentPerformanceViews.map((view, index) => <button type="button" key={view.label} className={activePerformance === index ? 'is-active' : ''} aria-selected={activePerformance === index} role="tab" onClick={() => setActivePerformance(index)}>{view.label}</button>)}</div><div className="progress-summary"><div><span>{performance.label.toUpperCase()}</span><b>{performance.score}<small /></b><em>↗ 4.2% <small>vs last month</small></em></div><div className="progress-donut"><span><b>{performance.score}</b><small>Current score</small></span></div></div><div className="progress-legend"><span><i />Completed</span><span><i />In progress</span></div><div className="student-bars" aria-label={`${performance.label} trend chart`}>{performance.bars.map((height, index) => <span key={`${activePerformance}-${index}`} style={{ height: `${height}%` }} />)}</div><div className="student-bars__labels"><span>MAR</span><span>MAY</span><span>JUL</span><span>AUG</span></div></Paper>
            <Paper elevation={0} className="student-panel upcoming-panel"><div className="student-panel__head"><div><b>Upcoming assessments</b><small>Your next milestones</small></div><button aria-label="View all assessments">•••</button></div>{upcomingAssessments.map((assessment, index) => <div className="assessment-row" key={assessment.title}><span className={`assessment-row__mark assessment-row__mark--${assessment.color}`}><AutoAwesomeRounded /></span><span className="assessment-row__details"><b>{assessment.title}</b><small>{assessment.date}</small></span><span className="assessment-row__time"><b>{assessment.time}</b><small>{['Coding', 'AI Audio', 'Placement'][index]}</small></span></div>)}<button className="assessment-all">See all assessments <span>→</span></button></Paper>
          </div>
        </div>
      </Paper>
      <div className="student-product-tour"><div className="student-product-tour__heading"><span>EXPLORE YOUR LEARNING SPACE</span><b>One student workspace. Many ways forward.</b></div><ProductSlider title="Student workspace" slides={studentProductSlides} renderVisual={(slide) => <ProductVisual slide={slide} />} className="student-product-slider" interval={5800} /></div>
    </SectionContainer>
  )
}
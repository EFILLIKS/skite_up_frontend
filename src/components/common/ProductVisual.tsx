import AutoAwesomeRounded from '@mui/icons-material/AutoAwesomeRounded'
import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded'
import CodeRounded from '@mui/icons-material/CodeRounded'
import GraphicEqRounded from '@mui/icons-material/GraphicEqRounded'
import { LinearProgress, Paper } from '@mui/material'
import type { ProductSlideData } from '../../data/landingData'

const syntaxLines = [
  <><i>def</i> <b>max_pair_sum</b>(values):</>,
  <>    best = <em>0</em></>,
  <>    <i>for</i> index <i>in</i> <b>range</b>(len(values) - <em>1</em>):</>,
  <>        best = <b>max</b>(best, values[index] + values[index + <em>1</em>])</>,
  <>    <i>return</i> best</>,
]

const barHeights = [36, 49, 42, 61, 55, 70, 66, 80, 76, 93, 87, 100]

interface ProductVisualProps {
  slide: ProductSlideData
}

export default function ProductVisual({ slide }: ProductVisualProps) {
  return (
    <Paper elevation={0} className={`product-visual product-visual--${slide.visual}`}>
      <div className="product-visual__chrome"><span className="product-visual__brand"><i /> SKITEUP</span><span className="product-visual__crumb">{slide.title}</span><span className="product-visual__avatar">R</span></div>
      {slide.visual === 'coding' ? <CodingVisual /> : null}
      {slide.visual === 'lsrw' ? <LsrwVisual /> : null}
      {slide.visual === 'analytics' ? <AnalyticsVisual /> : null}
      {slide.visual === 'placement' ? <PlacementVisual /> : null}
      {slide.visual === 'learning' ? <LearningVisual /> : null}
      {slide.visual === 'assessment' ? <AssessmentVisual /> : null}
      {slide.visual === 'portfolio' ? <PortfolioVisual /> : null}
      {slide.visual === 'leaderboard' ? <LeaderboardVisual /> : null}
      {slide.visual === 'student' ? <StudentVisual /> : null}
      <div className="product-visual__callout"><span><AutoAwesomeRounded /></span><b>{slide.metric}</b><small>{slide.metricLabel}</small></div>
    </Paper>
  )
}

function CodingVisual() {
  return (
    <div className="mock-coding"><div className="mock-coding__head"><div><span className="mock-coding__language">Python⌄</span><span className="mock-coding__language">Java⌄</span><span className="mock-coding__language">C++⌄</span><span className="mock-coding__language">JS⌄</span></div><button type="button"><span /> Run code</button></div><div className="mock-coding__body"><div className="mock-coding__editor">{syntaxLines.map((line, index) => <div key={index}><small>{String(index + 1).padStart(2, '0')}</small><code>{line}</code></div>)}</div><div className="mock-coding__tests"><b>Test cases</b>{['Case 01', 'Case 02', 'Case 03'].map((test) => <span key={test}><CheckCircleRounded />{test}</span>)}<strong>10 / 10 <small>passed</small></strong></div></div></div>
  )
}

function LsrwVisual() {
  const scores = [{ label: 'Fluency', value: 92 }, { label: 'Grammar', value: 85 }, { label: 'Vocabulary', value: 89 }, { label: 'Pronunciation', value: 91 }]
  return (
    <div className="mock-lsrw"><div className="mock-lsrw__audio"><span className="mock-lsrw__play"><GraphicEqRounded /></span><div className="mock-lsrw__wave">{Array.from({ length: 36 }, (_, index) => <i key={index} style={{ height: `${12 + ((index * 17) % 28)}px` }} />)}</div><span className="mock-lsrw__time">00:42</span></div><div className="mock-lsrw__transcript"><small>STUDENT RESPONSE</small><p>“Technology helps us to learn in ways that feel more personal and engaging...”</p><span className="mock-lsrw__analyzing"><i /> Analysis complete</span></div><div className="mock-lsrw__scores">{scores.map((score) => <div key={score.label}><span>{score.label}</span><b>{score.value}%</b><LinearProgress variant="determinate" value={score.value} /></div>)}</div></div>
  )
}

function AnalyticsVisual() {
  return (
    <div className="mock-analytics"><div className="mock-analytics__kpis">{[{ label: 'Students', value: '2,840' }, { label: 'Performance', value: '87%' }, { label: 'Readiness', value: '78%' }].map((item) => <div key={item.label}><small>{item.label}</small><b>{item.value}</b></div>)}</div><div className="mock-analytics__chart"><div className="mock-analytics__axis"><i /><i /><i /></div><div className="mock-analytics__bars">{barHeights.map((height, index) => <span key={index} style={{ height: `${height}%` }} />)}</div></div><div className="mock-analytics__labels"><span>MAR</span><span>MAY</span><span>JUL</span><span>AUG</span></div><div className="mock-analytics__legend"><i /> Student progress over time <span>↗ 12.4%</span></div></div>
  )
}

function PlacementVisual() {
  return (
    <div className="mock-placement"><div className="mock-placement__profile"><span>RS</span><div><b>Ramya S.</b><small>Computer Science · Year 3</small></div><em>TRACKING</em></div><div className="mock-placement__body"><div className="mock-placement__factors">{[['Coding', '92%'], ['Communication', '87%'], ['Aptitude', '84%'], ['Academic', '89%']].map(([label, value]) => <div key={label}><small>{label}</small><b>{value}</b></div>)}</div><div className="mock-placement__ring"><span>78<small>%</small><i>READY</i></span></div></div><div className="mock-placement__foot"><AutoAwesomeRounded /> Aptitude is the next opportunity to improve</div></div>
  )
}

function LearningVisual() {
  return (
    <div className="mock-learning"><div className="mock-learning__welcome"><span>YOUR LEARNING SPACE</span><b>Good morning, Ramya</b><small>Pick up where you left off.</small></div><div className="mock-learning__courses">{[{ title: 'Data Structures', progress: 72, color: 'blue' }, { title: 'Communication Skills', progress: 48, color: 'magenta' }, { title: 'Quantitative Aptitude', progress: 86, color: 'blue' }].map((course) => <div key={course.title}><span className={`mock-learning__course-icon mock-learning__course-icon--${course.color}`}><CodeRounded /></span><span><b>{course.title}</b><small>{course.progress}% complete</small><LinearProgress variant="determinate" value={course.progress} /></span><i>→</i></div>)}</div><div className="mock-learning__upnext"><span>UP NEXT</span><b>Assignment · Algorithms</b><small>Due tomorrow · 11:59 PM</small></div></div>
  )
}

function AssessmentVisual() {
  return (
    <div className="mock-assessment"><div className="mock-assessment__score"><div><small>ASSESSMENT RESULT</small><b>84<span>%</span></b><em>Above class average ↗</em></div><div className="mock-assessment__ring"><span>84%</span></div></div><div className="mock-assessment__rows">{[['Problem solving', '9 / 10'], ['Time management', '8 / 10'], ['Concept clarity', '8 / 10']].map(([label, value]) => <div key={label}><span><CheckCircleRounded />{label}</span><b>{value}</b></div>)}</div><div className="mock-assessment__feedback"><AutoAwesomeRounded /><span><b>Strong work on problem solving.</b><small>Review time complexity for your next attempt.</small></span></div></div>
  )
}

function PortfolioVisual() {
  return (
    <div className="mock-portfolio"><div className="mock-portfolio__profile"><span>RS</span><div><b>Ramya S.</b><small>Computer Science · Class of 2026</small></div><button type="button">Share ↗</button></div><div className="mock-portfolio__headline"><small>LEARNING PORTFOLIO</small><b>Progress worth showing.</b></div><div className="mock-portfolio__projects">{[['Code', 'Campus Connect API'], ['Award', 'DSA Challenge · Top 5%'], ['Learning', 'Full Stack Foundations']].map(([tag, name]) => <div key={name}><span>{tag}</span><b>{name}</b><i>↗</i></div>)}</div></div>
  )
}

function LeaderboardVisual() {
  return (
    <div className="mock-leaderboard"><div className="mock-leaderboard__heading"><span>DEPARTMENT LEADERBOARD</span><b>This month⌄</b></div>{[['01', 'Arjun K.', '96%', 'gold'], ['02', 'Meera R.', '93%', 'silver'], ['03', 'Dev P.', '91%', 'bronze'], ['04', 'Ramya S.', '89%', 'current']].map(([place, name, score, rank]) => <div className={`mock-leaderboard__row mock-leaderboard__row--${rank}`} key={place}><span>{place}</span><i>{name.slice(0, 1)}</i><b>{name}</b><em>{score}</em></div>)}</div>
  )
}

function StudentVisual() {
  return (
    <div className="mock-student"><div className="mock-student__greeting"><span>MONDAY, 12 AUGUST</span><b>Good morning, Ramya! 👋</b><small>Your learning is moving forward.</small></div><div className="mock-student__stats">{[['Overall score', '87%'], ['Tests done', '12 / 15'], ['Coding score', '92%']].map(([label, value]) => <div key={label}><small>{label}</small><b>{value}</b></div>)}</div><div className="mock-student__bottom"><div className="mock-student__chart">{barHeights.map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}</div><div className="mock-student__next"><small>NEXT UP</small><b>DSA Assessment</b><span>Tomorrow · 10:00 AM</span><em>Open schedule →</em></div></div></div>
  )
}
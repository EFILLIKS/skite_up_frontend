import { useState } from 'react'
import { Box, ButtonBase, Typography } from '@mui/material'
import { studentJourney } from '../../data/landingData'
import IconGlyph from '../common/IconGlyph'
import SectionContainer from '../common/SectionContainer'
import SectionHeader from '../common/SectionHeader'

export default function StudentJourney() {
  const [activeStage, setActiveStage] = useState(0)
  const stage = studentJourney[activeStage]

  return (
    <SectionContainer className="journey-section">
      <Box className="journey-heading"><SectionHeader eyebrow="A journey with momentum" title="From first lesson to placement ready." description="SkiteUp connects every important stage of the student journey into one intelligent ecosystem." /><div className="journey-heading__note">THE STUDENT JOURNEY <span>{String(activeStage + 1).padStart(2, '0')} / 07</span></div></Box>
      <div className="journey-track" role="tablist" aria-label="Student journey stages">
        {studentJourney.map((item, index) => (
          <ButtonBase key={item.label} role="tab" aria-selected={activeStage === index} className={`journey-step ${activeStage === index ? 'is-active' : ''} ${index < activeStage ? 'is-complete' : ''}`} onClick={() => setActiveStage(index)}>
            <span className="journey-step__number">0{index + 1}</span><span className="journey-step__icon"><IconGlyph name={item.icon} /></span><b>{item.label}</b>{index < studentJourney.length - 1 && <i className="journey-step__connector" aria-hidden="true" />}
          </ButtonBase>
        ))}
      </div>
      <div className="journey-detail" role="tabpanel"><div className="journey-detail__mark"><IconGlyph name={stage.icon} /></div><div><span>STAGE 0{activeStage + 1}</span><Typography component="h3">{stage.label}</Typography><p>{stage.description}</p><div className="journey-detail__items">{stage.items.map((item) => <span key={item}>{item}</span>)}</div></div><div className="journey-detail__count">{String(activeStage + 1).padStart(2, '0')}<i> / 07</i></div></div>
    </SectionContainer>
  )
}
import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded'
import CheckRounded from '@mui/icons-material/CheckRounded'
import { Box, Paper, Typography } from '@mui/material'
import { placementReadinessInputs } from '../../data/landingData'
import SectionContainer from '../common/SectionContainer'
import SectionHeader from '../common/SectionHeader'

export default function PlacementReadinessSection() {
  return (
    <SectionContainer className="placement-section">
      <Box className="placement-layout">
        <Box className="placement-copy"><SectionHeader eyebrow="From academic progress to opportunity" title="Is every student moving toward industry readiness?" description="SkiteUp helps institutions connect academic performance with placement preparation, see skill gaps early and understand the next best area to improve." /><div className="placement-tags">{['Coding skills', 'Communication', 'Aptitude', 'Skill gaps'].map((item) => <span key={item}><CheckRounded />{item}</span>)}</div></Box>
        <Paper elevation={0} className="placement-model">
          <div className="placement-model__profile"><span className="placement-model__avatar">R</span><div><small>STUDENT PROFILE</small><b>Ramya S.</b><span>Computer Science · Year 3</span></div><span className="placement-model__live"><i /> TRACKING</span></div>
          <div className="placement-model__inputs">{placementReadinessInputs.map((input, index) => <div className="placement-input" key={input.label}><span className={`placement-input__icon placement-input__icon--${input.color}`}>{index + 1}</span><span>{input.label}</span><b>{input.value}</b>{index < placementReadinessInputs.length - 1 && <i aria-hidden="true">+</i>}</div>)}</div>
          <div className="placement-model__connector"><span /><span>CONNECTED PERFORMANCE SIGNALS</span><span /></div>
          <div className="placement-result"><div><small>PLACEMENT READINESS</small><b>78<span>%</span></b><em>On track <i>↗ +8.4%</i></em></div><div className="placement-result__ring"><span><CheckRounded /></span></div><Typography>Growth is steady. Focus next on aptitude practice to close the remaining skill gap.</Typography><a href="#analytics">View readiness insights <ArrowForwardRounded /></a></div>
        </Paper>
      </Box>
    </SectionContainer>
  )
}
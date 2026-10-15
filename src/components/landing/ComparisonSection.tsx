import { Box, Typography } from '@mui/material'
import { comparisonData, comparisonTools } from '../../data/landingData'
import IconGlyph from '../common/IconGlyph'
import ComparisonCard from '../common/ComparisonCard'
import SectionContainer from '../common/SectionContainer'
import SectionHeader from '../common/SectionHeader'

export default function ComparisonSection() {
  return (
    <SectionContainer className="comparison-section">
      <Box className="comparison-heading"><SectionHeader eyebrow="A better way forward" title="Why SkiteUp?" description="Move from fragmented education systems to one connected learning and placement journey." /><Typography>FRAGMENTED EDUCATION → CONNECTED EDUCATION</Typography></Box>
      <div className="comparison-transform"><div className="transform-toolset">{comparisonTools.map((tool, index) => <span className="transform-tool" key={tool.label} style={{ animationDelay: `${index * 90}ms` }}><IconGlyph name={tool.icon} />{tool.label}</span>)}</div><div className="transform-center"><i /><b>SkiteUp</b><span>ONE INTELLIGENT ECOSYSTEM</span></div><div className="transform-arrow"><i />→<i /></div></div>
      <Box className="comparison-grid"><ComparisonCard title={comparisonData.traditional.title} items={comparisonData.traditional.items} variant="negative" /><div className="comparison-divider"><span>→</span></div><ComparisonCard title={comparisonData.skiteup.title} items={comparisonData.skiteup.items} variant="positive" /></Box>
    </SectionContainer>
  )
}
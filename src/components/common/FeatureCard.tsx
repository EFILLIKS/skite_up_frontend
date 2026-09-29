import ArrowOutwardRounded from '@mui/icons-material/ArrowOutwardRounded'
import { Box, Paper, Typography } from '@mui/material'
import type { FeatureData } from '../../data/landingData'
import IconGlyph from './IconGlyph'
import TagChip from './TagChip'

interface FeatureCardProps extends FeatureData {}

export default function FeatureCard({ title, description, icon, tags, number }: FeatureCardProps) {
  return (
    <Paper component="article" elevation={0} className="feature-card">
      <Box className="feature-card__top">
        <span className="icon-tile icon-tile--soft"><IconGlyph name={icon} /></span>
        <span className="feature-card__number">{number}</span>
      </Box>
      <Typography component="h3" className="card-title">{title}</Typography>
      <Typography className="card-copy">{description}</Typography>
      <Box className="tag-list">{tags.map((tag) => <TagChip key={tag} label={tag} />)}</Box>
      <ArrowOutwardRounded className="feature-card__arrow" aria-hidden="true" />
    </Paper>
  )
}
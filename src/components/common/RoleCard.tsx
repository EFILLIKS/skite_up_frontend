import ArrowOutwardRounded from '@mui/icons-material/ArrowOutwardRounded'
import CheckRounded from '@mui/icons-material/CheckRounded'
import { Box, Paper, Typography } from '@mui/material'
import IconGlyph, { type IconName } from './IconGlyph'

interface RoleCardProps {
  title: string
  description: string
  icon: IconName
  features: string[]
  href?: string
  color: 'violet' | 'green' | 'blue'
}

export default function RoleCard({ title, description, icon, features, href = '#platform', color }: RoleCardProps) {
  return (
    <Paper component="article" elevation={0} className={`role-card role-card--${color}`}>
      <Box className="role-card__top">
        <span className="icon-tile"><IconGlyph name={icon} /></span>
        <span className="role-card__index">{title === 'Organization' ? '01' : title === 'Admin' ? '02' : '03'}</span>
      </Box>
      <Typography component="h3" className="card-title">{title}</Typography>
      <Typography className="card-copy">{description}</Typography>
      <ul className="role-card__features">
        {features.map((feature) => <li key={feature}><CheckRounded aria-hidden="true" />{feature}</li>)}
      </ul>
      <a className="text-link" href={href} aria-label={`Explore ${title} tools`}>Explore role <ArrowOutwardRounded fontSize="small" /></a>
    </Paper>
  )
}
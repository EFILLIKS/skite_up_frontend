import { Box, Typography } from '@mui/material'

interface SectionHeaderProps {
  eyebrow?: string
  title: string
  description?: string
  align?: 'left' | 'center'
  light?: boolean
}

export default function SectionHeader({ eyebrow, title, description, align = 'left', light = false }: SectionHeaderProps) {
  return (
    <Box className={`section-header ${align === 'center' ? 'section-header--center' : ''} ${light ? 'section-header--light' : ''}`}>
      {eyebrow && <Typography className="eyebrow">{eyebrow}</Typography>}
      <Typography component="h2" className="section-title">{title}</Typography>
      {description && <Typography className="section-description">{description}</Typography>}
    </Box>
  )
}
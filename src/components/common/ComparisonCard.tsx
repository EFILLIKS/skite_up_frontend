import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded'
import CancelRounded from '@mui/icons-material/CancelRounded'
import { Paper, Typography } from '@mui/material'

interface ComparisonCardProps {
  title: string
  items: string[]
  variant: 'negative' | 'positive'
}

export default function ComparisonCard({ title, items, variant }: ComparisonCardProps) {
  const Icon = variant === 'positive' ? CheckCircleRounded : CancelRounded
  return (
    <Paper elevation={0} className={`comparison-card comparison-card--${variant}`}>
      <Typography component="h3" className="comparison-card__title">{title}</Typography>
      <ul>{items.map((item) => <li key={item}><Icon aria-hidden="true" />{item}</li>)}</ul>
    </Paper>
  )
}
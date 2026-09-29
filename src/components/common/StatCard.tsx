import { Box, Paper, Typography } from '@mui/material'
import type { StatData } from '../../data/landingData'
import IconGlyph from './IconGlyph'

interface StatCardProps extends StatData {}

export default function StatCard({ label, value, status, icon, color }: StatCardProps) {
  return (
    <Paper elevation={0} className={`stat-card stat-card--${color}`}>
      <Box className="stat-card__top"><span className="stat-card__icon"><IconGlyph name={icon} /></span><span className="stat-card__status">{status}</span></Box>
      <Typography className="stat-card__value">{value}</Typography>
      <Typography className="stat-card__label">{label}</Typography>
    </Paper>
  )
}
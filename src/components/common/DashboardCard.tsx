import { Box, Paper, Typography } from '@mui/material'
import type { ReactNode } from 'react'

interface DashboardCardProps {
  title: string
  value: string
  note?: string
  children?: ReactNode
  className?: string
}

export default function DashboardCard({ title, value, note, children, className = '' }: DashboardCardProps) {
  return (
    <Paper elevation={0} className={`dashboard-card ${className}`}>
      <Box className="dashboard-card__head"><Typography className="dashboard-card__title">{title}</Typography>{note && <span>{note}</span>}</Box>
      <Typography className="dashboard-card__value">{value}</Typography>
      {children}
    </Paper>
  )
}
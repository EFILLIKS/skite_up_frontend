import type { ReactNode } from 'react'
import { Button } from '@mui/material'

interface AppButtonProps {
  children: ReactNode
  href?: string
  variant?: 'contained' | 'outlined' | 'text'
  className?: string
  endIcon?: ReactNode
  fullWidth?: boolean
}

export default function AppButton({ children, href, variant = 'contained', className = '', endIcon, fullWidth = false }: AppButtonProps) {
  return (
    <Button component="a" href={href} variant={variant} endIcon={endIcon} fullWidth={fullWidth} className={`app-button ${className}`}>
      {children}
    </Button>
  )
}
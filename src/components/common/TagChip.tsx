import { Chip } from '@mui/material'

interface TagChipProps {
  label: string
  className?: string
}

export default function TagChip({ label, className = '' }: TagChipProps) {
  return <Chip label={label} size="small" className={`tag-chip ${className}`} />
}
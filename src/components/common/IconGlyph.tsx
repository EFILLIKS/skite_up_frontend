import type { ReactNode } from 'react'
import AnalyticsRounded from '@mui/icons-material/AnalyticsRounded'
import AutoAwesomeRounded from '@mui/icons-material/AutoAwesomeRounded'
import BarChartRounded from '@mui/icons-material/BarChartRounded'
import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded'
import CodeRounded from '@mui/icons-material/CodeRounded'
import GroupsRounded from '@mui/icons-material/GroupsRounded'
import LanguageRounded from '@mui/icons-material/LanguageRounded'
import MenuBookRounded from '@mui/icons-material/MenuBookRounded'
import PersonRounded from '@mui/icons-material/PersonRounded'
import SchoolRounded from '@mui/icons-material/SchoolRounded'
import SecurityRounded from '@mui/icons-material/SecurityRounded'
import TrendingUpRounded from '@mui/icons-material/TrendingUpRounded'
import TuneRounded from '@mui/icons-material/TuneRounded'
import WorkRounded from '@mui/icons-material/WorkRounded'

export type IconName =
  | 'analytics'
  | 'ai'
  | 'chart'
  | 'check'
  | 'code'
  | 'groups'
  | 'language'
  | 'book'
  | 'person'
  | 'school'
  | 'security'
  | 'trend'
  | 'tune'
  | 'work'

const icons: Record<IconName, ReactNode> = {
  analytics: <AnalyticsRounded />,
  ai: <AutoAwesomeRounded />,
  chart: <BarChartRounded />,
  check: <CheckCircleRounded />,
  code: <CodeRounded />,
  groups: <GroupsRounded />,
  language: <LanguageRounded />,
  book: <MenuBookRounded />,
  person: <PersonRounded />,
  school: <SchoolRounded />,
  security: <SecurityRounded />,
  trend: <TrendingUpRounded />,
  tune: <TuneRounded />,
  work: <WorkRounded />,
}

interface IconGlyphProps {
  name: IconName
}

export default function IconGlyph({ name }: IconGlyphProps) {
  return icons[name]
}
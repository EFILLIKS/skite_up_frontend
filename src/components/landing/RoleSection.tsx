import { useState } from 'react'
import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded'
import { Box, Button, ButtonBase, Typography } from '@mui/material'
import { rolePreviews, type PlatformRole } from '../../data/landingData'
import IconGlyph from '../common/IconGlyph'
import SectionContainer from '../common/SectionContainer'
import SectionHeader from '../common/SectionHeader'

export default function RoleSection() {
  const [activeRole, setActiveRole] = useState<PlatformRole>('Organization')
  const preview = rolePreviews[activeRole]
  const roles: PlatformRole[] = ['Organization', 'Admin', 'Student']

  return (
    <SectionContainer id="solutions" className="role-section">
      <SectionHeader eyebrow="Built around your people" title="ONE PLATFORM. EVERY ROLE" description="A shared foundation, shaped around the people who make education work." />
      <Box className="role-switcher-layout">
        <div className="role-switcher" role="tablist" aria-label="Choose a platform role">
          {roles.map((role) => <ButtonBase key={role} className={`role-switcher__tab ${activeRole === role ? 'is-active' : ''}`} role="tab" aria-selected={activeRole === role} onClick={() => setActiveRole(role)}><span className="role-switcher__icon"><IconGlyph name={role === 'Organization' ? 'groups' : role === 'Admin' ? 'school' : 'person'} /></span><span><small>VIEW AS</small><b>{role}</b></span><ArrowForwardRounded /></ButtonBase>)}
        </div>
        <div className="role-preview" role="tabpanel">
          <div className="role-preview__header"><div><span className="role-preview__eyebrow">SKITEUP / {activeRole.toUpperCase()}</span><Typography component="h3">{activeRole === 'Organization' ? 'Institution overview' : activeRole === 'Admin' ? 'Academic workspace' : 'Your learning hub'}</Typography></div><span className="role-preview__live"><i /> LIVE PREVIEW</span></div>
          <Typography className="role-preview__summary">{preview.summary}</Typography>
          <div className="role-preview__stats">{preview.stats.map((stat) => <div key={stat.label}><small>{stat.label}</small><b>{stat.value}</b><span>↗ {stat.change}</span></div>)}</div>
          <div className="role-preview__capabilities"><span>WORKSPACE INCLUDES</span><div>{preview.highlights.map((item, index) => <span key={item}><i>{String(index + 1).padStart(2, '0')}</i>{item}</span>)}</div></div>
          <Button href="/login" className="role-preview__launch" endIcon={<ArrowForwardRounded />}>Explore {activeRole.toLowerCase()} workspace</Button>
        </div>
      </Box>
    </SectionContainer>
  )
}
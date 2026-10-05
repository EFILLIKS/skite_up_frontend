import { useState } from 'react'
import CloseRounded from '@mui/icons-material/CloseRounded'
import MenuRounded from '@mui/icons-material/MenuRounded'
import NorthEastRounded from '@mui/icons-material/NorthEastRounded'
import { Box, Container, IconButton } from '@mui/material'
import { Link } from 'react-router-dom'
import { navigationItems } from '../../data/landingData'
import BrandLockup from '../common/Branding'

interface LandingNavbarProps {
  onContactClick: () => void
}

export default function LandingNavbar({ onContactClick }: LandingNavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  const closeMenu = () => setMenuOpen(false)

  return (
    <Box component="header" className="site-header">
      <Container maxWidth="lg" className="navbar">
        <a href="#home" className="brand" aria-label="SKITEUP home" onClick={closeMenu}><BrandLockup /></a>
        <nav className={`navbar__links ${menuOpen ? 'navbar__links--open' : ''}`} aria-label="Main navigation">
          {navigationItems.map((item) => <a key={item.label} href={item.href} onClick={closeMenu}>{item.label}</a>)}
          <button type="button" className="navbar__contact" onClick={() => { closeMenu(); onContactClick() }}>Contact</button>
          <Link className="navbar__mobile-cta" to="/login" onClick={closeMenu}>Launch Platform <NorthEastRounded fontSize="small" /></Link>
        </nav>
        <Box className="navbar__actions">
          <Link className="navbar__cta" to="/login">Launch Platform <NorthEastRounded fontSize="small" /></Link>
        </Box>
        <IconButton className="navbar__menu" onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={menuOpen}>
          {menuOpen ? <CloseRounded /> : <MenuRounded />}
        </IconButton>
      </Container>
    </Box>
  )
}
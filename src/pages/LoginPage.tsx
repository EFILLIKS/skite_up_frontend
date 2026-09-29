import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded'
import AutoAwesomeRounded from '@mui/icons-material/AutoAwesomeRounded'
import { Box, Container, Typography } from '@mui/material'
import { Link } from 'react-router-dom'
import BrandLockup from '../components/common/Branding'

export default function LoginPage() {
  return (
    <Box className="login-page">
      <Container maxWidth="sm" className="login-page__container">
        <Link to="/" className="login-back"><ArrowBackRounded fontSize="small" /> Back to SkiteUp</Link>
        <div className="login-brand"><BrandLockup /></div>
        <div className="login-panel"><span className="login-panel__icon"><AutoAwesomeRounded /></span><Typography component="h1">Welcome to SkiteUp</Typography><Typography>Sign-in will be available when your institution’s workspace is connected.</Typography><Link to="/" className="login-panel__link">Explore the platform <span>↗</span></Link></div>
      </Container>
    </Box>
  )
}
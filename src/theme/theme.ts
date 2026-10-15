import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    primary: { main: '#265D99', light: '#5C8EC1', dark: '#183F69' },
    secondary: { main: '#9E1F63', light: '#C35A8F', dark: '#741547' },
    success: { main: '#16A34A' },
    error: { main: '#EF4444' },
    text: { primary: '#0F172A', secondary: '#64748B' },
    background: { default: '#F8FAFC', paper: '#FFFFFF' },
    divider: '#E2E8F0',
  },
  typography: {
    fontFamily: 'Manrope, "Segoe UI", sans-serif',
    button: { textTransform: 'none', fontWeight: 700 },
  },
  shape: { borderRadius: 14 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 10, paddingInline: 20, minHeight: 46 },
      },
    },
  },
})

export default theme
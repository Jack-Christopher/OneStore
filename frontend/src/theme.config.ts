import { createTheme } from '@mui/material/styles'

export const muiTheme = createTheme({
  palette: {
    mode: 'dark',
    background: { default: '#0C1422', paper: '#18283C' },
    primary: { main: '#3AA89A', contrastText: '#04221E' },
    secondary: { main: '#31445F', contrastText: '#E8EEF7' },
    error: { main: '#E06B78', contrastText: '#FFF7F8' },
    text: { primary: '#E8EEF7', secondary: '#93A4BE' },
    divider: '#31445F',
  },
  shape: { borderRadius: 0 },
  typography: {
    button: { textTransform: 'none' },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none', boxShadow: 'none' },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { boxShadow: 'none', borderRadius: 0 },
      },
    },
  },
})

export function initializeTheme(): void {
  document.documentElement.classList.add('dark')
  localStorage.setItem('theme', 'dark')
}

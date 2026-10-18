import ReactDOM from 'react-dom/client'
import { AppRoutes } from '@/routes/AppRoutes'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@mui/material/styles'
import { worker } from '@/services/mocks/browser'
import { initializeTheme, muiTheme } from '@/theme.config'
import './styles/index.css'

initializeTheme()

const queryClient = new QueryClient()

if (import.meta.env.MODE === 'development') worker.start()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <ThemeProvider theme={muiTheme}>
      <AppRoutes />
    </ThemeProvider>
  </QueryClientProvider>
)

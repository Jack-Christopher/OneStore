import ReactDOM from 'react-dom/client'
import { AppRoutes } from '@/routes/AppRoutes'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { worker } from '@/services/mocks/browser'
import { initializeTheme } from '@/theme.config'
import './styles/index.css'

// Initialize theme early to prevent flash
initializeTheme()

const queryClient = new QueryClient()

if (import.meta.env.MODE === 'development') worker.start()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <AppRoutes />
  </QueryClientProvider>
)

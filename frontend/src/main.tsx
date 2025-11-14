import ReactDOM from 'react-dom/client'
import { AppRoutes } from '@/routes/AppRoutes'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { worker } from '@/services/mocks/browser'
import './styles/index.css'

const queryClient = new QueryClient()

if (import.meta.env.MODE === 'development') worker.start()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <AppRoutes />
  </QueryClientProvider>
)

// Application shell — provider tree + <AppRoutes/>. Written once; the route table lives in AppRoutes.tsx.
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import AppProviders from './AppProviders'
import AppRoutes from './AppRoutes'

const queryClient = new QueryClient()

export default function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AppProviders>
          <AppRoutes />
        </AppProviders>
      </QueryClientProvider>
    </BrowserRouter>
  )
}

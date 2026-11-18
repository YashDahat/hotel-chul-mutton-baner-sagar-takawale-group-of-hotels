import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/context/AuthContext'
import { CartProvider } from '@/cart/CartContext'
import { BranchProvider } from '@/context/BranchContext'
import { ThemeProvider } from '@/components/theme/ThemeProvider'
import { Toaster } from '@/components/ui/sonner'
import AppRoutes from '@/AppRoutes'

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BranchProvider>
            <CartProvider>
              {/* Global toasts: failed API calls auto-toast via the apiClient interceptor. */}
              <Toaster richColors position="bottom-left" />
              <BrowserRouter>
                <AppRoutes />
              </BrowserRouter>
            </CartProvider>
          </BranchProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

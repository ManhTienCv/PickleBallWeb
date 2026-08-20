import { useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Route, Routes, useNavigate, useLocation } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { CheckoutTimerProvider } from '@/contexts/CheckoutTimerContext'
import CustomerLayout from '@/components/CustomerLayout'
import Home from '@/pages/Home'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import Profile from '@/pages/Profile'
import Products from '@/pages/Products'
import ProductDetail from '@/pages/ProductDetail'
import CourtBooking from '@/pages/CourtBooking'
import CartPage from '@/pages/Cart'
import CheckoutPage from '@/pages/Checkout'
import OrderSuccess from '@/pages/OrderSuccess'
import OrdersPage from '@/pages/Orders'
import NotFound from '@/pages/NotFound'
import { Toaster } from 'sonner'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
})

// Tự động chuyển hướng về Trang Chủ mỗi khi bấm F5 hoặc Reload lại trang
function ResetToHomeOnReload() {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    try {
      const navEntries = performance.getEntriesByType?.('navigation') as PerformanceNavigationTiming[]
      const isReload =
        (navEntries && navEntries.length > 0 && navEntries[0]?.type === 'reload') ||
        (performance as any)?.navigation?.type === 1

      if (isReload && location.pathname !== '/' && location.pathname !== '/login') {
        navigate('/', { replace: true })
      }
    } catch {
      // Fallback ignore
    }
  }, [])

  return null
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CheckoutTimerProvider>
          <BrowserRouter>
            <ResetToHomeOnReload />
            <Routes>
              <Route element={<CustomerLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:slug" element={<ProductDetail />} />
                <Route path="/booking" element={<CourtBooking />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/order-success/:code" element={<OrderSuccess />} />
                <Route path="/orders" element={<OrdersPage />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          <Toaster position="top-right" richColors />
        </CheckoutTimerProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App

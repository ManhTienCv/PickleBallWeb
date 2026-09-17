import { useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Route, Routes, useNavigate, useLocation } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { CheckoutTimerProvider } from '@/contexts/CheckoutTimerContext'
import CustomerLayout from '@/components/CustomerLayout'
import Home from '@/pages/Home'
import Profile from '@/pages/Profile'
import Products from '@/pages/Products'
import ProductDetail from '@/pages/ProductDetail'
import CourtBooking from '@/pages/CourtBooking'
import CartPage from '@/pages/Cart'
import CheckoutPage from '@/pages/Checkout'
import OrderSuccess from '@/pages/OrderSuccess'
import OrdersPage from '@/pages/Orders'
import MomoCallbackPage from '@/pages/MomoCallback'
import WishlistPage from '@/pages/Wishlist'
import NotFound from '@/pages/NotFound'
import { AuthModal } from '@/components/AuthModal'
import { Toaster } from 'sonner'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 0,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <CheckoutTimerProvider>
            <BrowserRouter>
              <AuthModal />
              <Routes>
                <Route element={<CustomerLayout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/products/:slug" element={<ProductDetail />} />
                  <Route path="/booking" element={<CourtBooking />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/order-success/:code" element={<OrderSuccess />} />
                  <Route path="/payment/momo/callback" element={<MomoCallbackPage />} />
                  <Route path="/orders" element={<OrdersPage />} />
                  <Route path="/wishlist" element={<WishlistPage />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
            <Toaster position="top-right" richColors duration={1400} closeButton />
          </CheckoutTimerProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App

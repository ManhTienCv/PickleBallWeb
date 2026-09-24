import { lazy, Suspense, useEffect, useState, useLayoutEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { CheckoutTimerProvider } from '@/contexts/CheckoutTimerContext'
import CustomerLayout from '@/components/CustomerLayout'
import { AuthModal } from '@/components/AuthModal'
import { Toaster } from 'sonner'

// ── 1. CODE-SPLITTING: Dynamic Chunk Loading bằng React.lazy ─────────────
const Home = lazy(() => import('@/pages/Home'))
const Profile = lazy(() => import('@/pages/Profile'))
const Products = lazy(() => import('@/pages/Products'))
const ProductDetail = lazy(() => import('@/pages/ProductDetail'))
const CourtBooking = lazy(() => import('@/pages/CourtBooking'))
const CartPage = lazy(() => import('@/pages/Cart'))
const CheckoutPage = lazy(() => import('@/pages/Checkout'))
const OrderSuccess = lazy(() => import('@/pages/OrderSuccess'))
const OrdersPage = lazy(() => import('@/pages/Orders'))
const MomoCallbackPage = lazy(() => import('@/pages/MomoCallback'))
const WishlistPage = lazy(() => import('@/pages/Wishlist'))
const NotFound = lazy(() => import('@/pages/NotFound'))

// ── 2. SCROLL TO TOP: Cuộn về đầu trang ngay lập tức khi đổi URL ──────────
function ScrollToTop() {
  const { pathname } = useLocation()
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname])
  return null
}

// ── 3. TOP PROGRESS BAR: Thanh tiến trình siêu mảnh trên đỉnh màn hình ────
function TopProgressBar() {
  const location = useLocation()
  const [isNavigating, setIsNavigating] = useState(false)

  useEffect(() => {
    setIsNavigating(true)
    const timer = setTimeout(() => setIsNavigating(false), 450)
    return () => clearTimeout(timer)
  }, [location.pathname])

  if (!isNavigating) return null

  return (
    <div className="fixed top-0 left-0 right-0 h-[2.5px] z-[9999] pointer-events-none overflow-hidden">
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: '0%' }}
        exit={{ opacity: 0 }}
        transition={{
          duration: 0.45,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="w-full h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.7)]"
      />
    </div>
  )
}

// ── 4. PAGE FALLBACK: Skeleton / Spinner khi tải mã nguồn trang lần đầu ───
export function PageFallback() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
      <div className="relative flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin" />
        <div className="absolute w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
      </div>
      <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase animate-pulse">
        Đang tải trang...
      </span>
    </div>
  )
}

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
              <TopProgressBar />
              <ScrollToTop />
              <AuthModal />
              <Suspense fallback={<PageFallback />}>
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
              </Suspense>
            </BrowserRouter>
            <Toaster position="top-right" richColors duration={1400} closeButton />
          </CheckoutTimerProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App

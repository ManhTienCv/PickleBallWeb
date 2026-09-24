import React, { useEffect, useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { ShoppingCart, Package, LogOut, User as UserIcon, Heart } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useAuthModalStore } from '@/stores/useAuthModalStore'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { cartService, Cart } from '@/services/cart.service'
import { wishlistService } from '@/services/wishlist.service'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import ThemeToggle from '@/components/ThemeToggle'
import PickleballLogo from '@/components/PickleballLogo'
import CustomerChatWidget from '@/components/CustomerChatWidget'
import Navbar from '@/components/Navbar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function CustomerLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, user, logout } = useAuth()
  const openLogin = useAuthModalStore((s) => s.openLogin)
  const queryClient = useQueryClient()
  const shouldReduceMotion = useReducedMotion()
  const appleEasing = [0.22, 1, 0.36, 1] as const

  const pageVariants = {
    initial: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : 16,
      scale: shouldReduceMotion ? 1 : 0.99,
    },
    enter: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.42,
        ease: appleEasing,
      },
    },
    exit: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : -14,
      scale: shouldReduceMotion ? 1 : 0.99,
      transition: {
        duration: 0.28,
        ease: appleEasing,
      },
    },
  }

  // Always scroll to top of page on route change or navbar link click
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [location.pathname])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }

  const { data: cart } = useQuery({
    queryKey: ['cart'],
    queryFn: cartService.getCart,
    initialData: () => cartService.getLocalCart(),
  })

  useEffect(() => {
    const handleCartUpdated = (e: Event) => {
      const customEvent = e as CustomEvent<Cart>
      const freshCart = customEvent.detail || cartService.getLocalCart()
      queryClient.setQueryData(['cart'], freshCart)
    }
    const handleStorage = () => {
      const freshCart = cartService.getLocalCart()
      queryClient.setQueryData(['cart'], freshCart)
    }
    window.addEventListener('cart-updated', handleCartUpdated)
    window.addEventListener('storage', handleStorage)
    return () => {
      window.removeEventListener('cart-updated', handleCartUpdated)
      window.removeEventListener('storage', handleStorage)
    }
  }, [queryClient])

  const cartCount = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0

  const [wishlistCount, setWishlistCount] = useState<number>(() => wishlistService.getLocalWishlistIds().length)

  useEffect(() => {
    wishlistService.getWishlist().then((res) => {
      setWishlistCount(res.count)
    })

    const handleWishlistUpdated = (e: Event) => {
      const customEvent = e as CustomEvent<{ count: number; ids: number[] }>
      if (customEvent.detail?.count !== undefined) {
        setWishlistCount(customEvent.detail.count)
      } else {
        setWishlistCount(wishlistService.getLocalWishlistIds().length)
      }
    }

    window.addEventListener('wishlist-updated', handleWishlistUpdated)
    return () => {
      window.removeEventListener('wishlist-updated', handleWishlistUpdated)
    }
  }, [])

  const [hoveredDropdownItem, setHoveredDropdownItem] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-300">
      {/* Full-width Sticky Header (Khung che phủ toàn trang tràn viền, nâng kích thước +15%) */}
      <header className="sticky top-0 z-50 w-full bg-card/90 dark:bg-card/85 backdrop-blur-md border-b border-border shadow-sm dark:shadow-black/30 transition-all">
        <div className="container mx-auto max-w-7xl h-20 sm:h-[84px] flex items-center justify-between px-5 sm:px-7 lg:px-9">
          {/* Left Group: Logo + Navigation side-by-side */}
          <div className="flex items-center gap-7 lg:gap-10">
            {/* European Styled Logo - Pick (Solid, no bounce) */}
            <Link to="/" onClick={scrollToTop} className="flex items-center gap-3 shrink-0 group select-none cursor-pointer">
              <div
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-emerald-500/15 dark:bg-emerald-500/25 border border-emerald-500/30 flex items-center justify-center shadow-md shadow-emerald-500/10"
              >
                <PickleballLogo size={28} />
              </div>
              <div className="flex items-baseline">
                <span className="font-bold text-2xl sm:text-[32px] text-foreground tracking-tight font-sans">Pick</span>
              </div>
            </Link>

            {/* Navigation (Gliding Capsule Pill Tab) */}
            <div className="hidden md:flex items-center">
              <Navbar />
            </div>
          </div>

          {/* Right Group: Theme Toggle, Cart & Login Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Dark/Light Theme Toggle */}
            <ThemeToggle className="p-3" />

            {/* Wishlist Button */}
            <Link
              to="/wishlist"
              onClick={scrollToTop}
              aria-label="Danh sách yêu thích"
              className="relative p-3 rounded-full text-foreground hover:bg-muted transition-colors block border border-transparent hover:border-border cursor-pointer select-none"
            >
              <Heart className="w-[22px] h-[22px] text-muted-foreground hover:text-red-500 transition-colors" />
              {wishlistCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 min-w-[22px] h-[22px] px-1 bg-red-500 text-white text-xs font-black rounded-full flex items-center justify-center shadow-md ring-2 ring-white dark:ring-slate-900 pointer-events-none"
                >
                  {wishlistCount > 99 ? '99+' : wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Button (Solid, no bounce) */}
            <Link
              to="/cart"
              onClick={scrollToTop}
              aria-label="Giỏ hàng"
              className="relative p-3 rounded-full text-foreground hover:bg-muted transition-colors block border border-transparent hover:border-border cursor-pointer select-none"
            >
              <ShoppingCart className="w-[22px] h-[22px] text-muted-foreground hover:text-foreground transition-colors" />
              {cartCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 min-w-[22px] h-[22px] px-1 bg-red-600 text-white text-xs font-black rounded-full flex items-center justify-center shadow-md ring-2 ring-white dark:ring-slate-900 pointer-events-none"
                >
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <DropdownMenu 
                modal={false}
                onOpenChange={(open) => {
                  if (!open) setHoveredDropdownItem(null)
                }}
              >
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-3 px-4 py-2 rounded-full hover:bg-muted transition-colors border border-border shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer select-none"
                  >
                    <div className="w-9 h-9 bg-[#27c372]/20 text-[#16a34a] dark:text-emerald-400 rounded-full flex items-center justify-center font-bold text-sm">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-[15px] font-semibold text-foreground hidden sm:block">
                      {user?.name}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-xl border-border bg-card text-card-foreground">
                  <DropdownMenuLabel className="font-bold text-foreground px-3 py-2">
                    {user?.name}
                    <div className="text-xs font-normal text-muted-foreground">{user?.email}</div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => navigate('/orders')}
                    onMouseEnter={() => setHoveredDropdownItem('orders')}
                    onMouseLeave={() => setHoveredDropdownItem(null)}
                    className="gap-2 rounded-xl cursor-pointer font-medium text-foreground hover:bg-transparent focus:bg-transparent relative z-0"
                  >
                    {hoveredDropdownItem === 'orders' && (
                      <motion.div
                        layoutId="customer-dropdown-capsule"
                        className="absolute inset-0 bg-muted rounded-xl -z-10"
                        transition={{ type: 'spring', stiffness: 250, damping: 25 }}
                      />
                    )}
                    <Package className="h-4 w-4 text-muted-foreground relative z-10" />
                    <span className="relative z-10">Lịch sử đơn hàng</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate('/profile')}
                    onMouseEnter={() => setHoveredDropdownItem('profile')}
                    onMouseLeave={() => setHoveredDropdownItem(null)}
                    className="gap-2 rounded-xl cursor-pointer font-medium text-foreground hover:bg-transparent focus:bg-transparent relative z-0"
                  >
                    {hoveredDropdownItem === 'profile' && (
                      <motion.div
                        layoutId="customer-dropdown-capsule"
                        className="absolute inset-0 bg-muted rounded-xl -z-10"
                        transition={{ type: 'spring', stiffness: 250, damping: 25 }}
                      />
                    )}
                    <UserIcon className="h-4 w-4 text-muted-foreground relative z-10" />
                    <span className="relative z-10">Hồ sơ cá nhân</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={logout}
                    onMouseEnter={() => setHoveredDropdownItem('logout')}
                    onMouseLeave={() => setHoveredDropdownItem(null)}
                    className="gap-2 text-destructive rounded-xl cursor-pointer font-medium hover:bg-transparent focus:bg-transparent hover:text-destructive relative z-0"
                  >
                    {hoveredDropdownItem === 'logout' && (
                      <motion.div
                        layoutId="customer-dropdown-capsule"
                        className="absolute inset-0 bg-destructive/10 rounded-xl -z-10"
                        transition={{ type: 'spring', stiffness: 250, damping: 25 }}
                      />
                    )}
                    <LogOut className="h-4 w-4 relative z-10" />
                    <span className="relative z-10">Đăng xuất</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                <button
                  onClick={openLogin}
                  className="px-6 sm:px-7 py-2.5 sm:py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-sm sm:text-[15px] font-bold shadow-md shadow-emerald-600/25 transition-all block cursor-pointer"
                >
                  Đăng Nhập
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </header>

      {/* Page Content with Grid-Overlay Apple Page Transition */}
      <main className="flex-1 grid grid-cols-1 grid-rows-1 [&>*]:[grid-area:1/1] overflow-hidden w-full relative">
        <AnimatePresence mode="sync" initial={false}>
          <motion.div
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="enter"
            exit="exit"
            className="w-full flex-1"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card text-card-foreground py-8 mt-12 transition-colors duration-300">
        <div className="container mx-auto px-4 text-center space-y-1.5">
          <p className="text-sm font-bold text-foreground">
            © 2026 Pick Web — Hệ thống Thiết bị thể thao & Đặt sân Pickleball hàng đầu
          </p>
          <p className="text-xs text-muted-foreground font-normal">
            Cung cấp vợt bóng chính hãng, dịch vụ đặt sân chuyên nghiệp & giao hàng toàn quốc
          </p>
        </div>
      </footer>

      {/* Floating 2-way Live Chat Widget */}
      <CustomerChatWidget />
    </div>
  )
}

import React, { useEffect, useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { ShoppingCart, MapPin, Package, LogOut, User as UserIcon, Home, ShoppingBag, CalendarDays } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useAuthModalStore } from '@/stores/useAuthModalStore'
import { useQuery } from '@tanstack/react-query'
import { cartService } from '@/services/cart.service'
import { motion } from 'framer-motion'
import ThemeToggle from '@/components/ThemeToggle'
import PickleballLogo from '@/components/PickleballLogo'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const navItems = [
  { label: 'Trang chủ', path: '/', icon: Home },
  { label: 'Sản phẩm', path: '/products', icon: ShoppingBag },
  { label: 'Đặt sân', path: '/booking', icon: CalendarDays },
]

export default function CustomerLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, user, logout } = useAuth()
  const openLogin = useAuthModalStore((s) => s.openLogin)

  // Always scroll to top of page on route change or navbar link click
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [location.pathname])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }

  const { data: cart, refetch: refetchCart } = useQuery({
    queryKey: ['cart'],
    queryFn: cartService.getCart,
  })

  useEffect(() => {
    const handleStorage = () => {
      refetchCart()
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [refetchCart])

  const cartCount = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0

  const [hoveredDropdownItem, setHoveredDropdownItem] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-300">
      {/* Floating Capsule Header (Nổi chuẩn phong cách Châu Âu) */}
      <header className="sticky top-3 sm:top-5 z-50 px-3 sm:px-6 mb-6 sm:mb-8">
        <div className="container mx-auto max-w-6xl bg-card/90 dark:bg-card/85 backdrop-blur-md rounded-full border border-border shadow-md dark:shadow-black/50 h-16 sm:h-18 flex items-center justify-between px-4 sm:px-6 transition-all">
          {/* Left Group: Logo + Navigation side-by-side */}
          <div className="flex items-center gap-6 lg:gap-8">
            {/* European Styled Logo - Pick */}
            <Link to="/" onClick={scrollToTop} className="flex items-center gap-2.5 shrink-0 group">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 rounded-xl bg-emerald-500/15 dark:bg-emerald-500/25 border border-emerald-500/30 flex items-center justify-center shadow-md shadow-emerald-500/10 transition-transform"
              >
                <PickleballLogo size={24} />
              </motion.div>
              <div className="flex items-baseline">
                <span className="font-bold text-2xl sm:text-3xl text-foreground tracking-tight font-sans">Pick</span>
              </div>
            </Link>

            {/* Navigation (Sliding Capsule Pill Glides Ultra-Smoothly On Click) */}
            <nav className="hidden md:flex items-center gap-1 sm:gap-1.5 relative">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path
                const Icon = item.icon

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={scrollToTop}
                    className="relative flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-colors duration-200 hover:bg-muted/70"
                  >
                    {isActive && (
                      <motion.div
                        layoutId="navbar-active-sliding-pill"
                        transition={{
                          type: 'spring',
                          stiffness: 200,
                          damping: 24,
                          mass: 0.9,
                        }}
                        className="absolute inset-0 bg-primary/15 dark:bg-primary/25 border border-primary/30 dark:border-primary/40 rounded-lg shadow-sm"
                      />
                    )}
                    <Icon
                      className={`w-4 h-4 z-10 transition-colors duration-200 ${
                        isActive ? 'text-primary dark:text-emerald-400' : 'text-muted-foreground'
                      }`}
                    />
                    <span
                      className={`z-10 transition-colors duration-200 ${
                        isActive
                          ? 'text-primary dark:text-emerald-400 font-semibold'
                          : 'text-muted-foreground font-medium hover:text-foreground'
                      }`}
                    >
                      {item.label}
                    </span>
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Right Group: Theme Toggle, Cart & Login Actions */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Dark/Light Theme Toggle */}
            <ThemeToggle />

            {/* Cart Button */}
            <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/cart"
                onClick={scrollToTop}
                aria-label="Giỏ hàng"
                className="relative p-2.5 rounded-full text-foreground hover:bg-muted transition-colors block border border-transparent hover:border-border"
              >
                <ShoppingCart className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 h-5 w-5 bg-[#27c372] text-white text-[11px] font-black rounded-full flex items-center justify-center shadow-sm"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </Link>
            </motion.div>

            {isAuthenticated ? (
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full hover:bg-muted transition-colors border border-border shadow-sm"
                  >
                    <div className="w-8 h-8 bg-[#27c372]/20 text-[#16a34a] dark:text-emerald-400 rounded-full flex items-center justify-center font-bold text-xs">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-semibold text-foreground hidden sm:block">
                      {user?.name}
                    </span>
                  </motion.button>
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
                  className="px-5 sm:px-6 py-2 sm:py-2.5 bg-[#27c372] hover:bg-[#22c55e] text-white rounded-full text-xs sm:text-sm font-black shadow-md shadow-[#27c372]/25 transition-all block"
                >
                  Đăng Nhập
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-1">
        <Outlet />
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
    </div>
  )
}

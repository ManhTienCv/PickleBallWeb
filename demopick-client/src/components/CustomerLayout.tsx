import React, { useEffect, useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { ShoppingCart, MapPin, Package, LogOut, User as UserIcon, Home, ShoppingBag, CalendarDays, BookOpen } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useQuery } from '@tanstack/react-query'
import { cartService } from '@/services/cart.service'
import { motion } from 'framer-motion'
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
  { label: 'Cửa hàng', path: '/products', icon: ShoppingBag },
  { label: 'Đặt sân', path: '/booking', icon: CalendarDays },
  { label: 'Blog', path: '/blog', icon: BookOpen },
]

export default function CustomerLayout() {
  const location = useLocation()
  const [hoveredPath, setHoveredPath] = useState<string | null>(null)
  const { isAuthenticated, user, logout } = useAuth()

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
    enabled: isAuthenticated,
  })

  const cartCount = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col font-sans">
      {/* Floating Capsule Header (Nổi chuẩn phong cách Châu Âu) */}
      <header className="sticky top-3 sm:top-5 z-50 px-3 sm:px-6 mb-6 sm:mb-8">
        <div className="container mx-auto max-w-6xl bg-white/95 backdrop-blur-md rounded-full border border-slate-200/90 shadow-md shadow-slate-200/50 h-16 sm:h-18 flex items-center justify-between px-4 sm:px-6 transition-all">
          {/* Left Group: Logo + Navigation side-by-side */}
          <div className="flex items-center gap-6 lg:gap-8">
            {/* European Styled Logo - Pick */}
            <Link to="/" onClick={scrollToTop} className="flex items-center gap-2.5 shrink-0 group">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 bg-[#27c372] rounded-full flex items-center justify-center shadow-md shadow-[#27c372]/30 transition-transform"
              >
                <MapPin className="w-5 h-5 text-white stroke-[2.5]" />
              </motion.div>
              <div className="flex items-baseline">
                <span className="font-bold text-2xl sm:text-3xl text-slate-900 tracking-tight font-sans">Pick</span>
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
                    className="relative flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-colors duration-200 hover:bg-slate-100/70"
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
                        className="absolute inset-0 bg-[#27c372]/15 border border-[#27c372]/30 rounded-lg shadow-sm"
                      />
                    )}
                    <Icon
                      className={`w-4 h-4 z-10 transition-colors duration-200 ${
                        isActive ? 'text-[#16a34a]' : 'text-slate-500'
                      }`}
                    />
                    <span
                      className={`z-10 transition-colors duration-200 ${
                        isActive
                          ? 'text-[#16a34a] font-medium'
                          : 'text-slate-700 font-medium hover:text-slate-900'
                      }`}
                    >
                      {item.label}
                    </span>
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Right Group: Cart & Login Actions */}
          <div className="flex items-center gap-3">
            <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/cart"
                onClick={scrollToTop}
                className="relative p-2.5 rounded-full text-slate-700 hover:bg-slate-100 transition-colors block"
              >
                <ShoppingCart className="w-5 h-5" />
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full hover:bg-slate-100 transition-colors border border-slate-200/90 shadow-sm"
                  >
                    <div className="w-8 h-8 bg-[#27c372]/20 text-[#16a34a] rounded-full flex items-center justify-center font-extrabold text-xs">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-extrabold text-slate-800 hidden sm:block">
                      {user?.name}
                    </span>
                  </motion.button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-xl border-slate-200">
                  <DropdownMenuLabel className="font-extrabold text-slate-900 px-3 py-2">
                    {user?.name}
                    <div className="text-xs font-semibold text-slate-500">{user?.email}</div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => (window.location.href = '/orders')} className="gap-2 rounded-xl cursor-pointer font-bold">
                    <Package className="h-4 w-4 text-slate-500" />
                    <span>Lịch sử đơn hàng</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => (window.location.href = '/profile')} className="gap-2 rounded-xl cursor-pointer font-bold">
                    <UserIcon className="h-4 w-4 text-slate-500" />
                    <span>Hồ sơ cá nhân</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="gap-2 text-destructive rounded-xl cursor-pointer font-bold">
                    <LogOut className="h-4 w-4" />
                    <span>Đăng xuất</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                <Link
                  to="/login"
                  className="px-6 py-2.5 bg-[#27c372] hover:bg-[#22c55e] text-white rounded-full text-sm font-black shadow-md shadow-[#27c372]/25 transition-all block"
                >
                  Đăng Nhập
                </Link>
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
      <footer className="border-t border-slate-200/80 bg-white py-8 mt-12">
        <div className="container mx-auto px-4 text-center space-y-2">
          <p className="text-sm font-bold text-slate-700">
            © 2026 Pick Web — Nền tảng Thương mại điện tử & Đặt sân Pickleball chuẩn SOA
          </p>
          <p className="text-xs text-slate-400 font-medium">
            Powered by Laravel 13 Multi-DB Monolith API & React 18 SPA Customer Portal
          </p>
        </div>
      </footer>
    </div>
  )
}

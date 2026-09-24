import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Home, 
  CalendarDays, 
  ShoppingBag, 
  PackageCheck, 
  Heart 
} from 'lucide-react'

export interface NavItem {
  id: string
  label: string
  path: string
  icon: React.ElementType
  matchPrefixes?: string[]
}

export const CLIENT_NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Trang chủ', path: '/', icon: Home },
  { id: 'booking', label: 'Đặt sân', path: '/booking', icon: CalendarDays, matchPrefixes: ['/booking'] },
  { id: 'products', label: 'Sản phẩm', path: '/products', icon: ShoppingBag, matchPrefixes: ['/products'] },
  { id: 'orders', label: 'Đơn hàng', path: '/orders', icon: PackageCheck, matchPrefixes: ['/orders', '/order-success'] },
  { id: 'wishlist', label: 'Yêu thích', path: '/wishlist', icon: Heart, matchPrefixes: ['/wishlist'] },
]

interface NavbarProps {
  onItemClick?: () => void
  className?: string
}

export default function Navbar({ onItemClick, className = '' }: NavbarProps) {
  const location = useLocation()

  // Thuật toán nhận diện Active thông minh cho cả Route cha lẫn Route con
  const checkIsActive = (item: NavItem) => {
    const currentPath = location.pathname
    if (item.path === '/') {
      return currentPath === '/'
    }
    if (currentPath === item.path) {
      return true
    }
    if (item.matchPrefixes && item.matchPrefixes.some((prefix) => currentPath.startsWith(prefix))) {
      return true
    }
    return currentPath.startsWith(item.path)
  }

  const handleLinkClick = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    if (onItemClick) {
      onItemClick()
    }
  }

  return (
    <nav
      aria-label="Điều hướng chính"
      className={`relative flex items-center gap-1 sm:gap-1.5 p-1 sm:p-1.5 bg-slate-100/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-inner shadow-black/[0.02] ${className}`}
    >
      {CLIENT_NAV_ITEMS.map((item) => {
        const isActive = checkIsActive(item)
        const Icon = item.icon

        return (
          <Link
            key={item.id}
            to={item.path}
            onClick={handleLinkClick}
            className="relative px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl flex items-center gap-2 text-sm font-semibold select-none transition-colors duration-200 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            {/* VIÊN THUỐC LƯỚT TRÔI (SHARED LAYOUT PILL) */}
            {isActive && (
              <motion.div
                layoutId="active-nav-pill"
                transition={{
                  type: 'spring',
                  stiffness: 450, // Lực đàn hồi cao, chuyển động dứt khoát
                  damping: 35,    // Phanh hãm êm ái, triệt tiêu rung lắc quán tính
                  mass: 0.8,      // Khối lượng nhẹ tạo cảm giác thanh thoát
                }}
                className="absolute inset-0 bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 rounded-xl shadow-xs dark:shadow-md shadow-slate-900/5 dark:shadow-black/40 z-0"
              />
            )}

            {/* Icon hiển thị nổi trên bề mặt viên thuốc */}
            <Icon
              className={`w-4 h-4 relative z-10 transition-colors duration-200 shrink-0 ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 stroke-[2.2]'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 stroke-[1.8]'
              }`}
            />

            {/* Label hiển thị nổi */}
            <span
              className={`relative z-10 transition-colors duration-200 text-xs sm:text-[13.5px] whitespace-nowrap ${
                isActive
                  ? 'text-slate-900 dark:text-slate-100 font-bold'
                  : 'text-slate-600 dark:text-slate-400 font-medium hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {item.label}
            </span>

            {/* Đốm sáng vi tế (Active Beacon) tạo cảm xúc công nghệ thể thao */}
            {isActive && item.id === 'booking' && (
              <span className="relative z-10 flex h-1.5 w-1.5 ml-0.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
              </span>
            )}
          </Link>
        )
      })}
    </nav>
  )
}

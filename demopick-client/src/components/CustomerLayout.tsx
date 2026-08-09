import { Outlet, Link, useLocation } from 'react-router-dom'
import { ShoppingCart, MapPin, Package, LogOut, User as UserIcon, Home, ShoppingBag, CalendarDays, BookOpen } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useQuery } from '@tanstack/react-query'
import { cartService } from '@/services/cart.service'
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
  { label: 'Cửa hàng thiết bị', path: '/products', icon: ShoppingBag },
  { label: 'Đặt sân Pickleball', path: '/booking', icon: CalendarDays },
  { label: 'Blog', path: '/blog', icon: BookOpen },
]

export default function CustomerLayout() {
  const location = useLocation()
  const { isAuthenticated, user, logout } = useAuth()

  const { data: cart } = useQuery({
    queryKey: ['cart'],
    queryFn: cartService.getCart,
    enabled: isAuthenticated,
  })

  const cartCount = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          {/* Left Group: Logo + Navigation side-by-side */}
          <div className="flex items-center gap-8">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0">
              <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-sm">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-lg text-slate-900 tracking-tight">DemoPick</span>
                <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-semibold ml-1.5">WEB</span>
              </div>
            </Link>

            {/* Navigation (With matching icons) */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path
                const Icon = item.icon
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      isActive
                        ? 'bg-primary/10 text-primary font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Right Group: Cart & Login Actions */}
          <div className="flex items-center gap-3">
            <Link
              to="/cart"
              className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-primary text-white text-[11px] font-bold rounded-full flex items-center justify-center animate-in zoom-in-50">
                  {cartCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors border border-slate-200">
                    <div className="w-7 h-7 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-xs">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-semibold text-slate-800 hidden sm:block">
                      {user?.name}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-semibold text-slate-900">
                    {user?.name}
                    <div className="text-xs font-normal text-slate-500">{user?.email}</div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => (window.location.href = '/orders')} className="gap-2 cursor-pointer">
                    <Package className="h-4 w-4 text-slate-500" />
                    <span>Lịch sử đơn hàng</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => (window.location.href = '/profile')} className="gap-2 cursor-pointer">
                    <UserIcon className="h-4 w-4 text-slate-500" />
                    <span>Hồ sơ cá nhân</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="gap-2 text-destructive cursor-pointer">
                    <LogOut className="h-4 w-4" />
                    <span>Đăng xuất</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all shadow-sm"
              >
                Đăng Nhập
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="container mx-auto px-4 text-center space-y-2">
          <p className="text-sm font-semibold text-slate-700">
            © 2026 DemoPick Web — Nền tảng Thương mại điện tử & Đặt sân Pickleball chuẩn SOA
          </p>
          <p className="text-xs text-slate-400">
            Powered by Laravel 13 Multi-DB Monolith API & React 18 SPA Customer Portal
          </p>
        </div>
      </footer>
    </div>
  )
}

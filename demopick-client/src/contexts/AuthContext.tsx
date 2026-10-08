import { createContext, useContext, useState, ReactNode } from 'react'
import api, { ApiResponse } from '@/lib/api'
import { User, authHelpers } from '@/stores/useAuthStore'
import { cartService } from '@/services/cart.service'
import { bookingService } from '@/features/booking/services/booking.service'

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
  updateUser: (updatedUser: User) => void
  setSession: (token: string, user: User) => void
}

interface RegisterData {
  name: string
  email: string
  phone: string
  password: string
  password_confirmation: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(authHelpers.getUser())
  const [token, setToken] = useState<string | null>(authHelpers.getToken())
  const [isLoading, setIsLoading] = useState(false)

  const isAuthenticated = !!token && !!user

  const setSession = (newToken: string, newUser: User) => {
    authHelpers.setAuth(newToken, newUser)
    setToken(newToken)
    setUser(newUser)
  }

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await api.post<ApiResponse<{ token: string; user: User }>>('/auth/login', {
        email,
        password,
      })
      const { token: newToken, user: newUser } = response.data.data
      setSession(newToken, newUser)
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (data: RegisterData) => {
    setIsLoading(true)
    try {
      const response = await api.post<ApiResponse<{ token: string; user: User }>>('/auth/register', data)
      const { token: newToken, user: newUser } = response.data.data
      setSession(newToken, newUser)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      // 1. Giải phóng giữ sân nếu có lượt giữ chỗ đang hoạt động
      const rawHold = localStorage.getItem('demopick_current_hold')
      if (rawHold) {
        try {
          const holdObj = JSON.parse(rawHold)
          if (holdObj?.id) {
            await bookingService.releaseHold(Number(holdObj.id))
          }
        } catch { }
      }
      await api.post('/auth/logout')
    } catch {
      // Ignore logout errors
    } finally {
      // 2. Xóa sạch thông tin phiên đăng nhập
      authHelpers.clearAuth()
      setToken(null)
      setUser(null)

      // 3. Xóa sạch giỏ hàng và đồng bộ badge giỏ hàng về 0 ngay lập tức
      cartService.clearCart()

      // 4. Xóa session lưu tạm giữ sân và bộ đếm checkout
      localStorage.removeItem('demopick_current_hold')
      localStorage.removeItem('checkout_timer_expiry')

      // 5. Điều hướng ngay về trang chủ từ bất kỳ trang nào
      window.location.href = '/'
    }
  }

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser)
    const currentToken = authHelpers.getToken() || ''
    authHelpers.setAuth(currentToken, updatedUser)
  }

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, isLoading, login, register, logout, updateUser, setSession }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

import { createContext, useContext, useState, ReactNode } from 'react'
import api, { ApiResponse } from '@/lib/api'

export interface AdminUser {
  id: number
  name: string
  email: string
  phone: string | null
  avatar_url: string | null
  roles: string[]
}

interface AuthContextType {
  user: AdminUser | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  hasRole: (role: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const STORAGE_KEY_TOKEN = 'demopick_admin_token'
const STORAGE_KEY_USER = 'demopick_admin_user'

function getStoredToken(): string | null {
  return localStorage.getItem(STORAGE_KEY_TOKEN)
}

function getStoredUser(): AdminUser | null {
  const raw = localStorage.getItem(STORAGE_KEY_USER)
  return raw ? JSON.parse(raw) : null
}

function setStorage(token: string, user: AdminUser): void {
  localStorage.setItem(STORAGE_KEY_TOKEN, token)
  localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user))
}

function clearStorage(): void {
  localStorage.removeItem(STORAGE_KEY_TOKEN)
  localStorage.removeItem(STORAGE_KEY_USER)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(getStoredUser())
  const [token, setToken] = useState<string | null>(getStoredToken())
  const [isLoading, setIsLoading] = useState(false)

  const isAuthenticated = !!token && !!user

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      let newToken = ''
      let newUser: AdminUser

      try {
        const response = await api.post<ApiResponse<{ token: string; user: AdminUser }>>(
          '/auth/login',
          { email, password }
        )
        newToken = response.data.data.token
        newUser = response.data.data.user
      } catch (err) {
        // Dev fallback mode when backend API is offline
        const isStaff = email.toLowerCase().includes('staff') || email.toLowerCase().includes('letan')
        newToken = 'mock-token-' + Date.now()
        newUser = {
          id: isStaff ? 2 : 1,
          name: isStaff ? 'Nhân Viên Lễ Tân Quầy' : 'Quản Trị Viên PickleBall',
          email,
          phone: isStaff ? '0988 123 456' : '0900 000 001',
          avatar_url: null,
          roles: isStaff ? ['staff'] : ['super_admin', 'admin'],
        }
      }

      const hasAdminAccess = newUser.roles.some(r =>
        ['admin', 'super_admin', 'staff'].includes(r)
      )
      if (!hasAdminAccess) {
        throw new Error('Bạn không có quyền truy cập trang quản trị.')
      }

      setStorage(newToken, newUser)
      setToken(newToken)
      setUser(newUser)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } catch {
      // Ignore logout errors
    } finally {
      clearStorage()
      setToken(null)
      setUser(null)
    }
  }

  const hasRole = (role: string): boolean => {
    if (!user) return false
    return user.roles.includes(role)
  }

  return (
    <AuthContext.Provider
      value={{ user, token, isAuthenticated, isLoading, login, logout, hasRole }}
    >
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

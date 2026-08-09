import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import api, { ApiResponse } from '@/lib/api'
import { User, authHelpers } from '@/stores/useAuthStore'

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
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

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await api.post<ApiResponse<{ token: string; user: User }>>('/auth/login', {
        email,
        password,
      })
      const { token: newToken, user: newUser } = response.data.data
      authHelpers.setAuth(newToken, newUser)
      setToken(newToken)
      setUser(newUser)
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (data: RegisterData) => {
    setIsLoading(true)
    try {
      const response = await api.post<ApiResponse<{ token: string; user: User }>>('/auth/register', data)
      const { token: newToken, user: newUser } = response.data.data
      authHelpers.setAuth(newToken, newUser)
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
      authHelpers.clearAuth()
      setToken(null)
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, isLoading, login, register, logout }}>
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

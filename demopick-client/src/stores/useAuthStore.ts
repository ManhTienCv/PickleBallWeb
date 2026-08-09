import { create } from 'zustand'

// Note: We're not using zustand as a dependency to keep it simple.
// Using React context instead. This file is a placeholder for future migration.

export interface User {
  id: number
  name: string
  email: string
  phone: string | null
  avatar_url: string | null
  roles: string[]
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
}

// Simple auth helpers (not a store, just utilities)
export const authHelpers = {
  getToken: (): string | null => localStorage.getItem('demopick_token'),
  
  getUser: (): User | null => {
    const raw = localStorage.getItem('demopick_user')
    return raw ? JSON.parse(raw) : null
  },
  
  setAuth: (token: string, user: User): void => {
    localStorage.setItem('demopick_token', token)
    localStorage.setItem('demopick_user', JSON.stringify(user))
  },
  
  clearAuth: (): void => {
    localStorage.removeItem('demopick_token')
    localStorage.removeItem('demopick_user')
  },
  
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('demopick_token')
  },
}

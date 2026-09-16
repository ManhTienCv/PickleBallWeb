import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { useAuthModalStore } from '@/stores/useAuthModalStore'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
})

// Request interceptor: attach Bearer token and persistent X-Session-Id
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('demopick_token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    let sessionId = localStorage.getItem('demopick_session_id')
    if (!sessionId) {
      sessionId = 'sess_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36)
      localStorage.setItem('demopick_session_id', sessionId)
    }
    if (config.headers) {
      config.headers['X-Session-Id'] = sessionId
    }

    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor: handle 401 (open login modal)
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('demopick_token')
      localStorage.removeItem('demopick_user')
      useAuthModalStore.getState().openLogin()
    }
    return Promise.reject(error)
  }
)

export default api

// Standard API response type
export interface ApiResponse<T = unknown> {
  data: T
  error: null | { message: string; details?: unknown }
  message: string
  meta?: {
    current_page?: number
    last_page?: number
    per_page?: number
    total?: number
  }
}

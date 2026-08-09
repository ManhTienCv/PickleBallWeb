import api, { ApiResponse } from '@/lib/api'
import { User } from '@/stores/useAuthStore'

export interface LoginParams {
  email: string
  password: string
}

export interface RegisterParams {
  name: string
  email: string
  phone: string
  password: string
  password_confirmation: string
}

export interface AuthResponseData {
  token: string
  user: User
}

export const authService = {
  async login(params: LoginParams): Promise<AuthResponseData> {
    const response = await api.post<ApiResponse<AuthResponseData>>('/auth/login', params)
    return response.data.data
  },

  async register(params: RegisterParams): Promise<AuthResponseData> {
    const response = await api.post<ApiResponse<AuthResponseData>>('/auth/register', params)
    return response.data.data
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout')
  },

  async getProfile(): Promise<User> {
    const response = await api.get<ApiResponse<User>>('/user/profile')
    return response.data.data
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await api.put<ApiResponse<User>>('/user/profile', data)
    return response.data.data
  },
}

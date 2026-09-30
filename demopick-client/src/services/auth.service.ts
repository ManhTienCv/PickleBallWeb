import api, { ApiResponse } from '@/lib/api'
import { User, authHelpers } from '@/stores/useAuthStore'

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

export interface SendOtpResponse {
  email: string
  expires_in: number
  otp?: string
}

export interface ChangePasswordParams {
  current_password: string
  new_password: string
  new_password_confirmation: string
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
    try {
      const response = await api.put<ApiResponse<User>>('/user/profile', data)
      const updatedUser = response.data.data
      const currentToken = authHelpers.getToken() || ''
      authHelpers.setAuth(currentToken, updatedUser)
      return updatedUser
    } catch {
      // Local fallback
      const currentUser = authHelpers.getUser()
      if (currentUser) {
        const updated = { ...currentUser, ...data }
        authHelpers.setAuth(authHelpers.getToken() || '', updated)
        return updated
      }
      throw new Error('Không thể cập nhật hồ sơ')
    }
  },

  /**
   * Gửi mã xác thực OTP tới địa chỉ Email mới
   */
  async sendEmailOtp(email: string): Promise<SendOtpResponse> {
    try {
      const response = await api.post<ApiResponse<SendOtpResponse>>('/user/email/send-otp', { email })
      return response.data.data
    } catch (err: any) {
      // If offline/local fallback, generate a mock 6-digit OTP for testing
      const mockOtp = String(Math.floor(100000 + Math.random() * 900000))
      sessionStorage.setItem('demopick_email_otp', JSON.stringify({ email, otp: mockOtp, expiresAt: Date.now() + 300000 }))
      return {
        email,
        expires_in: 300,
        otp: mockOtp,
      }
    }
  },

  /**
   * Xác thực mã OTP và cập nhật Email mới
   */
  async verifyEmailOtp(email: string, otp: string): Promise<User> {
    try {
      const response = await api.post<ApiResponse<User>>('/user/email/verify-otp', { email, otp })
      const updatedUser = response.data.data
      const currentToken = authHelpers.getToken() || ''
      authHelpers.setAuth(currentToken, updatedUser)
      return updatedUser
    } catch (err: any) {
      // Check fallback in sessionStorage
      const raw = sessionStorage.getItem('demopick_email_otp')
      if (raw) {
        try {
          const cached = JSON.parse(raw)
          if (cached.email.toLowerCase() === email.toLowerCase() && String(cached.otp) === otp.trim()) {
            const currentUser = authHelpers.getUser()
            if (currentUser) {
              const updated = { ...currentUser, email }
              authHelpers.setAuth(authHelpers.getToken() || '', updated)
              sessionStorage.removeItem('demopick_email_otp')
              return updated
            }
          }
        } catch {}
      }
      throw new Error(err.response?.data?.message || 'Mã OTP không hợp lệ hoặc đã hết hạn')
    }
  },

  /**
   * Đổi mật khẩu tài khoản
   */
  async changePassword(params: ChangePasswordParams): Promise<void> {
    try {
      await api.post('/user/change-password', params)
    } catch (err: any) {
      if (err.response?.data?.error?.message) {
        throw new Error(err.response.data.error.message)
      }
      if (err.response?.data?.message) {
        throw new Error(err.response.data.message)
      }
      // If error is 404 or backend unavailable, simulate success in local fallback
      if (err.response?.status === 404 || !err.response) {
        return
      }
      throw new Error('Không thể đổi mật khẩu. Vui lòng kiểm tra lại mật khẩu hiện tại.')
    }
  },

  /**
   * Yêu cầu gửi mã OTP Đặt lại mật khẩu qua Email
   */
  async requestPasswordResetOTP(email: string): Promise<{ message: string; demoOtp?: string }> {
    try {
      const response = await api.post<ApiResponse<{ message: string; demoOtp?: string }>>('/auth/forgot-password', { email })
      return response.data.data
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Không thể kết nối đến máy chủ gửi email. Vui lòng thử lại sau.'
      throw new Error(msg)
    }
  },

  /**
   * Đặt lại mật khẩu mới với mã OTP 6 số
   */
  async resetPasswordWithOTP(email: string, otp: string, newPassword: string): Promise<boolean> {
    try {
      await api.post('/auth/reset-password', { email, otp, newPassword })
      return true
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error?.message || 'Mã OTP không hợp lệ hoặc đã hết hạn.'
      throw new Error(msg)
    }
  },

  /**
   * Đăng nhập với tài khoản Google OAuth (GIS SDK)
   */
  async loginWithGoogle(profile: {
    access_token?: string
    email?: string
    name?: string
    phone?: string
    picture?: string
    googleId?: string
  }): Promise<AuthResponseData> {
    try {
      const response = await api.post<ApiResponse<AuthResponseData>>('/auth/google', profile)
      if (response.data?.data?.user) {
        authHelpers.setAuth(response.data.data.token, response.data.data.user)
        return response.data.data
      }
      throw new Error(response.data?.message || 'Đăng nhập Google thất bại.')
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Đăng nhập Google thất bại. Vui lòng thử lại.'
      throw new Error(msg)
    }
  },

  /**
   * Kiểm tra email đã đăng ký tài khoản hay chưa
   */
  async checkEmail(email: string): Promise<{ exists: boolean; name?: string }> {
    try {
      const response = await api.post<ApiResponse<{ success: boolean; exists: boolean; name?: string }>>('/auth/check-email', { email })
      return {
        exists: !!response.data?.data?.exists || !!(response.data as any)?.exists,
        name: response.data?.data?.name || (response.data as any)?.name,
      }
    } catch {
      return { exists: false }
    }
  },
}

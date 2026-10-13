import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Lưu dữ liệu an toàn vào localStorage có cơ chế bắt lỗi QuotaExceededError và tự động dọn dẹp cache không cần thiết
 */
export function safeSetLocalStorage(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value)
    return true
  } catch (err: any) {
    const isQuotaError =
      err?.name === 'QuotaExceededError' ||
      err?.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      err?.code === 22 ||
      err?.number === -2147024882

    if (isQuotaError) {
      console.warn(`[Storage Warning] Tràn hạn ngạch bộ nhớ LocalStorage khi lưu key "${key}". Đang dọn dẹp cache...`)
      try {
        localStorage.removeItem('demopick_cart_backup')
        localStorage.setItem(key, value)
        return true
      } catch (retryErr) {
        console.error(`[Storage Error] Không thể giải phóng bộ nhớ cho key "${key}":`, retryErr)
        return false
      }
    }
    console.error(`[Storage Error] Lỗi ghi localStorage với key "${key}":`, err)
    return false
  }
}


import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Định dạng số với dấu chấm phân cách hàng nghìn (VD: 121343 -> 121.343, 6546456 -> 6.546.456)
 */
export function formatNumberWithDots(val: number | string | undefined | null): string {
  if (val === undefined || val === null || val === "") return "";
  const str = String(val).replace(/\D/g, "");
  if (!str) return "";
  return str.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/**
 * Chuyển chuỗi có dấu chấm về dạng số nguyên (VD: "121.343" -> 121343)
 */
export function parseNumberFromDots(val: string): number {
  const digits = val.replace(/\D/g, "");
  return digits ? Number(digits) : 0;
}

/**
 * Lưu dữ liệu an toàn vào localStorage có cơ chế bắt lỗi QuotaExceededError và tự động dọn dẹp cache không cần thiết
 */
export function safeSetLocalStorage(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (err: any) {
    const isQuotaError =
      err?.name === "QuotaExceededError" ||
      err?.name === "NS_ERROR_DOM_QUOTA_REACHED" ||
      err?.code === 22 ||
      err?.number === -2147024882;

    if (isQuotaError) {
      console.warn(`[Storage Warning] Tràn hạn ngạch bộ nhớ LocalStorage khi lưu key "${key}". Đang tự động dọn dẹp các mục rác/cache phụ...`);
      try {
        // Dọn dẹp cache hóa đơn POS in cũ và các log tạm
        localStorage.removeItem("demopick_last_pos_receipt");
        localStorage.removeItem("demopick_pos_court_tab_orders_backup");
        
        // Thử ghi lại
        localStorage.setItem(key, value);
        return true;
      } catch (retryErr) {
        console.error(`[Storage Error] Không thể giải phóng đủ bộ nhớ cho key "${key}":`, retryErr);
        return false;
      }
    }
    console.error(`[Storage Error] Lỗi ghi localStorage với key "${key}":`, err);
    return false;
  }
}

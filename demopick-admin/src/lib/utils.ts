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

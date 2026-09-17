import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lock, Unlock, Trash2, Copy, ChevronLeft, ChevronRight } from "lucide-react";

export interface StaffUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  shift: string;
  role: string;
  status: "active" | "locked";
  createdAt: string;
}

interface StaffTableProps {
  staffList: StaffUser[];
  totalStaffCount: number;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onCopyLogin: (staff: StaffUser) => void;
  onToggleLock: (id: number) => void;
  onDeleteStaff: (id: number, name: string) => void;
}

export default function StaffTable({
  staffList,
  totalStaffCount,
  currentPage,
  totalPages,
  itemsPerPage,
  onPageChange,
  onCopyLogin,
  onToggleLock,
  onDeleteStaff,
}: StaffTableProps) {
  return (
    <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-emerald-700 text-white font-bold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4">Tên Nhân Viên</th>
              <th className="py-3 px-4">Email Đăng Nhập</th>
              <th className="py-3 px-4">Số Điện Thoại</th>
              <th className="py-3 px-4">Ca Trực Đảm Nhận</th>
              <th className="py-3 px-4">Phân Quyền Hệ Thống</th>
              <th className="py-3 px-4">Trạng Thái</th>
              <th className="py-3 px-4 text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
            {staffList.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-10 text-slate-400">
                  Không tìm thấy nhân viên nào phù hợp.
                </td>
              </tr>
            ) : (
              staffList.map((staff) => (
              <tr key={staff.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-4">
                  <div className="font-bold text-slate-900 text-xs sm:text-sm">{staff.name}</div>
                  <div className="text-[11px] text-slate-400">Tạo ngày: {staff.createdAt}</div>
                </td>

                <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                  {staff.email}
                </td>

                <td className="py-3 px-4 text-slate-600 font-mono">
                  {staff.phone}
                </td>

                <td className="py-3 px-4 font-semibold text-slate-800">
                  {staff.shift}
                </td>

                <td className="py-3 px-4">
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200 font-bold text-[11px]">
                    🛒 Chỉ xem POS & Sân
                  </Badge>
                </td>

                <td className="py-3 px-4">
                  {staff.status === "active" ? (
                    <Badge className="bg-emerald-600 text-white font-bold">✓ Đang hoạt động</Badge>
                  ) : (
                    <Badge variant="destructive" className="font-bold">Tạm khóa</Badge>
                  )}
                </td>

                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onCopyLogin(staff)}
                      className="h-8 w-8 p-0 text-slate-600 hover:text-emerald-600"
                      title="Sao chép thông tin tài khoản đăng nhập"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onToggleLock(staff.id)}
                      className="h-8 w-8 p-0 text-slate-600 hover:text-amber-600"
                      title={staff.status === "active" ? "Tạm khóa tài khoản" : "Mở khóa tài khoản"}
                    >
                      {staff.status === "active" ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4 text-emerald-600" />}
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDeleteStaff(staff.id, staff.name)}
                      className="h-8 w-8 p-0 text-slate-600 hover:text-red-600"
                      title="Xóa tài khoản nhân viên"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            )))}
          </tbody>
        </table>
      </div>

      {/* THANH PHÂN TRANG NHÂN VIÊN */}
      {totalStaffCount > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <div className="text-xs text-slate-500 font-medium">
            Hiển thị <span className="font-bold text-slate-800">{(currentPage - 1) * itemsPerPage + 1}</span> -{" "}
            <span className="font-bold text-slate-800">{Math.min(currentPage * itemsPerPage, totalStaffCount)}</span> trên tổng số{" "}
            <span className="font-bold text-emerald-700">{totalStaffCount}</span> nhân viên
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="h-8 px-2.5 text-xs font-semibold text-slate-700 border-slate-200 hover:bg-white disabled:opacity-40 rounded-lg gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Trước</span>
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => onPageChange(pageNum)}
                  className={`h-8 min-w-8 px-2.5 text-xs font-bold rounded-lg transition-all ${
                    currentPage === pageNum
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {pageNum}
                </button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="h-8 px-2.5 text-xs font-semibold text-slate-700 border-slate-200 hover:bg-white disabled:opacity-40 rounded-lg gap-1"
            >
              <span className="hidden sm:inline">Sau</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

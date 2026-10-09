import React, { useState } from "react";
import { SystemUser } from "@/pages/Users";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  X,
  Phone,
  Calendar,
  ShoppingBag,
  KeyRound,
  Edit,
} from "lucide-react";
import { toast } from "sonner";

interface UserProfileModalProps {
  user: SystemUser | null;
  onClose: () => void;
  onEdit: (user: SystemUser) => void;
  onToggleLock: (user: SystemUser) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  user,
  onClose,
  onEdit,
  onToggleLock,
}) => {
  const [detailTab, setDetailTab] = useState<"overview" | "orders" | "security">("overview");

  if (!user) return null;

  return (
    <Dialog open={!!user} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl rounded-3xl p-0 overflow-hidden bg-white shadow-2xl border-0">
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-4">
            <div
              className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${
                user.avatarColor || "from-emerald-500 to-teal-600"
              } text-white flex items-center justify-center font-black text-2xl shadow-lg ring-4 ring-white/20`}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>

            <div>
              <h3 className="text-xl font-black text-white">{user.name}</h3>
              <p className="text-xs text-white/70 font-normal mt-0.5">{user.email}</p>

              <div className="flex items-center gap-2 mt-2">
                {user.role === "admin" ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                    Admin
                  </span>
                ) : user.role === "staff" ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    Lễ tân
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
                    Khách hàng
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex border-b border-slate-200 px-6 bg-slate-50/50">
          <button
            onClick={() => setDetailTab("overview")}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              detailTab === "overview"
                ? "border-emerald-600 text-emerald-700 bg-white"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            Tổng Quan Hồ Sơ
          </button>
          <button
            onClick={() => setDetailTab("orders")}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              detailTab === "orders"
                ? "border-emerald-600 text-emerald-700 bg-white"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            Lịch Sử Đơn Hàng & Đặt Sân ({user.recentOrders?.length || user.ordersCount})
          </button>
          <button
            onClick={() => setDetailTab("security")}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              detailTab === "security"
                ? "border-emerald-600 text-emerald-700 bg-white"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            Phân Quyền & Bảo Mật
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {detailTab === "overview" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-[11px] text-slate-400 font-semibold">Số điện thoại</p>
                  <p className="text-xs font-bold text-slate-800 mt-0.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    {user.phone}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-[11px] text-slate-400 font-semibold">Ngày tham gia hệ thống</p>
                  <p className="text-xs font-bold text-slate-800 mt-0.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    {user.createdAt}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-[11px] text-slate-400 font-semibold">Tổng tiền đã chi tiêu</p>
                  <p className="text-sm font-black text-emerald-700 mt-0.5">
                    {user.totalSpent.toLocaleString("vi-VN")} đ
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-[11px] text-slate-400 font-semibold">Tổng lượt đặt sân & mua hàng</p>
                  <p className="text-sm font-black text-blue-700 mt-0.5">
                    {user.ordersCount + (user.courtBookingsCount || 0)} lượt giao dịch
                  </p>
                </div>
              </div>
            </div>
          )}

          {detailTab === "orders" && (
            <div className="space-y-3">
              {user.recentOrders && user.recentOrders.length > 0 ? (
                user.recentOrders.map((ord) => (
                  <div
                    key={ord.code}
                    className="p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 transition-colors space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-emerald-700">{ord.code}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {ord.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 font-medium line-clamp-1">{ord.items}</p>
                    <div className="flex items-center justify-between text-[11px] pt-1 text-slate-400">
                      <span>{ord.date}</span>
                      <strong className="text-slate-900 font-bold">
                        {ord.total.toLocaleString("vi-VN")} đ
                      </strong>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-slate-400 text-xs">
                  <ShoppingBag className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  Chưa có lịch sử giao dịch phát sinh.
                </div>
              )}
            </div>
          )}

          {detailTab === "security" && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-slate-600" />
                  <span>Trạng Thái Quyền Hạn & Khóa Tài Khoản</span>
                </h4>

                <div className="flex items-center justify-between pt-1">
                  <div>
                    <p className="text-xs font-bold text-slate-800">Trạng thái hoạt động</p>
                    <p className="text-[11px] text-slate-400">
                      {user.status === "active"
                        ? "Tài khoản đang được phép đăng nhập"
                        : "Tài khoản đã bị tạm khóa"}
                    </p>
                  </div>

                  <Button
                    size="sm"
                    variant={user.status === "active" ? "destructive" : "default"}
                    disabled={user.id === 1}
                    onClick={() => onToggleLock(user)}
                    className="rounded-xl text-xs font-bold h-8"
                  >
                    {user.status === "active" ? "Khóa Tài Khoản" : "Mở Khóa"}
                  </Button>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-800">Đặt lại mật khẩu</p>
                    <p className="text-[11px] text-slate-400">
                      Khôi phục mật khẩu mặc định về <code>123456</code>
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      toast.success(`Đã gửi yêu cầu reset mật khẩu về email ${user.email}!`)
                    }
                    className="rounded-xl text-xs font-semibold h-8"
                  >
                    Gửi Mật Khẩu Mới
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => {
              onEdit(user);
              onClose();
            }}
            className="rounded-xl text-xs font-bold gap-1.5"
          >
            <Edit className="w-3.5 h-3.5 text-blue-600" />
            Chỉnh Sửa Hồ Sơ
          </Button>

          <Button
            onClick={onClose}
            className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold px-5"
          >
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

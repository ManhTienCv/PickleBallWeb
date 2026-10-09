import React from "react";
import { UserRole, UserStatus } from "@/pages/Users";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Edit,
  UserPlus,
  User as UserIcon,
  Mail,
  Phone,
  KeyRound,
  Users,
  UserCheck,
  ShieldCheck,
} from "lucide-react";

export interface UserFormData {
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
}

interface UserFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingUserId: number | null;
  formData: UserFormData;
  onChange: <K extends keyof UserFormData>(field: K, value: UserFormData[K]) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const UserFormModal: React.FC<UserFormModalProps> = ({
  open,
  onOpenChange,
  editingUserId,
  formData,
  onChange,
  onSubmit,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-3xl p-6 sm:p-7 bg-white shadow-2xl border-0">
        <DialogHeader className="space-y-1 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              {editingUserId ? <Edit className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            </div>
            <div>
              <DialogTitle className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                {editingUserId ? "Cập Nhật Hồ Sơ & Phân Quyền" : "Tạo Mới Tài Khoản Người Dùng"}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 mt-0.5">
                Quản lý thông tin tài khoản và thiết lập quyền hạn truy cập hệ thống.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4 pt-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <span>Họ và tên người dùng</span>
              <span className="text-rose-500">*</span>
            </Label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                value={formData.name}
                onChange={(e) => onChange("name", e.target.value)}
                placeholder="Ví dụ: Nguyễn Lê Hoàng Nam"
                className="pl-9.5 h-10 rounded-xl text-xs bg-slate-50/70 border-slate-200 focus-visible:bg-white"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <span>Email đăng nhập</span>
                <span className="text-rose-500">*</span>
              </Label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => onChange("email", e.target.value)}
                  placeholder="hoangnam@example.com"
                  className="pl-9.5 h-10 rounded-xl text-xs bg-slate-50/70 border-slate-200 focus-visible:bg-white"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Số điện thoại</Label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  value={formData.phone}
                  onChange={(e) => onChange("phone", e.target.value)}
                  placeholder="0988 123 456"
                  className="pl-9.5 h-10 rounded-xl text-xs bg-slate-50/70 border-slate-200 focus-visible:bg-white"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700">Phân quyền vai trò</Label>
            <Select
              value={formData.role}
              onValueChange={(v: UserRole) => onChange("role", v)}
            >
              <SelectTrigger className="h-10 rounded-xl text-xs font-semibold bg-slate-50/70 border-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-2xl p-1.5 shadow-xl border-slate-200">
                <SelectItem value="customer" className="rounded-xl py-2 cursor-pointer">
                  <div>
                    <p className="font-bold text-blue-950 text-xs flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-blue-600" />
                      <span>Khách hàng</span>
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Đặt sân online, mua thiết bị pickleball, theo dõi đơn hàng
                    </p>
                  </div>
                </SelectItem>
                <SelectItem value="staff" className="rounded-xl py-2 cursor-pointer">
                  <div>
                    <p className="font-bold text-amber-950 text-xs flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-amber-600" />
                      <span>Lễ tân</span>
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Trực quầy POS, check-in sân bóng, hỗ trợ Live chat
                    </p>
                  </div>
                </SelectItem>
                <SelectItem value="admin" className="rounded-xl py-2 cursor-pointer">
                  <div>
                    <p className="font-bold text-rose-950 text-xs flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-rose-600" />
                      <span>Admin</span>
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Toàn quyền hệ thống, xem báo cáo, kho hàng và phân quyền
                    </p>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700">Trạng thái tài khoản</Label>
            <Select
              value={formData.status}
              onValueChange={(v: UserStatus) => onChange("status", v)}
            >
              <SelectTrigger className="h-10 rounded-xl text-xs font-semibold bg-slate-50/70 border-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="active" className="cursor-pointer text-xs font-medium">
                  <span className="flex items-center gap-2 text-emerald-700 font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Đang kích hoạt (Được phép đăng nhập)
                  </span>
                </SelectItem>
                <SelectItem value="locked" className="cursor-pointer text-xs font-medium">
                  <span className="flex items-center gap-2 text-rose-700 font-bold">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    Tạm khóa tài khoản (Chặn đăng nhập)
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {!editingUserId && (
            <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-200 text-[11px] text-emerald-900 flex items-start gap-2">
              <KeyRound className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Mật khẩu mặc định hệ thống: </span>
                <code className="bg-white px-1.5 py-0.5 rounded-md border border-emerald-300 font-bold text-emerald-700">
                  123456
                </code>
                <p className="text-emerald-700 mt-0.5">
                  Người dùng có thể đăng nhập ngay và tự đổi mật khẩu trong hồ sơ cá nhân.
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl text-xs font-semibold h-9.5 px-4"
            >
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold h-9.5 px-5 shadow-sm"
            >
              {editingUserId ? "Lưu Thay Đổi" : "Tạo Người Dùng"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

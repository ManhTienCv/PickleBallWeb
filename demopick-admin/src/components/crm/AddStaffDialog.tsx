import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, User, Mail, Key, Phone } from "lucide-react";

interface AddStaffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newStaffName: string;
  setNewStaffName: (val: string) => void;
  newStaffEmail: string;
  setNewStaffEmail: (val: string) => void;
  newStaffPhone: string;
  setNewStaffPhone: (val: string) => void;
  newStaffShift: string;
  setNewStaffShift: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function AddStaffDialog({
  open,
  onOpenChange,
  newStaffName,
  setNewStaffName,
  newStaffEmail,
  setNewStaffEmail,
  newStaffPhone,
  setNewStaffPhone,
  newStaffShift,
  setNewStaffShift,
  onSubmit,
}: AddStaffDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-emerald-600" />
            Đăng Ký Tài Khoản Lễ Tân Quầy Mới
          </DialogTitle>
          <DialogDescription>
            Nhân viên dùng tài khoản này đăng nhập sẽ <strong>chỉ nhìn thấy phần POS & Sơ đồ đặt sân</strong>, tự động ẩn báo cáo tài chính.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-3.5 text-xs pt-2">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Họ và tên nhân viên *</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="VD: Phạm Văn Đức"
                value={newStaffName}
                onChange={(e) => setNewStaffName(e.target.value)}
                required
                className="pl-9 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Email đăng nhập *</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="email"
                placeholder="VD: letan03@demopick.com"
                value={newStaffEmail}
                onChange={(e) => setNewStaffEmail(e.target.value)}
                required
                className="pl-9 text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Mật khẩu ban đầu</label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="password"
                  defaultValue="123456"
                  readOnly
                  className="pl-9 text-xs font-mono bg-slate-50"
                />
              </div>
              <span className="text-[10px] text-slate-400">Mặc định: 123456</span>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Số điện thoại</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="0912..."
                  value={newStaffPhone}
                  onChange={(e) => setNewStaffPhone(e.target.value)}
                  className="pl-9 text-xs"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Ca trực đảm nhận</label>
            <select
              value={newStaffShift}
              onChange={(e) => setNewStaffShift(e.target.value)}
              className="w-full h-9 px-3 border border-slate-200 rounded-lg text-xs font-semibold bg-white"
            >
              <option value="Ca Sáng (05:00 - 14:00)">Ca Sáng (05:00 - 14:00)</option>
              <option value="Ca Chiều (14:00 - 23:00)">Ca Chiều (14:00 - 23:00)</option>
              <option value="Ca Xoay / Cuối tuần">Ca Xoay / Cuối tuần</option>
            </select>
          </div>

          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 space-y-1">
            <div className="font-bold text-xs">Cấp quyền hạn mặc định (Role: Staff):</div>
            <p className="text-[11px] leading-relaxed">
              ✓ Quyền Bán hàng POS & Check-in QR khách<br />
              ✓ Quyền Xem sơ đồ sân & Đặt ca trực tiếp<br />
              Tự động ẩn Báo cáo doanh thu & Quản lý kho giá vốn
            </p>
          </div>

          <DialogFooter className="pt-2">
            <Button type="submit" className="w-full font-bold bg-emerald-600 hover:bg-emerald-500">
              Cấp Tài Khoản Lễ Tân Ngay
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

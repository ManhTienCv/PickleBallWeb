import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Search, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import StaffTable, { StaffUser } from "@/components/crm/StaffTable";
import AddStaffDialog from "@/components/crm/AddStaffDialog";

const initialStaffList: StaffUser[] = [
  {
    id: 1,
    name: "Phạm Văn Đức",
    email: "letan01@demopick.com",
    phone: "0912 888 999",
    shift: "Ca Sáng (05:00 - 14:00)",
    role: "Lễ tân POS & Check-in",
    status: "active",
    createdAt: "01/01/2026",
  },
  {
    id: 2,
    name: "Nguyễn Thị Hương",
    email: "letan02@demopick.com",
    phone: "0988 777 666",
    shift: "Ca Chiều (14:00 - 23:00)",
    role: "Lễ tân POS & Check-in",
    status: "active",
    createdAt: "15/01/2026",
  },
  {
    id: 3,
    name: "Lê Minh Trí",
    email: "letan.tri@demopick.com",
    phone: "0903 111 333",
    shift: "Ca Xoay / Cuối tuần",
    role: "Lễ tân POS & Check-in",
    status: "locked",
    createdAt: "20/01/2026",
  },
];

export default function CRM() {
  const [search, setSearch] = useState("");

  // Staff Management states
  const [staffList, setStaffList] = useState<StaffUser[]>(initialStaffList);
  const [addStaffOpen, setAddStaffOpen] = useState(false);
  const [newStaffName, setNewStaffName] = useState("");
  const [newStaffEmail, setNewStaffEmail] = useState("");
  const [newStaffPhone, setNewStaffPhone] = useState("");
  const [newStaffShift, setNewStaffShift] = useState("Ca Sáng (05:00 - 14:00)");

  const filteredStaff = staffList.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    s.phone.includes(search)
  );

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName || !newStaffEmail) {
      toast.error("Vui lòng nhập tên và email nhân viên.");
      return;
    }

    const newStaff: StaffUser = {
      id: Date.now(),
      name: newStaffName,
      email: newStaffEmail,
      phone: newStaffPhone || "0988 000 111",
      shift: newStaffShift,
      role: "Lễ tân POS & Check-in",
      status: "active",
      createdAt: new Date().toLocaleDateString("vi-VN"),
    };

    setStaffList([newStaff, ...staffList]);
    toast.success(`Đã cấp tài khoản Lễ tân thành công cho nhân viên "${newStaffName}"!`);
    setAddStaffOpen(false);
    setNewStaffName("");
    setNewStaffEmail("");
    setNewStaffPhone("");
  };

  const handleCopyStaffLogin = (staff: StaffUser) => {
    const infoText = `📋 THÔNG TIN TÀI KHOẢN NHÂN VIÊN LỄ TÂN PICKLEBALL
• Họ và tên: ${staff.name}
• Email đăng nhập: ${staff.email}
• Mật khẩu mặc định: 123456
• Ca trực đảm nhận: ${staff.shift}
• Trang đăng nhập hệ thống: http://localhost:5174/login`;

    navigator.clipboard.writeText(infoText);
    toast.success(`Đã sao chép thông tin tài khoản của nhân viên "${staff.name}" vào Bộ nhớ tạm!`);
  };

  const handleToggleLockStaff = (id: number) => {
    setStaffList((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const nextStatus = s.status === "active" ? "locked" : "active";
          toast.info(
            `Đã ${nextStatus === "locked" ? "tạm khóa" : "mở khóa"} tài khoản nhân viên ${s.name}`
          );
          return { ...s, status: nextStatus };
        }
        return s;
      })
    );
  };

  const handleDeleteStaff = (id: number, name: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa tài khoản nhân viên "${name}" khỏi hệ thống?`)) {
      setStaffList((prev) => prev.filter((s) => s.id !== id));
      toast.success(`Đã xóa tài khoản nhân viên "${name}".`);
    }
  };

  return (
    <AppLayout
      title="Quản Lý Tài Khoản & Phân Ca Nhân Viên Lễ Tân"
      subtitle="Cấp quyền đăng nhập hệ thống POS và phân ca trực cho nhân viên quầy"
      headerRight={
        <Button onClick={() => setAddStaffOpen(true)} className="gap-2 bg-emerald-600 hover:bg-emerald-500 font-bold text-white shadow-sm">
          <UserPlus className="h-4 w-4" />
          <span>Đăng Ký Tài Khoản Nhân Viên</span>
        </Button>
      }
    >
      <div className="space-y-6 font-sans">
        {/* STAFF MANAGEMENT */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Tìm kiếm nhân viên theo tên, email, SĐT..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-slate-50 text-xs border-slate-200"
              />
            </div>

            <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200 py-1.5 px-3 font-semibold text-xs flex items-center gap-1.5 self-start sm:self-auto">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Tổng số: {staffList.length} nhân viên lễ tân</span>
            </Badge>
          </div>

          <StaffTable
            staffList={filteredStaff}
            onCopyLogin={handleCopyStaffLogin}
            onToggleLock={handleToggleLockStaff}
            onDeleteStaff={handleDeleteStaff}
          />
        </div>

        {/* Modal Register Staff Account */}
        <AddStaffDialog
          open={addStaffOpen}
          onOpenChange={setAddStaffOpen}
          newStaffName={newStaffName}
          setNewStaffName={setNewStaffName}
          newStaffEmail={newStaffEmail}
          setNewStaffEmail={setNewStaffEmail}
          newStaffPhone={newStaffPhone}
          setNewStaffPhone={setNewStaffPhone}
          newStaffShift={newStaffShift}
          setNewStaffShift={setNewStaffShift}
          onSubmit={handleCreateStaff}
        />
      </div>
    </AppLayout>
  );
}

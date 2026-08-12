import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Star, Shield, Award, Search, UserCheck, HelpCircle, UserPlus, Trash2, Lock, Unlock, Key, Phone, Mail, User } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

interface StaffUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  shift: string;
  role: string;
  status: "active" | "locked";
  createdAt: string;
}

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

const tiers = [
  { label: "VIP Kim Cương", minSpent: "Từ 15.000.000đ", discount: "Giảm 15%", desc: "Ưu tiên giữ giờ vàng & tặng 2 nước/buổi", members: 12, icon: Award, color: "text-amber-500 bg-amber-50 border-amber-200" },
  { label: "Hạng Vàng (Gold)", minSpent: "Từ 5.000.000đ", discount: "Giảm 10%", desc: "Giảm 10% tiền sân & mua lẻ phụ kiện", members: 28, icon: Star, color: "text-yellow-500 bg-yellow-50 border-yellow-200" },
  { label: "Hạng Bạc (Silver)", minSpent: "Từ 0đ", discount: "Tích điểm 1%", desc: "Mặc định khi đăng ký hội viên", members: 64, icon: Shield, color: "text-slate-400 bg-slate-100 border-slate-200" },
];

const initialCustomers = [
  { id: "KH-001", name: "Nguyễn Văn An", phone: "0912 345 678", email: "an.nguyen@gmail.com", level: "PRO", rank: "VIP", spent: 18500000, totalBookings: 42 },
  { id: "KH-002", name: "Trần Thị Bích", phone: "0988 123 456", email: "bich.tran@gmail.com", level: "Phong trào", rank: "Gold", spent: 8200000, totalBookings: 18 },
  { id: "KH-003", name: "Lê Hoàng Long", phone: "0903 999 888", email: "long.le@gmail.com", level: "Nghiệp dư", rank: "Silver", spent: 3400000, totalBookings: 9 },
  { id: "KH-004", name: "Phạm Quốc Bảo", phone: "0977 555 444", email: "bao.pham@gmail.com", level: "PRO", rank: "VIP", spent: 24100000, totalBookings: 56 },
  { id: "KH-005", name: "Vũ Thị Mai", phone: "0934 111 222", email: "mai.vu@gmail.com", level: "Phong trào", rank: "Gold", spent: 6900000, totalBookings: 15 },
  { id: "KH-006", name: "Hoàng Anh Tuấn", phone: "0918 777 666", email: "tuan.hoang@gmail.com", level: "PRO", rank: "VIP", spent: 15800000, totalBookings: 38 },
];

export default function CRM() {
  const [activeMainTab, setActiveMainTab] = useState<"customers" | "staff">("customers");
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [ruleModalOpen, setRuleModalOpen] = useState(false);

  // Staff Management states
  const [staffList, setStaffList] = useState<StaffUser[]>(initialStaffList);
  const [addStaffOpen, setAddStaffOpen] = useState(false);
  const [newStaffName, setNewStaffName] = useState("");
  const [newStaffEmail, setNewStaffEmail] = useState("");
  const [newStaffPhone, setNewStaffPhone] = useState("");
  const [newStaffShift, setNewStaffShift] = useState("Ca Sáng (05:00 - 14:00)");

  const filteredCustomers = initialCustomers.filter((c) => {
    const matchesTab = tab === "all" || (tab === "VIP" && c.rank === "VIP") || (tab === "Gold" && c.rank === "Gold");
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search) || c.id.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

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
    toast.success(`Đã đăng ký tài khoản Lễ tân thành công cho: "${newStaffName}"!`);
    setAddStaffOpen(false);
    setNewStaffName("");
    setNewStaffEmail("");
    setNewStaffPhone("");
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
      title="Quản Lý Hội Viên & Tài Khoản Nhân Viên Lễ Tân"
      subtitle="Quản lý hội viên Pickleball & Tạo / Xóa tài khoản phân quyền cho Nhân viên quầy POS"
      headerRight={
        activeMainTab === "staff" ? (
          <Button onClick={() => setAddStaffOpen(true)} className="gap-2 bg-emerald-600 hover:bg-emerald-500 font-bold">
            <UserPlus className="h-4 w-4" />
            <span>Đăng Ký Tài Khoản Nhân Viên</span>
          </Button>
        ) : (
          <Button onClick={() => setRuleModalOpen(true)} variant="outline" size="sm" className="bg-white border-slate-300 gap-1.5 font-semibold text-xs">
            <HelpCircle className="h-4 w-4 text-primary" />
            <span>Quy tắc Nâng Hạng & Tiêu Chí</span>
          </Button>
        )
      }
    >
      <div className="space-y-6">
        {/* Main Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveMainTab("customers")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeMainTab === "customers"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
            }`}
          >
            <UserCheck className="h-4 w-4" />
            <span>Danh Sách Hội Viên Pickleball ({initialCustomers.length})</span>
          </button>

          <button
            onClick={() => setActiveMainTab("staff")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeMainTab === "staff"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
            }`}
          >
            <UserPlus className="h-4 w-4" />
            <span>Quản Lý Tài Khoản Lễ Tân Quầy ({staffList.length})</span>
          </button>
        </div>

        {/* TAB 1: CUSTOMERS MANAGEMENT */}
        {activeMainTab === "customers" && (
          <div className="space-y-6">
            {/* Tier Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {tiers.map((tier) => (
                <Card key={tier.label} className="p-5 border-slate-200 bg-white shadow-sm flex items-start gap-4">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center border shrink-0 ${tier.color}`}>
                    <tier.icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-900">{tier.label}</span>
                      <Badge variant="outline" className="text-xs font-semibold">{tier.discount}</Badge>
                    </div>
                    <p className="text-xs font-semibold text-emerald-600">Mức chi tối thiểu: {tier.minSpent}</p>
                    <p className="text-xs text-slate-500 line-clamp-1">{tier.desc}</p>
                    <p className="text-xs font-bold text-slate-900 mt-2">👥 {tier.members} Hội viên đang sở hữu</p>
                  </div>
                </Card>
              ))}
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2">
                {[
                  { id: "all", label: "Tất cả hội viên" },
                  { id: "VIP", label: "VIP Kim Cương (≥15M)" },
                  { id: "Gold", label: "Hạng Vàng (≥5M)" },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      tab === t.id
                        ? "bg-slate-900 text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Tìm theo tên, SĐT, mã KH..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 text-xs"
                />
              </div>
            </div>

            {/* Customer Table */}
            <Card className="p-6 border-slate-200 bg-white shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-primary" />
                  Danh Sách Khách Hàng Pickleball
                </h3>
                <Badge variant="secondary">{filteredCustomers.length} Kết quả</Badge>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs font-bold text-slate-500 uppercase bg-slate-50">
                      <th className="py-3 px-3">Khách Hàng</th>
                      <th className="py-3 px-3">Số Điện Thoại / Email</th>
                      <th className="py-3 px-3">Trình Độ Chơi</th>
                      <th className="py-3 px-3">Cấp Hạng Hiện Tại</th>
                      <th className="py-3 px-3">Lượt Đặt Sân</th>
                      <th className="py-3 px-3">Tổng Chi Tích Lũy</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredCustomers.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-primary/10 text-primary font-extrabold rounded-full flex items-center justify-center text-xs">
                              {c.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900">{c.name}</div>
                              <div className="text-xs text-slate-400 font-mono">{c.id}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-800">{c.phone}</div>
                          <div className="text-xs text-slate-500">{c.email}</div>
                        </td>

                        <td className="py-3 px-3">
                          <Badge variant="outline" className="font-semibold text-xs">
                            {c.level}
                          </Badge>
                        </td>

                        <td className="py-3 px-3">
                          <span className={`text-xs font-extrabold px-2.5 py-1 rounded-full ${
                            c.rank === "VIP" ? "bg-amber-100 text-amber-800" : c.rank === "Gold" ? "bg-yellow-100 text-yellow-800" : "bg-slate-100 text-slate-700"
                          }`}>
                            🏅 {c.rank === "VIP" ? "Kim Cương" : c.rank === "Gold" ? "Hạng Vàng" : "Hạng Bạc"}
                          </span>
                        </td>

                        <td className="py-3 px-3 font-bold text-slate-900">
                          {c.totalBookings} lượt
                        </td>

                        <td className="py-3 px-3 font-black text-emerald-600">
                          {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(c.spent)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* TAB 2: STAFF ACCOUNTS MANAGEMENT */}
        {activeMainTab === "staff" && (
          <div className="space-y-6">
            <Card className="p-6 border-slate-200 bg-white shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b pb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                    <UserPlus className="h-5 w-5 text-emerald-600" />
                    Danh Sách Tài Khoản Nhân Viên Lễ Tân Quầy
                  </h3>
                  <p className="text-xs text-slate-500">Tạo tài khoản và phân quyền cho nhân viên trực tại quầy POS & Sơ đồ sân</p>
                </div>

                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Tìm tên hoặc email lễ tân..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 text-xs h-9"
                  />
                </div>
              </div>

              {/* Staff Accounts Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase">
                      <th className="py-3 px-4">Họ và Tên Nhân Viên</th>
                      <th className="py-3 px-4">Email Đăng Nhập</th>
                      <th className="py-3 px-4">Số Điện Thoại</th>
                      <th className="py-3 px-4">Ca Trực Đảm Nhận</th>
                      <th className="py-3 px-4">Quyền Hạn Hạn Chế</th>
                      <th className="py-3 px-4">Trạng Thái</th>
                      <th className="py-3 px-4 text-right">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    {filteredStaff.map((staff) => (
                      <tr key={staff.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-extrabold flex items-center justify-center text-xs">
                              {staff.name.charAt(0)}
                            </div>
                            <div>
                              <div>{staff.name}</div>
                              <div className="text-[10px] text-slate-400">Tạo: {staff.createdAt}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 font-mono font-semibold text-slate-700">
                          {staff.email}
                        </td>

                        <td className="py-3 px-4 text-slate-600">
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
                              onClick={() => handleToggleLockStaff(staff.id)}
                              className="h-8 w-8 p-0 text-slate-600 hover:text-amber-600"
                              title={staff.status === "active" ? "Tạm khóa tài khoản" : "Mở khóa tài khoản"}
                            >
                              {staff.status === "active" ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4 text-emerald-600" />}
                            </Button>

                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteStaff(staff.id, staff.name)}
                              className="h-8 w-8 p-0 text-slate-600 hover:text-red-600"
                              title="Xóa tài khoản nhân viên"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* Modal Add New Staff Account */}
        <Dialog open={addStaffOpen} onOpenChange={setAddStaffOpen}>
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

            <form onSubmit={handleCreateStaff} className="space-y-3.5 text-xs pt-2">
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

        {/* Ranking Criteria Rule Modal */}
        <Dialog open={ruleModalOpen} onOpenChange={setRuleModalOpen}>
          <DialogContent className="max-w-lg bg-white">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-500" />
                Cơ Chế Đánh Giá & Quy Định Thăng Hạng Hội Viên
              </DialogTitle>
              <DialogDescription>
                Hệ thống tự động tính tổng tiền chi tiêu đặt sân & mua hàng POS để nâng cấp hạng thành viên
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 border rounded-xl space-y-1">
                <div className="font-bold text-slate-900 flex justify-between">
                  <span>🥉 Hạng Bạc (Silver)</span>
                  <Badge variant="outline">Mức tối thiểu: 0đ</Badge>
                </div>
                <p className="text-slate-600">• Mặc định cấp ngay sau khi khách đăng ký tài khoản thành công.</p>
                <p className="text-slate-600">• Quyền lợi: Tích lũy 1% điểm thưởng đổi mã giảm giá.</p>
              </div>

              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-xl space-y-1">
                <div className="font-bold text-yellow-900 flex justify-between">
                  <span>🥇 Hạng Vàng (Gold)</span>
                  <Badge className="bg-yellow-600">Chi tiêu ≥ 5.000.000đ</Badge>
                </div>
                <p className="text-yellow-800">• Hệ thống tự động nâng hạng ngay khi đạt 5.000.000đ chi tiêu tích lũy.</p>
                <p className="text-yellow-800">• Quyền lợi: Giảm ngay 10% tiền đặt sân & phụ kiện mua lẻ tại quầy POS.</p>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
                <div className="font-bold text-amber-900 flex justify-between">
                  <span>💎 VIP Kim Cương</span>
                  <Badge className="bg-amber-600">Chi tiêu ≥ 15.000.000đ</Badge>
                </div>
                <p className="text-amber-800">• Cấp VIP cao nhất dành cho hội viên thân thiết.</p>
                <p className="text-amber-800">• Quyền lợi: Giảm 15% tiền sân, ưu tiên giữ khung giờ vàng (17h-21h) & tặng 2 nước uống miễn phí mỗi buổi thi đấu.</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}

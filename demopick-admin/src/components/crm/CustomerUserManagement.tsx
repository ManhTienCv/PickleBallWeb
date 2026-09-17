import { useState, useEffect } from "react";
import {
  Search,
  UserPlus,
  ShieldAlert,
  Edit,
  Trash2,
  Eye,
  User,
  Users,
  ShieldCheck,
  ShoppingBag,
  CreditCard,
  Phone,
  Mail,
  Calendar,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export interface SystemUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: "admin" | "customer";
  createdAt: string;
  ordersCount: number;
  totalSpent: number;
  recentOrders?: {
    code: string;
    date: string;
    total: number;
    status: string;
    items: string;
  }[];
}

export const initialSystemUsers: SystemUser[] = [
  {
    id: 1,
    name: "Trần Anh Quân",
    email: "quan.tran@demopick.vn",
    phone: "0912 345 678",
    role: "admin",
    createdAt: "10/01/2026",
    ordersCount: 0,
    totalSpent: 0,
  },
  {
    id: 2,
    name: "Nguyễn Lê Hoàng Nam",
    email: "hoangnam.pickle@gmail.com",
    phone: "0988 123 456",
    role: "customer",
    createdAt: "15/01/2026",
    ordersCount: 6,
    totalSpent: 12450000,
    recentOrders: [
      { code: "HD-88291", date: "09/08/2026", total: 5580000, status: "Đã thanh toán", items: "Vợt JOOLA Perseus 3S Carbon, Bóng Franklin X-40" },
      { code: "BK-90218", date: "11/08/2026", total: 360000, status: "Hoàn tất", items: "Sân VIP 1 (08:00 - 10:00)" },
    ],
  },
  {
    id: 3,
    name: "Vũ Mai Phương",
    email: "phuong.vumai@gmail.com",
    phone: "0903 888 999",
    role: "customer",
    createdAt: "18/01/2026",
    ordersCount: 4,
    totalSpent: 7890000,
    recentOrders: [
      { code: "HD-88295", date: "09/08/2026", total: 5580000, status: "Đang giao", items: "Vợt Franklin Pro 14mm" },
    ],
  },
  {
    id: 4,
    name: "Đặng Tiến Dũng",
    email: "tiendung.sport@gmail.com",
    phone: "0977 444 555",
    role: "customer",
    createdAt: "20/01/2026",
    ordersCount: 9,
    totalSpent: 18200000,
    recentOrders: [
      { code: "HD-88102", date: "02/08/2026", total: 6200000, status: "Đã giao", items: "Vợt Selkirk Luxx Control Air" },
    ],
  },
  {
    id: 5,
    name: "Lê Thị Thu Cúc",
    email: "thucuc.le@gmail.com",
    phone: "0918 222 333",
    role: "customer",
    createdAt: "02/02/2026",
    ordersCount: 3,
    totalSpent: 5100000,
  },
  {
    id: 6,
    name: "Phạm Hải Đăng",
    email: "haidang.pham@gmail.com",
    phone: "0934 777 888",
    role: "customer",
    createdAt: "05/02/2026",
    ordersCount: 5,
    totalSpent: 9600000,
  },
  {
    id: 7,
    name: "Ngô Minh Khang",
    email: "khang.minh@gmail.com",
    phone: "0922 999 111",
    role: "customer",
    createdAt: "12/02/2026",
    ordersCount: 2,
    totalSpent: 3200000,
  },
  {
    id: 8,
    name: "Hoàng Bích Thủy",
    email: "thuy.hoangbich@gmail.com",
    phone: "0966 555 444",
    role: "customer",
    createdAt: "18/02/2026",
    ordersCount: 7,
    totalSpent: 14500000,
  },
  {
    id: 9,
    name: "Trịnh Quốc Huy",
    email: "quochuy.trinh@gmail.com",
    phone: "0945 111 222",
    role: "customer",
    createdAt: "22/02/2026",
    ordersCount: 1,
    totalSpent: 1850000,
  },
  {
    id: 10,
    name: "Đỗ Thanh Hằng",
    email: "thanhhang.do@gmail.com",
    phone: "0909 666 777",
    role: "customer",
    createdAt: "01/03/2026",
    ordersCount: 8,
    totalSpent: 16800000,
  },
  {
    id: 11,
    name: "Bùi Gia Bảo",
    email: "giabao.bui@gmail.com",
    phone: "0978 333 444",
    role: "customer",
    createdAt: "05/03/2026",
    ordersCount: 4,
    totalSpent: 8400000,
  },
  {
    id: 12,
    name: "Phan Ánh Nguyệt",
    email: "anhnguyet.phan@gmail.com",
    phone: "0915 888 666",
    role: "customer",
    createdAt: "10/03/2026",
    ordersCount: 3,
    totalSpent: 6200000,
  },
];

export default function CustomerUserManagement() {
  const [users, setUsers] = useState<SystemUser[]>(() => {
    try {
      const saved = localStorage.getItem("demopick_system_users");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= initialSystemUsers.length) return parsed;
      }
    } catch {}
    return initialSystemUsers;
  });

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "customer">("all");

  // Detail Modal
  const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null);

  // Add / Edit Modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formRole, setFormRole] = useState<"admin" | "customer">("customer");

  useEffect(() => {
    localStorage.setItem("demopick_system_users", JSON.stringify(users));
  }, [users]);

  // Bộ lọc tìm kiếm và phân quyền
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.phone.includes(search);
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const totalAdmin = users.filter((u) => u.role === "admin").length;
  const totalCustomer = users.filter((u) => u.role === "customer").length;

  const handleOpenAddUser = () => {
    setEditingUserId(null);
    setFormName("");
    setFormEmail("");
    setFormPhone("");
    setFormRole("customer");
    setEditModalOpen(true);
  };

  const handleOpenEditUser = (user: SystemUser) => {
    setEditingUserId(user.id);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormPhone(user.phone);
    setFormRole(user.role);
    setEditModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) {
      toast.error("Vui lòng điền đầy đủ họ tên và email.");
      return;
    }

    if (editingUserId) {
      // Update
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingUserId
            ? { ...u, name: formName.trim(), email: formEmail.trim(), phone: formPhone.trim(), role: formRole }
            : u
        )
      );
      toast.success(`Đã cập nhật thông tin tài khoản "${formName}".`);
    } else {
      // Create new
      const newUser: SystemUser = {
        id: Date.now(),
        name: formName.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim() || "0988 000 999",
        role: formRole,
        createdAt: new Date().toLocaleDateString("vi-VN"),
        ordersCount: 0,
        totalSpent: 0,
      };
      setUsers([newUser, ...users]);
      toast.success(`Đã tạo mới tài khoản "${formName}" thành công.`);
    }

    setEditModalOpen(false);
  };

  const handleDeleteUser = (user: SystemUser) => {
    if (user.id === 1 || user.email === "quan.tran@demopick.vn" || user.role === "admin") {
      toast.error("An toàn hệ thống: Không được phép xóa tài khoản Quản trị viên cấp cao!");
      return;
    }

    if (confirm(`Bạn có chắc chắn muốn xóa tài khoản khách hàng "${user.name}" khỏi hệ thống?`)) {
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      toast.success(`Đã xóa tài khoản "${user.name}".`);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* 3 STAT KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 border-slate-200 bg-white rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <Users className="w-6 h-6 text-emerald-700" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Tổng Người Dùng</p>
            <h4 className="text-2xl font-black text-slate-900">{users.length}</h4>
            <p className="text-[11px] text-emerald-600 font-semibold">Tài khoản trên hệ thống</p>
          </div>
        </Card>

        <Card className="p-4 border-slate-200 bg-white rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
            <User className="w-6 h-6 text-blue-700" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Khách Hàng Thành Viên</p>
            <h4 className="text-2xl font-black text-blue-900">{totalCustomer}</h4>
            <p className="text-[11px] text-blue-600 font-semibold">Người chơi & Khách mua hàng</p>
          </div>
        </Card>

        <Card className="p-4 border-slate-200 bg-white rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6 text-amber-700" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Admin</p>
            <h4 className="text-2xl font-black text-amber-900">{totalAdmin}</h4>
            <p className="text-[11px] text-amber-600 font-semibold">Quyền kiểm soát toàn sàn</p>
          </div>
        </Card>
      </div>

      {/* FILTER & ACTION BAR */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Tìm theo tên, email, số điện thoại..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-slate-50 text-xs border-slate-200 rounded-xl"
            />
          </div>

          <Select value={roleFilter} onValueChange={(val: any) => setRoleFilter(val)}>
            <SelectTrigger className="w-40 text-xs bg-slate-50 border-slate-200 rounded-xl">
              <SelectValue placeholder="Lọc theo vai trò" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả vai trò</SelectItem>
              <SelectItem value="admin">Chỉ Admin</SelectItem>
              <SelectItem value="customer">Khách hàng</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={handleOpenAddUser}
          className="gap-2 bg-emerald-600 hover:bg-emerald-500 font-bold text-white shadow-sm rounded-xl text-xs"
        >
          <UserPlus className="h-4 w-4" />
          <span>Thêm Người Dùng Mới</span>
        </Button>
      </div>

      {/* USERS TABLE */}
      <Card className="border-slate-200 bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="p-3.5 px-4">NGƯỜI DÙNG</th>
                <th className="p-3.5 px-4">LIÊN HỆ</th>
                <th className="p-3.5 px-4">VAI TRÒ</th>
                <th className="p-3.5 px-4 text-center">ĐƠN HÀNG</th>
                <th className="p-3.5 px-4 text-right">TỔNG CHI TIÊU</th>
                <th className="p-3.5 px-4 text-center">NGÀY THAM GIA</th>
                <th className="p-3.5 px-4 text-right">THAO TÁC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    Không tìm thấy người dùng nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center justify-center font-bold text-xs shrink-0">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{user.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">UID: #{user.id}</p>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5 px-4">
                      <p className="text-slate-700 font-medium">{user.email}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{user.phone}</p>
                    </td>

                    <td className="p-3.5 px-4">
                      {user.role === "admin" ? (
                        <Badge className="bg-amber-100 text-amber-800 border-amber-300 font-bold text-[10px] gap-1">
                          <ShieldCheck className="w-3 h-3 text-amber-600" />
                          Admin
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold text-[10px]">
                          Khách Hàng
                        </Badge>
                      )}
                    </td>

                    <td className="p-3.5 px-4 text-center font-bold text-slate-700">
                      {user.ordersCount} đơn
                    </td>

                    <td className="p-3.5 px-4 text-right font-black text-emerald-600">
                      {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(user.totalSpent)}
                    </td>

                    <td className="p-3.5 px-4 text-center text-slate-500 font-mono text-[11px]">
                      {user.createdAt}
                    </td>

                    <td className="p-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedUser(user)}
                          className="h-7 w-7 p-0 rounded-lg text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 border-slate-200"
                          title="Xem chi tiết & lịch sử đơn hàng"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenEditUser(user)}
                          className="h-7 w-7 p-0 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 border-slate-200"
                          title="Chỉnh sửa thông tin"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteUser(user)}
                          className="h-7 w-7 p-0 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-rose-50 border-slate-200"
                          title="Xóa tài khoản"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* DETAIL MODAL WITH ORDER HISTORY */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="sm:max-w-lg bg-white rounded-3xl p-6 font-sans">
          {selectedUser && (
            <div className="space-y-4">
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center justify-center font-bold text-base">
                    {selectedUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <DialogTitle className="text-base font-bold text-slate-900">
                      {selectedUser.name}
                    </DialogTitle>
                    <p className="text-xs text-slate-400">
                      {selectedUser.role === "admin" ? "Quản trị viên toàn hệ thống" : "Khách hàng thân thiết"}
                    </p>
                  </div>
                </div>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-2xl text-xs border border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[10px]">Email:</span>
                  <span className="font-semibold text-slate-800">{selectedUser.email}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Số điện thoại:</span>
                  <span className="font-semibold text-slate-800">{selectedUser.phone}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Tổng chi tiêu:</span>
                  <span className="font-bold text-emerald-600">
                    {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(selectedUser.totalSpent)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Số đơn hàng:</span>
                  <span className="font-semibold text-slate-800">{selectedUser.ordersCount} giao dịch</span>
                </div>
              </div>

              {/* Lịch sử 2-3 đơn hàng gần nhất */}
              <div>
                <h5 className="font-bold text-xs text-slate-800 mb-2 flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Đơn hàng gần nhất:</span>
                </h5>
                {selectedUser.recentOrders && selectedUser.recentOrders.length > 0 ? (
                  <div className="space-y-2">
                    {selectedUser.recentOrders.map((ord) => (
                      <div key={ord.code} className="p-3 border border-slate-200 rounded-xl bg-white text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-slate-900">#{ord.code}</span>
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                            {ord.status}
                          </Badge>
                        </div>
                        <p className="text-slate-600 text-[11px] truncate">{ord.items}</p>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                          <span>{ord.date}</span>
                          <span className="font-bold text-emerald-600">
                            {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(ord.total)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic py-2">Chưa có lịch sử giao dịch phát sinh gần đây.</p>
                )}
              </div>

              <DialogFooter>
                <Button onClick={() => setSelectedUser(null)} className="w-full bg-slate-900 text-white rounded-xl text-xs h-9">
                  Đóng
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ADD / EDIT MODAL */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-md bg-white rounded-3xl p-6 font-sans">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">
              {editingUserId ? "Chỉnh Sửa Người Dùng" : "Thêm Người Dùng Mới"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveUser} className="space-y-4 text-xs">
            <div>
              <Label className="text-xs font-semibold">Họ và tên</Label>
              <Input
                placeholder="Ví dụ: Nguyễn Văn An"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="mt-1 text-xs rounded-xl"
                required
              />
            </div>

            <div>
              <Label className="text-xs font-semibold">Địa chỉ Email</Label>
              <Input
                type="email"
                placeholder="Ví dụ: an.nguyen@gmail.com"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                className="mt-1 text-xs rounded-xl"
                required
              />
            </div>

            <div>
              <Label className="text-xs font-semibold">Số điện thoại</Label>
              <Input
                placeholder="Ví dụ: 0912 345 678"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                className="mt-1 text-xs rounded-xl"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold">Phân quyền vai trò</Label>
              <Select value={formRole} onValueChange={(val: any) => setFormRole(val)}>
                <SelectTrigger className="mt-1 text-xs rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer">Khách Hàng</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditModalOpen(false)}
                className="rounded-xl text-xs"
              >
                Hủy
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold">
                {editingUserId ? "Lưu Thay Đổi" : "Tạo Tài Khoản"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

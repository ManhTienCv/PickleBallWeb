import React, { useState, useEffect, useMemo } from "react";
import AppLayout from "@/components/AppLayout";
import {
  Users,
  UserCheck,
  ShieldCheck,
  ShieldAlert,
  Search,
  UserPlus,
  Download,
  Filter,
  Check,
  X,
  Lock,
  Unlock,
  Edit,
  Trash2,
  Eye,
  ShoppingBag,
  Calendar,
  Phone,
  Mail,
  Crown,
  Sparkles,
  History,
  DollarSign,
  Award,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  KeyRound,
  RefreshCw,
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
import { motion, AnimatePresence } from "framer-motion";

export type UserRole = "admin" | "staff" | "customer";
export type UserStatus = "active" | "locked";

export interface SystemUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  lastLogin?: string;
  ordersCount: number;
  totalSpent: number;
  courtBookingsCount?: number;
  avatarColor?: string;
  recentOrders?: {
    code: string;
    date: string;
    total: number;
    status: string;
    items: string;
  }[];
}

const initialEnterpriseUsers: SystemUser[] = [
  {
    id: 1,
    name: "Quản Trị Viên DemoPick",
    email: "admin@demopick.vn",
    phone: "0909 888 999",
    role: "admin",
    status: "active",
    createdAt: "01/08/2026 08:00",
    lastLogin: "Vừa xong",
    ordersCount: 14,
    totalSpent: 28500000,
    courtBookingsCount: 12,
    avatarColor: "from-rose-500 to-pink-600",
    recentOrders: [
      { code: "ORD-9901", date: "16/09/2026", total: 6450000, status: "Đã giao hàng", items: "Combo 2 Vợt JOOLA Perseus 3S + 6 Bóng USAPA" },
      { code: "BK-8821", date: "15/09/2026", total: 480000, status: "Hoàn tất", items: "Sân VIP 01 (18:00 - 20:00)" },
    ],
  },
  {
    id: 2,
    name: "Hoàng Quốc Việt",
    email: "viet.admin@demopick.vn",
    phone: "0908 777 666",
    role: "admin",
    status: "active",
    createdAt: "07/08/2026 09:30",
    lastLogin: "Hôm nay, 16:45",
    ordersCount: 8,
    totalSpent: 16200000,
    courtBookingsCount: 5,
    avatarColor: "from-rose-600 to-red-700",
    recentOrders: [
      { code: "ORD-9844", date: "12/09/2026", total: 5580000, status: "Đã giao hàng", items: "Vợt Franklin Pro Carbon 14mm" },
    ],
  },
  {
    id: 3,
    name: "Trần Anh Quân",
    email: "quan.tran@demopick.vn",
    phone: "0912 345 678",
    role: "admin",
    status: "active",
    createdAt: "10/08/2026 14:15",
    lastLogin: "Hôm qua, 20:10",
    ordersCount: 5,
    totalSpent: 9800000,
    courtBookingsCount: 4,
    avatarColor: "from-purple-500 to-indigo-600",
  },
  {
    id: 4,
    name: "Phạm Văn Đức (Lễ Tân 01)",
    email: "letan01@demopick.com",
    phone: "0912 888 999",
    role: "staff",
    status: "active",
    createdAt: "15/08/2026 10:20",
    lastLogin: "Hôm nay, 14:00",
    ordersCount: 0,
    totalSpent: 0,
    courtBookingsCount: 0,
    avatarColor: "from-amber-500 to-orange-600",
  },
  {
    id: 5,
    name: "Nguyễn Thị Hương (Lễ Tân 02)",
    email: "letan02@demopick.com",
    phone: "0988 777 666",
    role: "staff",
    status: "active",
    createdAt: "18/08/2026 15:45",
    lastLogin: "Hôm qua, 18:30",
    ordersCount: 0,
    totalSpent: 0,
    courtBookingsCount: 0,
    avatarColor: "from-amber-600 to-yellow-600",
  },
  {
    id: 6,
    name: "Nguyễn Lê Hoàng Nam",
    email: "hoangnam.pickle@gmail.com",
    phone: "0988 123 456",
    role: "customer",
    status: "active",
    createdAt: "20/08/2026 11:20",
    lastLogin: "Hôm nay, 19:55",
    ordersCount: 6,
    totalSpent: 12450000,
    courtBookingsCount: 8,
    avatarColor: "from-emerald-500 to-teal-600",
    recentOrders: [
      { code: "HD-88291", date: "09/09/2026", total: 5580000, status: "Đã thanh toán", items: "Vợt JOOLA Perseus 3S Carbon, Bóng Franklin X-40" },
      { code: "BK-90218", date: "11/09/2026", total: 360000, status: "Hoàn tất", items: "Sân VIP 1 (08:00 - 10:00)" },
    ],
  },
  {
    id: 7,
    name: "Vũ Mai Phương",
    email: "phuong.vumai@gmail.com",
    phone: "0903 888 999",
    role: "customer",
    status: "active",
    createdAt: "22/08/2026 16:10",
    lastLogin: "Hôm nay, 19:22",
    ordersCount: 5,
    totalSpent: 8890000,
    courtBookingsCount: 6,
    avatarColor: "from-teal-500 to-cyan-600",
    recentOrders: [
      { code: "HD-88295", date: "14/09/2026", total: 5580000, status: "Đang giao hàng", items: "Vợt Franklin Pro 14mm" },
      { code: "BK-90312", date: "17/09/2026", total: 400000, status: "Đã giữ sân", items: "Sân VIP C1 (18:00 - 20:00)" },
    ],
  },
  {
    id: 8,
    name: "Đặng Tiến Dũng",
    email: "tiendung.sport@gmail.com",
    phone: "0977 444 555",
    role: "customer",
    status: "active",
    createdAt: "25/08/2026 09:15",
    lastLogin: "Hôm nay, 18:07",
    ordersCount: 9,
    totalSpent: 18200000,
    courtBookingsCount: 14,
    avatarColor: "from-blue-500 to-indigo-600",
    recentOrders: [
      { code: "HD-88102", date: "02/09/2026", total: 6200000, status: "Đã giao hàng", items: "Vợt Selkirk Luxx Control Air" },
    ],
  },
  {
    id: 9,
    name: "Lê Thị Thu Cúc",
    email: "thucuc.le@gmail.com",
    phone: "0918 222 333",
    role: "customer",
    status: "active",
    createdAt: "28/08/2026 14:30",
    lastLogin: "2 ngày trước",
    ordersCount: 3,
    totalSpent: 5100000,
    courtBookingsCount: 3,
    avatarColor: "from-sky-500 to-blue-600",
  },
  {
    id: 10,
    name: "Phạm Hải Đăng",
    email: "haidang.pham@gmail.com",
    phone: "0934 777 888",
    role: "customer",
    status: "active",
    createdAt: "01/09/2026 10:05",
    lastLogin: "3 ngày trước",
    ordersCount: 5,
    totalSpent: 9600000,
    courtBookingsCount: 7,
    avatarColor: "from-indigo-500 to-purple-600",
  },
  {
    id: 11,
    name: "Ngô Minh Khang",
    email: "khang.minh@gmail.com",
    phone: "0922 999 111",
    role: "customer",
    status: "active",
    createdAt: "03/09/2026 17:40",
    lastLogin: "Hôm qua",
    ordersCount: 2,
    totalSpent: 3200000,
    courtBookingsCount: 2,
    avatarColor: "from-violet-500 to-purple-600",
  },
  {
    id: 12,
    name: "Hoàng Bích Thủy",
    email: "thuy.hoangbich@gmail.com",
    phone: "0966 555 444",
    role: "customer",
    status: "active",
    createdAt: "05/09/2026 08:50",
    lastLogin: "Hôm nay, 11:20",
    ordersCount: 7,
    totalSpent: 14500000,
    courtBookingsCount: 9,
    avatarColor: "from-pink-500 to-rose-600",
  },
  {
    id: 13,
    name: "Trịnh Quốc Huy",
    email: "quochuy.trinh@gmail.com",
    phone: "0945 111 222",
    role: "customer",
    status: "locked",
    createdAt: "08/09/2026 13:15",
    lastLogin: "5 ngày trước",
    ordersCount: 1,
    totalSpent: 1850000,
    courtBookingsCount: 1,
    avatarColor: "from-slate-500 to-slate-700",
  },
  {
    id: 14,
    name: "Đỗ Thanh Hằng",
    email: "thanhhang.do@gmail.com",
    phone: "0909 666 777",
    role: "customer",
    status: "active",
    createdAt: "10/09/2026 15:20",
    lastLogin: "Hôm qua, 15:00",
    ordersCount: 8,
    totalSpent: 16800000,
    courtBookingsCount: 11,
    avatarColor: "from-emerald-600 to-green-700",
  },
  {
    id: 15,
    name: "Bùi Gia Bảo",
    email: "giabao.bui@gmail.com",
    phone: "0978 333 444",
    role: "customer",
    status: "active",
    createdAt: "12/09/2026 09:45",
    lastLogin: "4 ngày trước",
    ordersCount: 4,
    totalSpent: 8400000,
    courtBookingsCount: 5,
    avatarColor: "from-teal-600 to-emerald-700",
  },
  {
    id: 16,
    name: "Phan Ánh Nguyệt",
    email: "anhnguyet.phan@gmail.com",
    phone: "0915 888 666",
    role: "customer",
    status: "active",
    createdAt: "14/09/2026 18:30",
    lastLogin: "Hôm nay, 08:30",
    ordersCount: 3,
    totalSpent: 6200000,
    courtBookingsCount: 4,
    avatarColor: "from-cyan-600 to-blue-700",
  },
];

export default function UsersPage() {
  const [users, setUsers] = useState<SystemUser[]>(() => {
    try {
      const saved = localStorage.getItem("demopick_system_users_v2");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 10) return parsed;
      }
    } catch {}
    return initialEnterpriseUsers;
  });

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "staff" | "customer">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "locked">("all");
  const [sortBy, setSortBy] = useState<"newest" | "spent_desc" | "orders_desc" | "name_asc">("newest");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Detail Modal
  const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null);
  const [detailTab, setDetailTab] = useState<"overview" | "orders" | "security">("overview");

  // Add / Edit Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formRole, setFormRole] = useState<UserRole>("customer");
  const [formStatus, setFormStatus] = useState<UserStatus>("active");

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem("demopick_system_users_v2", JSON.stringify(users));
  }, [users]);

  // Counts for KPIs
  const totalUsers = users.length;
  const totalAdmins = users.filter((u) => u.role === "admin").length;
  const totalStaff = users.filter((u) => u.role === "staff").length;
  const totalCustomers = users.filter((u) => u.role === "customer").length;
  const totalActive = users.filter((u) => u.status === "active").length;

  // Filter and sort logic
  const filteredUsers = useMemo(() => {
    return users
      .filter((u) => {
        const query = search.toLowerCase().trim();
        const matchesQuery =
          !query ||
          u.name.toLowerCase().includes(query) ||
          u.email.toLowerCase().includes(query) ||
          u.phone.includes(query);

        const matchesRole = roleFilter === "all" || u.role === roleFilter;
        const matchesStatus = statusFilter === "all" || u.status === statusFilter;

        return matchesQuery && matchesRole && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === "newest") return b.id - a.id;
        if (sortBy === "spent_desc") return b.totalSpent - a.totalSpent;
        if (sortBy === "orders_desc") return b.ordersCount - a.ordersCount;
        if (sortBy === "name_asc") return a.name.localeCompare(b.name, "vi");
        return 0;
      });
  }, [users, search, roleFilter, statusFilter, sortBy]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, currentPage, itemsPerPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  // Open modal handlers
  const handleOpenAddUser = () => {
    setEditingUserId(null);
    setFormName("");
    setFormEmail("");
    setFormPhone("");
    setFormRole("customer");
    setFormStatus("active");
    setModalOpen(true);
  };

  const handleOpenEditUser = (user: SystemUser) => {
    setEditingUserId(user.id);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormPhone(user.phone);
    setFormRole(user.role);
    setFormStatus(user.status);
    setModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) {
      toast.error("Vui lòng điền đầy đủ Họ tên và Email.");
      return;
    }

    if (editingUserId) {
      // Update existing
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingUserId
            ? {
                ...u,
                name: formName.trim(),
                email: formEmail.trim(),
                phone: formPhone.trim() || u.phone,
                role: formRole,
                status: formStatus,
              }
            : u
        )
      );
      toast.success(`Đã cập nhật thông tin tài khoản "${formName}".`);
    } else {
      // Add new
      const newUser: SystemUser = {
        id: Date.now(),
        name: formName.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim() || "0988 000 111",
        role: formRole,
        status: formStatus,
        createdAt: new Date().toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        lastLogin: "Chưa đăng nhập",
        ordersCount: 0,
        totalSpent: 0,
        courtBookingsCount: 0,
        avatarColor:
          formRole === "admin"
            ? "from-rose-500 to-red-600"
            : formRole === "staff"
            ? "from-amber-500 to-orange-600"
            : "from-emerald-500 to-teal-600",
      };
      setUsers([newUser, ...users]);
      toast.success(`Đã thêm mới tài khoản "${formName}" thành công!`);
    }

    setModalOpen(false);
  };

  const handleToggleLock = (user: SystemUser) => {
    if (user.id === 1 || user.email === "admin@demopick.vn") {
      toast.error("An toàn hệ thống: Không được phép khóa tài khoản Super Admin!");
      return;
    }
    const nextStatus: UserStatus = user.status === "active" ? "locked" : "active";
    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, status: nextStatus } : u))
    );
    if (selectedUser && selectedUser.id === user.id) {
      setSelectedUser({ ...selectedUser, status: nextStatus });
    }
    toast.info(
      nextStatus === "locked"
        ? `Đã tạm khóa quyền truy cập của "${user.name}".`
        : `Đã mở khóa tài khoản cho "${user.name}".`
    );
  };

  const handleDeleteUser = (user: SystemUser) => {
    if (user.id === 1 || user.role === "admin") {
      toast.error("An toàn hệ thống: Không thể xóa tài khoản Quản trị viên cấp cao!");
      return;
    }
    if (confirm(`Bạn có chắc chắn muốn xóa tài khoản "${user.name}" khỏi hệ thống?`)) {
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      if (selectedUser?.id === user.id) setSelectedUser(null);
      toast.success(`Đã xóa vĩnh viễn tài khoản "${user.name}".`);
    }
  };

  const handleExportCSV = () => {
    const headers = ["ID,Họ và tên,Email,Số điện thoại,Vai trò,Trạng thái,Số đơn hàng,Tổng chi tiêu (VNĐ),Ngày tham gia"];
    const rows = filteredUsers.map((u) =>
      [
        u.id,
        `"${u.name}"`,
        u.email,
        u.phone,
        u.role === "admin" ? "Quản trị viên" : u.role === "staff" ? "Nhân viên lễ tân" : "Khách hàng",
        u.status === "active" ? "Hoạt động" : "Tạm khóa",
        u.ordersCount,
        u.totalSpent,
        `"${u.createdAt}"`,
      ].join(",")
    );

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `danh_sach_nguoi_dung_demopick_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Đã xuất danh sách người dùng thành công dưới định dạng CSV/Excel!");
  };

  const getTierBadge = (spent: number) => {
    if (spent >= 15000000) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-gradient-to-r from-purple-500/15 to-indigo-500/15 text-purple-700 border border-purple-300">
          <Crown className="w-3 h-3 text-purple-600" />
          Kim Cương
        </span>
      );
    }
    if (spent >= 8000000) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-800 border border-amber-300">
          <Award className="w-3 h-3 text-amber-600" />
          Vàng
        </span>
      );
    }
    if (spent >= 3000000) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-300">
          Bạc
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-50 text-slate-500 border border-slate-200">
        Thành viên
      </span>
    );
  };

  return (
    <AppLayout
      title="Quản Lý Người Dùng & Phân Quyền"
      subtitle="Quản lý danh sách tài khoản khách hàng, quản trị viên và phân quyền truy cập hệ thống (Lab 08)"
      headerRight={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleExportCSV}
            className="gap-2 border-slate-200 hover:bg-slate-100 text-xs font-semibold rounded-xl text-slate-700 h-9"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Xuất Excel</span>
          </Button>

          <Button
            onClick={handleOpenAddUser}
            className="gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 h-9 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Thêm Người Dùng</span>
          </Button>
        </div>
      }
    >
      <div className="space-y-6 font-sans">
        {/* 4 THẺ KPI STATS INTERACTIVE (CLICK ĐỂ LỌC NHANH) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Tổng người dùng */}
          <div
            onClick={() => {
              setRoleFilter("all");
              setCurrentPage(1);
            }}
            className={`p-4.5 rounded-2xl border transition-all duration-200 cursor-pointer relative overflow-hidden group ${
              roleFilter === "all"
                ? "bg-gradient-to-br from-emerald-50/90 to-emerald-100/50 border-emerald-500 shadow-md shadow-emerald-500/10 ring-2 ring-emerald-500/20"
                : "bg-white border-slate-200 hover:border-emerald-300 hover:shadow-sm"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">TỔNG NGƯỜI DÙNG</p>
                <h4 className="text-3xl font-black text-slate-900 mt-1 tracking-tight">{totalUsers}</h4>
                <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                  {totalActive} tài khoản đang kích hoạt
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-600 border border-emerald-500/30 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                <Users className="w-6 h-6" />
              </div>
            </div>
            {roleFilter === "all" && (
              <span className="absolute bottom-1 right-3 text-[10px] font-bold text-emerald-700 flex items-center gap-0.5">
                ● Đang lọc
              </span>
            )}
          </div>

          {/* Card 2: Khách hàng */}
          <div
            onClick={() => {
              setRoleFilter("customer");
              setCurrentPage(1);
            }}
            className={`p-4.5 rounded-2xl border transition-all duration-200 cursor-pointer relative overflow-hidden group ${
              roleFilter === "customer"
                ? "bg-gradient-to-br from-blue-50/90 to-blue-100/50 border-blue-500 shadow-md shadow-blue-500/10 ring-2 ring-blue-500/20"
                : "bg-white border-slate-200 hover:border-blue-300 hover:shadow-sm"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">KHÁCH HÀNG (USER)</p>
                <h4 className="text-3xl font-black text-blue-900 mt-1 tracking-tight">{totalCustomers}</h4>
                <p className="text-[11px] text-blue-700 font-semibold mt-0.5">
                  Thành viên mua sắm & đặt sân
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-500/15 text-blue-600 border border-blue-500/30 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                <UserCheck className="w-6 h-6" />
              </div>
            </div>
            {roleFilter === "customer" && (
              <span className="absolute bottom-1 right-3 text-[10px] font-bold text-blue-700 flex items-center gap-0.5">
                ● Đang lọc
              </span>
            )}
          </div>

          {/* Card 3: Quản trị viên */}
          <div
            onClick={() => {
              setRoleFilter("admin");
              setCurrentPage(1);
            }}
            className={`p-4.5 rounded-2xl border transition-all duration-200 cursor-pointer relative overflow-hidden group ${
              roleFilter === "admin"
                ? "bg-gradient-to-br from-rose-50/90 to-rose-100/50 border-rose-500 shadow-md shadow-rose-500/10 ring-2 ring-rose-500/20"
                : "bg-white border-slate-200 hover:border-rose-300 hover:shadow-sm"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">QUẢN TRỊ VIÊN (ADMIN)</p>
                <h4 className="text-3xl font-black text-rose-900 mt-1 tracking-tight">{totalAdmins}</h4>
                <p className="text-[11px] text-rose-700 font-semibold mt-0.5">
                  Toàn quyền hệ thống & cấu hình
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-600 border border-rose-500/30 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
            </div>
            {roleFilter === "admin" && (
              <span className="absolute bottom-1 right-3 text-[10px] font-bold text-rose-700 flex items-center gap-0.5">
                ● Đang lọc
              </span>
            )}
          </div>

          {/* Card 4: Nhân viên lễ tân */}
          <div
            onClick={() => {
              setRoleFilter("staff");
              setCurrentPage(1);
            }}
            className={`p-4.5 rounded-2xl border transition-all duration-200 cursor-pointer relative overflow-hidden group ${
              roleFilter === "staff"
                ? "bg-gradient-to-br from-amber-50/90 to-amber-100/50 border-amber-500 shadow-md shadow-amber-500/10 ring-2 ring-amber-500/20"
                : "bg-white border-slate-200 hover:border-amber-300 hover:shadow-sm"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">NHÂN VIÊN (STAFF)</p>
                <h4 className="text-3xl font-black text-amber-900 mt-1 tracking-tight">{totalStaff}</h4>
                <p className="text-[11px] text-amber-700 font-semibold mt-0.5">
                  Trực quầy POS & Live chat
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-600 border border-amber-500/30 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                <KeyRound className="w-6 h-6" />
              </div>
            </div>
            {roleFilter === "staff" && (
              <span className="absolute bottom-1 right-3 text-[10px] font-bold text-amber-700 flex items-center gap-0.5">
                ● Đang lọc
              </span>
            )}
          </div>
        </div>

        {/* BỘ LỌC TÌM KIẾM & PHÂN QUYỀN CHUẨN MỰC */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Ô tìm kiếm */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Tìm theo tên, email, số điện thoại người dùng..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 pr-9 h-10 text-xs bg-slate-50/80 border-slate-200 rounded-xl focus-visible:bg-white"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Bộ chọn vai trò & Trạng thái */}
            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={roleFilter}
                onValueChange={(v: any) => {
                  setRoleFilter(v);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-44 h-10 text-xs font-semibold bg-slate-50/80 border-slate-200 rounded-xl">
                  <SelectValue placeholder="Tất cả vai trò" />
                </SelectTrigger>
                <SelectContent className="rounded-xl shadow-lg border-slate-200">
                  <SelectItem value="all">Tất cả vai trò</SelectItem>
                  <SelectItem value="admin">Quản trị viên (Admin)</SelectItem>
                  <SelectItem value="staff">Nhân viên (Staff)</SelectItem>
                  <SelectItem value="customer">Khách hàng (User)</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={statusFilter}
                onValueChange={(v: any) => {
                  setStatusFilter(v);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-36 h-10 text-xs font-semibold bg-slate-50/80 border-slate-200 rounded-xl">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent className="rounded-xl shadow-lg border-slate-200">
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="active">Đang hoạt động</SelectItem>
                  <SelectItem value="locked">Đang tạm khóa</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={sortBy}
                onValueChange={(v: any) => setSortBy(v)}
              >
                <SelectTrigger className="w-44 h-10 text-xs font-semibold bg-slate-50/80 border-slate-200 rounded-xl">
                  <SelectValue placeholder="Sắp xếp theo" />
                </SelectTrigger>
                <SelectContent className="rounded-xl shadow-lg border-slate-200">
                  <SelectItem value="newest">Mới nhất trước</SelectItem>
                  <SelectItem value="spent_desc">Chi tiêu cao nhất</SelectItem>
                  <SelectItem value="orders_desc">Nhiều đơn hàng nhất</SelectItem>
                  <SelectItem value="name_asc">Tên (A → Z)</SelectItem>
                </SelectContent>
              </Select>

              {(search || roleFilter !== "all" || statusFilter !== "all") && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSearch("");
                    setRoleFilter("all");
                    setStatusFilter("all");
                    setSortBy("newest");
                    setCurrentPage(1);
                  }}
                  className="h-10 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl font-semibold"
                >
                  Xóa lọc
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* BẢNG DỮ LIỆU NGƯỜI DÙNG CAO CẤP */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-4 px-4 w-12 text-center">ID</th>
                  <th className="py-4 px-4 min-w-[220px]">HỌ VÀ TÊN</th>
                  <th className="py-4 px-4 min-w-[200px]">EMAIL</th>
                  <th className="py-4 px-4 min-w-[130px]">ĐIỆN THOẠI</th>
                  <th className="py-4 px-4 min-w-[150px]">VAI TRÒ</th>
                  <th className="py-4 px-4 min-w-[140px]">HẠNG / CHI TIÊU</th>
                  <th className="py-4 px-4 text-center min-w-[120px]">TRẠNG THÁI</th>
                  <th className="py-4 px-4 min-w-[140px]">NGÀY TẠO</th>
                  <th className="py-4 px-4 text-right min-w-[140px]">THAO TÁC</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {paginatedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-16 text-center text-slate-400">
                      <Users className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                      <p className="font-semibold text-sm text-slate-600">Không tìm thấy người dùng nào phù hợp</p>
                      <p className="text-xs text-slate-400 mt-1">Thử thay đổi từ khóa hoặc xóa bớt tiêu chí lọc.</p>
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((user) => {
                    const isSuperAdmin = user.id === 1 || user.email === "admin@demopick.vn";
                    return (
                      <tr
                        key={user.id}
                        className="hover:bg-slate-50/80 transition-colors group"
                      >
                        {/* ID */}
                        <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-400">
                          #{user.id}
                        </td>

                        {/* HỌ VÀ TÊN */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div
                                className={`w-10 h-10 rounded-full bg-gradient-to-br ${
                                  user.avatarColor || "from-slate-600 to-slate-800"
                                } text-white flex items-center justify-center font-black text-sm shadow-sm shrink-0`}
                              >
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                              {/* Online / Active status dot */}
                              <span
                                className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ring-2 ring-white ${
                                  user.status === "active" ? "bg-emerald-500" : "bg-rose-500"
                                }`}
                                title={user.status === "active" ? "Tài khoản kích hoạt" : "Tài khoản bị khóa"}
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
                                  {user.name}
                                </span>
                                {isSuperAdmin && (
                                  <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" title="Super Admin" />
                                )}
                              </div>
                              <p className="text-[11px] text-slate-400 truncate">
                                Lần cuối: {user.lastLogin || "Chưa rõ"}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* EMAIL */}
                        <td className="py-3.5 px-4 text-slate-600 font-mono text-xs">
                          {user.email}
                        </td>

                        {/* ĐIỆN THOẠI */}
                        <td className="py-3.5 px-4 text-slate-700 font-medium">
                          {user.phone}
                        </td>

                        {/* VAI TRÒ */}
                        <td className="py-3.5 px-4">
                          {user.role === "admin" ? (
                            <Badge className="bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200 font-bold text-[11px] gap-1 px-2.5 py-1 rounded-lg">
                              <ShieldCheck className="w-3.5 h-3.5 text-rose-600" />
                              <span>Quản trị viên (Admin)</span>
                            </Badge>
                          ) : user.role === "staff" ? (
                            <Badge className="bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200 font-bold text-[11px] gap-1 px-2.5 py-1 rounded-lg">
                              <UserCheck className="w-3.5 h-3.5 text-amber-600" />
                              <span>Lễ tân (Staff)</span>
                            </Badge>
                          ) : (
                            <Badge className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 font-bold text-[11px] gap-1 px-2.5 py-1 rounded-lg">
                              <Users className="w-3.5 h-3.5 text-blue-600" />
                              <span>Khách hàng (User)</span>
                            </Badge>
                          )}
                        </td>

                        {/* HẠNG & TỔNG CHI TIÊU */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-0.5">
                            {user.role === "customer" ? (
                              <>
                                <div>{getTierBadge(user.totalSpent)}</div>
                                <p className="text-[11px] font-bold text-slate-900 mt-0.5">
                                  {user.totalSpent.toLocaleString("vi-VN")} đ
                                </p>
                              </>
                            ) : (
                              <span className="text-[11px] text-slate-400 italic">Nhân sự nội bộ</span>
                            )}
                          </div>
                        </td>

                        {/* TRẠNG THÁI */}
                        <td className="py-3.5 px-4 text-center">
                          {user.status === "active" ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Hoạt động
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                              Tạm khóa
                            </span>
                          )}
                        </td>

                        {/* NGÀY TẠO */}
                        <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                          {user.createdAt}
                        </td>

                        {/* THAO TÁC */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {/* Xem hồ sơ */}
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedUser(user);
                                setDetailTab("overview");
                              }}
                              className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-emerald-600 flex items-center justify-center transition-colors cursor-pointer"
                              title="Xem chi tiết hồ sơ"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* Sửa thông tin & Phân quyền */}
                            <button
                              type="button"
                              onClick={() => handleOpenEditUser(user)}
                              className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-blue-600 flex items-center justify-center transition-colors cursor-pointer"
                              title="Chỉnh sửa & Phân quyền"
                            >
                              <Edit className="w-4 h-4" />
                            </button>

                            {/* Khóa / Mở khóa */}
                            <button
                              type="button"
                              onClick={() => handleToggleLock(user)}
                              disabled={isSuperAdmin}
                              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                                isSuperAdmin
                                  ? "opacity-30 cursor-not-allowed text-slate-300"
                                  : user.status === "active"
                                  ? "hover:bg-amber-50 text-slate-400 hover:text-amber-600"
                                  : "hover:bg-emerald-50 text-rose-500 hover:text-emerald-600"
                              }`}
                              title={user.status === "active" ? "Tạm khóa tài khoản" : "Mở khóa tài khoản"}
                            >
                              {user.status === "active" ? (
                                <Lock className="w-4 h-4" />
                              ) : (
                                <Unlock className="w-4 h-4" />
                              )}
                            </button>

                            {/* Xóa */}
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(user)}
                              disabled={user.role === "admin"}
                              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                                user.role === "admin"
                                  ? "opacity-20 cursor-not-allowed text-slate-300"
                                  : "hover:bg-rose-50 text-slate-400 hover:text-rose-600 cursor-pointer"
                              }`}
                              title={user.role === "admin" ? "Không được xóa Admin" : "Xóa tài khoản"}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* PHÂN TRANG */}
          <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50/50">
            <p className="text-xs text-slate-500 font-medium">
              Hiển thị{" "}
              <strong>
                {filteredUsers.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} -{" "}
                {Math.min(currentPage * itemsPerPage, filteredUsers.length)}
              </strong>{" "}
              trên tổng số <strong>{filteredUsers.length}</strong> tài khoản
            </p>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="h-8 px-2.5 text-xs rounded-xl border-slate-200"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Trước</span>
              </Button>

              <div className="flex items-center gap-1 px-1">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-8 h-8 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      currentPage === i + 1
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="h-8 px-2.5 text-xs rounded-xl border-slate-200"
              >
                <span>Sau</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* MODAL THÊM / SỬA TÀI KHOẢN & PHÂN QUYỀN */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="max-w-md rounded-2xl p-6 bg-white shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  {editingUserId ? <Edit className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                </div>
                <span>{editingUserId ? "Cập Nhật Hồ Sơ & Phân Quyền" : "Tạo Mới Tài Khoản Hệ Thống"}</span>
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSaveUser} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Họ và tên người dùng *</Label>
                <Input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn An"
                  className="rounded-xl text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Email đăng nhập *</Label>
                  <Input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="nguyenan@example.com"
                    className="rounded-xl text-xs"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Số điện thoại</Label>
                  <Input
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="0988 123 456"
                    className="rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Phân quyền vai trò</Label>
                <Select value={formRole} onValueChange={(v: any) => setFormRole(v)}>
                  <SelectTrigger className="rounded-xl text-xs font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="customer">
                      <div className="py-0.5">
                        <p className="font-bold text-slate-900">Khách Hàng (User)</p>
                        <p className="text-[11px] text-slate-500">Đặt sân trực tuyến, mua vợt bóng, xem đơn hàng cá nhân</p>
                      </div>
                    </SelectItem>
                    <SelectItem value="staff">
                      <div className="py-0.5">
                        <p className="font-bold text-amber-900">Nhân Viên Lễ Tân (Staff)</p>
                        <p className="text-[11px] text-slate-500">Trực quầy POS, check-in sân bóng, chat tư vấn khách</p>
                      </div>
                    </SelectItem>
                    <SelectItem value="admin">
                      <div className="py-0.5">
                        <p className="font-bold text-rose-900">Quản Trị Viên (Admin)</p>
                        <p className="text-[11px] text-slate-500">Toàn quyền báo cáo, kho hàng, voucher và phân quyền tài khoản</p>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Trạng thái tài khoản</Label>
                <Select value={formStatus} onValueChange={(v: any) => setFormStatus(v)}>
                  <SelectTrigger className="rounded-xl text-xs font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="active">Đang kích hoạt (Cho phép đăng nhập)</SelectItem>
                    <SelectItem value="locked">Tạm khóa (Chặn đăng nhập)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {!editingUserId && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600">
                  💡 <strong>Mật khẩu mặc định:</strong> <code>123456</code> (Người dùng có thể tự đổi mật khẩu sau khi đăng nhập lần đầu).
                </div>
              )}

              <DialogFooter className="pt-3 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl text-xs font-semibold"
                >
                  Hủy bỏ
                </Button>
                <Button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold"
                >
                  {editingUserId ? "Lưu Thay Đổi" : "Tạo Tài Khoản"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* DRAWER / MODAL XEM HỒ SƠ NGƯỜI DÙNG CHI TIẾT */}
        {selectedUser && (
          <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
            <DialogContent className="max-w-xl rounded-3xl p-0 overflow-hidden bg-white shadow-2xl border-0">
              {/* Header Banner */}
              <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-6 text-white relative">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-4">
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${
                      selectedUser.avatarColor || "from-emerald-500 to-teal-600"
                    } text-white flex items-center justify-center font-black text-2xl shadow-lg ring-4 ring-white/20`}
                  >
                    {selectedUser.name.charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-black text-white">{selectedUser.name}</h3>
                      {selectedUser.id === 1 && (
                        <Crown className="w-4 h-4 text-amber-400" title="Super Admin" />
                      )}
                    </div>
                    <p className="text-xs text-white/70 font-mono mt-0.5">{selectedUser.email}</p>

                    <div className="flex items-center gap-2 mt-2">
                      {selectedUser.role === "admin" ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                          Quản Trị Viên (Admin)
                        </span>
                      ) : selectedUser.role === "staff" ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          Nhân Viên Lễ Tân
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
                          Khách Hàng Thành Viên
                        </span>
                      )}

                      {selectedUser.role === "customer" && getTierBadge(selectedUser.totalSpent)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Tabs trong Modal */}
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
                  Lịch Sử Đơn Hàng & Đặt Sân ({selectedUser.recentOrders?.length || selectedUser.ordersCount})
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

              {/* Tab Contents */}
              <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                {detailTab === "overview" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <p className="text-[11px] text-slate-400 font-semibold">Số điện thoại</p>
                        <p className="text-xs font-bold text-slate-800 mt-0.5 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-500" />
                          {selectedUser.phone}
                        </p>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <p className="text-[11px] text-slate-400 font-semibold">Ngày tham gia hệ thống</p>
                        <p className="text-xs font-bold text-slate-800 mt-0.5 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          {selectedUser.createdAt}
                        </p>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <p className="text-[11px] text-slate-400 font-semibold">Tổng tiền đã chi tiêu</p>
                        <p className="text-sm font-black text-emerald-700 mt-0.5">
                          {selectedUser.totalSpent.toLocaleString("vi-VN")} đ
                        </p>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <p className="text-[11px] text-slate-400 font-semibold">Tổng lượt đặt sân & mua hàng</p>
                        <p className="text-sm font-black text-blue-700 mt-0.5">
                          {selectedUser.ordersCount + (selectedUser.courtBookingsCount || 0)} lượt giao dịch
                        </p>
                      </div>
                    </div>

                    <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/80">
                      <h4 className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                        <span>Đặc quyền tài khoản DemoPick Sports</span>
                      </h4>
                      <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                        Tài khoản có thể tham gia tích điểm voucher, hưởng chiết khấu tự động khi thanh toán trực tuyến qua MoMo / VietQR, và ưu tiên giữ chỗ sân giờ cao điểm.
                      </p>
                    </div>
                  </div>
                )}

                {detailTab === "orders" && (
                  <div className="space-y-3">
                    {selectedUser.recentOrders && selectedUser.recentOrders.length > 0 ? (
                      selectedUser.recentOrders.map((ord) => (
                        <div
                          key={ord.code}
                          className="p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 transition-colors space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-xs text-emerald-700">{ord.code}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                              {ord.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-700 font-medium line-clamp-1">{ord.items}</p>
                          <div className="flex items-center justify-between text-[11px] pt-1 text-slate-400">
                            <span>{ord.date}</span>
                            <strong className="text-slate-900 font-bold">{ord.total.toLocaleString("vi-VN")} đ</strong>
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
                            {selectedUser.status === "active" ? "Tài khoản đang được phép đăng nhập" : "Tài khoản đã bị tạm khóa"}
                          </p>
                        </div>

                        <Button
                          size="sm"
                          variant={selectedUser.status === "active" ? "destructive" : "default"}
                          disabled={selectedUser.id === 1}
                          onClick={() => handleToggleLock(selectedUser)}
                          className="rounded-xl text-xs font-bold h-8"
                        >
                          {selectedUser.status === "active" ? "Khóa Tài Khoản" : "Mở Khóa"}
                        </Button>
                      </div>

                      <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-slate-800">Đặt lại mật khẩu</p>
                          <p className="text-[11px] text-slate-400">Khôi phục mật khẩu mặc định về <code>123456</code></p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toast.success(`Đã gửi yêu cầu reset mật khẩu về email ${selectedUser.email}!`)}
                          className="rounded-xl text-xs font-semibold h-8"
                        >
                          Gửi Mật Khẩu Mới
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={() => {
                    handleOpenEditUser(selectedUser);
                    setSelectedUser(null);
                  }}
                  className="rounded-xl text-xs font-bold gap-1.5"
                >
                  <Edit className="w-3.5 h-3.5 text-blue-600" />
                  Chỉnh Sửa Hồ Sơ
                </Button>

                <Button
                  onClick={() => setSelectedUser(null)}
                  className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold px-5"
                >
                  Đóng
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </AppLayout>
  );
}

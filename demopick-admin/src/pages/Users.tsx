import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { adminService } from "@/services/admin.service";
import {
  Users,
  UserCheck,
  ShieldCheck,
  Search,
  UserPlus,
  Download,
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
  ChevronLeft,
  ChevronRight,
  KeyRound,
  Clock,
  Sun,
  Moon,
  User as UserIcon,
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
  DialogDescription,
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

import StaffTable, { StaffUser } from "@/components/crm/StaffTable";
import AddStaffDialog from "@/components/crm/AddStaffDialog";
import { UserFormModal, UserFormData } from "@/components/crm/UserFormModal";
import { UserProfileModal } from "@/components/crm/UserProfileModal";

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
    ordersCount: 0,
    totalSpent: 0,
    courtBookingsCount: 0,
    avatarColor: "from-rose-500 to-pink-600",
    recentOrders: [],
  },
  {
    id: 2,
    name: "Nhân Viên Thu Ngân",
    email: "staff@demopick.vn",
    phone: "0912 345 678",
    role: "staff",
    status: "active",
    createdAt: "15/09/2026 08:00",
    lastLogin: "Hôm nay",
    ordersCount: 0,
    totalSpent: 0,
    courtBookingsCount: 0,
    avatarColor: "from-amber-500 to-orange-600",
    recentOrders: [],
  },
  {
    id: 3,
    name: "Khách Hàng DemoPick",
    email: "customer@demopick.vn",
    phone: "0901 234 567",
    role: "customer",
    status: "active",
    createdAt: "15/09/2026 10:00",
    lastLogin: "Hôm nay",
    ordersCount: 0,
    totalSpent: 0,
    courtBookingsCount: 0,
    avatarColor: "from-blue-500 to-indigo-600",
    recentOrders: [],
  },
];

const initialStaffList: StaffUser[] = [
  {
    id: 1,
    name: "Nhân Viên Thu Ngân Sáng",
    email: "staff@demopick.vn",
    phone: "0912 345 678",
    shift: "Ca Sáng (05:00 - 14:00)",
    role: "Lễ tân POS & Check-in",
    status: "active",
    createdAt: "15/09/2026",
  },
  {
    id: 2,
    name: "Nhân Viên Thu Ngân Chiều",
    email: "letan02@demopick.vn",
    phone: "0988 777 666",
    shift: "Ca Chiều (14:00 - 22:00)",
    role: "Lễ tân POS & Check-in",
    status: "active",
    createdAt: "15/09/2026",
  },
];

export default function UsersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get("tab") as "customers" | "staff") || "customers";

  const setActiveTab = (tab: "customers" | "staff") => {
    setSearchParams({ tab });
  };

  // --- USER MANAGEMENT STATES ---
  const [users, setUsers] = useState<SystemUser[]>(() => {
    try {
      const saved = localStorage.getItem("demopick_system_users_v2");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const filtered = parsed.filter((u: SystemUser) => !u.email.includes("@demopick.com") && !u.email.includes("viet.admin"));
          if (filtered.length > 0) return filtered;
        }
      }
    } catch {}
    return initialEnterpriseUsers;
  });

  useEffect(() => {
    adminService.getUsers().then((data) => {
      if (data && Array.isArray(data) && data.length > 0) {
        setUsers(data);
      }
    });
  }, []);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "staff" | "customer">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "locked">("all");
  const [sortBy, setSortBy] = useState<"newest" | "spent_desc" | "orders_desc" | "name_asc">("newest");

  // Pagination for Users
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

  // Save users to LocalStorage
  useEffect(() => {
    localStorage.setItem("demopick_system_users_v2", JSON.stringify(users));
  }, [users]);

  // Counts for KPIs
  const totalUsers = users.length;
  const totalAdmins = users.filter((u) => u.role === "admin").length;
  const totalStaff = users.filter((u) => u.role === "staff").length;
  const totalCustomers = users.filter((u) => u.role === "customer").length;
  const totalActive = users.filter((u) => u.status === "active").length;

  // Filter and sort logic for users
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

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, currentPage, itemsPerPage]);

  const paginationRange = useMemo((): (number | string)[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const delta = 1;
    const range: (number | string)[] = [];
    const left = Math.max(2, currentPage - delta);
    const right = Math.min(totalPages - 1, currentPage + delta);

    range.push(1);
    if (left > 2) {
      range.push("...");
    }
    for (let i = left; i <= right; i++) {
      range.push(i);
    }
    if (right < totalPages - 1) {
      range.push("...");
    }
    range.push(totalPages);
    return range;
  }, [totalPages, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  // --- STAFF & SHIFT STATES ---
  const [staffList, setStaffList] = useState<StaffUser[]>(() => {
    try {
      const saved = localStorage.getItem("demopick_staff_list");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const filtered = parsed.filter((s: StaffUser) => !s.email?.includes("@demopick.com"));
          if (filtered.length > 0) return filtered;
        }
      }
    } catch {}
    return initialStaffList;
  });

  const [staffSearch, setStaffSearch] = useState("");
  const [addStaffOpen, setAddStaffOpen] = useState(false);
  const [newStaffName, setNewStaffName] = useState("");
  const [newStaffEmail, setNewStaffEmail] = useState("");
  const [newStaffPhone, setNewStaffPhone] = useState("");
  const [newStaffShift, setNewStaffShift] = useState("Ca Sáng (05:00 - 14:00)");

  const [staffPage, setStaffPage] = useState(1);
  const staffItemsPerPage = 5;

  useEffect(() => {
    localStorage.setItem("demopick_staff_list", JSON.stringify(staffList));
  }, [staffList]);

  const filteredStaff = useMemo(() => {
    const q = staffSearch.toLowerCase().trim();
    return staffList.filter(
      (s) =>
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.phone.includes(q) ||
        s.shift.toLowerCase().includes(q)
    );
  }, [staffList, staffSearch]);

  const totalStaffPages = Math.ceil(filteredStaff.length / staffItemsPerPage) || 1;
  const paginatedStaff = useMemo(() => {
    const start = (staffPage - 1) * staffItemsPerPage;
    return filteredStaff.slice(start, start + staffItemsPerPage);
  }, [filteredStaff, staffPage, staffItemsPerPage]);

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName.trim() || !newStaffEmail.trim()) {
      toast.error("Vui lòng nhập tên và email nhân viên.");
      return;
    }

    const newStaff: StaffUser = {
      id: Date.now(),
      name: newStaffName.trim(),
      email: newStaffEmail.trim(),
      phone: newStaffPhone.trim() || "0988 000 111",
      shift: newStaffShift,
      role: "Lễ tân POS & Check-in",
      status: "active",
      createdAt: new Date().toLocaleDateString("vi-VN"),
    };

    setStaffList([newStaff, ...staffList]);
    setStaffPage(1);
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
• Trang đăng nhập: http://localhost:5174/login`;

    navigator.clipboard.writeText(infoText);
    toast.success(`Đã sao chép thông tin tài khoản của nhân viên "${staff.name}" vào Clipboard!`);
  };

  const handleToggleLockStaff = (id: number) => {
    setStaffList((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const nextStatus = s.status === "active" ? "locked" : "active";
          toast.info(
            `Đã ${nextStatus === "locked" ? "tạm khóa" : "mở khóa"} tài khoản nhân viên "${s.name}".`
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

  // --- USER MODAL HANDLERS ---
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

  const handleFormChange = <K extends keyof UserFormData>(field: K, value: UserFormData[K]) => {
    if (field === "name") setFormName(value as string);
    else if (field === "email") setFormEmail(value as string);
    else if (field === "phone") setFormPhone(value as string);
    else if (field === "role") setFormRole(value as UserRole);
    else if (field === "status") setFormStatus(value as UserStatus);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) {
      toast.error("Vui lòng điền đầy đủ Họ tên và Email đăng nhập.");
      return;
    }

    if (editingUserId) {
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
      toast.success(`Đã tạo mới tài khoản "${formName}" thành công!`);
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
        u.role === "admin" ? "Admin" : u.role === "staff" ? "Lễ tân" : "Khách hàng",
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

  return (
    <AppLayout
      title="Quản Lý Tài Khoản & Phân Ca Trực"
      subtitle="Quản lý khách hàng, phân quyền tài khoản quản trị và điều phối ca trực lễ tân sân bóng"
      headerRight={
        <div className="flex items-center gap-2.5">
          {activeTab === "customers" ? (
            <>
              <Button
                variant="outline"
                onClick={handleExportCSV}
                className="gap-2 border-slate-200 hover:bg-slate-100 text-xs font-semibold rounded-xl text-slate-700 h-9.5 px-3.5"
              >
                <Download className="w-4 h-4 text-slate-500" />
                <span>Xuất Excel</span>
              </Button>

              <Button
                onClick={handleOpenAddUser}
                className="gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 h-9.5 px-4 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Thêm Người Dùng</span>
              </Button>
            </>
          ) : (
            <Button
              onClick={() => setAddStaffOpen(true)}
              className="gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 h-9.5 px-4 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Đăng Ký Tài Khoản Lễ Tân</span>
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-5 font-sans">
        {/* TAB CHUYỂN ĐỔI CHÍNH */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
          <Button
            variant={activeTab === "customers" ? "default" : "outline"}
            onClick={() => setActiveTab("customers")}
            className={`gap-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "customers"
                ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100 border-slate-200"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Khách Hàng & Hệ Thống ({users.length})</span>
          </Button>

          <Button
            variant={activeTab === "staff" ? "default" : "outline"}
            onClick={() => setActiveTab("staff")}
            className={`gap-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "staff"
                ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100 border-slate-200"
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Nhân Sự & Phân Ca Trực ({staffList.length})</span>
          </Button>
        </div>

        {/* TAB 1: KHÁCH HÀNG & QUẢN TRỊ */}
        {activeTab === "customers" && (
          <div className="space-y-5">
            {/* 4 THẺ KPI STATS INTERACTIVE (CLICK ĐỂ LỌC NHANH) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div
                onClick={() => {
                  setRoleFilter("all");
                  setCurrentPage(1);
                }}
                className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer relative overflow-hidden group ${
                  roleFilter === "all"
                    ? "bg-gradient-to-br from-emerald-50/90 to-emerald-100/50 border-emerald-500 shadow-md shadow-emerald-500/10 ring-2 ring-emerald-500/20"
                    : "bg-white border-slate-200 hover:border-emerald-300 hover:shadow-sm"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">TỔNG NGƯỜI DÙNG</p>
                    <h4 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 tracking-tight">{totalUsers}</h4>
                    <p className="text-[11px] text-emerald-700 font-semibold mt-1">
                      {totalActive} tài khoản đang kích hoạt
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 border border-emerald-500/30 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
              </div>

              <div
                onClick={() => {
                  setRoleFilter("customer");
                  setCurrentPage(1);
                }}
                className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer relative overflow-hidden group ${
                  roleFilter === "customer"
                    ? "bg-gradient-to-br from-blue-50/90 to-blue-100/50 border-blue-500 shadow-md shadow-blue-500/10 ring-2 ring-blue-500/20"
                    : "bg-white border-slate-200 hover:border-blue-300 hover:shadow-sm"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">KHÁCH HÀNG</p>
                    <h4 className="text-2xl sm:text-3xl font-black text-blue-900 mt-1 tracking-tight">{totalCustomers}</h4>
                    <p className="text-[11px] text-blue-700 font-semibold mt-1">
                      Người chơi & Đặt sân trực tuyến
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-600 border border-blue-500/30 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                    <UserCheck className="w-5 h-5" />
                  </div>
                </div>
              </div>

              <div
                onClick={() => {
                  setRoleFilter("admin");
                  setCurrentPage(1);
                }}
                className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer relative overflow-hidden group ${
                  roleFilter === "admin"
                    ? "bg-gradient-to-br from-rose-50/90 to-rose-100/50 border-rose-500 shadow-md shadow-rose-500/10 ring-2 ring-rose-500/20"
                    : "bg-white border-slate-200 hover:border-rose-300 hover:shadow-sm"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">ADMIN</p>
                    <h4 className="text-2xl sm:text-3xl font-black text-rose-900 mt-1 tracking-tight">{totalAdmins}</h4>
                    <p className="text-[11px] text-rose-700 font-semibold mt-1">
                      Toàn quyền cấu hình & quản trị
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-600 border border-rose-500/30 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                </div>
              </div>

              <div
                onClick={() => {
                  setRoleFilter("staff");
                  setCurrentPage(1);
                }}
                className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer relative overflow-hidden group ${
                  roleFilter === "staff"
                    ? "bg-gradient-to-br from-amber-50/90 to-amber-100/50 border-amber-500 shadow-md shadow-amber-500/10 ring-2 ring-amber-500/20"
                    : "bg-white border-slate-200 hover:border-amber-300 hover:shadow-sm"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">LỄ TÂN</p>
                    <h4 className="text-2xl sm:text-3xl font-black text-amber-900 mt-1 tracking-tight">{totalStaff}</h4>
                    <p className="text-[11px] text-amber-700 font-semibold mt-1">
                      Trực quầy POS & Live chat
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 border border-amber-500/30 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                    <KeyRound className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>

            {/* BỘ LỌC TÌM KIẾM */}
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
                <div className="relative flex-1 min-w-[260px]">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Tìm theo tên, email, số điện thoại người dùng..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-10 pr-9 h-10 text-xs bg-slate-50/80 border-slate-200 rounded-xl focus-visible:bg-white text-slate-800"
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

                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
                  <Select
                    value={roleFilter}
                    onValueChange={(v: any) => {
                      setRoleFilter(v);
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="w-full sm:w-44 h-10 text-xs font-semibold bg-slate-50/80 border-slate-200 rounded-xl text-slate-700">
                      <SelectValue placeholder="Tất cả vai trò" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl shadow-lg border-slate-200">
                      <SelectItem value="all">Tất cả vai trò</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="staff">Lễ tân</SelectItem>
                      <SelectItem value="customer">Khách hàng</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={statusFilter}
                    onValueChange={(v: any) => {
                      setStatusFilter(v);
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="w-full sm:w-36 h-10 text-xs font-semibold bg-slate-50/80 border-slate-200 rounded-xl text-slate-700">
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
                    <SelectTrigger className="w-full sm:w-40 h-10 text-xs font-semibold bg-slate-50/80 border-slate-200 rounded-xl text-slate-700">
                      <SelectValue placeholder="Sắp xếp theo" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl shadow-lg border-slate-200">
                      <SelectItem value="newest">Mới nhất trước</SelectItem>
                      <SelectItem value="spent_desc">Chi tiêu cao nhất</SelectItem>
                      <SelectItem value="orders_desc">Nhiều đơn nhất</SelectItem>
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
                      className="h-10 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl font-semibold shrink-0"
                    >
                      Xóa lọc
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* BẢNG DỮ LIỆU NGƯỜI DÙNG */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-3.5 px-4 w-12 text-center">ID</th>
                      <th className="py-3.5 px-4 min-w-[210px]">HỌ VÀ TÊN</th>
                      <th className="py-3.5 px-4 min-w-[190px]">EMAIL</th>
                      <th className="py-3.5 px-4 min-w-[120px]">ĐIỆN THOẠI</th>
                      <th className="py-3.5 px-4 min-w-[140px]">VAI TRÒ</th>
                      <th className="py-3.5 px-4 min-w-[150px]">TỔNG CHI TIÊU</th>
                      <th className="py-3.5 px-4 text-center min-w-[110px]">TRẠNG THÁI</th>
                      <th className="py-3.5 px-4 min-w-[130px]">NGÀY TẠO</th>
                      <th className="py-3.5 pr-6 pl-4 text-right min-w-[150px]">THAO TÁC</th>
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
                            <td className="py-3.5 px-4 text-center font-bold text-slate-400 text-xs">
                              #{user.id}
                            </td>

                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                <div className="relative">
                                  <div
                                    className={`w-9 h-9 rounded-full bg-gradient-to-br ${
                                      user.avatarColor || "from-slate-600 to-slate-800"
                                    } text-white flex items-center justify-center font-black text-xs shadow-xs shrink-0`}
                                  >
                                    {user.name.charAt(0).toUpperCase()}
                                  </div>
                                  <span
                                    className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-white ${
                                      user.status === "active" ? "bg-emerald-500" : "bg-rose-500"
                                    }`}
                                    title={user.status === "active" ? "Tài khoản kích hoạt" : "Tài khoản bị khóa"}
                                  />
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors text-xs sm:text-sm truncate">
                                      {user.name}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-slate-400 truncate">
                                    Lần cuối: {user.lastLogin || "Chưa rõ"}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="py-3.5 px-4 text-slate-600 font-normal text-xs">
                              {user.email}
                            </td>

                            <td className="py-3.5 px-4 text-slate-700 font-medium text-xs">
                              {user.phone}
                            </td>

                            <td className="py-3.5 px-4 whitespace-nowrap">
                              {user.role === "admin" ? (
                                <Badge className="bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200 font-bold text-[11px] gap-1.5 px-2.5 py-1 rounded-lg">
                                  <ShieldCheck className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                                  <span>Admin</span>
                                </Badge>
                              ) : user.role === "staff" ? (
                                <Badge className="bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200 font-bold text-[11px] gap-1.5 px-2.5 py-1 rounded-lg">
                                  <UserCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                  <span>Lễ tân</span>
                                </Badge>
                              ) : (
                                <Badge className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 font-bold text-[11px] gap-1.5 px-2.5 py-1 rounded-lg">
                                  <Users className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                  <span>Khách hàng</span>
                                </Badge>
                              )}
                            </td>

                            <td className="py-3.5 px-4">
                              <div className="space-y-0.5">
                                {user.role === "customer" ? (
                                  <>
                                    <p className="text-xs font-bold text-slate-900">
                                      {user.totalSpent.toLocaleString("vi-VN")} đ
                                    </p>
                                    <p className="text-[11px] text-slate-500">
                                      {user.ordersCount} đơn • {user.courtBookingsCount || 0} đặt sân
                                    </p>
                                  </>
                                ) : (
                                  <span className="text-[11px] text-slate-400 italic">Nhân sự nội bộ</span>
                                )}
                              </div>
                            </td>

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

                            <td className="py-3.5 px-4 text-slate-500 text-xs font-normal">
                              {user.createdAt}
                            </td>

                            <td className="py-3.5 pr-6 pl-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
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

                                <button
                                  type="button"
                                  onClick={() => handleOpenEditUser(user)}
                                  className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-blue-600 flex items-center justify-center transition-colors cursor-pointer"
                                  title="Chỉnh sửa & Phân quyền"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>

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

              {/* PHÂN TRANG KHÁCH HÀNG */}
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
                    {paginationRange.map((item, idx) => {
                      if (item === "...") {
                        return (
                          <span
                            key={`dots-${idx}`}
                            className="w-8 h-8 flex items-center justify-center text-xs font-bold text-slate-400 select-none"
                          >
                            ...
                          </span>
                        );
                      }
                      const pageNum = item as number;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-8 h-8 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                            currentPage === pageNum
                              ? "bg-emerald-600 text-white shadow-sm"
                              : "text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
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
          </div>
        )}

        {/* TAB 2: NHÂN SỰ & PHÂN CA TRỰC LỄ TÂN */}
        {activeTab === "staff" && (
          <div className="space-y-5">
            {/* THÔNG TIN CA TRỰC CHUẨN MỰC SÂN BÓNG */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4 border-slate-200 bg-white rounded-2xl shadow-sm flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <Sun className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900">Ca Sáng (05:00 - 14:00)</h4>
                    <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200 text-[10px]">
                      Mở cửa & Quầy POS
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Mở sân, tiếp đón người chơi tập sớm, bán đồ uống, phụ kiện & hỗ trợ khách đặt giữ chỗ trực tiếp tại quầy lễ tân.
                  </p>
                </div>
              </Card>

              <Card className="p-4 border-slate-200 bg-white rounded-2xl shadow-sm flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                  <Moon className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900">Ca Chiều - Tối (14:00 - 22:00)</h4>
                    <Badge variant="outline" className="bg-indigo-50 text-indigo-800 border-indigo-200 text-[10px]">
                      Giờ Cao Điểm
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Khung giờ cao điểm thi đấu, check-in mã QR cho khách đặt online, xử lý đơn nước & kết toán bàn giao tiền quầy cuối ngày.
                  </p>
                </div>
              </Card>
            </div>

            {/* THANH TÌM KIẾM NHÂN VIÊN */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Tìm kiếm nhân viên theo tên, email, SĐT..."
                  value={staffSearch}
                  onChange={(e) => {
                    setStaffSearch(e.target.value);
                    setStaffPage(1);
                  }}
                  className="pl-9 bg-slate-50 text-xs border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200 py-1.5 px-3 font-semibold text-xs flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Tổng số: {staffList.length} nhân viên lễ tân</span>
                </Badge>
              </div>
            </div>

            {/* BẢNG NHÂN SỰ & CA TRỰC */}
            <StaffTable
              staffList={paginatedStaff}
              totalStaffCount={filteredStaff.length}
              currentPage={staffPage}
              totalPages={totalStaffPages}
              itemsPerPage={staffItemsPerPage}
              onPageChange={(page) => setStaffPage(page)}
              onCopyLogin={handleCopyStaffLogin}
              onToggleLock={handleToggleLockStaff}
              onDeleteStaff={handleDeleteStaff}
            />

            {/* DIALOG THÊM NHÂN VIÊN LỄ TÂN */}
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
        )}

        {/* MODAL THÊM / SỬA TÀI KHOẢN NGƯỜI DÙNG */}
        <UserFormModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          editingUserId={editingUserId}
          formData={{
            name: formName,
            email: formEmail,
            phone: formPhone,
            role: formRole,
            status: formStatus,
          }}
          onChange={handleFormChange}
          onSubmit={handleSaveUser}
        />

        {/* MODAL XEM HỒ SƠ CHI TIẾT */}
        <UserProfileModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onEdit={(user) => {
            handleOpenEditUser(user);
          }}
          onToggleLock={handleToggleLock}
        />
        </div>
    </AppLayout>
  );
}

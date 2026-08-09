import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  MapPin,
  ShoppingCart,
  Receipt,
  CreditCard,
  Users,
  Package,
  BarChart3,
  QrCode,
  LogOut,
  ShieldCheck,
  BookOpen,
  UserCheck,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import CheckInDialog from "@/components/CheckInDialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const menuItems = [
  { icon: LayoutDashboard, label: "Tổng quan", path: "/", roles: ["admin", "super_admin"] },
  { icon: MapPin, label: "Sơ đồ & Đặt lịch", path: "/court-map", roles: ["admin", "super_admin", "staff"] },
  { icon: ShoppingCart, label: "Bán hàng POS", path: "/pos", roles: ["admin", "super_admin", "staff"] },
  { icon: Receipt, label: "Quản lý Hóa đơn", path: "/orders", roles: ["admin", "super_admin", "staff"] },
  { icon: CreditCard, label: "Quản lý Thanh toán", path: "/payments", roles: ["admin", "super_admin"] },
  { icon: Users, label: "Khách hàng CRM", path: "/crm", roles: ["admin", "super_admin"] },
  { icon: Package, label: "Kho sản phẩm", path: "/inventory", roles: ["admin", "super_admin", "staff"] },
  { icon: BookOpen, label: "Quản lý Bài viết", path: "/posts", roles: ["admin", "super_admin"] },
  { icon: BarChart3, label: "Báo cáo & Nhật ký", path: "/reports", roles: ["admin", "super_admin"] },
];

interface AppLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  headerRight?: ReactNode;
}

const AppLayout = ({ children, title, subtitle, headerRight }: AppLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, login } = useAuth();
  const [checkInOpen, setCheckInOpen] = useState(false);

  const userRoles = user?.roles || ["admin"]; // default to admin if not specified
  const isStaffOnly = userRoles.includes("staff") && !userRoles.includes("super_admin") && !userRoles.includes("admin");

  const visibleMenuItems = menuItems.filter((item) =>
    item.roles.some((role) => userRoles.includes(role) || userRoles.includes("super_admin"))
  );

  const handleSwitchRole = async () => {
    const targetEmail = isStaffOnly ? "admin@demopick.vn" : "staff@demopick.vn";
    try {
      await login(targetEmail, "12345678");
      toast.success(
        `Đã chuyển sang giao diện: ${isStaffOnly ? "Chủ Sân (Admin)" : "Nhân Viên Lễ Tân (Staff POS)"}!`
      );
      navigate(isStaffOnly ? "/" : "/pos");
    } catch {
      toast.error("Lỗi khi chuyển đổi tài khoản demo.");
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shrink-0 border-r border-slate-800">
        <div className="p-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-white text-base tracking-tight">DemoPick ONE</h1>
              <p className="text-[11px] text-emerald-400 font-semibold uppercase tracking-wider">
                {isStaffOnly ? "Lễ Tân POS Quầy" : "Admin Portal"}
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {visibleMenuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Quick Check-in Button in Sidebar */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          <Button
            onClick={() => setCheckInOpen(true)}
            className="w-full gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-sm"
          >
            <QrCode className="w-4 h-4" />
            <span>Check-in QR Khách</span>
          </Button>

          {/* Logged User Info */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 bg-primary/20 text-primary rounded-full flex items-center justify-center font-bold text-xs shrink-0">
                {user?.name?.charAt(0).toUpperCase() || "A"}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate">{user?.name || "Quản trị viên"}</p>
                <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
              </div>
            </div>

            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
              title="Đăng xuất"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 shadow-sm">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{title}</h2>
            {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
          </div>

          <div className="flex items-center gap-3">
            {headerRight}

            {/* Quick Role Switcher */}
            <Button
              onClick={handleSwitchRole}
              variant="outline"
              size="sm"
              className="gap-1.5 border-amber-300 text-amber-900 bg-amber-50 hover:bg-amber-100 font-bold text-xs"
              title="Chuyển đổi giao diện kiểm thử nhanh giữa Admin và Lễ tân"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
              <span>Chuyển sang {isStaffOnly ? "Admin Chủ Sân" : "Lễ Tân POS"}</span>
            </Button>

            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-semibold text-slate-800">
                  {user?.roles?.[0] ? user.roles[0].toUpperCase() : "ADMIN"}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6 bg-slate-50">{children}</main>

        <CheckInDialog open={checkInOpen} onOpenChange={setCheckInOpen} />
      </div>
    </div>
  );
};

export default AppLayout;

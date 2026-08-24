import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  MapPin,
  ShoppingCart,
  Receipt,
  CreditCard,
  Package,
  BarChart3,
  QrCode,
  LogOut,
  UserCheck,
  RefreshCw,
  Globe,
  PanelLeftClose,
  PanelLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import CheckInDialog from "@/components/CheckInDialog";
import PickleballLogo from "@/components/PickleballLogo";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const menuItems = [
  { icon: LayoutDashboard, label: "Tổng quan", path: "/", roles: ["admin", "super_admin"] },
  { icon: MapPin, label: "Sơ đồ & Đặt lịch", path: "/court-map", roles: ["admin", "super_admin", "staff"] },
  { icon: ShoppingCart, label: "Bán hàng Quầy", path: "/pos", roles: ["admin", "super_admin", "staff"] },
  { icon: Globe, label: "Hóa Đơn Online", path: "/orders?tab=online", roles: ["admin", "super_admin", "staff"] },
  { icon: Receipt, label: "Hóa Đơn Quầy", path: "/orders?tab=pos", roles: ["admin", "super_admin", "staff"] },
  { icon: CreditCard, label: "Quản lý Thanh toán", path: "/payments", roles: ["admin", "super_admin"] },
  { icon: UserCheck, label: "Quản Lý Nhân Viên", path: "/crm", roles: ["admin", "super_admin"] },
  { icon: Package, label: "Kho sản phẩm", path: "/inventory", roles: ["admin", "super_admin", "staff"] },
  { icon: BarChart3, label: "Báo cáo & Nhật ký", path: "/reports", roles: ["admin", "super_admin"] },
];

interface AppLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  headerRight?: ReactNode;
  noScroll?: boolean;
}

const AppLayout = ({ children, title, subtitle, headerRight, noScroll = false }: AppLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, login } = useAuth();
  const [checkInOpen, setCheckInOpen] = useState(false);

  // Sidebar Collapse state with LocalStorage persistence
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem("demopick_sidebar_collapsed") === "true";
    } catch {
      return false;
    }
  });

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const nextState = !prev;
      try {
        localStorage.setItem("demopick_sidebar_collapsed", String(nextState));
      } catch {}
      return nextState;
    });
  };

  const userRoles = user?.roles || [];
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
      {/* Sidebar - Collapsible Executive Style (Gemini Inspired) */}
      <aside
        className={`bg-[#FAF8F5] text-slate-800 flex flex-col shrink-0 border-r border-slate-200/90 shadow-sm relative transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Header / Brand + Collapse Toggle (Exact 64px h-16 height matching Top Bar) */}
        <div
          className={`h-16 border-b border-slate-200/80 flex items-center shrink-0 transition-all ${
            isCollapsed ? "justify-center px-2" : "justify-between px-4"
          }`}
        >
          {!isCollapsed ? (
            <>
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shadow-sm shrink-0">
                  <PickleballLogo size={22} />
                </div>
                <div className="truncate">
                  <h1 className="font-bold text-slate-900 text-base tracking-tight">PickleBall</h1>
                </div>
              </div>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={toggleSidebar}
                    className="w-9 h-9 rounded-xl bg-white hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border border-slate-200 hover:border-emerald-300 flex items-center justify-center transition-all shadow-sm shrink-0"
                    aria-label="Thu gọn thanh bên"
                  >
                    <PanelLeftClose className="w-4.5 h-4.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="font-semibold text-xs">
                  Thu gọn thanh bên
                </TooltipContent>
              </Tooltip>
            </>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={toggleSidebar}
                  className="w-10 h-10 rounded-xl bg-white hover:bg-emerald-50 text-emerald-600 border border-slate-200 hover:border-emerald-300 flex items-center justify-center transition-all shadow-sm"
                  aria-label="Mở thanh bên"
                >
                  <PanelLeft className="w-5 h-5 text-emerald-600" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-semibold text-xs">
                Mở thanh bên
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Navigation Menu List */}
        <nav className={`flex-1 space-y-1.5 overflow-y-auto ${isCollapsed ? "p-2" : "p-3"}`}>
          {visibleMenuItems.map((item) => {
            const fullPath = location.pathname + location.search;
            const isActive = fullPath === item.path || (location.pathname === item.path && !item.path.includes("?"));

            if (isCollapsed) {
              return (
                <Tooltip key={item.path}>
                  <TooltipTrigger asChild>
                    <Link
                      to={item.path}
                      className={`w-10 h-10 mx-auto rounded-xl flex items-center justify-center transition-all ${
                        isActive
                          ? "bg-emerald-600 text-white font-semibold shadow-md shadow-emerald-600/20"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                      }`}
                    >
                      <item.icon className={`w-5 h-5 ${isActive ? "text-white" : "text-emerald-600"}`} />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="font-semibold text-xs">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all ${
                  isActive
                    ? "bg-emerald-600 text-white font-semibold shadow-sm shadow-emerald-600/20"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 font-medium"
                }`}
              >
                <item.icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-emerald-600"}`} />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions: QR Scan & Avatar Dropdown */}
        <div className={`border-t border-slate-200/80 ${isCollapsed ? "p-2 space-y-2.5" : "p-3 space-y-2.5"}`}>
          {/* Symmetrical QR Scan Button */}
          {isCollapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setCheckInOpen(true)}
                  className="w-10 h-10 mx-auto bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl flex items-center justify-center transition-all shadow-sm"
                >
                  <QrCode className="w-5 h-5 text-emerald-600" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-semibold text-xs">
                Quét mã Check-in
              </TooltipContent>
            </Tooltip>
          ) : (
            <Button
              onClick={() => setCheckInOpen(true)}
              className="w-full gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl shadow-sm h-9 text-xs"
            >
              <QrCode className="w-4 h-4 text-white" />
              <span>Quét mã Check-in</span>
            </Button>
          )}

          {/* User Profile Avatar with Dropdown Menu */}
          <div className="pt-1.5 border-t border-slate-200/60 flex justify-center">
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                {isCollapsed ? (
                  <button
                    className="w-10 h-10 mx-auto bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300 rounded-full flex items-center justify-center font-bold text-xs cursor-pointer transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    title="Tùy chọn tài khoản"
                  >
                    {user?.name?.charAt(0).toUpperCase() || "P"}
                  </button>
                ) : (
                  <button className="w-full flex items-center justify-between p-1.5 rounded-xl hover:bg-slate-200/60 transition-colors text-left group focus:outline-none focus:ring-2 focus:ring-emerald-400">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="w-8 h-8 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full flex items-center justify-center font-bold text-xs shrink-0">
                        {user?.name?.charAt(0).toUpperCase() || "P"}
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {user?.name || "Quản trị viên"}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate">
                          {isStaffOnly ? "Nhân viên Lễ tân" : "Chủ sân (Admin)"}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 shrink-0" />
                  </button>
                )}
              </DropdownMenuTrigger>

              <DropdownMenuContent side="right" align="end" className="w-56 p-1.5 shadow-xl border-slate-200 bg-white">
                <DropdownMenuLabel className="p-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center font-bold text-xs">
                      {user?.name?.charAt(0).toUpperCase() || "P"}
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-900 truncate">{user?.name || "Tài khoản"}</p>
                      <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSwitchRole}
                  className="cursor-pointer gap-2 text-xs font-medium py-2 focus:bg-amber-50 focus:text-amber-900 text-slate-700"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
                  <span>Chuyển sang {isStaffOnly ? "Admin Chủ Sân" : "Lễ Tân POS"}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer gap-2 text-xs font-medium py-2 text-red-600 focus:bg-red-50 focus:text-red-700"
                >
                  <LogOut className="w-3.5 h-3.5 text-red-600" />
                  <span>Đăng xuất</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
          </div>
        </header>

        {/* Page Content */}
        <main className={`flex-1 ${noScroll ? "overflow-hidden p-3.5" : "overflow-auto p-6"} bg-slate-50 flex flex-col min-h-0`}>
          {children}
        </main>

        <CheckInDialog open={checkInOpen} onOpenChange={setCheckInOpen} />
      </div>
    </div>
  );
};

export default AppLayout;

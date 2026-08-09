import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { ArrowUpRight, Download, BarChart3, TrendingUp, History, ShieldAlert, CheckCircle2, User, RefreshCw } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const tabs = [
  { id: "overview", label: "Tổng quan Doanh thu" },
  { id: "booking_history", label: "Lịch sử Đặt sân" },
  { id: "audit_logs", label: "Nhật ký Hệ thống (Audit Logs)" },
];

const stats = [
  { label: "Tổng doanh thu tháng này", value: "348.500.000đ", change: "+18.2%", color: "text-emerald-600" },
  { label: "Tổng số giờ đặt sân", value: "1.240 giờ", change: "+12.5%", color: "text-primary" },
  { label: "Doanh thu bán lẻ POS", value: "42.800.000đ", change: "+24.0%", color: "text-amber-600" },
];

const revenueData = [
  { name: "Thứ 2", current: 8500000, previous: 7200000 },
  { name: "Thứ 3", current: 9200000, previous: 8100000 },
  { name: "Thứ 4", current: 11400000, previous: 9500000 },
  { name: "Thứ 5", current: 10800000, previous: 10100000 },
  { name: "Thứ 6", current: 14500000, previous: 12000000 },
  { name: "Thứ 7", current: 18900000, previous: 16500000 },
  { name: "Chủ Nhật", current: 21000000, previous: 18000000 },
];

const courtRevenue = [
  { name: "Sân 1", value: 32, color: "#10b981" },
  { name: "Sân 2", value: 28, color: "#3b82f6" },
  { name: "Sân VIP 1", value: 24, color: "#f59e0b" },
  { name: "Sân VIP 2", value: 16, color: "#8b5cf6" },
];

const bookingHistory = [
  { id: "BK-901", customer: "Nguyễn Văn An", court: "Sân VIP 1", slot: "08:00 - 10:00 (08/08)", price: "360.000đ", method: "VietQR", status: "COMPLETED" },
  { id: "BK-902", customer: "Trần Thị Bích", court: "Sân 1", slot: "17:00 - 19:00 (08/08)", price: "240.000đ", method: "Tiền mặt", status: "CONFIRMED" },
  { id: "BK-903", customer: "Lê Hoàng Long", court: "Sân 2", slot: "06:00 - 08:00 (08/08)", price: "180.000đ", method: "MoMo", status: "REFUNDED" },
  { id: "BK-904", customer: "Phạm Quốc Bảo", court: "Sân VIP 2", slot: "19:00 - 21:00 (08/08)", price: "360.000đ", method: "VietQR", status: "COMPLETED" },
];

const auditLogs = [
  { id: 1, user: "admin@demopick.vn", action: "Đăng nhập hệ thống Admin Portal", ip: "127.0.0.1", time: "2026-08-08 10:12:09" },
  { id: 2, user: "staff@demopick.vn", action: "Tạo hóa đơn bán hàng POS #HD-88292", ip: "127.0.0.1", time: "2026-08-08 09:15:30" },
  { id: 3, user: "System Auto Lock", action: "Giữ chỗ 10 phút cho Khách Nguyễn Văn An (Sân VIP 1)", ip: "System", time: "2026-08-08 08:20:00" },
  { id: 4, user: "admin@demopick.vn", action: "Xử lý hoàn tiền 100% cho mã đặt sân #BK-903", ip: "127.0.0.1", time: "2026-08-08 07:05:12" },
];

export default function Reports() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <AppLayout
      title="Báo Cáo Phân Tích & Nhật Ký Hệ Thống (Audit Logs)"
      subtitle="Theo dõi biến động doanh thu, lịch sử đặt sân & nhật ký thao tác người dùng"
      headerRight={
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2 bg-white border-slate-300 font-semibold">
            <Download className="w-4 h-4" /> Export Excel
          </Button>
          <Button size="sm" className="font-semibold bg-primary">
            30 Ngày Gần Nhất
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Navigation Tabs */}
        <div className="flex gap-2 border-b border-slate-200 pb-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === t.id ? "bg-primary text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {stats.map((s) => (
                <Card key={s.label} className="p-5 border-slate-200 bg-white shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs text-slate-500 font-semibold uppercase">{s.label}</p>
                    <Badge variant="outline" className="text-xs font-bold text-emerald-600 gap-0.5 border-emerald-200 bg-emerald-50">
                      {s.change} <ArrowUpRight className="w-3 h-3" />
                    </Badge>
                  </div>
                  <p className={`text-2xl font-black mt-2 ${s.color}`}>{s.value}</p>
                </Card>
              ))}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <Card className="lg:col-span-8 p-6 border-slate-200 bg-white shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Biểu Đồ Biến Động Doanh Thu Tuần
                    </h3>
                    <p className="text-xs text-slate-500">So sánh doanh thu thực tế tuần này với tuần trước</p>
                  </div>
                  <Badge className="bg-emerald-600">Đơn vị: VNĐ</Badge>
                </div>

                <div className="h-[280px] w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#64748b" />
                      <YAxis tick={{ fontSize: 11 }} stroke="#64748b" tickFormatter={(v) => `${v / 1000000}M`} />
                      <Tooltip formatter={(value: any) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value)} />
                      <Area type="monotone" dataKey="current" name="Tuần này" stroke="#10b981" fill="#10b981" fillOpacity={0.15} strokeWidth={2.5} />
                      <Area type="monotone" dataKey="previous" name="Tuần trước" stroke="#cbd5e1" fill="transparent" strokeWidth={1.5} strokeDasharray="4 4" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card className="lg:col-span-4 p-6 border-slate-200 bg-white shadow-sm flex flex-col justify-between">
                <div className="space-y-2">
                  <h3 className="font-bold text-slate-900 text-base">Tỷ Lệ Doanh Thu Theo Sân</h3>
                  <p className="text-xs text-slate-500">Đóng góp doanh thu của từng sân Pickleball</p>
                </div>

                <div className="h-[180px] w-full flex items-center justify-center my-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={courtRevenue} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value" strokeWidth={0}>
                        {courtRevenue.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                  {courtRevenue.map((c) => (
                    <div key={c.name} className="flex items-center gap-2 text-slate-700 font-semibold">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                      <span>{c.name}: {c.value}%</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "booking_history" && (
          <Card className="p-6 border-slate-200 bg-white shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <History className="h-5 w-5 text-primary" />
                Lịch Sử Đặt Sân & Hoàn Tiền Chi Tiết
              </h3>
              <Badge variant="secondary">{bookingHistory.length} Lượt đặt</Badge>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-bold text-slate-500 uppercase bg-slate-50">
                    <th className="py-3 px-3">Mã Lịch</th>
                    <th className="py-3 px-3">Khách Hàng</th>
                    <th className="py-3 px-3">Sân Thể Thao</th>
                    <th className="py-3 px-3">Khung Giờ</th>
                    <th className="py-3 px-3">Phương Thức</th>
                    <th className="py-3 px-3">Thành Tiền</th>
                    <th className="py-3 px-3">Trạng Thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bookingHistory.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50">
                      <td className="py-3 px-3 font-mono font-bold text-slate-900">{b.id}</td>
                      <td className="py-3 px-3 font-bold text-slate-900">{b.customer}</td>
                      <td className="py-3 px-3 font-semibold text-slate-800">{b.court}</td>
                      <td className="py-3 px-3 text-slate-600">{b.slot}</td>
                      <td className="py-3 px-3 font-medium text-slate-700">{b.method}</td>
                      <td className="py-3 px-3 font-black text-emerald-600">{b.price}</td>
                      <td className="py-3 px-3">
                        {b.status === "COMPLETED" ? (
                          <Badge className="bg-emerald-600">Đã thi đấu</Badge>
                        ) : b.status === "CONFIRMED" ? (
                          <Badge className="bg-primary">Đã xác nhận</Badge>
                        ) : (
                          <Badge variant="destructive">Đã hủy (Hoàn tiền)</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {activeTab === "audit_logs" && (
          <Card className="p-6 border-slate-200 bg-white shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-amber-500" />
                Nhật Ký Thao Tác Hệ Thống (System Audit Trail Logs)
              </h3>
              <Badge variant="outline" className="text-xs font-mono">Trace-ID Enabled</Badge>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-bold text-slate-500 uppercase bg-slate-50">
                    <th className="py-3 px-3">STT</th>
                    <th className="py-3 px-3">Người Thực Hiện</th>
                    <th className="py-3 px-3">Hành Động / Sự Kiện</th>
                    <th className="py-3 px-3">Địa Chỉ IP</th>
                    <th className="py-3 px-3">Thời Gian Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="py-3 px-3 font-mono font-bold text-slate-400">#{log.id}</td>
                      <td className="py-3 px-3 font-bold text-slate-900 flex items-center gap-2">
                        <User className="h-3.5 w-3.5 text-primary" />
                        <span>{log.user}</span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-800">{log.action}</td>
                      <td className="py-3 px-3 font-mono text-xs text-slate-500">{log.ip}</td>
                      <td className="py-3 px-3 text-xs text-slate-400">{log.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}

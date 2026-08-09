import { useQuery } from "@tanstack/react-query";
import AppLayout from "@/components/AppLayout";
import { adminService } from "@/services/admin.service";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, MapPin, ShoppingCart, Users, QrCode, ArrowRight, TrendingUp, CreditCard } from "lucide-react";
import { useState } from "react";
import CheckInDialog from "@/components/CheckInDialog";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const [checkInOpen, setCheckInOpen] = useState(false);

  const { data: courts = [] } = useQuery({
    queryKey: ["admin-courts"],
    queryFn: adminService.getCourts,
  });

  const { data: products = [] } = useQuery({
    queryKey: ["admin-products"],
    queryFn: adminService.getProducts,
  });

  return (
    <AppLayout
      title="Tổng Quan Hoạt Động Cụm Sân DemoPick"
      subtitle="Báo cáo tình hình đặt sân, doanh thu & kinh doanh thiết bị Pickleball"
      headerRight={
        <Button onClick={() => setCheckInOpen(true)} className="gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold">
          <QrCode className="h-4 w-4" />
          <span>Quét Mã Check-in</span>
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Card className="p-5 border-slate-200 shadow-sm bg-white flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase">Doanh thu hôm nay</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">12.450.000đ</h3>
              <span className="text-xs text-emerald-600 font-bold flex items-center gap-1 mt-1">
                <TrendingUp className="h-3.5 w-3.5" /> +15.4% so với hôm qua
              </span>
            </div>
            <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <DollarSign className="h-6 w-6" />
            </div>
          </Card>

          <Card className="p-5 border-slate-200 shadow-sm bg-white flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase">Sân Pickleball sẵn sàng</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{courts.length} Sân</h3>
              <span className="text-xs text-primary font-bold mt-1 block">Hoạt động 100%</span>
            </div>
            <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <MapPin className="h-6 w-6" />
            </div>
          </Card>

          <Card className="p-5 border-slate-200 shadow-sm bg-white flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase">Thiết bị trong kho</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{products.length} Sản phẩm</h3>
              <span className="text-xs text-slate-500 mt-1 block">Vợt & Bóng chính hãng</span>
            </div>
            <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <ShoppingCart className="h-6 w-6" />
            </div>
          </Card>

          <Card className="p-5 border-slate-200 shadow-sm bg-white flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase">Đơn đặt trong ngày</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">28 Đơn</h3>
              <span className="text-xs text-emerald-600 font-bold mt-1 block">100% Đã xác thực</span>
            </div>
            <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Users className="h-6 w-6" />
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <Card className="p-5 border-slate-200 bg-white space-y-3 shadow-sm">
            <h3 className="font-bold text-slate-900 text-sm">Sơ Đồ Đặt Sân</h3>
            <p className="text-xs text-slate-500 line-clamp-2">Xem lịch 7 ngày của 4 sân Pickleball chuẩn USAPA.</p>
            <Button onClick={() => navigate("/court-map")} variant="outline" className="w-full justify-between h-9 text-xs">
              <span>Mở sơ đồ sân</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Card>

          <Card className="p-5 border-slate-200 bg-white space-y-3 shadow-sm">
            <h3 className="font-bold text-slate-900 text-sm">Bán Hàng POS Quầy</h3>
            <p className="text-xs text-slate-500 line-clamp-2">Tạo hóa đơn bán vợt, bóng & nước uống cho khách.</p>
            <Button onClick={() => navigate("/pos")} variant="outline" className="w-full justify-between h-9 text-xs">
              <span>Mở máy POS</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Card>

          <Card className="p-5 border-slate-200 bg-white space-y-3 shadow-sm">
            <h3 className="font-bold text-slate-900 text-sm">Đối Soát Chuyển Khoản</h3>
            <p className="text-xs text-slate-500 line-clamp-2">Duyệt thủ công hoặc xem Webhook tự động 100%.</p>
            <Button onClick={() => navigate("/payments")} variant="outline" className="w-full justify-between h-9 text-xs border-blue-300 text-blue-800">
              <span>Quản lý Thanh toán</span>
              <CreditCard className="h-3.5 w-3.5" />
            </Button>
          </Card>

          <Card className="p-5 border-slate-200 bg-white space-y-3 shadow-sm">
            <h3 className="font-bold text-slate-900 text-sm">Check-in Mã QR</h3>
            <p className="text-xs text-slate-500 line-clamp-2">Xác minh mã QR đặt sân khi khách đến cổng.</p>
            <Button onClick={() => setCheckInOpen(true)} className="w-full justify-between h-9 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold">
              <span>Máy Quét QR</span>
              <QrCode className="h-3.5 w-3.5" />
            </Button>
          </Card>
        </div>

        {/* Real Courts List Table */}
        <Card className="p-6 border-slate-200 bg-white space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-lg">Danh Sách Sân Pickleball Trực Thuộc</h3>
            <Badge className="bg-primary">Tiêu chuẩn USAPA</Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-bold text-slate-500 uppercase bg-slate-50">
                  <th className="py-3 px-3">Mã Sân</th>
                  <th className="py-3 px-3">Tên Sân</th>
                  <th className="py-3 px-3">Loại Sân</th>
                  <th className="py-3 px-3">Giá Giờ Thường</th>
                  <th className="py-3 px-3">Giá Giờ Cao Điểm (17h-21h)</th>
                  <th className="py-3 px-3">Trạng Thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {courts.map((court) => (
                  <tr key={court.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">{court.court_number}</td>
                    <td className="py-3 px-3 font-semibold text-slate-900">{court.name}</td>
                    <td className="py-3 px-3 text-slate-600">{court.type}</td>
                    <td className="py-3 px-3 font-semibold text-emerald-600">
                      {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(court.hourly_rate)}
                    </td>
                    <td className="py-3 px-3 font-semibold text-amber-600">
                      {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(court.peak_hourly_rate)}
                    </td>
                    <td className="py-3 px-3">
                      <Badge className="bg-emerald-600">Sẵn sàng</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <CheckInDialog open={checkInOpen} onOpenChange={setCheckInOpen} />
    </AppLayout>
  );
}

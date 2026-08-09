import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CreditCard, QrCode, CheckCircle2, Clock, Zap, ArrowDownRight, RefreshCw, Radio, Search, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface PaymentTransaction {
  id: string;
  orderCode: string;
  customerName: string;
  amount: number;
  bankName: string;
  transferContent: string;
  status: "PENDING" | "CONFIRMED_AUTO" | "CONFIRMED_MANUAL";
  createdAt: string;
}

const mockTransactions: PaymentTransaction[] = [
  {
    id: "TX-9901",
    orderCode: "DP-1002",
    customerName: "Nguyễn Văn An",
    amount: 360000,
    bankName: "MBBank / VietQR",
    transferContent: "DP-1002",
    status: "PENDING",
    createdAt: "2026-08-08 10:10:00",
  },
  {
    id: "TX-9902",
    orderCode: "DP-1003",
    customerName: "Trần Thị Bích",
    amount: 5580000,
    bankName: "Vietcombank",
    transferContent: "DP-1003",
    status: "CONFIRMED_MANUAL",
    createdAt: "2026-08-08 09:15:22",
  },
  {
    id: "TX-9903",
    orderCode: "DP-1004",
    customerName: "Phạm Quốc Bảo",
    amount: 140000,
    bankName: "MoMo QR",
    transferContent: "DP-1004",
    status: "CONFIRMED_AUTO",
    createdAt: "2026-08-08 08:45:10",
  },
];

export default function Payments() {
  const [search, setSearch] = useState("");
  const [transactions, setTransactions] = useState<PaymentTransaction[]>(mockTransactions);
  const [webhookActive, setWebhookActive] = useState(true);

  const filteredTxs = transactions.filter(
    (tx) =>
      tx.orderCode.toLowerCase().includes(search.toLowerCase()) ||
      tx.customerName.toLowerCase().includes(search.toLowerCase()) ||
      tx.transferContent.toLowerCase().includes(search.toLowerCase())
  );

  // Level 1: Manual Confirmation by Cashier
  const handleManualConfirm = (txId: string, orderCode: string) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === txId ? { ...t, status: "CONFIRMED_MANUAL" } : t))
    );
    toast.success(`[Cấp Độ 1 - Thủ Công] Thu ngân đã xác nhận thu tiền thành công cho đơn #${orderCode}! Đã chốt ca sân / trừ tồn kho.`);
  };

  // Level 2: Webhook Simulation (Casso / SePay / MoMo Auto Webhook)
  const handleSimulateWebhook = () => {
    const pendingTx = transactions.find((t) => t.status === "PENDING");
    if (!pendingTx) {
      toast.info("Tất cả giao dịch hiện tại đã được xác nhận!");
      return;
    }

    setTransactions((prev) =>
      prev.map((t) => (t.id === pendingTx.id ? { ...t, status: "CONFIRMED_AUTO" } : t))
    );

    toast.success(
      `🎉 [Cấp Độ 2 - Webhook Tự Động 100%]: Ngân hàng vừa bắn gói Webhook xác nhận biến động số dư +${new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(pendingTx.amount)} cho đơn #${pendingTx.orderCode}! System đổi trạng thái sang PAID thời gian thực!`,
      { duration: 6000 }
    );
  };

  return (
    <AppLayout
      title="Quản Lý Thanh Toán & Chuyển Khoản Ngân Hàng"
      subtitle="Theo dõi biến động số dư, xác nhận tiền về (Cấp độ 1 Thủ công & Cấp độ 2 Webhook tự động 100%)"
    >
      <div className="space-y-6">
        {/* Level 1 & Level 2 Explanation Banner */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card className="p-5 border-emerald-200 bg-emerald-50/60 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Cấp Độ 1: Đối Soát & Xác Nhận Thủ Công (Bán Tự Động)
              </span>
              <Badge className="bg-emerald-600">Áp dụng hiện tại</Badge>
            </div>
            <p className="text-xs text-emerald-950 leading-relaxed">
              Khách chuyển khoản VietQR với nội dung là <strong>Mã Đơn Hàng (VD: DP-1002)</strong>. Khi tài khoản báo "Ting ting", Thu ngân chỉ cần bấm nút <strong>"Xác Nhận Đã Thu Tiền"</strong> để hệ thống tự động chốt cứng lịch sân.
            </p>
          </Card>

          <Card className="p-5 border-blue-200 bg-blue-50/60 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-blue-900 flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-blue-600 animate-bounce" />
                Cấp Độ 2: Tự Động 100% Qua Webhook (Casso / SePay / MoMo)
              </span>
              <Badge variant="outline" className="text-blue-700 border-blue-300">
                Lắng nghe Real-time
              </Badge>
            </div>
            <p className="text-xs text-blue-950 leading-relaxed">
              Dịch vụ trung gian ngân hàng tự bắn gói dữ liệu Webhook ngầm sang API Laravel khi nhận được tiền. Hệ thống tự động chuyển trạng thái đơn thành <strong>PAID</strong> & đẩy popup thông báo ngay lập tức.
            </p>
          </Card>
        </div>

        {/* Action Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Tìm theo mã đơn DP-1002, tên khách..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleSimulateWebhook}
              className="gap-2 font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md text-xs"
            >
              <Zap className="h-4 w-4" />
              <span>Giả Lập Bắn Webhook Ngân Hàng (Cấp Độ 2)</span>
            </Button>
          </div>
        </div>

        {/* Payment Transactions Table */}
        <Card className="p-6 border-slate-200 bg-white shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Danh Sách Lịch Sử Giao Dịch Chuyển Khoản Ngân Hàng
            </h3>
            <Badge variant="secondary">{filteredTxs.length} Giao dịch</Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-bold text-slate-500 uppercase bg-slate-50">
                  <th className="py-3 px-3">Mã Giao Dịch</th>
                  <th className="py-3 px-3">Mã Đơn Hàng</th>
                  <th className="py-3 px-3">Khách Hàng</th>
                  <th className="py-3 px-3">Kênh Ngân Hàng</th>
                  <th className="py-3 px-3">Nội Dung CK</th>
                  <th className="py-3 px-3">Số Tiền (VNĐ)</th>
                  <th className="py-3 px-3">Trạng Thái Xử Lý</th>
                  <th className="py-3 px-3 text-right">Đối Soát Cấp 1</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTxs.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-mono font-bold text-slate-400">{tx.id}</td>

                    <td className="py-3 px-3 font-mono font-black text-slate-900 text-base">{tx.orderCode}</td>

                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{tx.customerName}</div>
                      <div className="text-xs text-slate-400">{tx.createdAt}</div>
                    </td>

                    <td className="py-3 px-3 font-semibold text-slate-800">{tx.bankName}</td>

                    <td className="py-3 px-3">
                      <code className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-mono font-bold text-xs">
                        {tx.transferContent}
                      </code>
                    </td>

                    <td className="py-3 px-3 font-black text-emerald-600">
                      {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(tx.amount)}
                    </td>

                    <td className="py-3 px-3">
                      {tx.status === "CONFIRMED_AUTO" ? (
                        <Badge className="bg-blue-600 gap-1">
                          <Zap className="h-3 w-3" /> Webhook Tự Động (Cấp 2)
                        </Badge>
                      ) : tx.status === "CONFIRMED_MANUAL" ? (
                        <Badge className="bg-emerald-600 gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Đã duyệt thủ công (Cấp 1)
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-300 gap-1 animate-pulse font-bold">
                          <Clock className="h-3 w-3" /> Chờ đối soát tiền về
                        </Badge>
                      )}
                    </td>

                    <td className="py-3 px-3 text-right">
                      {tx.status === "PENDING" ? (
                        <Button
                          size="sm"
                          onClick={() => handleManualConfirm(tx.id, tx.orderCode)}
                          className="h-8 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white gap-1"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" /> Xác Nhận Đã Thu Tiền
                        </Button>
                      ) : (
                        <span className="text-xs font-semibold text-slate-400 flex items-center justify-end gap-1">
                          <ShieldCheck className="h-4 w-4 text-emerald-600" /> Hoàn tất
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}

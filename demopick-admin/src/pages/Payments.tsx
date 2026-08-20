import { useState, useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  CreditCard,
  QrCode,
  CheckCircle2,
  Clock,
  ArrowDownRight,
  RefreshCw,
  Search,
  ShieldCheck,
  Building2,
  Receipt,
  Printer,
  Check,
  Eye,
  AlertCircle,
  Copy,
  Wallet,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

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

interface BankStatementLog {
  id: string;
  time: string;
  bankName: string;
  orderCode: string;
  amount: number;
  transferContent: string;
  matchStatus: "MATCHED" | "MANUAL";
}

const initialTransactions: PaymentTransaction[] = [
  {
    id: "TX-9901",
    orderCode: "DP-1002",
    customerName: "Nguyễn Văn An",
    amount: 360000,
    bankName: "VietinBank / VietQR",
    transferContent: "DP-1002",
    status: "PENDING",
    createdAt: "2026-08-18 10:10:00",
  },
  {
    id: "TX-9902",
    orderCode: "DP-1003",
    customerName: "Trần Thị Bích",
    amount: 5580000,
    bankName: "Vietcombank / VietQR",
    transferContent: "DP-1003",
    status: "CONFIRMED_AUTO",
    createdAt: "2026-08-18 09:15:22",
  },
  {
    id: "TX-9903",
    orderCode: "DP-1004",
    customerName: "Phạm Quốc Bảo",
    amount: 140000,
    bankName: "MoMo / VietQR",
    transferContent: "DP-1004",
    status: "CONFIRMED_AUTO",
    createdAt: "2026-08-18 08:45:10",
  },
  {
    id: "TX-9904",
    orderCode: "DP-1005",
    customerName: "Lê Hoàng Long",
    amount: 420000,
    bankName: "Techcombank / VietQR",
    transferContent: "DP-1005",
    status: "CONFIRMED_AUTO",
    createdAt: "2026-08-18 08:20:00",
  },
];

const initialBankStatements: BankStatementLog[] = [
  {
    id: "BS-1029",
    time: "18/08/2026 09:15:22",
    bankName: "Vietcombank (VCB)",
    orderCode: "DP-1003",
    amount: 5580000,
    transferContent: "DP-1003",
    matchStatus: "MATCHED",
  },
  {
    id: "BS-1028",
    time: "18/08/2026 08:45:10",
    bankName: "MoMo Gateway",
    orderCode: "DP-1004",
    amount: 140000,
    transferContent: "DP-1004",
    matchStatus: "MATCHED",
  },
  {
    id: "BS-1027",
    time: "18/08/2026 08:20:00",
    bankName: "Techcombank (TCB)",
    orderCode: "DP-1005",
    amount: 420000,
    transferContent: "DP-1005",
    matchStatus: "MATCHED",
  },
];

export default function Payments() {
  const [search, setSearch] = useState("");
  const [transactions, setTransactions] = useState<PaymentTransaction[]>(() => {
    const saved = localStorage.getItem("demopick_payment_transactions");
    if (saved) {
      try {
        const parsed: PaymentTransaction[] = JSON.parse(saved);
        return parsed.map((t) => ({
          ...t,
          transferContent: t.transferContent.startsWith("DP-") ? t.transferContent.split(" ")[0] : t.transferContent,
        }));
      } catch {}
    }
    return initialTransactions;
  });

  const [bankStatements, setBankStatements] = useState<BankStatementLog[]>(() => {
    const saved = localStorage.getItem("demopick_bank_statements");
    return saved ? JSON.parse(saved) : initialBankStatements;
  });

  const [selectedTxDetail, setSelectedTxDetail] = useState<PaymentTransaction | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem("demopick_payment_transactions", JSON.stringify(transactions));
    localStorage.setItem("demopick_bank_statements", JSON.stringify(bankStatements));
  }, [transactions, bankStatements]);

  const filteredTxs = transactions.filter(
    (tx) =>
      tx.orderCode.toLowerCase().includes(search.toLowerCase()) ||
      tx.customerName.toLowerCase().includes(search.toLowerCase()) ||
      tx.transferContent.toLowerCase().includes(search.toLowerCase())
  );

  // Xác nhận đã nhận tiền (Duyệt thu tiền thủ công cho nhân viên quầy)
  const handleConfirmPayment = (tx: PaymentTransaction) => {
    const nowTimeStr = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    const nowDateStr = new Date().toLocaleDateString("vi-VN");

    // 1. Cập nhật trạng thái giao dịch
    setTransactions((prev) =>
      prev.map((t) => (t.id === tx.id ? { ...t, status: "CONFIRMED_MANUAL" } : t))
    );

    // 2. Thêm vào nhật ký đối soát biến động số dư
    const newStatement: BankStatementLog = {
      id: "BS-" + Math.floor(1000 + Math.random() * 9000),
      time: `${nowDateStr} ${nowTimeStr}`,
      bankName: tx.bankName,
      orderCode: tx.orderCode,
      amount: tx.amount,
      transferContent: tx.transferContent,
      matchStatus: "MANUAL",
    };
    setBankStatements([newStatement, ...bankStatements]);

    // 3. Đồng bộ trạng thái đơn hàng online nếu có
    try {
      const rawOrders = localStorage.getItem("demopick_online_orders");
      if (rawOrders) {
        const parsed = JSON.parse(rawOrders);
        const updated = parsed.map((o: any) => {
          if (o.code === tx.orderCode) {
            return { ...o, payment_status: "paid", status: "confirmed" };
          }
          return o;
        });
        localStorage.setItem("demopick_online_orders", JSON.stringify(updated));
        window.dispatchEvent(new Event("storage"));
      }
    } catch {}

    toast.success(`Đã xác nhận thanh toán đơn #${tx.orderCode} (${new Intl.NumberFormat("vi-VN").format(tx.amount)}đ)!`);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Đã sao chép ${label}: ${text}`);
  };

  // Tính toán số liệu thống kê
  const totalPaidTransactions = transactions.filter((t) => t.status !== "PENDING");
  const totalPaidAmount = totalPaidTransactions.reduce((sum, t) => sum + t.amount, 0);
  const pendingCount = transactions.filter((t) => t.status === "PENDING").length;

  return (
    <AppLayout
      title="Cổng Thanh Toán & Đối Soát Ngân Hàng"
      subtitle="Theo dõi dòng tiền chuyển khoản VietQR, đối soát biến động số dư tự động và quản lý trạng thái thanh toán đơn hàng"
    >
      <div className="space-y-6 font-sans">
        {/* METRICS ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4 bg-white border-slate-200 shadow-sm flex items-center gap-3 rounded-2xl">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-medium uppercase">Đã Khớp Lệnh Tự Động</p>
              <p className="text-xl font-bold text-emerald-600">
                {totalPaidTransactions.length} Giao dịch
              </p>
            </div>
          </Card>

          <Card className="p-4 bg-white border-slate-200 shadow-sm flex items-center gap-3 rounded-2xl">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-medium uppercase">Chờ Khách Chuyển Khoản</p>
              <p className="text-xl font-bold text-amber-600">
                {pendingCount} Giao dịch
              </p>
            </div>
          </Card>

          <Card className="p-4 bg-white border-slate-200 shadow-sm flex items-center gap-3 rounded-2xl">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-medium uppercase">Tổng Tiền Thu Qua Ngân Hàng</p>
              <p className="text-xl font-bold text-slate-900">
                {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(totalPaidAmount)}
              </p>
            </div>
          </Card>
        </div>

        {/* SEARCH & TRANSACTIONS TABLE */}
        <Card className="bg-white border-slate-200 shadow-sm rounded-3xl overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-emerald-600" />
                <span>Danh Sách Giao Dịch Chuyển Khoản & Đối Soát</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Danh sách các lệnh chuyển khoản ngân hàng và trạng thái xác nhận từ hệ thống
              </p>
            </div>

            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Tìm theo mã đơn DP-1002, tên khách..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 text-xs h-10 rounded-xl border-slate-200 bg-[#FAF8F5]/70"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200/80">
                <tr>
                  <th className="py-3.5 px-4 whitespace-nowrap">MÃ GD</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">MÃ ĐƠN HÀNG</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">KHÁCH HÀNG</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">KÊNH NGÂN HÀNG</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">NỘI DUNG CK</th>
                  <th className="py-3.5 px-4 text-right whitespace-nowrap">SỐ TIỀN</th>
                  <th className="py-3.5 px-4 text-center whitespace-nowrap">TRẠNG THÁI</th>
                  <th className="py-3.5 px-4 text-right whitespace-nowrap">THAO TÁC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTxs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-slate-400">
                      Không tìm thấy giao dịch nào.
                    </td>
                  </tr>
                ) : (
                  filteredTxs.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-400 whitespace-nowrap">{tx.id}</td>

                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 text-sm whitespace-nowrap">
                        {tx.orderCode}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-900">{tx.customerName}</div>
                        <div className="text-[11px] text-slate-400 font-normal">{tx.createdAt}</div>
                      </td>

                      <td className="py-3.5 px-4 font-medium text-slate-700 whitespace-nowrap">{tx.bankName}</td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <code className="bg-[#FAF8F5] text-amber-950 px-2.5 py-1 rounded-lg font-mono font-bold text-xs border border-amber-200/80 inline-block">
                          {tx.transferContent}
                        </code>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-emerald-700 text-right text-sm whitespace-nowrap">
                        {new Intl.NumberFormat("vi-VN").format(tx.amount)} đ
                      </td>

                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {tx.status === "CONFIRMED_AUTO" ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                            <span>Đã Khớp Lệnh</span>
                          </span>
                        ) : tx.status === "CONFIRMED_MANUAL" ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                            <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                            <span>Duyệt Thủ Công</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-300 animate-pulse">
                            <Clock className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                            <span>Chờ Chuyển Tiền</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        {tx.status === "PENDING" ? (
                          <Button
                            size="sm"
                            onClick={() => handleConfirmPayment(tx)}
                            className="h-8 px-3 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-sm gap-1 whitespace-nowrap"
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span>Xác Nhận</span>
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedTxDetail(tx)}
                            className="h-8 px-2.5 text-xs font-medium text-slate-700 border-slate-300 hover:bg-slate-50 rounded-xl gap-1 whitespace-nowrap"
                          >
                            <Eye className="h-3.5 w-3.5 text-slate-500" />
                            <span>Chi Tiết</span>
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* 🟢 KHUNG THÔNG TIN NGÂN HÀNG & NHẬT KÝ ĐỐI SOÁT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* CỘT TRÁI (5 COLS): THÔNG TIN TÀI KHOẢN NGÂN HÀNG CLB */}
          <Card className="lg:col-span-5 p-5 bg-white border-slate-200 shadow-sm rounded-3xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Tài Khoản Ngân Hàng Nhận Tiền</h3>
                  <p className="text-[11px] text-slate-500">Tài khoản thụ hưởng chính thức của DemoPick Club</p>
                </div>
              </div>
              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px]">Đang Sử Dụng</Badge>
            </div>

            <div className="p-4 bg-gradient-to-br from-emerald-800 via-emerald-900 to-slate-900 text-white rounded-2xl shadow-md space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold tracking-wider text-emerald-300 uppercase">VietinBank (Ngân Hàng Công Thương)</span>
                <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full font-mono">VietQR 24/7</span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-slate-300 block">Số tài khoản:</span>
                <div className="flex items-center justify-between">
                  <strong className="text-xl font-mono tracking-widest text-emerald-400">
                    102888888888
                  </strong>
                  <button
                    type="button"
                    onClick={() => copyToClipboard("102888888888", "Số tài khoản")}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                    title="Sao chép STK"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-end text-xs pt-1 border-t border-white/10">
                <div>
                  <span className="text-[10px] text-slate-300 block">Chủ tài khoản:</span>
                  <strong className="font-bold text-slate-100 uppercase">NGUYEN MANH TIEN</strong>
                </div>
                <span className="text-[10px] text-slate-300">CN Hà Nội</span>
              </div>
            </div>

            <div className="p-3 bg-[#FAF8F5] rounded-2xl border border-slate-200/80 text-xs space-y-1.5 text-slate-600">
              <strong className="text-slate-900 font-bold block">💡 Hướng dẫn thu ngân / nhân viên quầy:</strong>
              <p className="text-[11px] leading-relaxed">
                Khách chuyển khoản đúng cú pháp <code className="font-bold text-amber-900 bg-amber-100 px-1 py-0.5 rounded">DP-[MÃ ĐƠN]</code> hệ thống sẽ tự khớp lệnh trong 3 - 5 giây. Nếu khách chuyển sai cú pháp hoặc tiền về chậm, thu ngân có thể bấm nút <strong>"Xác Nhận Đã Nhận Tiền"</strong> ở bảng trên để duyệt đơn.
              </p>
            </div>
          </Card>

          {/* CỘT PHẢI (7 COLS): NHẬT KÝ ĐỐI SOÁT BIẾN ĐỘNG SỐ DƯ (THAY THẾ RAW JSON) */}
          <Card className="lg:col-span-7 p-5 bg-white border-slate-200 shadow-sm rounded-3xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Nhật Ký Biến Động Số Dư & Đối Soát</h3>
                  <p className="text-[11px] text-slate-500">Lịch sử tiền về tài khoản ngân hàng khớp với đơn hàng</p>
                </div>
              </div>
              <Badge variant="outline" className="text-slate-600 text-[10px]">
                {bankStatements.length} Bản ghi
              </Badge>
            </div>

            <div className="space-y-2.5 max-h-[290px] overflow-y-auto pr-1">
              {bankStatements.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-[#FAF8F5] hover:bg-slate-50 rounded-2xl border border-slate-200/90 text-xs space-y-1.5 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-slate-900">
                      <span className="font-mono text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md text-[10px]">
                        {item.id}
                      </span>
                      <span className="text-slate-800">{item.bankName}</span>
                    </div>
                    <strong className="text-emerald-700 font-extrabold text-sm">
                      +{new Intl.NumberFormat("vi-VN").format(item.amount)} đ
                    </strong>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-600">
                    <div>
                      Nội dung: <code className="text-slate-900 font-mono font-bold">{item.transferContent}</code>
                    </div>
                    <Badge className={item.matchStatus === "MATCHED" ? "bg-emerald-600 text-[10px]" : "bg-blue-600 text-[10px]"}>
                      {item.matchStatus === "MATCHED" ? "Khớp Tự Động" : "Thu Ngân Duyệt"}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200/60">
                    <span>Thời gian nhận: {item.time}</span>
                    <span>Khớp đơn: <strong className="font-mono text-slate-800 font-bold">#{item.orderCode}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* DIALOG XEM CHI TIẾT GIAO DỊCH */}
      <Dialog open={!!selectedTxDetail} onOpenChange={() => setSelectedTxDetail(null)}>
        <DialogContent className="max-w-md bg-white rounded-3xl p-6 border border-slate-200 font-sans shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-emerald-600" />
              Chi Tiết Giao Dịch #{selectedTxDetail?.id}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 font-normal">
              Thông tin chi tiết chuyển khoản của đơn hàng #{selectedTxDetail?.orderCode}
            </DialogDescription>
          </DialogHeader>

          {selectedTxDetail && (
            <div className="space-y-3 pt-2 text-xs">
              <div className="p-3.5 bg-[#FAF8F5] rounded-2xl border border-slate-200/80 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Mã đơn hàng:</span>
                  <strong className="font-mono font-bold text-slate-900">{selectedTxDetail.orderCode}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Khách hàng:</span>
                  <strong className="text-slate-900">{selectedTxDetail.customerName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Kênh thanh toán:</span>
                  <strong className="text-slate-900">{selectedTxDetail.bankName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Số tiền:</span>
                  <strong className="text-emerald-700 font-extrabold text-sm">
                    {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(selectedTxDetail.amount)}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Thời gian tạo lệnh:</span>
                  <span>{selectedTxDetail.createdAt}</span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-slate-200/60">
                  <span className="text-slate-500">Trạng thái:</span>
                  <Badge className="bg-emerald-600 font-bold">
                    {selectedTxDetail.status === "CONFIRMED_AUTO" ? "Đã Khớp Lệnh Tự Động" : "Đã Xác Nhận"}
                  </Badge>
                </div>
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedTxDetail(null)}
                  className="w-full h-10 rounded-xl text-xs font-semibold"
                >
                  Đóng
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

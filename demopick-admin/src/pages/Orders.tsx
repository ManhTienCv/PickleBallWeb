import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Receipt, Printer, RefreshCw, CheckCircle2, Eye, Edit3, Trash2, Calendar, ChevronLeft, ChevronRight, User, Plus, FileText, CreditCard } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface OrderItem {
  id: number;
  name: string;
  qty: number;
  price: number;
}

interface Order {
  code: string;
  customerName: string;
  staffName: string;
  type: "POS Quầy" | "Đặt Sân Online";
  totalAmount: number;
  paymentMethod: "Tiền mặt" | "VietQR" | "MoMo";
  status: "PAID" | "PENDING" | "REFUNDED";
  createdAt: string;
  dateStr: string;
  items: OrderItem[];
  editNote?: string;
}

const mockOrders: Order[] = [
  {
    code: "HD-88291",
    customerName: "Nguyễn Văn An (VIP)",
    staffName: "Hệ thống Tự Động Online",
    type: "Đặt Sân Online",
    totalAmount: 360000,
    paymentMethod: "VietQR",
    status: "PAID",
    createdAt: "2026-08-09 08:30",
    dateStr: "2026-08-09",
    items: [{ id: 1, name: "Đặt Sân VIP 1 (08:00 - 10:00)", qty: 1, price: 360000 }],
  },
  {
    code: "HD-88292",
    customerName: "Trần Thị Bích (Gold)",
    staffName: "Phạm Văn Đức (Ca Sáng)",
    type: "POS Quầy",
    totalAmount: 5580000,
    paymentMethod: "Tiền mặt",
    status: "PAID",
    createdAt: "2026-08-09 09:15",
    dateStr: "2026-08-09",
    items: [
      { id: 2, name: "Vợt Pickleball JOOLA Perseus 16mm", qty: 1, price: 5490000 },
      { id: 3, name: "Nước Suối Aquafina 500ml", qty: 3, price: 30000 },
    ],
  },
  {
    code: "HD-88293",
    customerName: "Lê Hoàng Long",
    staffName: "Hệ thống Tự Động Online",
    type: "Đặt Sân Online",
    totalAmount: 180000,
    paymentMethod: "MoMo",
    status: "REFUNDED",
    createdAt: "2026-08-09 07:00",
    dateStr: "2026-08-09",
    items: [{ id: 4, name: "Đặt Sân 2 (06:00 - 08:00) - [Đã Hủy Hoàn 100%]", qty: 1, price: 180000 }],
  },
  {
    code: "HD-88294",
    customerName: "Phạm Quốc Bảo (VIP)",
    staffName: "Nguyễn Thị Hương (Ca Chiều)",
    type: "POS Quầy",
    totalAmount: 140000,
    paymentMethod: "VietQR",
    status: "PAID",
    createdAt: "2026-08-09 10:00",
    dateStr: "2026-08-09",
    items: [
      { id: 5, name: "Bóng Pickleball Franklin X-40 (Hộp 4 quả)", qty: 1, price: 90000 },
      { id: 6, name: "Băng Cán Vợt JOOLA Pro Grip", qty: 2, price: 25000 },
    ],
  },
  {
    code: "HD-88285",
    customerName: "Vũ Thị Mai (Gold)",
    staffName: "Phạm Văn Đức (Ca Sáng)",
    type: "POS Quầy",
    totalAmount: 420000,
    paymentMethod: "Tiền mặt",
    status: "PAID",
    createdAt: "2026-08-08 16:45",
    dateStr: "2026-08-08",
    items: [{ id: 7, name: "Hộp 12 Bóng Franklin X-40 Outdoor", qty: 1, price: 420000 }],
  },
];

const availableAddons = [
  { id: 101, name: "Nước Suối Aquafina 500ml", price: 10000 },
  { id: 102, name: "Nước Điện Giải Pocari Sweat", price: 25000 },
  { id: 103, name: "Băng Cán Vợt JOOLA Pro Grip", price: 25000 },
  { id: 104, name: "Bóng Pickleball Franklin X-40 Single", price: 35000 },
];

export default function Orders() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [datePeriod, setDatePeriod] = useState("today"); // today, yesterday, 7days, custom
  const [customDate, setCustomDate] = useState("2026-08-09");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const [ordersList, setOrdersList] = useState<Order[]>(mockOrders);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [printReceiptOrder, setPrintReceiptOrder] = useState<Order | null>(null);

  // Filter logic
  const filteredOrders = ordersList.filter((order) => {
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const matchesSearch =
      order.code.toLowerCase().includes(search.toLowerCase()) ||
      order.customerName.toLowerCase().includes(search.toLowerCase()) ||
      order.staffName.toLowerCase().includes(search.toLowerCase());

    let matchesDate = true;
    if (datePeriod === "today") {
      matchesDate = order.dateStr === "2026-08-09";
    } else if (datePeriod === "yesterday") {
      matchesDate = order.dateStr === "2026-08-08";
    } else if (datePeriod === "custom") {
      matchesDate = order.dateStr === customDate;
    }

    return matchesStatus && matchesSearch && matchesDate;
  });

  // Pagination calculation
  const totalPages = Math.ceil(filteredOrders.length / pageSize) || 1;
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const totalFilteredRevenue = filteredOrders
    .filter((o) => o.status === "PAID")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const handlePrint = (order: Order) => {
    setPrintReceiptOrder(order);
  };

  const handleOpenEdit = (order: Order) => {
    setEditingOrder(JSON.parse(JSON.stringify(order)));
  };

  const handleItemQtyChange = (itemId: number, delta: number) => {
    if (!editingOrder) return;
    const updatedItems = editingOrder.items
      .map((item) => {
        if (item.id === itemId) {
          const newQty = item.qty + delta;
          return newQty > 0 ? { ...item, qty: newQty } : null;
        }
        return item;
      })
      .filter(Boolean) as OrderItem[];

    const newTotal = updatedItems.reduce((sum, i) => sum + i.price * i.qty, 0);
    setEditingOrder({ ...editingOrder, items: updatedItems, totalAmount: newTotal });
  };

  const handleRemoveItem = (itemId: number) => {
    if (!editingOrder) return;
    const updatedItems = editingOrder.items.filter((i) => i.id !== itemId);
    const newTotal = updatedItems.reduce((sum, i) => sum + i.price * i.qty, 0);
    setEditingOrder({ ...editingOrder, items: updatedItems, totalAmount: newTotal });
  };

  const handleAddItemToEditingOrder = (addon: { id: number; name: string; price: number }) => {
    if (!editingOrder) return;
    const existing = editingOrder.items.find((i) => i.id === addon.id || i.name === addon.name);
    let updatedItems: OrderItem[];
    if (existing) {
      updatedItems = editingOrder.items.map((i) =>
        i.id === existing.id ? { ...i, qty: i.qty + 1 } : i
      );
    } else {
      updatedItems = [
        ...editingOrder.items,
        { id: addon.id, name: addon.name, price: addon.price, qty: 1 },
      ];
    }
    const newTotal = updatedItems.reduce((sum, i) => sum + i.price * i.qty, 0);
    setEditingOrder({ ...editingOrder, items: updatedItems, totalAmount: newTotal });
  };

  const handleSaveEditAndReprint = () => {
    if (!editingOrder) return;
    const updatedList = ordersList.map((o) => (o.code === editingOrder.code ? editingOrder : o));
    setOrdersList(updatedList);
    toast.success(`Đã cập nhật chỉnh sửa đơn hàng & in lại Bill #${editingOrder.code}!`);
    setPrintReceiptOrder(editingOrder);
    setEditingOrder(null);
  };

  return (
    <AppLayout
      title="Tra Cứu Hóa Đơn & Form Chỉnh Sửa Đơn Hàng"
      subtitle="Hiển thị rõ Thu ngân thực hiện, hỗ trợ Form sửa chi tiết đơn hàng & in lại Bill chuẩn quầy"
    >
      <div className="space-y-6">
        {/* Filters & Calendar Date Picker Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Date Period Filter */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 mr-1">
                <Calendar className="h-4 w-4 text-emerald-600" />
                <span>Xem theo lịch:</span>
              </div>

              {[
                { id: "today", label: "Hôm nay (Ca trực)" },
                { id: "yesterday", label: "Hôm qua" },
                { id: "7days", label: "Tất cả các ngày" },
                { id: "custom", label: "Chọn ngày cụ thể" },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setDatePeriod(p.id);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    datePeriod === p.id ? "bg-emerald-600 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {p.label}
                </button>
              ))}

              {datePeriod === "custom" && (
                <Input
                  type="date"
                  value={customDate}
                  onChange={(e) => {
                    setCustomDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-36 text-xs h-8 font-bold border-slate-300"
                />
              )}
            </div>

            {/* Total Revenue Indicator for Filtered Period */}
            <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs flex items-center gap-2">
              <span className="text-emerald-800 font-semibold">Doanh thu thời gian chọn:</span>
              <strong className="text-emerald-700 font-black text-sm">
                {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(totalFilteredRevenue)}
              </strong>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t pt-3">
            <div className="flex items-center gap-2">
              {[
                { id: "all", label: "Tất cả trạng thái" },
                { id: "PAID", label: "Đã thanh toán" },
                { id: "REFUNDED", label: "Đã hoàn tiền (Hủy)" },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => {
                    setStatusFilter(st.id);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    statusFilter === st.id ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Tìm mã HD, khách hàng, tên thu ngân..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 text-xs h-9"
              />
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <Card className="p-6 border-slate-200 bg-white shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Receipt className="h-5 w-5 text-emerald-600" />
              Lịch Sử Hóa Đơn (Hiển Thị Rõ Nhân Viên Xử Lý)
            </h3>
            <Badge variant="secondary">{filteredOrders.length} Hóa đơn</Badge>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 max-h-[calc(100vh-320px)] overflow-y-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 font-bold text-slate-700 uppercase bg-slate-50">
                  <th className="py-3 px-3">Mã Hóa Đơn</th>
                  <th className="py-3 px-3">Khách Hàng</th>
                  <th className="py-3 px-3">Thu Ngân Thực Hiện</th>
                  <th className="py-3 px-3">Phương Thức</th>
                  <th className="py-3 px-3">Tổng Tiền</th>
                  <th className="py-3 px-3">Trạng Thái</th>
                  <th className="py-3 px-3 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {paginatedOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      Không tìm thấy hóa đơn nào trong khoảng thời gian đã chọn
                    </td>
                  </tr>
                ) : (
                  paginatedOrders.map((order) => (
                    <tr key={order.code} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-slate-900">{order.code}</td>

                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{order.customerName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{order.createdAt}</div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-bold text-emerald-800 flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                          <span>{order.staffName}</span>
                        </div>
                        <div className="text-[10px] text-slate-400">Loại: {order.type}</div>
                      </td>

                      <td className="py-3 px-3 font-semibold text-slate-700">{order.paymentMethod}</td>

                      <td className="py-3 px-3 font-black text-emerald-600">
                        {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(order.totalAmount)}
                      </td>

                      <td className="py-3 px-3">
                        {order.status === "PAID" ? (
                          <Badge className="bg-emerald-600 gap-1 font-bold">
                            <CheckCircle2 className="h-3 w-3" /> Đã thanh toán
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="gap-1 font-bold">
                            <RefreshCw className="h-3 w-3" /> Đã hoàn tiền
                          </Badge>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right space-x-1.5">
                        <Button size="sm" variant="outline" onClick={() => setSelectedOrder(order)} className="h-7 px-2 text-[11px] gap-1 font-semibold">
                          <Eye className="h-3.5 w-3.5" /> Xem
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleOpenEdit(order)} className="h-7 px-2 text-[11px] gap-1 text-amber-700 border-amber-300 hover:bg-amber-50 font-bold">
                          <Edit3 className="h-3.5 w-3.5" /> Sửa Đơn
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handlePrint(order)} className="h-7 px-2 text-[11px] gap-1 font-semibold">
                          <Printer className="h-3.5 w-3.5" /> In Bill
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between pt-2 border-t text-xs">
            <span className="text-slate-500 font-medium">
              Hiển thị {paginatedOrders.length} / {filteredOrders.length} hóa đơn
            </span>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="h-8 gap-1 font-bold text-xs"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Trang trước
              </Button>
              <span className="font-bold text-slate-900 px-2">
                {currentPage} / {totalPages}
              </span>
              <Button
                size="sm"
                variant="outline"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="h-8 gap-1 font-bold text-xs"
              >
                Trang tiếp <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Form Sửa Đơn Hàng Modal */}
        <Dialog open={!!editingOrder} onOpenChange={() => setEditingOrder(null)}>
          <DialogContent className="max-w-xl bg-white max-h-[90vh] overflow-y-auto">
            {editingOrder && (
              <div className="space-y-4">
                <DialogHeader>
                  <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Edit3 className="h-5 w-5 text-amber-500" />
                    Form Chỉnh Sửa Đơn Hàng #{editingOrder.code}
                  </DialogTitle>
                  <DialogDescription>
                    Thay đổi thông tin khách hàng, phương thức thanh toán, điều chỉnh sản phẩm & in lại Bill
                  </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  {/* Customer Name */}
                  <div className="space-y-1.5">
                    <Label className="font-bold text-slate-700">Tên Khách Hàng:</Label>
                    <Input
                      value={editingOrder.customerName}
                      onChange={(e) => setEditingOrder({ ...editingOrder, customerName: e.target.value })}
                      className="text-xs h-9 font-semibold"
                    />
                  </div>

                  {/* Staff Name (Read-only info) */}
                  <div className="space-y-1.5">
                    <Label className="font-bold text-slate-700">Thu Ngân Xử Lý:</Label>
                    <Input
                      value={editingOrder.staffName}
                      disabled
                      className="text-xs h-9 font-semibold bg-slate-100 text-slate-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  {/* Payment Method */}
                  <div className="space-y-1.5">
                    <Label className="font-bold text-slate-700">Phương Thức Thanh Toán:</Label>
                    <RadioGroup
                      value={editingOrder.paymentMethod}
                      onValueChange={(v: any) => setEditingOrder({ ...editingOrder, paymentMethod: v })}
                      className="flex items-center gap-3 pt-1"
                    >
                      <div className="flex items-center gap-1">
                        <RadioGroupItem value="Tiền mặt" id="edit-cash" />
                        <Label htmlFor="edit-cash" className="cursor-pointer font-semibold">Tiền mặt</Label>
                      </div>
                      <div className="flex items-center gap-1">
                        <RadioGroupItem value="VietQR" id="edit-qr" />
                        <Label htmlFor="edit-qr" className="cursor-pointer font-semibold">VietQR</Label>
                      </div>
                      <div className="flex items-center gap-1">
                        <RadioGroupItem value="MoMo" id="edit-momo" />
                        <Label htmlFor="edit-momo" className="cursor-pointer font-semibold">MoMo</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Order Status */}
                  <div className="space-y-1.5">
                    <Label className="font-bold text-slate-700">Trạng Thái Đơn Hàng:</Label>
                    <RadioGroup
                      value={editingOrder.status}
                      onValueChange={(v: any) => setEditingOrder({ ...editingOrder, status: v })}
                      className="flex items-center gap-3 pt-1"
                    >
                      <div className="flex items-center gap-1">
                        <RadioGroupItem value="PAID" id="edit-status-paid" />
                        <Label htmlFor="edit-status-paid" className="cursor-pointer font-semibold text-emerald-700">Đã thanh toán</Label>
                      </div>
                      <div className="flex items-center gap-1">
                        <RadioGroupItem value="REFUNDED" id="edit-status-refund" />
                        <Label htmlFor="edit-status-refund" className="cursor-pointer font-semibold text-red-600">Hoàn tiền / Hủy</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                {/* Edit Note */}
                <div className="space-y-1.5 text-xs">
                  <Label className="font-bold text-slate-700">Ghi Chú Lý Do Sửa Đơn:</Label>
                  <Input
                    placeholder="VD: Khách đổi sang mua nước pocari, Lễ tân chọn nhầm phương thức..."
                    value={editingOrder.editNote || ""}
                    onChange={(e) => setEditingOrder({ ...editingOrder, editNote: e.target.value })}
                    className="text-xs h-9"
                  />
                </div>

                {/* Products List & Quick Add Button */}
                <div className="space-y-2 pt-2 border-t text-xs">
                  <div className="flex items-center justify-between">
                    <Label className="font-bold text-slate-700">Danh Sách Sản Phẩm Trong Đơn:</Label>
                    <span className="text-slate-500 font-semibold">{editingOrder.items.length} Mặt hàng</span>
                  </div>

                  <div className="divide-y divide-slate-100 border rounded-xl overflow-hidden text-xs">
                    {editingOrder.items.length === 0 ? (
                      <div className="p-4 text-center text-slate-400">Đơn hàng đang trống sản phẩm</div>
                    ) : (
                      editingOrder.items.map((item) => (
                        <div key={item.id} className="p-2.5 flex items-center justify-between bg-white">
                          <div className="flex-1 pr-2">
                            <div className="font-bold text-slate-900">{item.name}</div>
                            <div className="text-emerald-600 font-semibold">
                              {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(item.price)}
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="flex items-center border rounded-lg overflow-hidden bg-slate-50">
                              <button
                                onClick={() => handleItemQtyChange(item.id, -1)}
                                className="px-2 py-1 text-slate-600 hover:bg-slate-200 font-bold"
                              >
                                -
                              </button>
                              <span className="px-2.5 font-extrabold text-slate-900">{item.qty}</span>
                              <button
                                onClick={() => handleItemQtyChange(item.id, 1)}
                                className="px-2 py-1 text-slate-600 hover:bg-slate-200 font-bold"
                              >
                                +
                              </button>
                            </div>

                            <button onClick={() => handleRemoveItem(item.id)} className="text-red-500 p-1 hover:bg-red-50 rounded">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add Fast Addon Products */}
                  <div className="pt-2">
                    <span className="text-[11px] font-bold text-slate-500 block mb-1 text-emerald-800">
                      + Thêm sản phẩm nhanh vào đơn:
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {availableAddons.map((addon) => (
                        <button
                          key={addon.id}
                          onClick={() => handleAddItemToEditingOrder(addon)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 border rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1"
                        >
                          <Plus className="h-3 w-3" />
                          <span>{addon.name} ({new Intl.NumberFormat("vi-VN").format(addon.price)}đ)</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-500 block">Tổng tiền đơn hàng mới:</span>
                    <span className="text-xl font-black text-emerald-600">
                      {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(editingOrder.totalAmount)}
                    </span>
                  </div>
                  <Button onClick={handleSaveEditAndReprint} className="gap-2 font-bold bg-amber-600 hover:bg-amber-500 text-white">
                    <Printer className="h-4 w-4" /> Lưu Đơn Hàng & In Lại Bill
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* View Order Details Modal */}
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-md bg-white">
            {selectedOrder && (
              <div className="space-y-4">
                <DialogHeader>
                  <DialogTitle className="flex items-center justify-between">
                    <span>Chi Tiết Hóa Đơn #{selectedOrder.code}</span>
                    <Badge className="bg-emerald-600">{selectedOrder.status}</Badge>
                  </DialogTitle>
                  <DialogDescription>Thời gian tạo: {selectedOrder.createdAt}</DialogDescription>
                </DialogHeader>

                <div className="p-3 bg-slate-50 rounded-xl space-y-2 text-xs border border-slate-200">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Khách hàng:</span>
                    <strong className="text-slate-900">{selectedOrder.customerName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Thu ngân thực hiện:</span>
                    <strong className="text-emerald-700">{selectedOrder.staffName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Hình thức thanh toán:</span>
                    <strong className="text-slate-900">{selectedOrder.paymentMethod}</strong>
                  </div>
                  {selectedOrder.editNote && (
                    <div className="flex justify-between text-amber-700 border-t pt-1">
                      <span>Lý do sửa đơn:</span>
                      <strong>{selectedOrder.editNote}</strong>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-xs uppercase text-slate-500">Sản phẩm mua:</h4>
                  <div className="divide-y divide-slate-100 text-xs border rounded-xl overflow-hidden">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="p-3 flex justify-between items-center bg-white">
                        <div>
                          <div className="font-bold text-slate-900">{item.name}</div>
                          <div className="text-slate-400">Số lượng: x{item.qty}</div>
                        </div>
                        <div className="font-black text-emerald-600">
                          {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(item.price * item.qty)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t flex items-center justify-between">
                  <span className="text-xl font-black text-emerald-600">
                    {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(selectedOrder.totalAmount)}
                  </span>
                  <Button onClick={() => handlePrint(selectedOrder)} className="gap-1 font-bold">
                    <Printer className="h-4 w-4" /> In Hóa Đơn
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Modal Xem Trước Phân Phiếu In Bill Chuẩn Quầy */}
        <Dialog open={!!printReceiptOrder} onOpenChange={() => setPrintReceiptOrder(null)}>
          <DialogContent className="max-w-sm bg-white font-mono text-slate-900">
            {printReceiptOrder && (
              <div className="space-y-4 p-2 text-xs border border-dashed border-slate-300 rounded-2xl">
                {/* Receipt Header */}
                <div className="text-center space-y-1 pb-3 border-b border-dashed border-slate-300">
                  <h3 className="font-black text-base uppercase">DemoPick ONE Long Biên</h3>
                  <p className="text-[11px] text-slate-600">188 Nguyễn Văn Cừ, Long Biên, Hà Nội</p>
                  <p className="text-[11px] text-slate-600">Hotline: 0988.123.456</p>
                  <div className="text-[12px] font-bold uppercase pt-1 text-slate-900">HÓA ĐƠN THANH TOÁN</div>
                </div>

                {/* Receipt Info */}
                <div className="space-y-1 text-[11px] border-b border-dashed border-slate-300 pb-2">
                  <div className="flex justify-between">
                    <span>Mã HD:</span>
                    <strong className="font-mono">{printReceiptOrder.code}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Ngày giờ:</span>
                    <span>{printReceiptOrder.createdAt}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Khách hàng:</span>
                    <strong>{printReceiptOrder.customerName}</strong>
                  </div>
                  <div className="flex justify-between text-emerald-800">
                    <span>Thu ngân thực hiện:</span>
                    <strong className="font-bold">{printReceiptOrder.staffName}</strong>
                  </div>
                  {printReceiptOrder.editNote && (
                    <div className="flex justify-between text-amber-800 pt-0.5">
                      <span>Ghi chú sửa:</span>
                      <strong>{printReceiptOrder.editNote}</strong>
                    </div>
                  )}
                </div>

                {/* Items */}
                <div className="space-y-1.5 text-[11px] border-b border-dashed border-slate-300 pb-2">
                  <div className="flex justify-between font-bold border-b pb-1">
                    <span>Tên mặt hàng</span>
                    <span>SL x Đơn giá</span>
                    <span>Thành tiền</span>
                  </div>
                  {printReceiptOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between py-0.5">
                      <span className="line-clamp-1 max-w-[130px]">{item.name}</span>
                      <span>{item.qty}x</span>
                      <span className="font-bold">{new Intl.NumberFormat("vi-VN").format(item.price * item.qty)}đ</span>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="space-y-1 text-[11px]">
                  <div className="flex justify-between font-black text-sm pt-1">
                    <span>TỔNG TIỀN HÀNG:</span>
                    <span>{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(printReceiptOrder.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span>Phương thức:</span>
                    <strong>{printReceiptOrder.paymentMethod}</strong>
                  </div>
                </div>

                {/* Footer Message */}
                <div className="text-center text-[10px] text-slate-500 pt-3 border-t border-dashed border-slate-300 space-y-0.5">
                  <p className="font-bold text-slate-800">Cảm ơn Quý khách & Hẹn gặp lại!</p>
                  <p>Website: demopick.com • Wifi pass: demopick2026</p>
                </div>

                <DialogFooter className="pt-2">
                  <Button
                    onClick={() => {
                      toast.success(`Đã gửi lệnh in Bill #${printReceiptOrder.code} tới máy in nhiệt!`);
                      setPrintReceiptOrder(null);
                    }}
                    className="w-full font-bold bg-slate-900 text-white"
                  >
                    In Phiếu Thanh Toán 🖨️
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}

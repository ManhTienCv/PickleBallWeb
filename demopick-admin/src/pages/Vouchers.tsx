import React, { useState, useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Ticket,
  Plus,
  Search,
  RefreshCw,
  Percent,
  CheckCircle2,
  Calendar,
  Trash2,
  Edit2,
  AlertCircle,
  Tag,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import api, { ApiResponse } from "@/lib/api";

interface VoucherItem {
  id: number;
  code: string;
  title: string;
  description?: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  max_discount?: number | null;
  min_order_amount: number;
  usage_limit?: number | null;
  used_count: number;
  start_date?: string | null;
  end_date?: string | null;
  is_active: boolean;
  created_at: string;
}

export default function VouchersPage() {
  const [vouchers, setVouchers] = useState<VoucherItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [editingVoucher, setEditingVoucher] = useState<VoucherItem | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Form Fields
  const [formCode, setFormCode] = useState<string>("");
  const [formTitle, setFormTitle] = useState<string>("");
  const [formDesc, setFormDesc] = useState<string>("");
  const [formType, setFormType] = useState<"percentage" | "fixed">("fixed");
  const [formValue, setFormValue] = useState<string>("50000");
  const [formMaxDiscount, setFormMaxDiscount] = useState<string>("");
  const [formMinOrder, setFormMinOrder] = useState<string>("300000");
  const [formLimit, setFormLimit] = useState<string>("500");

  const fetchVouchers = async () => {
    setIsLoading(true);
    try {
      const res = await api.get<ApiResponse<any>>("/admin/vouchers", {
        params: {
          search: searchQuery.trim() || undefined,
          status: statusFilter === "all" ? undefined : statusFilter,
        },
      });

      const data = res.data?.data;
      if (data && Array.isArray(data.data)) {
        setVouchers(data.data);
      } else if (Array.isArray(data)) {
        setVouchers(data);
      }
    } catch (err) {
      console.warn("Fallback or error loading vouchers:", err);
      toast.error("Không thể tải danh sách mã ưu đãi.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, [statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchVouchers();
  };

  const handleOpenCreate = () => {
    setEditingVoucher(null);
    setFormCode("");
    setFormTitle("");
    setFormDesc("");
    setFormType("fixed");
    setFormValue("50000");
    setFormMaxDiscount("");
    setFormMinOrder("300000");
    setFormLimit("500");
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (v: VoucherItem) => {
    setEditingVoucher(v);
    setFormCode(v.code);
    setFormTitle(v.title);
    setFormDesc(v.description || "");
    setFormType(v.discount_type);
    setFormValue(String(v.discount_value));
    setFormMaxDiscount(v.max_discount ? String(v.max_discount) : "");
    setFormMinOrder(String(v.min_order_amount));
    setFormLimit(v.usage_limit ? String(v.usage_limit) : "");
    setIsDialogOpen(true);
  };

  const handleSaveVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCode.trim() || !formTitle.trim()) {
      toast.error("Vui lòng điền mã code và tiêu đề voucher");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        code: formCode.toUpperCase().trim(),
        title: formTitle.trim(),
        description: formDesc.trim() || null,
        discount_type: formType,
        discount_value: Number(formValue),
        max_discount: formType === "percentage" && formMaxDiscount ? Number(formMaxDiscount) : null,
        min_order_amount: Number(formMinOrder) || 0,
        usage_limit: formLimit ? Number(formLimit) : null,
        is_active: true,
      };

      if (editingVoucher) {
        await api.put(`/admin/vouchers/${editingVoucher.id}`, payload);
        toast.success(`Đã cập nhật mã ưu đãi ${payload.code}!`);
      } else {
        await api.post("/admin/vouchers", payload);
        toast.success(`Đã tạo thành công mã ưu đãi ${payload.code}!`);
      }

      setIsDialogOpen(false);
      fetchVouchers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi khi lưu voucher.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteVoucher = async (id: number, code: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa mã ưu đãi ${code}?`)) return;
    try {
      await api.delete(`/admin/vouchers/${id}`);
      toast.success(`Đã xóa mã ưu đãi ${code}!`);
      setVouchers((prev) => prev.filter((v) => v.id !== id));
    } catch {
      toast.error("Lỗi khi xóa mã ưu đãi.");
    }
  };

  // Metrics
  const totalCount = vouchers.length;
  const activeCount = vouchers.filter((v) => v.is_active).length;
  const totalUsed = vouchers.reduce((acc, v) => acc + (v.used_count || 0), 0);

  return (
    <AppLayout
      title="Quản Lý Mã Giảm Giá &amp; Voucher"
      subtitle="Tạo và quản lý các chương trình khuyến mãi, voucher phần trăm và trợ giá vận chuyển"
      headerRight={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchVouchers}
            className="gap-2 border-emerald-500/30 text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            Làm mới
          </Button>
          <Button
            size="sm"
            onClick={handleOpenCreate}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
          >
            <Plus className="w-4 h-4" />
            Tạo mã mới
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="border-border/60 shadow-sm bg-card">
            <CardHeader className="p-4 pb-2">
              <CardDescription className="text-xs uppercase tracking-wider font-semibold">
                Tổng số mã ưu đãi
              </CardDescription>
              <CardTitle className="text-2xl font-bold flex items-center justify-between">
                <span>{totalCount}</span>
                <Ticket className="w-5 h-5 text-amber-500" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-xs text-muted-foreground">{activeCount} mã đang hoạt động hiệu lực</p>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm bg-card">
            <CardHeader className="p-4 pb-2">
              <CardDescription className="text-xs uppercase tracking-wider font-semibold">
                Lượt khách đã áp dụng
              </CardDescription>
              <CardTitle className="text-2xl font-bold flex items-center justify-between text-emerald-600">
                <span>{totalUsed} lượt</span>
                <Users className="w-5 h-5 text-emerald-600" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-xs text-muted-foreground">Áp dụng thành công vào giỏ hàng và thanh toán</p>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm bg-card">
            <CardHeader className="p-4 pb-2">
              <CardDescription className="text-xs uppercase tracking-wider font-semibold">
                Hình thức khuyến mãi
              </CardDescription>
              <CardTitle className="text-2xl font-bold flex items-center justify-between text-indigo-600">
                <span>Trợ giá &amp; %</span>
                <Percent className="w-5 h-5 text-indigo-600" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-xs text-muted-foreground">Tối đa hóa tỷ lệ chốt đơn của khách hàng</p>
            </CardContent>
          </Card>
        </div>

        {/* Filter Bar */}
        <Card className="border-border/60 shadow-sm p-4">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            <form onSubmit={handleSearch} className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm mã code, chương trình..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-sm font-medium"
              />
            </form>

            <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-lg border border-border/50 text-xs">
              {["all", "active", "inactive"].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                    statusFilter === st
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {st === "all" ? "Tất cả" : st === "active" ? "Đang hiệu lực" : "Tạm ngưng"}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Vouchers Grid / Table */}
        {isLoading ? (
          <div className="py-20 text-center text-muted-foreground flex flex-col items-center gap-2">
            <RefreshCw className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm">Đang tải danh sách voucher...</p>
          </div>
        ) : vouchers.length === 0 ? (
          <div className="py-20 text-center border border-dashed rounded-xl bg-card/50">
            <Ticket className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
            <h3 className="text-base font-semibold">Chưa có mã ưu đãi nào</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Bấm nút "Tạo mã mới" để thêm mã giảm giá đầu tiên cho cửa hàng.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vouchers.map((v) => (
              <Card
                key={v.id}
                className="border border-border/60 hover:shadow-md transition-all relative overflow-hidden flex flex-col justify-between"
              >
                {/* Decorative cutouts for ticket look */}
                <div className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-background border-r border-border" />
                <div className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-background border-l border-border" />

                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-mono font-black text-sm px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 border border-amber-300 dark:border-amber-800 tracking-wider">
                      {v.code}
                    </span>
                    <Badge
                      variant="outline"
                      className={
                        v.is_active
                          ? "bg-emerald-50 text-emerald-700 border-emerald-300 text-[10px]"
                          : "bg-slate-100 text-slate-600 border-slate-300 text-[10px]"
                      }
                    >
                      {v.is_active ? "Hoạt động" : "Tạm khóa"}
                    </Badge>
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-foreground line-clamp-1">
                      {v.title}
                    </h4>
                    {v.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {v.description}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1 pt-2 border-t border-dashed border-border text-xs text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Mức giảm:</span>
                      <b className="text-emerald-600 dark:text-emerald-400 font-extrabold">
                        {v.discount_type === "percentage"
                          ? `Giảm ${v.discount_value}% ${v.max_discount ? `(Tối đa ${new Intl.NumberFormat("vi-VN").format(v.max_discount)}đ)` : ""}`
                          : `Giảm ${new Intl.NumberFormat("vi-VN").format(v.discount_value)}đ`}
                      </b>
                    </div>
                    <div className="flex justify-between">
                      <span>Đơn tối thiểu:</span>
                      <span className="font-semibold text-foreground">
                        {new Intl.NumberFormat("vi-VN").format(v.min_order_amount)}đ
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Đã dùng:</span>
                      <span className="font-semibold text-foreground">
                        {v.used_count} {v.usage_limit ? `/ ${v.usage_limit}` : "lượt"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEdit(v)}
                      className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Sửa
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteVoucher(v.id, v.code)}
                      className="h-8 px-2 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Xóa
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create / Edit Voucher Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md bg-card rounded-2xl p-6 border-border text-card-foreground">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-lg font-black flex items-center gap-2">
              <Ticket className="w-5 h-5 text-amber-500" />
              <span>{editingVoucher ? "Chỉnh Sửa Mã Ưu Đãi" : "Tạo Mã Ưu Đãi Mới"}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Nhập thông tin chương trình voucher để kích hoạt cho khách mua hàng
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveVoucher} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">
                Mã Code (Chữ in hoa) <span className="text-rose-500">*</span>
              </Label>
              <Input
                placeholder="Ví dụ: SALE50K, FREESHIP..."
                value={formCode}
                onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                className="font-mono uppercase font-bold text-sm tracking-wider"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold">
                Tiêu đề chương trình <span className="text-rose-500">*</span>
              </Label>
              <Input
                placeholder="Ví dụ: Giảm 50K cho đơn từ 300K"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Mô tả chi tiết</Label>
              <Input
                placeholder="Áp dụng cho mọi phụ kiện &amp; thiết bị"
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Loại giảm giá</Label>
                <select
                  value={formType}
                  onChange={(e: any) => setFormType(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-xs font-semibold focus:outline-none"
                >
                  <option value="fixed">Số tiền cố định (VNĐ)</option>
                  <option value="percentage">Phần trăm (%)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold">
                  {formType === "percentage" ? "Mức giảm (%)" : "Mức giảm (VNĐ)"}
                </Label>
                <Input
                  type="number"
                  value={formValue}
                  onChange={(e) => setFormValue(e.target.value)}
                  placeholder={formType === "percentage" ? "10" : "50000"}
                  required
                />
              </div>
            </div>

            {formType === "percentage" && (
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Giảm tối đa (VNĐ)</Label>
                <Input
                  type="number"
                  value={formMaxDiscount}
                  onChange={(e) => setFormMaxDiscount(e.target.value)}
                  placeholder="200000 (Để trống nếu không giới hạn)"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Đơn hàng tối thiểu (VNĐ)</Label>
                <Input
                  type="number"
                  value={formMinOrder}
                  onChange={(e) => setFormMinOrder(e.target.value)}
                  placeholder="300000"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Giới hạn số lượt dùng</Label>
                <Input
                  type="number"
                  value={formLimit}
                  onChange={(e) => setFormLimit(e.target.value)}
                  placeholder="1000 (Để trống nếu vô hạn)"
                />
              </div>
            </div>

            <DialogFooter className="pt-3 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="font-bold rounded-xl"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
              >
                {isSaving ? "Đang lưu..." : editingVoucher ? "Cập Nhật" : "Tạo Mới"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

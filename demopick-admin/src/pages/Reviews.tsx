import React, { useState, useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  Search,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ThumbsUp,
  Image as ImageIcon,
  RefreshCw,
  Filter,
  MessageSquare,
  ShieldCheck,
  X,
} from "lucide-react";
import { toast } from "sonner";
import api, { ApiResponse } from "@/lib/api";

interface ProductReviewItem {
  id: number;
  product_id: number;
  user_id: number;
  order_id?: number | null;
  user_name: string;
  user_avatar?: string | null;
  rating: number;
  comment: string;
  images?: string[] | null;
  variant_purchased?: string | null;
  is_verified_purchase: boolean;
  likes: number;
  status: "approved" | "pending" | "hidden";
  created_at: string;
  product?: {
    id: number;
    name: string;
    images?: string[];
  };
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<ProductReviewItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [ratingFilter, setRatingFilter] = useState<number | "all">("all");
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const res = await api.get<ApiResponse<any>>("/admin/reviews", {
        params: {
          status: statusFilter,
          rating: ratingFilter === "all" ? undefined : ratingFilter,
          search: searchQuery.trim() || undefined,
        },
      });

      const data = res.data?.data;
      if (data && Array.isArray(data.data)) {
        setReviews(data.data);
      } else if (Array.isArray(data)) {
        setReviews(data);
      }
    } catch (err: any) {
      console.error("Error fetching reviews:", err);
      toast.error("Không thể tải danh sách đánh giá từ máy chủ.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [statusFilter, ratingFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchReviews();
  };

  const handleUpdateStatus = async (id: number, newStatus: "approved" | "hidden") => {
    try {
      await api.put(`/admin/reviews/${id}/status`, { status: newStatus });
      toast.success(
        newStatus === "approved"
          ? "Đã duyệt và hiển thị đánh giá trên trang sản phẩm!"
          : "Đã ẩn đánh giá khỏi giao diện khách hàng!"
      );
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
      );
    } catch (err: any) {
      toast.error("Lỗi khi cập nhật trạng thái đánh giá.");
    }
  };

  // Metrics
  const totalCount = reviews.length;
  const approvedCount = reviews.filter((r) => r.status === "approved").length;
  const hiddenCount = reviews.filter((r) => r.status === "hidden").length;
  const avgRating = totalCount > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalCount).toFixed(1)
    : "5.0";
  const fiveStarCount = reviews.filter((r) => r.rating === 5).length;

  return (
    <AppLayout
      title="Quản Lý Đánh Giá & Bình Luận"
      subtitle="Theo dõi trải nghiệm khách hàng, kiểm duyệt hình ảnh và phản hồi đánh giá sản phẩm"
      headerRight={
        <Button
          variant="outline"
          size="sm"
          onClick={fetchReviews}
          className="gap-2 border-emerald-500/30 text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          Làm mới
        </Button>
      }
    >
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-border/60 shadow-sm bg-card">
            <CardHeader className="p-4 pb-2">
              <CardDescription className="text-xs uppercase tracking-wider font-semibold">
                Tổng đánh giá
              </CardDescription>
              <CardTitle className="text-2xl font-bold flex items-center justify-between">
                <span>{totalCount}</span>
                <MessageSquare className="w-5 h-5 text-muted-foreground" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-xs text-muted-foreground">Lưu trữ trên cơ sở dữ liệu MySQL</p>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm bg-card">
            <CardHeader className="p-4 pb-2">
              <CardDescription className="text-xs uppercase tracking-wider font-semibold">
                Điểm đánh giá TB
              </CardDescription>
              <CardTitle className="text-2xl font-bold flex items-center justify-between text-amber-500">
                <span>{avgRating} ★</span>
                <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-xs text-muted-foreground">{fiveStarCount} đánh giá 5 sao tuyệt đối</p>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm bg-card">
            <CardHeader className="p-4 pb-2">
              <CardDescription className="text-xs uppercase tracking-wider font-semibold">
                Đang hiển thị
              </CardDescription>
              <CardTitle className="text-2xl font-bold flex items-center justify-between text-emerald-600">
                <span>{approvedCount}</span>
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-xs text-muted-foreground">Công khai trên trang chi tiết sản phẩm</p>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm bg-card">
            <CardHeader className="p-4 pb-2">
              <CardDescription className="text-xs uppercase tracking-wider font-semibold">
                Đã ẩn / Vi phạm
              </CardDescription>
              <CardTitle className="text-2xl font-bold flex items-center justify-between text-rose-500">
                <span>{hiddenCount}</span>
                <AlertCircle className="w-5 h-5 text-rose-500" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-xs text-muted-foreground">Bị ẩn khỏi trang thương mại điện tử</p>
            </CardContent>
          </Card>
        </div>

        {/* Filter Bar */}
        <Card className="border-border/60 shadow-sm p-4">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            {/* Search */}
            <form onSubmit={handleSearch} className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm người gửi, nội dung..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-sm"
              />
            </form>

            {/* Status & Rating Filters */}
            <div className="flex flex-wrap gap-2 w-full md:w-auto items-center justify-end">
              <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-lg border border-border/50 text-xs">
                {["all", "approved", "hidden"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                      statusFilter === st
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {st === "all" ? "Tất cả" : st === "approved" ? "Đang hiển thị" : "Đã ẩn"}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-lg border border-border/50 text-xs">
                {(["all", 5, 4, 3, 2, 1] as const).map((star) => (
                  <button
                    key={star}
                    onClick={() => setRatingFilter(star)}
                    className={`px-2 py-1.5 rounded-md font-medium transition-all flex items-center gap-1 ${
                      ratingFilter === star
                        ? "bg-amber-500 text-white shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {star === "all" ? (
                      "Tất cả sao"
                    ) : (
                      <>
                        <span>{star}</span>
                        <Star className="w-3 h-3 fill-current" />
                      </>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Reviews List */}
        {isLoading ? (
          <div className="py-20 text-center text-muted-foreground flex flex-col items-center gap-2">
            <RefreshCw className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm">Đang tải danh sách đánh giá...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="py-20 text-center border border-dashed rounded-xl bg-card/50">
            <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
            <h3 className="text-base font-semibold">Chưa có đánh giá nào phù hợp</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Thử thay đổi bộ lọc tìm kiếm hoặc trạng thái kiểm duyệt
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {reviews.map((rev) => (
              <Card
                key={rev.id}
                className={`border transition-all ${
                  rev.status === "hidden"
                    ? "border-rose-300 dark:border-rose-900/50 bg-rose-50/20 dark:bg-rose-950/10 opacity-75"
                    : "border-border/60 hover:shadow-md"
                }`}
              >
                <CardContent className="p-5">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    {/* Left: User & Content */}
                    <div className="flex items-start gap-3.5 flex-1">
                      {/* Avatar */}
                      <div className="relative">
                        <img
                          src={rev.user_avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"}
                          alt={rev.user_name}
                          className="w-11 h-11 rounded-full object-cover border border-border"
                        />
                        {rev.is_verified_purchase && (
                          <div
                            className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5"
                            title="Đã mua hàng chính hãng"
                          >
                            <ShieldCheck className="w-3 h-3" />
                          </div>
                        )}
                      </div>

                      {/* Info & Comment */}
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-sm text-foreground">
                            {rev.user_name || "Khách hàng"}
                          </span>
                          {rev.is_verified_purchase && (
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] px-1.5 py-0">
                              Đã mua hàng
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            • {new Date(rev.created_at).toLocaleDateString("vi-VN")}
                          </span>
                          {rev.variant_purchased && (
                            <span className="text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground">
                              Phân loại: {rev.variant_purchased}
                            </span>
                          )}
                        </div>

                        {/* Stars */}
                        <div className="flex items-center gap-1 text-amber-500">
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <Star
                              key={idx}
                              className={`w-4 h-4 ${
                                idx < rev.rating ? "fill-amber-500 text-amber-500" : "text-muted-foreground/30"
                              }`}
                            />
                          ))}
                          <span className="text-xs font-bold text-foreground ml-1.5">
                            {rev.rating}.0
                          </span>
                        </div>

                        {/* Product Attached */}
                        {rev.product && (
                          <div className="text-xs text-muted-foreground font-medium flex items-center gap-1.5 pt-0.5">
                            <span>Sản phẩm:</span>
                            <span className="text-primary font-semibold hover:underline cursor-pointer">
                              {rev.product.name}
                            </span>
                          </div>
                        )}

                        {/* Comment Text */}
                        <p className="text-sm text-foreground/90 leading-relaxed pt-1">
                          {rev.comment}
                        </p>

                        {/* Attached Photos */}
                        {Array.isArray(rev.images) && rev.images.length > 0 && (
                          <div className="flex items-center gap-2 pt-2">
                            {rev.images.map((imgUrl, i) => (
                              <div
                                key={i}
                                onClick={() => setPreviewImage(imgUrl)}
                                className="w-16 h-16 rounded-lg overflow-hidden border border-border cursor-pointer hover:opacity-85 transition-opacity relative group"
                              >
                                <img
                                  src={imgUrl}
                                  alt={`Attached ${i}`}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                  <Eye className="w-4 h-4 text-white" />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Likes Count */}
                        <div className="flex items-center gap-1 text-xs text-muted-foreground pt-1">
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span>{rev.likes} lượt thích hữu ích</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center lg:flex-col lg:items-end gap-2 pt-3 lg:pt-0 border-t lg:border-t-0 border-border/40">
                      <Badge
                        variant="outline"
                        className={
                          rev.status === "approved"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                            : rev.status === "hidden"
                            ? "bg-rose-50 text-rose-700 border-rose-300"
                            : "bg-amber-50 text-amber-700 border-amber-300"
                        }
                      >
                        {rev.status === "approved"
                          ? "✓ Đang hiển thị"
                          : rev.status === "hidden"
                          ? "✕ Đã ẩn vi phạm"
                          : "⏳ Chờ duyệt"}
                      </Badge>

                      {rev.status === "approved" ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUpdateStatus(rev.id, "hidden")}
                          className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 text-xs h-8 gap-1.5"
                        >
                          <EyeOff className="w-3.5 h-3.5" />
                          Ẩn vi phạm
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUpdateStatus(rev.id, "approved")}
                          className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 text-xs h-8 gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Duyệt hiển thị
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Image Preview Lightbox Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-2xl max-h-[85vh] bg-background rounded-xl overflow-hidden shadow-2xl">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <img
              src={previewImage}
              alt="Ảnh đính kèm khách hàng"
              className="w-full h-auto max-h-[80vh] object-contain"
            />
          </div>
        </div>
      )}
    </AppLayout>
  );
}

import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  FileText,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  Clock,
  Sparkles,
  ExternalLink,
  BookOpen,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";

export interface AdminBlogPost {
  id: number;
  title: string;
  slug: string;
  category: "Kinh doanh sân" | "Phần mềm" | "Kỹ thuật chơi" | "Xu hướng";
  image: string;
  date: string;
  views: number;
  status: "published" | "draft";
  excerpt: string;
  content: string;
}

const initialPosts: AdminBlogPost[] = [
  {
    id: 1,
    title: "TOP 5 Phần Mềm Quản Lý Sân Pickleball Tốt Nhất 2026 - So Sánh Chi Tiết",
    slug: "top-5-phan-mem-quan-ly-san-pickleball-2026",
    category: "Phần mềm",
    image: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=600",
    date: "15/12/2025",
    views: 1420,
    status: "published",
    excerpt: "So sánh top 5 phần mềm quản lý sân Pickleball phổ biến tại Việt Nam năm 2026. Đánh giá ưu nhược điểm, giá cả, tính năng chống trùng lịch.",
    content: "Năm 2026, thị trường phần mềm quản lý sân Pickleball tại Việt Nam phát triển bùng nổ...",
  },
  {
    id: 2,
    title: "Hướng Dẫn Mở Sân Pickleball Từ A đến Z: Chi Phí, Vốn, Doanh Thu 2026",
    slug: "huong-dan-mo-san-pickleball-tu-a-den-z",
    category: "Kinh doanh sân",
    image: "/images/pickleball_match.jpg",
    date: "12/12/2025",
    views: 980,
    status: "published",
    excerpt: "Hướng dẫn chi tiết mở sân Pickleball: từ chọn mặt bằng thảm, chi phí đầu tư thảm USAPA, dự toán doanh thu đến phần mềm quản lý tự động.",
    content: "Mở sân Pickleball là cơ hội đầu tư hấp dẫn năm 2026...",
  },
  {
    id: 3,
    title: "10 Cách Quản Lý Sân Pickleball Hiệu Quả - Tăng Doanh Thu 40% Trong 3 Tháng",
    slug: "10-cach-quan-ly-san-pickleball-hieu-qua",
    category: "Kinh doanh sân",
    image: "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=600",
    date: "10/12/2025",
    views: 750,
    status: "published",
    excerpt: "10 phương pháp đã chứng minh giúp chủ sân Pickleball tăng doanh thu 40% trong 3 tháng. Bao gồm tự động hóa đặt sân, POS quầy & quản lý khách VIP.",
    content: "Tối ưu hóa doanh thu ca sân đòi hỏi ứng dụng công nghệ...",
  },
  {
    id: 4,
    title: "Xu Hướng Sân Pickleball Việt Nam 2026: Cơ Hội Vàng Cho Chủ Đầu Tư",
    slug: "xu-huong-san-pickleball-viet-nam-2026",
    category: "Xu hướng",
    image: "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=600",
    date: "08/12/2025",
    views: 610,
    status: "published",
    excerpt: "Phân tích xu hướng Pickleball bùng nổ tại Việt Nam 2026. Số liệu thị trường, cơ hội đầu tư, dự báo và lời khuyên cho chủ sân.",
    content: "Thị trường Pickleball Việt Nam chứng kiến mức tăng trưởng 300%...",
  },
  {
    id: 5,
    title: "Giá Phần Mềm Quản Lý Sân DemoPick ONE 2026: Bảng Giá Chi Tiết Các Gói",
    slug: "gia-phan-mem-quan-ly-san-demopick-2026",
    category: "Phần mềm",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600",
    date: "07/01/2026",
    views: 1100,
    status: "published",
    excerpt: "Bảng giá phần mềm quản lý sân thể thao DemoPick ONE 2026 đầy đủ các gói từ miễn phí đến Enterprise. So sánh tính năng, ROI, chính sách hoàn tiền.",
    content: "Bảng giá gói đăng ký DemoPick ONE minh bạch...",
  },
  {
    id: 6,
    title: "Bản Nháp: Kỹ Thuật Đánh Dinking Chuẩn Thi Đấu USAPA",
    slug: "ky-thuat-danh-dinking-chuan-usapa",
    category: "Kỹ thuật chơi",
    image: "https://images.unsplash.com/photo-1511067007398-7e4b90aab4bc?w=600",
    date: "09/02/2026",
    views: 0,
    status: "draft",
    excerpt: "Kỹ thuật Dinking nâng cao giúp kiểm soát vùng bếp (Kitchen line) hiệu quả cho vận động viên Pickleball phong trào.",
    content: "Dinking là kỹ thuật sống còn trong thi đấu Pickleball...",
  },
];

export default function Posts() {
  const [posts, setPosts] = useState<AdminBlogPost[]>(initialPosts);
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("Tất cả");
  const [selectedStatus, setSelectedStatus] = useState("Tất cả");

  // Modal states
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<AdminBlogPost | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewPost, setPreviewPost] = useState<AdminBlogPost | null>(null);

  // Form input states
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState<AdminBlogPost["category"]>("Phần mềm");
  const [formImage, setFormImage] = useState("");
  const [formExcerpt, setFormExcerpt] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formStatus, setFormStatus] = useState<"published" | "draft">("published");

  const filteredPosts = posts.filter((p) => {
    const matchSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.excerpt.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCat === "Tất cả" || p.category === selectedCat;
    const matchStatus =
      selectedStatus === "Tất cả" ||
      (selectedStatus === "published" && p.status === "published") ||
      (selectedStatus === "draft" && p.status === "draft");
    return matchSearch && matchCat && matchStatus;
  });

  const handleOpenAdd = () => {
    setEditingPost(null);
    setFormTitle("");
    setFormCategory("Phần mềm");
    setFormImage("https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=600");
    setFormExcerpt("");
    setFormContent("");
    setFormStatus("published");
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (post: AdminBlogPost) => {
    setEditingPost(post);
    setFormTitle(post.title);
    setFormCategory(post.category);
    setFormImage(post.image);
    setFormExcerpt(post.excerpt);
    setFormContent(post.content);
    setFormStatus(post.status);
    setIsEditorOpen(true);
  };

  const handleSavePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle) {
      toast.error("Vui lòng nhập tiêu đề bài viết.");
      return;
    }

    const slug = formTitle
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");

    if (editingPost) {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === editingPost.id
            ? {
                ...p,
                title: formTitle,
                slug,
                category: formCategory,
                image: formImage,
                excerpt: formExcerpt,
                content: formContent,
                status: formStatus,
              }
            : p
        )
      );
      toast.success("Đã cập nhật bài viết thành công!");
    } else {
      const newPost: AdminBlogPost = {
        id: Date.now(),
        title: formTitle,
        slug,
        category: formCategory,
        image: formImage || "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=600",
        date: new Date().toLocaleDateString("vi-VN"),
        views: 0,
        status: formStatus,
        excerpt: formExcerpt,
        content: formContent,
      };
      setPosts((prev) => [newPost, ...prev]);
      toast.success("Đã đăng bài viết mới thành công!");
    }
    setIsEditorOpen(false);
  };

  const handleDeletePost = (id: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa bài viết này không?")) {
      setPosts((prev) => prev.filter((p) => p.id !== id));
      toast.success("Đã xóa bài viết.");
    }
  };

  const handleToggleStatus = (id: number) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const nextStatus = p.status === "published" ? "draft" : "published";
          toast.info(
            `Đã chuyển trạng thái bài viết sang "${nextStatus === "published" ? "Xuất bản" : "Bản nháp"}"`
          );
          return { ...p, status: nextStatus };
        }
        return p;
      })
    );
  };

  return (
    <AppLayout
      title="Quản Lý Bài Viết & Blog CMS"
      subtitle="Đăng bài viết mới, chỉnh sửa nội dung và quản lý bài xuất bản hiển thị phía khách hàng"
      headerRight={
        <Button onClick={handleOpenAdd} className="gap-2 bg-emerald-600 hover:bg-emerald-500 font-bold">
          <Plus className="h-4 w-4" />
          <span>Thêm Bài Viết Mới</span>
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Statistics Widgets */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4 bg-white border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase">Tổng Bài Viết</p>
              <p className="text-2xl font-black text-slate-900">{posts.length}</p>
            </div>
          </Card>

          <Card className="p-4 bg-white border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase">Đã Xuất Bản</p>
              <p className="text-2xl font-black text-emerald-600">
                {posts.filter((p) => p.status === "published").length}
              </p>
            </div>
          </Card>

          <Card className="p-4 bg-white border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase">Bản Nháp / Ẩn</p>
              <p className="text-2xl font-black text-amber-600">
                {posts.filter((p) => p.status === "draft").length}
              </p>
            </div>
          </Card>
        </div>

        {/* Filter & Table Container */}
        <Card className="p-5 bg-white border-slate-200 shadow-sm space-y-4">
          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Tìm tiêu đề bài viết..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-10 text-xs border-slate-200"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                {["Tất cả", "Phần mềm", "Kinh doanh sân", "Xu hướng", "Kỹ thuật chơi"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCat(cat)}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${
                      selectedCat === cat
                        ? "bg-white text-emerald-700 shadow-sm font-bold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Posts Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase">
                  <th className="py-3 px-4">Bài viết</th>
                  <th className="py-3 px-4">Chuyên mục</th>
                  <th className="py-3 px-4">Ngày đăng</th>
                  <th className="py-3 px-4">Lượt xem</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Thumbnail & Title */}
                    <td className="py-3 px-4 max-w-md">
                      <div className="flex items-center gap-3">
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-14 h-10 rounded-lg object-cover bg-slate-100 shrink-0 border border-slate-200"
                        />
                        <div className="space-y-0.5">
                          <div className="font-bold text-slate-900 line-clamp-1 text-xs">
                            {post.title}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            slug: /{post.slug}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-300 font-semibold">
                        {post.category}
                      </Badge>
                    </td>

                    {/* Date */}
                    <td className="py-3 px-4 text-slate-600 font-mono">
                      {post.date}
                    </td>

                    {/* Views */}
                    <td className="py-3 px-4 font-mono font-bold text-slate-700">
                      👁️ {post.views}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <button onClick={() => handleToggleStatus(post.id)}>
                        {post.status === "published" ? (
                          <Badge className="bg-emerald-600 text-white font-bold cursor-pointer hover:bg-emerald-700">
                            ✓ Xuất bản
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-amber-100 text-amber-800 font-bold cursor-pointer hover:bg-amber-200">
                            ⏳ Bản nháp
                          </Badge>
                        )}
                      </button>
                    </td>

                    {/* Action Buttons */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setPreviewPost(post);
                            setIsPreviewOpen(true);
                          }}
                          className="h-8 w-8 p-0 text-slate-600 hover:text-emerald-600"
                          title="Xem trước bài viết"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleOpenEdit(post)}
                          className="h-8 w-8 p-0 text-slate-600 hover:text-blue-600"
                          title="Chỉnh sửa bài viết"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeletePost(post.id)}
                          className="h-8 w-8 p-0 text-slate-600 hover:text-red-600"
                          title="Xóa bài viết"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Modal Add/Edit Post */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="max-w-2xl bg-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-emerald-600" />
              <span>{editingPost ? "Chỉnh Sửa Bài Viết" : "Soạn Bài Viết Mới"}</span>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSavePost} className="space-y-4 text-xs pt-2">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Tiêu đề bài viết *
              </label>
              <Input
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="VD: Hướng Dẫn Mở Sân Pickleball Tối Ưu Chi Phí 2026..."
                className="text-xs font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Chuyên mục *
                </label>
                <select
                  value={formCategory}
                  onChange={(e: any) => setFormCategory(e.target.value)}
                  className="w-full h-10 px-3 border border-slate-200 rounded-lg text-xs font-semibold bg-white"
                >
                  <option value="Phần mềm">Phần mềm</option>
                  <option value="Kinh doanh sân">Kinh doanh sân</option>
                  <option value="Xu hướng">Xu hướng</option>
                  <option value="Kỹ thuật chơi">Kỹ thuật chơi</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Trạng thái đăng
                </label>
                <select
                  value={formStatus}
                  onChange={(e: any) => setFormStatus(e.target.value)}
                  className="w-full h-10 px-3 border border-slate-200 rounded-lg text-xs font-semibold bg-white"
                >
                  <option value="published">✓ Xuất bản ngay</option>
                  <option value="draft">⏳ Lưu bản nháp</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                URL Ảnh đại diện (Thumbnail Image)
              </label>
              <div className="flex items-center gap-2">
                <Input
                  value={formImage}
                  onChange={(e) => setFormImage(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="text-xs"
                />
                {formImage && (
                  <img
                    src={formImage}
                    alt="Preview"
                    className="w-10 h-10 rounded object-cover border shrink-0"
                  />
                )}
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Đoạn tóm tắt (Excerpt)
              </label>
              <textarea
                value={formExcerpt}
                onChange={(e) => setFormExcerpt(e.target.value)}
                rows={2}
                placeholder="Tóm tắt ngắn 2-3 câu nội dung chính của bài viết..."
                className="w-full p-2.5 border border-slate-200 rounded-lg text-xs font-normal"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Nội dung chi tiết bài viết (Content)
              </label>
              <textarea
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                rows={7}
                placeholder="Nhập nội dung bài viết chi tiết..."
                className="w-full p-2.5 border border-slate-200 rounded-lg text-xs font-normal font-mono"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditorOpen(false)}
                className="font-semibold"
              >
                Hủy
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-500 font-bold text-white">
                {editingPost ? "Cập Nhật Bài Viết" : "Xuất Bản Bài Viết"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Preview Post */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-3xl bg-white max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Eye className="h-5 w-5 text-emerald-600" />
              <span>Xem Trước Bài Viết Phía Khách Hàng</span>
            </DialogTitle>
          </DialogHeader>

          {previewPost && (
            <div className="space-y-4 pt-2">
              <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100">
                <img src={previewPost.image} alt={previewPost.title} className="w-full h-full object-cover" />
                <Badge className="absolute top-3 left-3 bg-emerald-600 font-bold">{previewPost.category}</Badge>
              </div>

              <h2 className="text-xl font-bold text-slate-900">{previewPost.title}</h2>
              <div className="text-xs text-slate-500 font-medium">Đăng ngày: {previewPost.date} | Lượt xem: {previewPost.views}</div>
              
              <div className="p-4 bg-emerald-50 border-l-4 border-emerald-600 rounded-r-xl text-xs text-emerald-900 font-medium">
                {previewPost.excerpt}
              </div>

              <p className="text-xs leading-relaxed text-slate-700 whitespace-pre-line">{previewPost.content}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

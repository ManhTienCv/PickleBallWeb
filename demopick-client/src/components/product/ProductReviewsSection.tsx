import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Star,
  MessageSquarePlus,
  Camera,
  Plus,
  X,
  ThumbsUp,
  Image as ImageIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import { shopService, ProductReview } from '@/services/shop.service'
import { authHelpers } from '@/stores/useAuthStore'
import { useAuthModalStore } from '@/stores/useAuthModalStore'

interface ProductReviewsSectionProps {
  productId: number
  productName: string
  variantLabel: string
  reviews: ProductReview[]
  onReviewsChange: React.Dispatch<React.SetStateAction<ProductReview[]>>
}

export const ProductReviewsSection: React.FC<ProductReviewsSectionProps> = ({
  productId,
  productName,
  variantLabel,
  reviews,
  onReviewsChange,
}) => {
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [selectedStarFilter, setSelectedStarFilter] = useState<number | 'all' | 'with_image'>('all')
  const [newRating, setNewRating] = useState(5)
  const [newHoverRating, setNewHoverRating] = useState(0)
  const [newAuthor, setNewAuthor] = useState('')
  const [newComment, setNewComment] = useState('')
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Handle Photo Upload
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    if (uploadedImages.length + files.length > 3) {
      toast.error('Bạn chỉ có thể đính kèm tối đa 3 hình ảnh')
      return
    }

    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadedImages((prev) => [...prev, event.target!.result as string])
        }
      }
      reader.readAsDataURL(file)
    })

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRemoveUploadedImage = (indexToRemove: number) => {
    setUploadedImages(uploadedImages.filter((_, idx) => idx !== indexToRemove))
  }

  // Handle submit review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!authHelpers.isAuthenticated()) {
      toast.info('Vui lòng đăng nhập để gửi nhận xét đánh giá.')
      useAuthModalStore.getState().openLogin()
      return
    }
    if (!newAuthor.trim()) {
      toast.error('Vui lòng nhập họ và tên của bạn')
      return
    }
    if (!newComment.trim()) {
      toast.error('Vui lòng viết nhận xét cảm nhận của bạn')
      return
    }

    setIsSubmittingReview(true)
    try {
      const newRev = await shopService.addReview(productId, {
        productId,
        userName: newAuthor.trim(),
        rating: newRating,
        comment: newComment.trim(),
        variantPurchased: variantLabel,
        isVerifiedPurchase: true,
        images: uploadedImages.length > 0 ? uploadedImages : undefined,
      })

      onReviewsChange((prev) => [newRev, ...prev.filter((r) => r.id !== newRev.id)])
      setNewComment('')
      setUploadedImages([])
      setShowReviewForm(false)
      toast.success('Cảm ơn bạn đã gửi đánh giá kèm hình ảnh thực tế!')
    } catch {
      toast.error('Gửi đánh giá không thành công, vui lòng thử lại.')
    } finally {
      setIsSubmittingReview(false)
    }
  }

  const handleLikeReview = (reviewId: string) => {
    if (!authHelpers.isAuthenticated()) {
      toast.info('Vui lòng đăng nhập để thích đánh giá.')
      useAuthModalStore.getState().openLogin()
      return
    }
    shopService.likeReview(productId, reviewId)
    onReviewsChange((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, likes: r.likes + 1 } : r))
    )
  }

  const totalReviews = reviews.length
  const avgScore = totalReviews
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
    : '5.0'

  const starCounts = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => r.rating === star).length
    const percentage = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0
    return { star, count, percentage }
  })

  const filteredReviews = reviews.filter((r) => {
    if (selectedStarFilter === 'all') return true
    if (selectedStarFilter === 'with_image') return r.images && r.images.length > 0
    return r.rating === selectedStarFilter
  })

  return (
    <div className="space-y-8 font-sans">
      {/* Score Breakdown Summary Box */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-border items-center">
        <div className="md:col-span-4 text-center md:border-r border-slate-200 dark:border-border pr-0 md:pr-6 space-y-1">
          <div className="text-4xl font-extrabold text-slate-900 dark:text-slate-100">{avgScore}</div>
          <div className="flex justify-center text-amber-400 my-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className="w-5 h-5 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
            Dựa trên {totalReviews} lượt đánh giá thực tế
          </p>
        </div>

        <div className="md:col-span-5 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
          {starCounts.map(({ star, percentage }) => (
            <div key={star} className="flex items-center gap-2">
              <span className="w-12 text-right font-bold text-slate-700 dark:text-slate-200">{star} sao</span>
              <div className="flex-1 h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="w-9 text-right font-mono text-[11px] text-slate-600 dark:text-slate-300 font-bold">
                {percentage}%
              </span>
            </div>
          ))}
        </div>

        <div className="md:col-span-3 flex justify-center">
          <Button
            onClick={() => {
              if (!authHelpers.isAuthenticated()) {
                toast.info('Vui lòng đăng nhập để gửi nhận xét đánh giá.')
                useAuthModalStore.getState().openLogin()
                return
              }
              setShowReviewForm(!showReviewForm)
            }}
            className="w-full h-10 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl gap-2 shadow-sm"
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>{showReviewForm ? 'Đóng Form Đánh Giá' : 'Viết Đánh Giá Của Bạn'}</span>
          </Button>
        </div>
      </div>

      {/* Bộ Lọc Theo Số Sao (5, 4, 3, 2, 1 Sao & Có Hình Ảnh) */}
      <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-border">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-200 mr-1">Lọc theo:</span>
        <button
          onClick={() => setSelectedStarFilter('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors duration-150 cursor-pointer ${
            selectedStarFilter === 'all'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
        >
          Tất cả ({totalReviews})
        </button>
        {[5, 4, 3, 2, 1].map((star) => {
          const cnt = reviews.filter((r) => r.rating === star).length
          return (
            <button
              key={star}
              onClick={() => setSelectedStarFilter(star)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors duration-150 flex items-center gap-1 cursor-pointer ${
                selectedStarFilter === star
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <span>{star}</span>
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>({cnt})</span>
            </button>
          )
        })}
        <button
          onClick={() => setSelectedStarFilter('with_image')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors duration-150 flex items-center gap-1.5 cursor-pointer ${
            selectedStarFilter === 'with_image'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          <span>Có hình ảnh ({reviews.filter((r) => r.images && r.images.length > 0).length})</span>
        </button>
      </div>

      {/* Form Viết Đánh Giá Mới (Kèm Tải Ảnh Thực Tế) */}
      {showReviewForm && (
        <form
          onSubmit={handleSubmitReview}
          className="p-6 bg-white dark:bg-card border border-emerald-200 dark:border-emerald-800 rounded-2xl shadow-sm space-y-4 animate-in fade-in duration-300"
        >
          <div className="border-b border-slate-200 dark:border-border pb-3">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
              Gửi nhận xét về sản phẩm: {productName}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Đánh giá của bạn sẽ giúp cộng đồng người chơi Pickleball lựa chọn đúng thiết bị phù hợp
            </p>
          </div>

          {/* Interactive Star Picker */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Mức độ hài lòng của bạn:
            </label>
            <div className="flex items-center gap-1 text-amber-400 cursor-pointer pt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onMouseEnter={() => setNewHoverRating(star)}
                  onMouseLeave={() => setNewHoverRating(0)}
                  onClick={() => setNewRating(star)}
                  className="p-1 hover:scale-110 transition-transform cursor-pointer"
                >
                  <Star
                    className={`w-6 h-6 ${(newHoverRating || newRating) >= star
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-300 dark:text-slate-600'
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs text-slate-700 dark:text-slate-200 font-bold ml-2">
                {newRating === 5
                  ? '⭐ Tuyệt vời (5/5)'
                  : newRating === 4
                    ? '⭐ Rất tốt (4/5)'
                    : newRating === 3
                      ? '⭐ Bình thường (3/5)'
                      : newRating === 2
                        ? '⭐ Tạm được (2/5)'
                        : '⭐ Chưa hài lòng (1/5)'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Họ và tên của bạn:
              </label>
              <Input
                placeholder="Ví dụ: Nguyễn Văn A"
                value={newAuthor}
                onChange={(e) => setNewAuthor(e.target.value)}
                className="text-xs h-9 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Phân loại đã mua:
              </label>
              <Input
                value={variantLabel}
                readOnly
                className="text-xs h-9 bg-slate-50 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 rounded-xl border-slate-200 dark:border-slate-700 font-medium"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Nội dung nhận xét & trải nghiệm thực tế:
            </label>
            <Textarea
              placeholder="Chia sẻ cảm giác cầm vợt, độ nảy bóng, độ xoáy, đóng gói giao hàng..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
              className="text-xs rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium"
              required
            />
          </div>

          {/* 📸 TÍNH NĂNG TẢI ẢNH THỰC TẾ (UNBOXING / SÂN ĐẤU) */}
          <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-border">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Đính kèm hình ảnh thực tế / đập hộp (Tối đa 3 ảnh):</span>
              </label>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                {uploadedImages.length}/3 ảnh
              </span>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageFileChange}
              accept="image/*"
              multiple
              className="hidden"
            />

            <div className="flex flex-wrap items-center gap-3">
              {uploadedImages.map((imgSrc, idx) => (
                <div
                  key={idx}
                  className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 dark:border-border group"
                >
                  <img
                    src={imgSrc}
                    alt={`Review upload ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveUploadedImage(idx)}
                    className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-0.5 hover:bg-red-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}

              {uploadedImages.length < 3 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-600 bg-slate-50 dark:bg-slate-900 hover:bg-emerald-50/50 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-400 transition-all text-[10px] font-bold gap-1 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm ảnh</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowReviewForm(false)}
              className="text-xs rounded-xl font-bold border-border"
            >
              Hủy Bỏ
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmittingReview}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl"
            >
              Gửi Đánh Giá Ngay
            </Button>
          </div>
        </form>
      )}

      {/* Danh Sách Đánh Giá Thực Tế (Kèm Ảnh Thực Tế) */}
      <div className="space-y-4 divide-y divide-slate-100 dark:divide-border">
        {filteredReviews.length === 0 ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-xs bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 font-medium">
            Chưa có đánh giá nào phù hợp với bộ lọc đã chọn.
          </div>
        ) : (
          filteredReviews.map((rev) => (
            <div key={rev.id} className="pt-4 first:pt-0 space-y-2.5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-xs uppercase shrink-0 border border-emerald-200 dark:border-emerald-800">
                    {rev.userName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                        {rev.userName}
                      </span>
                      {rev.isVerifiedPurchase && (
                        <Badge className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 text-[10px] font-bold px-2 py-0.2">
                          ✓ Đã mua hàng tại DemoPick
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      <div className="flex text-amber-400">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3 h-3 ${s <= rev.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-300 dark:text-slate-600'
                            }`}
                          />
                        ))}
                      </div>
                      <span>•</span>
                      <span>{rev.createdAt}</span>
                      {rev.variantPurchased && (
                        <>
                          <span>•</span>
                          <span className="text-slate-600 dark:text-slate-300 font-semibold">
                            Phân loại: {rev.variantPurchased}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Nút Like / Hữu ích */}
                <button
                  onClick={() => handleLikeReview(rev.id)}
                  className="flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-lg transition-colors font-medium cursor-pointer"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>Hữu ích ({rev.likes})</span>
                </button>
              </div>

              <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-normal pl-12">
                {rev.comment}
              </p>

              {/* Danh Sách Hình Ảnh Thực Tế Khách Đính Kèm */}
              {rev.images && rev.images.length > 0 && (
                <div className="flex items-center gap-2.5 pl-12 pt-1">
                  {rev.images.map((imgUrl, imgIdx) => (
                    <button
                      key={imgIdx}
                      onClick={() => setLightboxImage(imgUrl)}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-slate-200 dark:border-border hover:border-emerald-600 hover:shadow-md transition-all group relative cursor-zoom-in"
                    >
                      <img
                        src={imgUrl}
                        alt="Review attachment"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Lightbox Phóng To Ảnh Đánh Giá */}
      <Dialog open={!!lightboxImage} onOpenChange={() => setLightboxImage(null)}>
        <DialogContent className="max-w-2xl bg-black/95 border-0 p-2 text-white shadow-2xl rounded-3xl overflow-hidden">
          <DialogHeader className="p-2 flex flex-row items-center justify-between border-b border-white/10">
            <DialogTitle className="text-xs text-slate-300 font-medium flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-emerald-400" />
              <span>Hình ảnh thực tế từ khách hàng</span>
            </DialogTitle>
          </DialogHeader>
          {lightboxImage && (
            <div className="flex items-center justify-center p-2 max-h-[75vh] overflow-hidden">
              <img
                src={lightboxImage}
                alt="Enlarged review photo"
                className="max-h-[70vh] w-auto max-w-full rounded-2xl object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

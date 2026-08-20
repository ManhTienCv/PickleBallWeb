import React from 'react'
import { Badge } from '@/components/ui/badge'

interface ProductGalleryProps {
  mainImage: string
  images: string[]
  productName: string
  selectedColorName?: string
  discountPercent?: number
}

export default function ProductGallery({
  mainImage,
  images,
  productName,
  selectedColorName,
  discountPercent,
}: ProductGalleryProps) {
  const [activeImage, setActiveImage] = React.useState(mainImage)

  React.useEffect(() => {
    if (mainImage) {
      setActiveImage(mainImage)
    }
  }, [mainImage])

  return (
    <div className="space-y-4">
      {/* Main Preview Container */}
      <div className="relative aspect-square rounded-3xl overflow-hidden bg-slate-100 border border-slate-200/80 group">
        <img
          src={activeImage}
          alt={productName}
          className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
          {discountPercent && discountPercent > 0 ? (
            <Badge className="bg-rose-600 text-white font-bold text-xs px-3 py-1 shadow-md">
              -{discountPercent}% OFF
            </Badge>
          ) : null}
          {selectedColorName ? (
            <Badge className="bg-slate-900/80 backdrop-blur-md text-white font-semibold text-xs px-3 py-1">
              Màu: {selectedColorName}
            </Badge>
          ) : null}
        </div>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveImage(img)}
              className={`relative flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all ${
                activeImage === img
                  ? 'border-emerald-600 ring-2 ring-emerald-600/30 scale-105'
                  : 'border-slate-200 opacity-70 hover:opacity-100'
              }`}
            >
              <img src={img} alt={`${productName} ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

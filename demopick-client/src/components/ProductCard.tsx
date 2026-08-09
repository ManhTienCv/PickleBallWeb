import React from 'react'
import { Link } from 'react-router-dom'
import { Product } from '@/services/shop.service'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart, Star, ShieldCheck, Sparkles } from 'lucide-react'

interface ProductCardProps {
  product: Product
  onAddToCart?: (product: Product) => void
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const formattedPrice = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(product.price)

  const formattedSalePrice = product.sale_price
    ? new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(product.sale_price)
    : null

  const isRacket = product.name.toLowerCase().includes('vợt')
  const totalStock = product.variants?.reduce((s, v) => s + v.stock_quantity, 0) || 15

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:border-emerald-500/40">
      {/* Product Image & Badges */}
      <Link to={`/products/${product.slug}`} className="aspect-square overflow-hidden bg-slate-100 relative block">
        <img
          src={product.image_url || 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&q=80&w=400'}
          alt={product.name}
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {product.brand && (
            <Badge className="bg-slate-900/90 text-white backdrop-blur-md text-[10px] font-bold px-2 py-0.5 shadow-sm">
              {product.brand.name}
            </Badge>
          )}
          {isRacket && (
            <Badge className="bg-emerald-600/90 text-emerald-100 backdrop-blur-md text-[10px] font-bold px-2 py-0.5 shadow-sm flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-amber-300" /> USAPA Approved
            </Badge>
          )}
        </div>

        {!product.in_stock ? (
          <Badge variant="destructive" className="absolute top-2.5 right-2.5 font-bold text-[10px]">
            Hết Hàng
          </Badge>
        ) : (
          <Badge className="absolute top-2.5 right-2.5 bg-amber-500/90 text-white font-bold text-[10px]">
            Bán Chạy #1
          </Badge>
        )}
      </Link>

      {/* Content Details */}
      <div className="flex flex-1 flex-col p-4 space-y-2">
        {product.category && (
          <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
            {product.category.name}
          </span>
        )}

        <h3 className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1 text-sm">
          <Link to={`/products/${product.slug}`}>{product.name}</Link>
        </h3>

        {/* Rating & Sold count */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <div className="flex items-center text-amber-400">
            <Star className="h-3.5 w-3.5 fill-current" />
            <span className="ml-1 font-bold text-slate-800 text-xs">4.9</span>
          </div>
          <span>•</span>
          <span className="text-[11px] font-medium text-slate-500">Đã bán 142</span>
        </div>

        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed flex-1 pt-1 font-normal">
          {product.description}
        </p>

        {/* Price & Action */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-auto">
          <div>
            {formattedSalePrice ? (
              <div className="flex flex-col">
                <span className="text-base font-black text-emerald-600 leading-tight">{formattedSalePrice}</span>
                <span className="text-[11px] text-slate-400 line-through font-mono">{formattedPrice}</span>
              </div>
            ) : (
              <span className="text-base font-black text-slate-900">{formattedPrice}</span>
            )}
          </div>

          <Button
            size="sm"
            disabled={!product.in_stock}
            onClick={() => onAddToCart && onAddToCart(product)}
            className="rounded-xl gap-1.5 bg-emerald-600 hover:bg-emerald-500 font-bold text-xs shadow-sm"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            <span>Thêm vào giỏ</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

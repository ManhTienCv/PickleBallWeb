import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-6xl font-extrabold text-foreground mb-4">404</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Trang bạn tìm kiếm không tồn tại.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          <Home className="w-4 h-4" />
          Về trang chủ
        </Link>
      </div>
    </div>
  )
}

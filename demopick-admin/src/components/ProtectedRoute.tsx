import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

const staffAllowedPaths = ['/pos', '/court-map', '/orders', '/inventory']

export default function ProtectedRoute() {
  const { isAuthenticated, isLoading, user } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  const userRoles = user?.roles || []
  const isStaffOnly = userRoles.includes('staff') && !userRoles.includes('admin') && !userRoles.includes('super_admin')

  // If staff tries to access non-staff route, redirect to /pos
  if (isStaffOnly && !staffAllowedPaths.includes(location.pathname)) {
    return <Navigate to="/pos" replace />
  }

  return <Outlet />
}

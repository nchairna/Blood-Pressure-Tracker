import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const location = useLocation()
  const [showLoading, setShowLoading] = useState(false)

  // Only show loading spinner after a brief delay to avoid flash
  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => setShowLoading(true), 200)
      return () => clearTimeout(timer)
    } else {
      setShowLoading(false)
    }
  }, [loading])

  // Show loading state with optimized UX
  // Only show if auth is still initializing
  if (loading) {
    return showLoading ? (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f5f5f7]">
        <div className="w-20 h-20 bg-[#007aff] rounded-[22px] flex items-center justify-center mb-4 shadow-lg">
          <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </div>
        <Loader2 className="h-6 w-6 animate-spin text-[#007aff]" />
        <p className="text-[#86868b] mt-3 text-[15px]">Memuat...</p>
      </div>
    ) : null
  }

  // Auth has finished initializing
  // If no user found, redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // User is authenticated, render protected content
  return <>{children}</>
}

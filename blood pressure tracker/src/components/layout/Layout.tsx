import { Outlet, useNavigate } from 'react-router-dom'
import { BottomNav } from './BottomNav'
import { useAuth } from '@/hooks/useAuth'
import { useState } from 'react'

export function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showMenu, setShowMenu] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Pengguna'

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      {/* Minimal Header - just user menu */}
      <header className="sticky top-0 bg-[#f5f5f7]/80 backdrop-blur-xl z-40">
        <div className="max-w-lg mx-auto px-4 h-11 flex items-center justify-end">
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-1.5 text-[14px] text-[#007aff] font-medium"
            >
              {displayName}
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-lg border border-[#d2d2d7]/50 overflow-hidden z-50 min-w-[140px]">
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-3 text-left text-[15px] text-[#ff3b30] hover:bg-[#f5f5f7] transition-colors"
                  >
                    Keluar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-lg mx-auto px-4 py-4 pb-28">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}

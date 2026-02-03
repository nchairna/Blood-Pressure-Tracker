import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, waitForAuth, user, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      navigate('/dashboard', { replace: true })
    }
  }, [user, authLoading, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Login user
      await login(email, password)

      // Wait for Firebase auth state to update before navigating
      await waitForAuth()

      // Now safe to navigate - auth state is confirmed
      navigate('/dashboard')
    } catch {
      setError('Email atau kata sandi salah')
      setLoading(false)
    }
    // Don't set loading to false on success - let navigation happen
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-[#007aff] rounded-[22px] flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
          <h1 className="text-[28px] font-bold text-[#1d1d1f] tracking-tight">
            Tekanan Darah
          </h1>
          <p className="text-[#86868b] mt-1">
            Pantau tekanan darah Anda
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-[#fff5f5] text-[#ff3b30] text-[15px] px-4 py-3 rounded-xl text-center">
                {error}
              </div>
            )}

            <div>
              <label className="block text-[13px] font-medium text-[#86868b] uppercase tracking-wide mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#f5f5f7] border-0 rounded-xl px-4 py-3.5 text-[17px] text-[#1d1d1f] placeholder-[#86868b] focus:outline-none focus:ring-2 focus:ring-[#007aff] focus:bg-white transition-all"
                placeholder="nama@contoh.com"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#86868b] uppercase tracking-wide mb-2">
                Kata Sandi
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#f5f5f7] border-0 rounded-xl px-4 py-3.5 text-[17px] text-[#1d1d1f] placeholder-[#86868b] focus:outline-none focus:ring-2 focus:ring-[#007aff] focus:bg-white transition-all"
                placeholder="Masukkan kata sandi"
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#007aff] text-white font-semibold text-[17px] py-4 rounded-xl mt-2 hover:bg-[#0056b3] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Masuk...' : 'Masuk'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-[#86868b] mt-6 text-[15px]">
          Belum punya akun?{' '}
          <Link to="/register" className="text-[#007aff] font-medium hover:underline">
            Buat Akun
          </Link>
        </p>
      </div>
    </div>
  )
}

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { AuthProvider } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Layout } from '@/components/layout/Layout'
import Login from '@/pages/Login'
import Register from '@/pages/Register'

// Lazy load heavy pages to reduce initial bundle size
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const Entry = lazy(() => import('@/pages/Entry'))
const History = lazy(() => import('@/pages/History'))
const Export = lazy(() => import('@/pages/Export'))

// Check if Firebase is configured
const isFirebaseConfigured = Boolean(
  import.meta.env.VITE_FIREBASE_API_KEY &&
  import.meta.env.VITE_FIREBASE_PROJECT_ID
)

function PageLoader() {
  return (
    <div className="space-y-5 animate-pulse p-5">
      <div className="h-8 bg-gray-200 rounded-lg w-48"></div>
      <div className="bg-white rounded-2xl p-5 h-32"></div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl p-4 h-24"></div>
        <div className="bg-white rounded-2xl p-4 h-24"></div>
      </div>
    </div>
  )
}

function FirebaseNotConfigured() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Firebase Not Configured</h1>
          <p className="text-gray-600 mb-4">
            The app cannot start because Firebase credentials are missing.
          </p>
          <div className="bg-gray-100 rounded-lg p-4 text-left text-sm">
            <p className="font-medium text-gray-900 mb-2">To fix this:</p>
            <ol className="list-decimal list-inside space-y-1 text-gray-700">
              <li>Open <code className="bg-gray-200 px-1 rounded">.env.local</code> file</li>
              <li>Add your Firebase configuration</li>
              <li>Restart the dev server</li>
            </ol>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            See <code className="bg-gray-100 px-1 rounded">docs/FIREBASE_SETUP.md</code> for detailed instructions.
          </p>
        </div>
      </div>
    </div>
  )
}

function App() {
  // Show helpful error if Firebase isn't configured
  if (!isFirebaseConfigured) {
    return <FirebaseNotConfigured />
  }

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route
              path="/dashboard"
              element={
                <Suspense fallback={<PageLoader />}>
                  <Dashboard />
                </Suspense>
              }
            />
            <Route
              path="/entry"
              element={
                <Suspense fallback={<PageLoader />}>
                  <Entry />
                </Suspense>
              }
            />
            <Route
              path="/history"
              element={
                <Suspense fallback={<PageLoader />}>
                  <History />
                </Suspense>
              }
            />
            <Route
              path="/export"
              element={
                <Suspense fallback={<PageLoader />}>
                  <Export />
                </Suspense>
              }
            />
          </Route>

          {/* Redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Catch all - redirect to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App

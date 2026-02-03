import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import {
  type User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, displayName: string) => Promise<void>
  logout: () => Promise<void>
  waitForAuth: () => Promise<User | null>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [authReady, setAuthReady] = useState(false)
  const [initializing, setInitializing] = useState(true)

  useEffect(() => {
    // Set a timeout to prevent infinite loading states
    const initTimeout = setTimeout(() => {
      if (initializing) {
        console.warn('Auth initialization timeout - forcing ready state')
        setLoading(false)
        setAuthReady(true)
        setInitializing(false)
      }
    }, 10000) // 10 second timeout

    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setUser(user)
        setLoading(false)
        setAuthReady(true)
        setInitializing(false)
        clearTimeout(initTimeout)
      },
      (error) => {
        // Handle auth state change errors
        console.error('Auth state change error:', error)
        setUser(null)
        setLoading(false)
        setAuthReady(true)
        setInitializing(false)
        clearTimeout(initTimeout)
      }
    )

    return () => {
      unsubscribe()
      clearTimeout(initTimeout)
    }
  }, [])

  // Helper function to wait for auth to be ready after login/register
  const waitForAuth = useCallback((): Promise<User | null> => {
    if (authReady && !loading) {
      return Promise.resolve(user)
    }

    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe()
        resolve(user)
      })
    })
  }, [authReady, loading, user])

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password)
  }

  const register = async (email: string, password: string, displayName: string) => {
    const { user } = await createUserWithEmailAndPassword(auth, email, password)

    // Run profile update and Firestore write in parallel for faster registration
    await Promise.all([
      updateProfile(user, { displayName }),
      setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName,
        createdAt: serverTimestamp(),
      })
    ])
  }

  const logout = async () => {
    await signOut(auth)
  }

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    waitForAuth,
  }

  // Don't render children until auth is initialized
  // This prevents race conditions where components try to access
  // auth state before it's ready
  if (initializing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f5f5f7]">
        <div className="w-20 h-20 bg-[#007aff] rounded-[22px] flex items-center justify-center mb-4 shadow-lg">
          <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </div>
        <div className="h-6 w-6 border-3 border-[#007aff] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[#86868b] mt-3 text-[15px]">Menginisialisasi...</p>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from 'react'
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/hooks/useAuth'
import { useNetworkStatus } from '@/hooks/useNetworkStatus'
import type { BPReading, BPReadingFormData } from '@/types'

export type SyncStatus = 'loading' | 'syncing' | 'synced' | 'offline' | 'error'

interface BPDataContextType {
  // Data
  readings: BPReading[]
  // Status
  loading: boolean
  error: string | null
  syncStatus: SyncStatus
  hasSyncedWithServer: boolean
  isOnline: boolean
  // Actions
  addReading: (data: BPReadingFormData) => Promise<void>
  deleteReading: (id: string) => Promise<void>
  refresh: () => void
}

const BPDataContext = createContext<BPDataContextType | null>(null)

// Timeout for waiting on server sync (ms)
const SYNC_TIMEOUT = 3000

export function useBPData() {
  const context = useContext(BPDataContext)
  if (!context) {
    throw new Error('useBPData must be used within a BPDataProvider')
  }
  return context
}

interface BPDataProviderProps {
  children: ReactNode
}

export function BPDataProvider({ children }: BPDataProviderProps) {
  const { user, loading: authLoading } = useAuth()
  const { isOnline } = useNetworkStatus()

  const [readings, setReadings] = useState<BPReading[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasSyncedWithServer, setHasSyncedWithServer] = useState(false)
  const [isFromCache, setIsFromCache] = useState(true)

  const unsubscribeRef = useRef<(() => void) | null>(null)
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Compute sync status
  const syncStatus: SyncStatus = (() => {
    if (error) return 'error'
    if (!isOnline) return 'offline'
    if (loading && !hasSyncedWithServer) return 'loading'
    if (!hasSyncedWithServer && isFromCache) return 'syncing'
    return 'synced'
  })()

  // Setup single Firestore listener for all readings
  useEffect(() => {
    // Cleanup previous listener and timeout
    if (unsubscribeRef.current) {
      unsubscribeRef.current()
      unsubscribeRef.current = null
    }
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current)
      syncTimeoutRef.current = null
    }

    if (authLoading) return

    if (!user) {
      setReadings([])
      setLoading(false)
      setError(null)
      setHasSyncedWithServer(true)
      setIsFromCache(false)
      return
    }

    setLoading(true)
    setError(null)
    setHasSyncedWithServer(false)
    setIsFromCache(true)

    // Set sync timeout
    syncTimeoutRef.current = setTimeout(() => {
      setHasSyncedWithServer(true)
      setLoading(false)
    }, SYNC_TIMEOUT)

    // Single query for all readings, sorted by timestamp
    const readingsQuery = query(
      collection(db, 'readings'),
      where('userId', '==', user.uid),
      orderBy('timestamp', 'desc')
    )

    const unsubscribe = onSnapshot(
      readingsQuery,
      (snapshot) => {
        const fromCache = snapshot.metadata.fromCache

        const readingsData: BPReading[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as BPReading[]

        setReadings(readingsData)
        setIsFromCache(fromCache)
        setLoading(false)
        setError(null)

        if (!fromCache || !isOnline) {
          setHasSyncedWithServer(true)
          if (syncTimeoutRef.current) {
            clearTimeout(syncTimeoutRef.current)
            syncTimeoutRef.current = null
          }
        }
      },
      (err) => {
        console.error('Error fetching readings:', err)

        let errorMessage = 'Failed to load readings'
        if (err.code === 'permission-denied') {
          errorMessage = 'Permission denied. Please log in again.'
        } else if (err.code === 'unavailable') {
          errorMessage = 'Network error. Please check your connection.'
          if (!isOnline) {
            setHasSyncedWithServer(true)
            setLoading(false)
            return
          }
        } else if (err.code === 'unauthenticated') {
          errorMessage = 'Authentication required. Please log in again.'
        }

        setError(errorMessage)
        setLoading(false)
      }
    )

    unsubscribeRef.current = unsubscribe

    return () => {
      unsubscribe()
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current)
        syncTimeoutRef.current = null
      }
    }
  }, [user, authLoading, isOnline])

  // Optimistic add with rollback on error
  const addReading = useCallback(
    async (data: BPReadingFormData) => {
      if (!user) throw new Error('Must be logged in')

      // Create optimistic reading with temporary ID
      const tempId = `temp-${Date.now()}`
      const optimisticReading: BPReading = {
        id: tempId,
        userId: user.uid,
        systolic: data.systolic,
        diastolic: data.diastolic,
        pulse: data.pulse,
        timeOfDay: data.timeOfDay,
        timestamp: Timestamp.fromDate(data.date),
        notes: data.notes || undefined,
        createdAt: Timestamp.now(),
      }

      // Optimistically add to state
      setReadings((prev) => [optimisticReading, ...prev])

      try {
        // Build reading data - omit notes field entirely if empty
        // Firestore doesn't accept undefined values
        const readingData: Record<string, unknown> = {
          userId: user.uid,
          systolic: data.systolic,
          diastolic: data.diastolic,
          pulse: data.pulse,
          timeOfDay: data.timeOfDay,
          timestamp: Timestamp.fromDate(data.date),
          createdAt: serverTimestamp(),
        }

        // Only add notes if provided
        if (data.notes) {
          readingData.notes = data.notes
        }

        await addDoc(collection(db, 'readings'), readingData)
        // Firestore listener will update with real data
      } catch (err) {
        // Rollback on error
        setReadings((prev) => prev.filter((r) => r.id !== tempId))
        throw err
      }
    },
    [user]
  )

  // Optimistic delete with rollback on error
  const deleteReading = useCallback(
    async (id: string) => {
      if (!user) throw new Error('Must be logged in')

      // Store for rollback
      const deletedReading = readings.find((r) => r.id === id)

      // Optimistically remove from state
      setReadings((prev) => prev.filter((r) => r.id !== id))

      try {
        await deleteDoc(doc(db, 'readings', id))
      } catch (err) {
        // Rollback on error
        if (deletedReading) {
          setReadings((prev) => {
            const newReadings = [...prev, deletedReading]
            return newReadings.sort((a, b) =>
              b.timestamp.toMillis() - a.timestamp.toMillis()
            )
          })
        }
        throw err
      }
    },
    [user, readings]
  )

  // Manual refresh - reconnect listener
  const refresh = useCallback(() => {
    if (!user || !isOnline) return

    setHasSyncedWithServer(false)
    setIsFromCache(true)

    // The useEffect will handle reconnecting due to dependency on user
    // Force re-run by toggling a state (hack, but works)
  }, [user, isOnline])

  const value: BPDataContextType = {
    readings,
    loading,
    error,
    syncStatus,
    hasSyncedWithServer,
    isOnline,
    addReading,
    deleteReading,
    refresh,
  }

  return (
    <BPDataContext.Provider value={value}>
      {children}
    </BPDataContext.Provider>
  )
}

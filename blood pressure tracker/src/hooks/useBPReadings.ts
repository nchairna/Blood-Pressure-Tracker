import { useState, useEffect, useCallback } from 'react'
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
import type { BPReading, BPReadingFormData, DateRangeOption } from '@/types'
import { getDateRange } from '@/lib/bp-utils'

export function useBPReadings(dateRangeOption: DateRangeOption = 'all') {
  const { user, loading: authLoading } = useAuth()
  const [readings, setReadings] = useState<BPReading[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Wait for auth to finish initializing before attempting to fetch data
    // This prevents race conditions where we try to query Firestore
    // before knowing if the user is authenticated
    if (authLoading) {
      return
    }

    if (!user) {
      setReadings([])
      setLoading(false)
      setError(null)
      return
    }

    setLoading(true)
    setError(null)

    // For 'all', use simpler query without date range (faster, no complex index needed)
    // For specific ranges, use date filters
    let readingsQuery
    if (dateRangeOption === 'all') {
      readingsQuery = query(
        collection(db, 'readings'),
        where('userId', '==', user.uid),
        orderBy('timestamp', 'desc')
      )
    } else {
      const { start, end } = getDateRange(dateRangeOption)
      readingsQuery = query(
        collection(db, 'readings'),
        where('userId', '==', user.uid),
        where('timestamp', '>=', Timestamp.fromDate(start)),
        where('timestamp', '<=', Timestamp.fromDate(end)),
        orderBy('timestamp', 'desc')
      )
    }

    const unsubscribe = onSnapshot(
      readingsQuery,
      (snapshot) => {
        try {
          const readingsData: BPReading[] = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          })) as BPReading[]
          setReadings(readingsData)
          setLoading(false)
          setError(null)
        } catch (err) {
          console.error('Error processing readings data:', err)
          setError('Failed to process readings data')
          setLoading(false)
        }
      },
      (err) => {
        console.error('Error fetching readings:', err)

        // Provide more specific error messages
        let errorMessage = 'Failed to load readings'
        if (err.code === 'permission-denied') {
          errorMessage = 'Permission denied. Please log in again.'
        } else if (err.code === 'unavailable') {
          errorMessage = 'Network error. Please check your connection.'
        } else if (err.code === 'unauthenticated') {
          errorMessage = 'Authentication required. Please log in again.'
        }

        setError(errorMessage)
        setLoading(false)
      }
    )

    return () => {
      unsubscribe()
    }
  }, [user, authLoading, dateRangeOption])

  const addReading = useCallback(
    async (data: BPReadingFormData) => {
      if (!user) throw new Error('Must be logged in')

      const readingData = {
        userId: user.uid,
        systolic: data.systolic,
        diastolic: data.diastolic,
        pulse: data.pulse,
        timeOfDay: data.timeOfDay,
        timestamp: Timestamp.fromDate(data.date),
        notes: data.notes || null,
        createdAt: serverTimestamp(),
      }

      await addDoc(collection(db, 'readings'), readingData)
    },
    [user]
  )

  const deleteReading = useCallback(
    async (id: string) => {
      if (!user) throw new Error('Must be logged in')
      await deleteDoc(doc(db, 'readings', id))
    },
    [user]
  )

  return {
    readings,
    loading,
    error,
    addReading,
    deleteReading,
  }
}

export function useTodayReadings() {
  const { user, loading: authLoading } = useAuth()
  const [readings, setReadings] = useState<BPReading[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Wait for auth to initialize
    if (authLoading) {
      return
    }

    if (!user) {
      setReadings([])
      setLoading(false)
      return
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const readingsQuery = query(
      collection(db, 'readings'),
      where('userId', '==', user.uid),
      where('timestamp', '>=', Timestamp.fromDate(today)),
      where('timestamp', '<', Timestamp.fromDate(tomorrow)),
      orderBy('timestamp', 'desc')
    )

    const unsubscribe = onSnapshot(
      readingsQuery,
      (snapshot) => {
        try {
          const readingsData: BPReading[] = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          })) as BPReading[]
          setReadings(readingsData)
          setLoading(false)
        } catch (err) {
          console.error('Error processing today readings data:', err)
          setReadings([])
          setLoading(false)
        }
      },
      (err) => {
        console.error('Error fetching today readings:', err)
        setReadings([])
        setLoading(false)
      }
    )

    return () => {
      unsubscribe()
    }
  }, [user, authLoading])

  return { readings, loading }
}

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
  const { user } = useAuth()
  const [readings, setReadings] = useState<BPReading[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setReadings([])
      setLoading(false)
      return
    }

    setLoading(true)
    const { start, end } = getDateRange(dateRangeOption)

    const readingsQuery = query(
      collection(db, 'readings'),
      where('userId', '==', user.uid),
      where('timestamp', '>=', Timestamp.fromDate(start)),
      where('timestamp', '<=', Timestamp.fromDate(end)),
      orderBy('timestamp', 'desc')
    )

    const unsubscribe = onSnapshot(
      readingsQuery,
      (snapshot) => {
        const readingsData: BPReading[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as BPReading[]
        setReadings(readingsData)
        setLoading(false)
        setError(null)
      },
      (err) => {
        console.error('Error fetching readings:', err)
        setError('Failed to load readings')
        setLoading(false)
      }
    )

    return unsubscribe
  }, [user, dateRangeOption])

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
  const { user } = useAuth()
  const [readings, setReadings] = useState<BPReading[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
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
        const readingsData: BPReading[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as BPReading[]
        setReadings(readingsData)
        setLoading(false)
      },
      (err) => {
        console.error('Error fetching today readings:', err)
        setLoading(false)
      }
    )

    return unsubscribe
  }, [user])

  return { readings, loading }
}

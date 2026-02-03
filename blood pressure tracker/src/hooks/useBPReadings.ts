import { useMemo } from 'react'
import { useBPData, type SyncStatus } from '@/contexts/BPDataContext'
import type { BPReading, DateRangeOption } from '@/types'
import { getDateRange } from '@/lib/bp-utils'

// Re-export SyncStatus for backward compatibility
export type { SyncStatus }

/**
 * Hook to access BP readings with optional date filtering.
 * All data comes from a single centralized Firestore listener (BPDataProvider).
 * This prevents multiple listeners and ensures consistent state across components.
 */
export function useBPReadings(dateRangeOption: DateRangeOption = 'all') {
  const {
    readings: allReadings,
    loading,
    error,
    syncStatus,
    hasSyncedWithServer,
    isOnline,
    addReading,
    deleteReading,
    refresh,
  } = useBPData()

  // Filter readings client-side based on date range
  // This is efficient since we already have all data in memory
  const readings = useMemo(() => {
    if (dateRangeOption === 'all') {
      return allReadings
    }

    const { start, end } = getDateRange(dateRangeOption)
    return allReadings.filter((reading) => {
      const date = reading.timestamp.toDate()
      return date >= start && date <= end
    })
  }, [allReadings, dateRangeOption])

  return {
    readings,
    loading,
    error,
    addReading,
    deleteReading,
    syncStatus,
    hasSyncedWithServer,
    isFromCache: syncStatus === 'syncing',
    isOnline,
    refresh,
  }
}

/**
 * Hook to get today's readings only.
 * Derives from the centralized data store.
 */
export function useTodayReadings() {
  const {
    readings: allReadings,
    loading,
    syncStatus,
    hasSyncedWithServer,
  } = useBPData()

  // Filter to today's readings
  const readings = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    return allReadings.filter((reading) => {
      const date = reading.timestamp.toDate()
      return date >= today && date < tomorrow
    })
  }, [allReadings])

  return {
    readings,
    loading,
    syncStatus,
    hasSyncedWithServer,
    isFromCache: syncStatus === 'syncing',
  }
}

/**
 * Hook to get readings for a specific date range.
 * Useful for charts and exports.
 */
export function useReadingsInRange(startDate: Date, endDate: Date): BPReading[] {
  const { readings: allReadings } = useBPData()

  return useMemo(() => {
    return allReadings.filter((reading) => {
      const date = reading.timestamp.toDate()
      return date >= startDate && date <= endDate
    })
  }, [allReadings, startDate, endDate])
}

import { useMemo } from 'react'
import type { BPReading, BPStats, DateRangeOption } from '@/types'
import { calculateBPStats, getDateRange } from '@/lib/bp-utils'

export function useStats(readings: BPReading[], dateRangeOption: DateRangeOption): BPStats {
  return useMemo(() => {
    const { start, end } = getDateRange(dateRangeOption)

    const filteredReadings = readings.filter((reading) => {
      const readingDate = reading.timestamp.toDate()
      return readingDate >= start && readingDate <= end
    })

    return calculateBPStats(filteredReadings)
  }, [readings, dateRangeOption])
}

export function useLatestReading(readings: BPReading[]): BPReading | null {
  return useMemo(() => {
    if (readings.length === 0) return null

    return readings.reduce((latest, reading) => {
      if (!latest) return reading
      return reading.timestamp.toDate() > latest.timestamp.toDate() ? reading : latest
    }, null as BPReading | null)
  }, [readings])
}

export function useWeeklyReadingsCount(readings: BPReading[]): number {
  return useMemo(() => {
    const { start, end } = getDateRange('7d')

    return readings.filter((reading) => {
      const readingDate = reading.timestamp.toDate()
      return readingDate >= start && readingDate <= end
    }).length
  }, [readings])
}

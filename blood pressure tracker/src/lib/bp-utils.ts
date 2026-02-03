import type { BPStatus, BPReading, BPStats, TimeOfDay } from '@/types'

/**
 * Classify blood pressure reading according to AHA guidelines
 * Normal: < 120/80
 * Elevated: 120-129/<80
 * High Stage 1: 130-139/80-89
 * High Stage 2: >= 140/90
 */
export function classifyBP(systolic: number, diastolic: number): BPStatus {
  if (systolic >= 140 || diastolic >= 90) {
    return 'high2'
  }
  if ((systolic >= 130 && systolic <= 139) || (diastolic >= 80 && diastolic <= 89)) {
    return 'high1'
  }
  if (systolic >= 120 && systolic <= 129 && diastolic < 80) {
    return 'elevated'
  }
  return 'normal'
}

/**
 * Get display label for BP status
 */
export function getBPStatusLabel(status: BPStatus): string {
  switch (status) {
    case 'normal':
      return 'Normal'
    case 'elevated':
      return 'Elevated'
    case 'high1':
      return 'High Stage 1'
    case 'high2':
      return 'High Stage 2'
  }
}

/**
 * Get color classes for BP status
 */
export function getBPStatusColor(status: BPStatus): string {
  switch (status) {
    case 'normal':
      return 'bg-green-500 text-white'
    case 'elevated':
      return 'bg-yellow-500 text-white'
    case 'high1':
      return 'bg-orange-500 text-white'
    case 'high2':
      return 'bg-red-500 text-white'
  }
}

/**
 * Get text color class for BP status (for text-only display)
 */
export function getBPStatusTextColor(status: BPStatus): string {
  switch (status) {
    case 'normal':
      return 'text-green-600'
    case 'elevated':
      return 'text-yellow-600'
    case 'high1':
      return 'text-orange-600'
    case 'high2':
      return 'text-red-600'
  }
}

/**
 * Calculate BP statistics from readings
 */
export function calculateBPStats(readings: BPReading[]): BPStats {
  if (readings.length === 0) {
    return {
      avgSystolic: 0,
      avgDiastolic: 0,
      avgPulse: 0,
      readingsCount: 0,
    }
  }

  const totals = readings.reduce(
    (acc, reading) => ({
      systolic: acc.systolic + reading.systolic,
      diastolic: acc.diastolic + reading.diastolic,
      pulse: acc.pulse + reading.pulse,
    }),
    { systolic: 0, diastolic: 0, pulse: 0 }
  )

  return {
    avgSystolic: Math.round(totals.systolic / readings.length),
    avgDiastolic: Math.round(totals.diastolic / readings.length),
    avgPulse: Math.round(totals.pulse / readings.length),
    readingsCount: readings.length,
  }
}

/**
 * Validate systolic value (60-250 mmHg)
 */
export function isValidSystolic(value: number): boolean {
  return value >= 60 && value <= 250
}

/**
 * Validate diastolic value (40-150 mmHg)
 */
export function isValidDiastolic(value: number): boolean {
  return value >= 40 && value <= 150
}

/**
 * Validate pulse value (40-200 bpm)
 */
export function isValidPulse(value: number): boolean {
  return value >= 40 && value <= 200
}

/**
 * Format BP reading as string (e.g., "120/80")
 */
export function formatBPReading(systolic: number, diastolic: number): string {
  return `${systolic}/${diastolic}`
}

/**
 * Get display label for time of day
 */
export function getTimeOfDayLabel(timeOfDay: TimeOfDay): string {
  switch (timeOfDay) {
    case 'morning':
      return 'Morning'
    case 'afternoon':
      return 'Afternoon'
    case 'evening':
      return 'Evening'
  }
}

/**
 * Auto-classify time of day based on hour
 * Morning: 5:00 AM - 11:59 AM (5-11)
 * Afternoon: 12:00 PM - 5:59 PM (12-17)
 * Evening: 6:00 PM - 4:59 AM (18-4)
 */
export function getTimeOfDayFromHour(hour: number): TimeOfDay {
  if (hour >= 5 && hour < 12) {
    return 'morning'
  }
  if (hour >= 12 && hour < 18) {
    return 'afternoon'
  }
  return 'evening'
}

/**
 * Get current time of day
 */
export function getCurrentTimeOfDay(): TimeOfDay {
  return getTimeOfDayFromHour(new Date().getHours())
}

/**
 * Determine suggested time of day based on current hour
 * @deprecated Use getCurrentTimeOfDay() instead
 */
export function getSuggestedTimeOfDay(): TimeOfDay {
  return getCurrentTimeOfDay()
}

/**
 * Format date for display
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

/**
 * Format time for display
 */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

/**
 * Format date and time for display
 */
export function formatDateTime(date: Date): string {
  return `${formatDate(date)} at ${formatTime(date)}`
}

/**
 * Get start of day
 */
export function startOfDay(date: Date): Date {
  const result = new Date(date)
  result.setHours(0, 0, 0, 0)
  return result
}

/**
 * Get end of day
 */
export function endOfDay(date: Date): Date {
  const result = new Date(date)
  result.setHours(23, 59, 59, 999)
  return result
}

/**
 * Get date range based on option
 */
export function getDateRange(option: '7d' | '30d' | '90d' | 'all'): { start: Date; end: Date } {
  const end = endOfDay(new Date())
  let start: Date

  switch (option) {
    case '7d':
      start = new Date()
      start.setDate(start.getDate() - 7)
      break
    case '30d':
      start = new Date()
      start.setDate(start.getDate() - 30)
      break
    case '90d':
      start = new Date()
      start.setDate(start.getDate() - 90)
      break
    case 'all':
      start = new Date(2000, 0, 1) // Far enough in the past
      break
  }

  return { start: startOfDay(start), end }
}

/**
 * Check if two dates are the same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

/**
 * Check if date is today
 */
export function isToday(date: Date): boolean {
  return isSameDay(date, new Date())
}

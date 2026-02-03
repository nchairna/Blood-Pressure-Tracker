import { useMemo } from 'react'
import type { BPReading } from '@/types'
import { isSameDay } from '@/lib/bp-utils'

const DAILY_GOAL = 3

interface GamificationStats {
  todayCount: number
  todayGoal: number
  todayProgress: number // 0-100
  currentStreak: number
  bestStreak: number
  totalReadings: number
  daysTracked: number
  perfectDays: number // days with 3+ readings
}

export function useGamification(readings: BPReading[]): GamificationStats {
  return useMemo(() => {
    if (readings.length === 0) {
      return {
        todayCount: 0,
        todayGoal: DAILY_GOAL,
        todayProgress: 0,
        currentStreak: 0,
        bestStreak: 0,
        totalReadings: 0,
        daysTracked: 0,
        perfectDays: 0,
      }
    }

    const now = new Date()

    // Count today's readings
    const todayCount = readings.filter((r) =>
      isSameDay(r.timestamp.toDate(), now)
    ).length

    // Group readings by date
    const readingsByDate = new Map<string, number>()
    readings.forEach((reading) => {
      const dateKey = reading.timestamp.toDate().toISOString().split('T')[0]
      readingsByDate.set(dateKey, (readingsByDate.get(dateKey) || 0) + 1)
    })

    // Get sorted dates (newest first)
    const sortedDates = Array.from(readingsByDate.keys()).sort((a, b) =>
      new Date(b).getTime() - new Date(a).getTime()
    )

    // Calculate streaks
    let currentStreak = 0
    let bestStreak = 0
    let tempStreak = 0
    let perfectDays = 0

    // Check if today has readings - if not, start checking from yesterday
    const todayKey = now.toISOString().split('T')[0]
    const hasTodayReadings = readingsByDate.has(todayKey)

    // Calculate current streak (consecutive days with 3+ readings)
    let streakCheckDate = new Date(now)
    if (!hasTodayReadings && now.getHours() < 12) {
      streakCheckDate.setDate(streakCheckDate.getDate() - 1)
    }

    for (let i = 0; i < 365; i++) { // Check up to a year back
      const dateKey = streakCheckDate.toISOString().split('T')[0]
      const count = readingsByDate.get(dateKey) || 0

      if (count >= DAILY_GOAL) {
        currentStreak++
        streakCheckDate.setDate(streakCheckDate.getDate() - 1)
      } else if (i === 0 && !hasTodayReadings && now.getHours() < 12) {
        // Skip today if no readings and it's early
        streakCheckDate.setDate(streakCheckDate.getDate() - 1)
      } else {
        break
      }
    }

    // Calculate best streak and perfect days
    tempStreak = 0
    sortedDates.forEach((dateKey, index) => {
      const count = readingsByDate.get(dateKey) || 0

      if (count >= DAILY_GOAL) {
        perfectDays++
        tempStreak++

        // Check if next date is consecutive
        if (index < sortedDates.length - 1) {
          const currentDate = new Date(dateKey)
          const nextDate = new Date(sortedDates[index + 1])
          const dayDiff = Math.round((currentDate.getTime() - nextDate.getTime()) / (24 * 60 * 60 * 1000))

          if (dayDiff !== 1) {
            // Not consecutive, end streak
            bestStreak = Math.max(bestStreak, tempStreak)
            tempStreak = 0
          }
        }
      } else {
        bestStreak = Math.max(bestStreak, tempStreak)
        tempStreak = 0
      }
    })
    bestStreak = Math.max(bestStreak, tempStreak)

    return {
      todayCount,
      todayGoal: DAILY_GOAL,
      todayProgress: Math.min(100, (todayCount / DAILY_GOAL) * 100),
      currentStreak,
      bestStreak,
      totalReadings: readings.length,
      daysTracked: readingsByDate.size,
      perfectDays,
    }
  }, [readings])
}

export function getStreakMessage(streak: number): string {
  if (streak === 0) return 'Start your streak today!'
  if (streak === 1) return '1 day streak! Keep it up!'
  if (streak < 7) return `${streak} day streak! Great start!`
  if (streak < 14) return `${streak} day streak! You're on fire!`
  if (streak < 30) return `${streak} day streak! Incredible!`
  return `${streak} day streak! You're a champion!`
}

export function getDailyProgressMessage(count: number, goal: number): string {
  if (count === 0) return 'No readings yet today'
  if (count < goal) return `${goal - count} more to reach your goal`
  if (count === goal) return 'Daily goal reached!'
  return `${count} readings today - excellent!`
}

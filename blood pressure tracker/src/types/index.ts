import type { Timestamp } from 'firebase/firestore'

export interface User {
  uid: string
  email: string
  displayName: string
  createdAt: Timestamp
}

export type TimeOfDay = 'morning' | 'afternoon' | 'evening'

export interface BPReading {
  id: string
  userId: string
  systolic: number      // Top number (mmHg)
  diastolic: number     // Bottom number (mmHg)
  pulse: number         // Heart rate (bpm)
  timestamp: Timestamp  // Date and time of reading
  timeOfDay: TimeOfDay
  notes?: string        // Optional notes
  createdAt: Timestamp
}

export type BPStatus = 'normal' | 'elevated' | 'high1' | 'high2'

export interface BPStats {
  avgSystolic: number
  avgDiastolic: number
  avgPulse: number
  readingsCount: number
}

export interface DateRange {
  start: Date
  end: Date
}

export type DateRangeOption = '7d' | '30d' | '90d' | 'all'

// Form data type for creating/editing readings
export interface BPReadingFormData {
  systolic: number
  diastolic: number
  pulse: number
  timeOfDay: TimeOfDay
  date: Date
  notes?: string
}

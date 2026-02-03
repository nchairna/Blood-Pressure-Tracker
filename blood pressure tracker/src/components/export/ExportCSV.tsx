import Papa from 'papaparse'
import type { BPReading } from '@/types'
import { formatDate, formatTime, getTimeOfDayLabel, classifyBP, getBPStatusLabel } from '@/lib/bp-utils'

interface ExportCSVOptions {
  readings: BPReading[]
}

export function generateCSV({ readings }: ExportCSVOptions): void {
  const csvData = readings.map((reading) => {
    const date = reading.timestamp.toDate()
    const status = classifyBP(reading.systolic, reading.diastolic)

    return {
      Date: formatDate(date),
      Time: formatTime(date),
      'Time of Day': getTimeOfDayLabel(reading.timeOfDay),
      'Systolic (mmHg)': reading.systolic,
      'Diastolic (mmHg)': reading.diastolic,
      'Pulse (bpm)': reading.pulse,
      'BP Status': getBPStatusLabel(status),
      Notes: reading.notes || '',
    }
  })

  const csv = Papa.unparse(csvData)

  // Create blob and download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `bp-readings-${formatDate(new Date()).replace(/\s/g, '-')}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

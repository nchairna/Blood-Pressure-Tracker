import { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from 'recharts'
import type { BPReading } from '@/types'
import { formatDate } from '@/lib/bp-utils'

interface BPChartProps {
  readings: BPReading[]
  showPulse?: boolean
  height?: number
}

interface ChartDataPoint {
  date: string
  fullDate: Date
  systolic: number
  diastolic: number
  pulse: number
}

export function BPChart({ readings, showPulse = false, height = 300 }: BPChartProps) {
  const chartData = useMemo(() => {
    // Sort by date ascending for chart
    const sorted = [...readings].sort(
      (a, b) => a.timestamp.toDate().getTime() - b.timestamp.toDate().getTime()
    )

    // Group by date and calculate daily averages
    const dailyData = new Map<string, { systolic: number[]; diastolic: number[]; pulse: number[]; fullDate: Date }>()

    sorted.forEach((reading) => {
      const date = reading.timestamp.toDate()
      const dateKey = date.toISOString().split('T')[0]

      if (!dailyData.has(dateKey)) {
        dailyData.set(dateKey, { systolic: [], diastolic: [], pulse: [], fullDate: date })
      }

      const dayData = dailyData.get(dateKey)!
      dayData.systolic.push(reading.systolic)
      dayData.diastolic.push(reading.diastolic)
      dayData.pulse.push(reading.pulse)
    })

    const result: ChartDataPoint[] = []

    dailyData.forEach((data) => {
      const avgSystolic = Math.round(data.systolic.reduce((a, b) => a + b, 0) / data.systolic.length)
      const avgDiastolic = Math.round(data.diastolic.reduce((a, b) => a + b, 0) / data.diastolic.length)
      const avgPulse = Math.round(data.pulse.reduce((a, b) => a + b, 0) / data.pulse.length)

      result.push({
        date: formatDate(data.fullDate),
        fullDate: data.fullDate,
        systolic: avgSystolic,
        diastolic: avgDiastolic,
        pulse: avgPulse,
      })
    })

    return result
  }, [readings])

  if (readings.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px] text-muted-foreground">
        No data to display
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={{ stroke: '#e5e7eb' }}
        />
        <YAxis
          domain={[40, 200]}
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={{ stroke: '#e5e7eb' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
          labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
        />
        <Legend />

        {/* Reference lines for BP thresholds */}
        <ReferenceLine y={120} stroke="#22c55e" strokeDasharray="3 3" />
        <ReferenceLine y={80} stroke="#22c55e" strokeDasharray="3 3" />
        <ReferenceLine y={140} stroke="#ef4444" strokeDasharray="3 3" />
        <ReferenceLine y={90} stroke="#ef4444" strokeDasharray="3 3" />

        <Line
          type="monotone"
          dataKey="systolic"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6 }}
          name="Systolic"
        />
        <Line
          type="monotone"
          dataKey="diastolic"
          stroke="#8b5cf6"
          strokeWidth={2}
          dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6 }}
          name="Diastolic"
        />
        {showPulse && (
          <Line
            type="monotone"
            dataKey="pulse"
            stroke="#f97316"
            strokeWidth={2}
            dot={{ fill: '#f97316', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
            name="Pulse"
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  )
}

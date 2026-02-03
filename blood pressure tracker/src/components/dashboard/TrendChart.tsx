import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BPChart } from '@/components/bp/BPChart'
import type { BPReading, DateRangeOption } from '@/types'
import { cn } from '@/lib/utils'

interface TrendChartProps {
  readings: BPReading[]
  title?: string
}

export function TrendChart({ readings, title = 'BP Trend' }: TrendChartProps) {
  const [dateRange, setDateRange] = useState<DateRangeOption>('7d')
  const [showPulse, setShowPulse] = useState(false)

  const dateRangeOptions: { value: DateRangeOption; label: string }[] = [
    { value: '7d', label: '7d' },
    { value: '30d', label: '30d' },
    { value: '90d', label: '90d' },
    { value: 'all', label: 'All' },
  ]

  // Filter readings based on date range
  const filteredReadings = readings.filter((reading) => {
    const date = reading.timestamp.toDate()
    const now = new Date()

    switch (dateRange) {
      case '7d':
        return date >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      case '30d':
        return date >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      case '90d':
        return date >= new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
      case 'all':
      default:
        return true
    }
  })

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          <button
            onClick={() => setShowPulse(!showPulse)}
            className={cn(
              'text-xs px-2 py-1 rounded',
              showPulse
                ? 'bg-orange-100 text-orange-700'
                : 'bg-gray-100 text-gray-600'
            )}
          >
            {showPulse ? 'Hide Pulse' : 'Show Pulse'}
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <BPChart readings={filteredReadings} showPulse={showPulse} height={250} />

        {/* Date range selector */}
        <div className="flex justify-center mt-4 gap-1">
          {dateRangeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setDateRange(option.value)}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-md transition-colors',
                dateRange === option.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-4 mt-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5 bg-green-500" />
            <span>Normal (120/80)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5 bg-red-500" />
            <span>High (140/90)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

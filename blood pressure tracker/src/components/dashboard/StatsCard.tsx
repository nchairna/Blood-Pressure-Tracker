import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { classifyBP, getBPStatusColor, getBPStatusLabel } from '@/lib/bp-utils'

interface StatsCardProps {
  title: string
  systolic?: number
  diastolic?: number
  pulse?: number
  showStatus?: boolean
  subtitle?: string
  className?: string
}

export function StatsCard({
  title,
  systolic,
  diastolic,
  pulse,
  showStatus = true,
  subtitle,
  className,
}: StatsCardProps) {
  const hasData = systolic !== undefined && diastolic !== undefined && systolic > 0 && diastolic > 0
  const status = hasData ? classifyBP(systolic, diastolic) : null

  return (
    <Card className={cn('', className)}>
      <CardContent className="p-4">
        <div className="text-sm text-muted-foreground mb-1">{title}</div>

        {hasData ? (
          <>
            <div className="text-2xl font-bold">
              {systolic}/{diastolic}
            </div>
            {pulse !== undefined && pulse > 0 && (
              <div className="text-sm text-muted-foreground">{pulse} bpm</div>
            )}
            {showStatus && status && (
              <div
                className={cn(
                  'inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-medium',
                  getBPStatusColor(status)
                )}
              >
                {getBPStatusLabel(status)}
              </div>
            )}
            {subtitle && (
              <div className="text-xs text-muted-foreground mt-1">{subtitle}</div>
            )}
          </>
        ) : (
          <div className="text-muted-foreground">No data</div>
        )}
      </CardContent>
    </Card>
  )
}

interface SimpleStatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  className?: string
}

export function SimpleStatsCard({ title, value, subtitle, className }: SimpleStatsCardProps) {
  return (
    <Card className={cn('', className)}>
      <CardContent className="p-4">
        <div className="text-sm text-muted-foreground mb-1">{title}</div>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && (
          <div className="text-xs text-muted-foreground mt-1">{subtitle}</div>
        )}
      </CardContent>
    </Card>
  )
}

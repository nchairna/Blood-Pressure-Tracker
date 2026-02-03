import { cn } from '@/lib/utils'
import { classifyBP, getBPStatusLabel, getBPStatusColor } from '@/lib/bp-utils'

interface BPStatusBadgeProps {
  systolic: number
  diastolic: number
  className?: string
  showLabel?: boolean
}

export function BPStatusBadge({ systolic, diastolic, className, showLabel = true }: BPStatusBadgeProps) {
  const status = classifyBP(systolic, diastolic)
  const label = getBPStatusLabel(status)
  const colorClass = getBPStatusColor(status)

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        colorClass,
        className
      )}
    >
      {showLabel ? label : ''}
    </span>
  )
}

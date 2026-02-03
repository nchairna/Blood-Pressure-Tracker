import { RefreshCw, WifiOff, Check, AlertTriangle } from 'lucide-react'
import type { SyncStatus } from '@/hooks/useBPReadings'

interface SyncIndicatorProps {
  status: SyncStatus
  onRefresh?: () => void
  className?: string
}

export function SyncIndicator({ status, onRefresh, className = '' }: SyncIndicatorProps) {
  const getStatusDisplay = () => {
    switch (status) {
      case 'loading':
        return {
          icon: <RefreshCw className="w-3.5 h-3.5 animate-spin" />,
          text: 'Memuat...',
          color: 'text-[#86868b]',
          bg: 'bg-[#f5f5f7]',
        }
      case 'syncing':
        return {
          icon: <RefreshCw className="w-3.5 h-3.5 animate-spin" />,
          text: 'Menyinkronkan...',
          color: 'text-[#007aff]',
          bg: 'bg-[#007aff]/10',
        }
      case 'synced':
        return {
          icon: <Check className="w-3.5 h-3.5" />,
          text: 'Tersinkron',
          color: 'text-[#34c759]',
          bg: 'bg-[#34c759]/10',
        }
      case 'offline':
        return {
          icon: <WifiOff className="w-3.5 h-3.5" />,
          text: 'Offline',
          color: 'text-[#ff9500]',
          bg: 'bg-[#ff9500]/10',
        }
      case 'error':
        return {
          icon: <AlertTriangle className="w-3.5 h-3.5" />,
          text: 'Error',
          color: 'text-[#ff3b30]',
          bg: 'bg-[#ff3b30]/10',
        }
    }
  }

  const display = getStatusDisplay()

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${display.bg} ${display.color}`}>
        {display.icon}
        <span className="text-[12px] font-medium">{display.text}</span>
      </div>
      {onRefresh && status !== 'loading' && status !== 'syncing' && (
        <button
          onClick={onRefresh}
          className="p-1.5 rounded-full hover:bg-[#f5f5f7] transition-colors"
          title="Refresh data"
        >
          <RefreshCw className="w-4 h-4 text-[#86868b]" />
        </button>
      )}
    </div>
  )
}

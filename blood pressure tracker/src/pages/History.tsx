import { useState, useMemo } from 'react'
import { useBPReadings } from '@/hooks/useBPReadings'
import { classifyBP, formatDate, formatTime, isSameDay } from '@/lib/bp-utils'

type DateFilter = 'today' | 'week' | 'month' | 'all'

const getStatusLabelID = (status: string) => {
  switch (status) {
    case 'normal': return 'Normal'
    case 'elevated': return 'Meningkat'
    case 'high1': return 'Tinggi Tahap 1'
    case 'high2': return 'Tinggi Tahap 2'
    default: return ''
  }
}

export default function History() {
  const { readings, loading, deleteReading } = useBPReadings('all')
  const [deleting, setDeleting] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState<string | null>(null)
  const [dateFilter, setDateFilter] = useState<DateFilter>('today')

  // Filter readings by date
  const filteredReadings = useMemo(() => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    return readings.filter((reading) => {
      const date = reading.timestamp.toDate()

      switch (dateFilter) {
        case 'today':
          return isSameDay(date, now)
        case 'week':
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
          return date >= weekAgo
        case 'month':
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
          return date >= monthAgo
        case 'all':
        default:
          return true
      }
    })
  }, [readings, dateFilter])

  // Group by date
  const groupedReadings = useMemo(() => {
    const groups = new Map<string, typeof readings>()
    filteredReadings.forEach((reading) => {
      const dateKey = reading.timestamp.toDate().toISOString().split('T')[0]
      if (!groups.has(dateKey)) groups.set(dateKey, [])
      groups.get(dateKey)!.push(reading)
    })
    return Array.from(groups.entries())
      .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
  }, [filteredReadings])

  const getStatusColor = (sys: number, dia: number) => {
    const status = classifyBP(sys, dia)
    switch (status) {
      case 'normal': return 'bg-[#34c759]'
      case 'elevated': return 'bg-[#ff9500]'
      case 'high1': return 'bg-[#ff3b30]'
      case 'high2': return 'bg-[#af52de]'
    }
  }

  const getDateLabel = (dateStr: string) => {
    const date = new Date(dateStr)
    if (isSameDay(date, new Date())) return 'Hari Ini'
    if (isSameDay(date, new Date(Date.now() - 86400000))) return 'Kemarin'
    return formatDate(date)
  }

  const handleDelete = async (id: string) => {
    setMenuOpen(null)
    setDeleting(id)
    try {
      await deleteReading(id)
    } catch (err) {
      console.error('Delete error:', err)
    } finally {
      setDeleting(null)
    }
  }

  const filters: { value: DateFilter; label: string }[] = [
    { value: 'today', label: 'Hari Ini' },
    { value: 'week', label: '7 Hari' },
    { value: 'month', label: '30 Hari' },
    { value: 'all', label: 'Semua' },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[#86868b]">Memuat...</div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-[28px] font-bold text-[#1d1d1f]">Riwayat</h1>
        <p className="text-[#86868b] mt-1">{filteredReadings.length} catatan</p>
      </div>

      {/* Filter Pills - Blue selected */}
      <div className="flex gap-2">
        {filters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setDateFilter(filter.value)}
            className={`px-4 py-2 rounded-full text-[14px] font-medium transition-all ${
              dateFilter === filter.value
                ? 'bg-[#007aff] text-white'
                : 'bg-[#f5f5f7] text-[#1d1d1f]'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Readings List */}
      {groupedReadings.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center">
          <div className="text-[40px] mb-2">📊</div>
          <p className="text-[#86868b]">Tidak ada catatan ditemukan</p>
        </div>
      ) : (
        <div className="space-y-4">
          {groupedReadings.map(([dateKey, dayReadings]) => (
            <div key={dateKey}>
              <h2 className="text-[13px] font-semibold text-[#86868b] uppercase tracking-wide mb-2 px-1">
                {getDateLabel(dateKey)}
              </h2>
              <div className="bg-white rounded-2xl divide-y divide-[#f5f5f7]">
                {dayReadings.map((reading) => {
                  const status = classifyBP(reading.systolic, reading.diastolic)
                  const isDeleting = deleting === reading.id
                  const isMenuOpen = menuOpen === reading.id
                  return (
                    <div
                      key={reading.id}
                      className={`flex items-center justify-between p-4 ${isDeleting ? 'opacity-40' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2.5 h-2.5 rounded-full ${getStatusColor(reading.systolic, reading.diastolic)}`} />
                        <div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-[18px] font-semibold text-[#1d1d1f]">
                              {reading.systolic}/{reading.diastolic}
                            </span>
                            <span className="text-[14px] text-[#86868b]">{reading.pulse} bpm</span>
                          </div>
                          <div className="text-[13px] text-[#86868b]">
                            {formatTime(reading.timestamp.toDate())} · {getStatusLabelID(status)}
                          </div>
                        </div>
                      </div>

                      {/* 3-dot menu */}
                      <div className="relative">
                        <button
                          onClick={() => setMenuOpen(isMenuOpen ? null : reading.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f5f5f7] transition-colors"
                        >
                          <svg className="w-5 h-5 text-[#86868b]" fill="currentColor" viewBox="0 0 24 24">
                            <circle cx="12" cy="6" r="1.5" />
                            <circle cx="12" cy="12" r="1.5" />
                            <circle cx="12" cy="18" r="1.5" />
                          </svg>
                        </button>

                        {isMenuOpen && (
                          <>
                            <div
                              className="fixed inset-0 z-40"
                              onClick={() => setMenuOpen(null)}
                            />
                            <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-[#d2d2d7]/50 overflow-hidden z-50 min-w-[120px]">
                              <button
                                onClick={() => handleDelete(reading.id)}
                                className="w-full px-4 py-3 text-left text-[15px] text-[#ff3b30] hover:bg-[#f5f5f7] transition-colors"
                              >
                                Hapus
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

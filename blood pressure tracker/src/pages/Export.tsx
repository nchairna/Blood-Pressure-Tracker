import { useState, useMemo } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useBPReadings } from '@/hooks/useBPReadings'
import { calculateBPStats, formatDate } from '@/lib/bp-utils'
import { generatePDF } from '@/components/export/ExportPDF'
import { generateCSV } from '@/components/export/ExportCSV'

type DateFilter = 'week' | 'month' | 'all' | 'custom'

export default function Export() {
  const { user } = useAuth()
  const { readings, loading } = useBPReadings('all')
  const [dateFilter, setDateFilter] = useState<DateFilter>('month')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')
  const [exporting, setExporting] = useState<'pdf' | 'csv' | null>(null)

  // Calculate date range
  const dateRange = useMemo(() => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const end = new Date(today)
    end.setHours(23, 59, 59, 999)

    switch (dateFilter) {
      case 'week':
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
        return { start: weekAgo, end }
      case 'month':
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
        return { start: monthAgo, end }
      case 'custom':
        if (customStart && customEnd) {
          const start = new Date(customStart)
          const endDate = new Date(customEnd)
          endDate.setHours(23, 59, 59, 999)
          return { start, end: endDate }
        }
        return { start: new Date(2000, 0, 1), end }
      case 'all':
      default:
        return { start: new Date(2000, 0, 1), end }
    }
  }, [dateFilter, customStart, customEnd])

  // Filter readings
  const filteredReadings = useMemo(() => {
    return readings.filter((reading) => {
      const date = reading.timestamp.toDate()
      return date >= dateRange.start && date <= dateRange.end
    })
  }, [readings, dateRange])

  const stats = useMemo(() => calculateBPStats(filteredReadings), [filteredReadings])

  const handleExportPDF = async () => {
    setExporting('pdf')
    try {
      await generatePDF({
        readings: filteredReadings,
        stats,
        dateRange,
        userName: user?.displayName || user?.email || 'User',
      })
    } finally {
      setExporting(null)
    }
  }

  const handleExportCSV = async () => {
    setExporting('csv')
    try {
      await generateCSV({ readings: filteredReadings })
    } finally {
      setExporting(null)
    }
  }

  const getFilterLabel = () => {
    switch (dateFilter) {
      case 'week': return '7 hari terakhir'
      case 'month': return '30 hari terakhir'
      case 'all': return 'Semua waktu'
      case 'custom':
        if (customStart && customEnd) {
          return `${formatDate(new Date(customStart)).split(',')[0]} - ${formatDate(new Date(customEnd)).split(',')[0]}`
        }
        return 'Pilih tanggal'
    }
  }

  const filters: { value: DateFilter; label: string }[] = [
    { value: 'week', label: '7 Hari' },
    { value: 'month', label: '30 Hari' },
    { value: 'all', label: 'Semua' },
    { value: 'custom', label: 'Kustom' },
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
        <h1 className="text-[28px] font-bold text-[#1d1d1f]">Ekspor</h1>
        <p className="text-[#86868b] mt-1">Unduh data tekanan darah Anda</p>
      </div>

      {/* Date Filter - Blue selected */}
      <div className="flex gap-2 flex-wrap">
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

      {/* Custom Date Range Picker */}
      {dateFilter === 'custom' && (
        <div className="bg-white rounded-2xl p-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-[#86868b] uppercase tracking-wide mb-2">
                Dari
              </label>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                max={customEnd || new Date().toISOString().split('T')[0]}
                className="w-full bg-[#f5f5f7] border-0 rounded-xl px-4 py-3 text-[15px] text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#007aff]"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[#86868b] uppercase tracking-wide mb-2">
                Sampai
              </label>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                min={customStart}
                max={new Date().toISOString().split('T')[0]}
                className="w-full bg-[#f5f5f7] border-0 rounded-xl px-4 py-3 text-[15px] text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#007aff]"
              />
            </div>
          </div>
        </div>
      )}

      {/* Summary Card */}
      <div className="bg-white rounded-2xl p-5">
        <h2 className="text-[13px] font-semibold text-[#86868b] uppercase tracking-wide mb-4">
          Ringkasan Ekspor
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[12px] text-[#86868b] uppercase">Periode</p>
            <p className="text-[15px] font-semibold text-[#1d1d1f] mt-0.5">{getFilterLabel()}</p>
          </div>
          <div>
            <p className="text-[12px] text-[#86868b] uppercase">Catatan</p>
            <p className="text-[28px] font-bold text-[#1d1d1f] leading-none mt-0.5">{filteredReadings.length}</p>
          </div>
          <div>
            <p className="text-[12px] text-[#86868b] uppercase">Rata-rata Sistolik</p>
            <p className="text-[24px] font-bold text-[#1d1d1f] leading-none mt-0.5">
              {stats.avgSystolic > 0 ? stats.avgSystolic : '—'}
            </p>
          </div>
          <div>
            <p className="text-[12px] text-[#86868b] uppercase">Rata-rata Diastolik</p>
            <p className="text-[24px] font-bold text-[#1d1d1f] leading-none mt-0.5">
              {stats.avgDiastolic > 0 ? stats.avgDiastolic : '—'}
            </p>
          </div>
        </div>
      </div>

      {/* Export Buttons */}
      <div className="space-y-3">
        <button
          onClick={handleExportPDF}
          disabled={filteredReadings.length === 0 || exporting !== null}
          className="w-full bg-[#007aff] text-white font-semibold text-[17px] py-4 rounded-2xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {exporting === 'pdf' ? 'Membuat...' : 'Unduh Laporan PDF'}
        </button>

        <button
          onClick={handleExportCSV}
          disabled={filteredReadings.length === 0 || exporting !== null}
          className="w-full bg-white border-2 border-[#007aff] text-[#007aff] font-semibold text-[17px] py-4 rounded-2xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          {exporting === 'csv' ? 'Membuat...' : 'Unduh CSV'}
        </button>
      </div>

      {filteredReadings.length === 0 && (
        <div className="text-center py-4">
          <p className="text-[#86868b]">Tidak ada catatan dalam periode yang dipilih</p>
        </div>
      )}
    </div>
  )
}

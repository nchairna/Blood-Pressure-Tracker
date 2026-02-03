import { useAuth } from '@/hooks/useAuth'
import { useBPReadings } from '@/hooks/useBPReadings'
import { useStats, useLatestReading } from '@/hooks/useStats'
import { useGamification } from '@/hooks/useGamification'
import { classifyBP } from '@/lib/bp-utils'
import { BPChart } from '@/components/bp/BPChart'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { DateRangeOption } from '@/types'

export default function Dashboard() {
  const { user } = useAuth()
  const { readings, loading, error } = useBPReadings('all')
  const stats7d = useStats(readings, '7d')
  const latestReading = useLatestReading(readings)
  const gamification = useGamification(readings)
  const [chartRange, setChartRange] = useState<DateRangeOption>('7d')

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Pengguna'

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'text-[#34c759]'
      case 'elevated': return 'text-[#ff9500]'
      case 'high1': return 'text-[#ff3b30]'
      case 'high2': return 'text-[#af52de]'
      default: return 'text-[#86868b]'
    }
  }

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'normal': return 'bg-[#34c759]'
      case 'elevated': return 'bg-[#ff9500]'
      case 'high1': return 'bg-[#ff3b30]'
      case 'high2': return 'bg-[#af52de]'
      default: return 'bg-[#86868b]'
    }
  }

  const getStatusLabelID = (status: string) => {
    switch (status) {
      case 'normal': return 'Normal'
      case 'elevated': return 'Meningkat'
      case 'high1': return 'Tinggi Tahap 1'
      case 'high2': return 'Tinggi Tahap 2'
      default: return ''
    }
  }

  // Filter readings for chart
  const chartReadings = readings.filter((reading) => {
    const date = reading.timestamp.toDate()
    const now = new Date()
    switch (chartRange) {
      case '7d': return date >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      case '30d': return date >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      case '90d': return date >= new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
      default: return true
    }
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[#86868b]">Memuat...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center px-4">
        <div className="text-[40px] mb-2">⚠️</div>
        <p className="text-[#ff3b30] font-medium">Gagal memuat data</p>
        <p className="text-[#86868b] text-sm mt-1">Periksa koneksi internet Anda</p>
      </div>
    )
  }

  const latestStatus = latestReading ? classifyBP(latestReading.systolic, latestReading.diastolic) : null
  const avg7dStatus = stats7d.avgSystolic > 0 ? classifyBP(stats7d.avgSystolic, stats7d.avgDiastolic) : null

  const getDailyMessageID = (count: number, goal: number) => {
    if (count === 0) return 'Belum ada catatan hari ini'
    if (count < goal) return `${goal - count} lagi untuk mencapai target`
    if (count === goal) return 'Target harian tercapai!'
    return `${count} catatan hari ini - luar biasa!`
  }

  return (
    <div className="space-y-5">
      {/* Greeting */}
      <div>
        <h1 className="text-[28px] font-bold text-[#1d1d1f]">Halo, {displayName}</h1>
        <p className="text-[#86868b] mt-0.5">Ringkasan kesehatan Anda</p>
      </div>

      {/* Daily Progress Card */}
      <div className="bg-gradient-to-r from-[#007aff] to-[#5856d6] rounded-2xl p-5 text-white">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[13px] font-medium opacity-80 uppercase tracking-wide">Target Hari Ini</p>
            <p className="text-[32px] font-bold leading-none mt-1">
              {gamification.todayCount}<span className="text-[20px] opacity-70">/{gamification.todayGoal}</span>
            </p>
          </div>
          {gamification.currentStreak >= 3 && (
            <div className="text-right">
              <div className="flex items-center gap-1.5">
                <span className="text-[24px]">🔥</span>
                <span className="text-[28px] font-bold">{gamification.currentStreak}</span>
              </div>
              <p className="text-[12px] opacity-80">hari beruntun</p>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="h-2 bg-white/20 rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-white rounded-full transition-all duration-500"
            style={{ width: `${gamification.todayProgress}%` }}
          />
        </div>
        <p className="text-[13px] opacity-90">
          {getDailyMessageID(gamification.todayCount, gamification.todayGoal)}
        </p>

        {gamification.todayCount < gamification.todayGoal && (
          <Link
            to="/entry"
            className="mt-3 block w-full bg-white/20 hover:bg-white/30 text-white font-medium text-[15px] py-2.5 rounded-xl text-center transition-colors"
          >
            Tambah Catatan
          </Link>
        )}
      </div>

      {/* Streak Info (when streak is 1-2 days or no streak but has best) */}
      {gamification.currentStreak > 0 && gamification.currentStreak < 3 && (
        <div className="bg-[#f5f5f7] rounded-2xl p-4 flex items-center gap-3">
          <span className="text-[24px]">⚡</span>
          <div>
            <p className="text-[15px] font-medium text-[#1d1d1f]">{gamification.currentStreak} hari beruntun</p>
            <p className="text-[13px] text-[#86868b]">3 hari lagi untuk mendapat 🔥</p>
          </div>
        </div>
      )}

      {gamification.currentStreak === 0 && gamification.bestStreak > 0 && (
        <div className="bg-[#f5f5f7] rounded-2xl p-4 flex items-center gap-3">
          <span className="text-[24px]">🎯</span>
          <div>
            <p className="text-[15px] font-medium text-[#1d1d1f]">Rekor terbaik: {gamification.bestStreak} hari</p>
            <p className="text-[13px] text-[#86868b]">Catat 3x sehari untuk membangun streak</p>
          </div>
        </div>
      )}

      {/* Latest Reading Card */}
      <div className="bg-white rounded-2xl p-5">
        <p className="text-[13px] font-medium text-[#86868b] uppercase tracking-wide">Catatan Terakhir</p>
        {latestReading ? (
          <div className="mt-2">
            <p className="text-[42px] font-bold text-[#1d1d1f] leading-none">
              {latestReading.systolic}<span className="text-[24px] text-[#86868b]">/</span>{latestReading.diastolic}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <div className={`w-2 h-2 rounded-full ${getStatusBg(latestStatus || '')}`} />
              <span className={`text-[14px] font-medium ${getStatusColor(latestStatus || '')}`}>
                {latestStatus ? getStatusLabelID(latestStatus) : ''}
              </span>
              <span className="text-[14px] text-[#86868b]">· {latestReading.pulse} bpm</span>
            </div>
          </div>
        ) : (
          <p className="text-[17px] text-[#86868b] mt-3">Belum ada catatan</p>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl p-4">
          <p className="text-[12px] font-medium text-[#86868b] uppercase tracking-wide">Rata-rata 7 Hari</p>
          {stats7d.avgSystolic > 0 ? (
            <>
              <p className="text-[24px] font-bold text-[#1d1d1f] mt-1">
                {stats7d.avgSystolic}/{stats7d.avgDiastolic}
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <div className={`w-1.5 h-1.5 rounded-full ${getStatusBg(avg7dStatus || '')}`} />
                <span className={`text-[12px] font-medium ${getStatusColor(avg7dStatus || '')}`}>
                  {avg7dStatus ? getStatusLabelID(avg7dStatus) : ''}
                </span>
              </div>
            </>
          ) : (
            <p className="text-[15px] text-[#86868b] mt-2">Belum ada data</p>
          )}
        </div>

        <div className="bg-white rounded-2xl p-4">
          <p className="text-[12px] font-medium text-[#86868b] uppercase tracking-wide">Rata-rata Nadi</p>
          {stats7d.avgPulse > 0 ? (
            <>
              <p className="text-[24px] font-bold text-[#1d1d1f] mt-1">{stats7d.avgPulse}</p>
              <p className="text-[12px] text-[#86868b] mt-1">bpm (7 hari)</p>
            </>
          ) : (
            <p className="text-[15px] text-[#86868b] mt-2">Belum ada data</p>
          )}
        </div>

        <div className="bg-white rounded-2xl p-4">
          <p className="text-[12px] font-medium text-[#86868b] uppercase tracking-wide">Total</p>
          <p className="text-[24px] font-bold text-[#1d1d1f] mt-1">{gamification.totalReadings}</p>
          <p className="text-[12px] text-[#86868b] mt-1">catatan</p>
        </div>

        <div className="bg-white rounded-2xl p-4">
          <p className="text-[12px] font-medium text-[#86868b] uppercase tracking-wide">Hari Sempurna</p>
          <p className="text-[24px] font-bold text-[#1d1d1f] mt-1">{gamification.perfectDays}</p>
          <p className="text-[12px] text-[#86868b] mt-1">3+ catatan</p>
        </div>
      </div>

      {/* Chart */}
      {readings.length > 0 && (
        <div className="bg-white rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[15px] font-semibold text-[#1d1d1f]">Tren</h2>
            <div className="flex gap-1 bg-[#f5f5f7] rounded-lg p-0.5">
              {(['7d', '30d', '90d'] as DateRangeOption[]).map((range) => (
                <button
                  key={range}
                  onClick={() => setChartRange(range)}
                  className={`px-2.5 py-1 rounded-md text-[12px] font-medium transition-all ${
                    chartRange === range
                      ? 'bg-white text-[#1d1d1f] shadow-sm'
                      : 'text-[#86868b]'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
          <BPChart readings={chartReadings} height={180} />
        </div>
      )}

      {/* BP Categories - Cleaner */}
      <div className="bg-white rounded-2xl p-4">
        <h2 className="text-[13px] font-semibold text-[#86868b] uppercase tracking-wide mb-3">Panduan Tekanan Darah</h2>
        <div className="space-y-2.5">
          {[
            { color: '#34c759', label: 'Normal', sys: '<120', dia: '<80' },
            { color: '#ff9500', label: 'Meningkat', sys: '120-129', dia: '<80' },
            { color: '#ff3b30', label: 'Tinggi Tahap 1', sys: '130-139', dia: '80-89' },
            { color: '#af52de', label: 'Tinggi Tahap 2', sys: '≥140', dia: '≥90' },
          ].map((item) => (
            <div key={item.label} className="flex items-center">
              <div
                className="w-3 h-3 rounded-full mr-3"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-[14px] font-medium text-[#1d1d1f] flex-1">{item.label}</span>
              <span className="text-[13px] text-[#86868b] tabular-nums">{item.sys}</span>
              <span className="text-[13px] text-[#86868b] mx-1">/</span>
              <span className="text-[13px] text-[#86868b] tabular-nums">{item.dia}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { useBPReadings, useTodayReadings } from '@/hooks/useBPReadings'
import { classifyBP, formatTime, getCurrentTimeOfDay } from '@/lib/bp-utils'
import type { BPReadingFormData } from '@/types'

const DAILY_GOAL = 3

const getStatusLabelID = (status: string) => {
  switch (status) {
    case 'normal': return 'Normal'
    case 'elevated': return 'Meningkat'
    case 'high1': return 'Tinggi Tahap 1'
    case 'high2': return 'Tinggi Tahap 2'
    default: return ''
  }
}

const getTimeOfDayLabelID = (timeOfDay: string) => {
  switch (timeOfDay) {
    case 'morning': return 'Pagi'
    case 'afternoon': return 'Siang'
    case 'evening': return 'Malam'
    default: return ''
  }
}

export default function Entry() {
  const [systolic, setSystolic] = useState('')
  const [diastolic, setDiastolic] = useState('')
  const [pulse, setPulse] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const { addReading, deleteReading } = useBPReadings()
  const { readings: todayReadings, loading: loadingToday } = useTodayReadings()

  const todayCount = todayReadings.length
  const todayProgress = Math.min(100, (todayCount / DAILY_GOAL) * 100)
  const remaining = Math.max(0, DAILY_GOAL - todayCount)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    const sys = parseInt(systolic)
    const dia = parseInt(diastolic)
    const pul = parseInt(pulse)

    // Validation
    if (isNaN(sys) || sys < 60 || sys > 250) {
      setError('Sistolik harus antara 60-250')
      return
    }
    if (isNaN(dia) || dia < 40 || dia > 150) {
      setError('Diastolik harus antara 40-150')
      return
    }
    if (isNaN(pul) || pul < 40 || pul > 200) {
      setError('Nadi harus antara 40-200')
      return
    }

    setSaving(true)

    try {
      const now = new Date()
      const data: BPReadingFormData = {
        systolic: sys,
        diastolic: dia,
        pulse: pul,
        timeOfDay: getCurrentTimeOfDay(),
        date: now,
        notes: notes.trim() || undefined,
      }
      await addReading(data)
      setSuccess(true)
      setSystolic('')
      setDiastolic('')
      setPulse('')
      setNotes('')
      setTimeout(() => setSuccess(false), 2000)
    } catch (err) {
      console.error('Save error:', err)
      setError('Gagal menyimpan. Periksa koneksi internet.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    setMenuOpen(null)
    setDeleting(id)
    try {
      await deleteReading(id)
    } catch (err) {
      console.error('Delete error:', err)
      setError('Gagal menghapus')
    } finally {
      setDeleting(null)
    }
  }

  const getStatusColor = (sys: number, dia: number) => {
    const status = classifyBP(sys, dia)
    switch (status) {
      case 'normal': return 'bg-[#34c759]'
      case 'elevated': return 'bg-[#ff9500]'
      case 'high1': return 'bg-[#ff3b30]'
      case 'high2': return 'bg-[#af52de]'
    }
  }

  // Preview status while typing
  const previewStatus = systolic && diastolic
    ? classifyBP(parseInt(systolic) || 0, parseInt(diastolic) || 0)
    : null

  return (
    <div className="space-y-5">
      {/* Header with Progress */}
      <div>
        <h1 className="text-[28px] font-bold text-[#1d1d1f]">Tambah Catatan</h1>
        <p className="text-[#86868b] mt-0.5">{getTimeOfDayLabelID(getCurrentTimeOfDay())}</p>
      </div>

      {/* Daily Progress Mini */}
      <div className="bg-[#f5f5f7] rounded-xl p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[13px] font-medium text-[#1d1d1f]">
            Hari ini: {todayCount}/{DAILY_GOAL}
          </span>
          {todayCount >= DAILY_GOAL ? (
            <span className="text-[12px] font-medium text-[#34c759]">Target tercapai! ✓</span>
          ) : (
            <span className="text-[12px] text-[#86868b]">{remaining} lagi</span>
          )}
        </div>
        <div className="h-1.5 bg-[#e5e5e5] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              todayCount >= DAILY_GOAL ? 'bg-[#34c759]' : 'bg-[#007aff]'
            }`}
            style={{ width: `${todayProgress}%` }}
          />
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-[#34c759] text-white text-[15px] px-4 py-3 rounded-xl text-center font-medium flex items-center justify-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Tersimpan!
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-[#ff3b30]/10 text-[#ff3b30] text-[15px] px-4 py-3 rounded-xl text-center font-medium">
          {error}
        </div>
      )}

      {/* Form Card */}
      <div className="bg-white rounded-2xl p-5">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* BP Inputs */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[12px] font-semibold text-[#86868b] uppercase tracking-wide mb-2 text-center">
                SIS
              </label>
              <input
                type="number"
                inputMode="numeric"
                value={systolic}
                onChange={(e) => setSystolic(e.target.value)}
                placeholder="120"
                required
                className="w-full bg-[#f5f5f7] border-0 rounded-xl px-2 py-4 text-[28px] font-bold text-center text-[#1d1d1f] placeholder-[#c7c7cc] focus:outline-none focus:ring-2 focus:ring-[#007aff] focus:bg-white transition-all"
              />
              <p className="text-[10px] text-[#86868b] text-center mt-1">mmHg</p>
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-[#86868b] uppercase tracking-wide mb-2 text-center">
                DIA
              </label>
              <input
                type="number"
                inputMode="numeric"
                value={diastolic}
                onChange={(e) => setDiastolic(e.target.value)}
                placeholder="80"
                required
                className="w-full bg-[#f5f5f7] border-0 rounded-xl px-2 py-4 text-[28px] font-bold text-center text-[#1d1d1f] placeholder-[#c7c7cc] focus:outline-none focus:ring-2 focus:ring-[#007aff] focus:bg-white transition-all"
              />
              <p className="text-[10px] text-[#86868b] text-center mt-1">mmHg</p>
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-[#86868b] uppercase tracking-wide mb-2 text-center">
                Nadi
              </label>
              <input
                type="number"
                inputMode="numeric"
                value={pulse}
                onChange={(e) => setPulse(e.target.value)}
                placeholder="72"
                required
                className="w-full bg-[#f5f5f7] border-0 rounded-xl px-2 py-4 text-[28px] font-bold text-center text-[#1d1d1f] placeholder-[#c7c7cc] focus:outline-none focus:ring-2 focus:ring-[#007aff] focus:bg-white transition-all"
              />
              <p className="text-[10px] text-[#86868b] text-center mt-1">bpm</p>
            </div>
          </div>

          {/* Live Preview */}
          {previewStatus && (
            <div className="flex items-center justify-center gap-2 py-1">
              <div className={`w-2.5 h-2.5 rounded-full ${getStatusColor(parseInt(systolic), parseInt(diastolic))}`} />
              <span className="text-[14px] font-medium text-[#1d1d1f]">
                {getStatusLabelID(previewStatus)}
              </span>
            </div>
          )}

          {/* Notes - Collapsed by default */}
          <details className="group">
            <summary className="text-[13px] text-[#007aff] font-medium cursor-pointer list-none flex items-center gap-1">
              <svg className="w-4 h-4 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
              Tambah catatan
            </summary>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Bagaimana perasaan Anda?"
              rows={2}
              className="mt-3 w-full bg-[#f5f5f7] border-0 rounded-xl px-4 py-3 text-[16px] text-[#1d1d1f] placeholder-[#86868b] focus:outline-none focus:ring-2 focus:ring-[#007aff] focus:bg-white transition-all resize-none"
            />
          </details>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-[#007aff] text-white font-semibold text-[17px] py-4 rounded-xl active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </form>
      </div>

      {/* Today's Readings */}
      <div>
        <h2 className="text-[13px] font-semibold text-[#86868b] uppercase tracking-wide mb-2 px-1">
          Hari Ini ({todayReadings.length})
        </h2>

        {loadingToday ? (
          <div className="bg-white rounded-2xl p-6 text-center text-[#86868b]">
            Memuat...
          </div>
        ) : todayReadings.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center">
            <p className="text-[#86868b]">Belum ada catatan hari ini</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl divide-y divide-[#f5f5f7]">
            {todayReadings.map((reading) => {
              const status = classifyBP(reading.systolic, reading.diastolic)
              const isDeleting = deleting === reading.id
              const isMenuOpen = menuOpen === reading.id
              return (
                <div key={reading.id} className={`flex items-center justify-between p-4 ${isDeleting ? 'opacity-40' : ''}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${getStatusColor(reading.systolic, reading.diastolic)}`} />
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-[18px] font-semibold text-[#1d1d1f]">
                          {reading.systolic}/{reading.diastolic}
                        </span>
                        <span className="text-[14px] text-[#86868b]">{reading.pulse}</span>
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
        )}
      </div>
    </div>
  )
}

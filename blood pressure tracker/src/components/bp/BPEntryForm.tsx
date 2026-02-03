import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import {
  isValidSystolic,
  isValidDiastolic,
  isValidPulse,
  getSuggestedTimeOfDay,
} from '@/lib/bp-utils'
import type { BPReading, BPReadingFormData, TimeOfDay } from '@/types'

interface BPEntryFormProps {
  onSubmit: (data: BPReadingFormData) => Promise<void>
  initialData?: BPReading
  onCancel?: () => void
}

export function BPEntryForm({ onSubmit, initialData, onCancel }: BPEntryFormProps) {
  const [systolic, setSystolic] = useState('')
  const [diastolic, setDiastolic] = useState('')
  const [pulse, setPulse] = useState('')
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(getSuggestedTimeOfDay())
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (initialData) {
      setSystolic(initialData.systolic.toString())
      setDiastolic(initialData.diastolic.toString())
      setPulse(initialData.pulse.toString())
      setTimeOfDay(initialData.timeOfDay)
      setDate(initialData.timestamp.toDate().toISOString().split('T')[0])
      setNotes(initialData.notes || '')
    }
  }, [initialData])

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    const systolicNum = parseInt(systolic)
    const diastolicNum = parseInt(diastolic)
    const pulseNum = parseInt(pulse)

    if (!systolic || isNaN(systolicNum)) {
      newErrors.systolic = 'Please enter a valid number'
    } else if (!isValidSystolic(systolicNum)) {
      newErrors.systolic = 'Must be between 60 and 250'
    }

    if (!diastolic || isNaN(diastolicNum)) {
      newErrors.diastolic = 'Please enter a valid number'
    } else if (!isValidDiastolic(diastolicNum)) {
      newErrors.diastolic = 'Must be between 40 and 150'
    }

    if (!pulse || isNaN(pulseNum)) {
      newErrors.pulse = 'Please enter a valid number'
    } else if (!isValidPulse(pulseNum)) {
      newErrors.pulse = 'Must be between 40 and 200'
    }

    if (!date) {
      newErrors.date = 'Please select a date'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    setLoading(true)

    try {
      const formData: BPReadingFormData = {
        systolic: parseInt(systolic),
        diastolic: parseInt(diastolic),
        pulse: parseInt(pulse),
        timeOfDay,
        date: new Date(date),
        notes: notes.trim() || undefined,
      }

      await onSubmit(formData)

      // Reset form if not editing
      if (!initialData) {
        setSystolic('')
        setDiastolic('')
        setPulse('')
        setNotes('')
        setTimeOfDay(getSuggestedTimeOfDay())
        setDate(new Date().toISOString().split('T')[0])
      }
    } catch (err) {
      console.error('Error submitting reading:', err)
    } finally {
      setLoading(false)
    }
  }

  const timeOptions: { value: TimeOfDay; label: string }[] = [
    { value: 'morning', label: 'Morning' },
    { value: 'afternoon', label: 'Afternoon' },
    { value: 'evening', label: 'Evening' },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? 'Edit Reading' : 'Add Reading'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date and Time of Day */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />
              {errors.date && <p className="text-sm text-red-600">{errors.date}</p>}
            </div>
            <div className="space-y-2">
              <Label>Time of Day</Label>
              <div className="flex rounded-md border overflow-hidden">
                {timeOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setTimeOfDay(option.value)}
                    className={`flex-1 py-2 px-2 text-sm font-medium transition-colors ${
                      timeOfDay === option.value
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-background hover:bg-muted'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* BP Values */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="systolic">
                Systolic
                <span className="text-muted-foreground ml-1 text-xs">(top)</span>
              </Label>
              <Input
                id="systolic"
                type="number"
                inputMode="numeric"
                placeholder="120"
                value={systolic}
                onChange={(e) => setSystolic(e.target.value)}
                className="text-center text-lg font-semibold h-14"
              />
              {errors.systolic && <p className="text-xs text-red-600">{errors.systolic}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="diastolic">
                Diastolic
                <span className="text-muted-foreground ml-1 text-xs">(bottom)</span>
              </Label>
              <Input
                id="diastolic"
                type="number"
                inputMode="numeric"
                placeholder="80"
                value={diastolic}
                onChange={(e) => setDiastolic(e.target.value)}
                className="text-center text-lg font-semibold h-14"
              />
              {errors.diastolic && <p className="text-xs text-red-600">{errors.diastolic}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="pulse">
                Pulse
                <span className="text-muted-foreground ml-1 text-xs">(bpm)</span>
              </Label>
              <Input
                id="pulse"
                type="number"
                inputMode="numeric"
                placeholder="72"
                value={pulse}
                onChange={(e) => setPulse(e.target.value)}
                className="text-center text-lg font-semibold h-14"
              />
              {errors.pulse && <p className="text-xs text-red-600">{errors.pulse}</p>}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any notes about this reading..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          {/* Submit */}
          <div className="flex gap-2">
            {onCancel && (
              <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" className="flex-1 h-12 text-base" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Saving...
                </>
              ) : initialData ? (
                'Update Reading'
              ) : (
                'Save Reading'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

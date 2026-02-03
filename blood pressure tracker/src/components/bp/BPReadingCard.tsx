import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BPStatusBadge } from './BPStatusBadge'
import { formatTime, getTimeOfDayLabel, formatBPReading } from '@/lib/bp-utils'
import { Pencil, Trash2, Heart, MoreVertical } from 'lucide-react'
import type { BPReading } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface BPReadingCardProps {
  reading: BPReading
  onEdit?: (reading: BPReading) => void
  onDelete?: (id: string) => void
  compact?: boolean
}

export function BPReadingCard({ reading, onEdit, onDelete, compact = false }: BPReadingCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showActions, setShowActions] = useState(false)

  const handleDelete = () => {
    onDelete?.(reading.id)
    setShowDeleteConfirm(false)
  }

  const time = formatTime(reading.timestamp.toDate())
  const timeOfDayLabel = getTimeOfDayLabel(reading.timeOfDay)
  const bpValue = formatBPReading(reading.systolic, reading.diastolic)

  if (compact) {
    return (
      <div className="flex items-center justify-between py-3 px-4 border-b last:border-b-0">
        <div className="flex items-center gap-3">
          <div className="text-sm text-muted-foreground w-20">{time}</div>
          <div className="font-semibold text-lg">{bpValue}</div>
          <div className="text-sm text-muted-foreground">{reading.pulse} bpm</div>
        </div>
        <div className="flex items-center gap-2">
          <BPStatusBadge systolic={reading.systolic} diastolic={reading.diastolic} />
          {(onEdit || onDelete) && (
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setShowActions(!showActions)}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
              {showActions && (
                <div className="absolute right-0 top-full mt-1 bg-white border rounded-md shadow-lg z-10 min-w-[120px]">
                  {onEdit && (
                    <button
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                      onClick={() => {
                        onEdit(reading)
                        setShowActions(false)
                      }}
                    >
                      <Pencil className="h-4 w-4" /> Edit
                    </button>
                  )}
                  {onDelete && (
                    <button
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 text-red-600 flex items-center gap-2"
                      onClick={() => {
                        setShowDeleteConfirm(true)
                        setShowActions(false)
                      }}
                    >
                      <Trash2 className="h-4 w-4" /> Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Reading</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this reading? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{time}</span>
            <span>•</span>
            <span>{timeOfDayLabel}</span>
          </div>
          <BPStatusBadge systolic={reading.systolic} diastolic={reading.diastolic} />
        </div>

        <div className="flex items-center gap-4 mb-3">
          <div className="flex-1">
            <div className="text-3xl font-bold">{bpValue}</div>
            <div className="text-sm text-muted-foreground">mmHg</div>
          </div>
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            <div>
              <div className="text-xl font-semibold">{reading.pulse}</div>
              <div className="text-sm text-muted-foreground">bpm</div>
            </div>
          </div>
        </div>

        {reading.notes && (
          <p className="text-sm text-muted-foreground mb-3 bg-muted p-2 rounded">
            {reading.notes}
          </p>
        )}

        {(onEdit || onDelete) && (
          <div className="flex gap-2 pt-2 border-t">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => onEdit(reading)}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
          </div>
        )}
      </CardContent>

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Reading</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this reading? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

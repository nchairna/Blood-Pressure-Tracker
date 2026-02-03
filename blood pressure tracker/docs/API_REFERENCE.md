# API Reference

This document describes the hooks, utilities, and components available in the Blood Pressure Tracker.

---

## Hooks

### `useAuth`

Access authentication state and methods.

**Location:** `src/hooks/useAuth.ts`

**Returns:**
```typescript
{
  user: User | null         // Firebase user object or null if not logged in
  loading: boolean          // True while checking auth state
  login: (email, password) => Promise<void>
  register: (email, password, displayName) => Promise<void>
  logout: () => Promise<void>
}
```

**Usage:**
```tsx
import { useAuth } from '@/hooks/useAuth'

function MyComponent() {
  const { user, loading, logout } = useAuth()

  if (loading) return <div>Loading...</div>
  if (!user) return <div>Please log in</div>

  return (
    <div>
      <p>Hello, {user.displayName}</p>
      <button onClick={logout}>Sign Out</button>
    </div>
  )
}
```

---

### `useBPReadings`

CRUD operations for blood pressure readings.

**Location:** `src/hooks/useBPReadings.ts`

**Parameters:**
```typescript
useBPReadings(dateRangeOption?: '7d' | '30d' | '90d' | 'all')
```

**Returns:**
```typescript
{
  readings: BPReading[]     // Array of readings (sorted by date desc)
  loading: boolean          // True while fetching
  error: string | null      // Error message if fetch failed
  addReading: (data: BPReadingFormData) => Promise<void>
  updateReading: (id: string, data: Partial<BPReadingFormData>) => Promise<void>
  deleteReading: (id: string) => Promise<void>
}
```

**Usage:**
```tsx
import { useBPReadings } from '@/hooks/useBPReadings'

function MyComponent() {
  const { readings, loading, addReading, deleteReading } = useBPReadings('30d')

  const handleAdd = async () => {
    await addReading({
      systolic: 120,
      diastolic: 80,
      pulse: 72,
      timeOfDay: 'morning',
      date: new Date(),
      notes: 'Feeling good'
    })
  }

  const handleDelete = async (id: string) => {
    await deleteReading(id)
  }

  if (loading) return <div>Loading...</div>

  return (
    <ul>
      {readings.map(r => (
        <li key={r.id}>
          {r.systolic}/{r.diastolic}
          <button onClick={() => handleDelete(r.id)}>Delete</button>
        </li>
      ))}
    </ul>
  )
}
```

---

### `useTodayReadings`

Get only today's readings.

**Location:** `src/hooks/useBPReadings.ts`

**Returns:**
```typescript
{
  readings: BPReading[]     // Today's readings only
  loading: boolean
}
```

**Usage:**
```tsx
import { useTodayReadings } from '@/hooks/useBPReadings'

function TodayWidget() {
  const { readings, loading } = useTodayReadings()

  return (
    <div>
      <h3>Today's Readings: {readings.length}</h3>
    </div>
  )
}
```

---

### `useStats`

Calculate statistics from readings.

**Location:** `src/hooks/useStats.ts`

**Parameters:**
```typescript
useStats(readings: BPReading[], dateRangeOption: '7d' | '30d' | '90d' | 'all')
```

**Returns:**
```typescript
{
  avgSystolic: number       // Average systolic (0 if no data)
  avgDiastolic: number      // Average diastolic (0 if no data)
  avgPulse: number          // Average pulse (0 if no data)
  readingsCount: number     // Number of readings in range
}
```

**Usage:**
```tsx
import { useBPReadings } from '@/hooks/useBPReadings'
import { useStats } from '@/hooks/useStats'

function StatsDisplay() {
  const { readings } = useBPReadings('all')
  const stats7d = useStats(readings, '7d')
  const stats30d = useStats(readings, '30d')

  return (
    <div>
      <p>7-Day Average: {stats7d.avgSystolic}/{stats7d.avgDiastolic}</p>
      <p>30-Day Average: {stats30d.avgSystolic}/{stats30d.avgDiastolic}</p>
    </div>
  )
}
```

---

### `useLatestReading`

Get the most recent reading.

**Location:** `src/hooks/useStats.ts`

**Parameters:**
```typescript
useLatestReading(readings: BPReading[])
```

**Returns:**
```typescript
BPReading | null
```

---

### `useWeeklyReadingsCount`

Count readings from the last 7 days.

**Location:** `src/hooks/useStats.ts`

**Parameters:**
```typescript
useWeeklyReadingsCount(readings: BPReading[])
```

**Returns:**
```typescript
number
```

---

## Utility Functions

### BP Classification

**Location:** `src/lib/bp-utils.ts`

#### `classifyBP(systolic, diastolic)`

Classify blood pressure according to AHA guidelines.

```typescript
classifyBP(systolic: number, diastolic: number): 'normal' | 'elevated' | 'high1' | 'high2'
```

| Status | Systolic | Diastolic |
|--------|----------|-----------|
| `normal` | < 120 | < 80 |
| `elevated` | 120-129 | < 80 |
| `high1` | 130-139 | 80-89 |
| `high2` | >= 140 | >= 90 |

```tsx
import { classifyBP } from '@/lib/bp-utils'

classifyBP(115, 75)  // 'normal'
classifyBP(125, 78)  // 'elevated'
classifyBP(135, 85)  // 'high1'
classifyBP(150, 95)  // 'high2'
```

#### `getBPStatusLabel(status)`

Get human-readable label for status.

```typescript
getBPStatusLabel(status: BPStatus): string
```

```tsx
getBPStatusLabel('normal')    // 'Normal'
getBPStatusLabel('elevated')  // 'Elevated'
getBPStatusLabel('high1')     // 'High Stage 1'
getBPStatusLabel('high2')     // 'High Stage 2'
```

#### `getBPStatusColor(status)`

Get Tailwind CSS classes for status color.

```typescript
getBPStatusColor(status: BPStatus): string
```

```tsx
getBPStatusColor('normal')   // 'bg-green-500 text-white'
getBPStatusColor('elevated') // 'bg-yellow-500 text-white'
getBPStatusColor('high1')    // 'bg-orange-500 text-white'
getBPStatusColor('high2')    // 'bg-red-500 text-white'
```

---

### Validation Functions

#### `isValidSystolic(value)`
```typescript
isValidSystolic(value: number): boolean  // 60-250 range
```

#### `isValidDiastolic(value)`
```typescript
isValidDiastolic(value: number): boolean  // 40-150 range
```

#### `isValidPulse(value)`
```typescript
isValidPulse(value: number): boolean  // 40-200 range
```

---

### Formatting Functions

#### `formatBPReading(systolic, diastolic)`
```typescript
formatBPReading(120, 80)  // '120/80'
```

#### `formatDate(date)`
```typescript
formatDate(new Date())  // 'Jan 15, 2024'
```

#### `formatTime(date)`
```typescript
formatTime(new Date())  // '9:30 AM'
```

#### `formatDateTime(date)`
```typescript
formatDateTime(new Date())  // 'Jan 15, 2024 at 9:30 AM'
```

---

### Date Functions

#### `getDateRange(option)`

Get start and end dates for a range option.

```typescript
getDateRange(option: '7d' | '30d' | '90d' | 'all'): { start: Date, end: Date }
```

#### `getSuggestedTimeOfDay()`

Get suggested time of day based on current hour.

```typescript
getSuggestedTimeOfDay(): 'morning' | 'afternoon' | 'evening'
// Before 12pm → 'morning'
// 12pm - 6pm → 'afternoon'
// After 6pm → 'evening'
```

#### `isToday(date)`
```typescript
isToday(date: Date): boolean
```

#### `isSameDay(date1, date2)`
```typescript
isSameDay(date1: Date, date2: Date): boolean
```

---

## Types

**Location:** `src/types/index.ts`

### `BPReading`

```typescript
interface BPReading {
  id: string
  userId: string
  systolic: number        // 60-250 mmHg
  diastolic: number       // 40-150 mmHg
  pulse: number           // 40-200 bpm
  timestamp: Timestamp    // Firebase Timestamp
  timeOfDay: 'morning' | 'afternoon' | 'evening'
  notes?: string
  createdAt: Timestamp
}
```

### `BPReadingFormData`

```typescript
interface BPReadingFormData {
  systolic: number
  diastolic: number
  pulse: number
  timeOfDay: 'morning' | 'afternoon' | 'evening'
  date: Date
  notes?: string
}
```

### `BPStats`

```typescript
interface BPStats {
  avgSystolic: number
  avgDiastolic: number
  avgPulse: number
  readingsCount: number
}
```

### `BPStatus`

```typescript
type BPStatus = 'normal' | 'elevated' | 'high1' | 'high2'
```

### `TimeOfDay`

```typescript
type TimeOfDay = 'morning' | 'afternoon' | 'evening'
```

### `DateRangeOption`

```typescript
type DateRangeOption = '7d' | '30d' | '90d' | 'all'
```

---

## Components

### `BPEntryForm`

Form for adding/editing BP readings.

**Location:** `src/components/bp/BPEntryForm.tsx`

**Props:**
```typescript
{
  onSubmit: (data: BPReadingFormData) => Promise<void>
  initialData?: BPReading    // For editing existing reading
  onCancel?: () => void      // Show cancel button
}
```

---

### `BPReadingCard`

Display a single BP reading.

**Location:** `src/components/bp/BPReadingCard.tsx`

**Props:**
```typescript
{
  reading: BPReading
  onEdit?: (reading: BPReading) => void
  onDelete?: (id: string) => void
  compact?: boolean          // Compact list view
}
```

---

### `BPStatusBadge`

Colored badge showing BP status.

**Location:** `src/components/bp/BPStatusBadge.tsx`

**Props:**
```typescript
{
  systolic: number
  diastolic: number
  className?: string
  showLabel?: boolean        // Show text label
}
```

---

### `BPChart`

Line chart showing BP trends over time.

**Location:** `src/components/bp/BPChart.tsx`

**Props:**
```typescript
{
  readings: BPReading[]
  showPulse?: boolean        // Include pulse line
  height?: number            // Chart height in pixels
}
```

---

### `StatsCard`

Dashboard card showing BP statistics.

**Location:** `src/components/dashboard/StatsCard.tsx`

**Props:**
```typescript
{
  title: string
  systolic?: number
  diastolic?: number
  pulse?: number
  showStatus?: boolean
  subtitle?: string
  className?: string
}
```

---

### `TrendChart`

Dashboard chart with date range selector.

**Location:** `src/components/dashboard/TrendChart.tsx`

**Props:**
```typescript
{
  readings: BPReading[]
  title?: string
}
```

---

## Export Functions

### `generatePDF`

Generate and download PDF report.

**Location:** `src/components/export/ExportPDF.tsx`

```typescript
generatePDF({
  readings: BPReading[]
  stats: BPStats
  dateRange: { start: Date, end: Date }
  userName: string
}): void
```

---

### `generateCSV`

Generate and download CSV file.

**Location:** `src/components/export/ExportCSV.tsx`

```typescript
generateCSV({
  readings: BPReading[]
}): void
```

---

## Firebase Services

**Location:** `src/lib/firebase.ts`

### `auth`

Firebase Authentication instance.

```typescript
import { auth } from '@/lib/firebase'
```

### `db`

Firestore Database instance.

```typescript
import { db } from '@/lib/firebase'
```

---

## UI Components

The `src/components/ui/` folder contains shadcn-style base components:

| Component | Purpose |
|-----------|---------|
| `Button` | Clickable button with variants |
| `Input` | Text input field |
| `Label` | Form labels |
| `Card` | Content container |
| `Dialog` | Modal dialogs |
| `Select` | Dropdown select |
| `Tabs` | Tab navigation |
| `Textarea` | Multi-line text input |
| `Skeleton` | Loading placeholder |

All UI components accept a `className` prop for additional styling.

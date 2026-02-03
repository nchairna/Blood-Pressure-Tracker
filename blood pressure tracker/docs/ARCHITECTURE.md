# Project Architecture

This document explains how the Blood Pressure Tracker codebase is organized.

---

## Directory Structure

```
blood-pressure-tracker/
├── docs/                      # Documentation
├── public/                    # Static assets (favicon, etc.)
├── src/
│   ├── components/
│   │   ├── ui/                # Base UI components (shadcn-style)
│   │   ├── layout/            # App layout components
│   │   ├── bp/                # Blood pressure specific components
│   │   ├── dashboard/         # Dashboard widgets
│   │   └── export/            # Export functionality
│   ├── contexts/              # React Context providers
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utilities and configurations
│   ├── pages/                 # Page components (routes)
│   ├── types/                 # TypeScript type definitions
│   ├── App.tsx                # Main app component with routing
│   ├── main.tsx               # App entry point
│   └── index.css              # Global styles (Tailwind)
├── .env.local                 # Environment variables (Firebase config)
├── .env.local.example         # Template for environment variables
├── index.html                 # HTML entry point
├── package.json               # Dependencies and scripts
├── tsconfig.json              # TypeScript configuration
├── vite.config.ts             # Vite build configuration
└── postcss.config.js          # PostCSS/Tailwind configuration
```

---

## Core Concepts

### 1. Pages (Routes)

Each page is a full-screen view accessible via URL:

| Path | Component | Description |
|------|-----------|-------------|
| `/login` | `Login.tsx` | User login form |
| `/register` | `Register.tsx` | New user registration |
| `/dashboard` | `Dashboard.tsx` | Stats and charts |
| `/entry` | `Entry.tsx` | Add/edit BP readings |
| `/history` | `History.tsx` | View all readings |
| `/export` | `Export.tsx` | Download data |

### 2. Components

Components are reusable UI pieces:

```
components/
├── ui/              # Generic, reusable (Button, Input, Card...)
├── layout/          # App structure (Layout, BottomNav)
├── bp/              # Domain-specific (BPEntryForm, BPChart...)
├── dashboard/       # Dashboard widgets (StatsCard, TrendChart)
└── export/          # Export helpers (ExportPDF, ExportCSV)
```

### 3. Hooks

Custom React hooks encapsulate logic:

| Hook | Purpose |
|------|---------|
| `useAuth` | Access auth state and methods |
| `useBPReadings` | CRUD operations for readings |
| `useTodayReadings` | Get readings from today only |
| `useStats` | Calculate BP statistics |

### 4. Contexts

React Context provides global state:

| Context | Provides |
|---------|----------|
| `AuthContext` | User object, login/logout/register methods |

---

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                        User Interface                        │
│  ┌─────────┐  ┌───────────┐  ┌─────────┐  ┌──────────┐     │
│  │  Entry  │  │ Dashboard │  │ History │  │  Export  │     │
│  └────┬────┘  └─────┬─────┘  └────┬────┘  └────┬─────┘     │
│       │             │             │             │            │
│       └─────────────┼─────────────┼─────────────┘            │
│                     │             │                          │
│              ┌──────▼──────┐     │                          │
│              │    Hooks    │◄────┘                          │
│              │useBPReadings│                                │
│              │  useStats   │                                │
│              └──────┬──────┘                                │
└─────────────────────┼───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    Firebase SDK                              │
│  ┌──────────────────┐  ┌────────────────────────────────┐  │
│  │  Firebase Auth   │  │     Firestore Database         │  │
│  │                  │  │                                │  │
│  │ - Login          │  │  Collections:                  │  │
│  │ - Register       │  │  - users/{userId}              │  │
│  │ - Session        │  │  - readings/{readingId}        │  │
│  └──────────────────┘  └────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Files Explained

### `src/App.tsx`
The main component that sets up:
- `AuthProvider` - Wraps app with authentication context
- `BrowserRouter` - Enables client-side routing
- `Routes` - Defines URL to component mapping
- `ProtectedRoute` - Redirects to login if not authenticated

### `src/contexts/AuthContext.tsx`
Manages user authentication state:
- Listens to Firebase auth state changes
- Provides `user`, `loading`, `login`, `register`, `logout`
- Creates user document in Firestore on registration

### `src/hooks/useBPReadings.ts`
Main data hook providing:
- `readings` - Array of BP readings
- `loading` - Boolean for loading state
- `addReading` - Create new reading
- `updateReading` - Edit existing reading
- `deleteReading` - Remove reading

### `src/lib/firebase.ts`
Firebase initialization:
- Reads config from environment variables
- Initializes Firebase app
- Exports `auth` and `db` instances

### `src/lib/bp-utils.ts`
Blood pressure utilities:
- `classifyBP()` - Determine status (normal/elevated/high)
- `calculateBPStats()` - Compute averages
- `formatDate/Time()` - Format display strings
- Validation functions for input ranges

### `src/types/index.ts`
TypeScript interfaces:
```typescript
interface BPReading {
  id: string
  userId: string
  systolic: number
  diastolic: number
  pulse: number
  timestamp: Timestamp
  timeOfDay: 'morning' | 'afternoon' | 'evening'
  notes?: string
  createdAt: Timestamp
}
```

---

## Component Hierarchy

```
App
├── AuthProvider
│   └── BrowserRouter
│       └── Routes
│           ├── /login → Login
│           ├── /register → Register
│           └── ProtectedRoute
│               └── Layout
│                   ├── Header (with logout)
│                   ├── Outlet (renders child routes)
│                   │   ├── /dashboard → Dashboard
│                   │   │   ├── StatsCard (x4)
│                   │   │   └── TrendChart
│                   │   │       └── BPChart
│                   │   ├── /entry → Entry
│                   │   │   ├── BPEntryForm
│                   │   │   └── BPReadingCard (list)
│                   │   ├── /history → History
│                   │   │   └── BPReadingCard (grouped)
│                   │   └── /export → Export
│                   └── BottomNav
```

---

## Styling Architecture

### Tailwind CSS v4

This project uses Tailwind CSS v4 with the new CSS-first configuration:

```css
/* src/index.css */
@import "tailwindcss";

@theme {
  --color-primary: hsl(221.2 83.2% 53.3%);
  --color-background: hsl(0 0% 100%);
  /* ... more theme variables */
}
```

### Component Styling Pattern

Components use the `cn()` utility to merge Tailwind classes:

```tsx
import { cn } from '@/lib/utils'

function Button({ className, ...props }) {
  return (
    <button
      className={cn(
        'px-4 py-2 rounded bg-primary text-white',
        className
      )}
      {...props}
    />
  )
}
```

### Color System

| Variable | Usage |
|----------|-------|
| `--color-primary` | Main brand color (blue) |
| `--color-background` | Page background |
| `--color-foreground` | Main text color |
| `--color-muted` | Subtle backgrounds |
| `--color-muted-foreground` | Secondary text |
| `--color-destructive` | Delete/error actions (red) |

### BP Status Colors

| Status | Color | CSS Class |
|--------|-------|-----------|
| Normal | Green | `bg-green-500` |
| Elevated | Yellow | `bg-yellow-500` |
| High Stage 1 | Orange | `bg-orange-500` |
| High Stage 2 | Red | `bg-red-500` |

---

## State Management

### Local State (useState)
Used for component-specific state:
- Form inputs
- UI toggles (modals, dropdowns)
- Local filters

### Context State (useContext)
Used for app-wide state:
- Current user (`AuthContext`)

### Server State (Firestore)
Used for persistent data:
- BP readings
- User profiles

Firestore provides real-time sync via `onSnapshot`, so data updates automatically across tabs/devices.

---

## Error Handling Pattern

```tsx
const [error, setError] = useState<string | null>(null)
const [loading, setLoading] = useState(false)

const handleSubmit = async () => {
  setError(null)
  setLoading(true)

  try {
    await someAsyncOperation()
  } catch (err) {
    setError('Something went wrong. Please try again.')
    console.error(err)
  } finally {
    setLoading(false)
  }
}
```

---

## Adding New Features

### Adding a New Page

1. Create page component in `src/pages/NewPage.tsx`
2. Add route in `src/App.tsx`:
   ```tsx
   <Route path="/new-page" element={<NewPage />} />
   ```
3. Add navigation link in `src/components/layout/BottomNav.tsx`

### Adding a New Component

1. Create component in appropriate folder:
   - Generic UI → `src/components/ui/`
   - BP-specific → `src/components/bp/`
   - Dashboard widget → `src/components/dashboard/`

2. Export from component file

3. Import and use in pages/other components

### Adding a New Hook

1. Create hook in `src/hooks/useMyHook.ts`
2. Follow naming convention: `use` prefix
3. Return object with values and functions:
   ```tsx
   export function useMyHook() {
     const [data, setData] = useState(null)
     const doSomething = () => { /* ... */ }
     return { data, doSomething }
   }
   ```

---

## TypeScript Conventions

### Interfaces vs Types
- Use `interface` for object shapes
- Use `type` for unions, tuples, primitives

### File Organization
- Types used in multiple files → `src/types/index.ts`
- Types used in one component → Define in that component file

### Import Aliases
The `@/` alias maps to `src/`:
```tsx
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
```

---

## Performance Considerations

### Code Splitting
Vite automatically code-splits on dynamic imports. Large dependencies (Firebase, Recharts, jsPDF) are bundled separately.

### Memoization
Use `useMemo` for expensive calculations:
```tsx
const stats = useMemo(() => calculateBPStats(readings), [readings])
```

### Real-time Updates
Firestore `onSnapshot` provides real-time sync but creates listeners. These are cleaned up in `useEffect` return functions.

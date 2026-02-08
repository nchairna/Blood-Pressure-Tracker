# Blood Pressure Tracker

A modern, mobile-first blood pressure tracking application built with React and Firebase. Track your health with real-time cloud sync across all your devices.

## Features

- **Quick BP Entry** - Log systolic, diastolic, and pulse with a clean, intuitive form
- **Real-time Cloud Sync** - Data syncs instantly across all devices via Firebase
- **Offline Support** - Works without internet, automatically syncs when back online
- **Multi-tab Support** - Use in multiple browser tabs simultaneously
- **Daily Goals** - Track progress toward your daily measurement targets
- **Dashboard Analytics** - View 7-day and 30-day averages with trend charts
- **History & Filters** - Browse readings by date range and time of day
- **Export Options** - Download data as PDF reports or CSV spreadsheets
- **Secure Authentication** - Email/password auth with Firebase

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite 7
- **Styling**: Tailwind CSS 4
- **Backend**: Firebase (Firestore, Authentication)
- **Charts**: Recharts
- **Export**: jsPDF, Papa Parse
- **Hosting**: Vercel

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Firebase Setup

1. Create a project at [Firebase Console](https://console.firebase.google.com/)
2. Enable **Authentication** (Email/Password)
3. Enable **Firestore Database**
4. Get your config from Project Settings

### 3. Environment Variables

```bash
cp .env.local.example .env.local
```

Add your Firebase credentials to `.env.local`:

```
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### 4. Deploy Firestore Rules

```bash
npm install -g firebase-tools
firebase login
firebase deploy --only firestore --project your-project-id
```

### 5. Run Development Server

```bash
npm run dev
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy

**Important**: Add all `VITE_FIREBASE_*` environment variables in Vercel's project settings.

## Project Structure

```
src/
├── components/     # Reusable UI components
├── contexts/       # Auth and BP Data contexts
├── hooks/          # Custom React hooks
├── lib/            # Firebase config and utilities
├── pages/          # Page components (Entry, Dashboard, History, Export)
└── types/          # TypeScript definitions
```

## Blood Pressure Categories

| Category | Systolic | Diastolic |
|----------|----------|-----------|
| Normal | < 120 | < 80 |
| Elevated | 120-129 | < 80 |
| High Stage 1 | 130-139 | 80-89 |
| High Stage 2 | >= 140 | >= 90 |

## License

MIT

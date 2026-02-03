# Blood Pressure Tracker

A mobile-first web application for tracking blood pressure readings. Designed for simplicity and ease of use.

## Features

- **Easy BP Entry**: Quick entry form for systolic, diastolic, and pulse readings
- **Dashboard**: View your latest readings, 7-day and 30-day averages, and trend charts
- **History**: Browse all your readings with date and time-of-day filters
- **Export**: Download your data as PDF reports or CSV spreadsheets
- **Authentication**: Secure login with email/password

## Tech Stack

- React 18 + Vite + TypeScript
- Tailwind CSS v4
- Firebase (Firestore + Auth)
- Recharts for data visualization
- jsPDF for PDF export
- Papa Parse for CSV export

## Setup

### 1. Clone and Install

```bash
npm install
```

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable **Authentication** with Email/Password provider
4. Enable **Firestore Database**
5. Get your Firebase config from Project Settings > General > Your apps

### 3. Environment Variables

Copy the example env file and fill in your Firebase credentials:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Firebase config:

```
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### 4. Firestore Security Rules

In Firebase Console > Firestore > Rules, set up these security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /readings/{readingId} {
      allow read, write: if request.auth != null
        && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null
        && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

### 5. Run Development Server

```bash
npm run dev
```

### 6. Build for Production

```bash
npm run build
```

## Deployment

### Vercel

```bash
npm install -g vercel
vercel
```

### Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod
```

Remember to set your environment variables in your deployment platform.

## Blood Pressure Categories

| Category | Systolic (mmHg) | Diastolic (mmHg) |
|----------|-----------------|------------------|
| Normal | < 120 | < 80 |
| Elevated | 120-129 | < 80 |
| High Stage 1 | 130-139 | 80-89 |
| High Stage 2 | >= 140 | >= 90 |

## License

MIT

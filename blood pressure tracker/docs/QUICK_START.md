# Quick Start Guide

Get the Blood Pressure Tracker running on your computer in 10 minutes.

## Prerequisites

You need these installed on your computer:

| Software | Check if installed | Install link |
|----------|-------------------|--------------|
| Node.js (v18+) | `node --version` | https://nodejs.org |
| npm | `npm --version` | Comes with Node.js |
| Git (optional) | `git --version` | https://git-scm.com |

---

## Step 1: Install Dependencies

Open your terminal and navigate to the project folder:

```bash
cd "/Users/nicholaschairnando/Projects/blood pressure tracker"
```

Install all required packages:

```bash
npm install
```

This downloads all the libraries listed in `package.json`. Takes about 1-2 minutes.

---

## Step 2: Set Up Firebase

**If you haven't set up Firebase yet**, follow the detailed guide: [Firebase Setup Guide](./FIREBASE_SETUP.md)

**If you already have Firebase set up**, create your environment file:

```bash
# Copy the example file
cp .env.local.example .env.local
```

Edit `.env.local` with your Firebase credentials:

```env
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

---

## Step 3: Start Development Server

```bash
npm run dev
```

You should see output like:

```
  VITE v7.x.x  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.1.x:5173/
  ➜  press h + enter to show help
```

---

## Step 4: Open the App

1. Open your browser
2. Go to: **http://localhost:5173**
3. You should see the login page

---

## Step 5: Create an Account

1. Click **"Create one"** link
2. Enter your name, email, and password
3. Click **"Create account"**
4. You'll be redirected to the Dashboard

---

## Step 6: Add Your First Reading

1. Tap **"Entry"** in the bottom navigation
2. Enter your blood pressure values:
   - **Systolic**: Top number (e.g., 120)
   - **Diastolic**: Bottom number (e.g., 80)
   - **Pulse**: Heart rate (e.g., 72)
3. Select time of day (Morning/Afternoon/Evening)
4. Click **"Save Reading"**

---

## Step 7: View Dashboard

1. Tap **"Dashboard"** in the bottom navigation
2. See your latest reading and statistics
3. The chart will show trends as you add more readings

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (hot reload) |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Check code for issues |

---

## Testing on Mobile (Same Network)

1. Find your computer's local IP address:
   - Mac: System Settings > Network > Wi-Fi > Details > IP Address
   - Or run: `ipconfig getifaddr en0`

2. On your phone (connected to same Wi-Fi):
   - Open browser
   - Go to: `http://YOUR_IP:5173` (e.g., `http://192.168.1.100:5173`)

---

## Project Structure Overview

```
blood-pressure-tracker/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/          # Main app screens
│   ├── hooks/          # Custom React hooks
│   ├── contexts/       # React context providers
│   ├── lib/            # Utilities and Firebase config
│   ├── types/          # TypeScript type definitions
│   ├── App.tsx         # Main app with routing
│   └── main.tsx        # App entry point
├── docs/               # Documentation (you are here!)
├── .env.local          # Your Firebase config (don't commit!)
└── package.json        # Project dependencies
```

---

## Troubleshooting

### "Cannot find module" errors
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

### Blank page / Nothing loads
- Check browser console for errors (F12 > Console)
- Verify `.env.local` file exists and has correct values
- Restart the dev server

### "Firebase: Error (auth/invalid-api-key)"
- Check your API key in `.env.local`
- Make sure there are no extra spaces or quotes

### Changes not showing up
- The dev server has hot reload, but sometimes you need to:
  - Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
  - Restart dev server: Ctrl+C then `npm run dev`

---

## Next Steps

- [Firebase Setup Guide](./FIREBASE_SETUP.md) - Detailed Firebase configuration
- [Architecture Guide](./ARCHITECTURE.md) - Understand how the code is organized
- [Deployment Guide](./DEPLOYMENT.md) - Put your app on the internet

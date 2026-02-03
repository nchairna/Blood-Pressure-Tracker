# Firebase Setup Guide (For Beginners)

This guide walks you through setting up Firebase from scratch. Firebase is a Backend-as-a-Service (BaaS) by Google that provides:

- **Authentication**: User login/registration without building your own server
- **Firestore**: A NoSQL database that syncs data in real-time
- **Hosting**: (Optional) Deploy your app for free

## What is Firebase?

Think of Firebase as a ready-made backend for your app. Instead of:
1. Setting up a server
2. Creating a database
3. Building login APIs
4. Managing security

...Firebase handles all of this for you. You just connect your frontend app to Firebase using their SDK (Software Development Kit).

---

## Step 1: Create a Google Account

If you don't have one, create a Google account at https://accounts.google.com

---

## Step 2: Go to Firebase Console

1. Open your browser and go to: **https://console.firebase.google.com**
2. Click **"Get Started"** or **"Go to Console"**
3. Sign in with your Google account

---

## Step 3: Create a New Project

1. Click **"Create a project"** (or "Add project")

2. **Enter project name**: `blood-pressure-tracker` (or any name you like)
   - Firebase will generate a unique project ID below the name
   - You can customize this ID (it must be globally unique)

3. **Google Analytics**:
   - You can disable this for now (toggle OFF)
   - It's optional and not needed for this app
   - Click **"Create project"**

4. Wait for the project to be created (takes about 30 seconds)

5. Click **"Continue"** when done

You're now in your Firebase project dashboard!

---

## Step 4: Register Your Web App

Firebase needs to know what type of app will connect to it.

1. On the project overview page, look for the icons near the top:
   ```
   iOS    Android    Web (</>)    Unity    Flutter
   ```

2. Click the **Web icon (</>)**

3. **Register app**:
   - App nickname: `BP Tracker Web` (just for your reference)
   - Firebase Hosting: Leave unchecked (we'll deploy elsewhere)
   - Click **"Register app"**

4. **Important!** You'll see a code snippet like this:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSyB...",
     authDomain: "blood-pressure-tracker-xxxxx.firebaseapp.com",
     projectId: "blood-pressure-tracker-xxxxx",
     storageBucket: "blood-pressure-tracker-xxxxx.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abc123..."
   };
   ```

5. **Copy these values!** You'll need them for your `.env.local` file.

6. Click **"Continue to console"**

---

## Step 5: Enable Authentication

Now let's set up user login.

1. In the left sidebar, click **"Build"** to expand it
2. Click **"Authentication"**
3. Click **"Get started"**

4. You'll see a list of **Sign-in providers**. Click on **"Email/Password"**

5. Toggle **"Enable"** to ON
6. Leave "Email link (passwordless sign-in)" OFF
7. Click **"Save"**

Authentication is now enabled! Users can register and login with email/password.

---

## Step 6: Create Firestore Database

Firestore is where your blood pressure readings will be stored.

1. In the left sidebar under "Build", click **"Firestore Database"**
2. Click **"Create database"**

3. **Choose location**:
   - Select a region close to your users
   - For Singapore/Southeast Asia: `asia-southeast1 (Singapore)`
   - For US: `us-central` or `us-east1`
   - **Important**: You cannot change this later!

4. **Security rules**:
   - Select **"Start in test mode"** (we'll add proper rules next)
   - Click **"Create"**

5. Wait for the database to be provisioned

---

## Step 7: Set Up Security Rules

**This is critical!** Security rules control who can read/write data.

1. In Firestore, click the **"Rules"** tab at the top

2. Delete the existing rules and paste this:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - users can only access their own document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Readings collection - users can only access their own readings
    match /readings/{readingId} {
      // Allow read/update/delete only if user owns the reading
      allow read, update, delete: if request.auth != null
        && request.auth.uid == resource.data.userId;

      // Allow create only if user is setting themselves as owner
      allow create: if request.auth != null
        && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

3. Click **"Publish"**

### What do these rules mean?

| Rule | Explanation |
|------|-------------|
| `request.auth != null` | User must be logged in |
| `request.auth.uid == userId` | User can only access their own user document |
| `request.auth.uid == resource.data.userId` | User can only read/edit readings they created |
| `request.auth.uid == request.resource.data.userId` | When creating, userId field must match logged-in user |

---

## Step 8: Configure Your App

Now connect your app to Firebase.

1. In your project folder, create a file called `.env.local`:

```bash
# In your terminal, from the project folder:
cp .env.local.example .env.local
```

2. Open `.env.local` and fill in your Firebase config:

```env
VITE_FIREBASE_API_KEY=AIzaSyB...your-api-key...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123...
```

### Where to find these values again?

1. Go to Firebase Console
2. Click the gear icon (Settings) next to "Project Overview"
3. Click **"Project settings"**
4. Scroll down to "Your apps" section
5. Find your web app and see the config

---

## Step 9: Test Your Setup

1. Start the development server:
```bash
npm run dev
```

2. Open http://localhost:5173 in your browser

3. Click "Create one" to register a new account

4. Enter an email and password

5. If registration succeeds, you're connected to Firebase!

### Verify in Firebase Console

1. Go to Firebase Console > Authentication > Users
2. You should see your newly created user!

3. Go to Firestore Database > Data
4. You should see a `users` collection with your user document

---

## Understanding How It Works

### Data Flow

```
User enters BP reading
        │
        ▼
React App (Frontend)
        │
        ▼
Firebase SDK (in browser)
        │
        ▼ (HTTPS)
Firebase Servers
        │
        ▼
Firestore Database
```

### Collections Structure

Firestore organizes data in **Collections** (like tables) and **Documents** (like rows):

```
firestore/
├── users/                    # Collection
│   └── {userId}/             # Document (one per user)
│       ├── uid: "abc123"
│       ├── email: "dad@email.com"
│       ├── displayName: "Dad"
│       └── createdAt: Timestamp
│
└── readings/                 # Collection
    ├── {readingId1}/         # Document (one per reading)
    │   ├── userId: "abc123"
    │   ├── systolic: 120
    │   ├── diastolic: 80
    │   ├── pulse: 72
    │   ├── timeOfDay: "morning"
    │   ├── timestamp: Timestamp
    │   └── notes: "Feeling good"
    │
    └── {readingId2}/
        └── ...
```

### Authentication Flow

```
1. User enters email/password
        │
        ▼
2. Firebase Auth verifies credentials
        │
        ▼
3. Firebase returns auth token (JWT)
        │
        ▼
4. App stores token in browser
        │
        ▼
5. All Firestore requests include this token
        │
        ▼
6. Firestore checks token against security rules
```

---

## Common Issues & Troubleshooting

### "Firebase App not initialized"
- Check that `.env.local` exists and has correct values
- Make sure values don't have quotes around them
- Restart the dev server after changing `.env.local`

### "Permission denied" when reading/writing
- Check Firestore security rules are published
- Make sure you're logged in
- Check the userId field matches the logged-in user

### "Invalid API key"
- Double-check the API key in `.env.local`
- Make sure there are no extra spaces

### Can't see data in Firestore Console
- Click the refresh button in Firestore Console
- Make sure you're looking at the right project

---

## Firebase Free Tier Limits

Firebase has a generous free tier (Spark Plan):

| Service | Free Limit |
|---------|------------|
| Authentication | 50,000 monthly active users |
| Firestore Reads | 50,000 per day |
| Firestore Writes | 20,000 per day |
| Firestore Deletes | 20,000 per day |
| Storage | 1 GB |

For a personal BP tracker, you'll never hit these limits!

---

## Next Steps

- [Quick Start Guide](./QUICK_START.md) - Run the app locally
- [Deployment Guide](./DEPLOYMENT.md) - Deploy to the internet
- [Architecture Guide](./ARCHITECTURE.md) - Understand the codebase

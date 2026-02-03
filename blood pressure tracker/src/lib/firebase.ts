import { initializeApp } from 'firebase/app'
import { getAuth, browserLocalPersistence, setPersistence } from 'firebase/auth'
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Check if Firebase config is set
const missingKeys = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key)

if (missingKeys.length > 0) {
  console.error(
    '❌ Firebase configuration missing!\n\n' +
    'Missing environment variables:\n' +
    missingKeys.map(key => `  - VITE_FIREBASE_${key.toUpperCase()}`).join('\n') +
    '\n\nPlease add them to your .env.local file.\n' +
    'See docs/FIREBASE_SETUP.md for instructions.'
  )
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize services
export const auth = getAuth(app)
export const db = getFirestore(app)

// Configure auth persistence - CRITICAL for page refresh
// This ensures auth state persists across page reloads
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error('Failed to set auth persistence:', error)
})

// Enable Firestore offline persistence for better reliability
// This allows the app to work offline and cache data locally
if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(db, {
    forceOwnership: false // Allow multiple tabs
  }).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Persistence failed: Multiple tabs open')
    } else if (err.code === 'unimplemented') {
      console.warn('Persistence not available in this browser')
    } else {
      console.error('Persistence error:', err)
    }
  })
}

export default app

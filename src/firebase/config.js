/**
 * HealthPulse Firebase Authentication Configuration
 * Initializes the Firebase Client SDK using Vite environment variables.
 * Provides resilient fallback for development and testing.
 */
import { initializeApp, getApps, getApp } from 'firebase/app'
import {
  getAuth,
  signInWithEmailAndPassword as fbSignInWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged as fbOnAuthStateChanged,
} from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'healthpulse-hospital',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
}

export const isFirebaseConfigured = () => {
  return (
    Boolean(firebaseConfig.apiKey) &&
    firebaseConfig.apiKey.length > 10 &&
    !firebaseConfig.apiKey.includes('YOUR_FIREBASE')
  )
}

let app = null
let authInstance = null

if (isFirebaseConfigured()) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)
    authInstance = getAuth(app)
    console.info('[Firebase] Production client SDK initialized successfully.')
  } catch (err) {
    console.warn('[Firebase] Initialization error, falling back to development auth:', err)
  }
}

/**
 * Signs in a user with email and password using Firebase Authentication.
 * If live Firebase config is absent, simulates a Firebase user credential
 * using the verified HealthPulse development token protocol accepted by the backend.
 */
export const signInWithFirebase = async (email, password, roleHint = 'patient') => {
  if (isFirebaseConfigured() && authInstance) {
    const userCredential = await fbSignInWithEmailAndPassword(authInstance, email, password)
    const idToken = await userCredential.user.getIdToken()
    return {
      user: userCredential.user,
      idToken,
      uid: userCredential.user.uid,
      email: userCredential.user.email,
    }
  }

  // Resilient Local Development / Testing Simulation Mode
  // Generates a mock ID token conforming to backend verify_firebase_id_token specification
  const cleanEmail = (email || '').trim().toLowerCase()
  const cleanRole = (roleHint || 'patient').trim().toLowerCase()
  const mockToken = `mock-firebase-token-${cleanRole}:${cleanEmail}`
  const mockUid = `mock_firebase_${cleanRole}_${cleanEmail.replace(/[@.]/g, '_')}`

  const mockUser = {
    uid: mockUid,
    email: cleanEmail,
    displayName: cleanEmail.split('@')[0],
    getIdToken: async () => mockToken,
  }

  try {
    sessionStorage.setItem('hp_firebase_mock_user', JSON.stringify({ uid: mockUid, email: cleanEmail, role: cleanRole }))
  } catch (e) {
    // ignore
  }

  return {
    user: mockUser,
    idToken: mockToken,
    uid: mockUid,
    email: cleanEmail,
  }
}

/**
 * Signs out from Firebase Authentication.
 */
export const signOutFirebase = async () => {
  if (isFirebaseConfigured() && authInstance) {
    try {
      await fbSignOut(authInstance)
    } catch (err) {
      console.warn('[Firebase] Sign out error:', err)
    }
  }
  try {
    sessionStorage.removeItem('hp_firebase_mock_user')
  } catch (e) {
    // ignore
  }
}

/**
 * Listens for Firebase authentication state changes.
 */
export const subscribeToAuthState = (callback) => {
  if (isFirebaseConfigured() && authInstance) {
    return fbOnAuthStateChanged(authInstance, callback)
  }

  // Development simulation state observer
  try {
    const raw = sessionStorage.getItem('hp_firebase_mock_user')
    if (raw) {
      const parsed = JSON.parse(raw)
      callback({
        uid: parsed.uid,
        email: parsed.email,
        displayName: parsed.email.split('@')[0],
        getIdToken: async () => `mock-firebase-token-${parsed.role || 'patient'}:${parsed.email}`,
      })
    } else {
      callback(null)
    }
  } catch {
    callback(null)
  }

  return () => {}
}

export const auth = authInstance
export default authInstance

/**
 * HealthPulse Firebase Authentication Client Configuration
 * Initializes the Firebase Client SDK using Vite environment variables.
 * Provides Google Auth Provider, Email/Password auth, Password Reset, and Verification.
 * Includes a resilient development fallback for offline and local testing.
 */
import { initializeApp, getApps, getApp } from 'firebase/app'
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  sendEmailVerification,
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
let googleProviderInstance = null

if (isFirebaseConfigured()) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)
    authInstance = getAuth(app)
    googleProviderInstance = new GoogleAuthProvider()
    googleProviderInstance.setCustomParameters({ prompt: 'select_account' })
    console.info('[Firebase] Production Web SDK initialized successfully.')
  } catch (err) {
    console.warn('[Firebase] Initialization error, falling back to development auth:', err)
  }
}

/**
 * Sign in using Firebase Google Authentication
 */
export const signInWithGoogle = async (roleHint = 'patient') => {
  if (isFirebaseConfigured() && authInstance && googleProviderInstance) {
    const userCredential = await signInWithPopup(authInstance, googleProviderInstance)
    const idToken = await userCredential.user.getIdToken()
    return {
      user: userCredential.user,
      idToken,
      uid: userCredential.user.uid,
      email: (userCredential.user.email || '').toLowerCase(),
      displayName: userCredential.user.displayName || 'Google User',
      providerId: 'google.com',
    }
  }

  // Development simulation for Google login
  const cleanRole = (roleHint || 'patient').trim().toLowerCase()
  const mockEmail = cleanRole === 'admin' 
    ? 'admin@healthpulse.com' 
    : cleanRole === 'doctor' 
    ? 'dr.satyadeep@healthpulse.com' 
    : 'shravan@healthpulse.com'
  
  const mockToken = `mock-firebase-token-${cleanRole}:${mockEmail}`
  const mockUid = `mock_google_uid_${cleanRole}_${mockEmail.replace(/[@.]/g, '_')}`

  const mockUser = {
    uid: mockUid,
    email: mockEmail,
    displayName: cleanRole === 'doctor' ? 'Dr. Satya Deep' : cleanRole === 'admin' ? 'System Administrator' : 'Shravan',
    getIdToken: async () => mockToken,
  }

  try {
    sessionStorage.setItem('hp_firebase_mock_user', JSON.stringify({
      uid: mockUid,
      email: mockEmail,
      role: cleanRole,
      provider: 'google.com'
    }))
  } catch (e) {
    // ignore
  }

  return {
    user: mockUser,
    idToken: mockToken,
    uid: mockUid,
    email: mockEmail,
    displayName: mockUser.displayName,
    providerId: 'google.com'
  }
}

/**
 * Signs in user with email and password via Firebase
 */
export const signInWithFirebase = async (email, password, roleHint = 'patient') => {
  const cleanEmail = (email || '').trim().toLowerCase()
  const cleanRole = (roleHint || 'patient').trim().toLowerCase()

  if (isFirebaseConfigured() && authInstance) {
    const userCredential = await signInWithEmailAndPassword(authInstance, cleanEmail, password)
    const idToken = await userCredential.user.getIdToken()
    return {
      user: userCredential.user,
      idToken,
      uid: userCredential.user.uid,
      email: cleanEmail,
      emailVerified: userCredential.user.emailVerified,
      displayName: userCredential.user.displayName || cleanEmail.split('@')[0],
      providerId: 'password',
    }
  }

  // Development simulation mode
  const mockToken = `mock-firebase-token-${cleanRole}:${cleanEmail}`
  const mockUid = `mock_firebase_${cleanRole}_${cleanEmail.replace(/[@.]/g, '_')}`

  const mockUser = {
    uid: mockUid,
    email: cleanEmail,
    displayName: cleanEmail.split('@')[0],
    emailVerified: true,
    getIdToken: async () => mockToken,
  }

  try {
    sessionStorage.setItem('hp_firebase_mock_user', JSON.stringify({
      uid: mockUid,
      email: cleanEmail,
      role: cleanRole,
      provider: 'password'
    }))
  } catch (e) {
    // ignore
  }

  return {
    user: mockUser,
    idToken: mockToken,
    uid: mockUid,
    email: cleanEmail,
    displayName: cleanEmail.split('@')[0],
    providerId: 'password',
  }
}

/**
 * Registers a new patient account with email and password via Firebase
 */
export const registerWithFirebase = async (email, password, displayName = '') => {
  const cleanEmail = (email || '').trim().toLowerCase()

  if (isFirebaseConfigured() && authInstance) {
    const userCredential = await createUserWithEmailAndPassword(authInstance, cleanEmail, password)
    try {
      await sendEmailVerification(userCredential.user)
    } catch (verErr) {
      console.warn('[Firebase] Email verification dispatch notice:', verErr)
    }
    const idToken = await userCredential.user.getIdToken()
    return {
      user: userCredential.user,
      idToken,
      uid: userCredential.user.uid,
      email: cleanEmail,
      displayName: displayName || cleanEmail.split('@')[0],
    }
  }

  // Development simulation mode
  const mockToken = `mock-firebase-token-patient:${cleanEmail}`
  const mockUid = `mock_firebase_patient_${cleanEmail.replace(/[@.]/g, '_')}`

  const mockUser = {
    uid: mockUid,
    email: cleanEmail,
    displayName: displayName || cleanEmail.split('@')[0],
    emailVerified: false,
    getIdToken: async () => mockToken,
  }

  try {
    sessionStorage.setItem('hp_firebase_mock_user', JSON.stringify({
      uid: mockUid,
      email: cleanEmail,
      role: 'patient',
      provider: 'password'
    }))
  } catch (e) {
    // ignore
  }

  return {
    user: mockUser,
    idToken: mockToken,
    uid: mockUid,
    email: cleanEmail,
    displayName: displayName || cleanEmail.split('@')[0],
  }
}

/**
 * Sends a password reset email via Firebase
 */
export const sendFirebasePasswordReset = async (email) => {
  const cleanEmail = (email || '').trim().toLowerCase()
  if (isFirebaseConfigured() && authInstance) {
    await sendPasswordResetEmail(authInstance, cleanEmail)
    return { success: true, message: `Password reset instructions sent to ${cleanEmail}` }
  }

  return {
    success: true,
    message: `(Development Simulation) Password reset link dispatched to ${cleanEmail}. Check your inbox.`,
  }
}

/**
 * Signs out from Firebase Authentication
 */
export const signOutFirebase = async () => {
  if (isFirebaseConfigured() && authInstance) {
    try {
      await signOut(authInstance)
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
 * Subscribes to Firebase auth state changes
 */
export const subscribeToAuthState = (callback) => {
  if (isFirebaseConfigured() && authInstance) {
    return onAuthStateChanged(authInstance, callback)
  }

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

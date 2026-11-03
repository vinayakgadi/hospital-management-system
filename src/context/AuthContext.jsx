import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { API_BASE_URL } from '../config.js'
import {
  signInWithFirebase,
  signInWithGoogle,
  registerWithFirebase,
  sendFirebasePasswordReset,
  signOutFirebase,
  subscribeToAuthState,
  isFirebaseConfigured,
} from '../firebase/config.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [token, setToken] = useState(() => {
    try {
      return (
        sessionStorage.getItem('healthpulse_token') ||
        localStorage.getItem('healthpulse_token') ||
        null
      )
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState(null)

  // Configure Axios default Authorization header whenever token changes
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      try {
        sessionStorage.setItem('healthpulse_token', token)
        localStorage.setItem('healthpulse_token', token)
      } catch (e) {
        console.error('Storage error:', e)
      }
    } else {
      delete axios.defaults.headers.common['Authorization']
      try {
        sessionStorage.removeItem('healthpulse_token')
        localStorage.removeItem('healthpulse_token')
        sessionStorage.removeItem('healthpulse_auth')
        localStorage.removeItem('healthpulse_auth')
      } catch (e) {
        console.error('Storage error:', e)
      }
    }
  }, [token])

  // Verify and sync authentication state on mount via Firebase & Backend
  useEffect(() => {
    let isMounted = true

    const unsubscribe = subscribeToAuthState(async (firebaseUser) => {
      if (!isMounted) return

      const existingToken =
        sessionStorage.getItem('healthpulse_token') ||
        localStorage.getItem('healthpulse_token')

      if (firebaseUser) {
        try {
          const freshIdToken = await firebaseUser.getIdToken()
          // Authenticate with backend using the fresh Firebase ID token
          const res = await axios.get(`${API_BASE_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${freshIdToken}` },
          })

          if (isMounted && res.data && res.data.user) {
            setToken(freshIdToken)
            setCurrentUser({
              user: res.data.user,
              role: (res.data.role || res.data.user.role || '').toLowerCase(),
              token: freshIdToken,
              firebaseUid: firebaseUser.uid,
              authenticatedAt: new Date().toISOString(),
            })
            setInitialLoading(false)
            return
          }
        } catch (err) {
          console.warn('[Auth] Firebase token verification on backend failed:', err?.response?.status)
        }
      }

      // If no valid Firebase user or Firebase /api/auth/me failed, check existing session token
      if (existingToken) {
        try {
          const res = await axios.get(`${API_BASE_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${existingToken}` },
          })
          if (isMounted && res.data && res.data.user) {
            const userRole = (res.data.role || res.data.user.role || '').toLowerCase()
            setCurrentUser({
              user: res.data.user,
              role: userRole,
              token: existingToken,
              authenticatedAt: new Date().toISOString(),
            })
            setToken(existingToken)
          } else if (isMounted) {
            setToken(null)
            setCurrentUser(null)
          }
        } catch (err) {
          console.warn('[Auth] Session verification failed, invalidating token:', err?.response?.status)
          if (isMounted) {
            setToken(null)
            setCurrentUser(null)
            await signOutFirebase()
          }
        }
      } else {
        setToken(null)
        setCurrentUser(null)
      }

      if (isMounted) setInitialLoading(false)
    })

    return () => {
      isMounted = false
      if (typeof unsubscribe === 'function') unsubscribe()
    }
  }, [])

  // Helper to exchange Firebase ID Token with HealthPulse Backend
  const exchangeTokenWithBackend = async (idToken, roleRequested, extraData = {}) => {
    const normalizedRole = (roleRequested || '').trim().toLowerCase()
    const res = await axios.post(`${API_BASE_URL}/api/auth/firebase-login`, {
      idToken,
      role: normalizedRole,
      ...extraData,
    })

    if (res.data && (res.data.token || res.data.idToken)) {
      const activeToken = res.data.idToken || res.data.token
      const userRole = (res.data.role || res.data.user?.role || normalizedRole).toLowerCase()
      const authData = {
        user: res.data.user,
        role: userRole,
        token: activeToken,
        firebaseUid: res.data.user?.firebase_uid,
        authenticatedAt: new Date().toISOString(),
      }

      setToken(activeToken)
      setCurrentUser(authData)
      return { success: true, authData }
    } else {
      throw new Error(res.data?.error || 'Authentication failed. Please verify credentials.')
    }
  }

  // 1. Firebase Email/Password Login with Backend Role Verification
  const login = async (email, password, roleRequested = '') => {
    setLoading(true)
    setError(null)

    const cleanEmail = (email || '').trim().toLowerCase()
    const cleanPassword = (password || '').trim()
    const normalizedRole = (roleRequested || '').trim().toLowerCase()

    try {
      const fbResult = await signInWithFirebase(cleanEmail, cleanPassword, normalizedRole)
      const res = await exchangeTokenWithBackend(fbResult.idToken, normalizedRole, {
        name: fbResult.displayName,
      })

      setLoading(false)
      return res
    } catch (err) {
      console.error('[Auth] Login error:', err)
      await signOutFirebase()

      let msg = 'Authentication failed. Please check your credentials.'
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        msg = 'Invalid email address or password.'
      } else if (err.code === 'auth/user-disabled') {
        msg = 'This account has been disabled. Please contact an administrator.'
      } else if (err.code === 'auth/too-many-requests') {
        msg = 'Too many failed login attempts. Please try again later.'
      } else if (err.response?.data?.error) {
        msg = err.response.data.error
      } else if (err.response?.status === 401) {
        msg = 'Invalid email address or password.'
      } else if (err.response?.status === 403) {
        msg = err.response.data?.error || 'Access Denied: You are not authorized for this portal.'
      } else if (err.message && !err.message.includes('[object')) {
        msg = err.message
      }

      setError(msg)
      setLoading(false)
      return { success: false, error: msg }
    }
  }

  // 2. Firebase Google Authentication with Backend Role Verification
  const loginWithGoogle = async (roleRequested = '') => {
    setLoading(true)
    setError(null)

    const normalizedRole = (roleRequested || '').trim().toLowerCase()

    try {
      const fbResult = await signInWithGoogle(normalizedRole)
      const res = await exchangeTokenWithBackend(fbResult.idToken, normalizedRole, {
        name: fbResult.displayName,
        provider: 'google.com',
      })

      setLoading(false)
      return res
    } catch (err) {
      console.error('[Auth] Google sign-in error:', err)
      await signOutFirebase()

      let msg = 'Google authentication was not completed.'
      if (err.code === 'auth/popup-closed-by-user') {
        msg = 'Google sign-in popup was closed before completing.'
      } else if (err.code === 'auth/cancelled-popup-request') {
        msg = 'Google sign-in was cancelled.'
      } else if (err.response?.data?.error) {
        msg = err.response.data.error
      } else if (err.response?.status === 403) {
        msg = err.response.data?.error || 'Access Denied: Your Google account is not credentialed for this portal.'
      } else if (err.message && !err.message.includes('[object')) {
        msg = err.message
      }

      setError(msg)
      setLoading(false)
      return { success: false, error: msg }
    }
  }

  // 3. Patient Registration via Firebase Email/Password
  const registerPatient = async (name, email, password, clinicalData = {}) => {
    setLoading(true)
    setError(null)

    const cleanEmail = (email || '').trim().toLowerCase()
    const cleanPassword = (password || '').trim()
    const cleanName = (name || '').trim()

    try {
      const fbResult = await registerWithFirebase(cleanEmail, cleanPassword, cleanName)
      const res = await exchangeTokenWithBackend(fbResult.idToken, 'patient', {
        name: cleanName,
        age: clinicalData.age || '30',
        gender: clinicalData.gender || 'Male',
        weight: clinicalData.weight || '70',
        disease: clinicalData.disease || 'General Wellness',
      })

      setLoading(false)
      return res
    } catch (err) {
      console.error('[Auth] Registration error:', err)
      await signOutFirebase()

      let msg = 'Failed to create patient account.'
      if (err.code === 'auth/email-already-in-use') {
        msg = 'An account with this email address already exists. Please sign in.'
      } else if (err.code === 'auth/weak-password') {
        msg = 'Password should be at least 6 characters.'
      } else if (err.response?.data?.error) {
        msg = err.response.data.error
      } else if (err.message) {
        msg = err.message
      }

      setError(msg)
      setLoading(false)
      return { success: false, error: msg }
    }
  }

  // 4. Password Reset Email via Firebase
  const resetPassword = async (email) => {
    const cleanEmail = (email || '').trim().toLowerCase()
    if (!cleanEmail) {
      return { success: false, error: 'Please enter your account email address.' }
    }

    try {
      const res = await sendFirebasePasswordReset(cleanEmail)
      return res
    } catch (err) {
      console.error('[Auth] Password reset error:', err)
      let msg = 'Failed to send password reset email.'
      if (err.code === 'auth/user-not-found') {
        msg = 'No account found with this email address.'
      } else if (err.code === 'auth/invalid-email') {
        msg = 'Please provide a valid email format.'
      } else if (err.message) {
        msg = err.message
      }
      return { success: false, error: msg }
    }
  }

  // 5. Logout Handler
  const logout = useCallback(async () => {
    try {
      if (token) {
        await axios.post(
          `${API_BASE_URL}/api/auth/logout`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        )
      }
    } catch (err) {
      console.warn('[Auth] Server logout notice:', err)
    } finally {
      await signOutFirebase()
      setToken(null)
      setCurrentUser(null)
    }
  }, [token])

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        user: currentUser?.user || null,
        role: currentUser?.role || null,
        token,
        isAuthenticated: !!currentUser && !!token,
        loading,
        initialLoading,
        error,
        setError,
        login,
        loginWithGoogle,
        registerPatient,
        resetPassword,
        logout,
        isFirebaseConfigured: isFirebaseConfigured(),
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { API_BASE_URL } from '../config.js'
import {
  signInWithFirebase,
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
              role: res.data.role.toLowerCase(),
              token: freshIdToken,
              firebaseUid: firebaseUser.uid,
            })
            setInitialLoading(false)
            return
          }
        } catch (err) {
          console.warn('[Auth] Firebase token verification on backend failed:', err?.response?.status)
          // Fall through to test existing legacy/session token
        }
      }

      // If no valid Firebase user or Firebase /api/auth/me failed, check saved token
      if (existingToken) {
        try {
          const res = await axios.get(`${API_BASE_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${existingToken}` },
          })
          if (isMounted && res.data && res.data.user) {
            setCurrentUser({
              user: res.data.user,
              role: res.data.role.toLowerCase(),
              token: existingToken,
            })
          } else {
            setToken(null)
            setCurrentUser(null)
          }
        } catch (err) {
          console.warn('[Auth] Session verification failed, invalidating token:', err?.response?.status)
          setToken(null)
          setCurrentUser(null)
          await signOutFirebase()
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

  // Firebase Email/Password Login with Backend Role Verification
  const login = async (email, password, roleRequested = '') => {
    setLoading(true)
    setError(null)

    const cleanEmail = email.trim().toLowerCase()
    const cleanPassword = password.trim()
    const normalizedRole = roleRequested.toLowerCase()

    try {
      // 1. Authenticate with Firebase Authentication
      const fbResult = await signInWithFirebase(cleanEmail, cleanPassword, normalizedRole)
      const idToken = fbResult.idToken

      // 2. Exchange Firebase ID Token with HealthPulse Backend
      // The backend verifies the token with Firebase Admin SDK and validates role permissions
      const res = await axios.post(`${API_BASE_URL}/api/auth/firebase-login`, {
        idToken,
        role: normalizedRole,
      })

      if (res.data && (res.data.token || res.data.idToken)) {
        const activeToken = res.data.idToken || res.data.token
        const userRole = res.data.role.toLowerCase()
        const authData = {
          user: res.data.user,
          role: userRole,
          token: activeToken,
          firebaseUid: fbResult.uid,
          authenticatedAt: new Date().toISOString(),
        }

        setToken(activeToken)
        setCurrentUser(authData)
        setLoading(false)
        return { success: true, authData }
      } else {
        await signOutFirebase()
        const msg = res.data?.error || 'Authentication failed. Please verify credentials.'
        setError(msg)
        setLoading(false)
        return { success: false, error: msg }
      }
    } catch (err) {
      console.error('[Auth] Login error:', err)
      await signOutFirebase()

      // Handle specific Firebase error codes or backend responses
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

  // Logout handler
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

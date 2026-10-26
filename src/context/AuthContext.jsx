import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { API_BASE_URL } from '../config.js'

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

  // Verify token on initial load / page refresh
  useEffect(() => {
    let isMounted = true
    const verifySession = async () => {
      if (!token) {
        if (isMounted) setInitialLoading(false)
        return
      }

      try {
        const res = await axios.get(`${API_BASE_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (isMounted && res.data && res.data.user) {
          setCurrentUser({
            user: res.data.user,
            role: res.data.role.toLowerCase(),
            token: token,
          })
        }
      } catch (err) {
        console.warn('Session verification failed, logging out:', err?.response?.status)
        if (isMounted) {
          setToken(null)
          setCurrentUser(null)
        }
      } finally {
        if (isMounted) setInitialLoading(false)
      }
    }

    verifySession()

    return () => {
      isMounted = false
    }
  }, []) // run once on mount

  // Login handler
  const login = async (email, password, roleRequested = '') => {
    setLoading(true)
    setError(null)

    const cleanEmail = email.trim().toLowerCase()
    const cleanPassword = password.trim()
    const normalizedRole = roleRequested.toLowerCase()

    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email: cleanEmail,
        password: cleanPassword,
        role: normalizedRole,
      })

      if (res.data && res.data.token) {
        const userRole = res.data.role.toLowerCase()
        const authData = {
          user: res.data.user,
          role: userRole,
          token: res.data.token,
          authenticatedAt: new Date().toISOString(),
        }

        setToken(res.data.token)
        setCurrentUser(authData)
        setLoading(false)
        return { success: true, authData }
      } else {
        const msg = res.data.error || 'Authentication failed. Please verify credentials.'
        setError(msg)
        setLoading(false)
        return { success: false, error: msg }
      }
    } catch (err) {
      console.error('Login error:', err)
      const msg =
        err.response?.data?.error ||
        (err.response?.status === 401
          ? 'Invalid email address or password.'
          : err.response?.status === 403
          ? err.response.data?.error || 'Access Denied for this portal.'
          : 'Unable to connect to authentication server.')
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
      console.warn('Server logout error (continuing client cleanup):', err)
    } finally {
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

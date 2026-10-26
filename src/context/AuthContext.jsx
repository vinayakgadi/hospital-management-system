import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import { API_BASE_URL } from '../config.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('healthpulse_auth')
      if (stored) {
        return JSON.parse(stored)
      }
      // Migrate legacy storage if present
      const legacy = localStorage.getItem('healthpulse_user')
      if (legacy) {
        const parsed = JSON.parse(legacy)
        return {
          user: parsed,
          role: (parsed.role || 'Admin').toLowerCase(),
          token: 'legacy-token',
        }
      }
      return null
    } catch {
      return null
    }
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('healthpulse_auth', JSON.stringify(currentUser))
    } else {
      localStorage.removeItem('healthpulse_auth')
      localStorage.removeItem('healthpulse_user')
    }
  }, [currentUser])

  // Unified login handler supporting all three roles
  const login = async (email, password, role = 'admin') => {
    setLoading(true)
    setError(null)
    const cleanEmail = email.trim().toLowerCase()
    const cleanPassword = password.trim()
    const normalizedRole = role.toLowerCase()

    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email: cleanEmail,
        password: cleanPassword,
        role: normalizedRole,
      })

      if (res.data && res.data.user) {
        const authData = {
          user: res.data.user,
          role: res.data.role.toLowerCase(),
          token: res.data.token,
          authenticatedAt: new Date().toISOString(),
        }
        setCurrentUser(authData)
        setLoading(false)
        return { success: true, authData }
      } else {
        const msg = res.data.error || 'Authentication failed. Please check your credentials.'
        setError(msg)
        setLoading(false)
        return { success: false, error: msg }
      }
    } catch (err) {
      console.error('Login error:', err)
      const msg =
        err.response?.data?.error ||
        (err.response?.status === 401
          ? 'Invalid email or password.'
          : 'Unable to authenticate. Please verify backend server is reachable.')
      setError(msg)
      setLoading(false)
      return { success: false, error: msg }
    }
  }

  const logout = () => {
    setCurrentUser(null)
    localStorage.removeItem('healthpulse_auth')
    localStorage.removeItem('healthpulse_user')
  }

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        user: currentUser?.user || null,
        role: currentUser?.role || null,
        token: currentUser?.token || null,
        isAuthenticated: !!currentUser,
        loading,
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

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type UserRole = 'ADMIN' | 'SUPERVISOR' | 'WORKER' | 'VIEWER'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  preferredLocale: 'en' | 'ar'
  active: boolean
  customPermissions?: string[]
  lastLoginAt?: string
  mustChangePassword?: boolean
  passwordResetRequest?: boolean
}

export interface AuthState {
  token: string | null
  user: User | null
  isLoading: boolean
  error: string | null

  // Actions
  setToken: (token: string | null) => void
  setUser: (user: User | null) => void
  setError: (error: string | null) => void
  setLoading: (loading: boolean) => void
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: () => boolean
  hasPermission: (permission: string) => boolean
}

// Permission matrix matching backend
const PERMISSIONS: Record<string, UserRole[]> = {
  // Households
  HOUSEHOLD_READ: ['ADMIN', 'SUPERVISOR', 'WORKER', 'VIEWER'],
  HOUSEHOLD_WRITE: ['ADMIN', 'SUPERVISOR', 'WORKER'],
  HOUSEHOLD_DELETE: ['ADMIN'],
  HOUSEHOLD_PUBLISH: ['ADMIN', 'SUPERVISOR', 'WORKER'],

  // Persons
  PERSON_WRITE: ['ADMIN', 'SUPERVISOR', 'WORKER'],
  PERSON_DELETE: ['ADMIN', 'SUPERVISOR'],

  // Income
  INCOME_WRITE: ['ADMIN', 'SUPERVISOR', 'WORKER'],
  INCOME_VERIFY: ['ADMIN', 'SUPERVISOR'],
  INCOME_DELETE: ['ADMIN', 'SUPERVISOR'],

  // Burdens
  BURDEN_WRITE: ['ADMIN', 'SUPERVISOR', 'WORKER'],

  // Scoring
  SCORE_CALCULATE: ['ADMIN', 'SUPERVISOR', 'WORKER'],
  SCORE_READ: ['ADMIN', 'SUPERVISOR', 'WORKER', 'VIEWER'],
  SCORE_DECIDE: ['ADMIN', 'SUPERVISOR'],

  // Simulation
  SCORE_SIMULATE: ['ADMIN', 'SUPERVISOR', 'WORKER'],

  // Admin
  RULES_READ: ['ADMIN'],
  RULES_WRITE: ['ADMIN'],

  // Analytics
  ANALYTICS_READ: ['ADMIN', 'SUPERVISOR', 'WORKER', 'VIEWER'],

  // Audit
  AUDIT_READ: ['ADMIN', 'SUPERVISOR'],

  // Verification
  VERIFICATION_READ: ['ADMIN', 'SUPERVISOR', 'WORKER', 'VIEWER'],
  VERIFICATION_BULK: ['ADMIN', 'SUPERVISOR'],

  // Education
  EDUCATION_READ: ['ADMIN', 'SUPERVISOR', 'WORKER', 'VIEWER'],
  EDUCATION_WRITE: ['ADMIN', 'SUPERVISOR', 'WORKER'],
  EDUCATION_DELETE: ['ADMIN'],

  // Users
  USER_READ: ['ADMIN'],
  USER_WRITE: ['ADMIN'],
  USER_DELETE: ['ADMIN'],
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isLoading: false,
      error: null,

      setToken: (token) => set({ token }),
      setUser: (user) => set({ user }),
      setError: (error) => set({ error }),
      setLoading: (loading) => set({ isLoading: loading }),

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null })
        try {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          })

          if (!response.ok) {
            const data = await response.json()
            throw new Error(data.message || 'Login failed')
          }

          const data = await response.json()
          set({ token: data.accessToken, user: data.user, error: null })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Login failed'
          set({ error: message })
          throw error
        } finally {
          set({ isLoading: false })
        }
      },

      logout: () => {
        set({ token: null, user: null, error: null })
      },

      isAuthenticated: () => {
        return get().token !== null && get().user !== null
      },

      hasPermission: (permission: string) => {
        const { user } = get()
        if (!user) return false
        
        // Check role-based permission
        const roleHas = PERMISSIONS[permission]?.includes(user.role) ?? false
        if (roleHas) return true
        
        // Check custom (additive) permissions
        const customHas =
          Array.isArray(user.customPermissions) &&
          user.customPermissions.includes(permission)
        return customHas
      },
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),
    }
  )
)

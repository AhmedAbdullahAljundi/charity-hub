import { useAuthStore } from '@/lib/stores/authStore'

export const usePermission = (permission: string): boolean => {
  const hasPermission = useAuthStore((state) => state.hasPermission)
  return hasPermission(permission)
}

export const useCustomPermissions = (): string[] => {
  return useAuthStore((state) => state.user?.customPermissions || [])
}

export const useEffectivePermissions = (): string[] => {
  const user = useAuthStore((state) => state.user)
  if (!user) return []

  // Get all permissions granted by role
  const rolePermissions: string[] = []
  const PERMISSIONS = {
    HOUSEHOLD_READ: ['ADMIN', 'SUPERVISOR', 'WORKER', 'VIEWER'],
    HOUSEHOLD_WRITE: ['ADMIN', 'SUPERVISOR', 'WORKER'],
    HOUSEHOLD_DELETE: ['ADMIN'],
    HOUSEHOLD_PUBLISH: ['ADMIN', 'SUPERVISOR', 'WORKER'],
    PERSON_WRITE: ['ADMIN', 'SUPERVISOR', 'WORKER'],
    PERSON_DELETE: ['ADMIN', 'SUPERVISOR'],
    INCOME_WRITE: ['ADMIN', 'SUPERVISOR', 'WORKER'],
    INCOME_VERIFY: ['ADMIN', 'SUPERVISOR'],
    INCOME_DELETE: ['ADMIN', 'SUPERVISOR'],
    BURDEN_WRITE: ['ADMIN', 'SUPERVISOR', 'WORKER'],
    SCORE_CALCULATE: ['ADMIN', 'SUPERVISOR', 'WORKER'],
    SCORE_READ: ['ADMIN', 'SUPERVISOR', 'WORKER', 'VIEWER'],
    SCORE_DECIDE: ['ADMIN', 'SUPERVISOR'],
    SCORE_SIMULATE: ['ADMIN', 'SUPERVISOR', 'WORKER'],
    RULES_READ: ['ADMIN'],
    RULES_WRITE: ['ADMIN'],
    ANALYTICS_READ: ['ADMIN', 'SUPERVISOR', 'WORKER', 'VIEWER'],
    AUDIT_READ: ['ADMIN', 'SUPERVISOR'],
    VERIFICATION_READ: ['ADMIN', 'SUPERVISOR', 'WORKER', 'VIEWER'],
    VERIFICATION_BULK: ['ADMIN', 'SUPERVISOR'],
    EDUCATION_READ: ['ADMIN', 'SUPERVISOR', 'WORKER', 'VIEWER'],
    EDUCATION_WRITE: ['ADMIN', 'SUPERVISOR', 'WORKER'],
    EDUCATION_DELETE: ['ADMIN'],
    USER_READ: ['ADMIN'],
    USER_WRITE: ['ADMIN'],
    USER_DELETE: ['ADMIN'],
  }

  Object.entries(PERMISSIONS).forEach(([permission, roles]) => {
    if (roles.includes(user.role)) {
      rolePermissions.push(permission)
    }
  })

  // Combine with custom permissions and deduplicate
  const allPermissions = [
    ...new Set([...rolePermissions, ...(user.customPermissions || [])]),
  ]
  return allPermissions
}

export const useRole = (): string | null => {
  return useAuthStore((state) => state.user?.role || null)
}

export const useIsAdmin = (): boolean => {
  return useAuthStore((state) => state.user?.role === 'ADMIN')
}

export const useIsSupervisor = (): boolean => {
  return useAuthStore((state) => state.user?.role === 'SUPERVISOR')
}

export const useIsWorker = (): boolean => {
  return useAuthStore((state) => state.user?.role === 'WORKER')
}

export const useIsViewer = (): boolean => {
  return useAuthStore((state) => state.user?.role === 'VIEWER')
}

export const useUser = () => {
  return useAuthStore((state) => state.user)
}

export const useIsAuthenticated = (): boolean => {
  return useAuthStore((state) => state.isAuthenticated())
}

export const useLogout = () => {
  return useAuthStore((state) => state.logout)
}

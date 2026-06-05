import { useAuthStore } from '@/lib/stores/authStore'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'

export const useAuthGuard = (requiredRole?: string[]) => {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAuthenticated } = useAuthStore()

  useEffect(() => {
    // Allow login page to be accessed without auth
    if (pathname?.includes('/login')) {
      if (isAuthenticated()) {
        router.push('/')
      }
      return
    }

    // Check authentication
    if (!isAuthenticated()) {
      const locale = pathname?.split('/')[1] || 'en'
      router.push(`/${locale}/login`)
      return
    }

    // Check role if specified
    if (requiredRole && user && !requiredRole.includes(user.role)) {
      const locale = pathname?.split('/')[1] || 'en'
      router.push(`/${locale}/403`)
    }
  }, [isAuthenticated, user, pathname, router, requiredRole])

  return { user, isAuthenticated: isAuthenticated() }
}

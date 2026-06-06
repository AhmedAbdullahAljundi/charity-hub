'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Page() {
  const router = useRouter()

  useEffect(() => {
    router.push('/dashboard/medical')
  }, [router])

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <p className="text-gray-600">جاري التحميل...</p>
      </div>
    </main>
  )
}

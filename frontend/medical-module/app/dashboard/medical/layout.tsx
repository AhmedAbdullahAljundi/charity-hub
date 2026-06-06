import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'إدارة السجلات الطبية | CharityHub',
  description: 'نظام إدارة السجلات الطبية والمساعدات الطبية',
}

export default function MedicalDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="p-6 md:p-8 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  )
}

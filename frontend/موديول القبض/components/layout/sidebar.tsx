'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Home, Settings, Menu, X, LogOut, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface NavItem {
  label: string
  icon: React.ReactNode
  href: string
  id: string
}

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const navItems: NavItem[] = [
    {
      id: 'monthly',
      label: 'الشهري',
      icon: <Home className="w-5 h-5" />,
      href: '/',
    },
    {
      id: 'settings',
      label: 'الإعدادات',
      icon: <Settings className="w-5 h-5" />,
      href: '/settings',
    },
    {
      id: 'reports',
      label: 'التقارير',
      icon: <FileText className="w-5 h-5" />,
      href: '/reports',
    },
  ]

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="fixed top-4 start-4 z-40 md:hidden">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="text-foreground"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 end-0 h-screen w-64 bg-slate-900 text-white p-6 
          transition-transform duration-300 z-30
          ${isOpen ? 'translate-x-0' : 'translate-x-64 md:translate-x-0'}
          md:translate-x-0 md:sticky md:top-0 md:h-screen
        `}
      >
        <div className="mb-12 mt-8 md:mt-0">
          <h1 className="text-2xl font-bold text-emerald-500 text-center">لوحة التحكم</h1>
          <p className="text-xs text-gray-400 text-center mt-1">المساعدات الخيرية</p>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                ${isActive(item.href)
                  ? 'bg-emerald-500 text-white font-medium'
                  : 'text-gray-300 hover:bg-slate-800'
                }
              `}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-6 end-6 start-6">
          <Button
            variant="outline"
            className="w-full text-slate-900 border-slate-600 hover:bg-slate-800 hover:text-white"
            onClick={() => {
              setIsOpen(false)
              router.push('/')
            }}
          >
            <LogOut className="w-4 h-4 ms-2" />
            تسجيل الخروج
          </Button>
        </div>
      </aside>
    </>
  )
}

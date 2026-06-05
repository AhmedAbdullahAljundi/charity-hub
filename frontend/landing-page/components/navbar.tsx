'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, LogOut, LogIn, Heart, Coins } from 'lucide-react'
import { useAuthStore } from '@/lib/stores/authStore'
import { useRouter } from 'next/navigation'
import LoginModal from './login-modal'
import ZakatCalculator from './ZakatCalculator'
import ThemeToggle from './ThemeToggle'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showZakatCalculator, setShowZakatCalculator] = useState(false)
  const { user, logout, isAuthenticated } = useAuthStore()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    setIsOpen(false)
    router.push('/')
  }

  const handleDashboard = () => {
    router.push('/dashboard')
    setIsOpen(false)
  }

  const navLinks = [
    { href: '#features', label: 'المميزات' },
    { href: '#about', label: 'حول النظام' },
    { href: '#how-it-works', label: 'كيفية الاستخدام' },
    { href: '#contact', label: 'تواصل' },
  ]

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white dark:bg-slate-900 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" fill="white" />
              </div>
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold text-slate-900 dark:text-white">
                    Charity
                  </span>
                  <span className="text-lg font-bold text-green-500">Hub</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-none">
                  استهداف المساعدات
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-slate-600 dark:text-slate-300 hover:text-green-600 dark:hover:text-green-400 transition-colors text-sm font-medium"
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-2">
              <ThemeToggle />

              {/* Zakat Calculator Button */}
              <button
                onClick={() => setShowZakatCalculator(true)}
                className="hidden md:flex items-center gap-2 px-3 py-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/20 rounded-lg transition-colors text-sm font-medium"
                title="حاسبة الزكاة"
              >
                <Coins className="w-5 h-5" />
                حاسبة الزكاة
              </button>

              {isAuthenticated() && user ? (
                <div className="hidden md:flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {user.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {user.role}
                    </p>
                  </div>
                  <button
                    onClick={handleDashboard}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    لوحة التحكم
                  </button>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    title="تسجيل الخروج"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="hidden md:flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  تسجيل الدخول
                </button>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                {isOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isOpen && (
            <div className="md:hidden pb-4 space-y-2 border-t border-slate-200 dark:border-slate-700 pt-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="block px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-sm font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </a>
              ))}

              <button
                onClick={() => {
                  setShowZakatCalculator(true)
                  setIsOpen(false)
                }}
                className="w-full text-right px-4 py-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/20 rounded-lg transition-colors text-sm font-medium flex items-center justify-between"
              >
                حاسبة الزكاة
                <Coins className="w-4 h-4" />
              </button>

              <button
                className="w-full text-right px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-sm font-medium flex items-center justify-between"
              >
                تبديل المظهر
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.5C9.2 17.5 6.9 15.2 6.9 12.4 6.9 9.6 9.2 7.3 12 7.3c2.8 0 5.1 2.3 5.1 5.1 0 2.8-2.3 5.1-5.1 5.1zm0-9c-2.2 0-3.9 1.8-3.9 4 0 2.2 1.8 3.9 4 3.9s3.9-1.8 3.9-4c0-2.2-1.8-3.9-4-3.9z"/></svg>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>
                </div>
              </button>

              <div className="border-t border-slate-200 dark:border-slate-700 pt-4 mt-4 space-y-2">
                {isAuthenticated() && user ? (
                  <>
                    <div className="px-4 py-2">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {user.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {user.role}
                      </p>
                    </div>
                    <button
                      onClick={handleDashboard}
                      className="w-full text-right px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      لوحة التحكم
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-right px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 text-sm font-medium rounded-lg transition-colors flex items-center justify-end gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      تسجيل الخروج
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setShowLoginModal(true)
                      setIsOpen(false)
                    }}
                    className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <LogIn className="w-4 h-4" />
                    تسجيل الدخول
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal onClose={() => setShowLoginModal(false)} />
      )}

      {/* Zakat Calculator */}
      <ZakatCalculator
        isOpen={showZakatCalculator}
        onClose={() => setShowZakatCalculator(false)}
      />
    </>
  )
}

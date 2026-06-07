'use client'

import { useEffect, useState } from 'react'
import { Plus, Search, RefreshCw, Banknote, Settings } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'
import Link from 'next/link'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { KpiCards } from '@/components/disbursement/kpi-cards'
import { MonthsTable } from '@/components/disbursement/months-table'
import { NewMonthSheet } from '@/components/disbursement/new-month-sheet'
import { useDisbursementStore } from '@/lib/disbursement/store'
import { formatAmount } from '@/lib/disbursement/types'

export function DisbursementPage() {
  const t = useTranslations('disbursement')
  const locale = useLocale()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [search, setSearch] = useState('')

  const { months, loading, error, fetchMonths, clearError } = useDisbursementStore()

  useEffect(() => {
    fetchMonths()
  }, [fetchMonths])

  useEffect(() => {
    if (error) {
      toast.error(error)
      clearError()
    }
  }, [error, clearError])

  const filtered = months.filter((m) => {
    if (!search) return true
    const label = new Date(m.period).toLocaleDateString('ar-EG', {
      month: 'long',
      year: 'numeric',
    })
    return label.includes(search)
  })

  // KPI aggregates from real data
  const totalFamilies  = months.reduce((s, m) => s + (m._count?.payments ?? 0), 0)
  const approvedMonths = months.filter(m => m.status === 'APPROVED' || m.status === 'PAID')

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-12">
      {/* PREMIUM HEADER SECTION */}
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-green-950 pt-16 pb-24 overflow-hidden shadow-lg border-b border-green-500/10">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-green-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/2 -left-24 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-300 text-sm font-medium backdrop-blur-md shadow-[0_0_15px_rgba(34,197,94,0.15)]">
                <Banknote className="w-4 h-4" />
                <span>إدارة الشؤون المالية</span>
              </div>
              <div className="flex items-center gap-3">
                <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                  {t('title')}
                </h1>
                <Link href={`/${locale}/dashboard/disbursement/settings`}>
                  <button
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-all shadow-sm"
                    title="الإعدادات"
                  >
                    <Settings className="w-5 h-5" />
                  </button>
                </Link>
              </div>
              <p className="text-slate-300 text-lg max-w-xl leading-relaxed">
                {t('subtitle')}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => fetchMonths()}
                disabled={loading}
                className="group relative inline-flex items-center justify-center gap-2 px-4 py-3.5 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 transition-all duration-300 backdrop-blur-md disabled:opacity-50 hover:border-green-500/30"
                title="تحديث"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500 text-green-100'}`} />
              </button>
              <button
                onClick={() => setSheetOpen(true)}
                className="group relative inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-400 hover:to-emerald-400 transition-all duration-300 shadow-[0_0_30px_rgba(34,197,94,0.3)] hover:shadow-[0_0_40px_rgba(34,197,94,0.5)] font-bold text-base overflow-hidden border border-green-300/50"
              >
                <Plus className="w-5 h-5 relative z-10 transition-transform group-hover:rotate-90" />
                <span className="relative z-10">{t('addMonth')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-12 relative z-20 space-y-6">
        {/* KPI Cards */}
        <KpiCards
          totalFamilies={totalFamilies}
          totalMonths={months.length}
          approvedMonths={approvedMonths.length}
        />

      {/* Months Table Card */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm overflow-hidden border-t-4 border-t-green-500/80">
        {/* Table Header */}
        <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-700 px-5 py-4 bg-green-50/30 dark:bg-green-900/10">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="بحث عن شهر..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ps-9 border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm h-9"
              id="input-search-months"
            />
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0">
            {filtered.length} شهر
          </span>
        </div>

        {loading && months.length === 0 ? (
          <div className="flex items-center justify-center py-20 text-slate-400 text-sm">
            <RefreshCw className="h-4 w-4 animate-spin me-2" />
            {t('messages.loading')}
          </div>
        ) : (
          <MonthsTable months={filtered} />
        )}
      </div>

      {/* New Month Sheet */}
      <NewMonthSheet open={sheetOpen} onOpenChange={setSheetOpen} />
      </div>
    </div>
  )
}

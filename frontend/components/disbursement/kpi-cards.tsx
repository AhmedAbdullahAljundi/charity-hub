'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Users, Banknote, ShieldCheck, CheckCircle2 } from 'lucide-react'

interface KpiCardsProps {
  totalFamilies: number
  totalMonths: number
  approvedMonths: number
}

export function KpiCards({ totalFamilies, totalMonths, approvedMonths }: KpiCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Card 1: Total Families */}
      <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-slate-200/60 dark:border-slate-800 shadow-lg shadow-slate-200/40 dark:shadow-none hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">إجمالي الأسر</p>
              <p className="text-3xl font-bold font-mono text-slate-900 dark:text-slate-100">{totalFamilies.toLocaleString('en-US')}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900/50 shadow-inner">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card 2: Total Months */}
      <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-slate-200/60 dark:border-slate-800 shadow-lg shadow-slate-200/40 dark:shadow-none hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">إجمالي الدورات</p>
              <p className="text-3xl font-bold font-mono text-indigo-600 dark:text-indigo-500">{totalMonths.toLocaleString('en-US')}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-900/50 shadow-inner">
              <Banknote className="w-6 h-6" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card 3: Approved Months */}
      <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-slate-200/60 dark:border-slate-800 shadow-lg shadow-slate-200/40 dark:shadow-none hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">الدورات المعتمدة</p>
              <p className="text-3xl font-bold font-mono text-emerald-600 dark:text-emerald-500">{approvedMonths.toLocaleString('en-US')}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-900/50 shadow-inner">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card 4: Active Months */}
      <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-slate-200/60 dark:border-slate-800 shadow-lg shadow-slate-200/40 dark:shadow-none hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">الدورات النشطة</p>
              <p className="text-3xl font-bold font-mono text-amber-600 dark:text-amber-500">{(totalMonths - approvedMonths).toLocaleString('en-US')}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-100 dark:border-amber-900/50 shadow-inner">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

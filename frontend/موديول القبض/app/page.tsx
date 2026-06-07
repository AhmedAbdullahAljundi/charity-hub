'use client'

import { Button } from '@/components/ui/button'
import { Plus, Search } from 'lucide-react'
import { mockMonths } from '@/lib/data'
import { useState } from 'react'
import { NewMonthSheet } from '@/components/dialogs/new-month-sheet'
import { MonthsTable } from '@/components/dashboard/months-table'

export default function Page() {
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredMonths = mockMonths.filter(month =>
    month.name.includes(searchQuery)
  )

  const activeMonths = mockMonths.filter(m => m.status === 'CALCULATED' || m.status === 'APPROVED').length
  const totalBudget = mockMonths.reduce((sum, m) => sum + m.totalBudget, 0)
  const totalSpent = mockMonths.reduce((sum, m) => 
    sum + m.categories.reduce((catSum, c) => catSum + c.spent, 0), 0
  )

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header Section with Teal Background */}
      <div className="bg-teal-700 dark:bg-teal-900 text-white">
        <div className="px-6 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-1">دورات المساعدات</h1>
              <p className="text-teal-100 text-sm">إدارة شاملة لدورات المساعدات الخيرية والميزانيات</p>
            </div>
            <Button
              onClick={() => setIsSheetOpen(true)}
              className="bg-white hover:bg-slate-100 text-teal-700 gap-2 font-semibold"
            >
              <Plus className="w-4 h-4" />
              إضافة دورة جديدة
            </Button>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4" suppressHydrationWarning>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <p className="text-teal-100 text-xs font-medium mb-2">إجمالي الدورات</p>
              <p className="text-3xl font-bold text-white" suppressHydrationWarning>{mockMonths.length}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <p className="text-teal-100 text-xs font-medium mb-2">الدورات النشطة</p>
              <p className="text-3xl font-bold text-white" suppressHydrationWarning>{activeMonths}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <p className="text-teal-100 text-xs font-medium mb-2">الميزانية الإجمالية</p>
              <p className="text-3xl font-bold text-white" suppressHydrationWarning>{Math.round(totalBudget / 1000)}k</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <p className="text-teal-100 text-xs font-medium mb-2">المصروف الإجمالي</p>
              <p className="text-3xl font-bold text-white" suppressHydrationWarning>{Math.round(totalSpent / 1000)}k</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-8">
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
          {/* Search and Filters */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="بحث عن دورة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-sm outline-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
              />
            </div>
          </div>

          {/* Table */}
          <MonthsTable months={filteredMonths} />
        </div>
      </div>

      <NewMonthSheet open={isSheetOpen} onOpenChange={setIsSheetOpen} />
    </div>
  )
}

'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface NewMonthDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NewMonthDialog({ open, onOpenChange }: NewMonthDialogProps) {
  const [step, setStep] = useState<1 | 2>(1)
  const [monthData, setMonthData] = useState({
    month: '',
    year: new Date().getFullYear().toString(),
    budget: '',
  })

  const currentYear = new Date().getFullYear()
  const months = [
    'يناير',
    'فبراير',
    'مارس',
    'إبريل',
    'مايو',
    'يونيو',
    'يوليو',
    'أغسطس',
    'سبتمبر',
    'أكتوبر',
    'نوفمبر',
    'ديسمبر',
  ]

  const handleNext = () => {
    if (monthData.month && monthData.budget) {
      setStep(2)
    }
  }

  const handleCreate = () => {
    console.log('Creating month:', monthData)
    onOpenChange(false)
    setStep(1)
    setMonthData({ month: '', year: currentYear.toString(), budget: '' })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>إنشاء شهر جديد</DialogTitle>
          <DialogDescription>
            {step === 1 ? 'قم بتحديد الشهر والميزانية' : 'تأكيد التفاصيل'}
          </DialogDescription>
        </DialogHeader>

        {step === 1 ? (
          // Step 1: Month and Budget
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-900 dark:text-white">
                اختر الشهر
              </label>
              <Select value={monthData.month} onValueChange={(value) => setMonthData({ ...monthData, month: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر شهراً" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((m, idx) => (
                    <SelectItem key={idx} value={idx.toString()}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-slate-900 dark:text-white">
                السنة
              </label>
              <Select value={monthData.year} onValueChange={(value) => setMonthData({ ...monthData, year: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[currentYear - 1, currentYear, currentYear + 1].map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-slate-900 dark:text-white">
                الميزانية الإجمالية (ر.س)
              </label>
              <Input
                type="number"
                placeholder="مثال: 50000"
                value={monthData.budget}
                onChange={(e) => setMonthData({ ...monthData, budget: e.target.value })}
                className="text-end"
              />
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                إلغاء
              </Button>
              <Button
                onClick={handleNext}
                disabled={!monthData.month || !monthData.budget}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                التالي
              </Button>
            </div>
          </div>
        ) : (
          // Step 2: Confirmation
          <div className="space-y-4">
            <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">الشهر:</span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {months[parseInt(monthData.month)]} {monthData.year}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">الميزانية:</span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {parseInt(monthData.budget).toLocaleString()} ر.س
                </span>
              </div>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-400">
              سيتم إنشاء شهر جديد بهذه المواصفات. يمكنك إضافة العائلات والفئات بعد الإنشاء.
            </p>

            <div className="flex gap-3 justify-end pt-4">
              <Button variant="outline" onClick={() => setStep(1)}>
                رجوع
              </Button>
              <Button onClick={handleCreate} className="bg-emerald-600 hover:bg-emerald-700">
                إنشاء الشهر
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

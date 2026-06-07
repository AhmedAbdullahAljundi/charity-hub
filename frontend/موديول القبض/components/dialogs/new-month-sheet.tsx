'use client'

import { useState } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts'
import { BarChart2, Wallet, Play } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

interface NewMonthSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
const years = [2024, 2025, 2026, 2027]

const mockCategoryDistribution = [
  { nameAr: 'أيتام', count: 12 },
  { nameAr: 'إعاقة', count: 8 },
  { nameAr: 'طالب علم', count: 15 },
  { nameAr: 'سجناء', count: 5 },
  { nameAr: 'مساعدات', count: 7 },
]

export function NewMonthSheet({ open, onOpenChange }: NewMonthSheetProps) {
  const [step, setStep] = useState<1 | 2>(1)
  const [selectedMonth, setSelectedMonth] = useState('')
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString())
  const [method, setMethod] = useState('VULNERABILITY')
  const [budget, setBudget] = useState('')
  const [showBudgetInput, setShowBudgetInput] = useState(false)
  const [isSimulating, setIsSimulating] = useState(false)

  const handleMethodChange = (value: string) => {
    setMethod(value)
    setShowBudgetInput(value === 'PROPORTIONAL')
  }

  const handleNext = () => {
    if (selectedMonth && selectedYear) {
      setStep(2)
    }
  }

  const handleSimulate = () => {
    setIsSimulating(true)
    setTimeout(() => setIsSimulating(false), 1500)
  }

  const handleCreate = () => {
    console.log('Creating month:', { selectedMonth, selectedYear, method, budget })
    onOpenChange(false)
    setStep(1)
    setSelectedMonth('')
    setSelectedYear(new Date().getFullYear().toString())
    setMethod('VULNERABILITY')
    setBudget('')
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[480px] bg-slate-900 border-slate-700 text-white">
        {step === 1 ? (
          <>
            {/* Step 1 Header */}
            <SheetHeader className="space-y-4 mb-6">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <div className="h-2 w-2 rounded-full bg-slate-600" />
              </div>
              <SheetTitle className="text-2xl font-bold text-white">إعداد الشهر</SheetTitle>
            </SheetHeader>

            {/* Content */}
            <div className="space-y-6 pb-20">
              {/* Month and Year Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">اختر الشهر</Label>
                <div className="flex gap-3">
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="flex-1 bg-slate-800 border-slate-700 text-white">
                      <SelectValue placeholder="الشهر" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {months.map((m, idx) => (
                        <SelectItem key={idx} value={m} className="text-white">
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="w-32 bg-slate-800 border-slate-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {years.map((y) => (
                        <SelectItem key={y} value={y.toString()} className="text-white">
                          {y}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Calculation Method */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">طريقة الحساب</Label>
                <RadioGroup value={method} onValueChange={handleMethodChange}>
                  {/* Option A */}
                  <div
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      method === 'VULNERABILITY'
                        ? 'border-green-500 bg-green-500/10'
                        : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                    }`}
                    onClick={() => handleMethodChange('VULNERABILITY')}
                  >
                    <div className="flex items-start gap-3">
                      <RadioGroupItem value="VULNERABILITY" className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <BarChart2 className="w-4 h-4" />
                          <p className="font-semibold">حسب نسبة الهشاشة</p>
                          <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">موصى به</span>
                        </div>
                        <p className="text-xs text-slate-400">يُحسب القبض تلقائياً من درجة استحقاق كل أسرة</p>
                      </div>
                    </div>
                  </div>

                  {/* Option B */}
                  <div
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      method === 'PROPORTIONAL'
                        ? 'border-green-500 bg-green-500/10'
                        : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                    }`}
                    onClick={() => handleMethodChange('PROPORTIONAL')}
                  >
                    <div className="flex items-start gap-3">
                      <RadioGroupItem value="PROPORTIONAL" className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Wallet className="w-4 h-4" />
                          <p className="font-semibold">توزيع الميزانية</p>
                        </div>
                        <p className="text-xs text-slate-400">أدخل الميزانية الكلية وسيتم التوزيع نسبياً</p>
                      </div>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              {/* Budget Input (conditional) */}
              {showBudgetInput && (
                <div className="space-y-2 animate-in fade-in">
                  <Label htmlFor="budget" className="text-sm font-medium">
                    الميزانية الكلية (ج.م)
                  </Label>
                  <Input
                    id="budget"
                    type="number"
                    placeholder="مثال: 50000"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    min="0"
                    step="0.01"
                    className="bg-slate-800 border-slate-700 text-white placeholder-slate-500"
                  />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-900 to-transparent border-t border-slate-700 flex gap-2 justify-between">
              <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                إلغاء
              </Button>
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700"
                disabled={!selectedMonth || !selectedYear}
                onClick={handleNext}
              >
                التالي →
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* Step 2 Header */}
            <SheetHeader className="space-y-4 mb-6">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <div className="h-2 w-2 rounded-full bg-green-500" />
              </div>
              <SheetTitle className="text-2xl font-bold text-white">محاكاة الشهر</SheetTitle>
            </SheetHeader>

            {/* Preview Card */}
            <div className="space-y-6 pb-20">
              <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                <h3 className="font-semibold mb-1">معاينة الشهر المختار</h3>
                <p className="text-xs text-slate-400">البيانات تقديرية قبل الحساب الفعلي</p>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-3">
                {isSimulating ? (
                  <>
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="bg-slate-800 rounded-lg p-4 animate-pulse h-20" />
                    ))}
                  </>
                ) : (
                  <>
                    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                      <p className="text-xs text-slate-400 mb-2">إجمالي الأسر المؤهلة</p>
                      <p className="text-2xl font-bold">47 أسرة</p>
                    </div>
                    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                      <p className="text-xs text-slate-400 mb-2">إجمالي القبض المتوقع</p>
                      <p className="text-2xl font-bold text-green-400">ج.م 38,500</p>
                    </div>
                    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                      <p className="text-xs text-slate-400 mb-2">متوسط القبض</p>
                      <p className="text-2xl font-bold">ج.م 819</p>
                    </div>
                    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                      <p className="text-xs text-slate-400 mb-2">أعلى قبض</p>
                      <p className="text-2xl font-bold text-amber-400">ج.م 1,400</p>
                    </div>
                    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                      <p className="text-xs text-slate-400 mb-2">الميزانية المتبقية</p>
                      <p className="text-2xl font-bold text-green-400">ج.م 11,500 ✅</p>
                    </div>
                    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                      <p className="text-xs text-slate-400 mb-2">أقل قبض</p>
                      <p className="text-2xl font-bold">ج.م 250</p>
                    </div>
                  </>
                )}
              </div>

              {/* Category Distribution Chart */}
              <div className="space-y-2">
                <p className="font-semibold text-sm">توزيع الأسر بالفئات</p>
                {isSimulating ? (
                  <div className="bg-slate-800 rounded-lg h-48 animate-pulse" />
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart
                      data={mockCategoryDistribution}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                    >
                      <XAxis type="number" hide />
                      <YAxis type="category" dataKey="nameAr" width={75} tick={{ fontSize: 12 }} />
                      <Bar dataKey="count" fill="#22c55e" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-900 to-transparent border-t border-slate-700 flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setStep(1)}>
                السابق
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
                إلغاء
              </Button>
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 ms-auto gap-2"
                onClick={isSimulating ? undefined : handleSimulate}
                disabled={isSimulating}
              >
                {isSimulating ? (
                  <>محاكاة...</>
                ) : (
                  <>
                    <Play className="w-3 h-3" />
                    بدء الحساب
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

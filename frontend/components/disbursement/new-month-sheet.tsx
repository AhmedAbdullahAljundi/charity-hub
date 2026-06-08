'use client'

import { useState } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts'
import { BarChart2, Wallet, Play, ChevronLeft, CalendarPlus, FileText, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { formatAmount, CATEGORY_LABELS } from '@/lib/disbursement/types'
import { useDisbursementStore } from '@/lib/disbursement/store'
import { motion, AnimatePresence } from 'framer-motion'

interface NewMonthSheetProps {
  open: boolean
  onOpenChange: (v: boolean) => void
}

const ARABIC_MONTHS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
]
const YEARS = [2024, 2025, 2026, 2027, 2028]

const CATEGORY_COLORS_CHART: Record<string, string> = {
  'كفالة أيتام': '#10b981', 'أيتام': '#10b981',
  'ملف إعاقة': '#3b82f6', 'إعاقة': '#3b82f6',
  'طلاب علم': '#8b5cf6', 'طالب علم': '#8b5cf6',
  'أسر سجناء': '#ec4899', 
  'مساعدات': '#f59e0b', 
  'دعم خارجي': '#14b8a6',
  'منفردون': '#f43f5e', 
  'مطلقات': '#d946ef', 
  'مساكين': '#f97316',
  'علاج شهري': '#eab308',
  'مساعدات موسمية': '#14b8a6'
}

function StepIndicator({ currentStep }: { currentStep: 1 | 2 }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm transition-all duration-500 ${currentStep >= 1 ? 'bg-white text-green-700 shadow-md' : 'bg-white/20 text-white/50'}`}>
        {currentStep > 1 ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : '1'}
      </div>
      <div className={`h-1 w-12 rounded-full transition-all duration-500 ${currentStep >= 2 ? 'bg-white' : 'bg-white/20'}`} />
      <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm transition-all duration-500 ${currentStep >= 2 ? 'bg-white text-green-700 shadow-md' : 'bg-white/20 text-white/50'}`}>
        2
      </div>
    </div>
  )
}

export function NewMonthSheet({ open, onOpenChange }: NewMonthSheetProps) {
  const [step, setStep] = useState<1 | 2>(1)
  const [selectedMonth, setSelectedMonth] = useState('')
  const [selectedYear, setSelectedYear]   = useState(new Date().getFullYear().toString())
  const [method, setMethod]               = useState<'VULNERABILITY' | 'PROPORTIONAL'>('VULNERABILITY')
  const [budget, setBudget]               = useState('')
  const [isCreating, setIsCreating]       = useState(false)

  const { simulate, simulation, loading: simLoading, openMonth } = useDisbursementStore()
  const isSimulating = simLoading && !simulation

  const handleNext = () => {
    if (selectedMonth && selectedYear) setStep(2)
  }

  const handleSimulate = async () => {
    const monthIndex = ARABIC_MONTHS.indexOf(selectedMonth) + 1
    const year = parseInt(selectedYear)
    if (!monthIndex || !year) return
    await simulate({
      method,
      totalBudget: method === 'PROPORTIONAL' && budget ? Number(budget) : undefined,
    })
  }

  const reset = () => {
    setStep(1)
    setSelectedMonth('')
    setMethod('VULNERABILITY')
    setBudget('')
  }

  const handleCreate = async () => {
    const monthIndex = ARABIC_MONTHS.indexOf(selectedMonth) + 1
    const year = parseInt(selectedYear)
    if (!monthIndex || !year) return
    const period = `${year}-${String(monthIndex).padStart(2, '0')}-01`
    setIsCreating(true)
    try {
      await openMonth({
        period,
        method,
        totalBudget: method === 'PROPORTIONAL' && budget ? Number(budget) : undefined,
      })
      toast.success('تم فتح الشهر الجديد بنجاح!')
      onOpenChange(false)
      setTimeout(reset, 300)
    } catch (e: any) {
      let errMsg = useDisbursementStore.getState().error || e.message || 'حدث خطأ عند إنشاء الشهر.';
      if (errMsg.includes('409') || errMsg.includes('مفتوح بالفعل')) {
        errMsg = `الشهر المختار (${ARABIC_MONTHS[monthIndex - 1]} ${year}) مضاف مسبقاً ولا يمكن تكراره.`;
      }
      toast.error(errMsg);
    } finally {
      setIsCreating(false)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    setTimeout(reset, 300)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="w-[540px] max-w-[100vw] bg-slate-50 dark:bg-slate-950 border-s border-slate-200 dark:border-slate-800 p-0 flex flex-col shadow-2xl"
      >
        {/* Modern Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-green-500 to-emerald-700 dark:from-green-600 dark:to-emerald-900 px-8 py-8 shadow-md">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-900/20 rounded-full blur-xl"></div>
          
          <div className="relative z-10 flex flex-col gap-5">
            <StepIndicator currentStep={step} />
            <SheetHeader>
              <SheetTitle className="text-3xl font-extrabold text-white text-start flex items-center gap-3 tracking-tight">
                {step === 1 ? <CalendarPlus className="w-8 h-8 opacity-90" /> : <FileText className="w-8 h-8 opacity-90" />}
                {step === 1 ? 'تأسيس شهر جديد' : 'مراجعة ومحاكاة'}
              </SheetTitle>
              <p className="text-green-50 text-sm font-medium text-start opacity-90">
                {step === 1
                  ? 'حدد الفترة الزمنية والطريقة المناسبة للصرف'
                  : 'تأكد من التوقعات والميزانية قبل الاعتماد'}
              </p>
            </SheetHeader>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-8 py-8 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {/* Month & Year Selection */}
                <div className="space-y-3">
                  <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    اختر الشهر والسنة <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex gap-4">
                    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                      <SelectTrigger className="flex-1 h-12 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl shadow-sm focus:ring-green-500">
                        <SelectValue placeholder="الشهر" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl">
                        {ARABIC_MONTHS.map((m, i) => (
                          <SelectItem key={i} value={m} className="rounded-lg">
                            {m}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                      <SelectTrigger className="w-32 h-12 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl shadow-sm focus:ring-green-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl">
                        {YEARS.map((y) => (
                          <SelectItem key={y} value={y.toString()} className="rounded-lg">
                            {y}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Calculation Method Selection */}
                <div className="space-y-4">
                  <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">منهجية الحساب</Label>
                  <RadioGroup value={method} onValueChange={(v) => setMethod(v as typeof method)} className="grid gap-4">
                    
                    {/* VULNERABILITY */}
                    <div
                      className={`relative overflow-hidden rounded-2xl border-2 cursor-pointer transition-all duration-300 p-5 ${
                        method === 'VULNERABILITY'
                          ? 'border-green-500 bg-green-50 dark:bg-green-500/10 shadow-md shadow-green-500/10'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm'
                      }`}
                      onClick={() => setMethod('VULNERABILITY')}
                    >
                      {method === 'VULNERABILITY' && <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 blur-2xl rounded-full"></div>}
                      <div className="relative z-10 flex items-start gap-4">
                        <RadioGroupItem value="VULNERABILITY" className="mt-1 border-slate-400 data-[state=checked]:border-green-600 data-[state=checked]:text-green-600" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1.5">
                            <div className={`p-1.5 rounded-lg ${method === 'VULNERABILITY' ? 'bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                              <BarChart2 className="h-4 w-4" />
                            </div>
                            <span className={`font-bold text-base ${method === 'VULNERABILITY' ? 'text-green-800 dark:text-green-300' : 'text-slate-700 dark:text-slate-300'}`}>
                              تلقائي حسب الاستحقاق
                            </span>
                            <span className="text-[10px] font-bold bg-gradient-to-r from-emerald-500 to-green-600 text-white px-2 py-0.5 rounded-full shadow-sm">
                              موصى به
                            </span>
                          </div>
                          <p className={`text-sm leading-relaxed ${method === 'VULNERABILITY' ? 'text-green-700/80 dark:text-green-400/80' : 'text-slate-500 dark:text-slate-400'}`}>
                            يتم حساب القبض لكل أسرة بناءً على درجة هشاشتها وتصنيفها والمنح المستحقة بشكل أوتوماتيكي.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* PROPORTIONAL */}
                    <div
                      className={`relative overflow-hidden rounded-2xl border-2 cursor-pointer transition-all duration-300 p-5 ${
                        method === 'PROPORTIONAL'
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 shadow-md shadow-indigo-500/10'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm'
                      }`}
                      onClick={() => setMethod('PROPORTIONAL')}
                    >
                      {method === 'PROPORTIONAL' && <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/10 blur-2xl rounded-full"></div>}
                      <div className="relative z-10 flex items-start gap-4">
                        <RadioGroupItem value="PROPORTIONAL" className="mt-1 border-slate-400 data-[state=checked]:border-indigo-600 data-[state=checked]:text-indigo-600" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1.5">
                            <div className={`p-1.5 rounded-lg ${method === 'PROPORTIONAL' ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                              <Wallet className="h-4 w-4" />
                            </div>
                            <span className={`font-bold text-base ${method === 'PROPORTIONAL' ? 'text-indigo-800 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'}`}>
                              توزيع ميزانية مخصصة
                            </span>
                          </div>
                          <p className={`text-sm leading-relaxed ${method === 'PROPORTIONAL' ? 'text-indigo-700/80 dark:text-indigo-400/80' : 'text-slate-500 dark:text-slate-400'}`}>
                            أدخل ميزانية الشهر الكلية وسيتم توزيعها بشكل تناسبي على الأسر المؤهلة بناءً على استحقاقهم.
                          </p>
                        </div>
                      </div>
                    </div>
                  </RadioGroup>

                  {/* Budget input */}
                  <AnimatePresence>
                    {method === 'PROPORTIONAL' && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        className="space-y-2 overflow-hidden"
                      >
                        <Label htmlFor="budget-input" className="text-sm font-bold text-slate-700 dark:text-slate-300">
                          الميزانية الكلية للتوزيع (ج.م)
                        </Label>
                        <Input
                          id="budget-input"
                          type="number"
                          min={0}
                          step={500}
                          placeholder="مثال: 150000"
                          value={budget}
                          onChange={(e) => setBudget(e.target.value)}
                          className="h-12 rounded-xl text-lg font-mono bg-white dark:bg-slate-900 border-indigo-200 dark:border-indigo-800 text-slate-900 dark:text-white focus-visible:ring-indigo-500"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Simulation Summary Card */}
                <div className="rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800 p-5 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="font-bold text-lg text-slate-800 dark:text-white">توقعات شهر {selectedMonth} {selectedYear}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${method === 'VULNERABILITY' ? 'bg-green-500' : 'bg-indigo-500'}`}></span>
                      {method === 'VULNERABILITY' ? 'حساب تلقائي حسب الهشاشة' : `توزيع ميزانية: ${formatAmount(budget || 0)}`}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-xl border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold"
                    onClick={handleSimulate}
                    disabled={isSimulating}
                  >
                    <Play className="h-4 w-4 ms-2 text-slate-500" />
                    {isSimulating ? 'تحديث...' : 'إعادة المحاكاة'}
                  </Button>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {isSimulating
                    ? [...Array(6)].map((_, i) => (
                        <div key={i} className="h-24 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
                      ))
                    : simulation
                    ? (
                      <>
                        <MetricTile 
                          label="الأسر المؤهلة" 
                          value={simulation.eligibleCount.toString()} 
                          suffix="أسرة" 
                          icon="users"
                          description="عدد الأسر المستحقة التي تم شمولها في المحاكاة بناءً على الفلاتر وقواعد الاستحقاق."
                        />
                        <MetricTile 
                          label="الإجمالي المطلوب" 
                          value={formatAmount(simulation.totalRequired)} 
                          accent="emerald" 
                          icon="wallet"
                          description="الميزانية الإجمالية التقديرية المطلوبة لتغطية كافة الأسر بناءً على المحاكاة."
                        />
                        <MetricTile 
                          label="متوسط الصرف" 
                          value={formatAmount(simulation.averagePayment)} 
                          icon="average"
                          description="متوسط ما ستحصل عليه الأسرة الواحدة (الإجمالي ÷ عدد الأسر)، وهو مؤشر لمدى كفاية الميزانية."
                        />
                        <MetricTile 
                          label="أعلى مبلغ للأسرة" 
                          value={formatAmount(simulation.maxPayment)} 
                          accent="amber"
                          description="أقصى مبلغ ستأخذه أسرة واحدة، ويساعد في التأكد من فعالية القيود القصوى (Caps)."
                        />
                        <MetricTile 
                          label="أقل مبلغ للأسرة" 
                          value={formatAmount(simulation.minPayment)}
                          description="أقل مبلغ مخصص لأسرة، لتنبيهك إذا كانت هناك أسر ستحصل على مبالغ زهيدة جداً لا تكفي لاحتياجاتها."
                        />
                        {simulation.surplus != null && (
                          <MetricTile
                            label={simulation.surplus >= 0 ? 'فائض الميزانية' : 'عجز الميزانية'}
                            value={formatAmount(Math.abs(simulation.surplus))}
                            accent={simulation.surplus >= 0 ? 'emerald' : 'rose'}
                            suffix={simulation.surplus >= 0 ? '✅' : '⚠️'}
                            description={simulation.surplus >= 0 ? 'المبلغ المتبقي من الميزانية المحددة بعد التوزيع.' : 'المبلغ الناقص عن الميزانية لتغطية الحدود الدنيا للأسر.'}
                          />
                        )}
                        {simulation.deficit != null && simulation.surplus == null && (
                          <MetricTile
                            label="عجز الميزانية"
                            value={formatAmount(Math.abs(simulation.deficit))}
                            accent="rose"
                            suffix="⚠️"
                            description="المبلغ الإضافي المطلوب للوصول بالصرف إلى الحدود الدنيا المسموح بها للأسر."
                          />
                        )}
                        {simulation.appliedBoost != null && simulation.appliedBoost > 0 && (
                          <MetricTile
                            label="نسبة الرفع المطبقة (Boost)"
                            value={`${simulation.appliedBoost}%`}
                            accent="indigo"
                            icon="trending-up"
                            description="نسبة الزيادة التي تم إضافتها تلقائياً على حدود الصرف لاستغلال الميزانية بأفضل شكل."
                          />
                        )}
                      </>
                    ) : (
                      <div className="col-span-2 flex flex-col items-center justify-center h-32 rounded-2xl bg-slate-100/50 dark:bg-slate-900/50 border-2 border-dashed border-slate-300 dark:border-slate-800">
                        <Play className="w-8 h-8 text-slate-300 mb-2" />
                        <p className="text-sm font-medium text-slate-500">اضغط "بدء المحاكاة" بالأسفل لمعرفة التوقعات</p>
                      </div>
                    )}
                </div>

                {/* Chart */}
                {simulation && !isSimulating && simulation.byCategory.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 px-1">توزيع الفئات على المساعدات (الصرف المالي)</h3>
                    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                      <ResponsiveContainer width="100%" height={Math.max(220, simulation.byCategory.length * 45)}>
                        <BarChart
                          data={simulation.byCategory.map(c => ({
                            nameAr: CATEGORY_LABELS[c.category] ?? c.category,
                            count: c.count,
                            fill: CATEGORY_COLORS_CHART[c.category] ?? '#94a3b8',
                          }))}
                          layout="vertical"
                          margin={{ top: 0, right: 110, left: 20, bottom: 0 }}
                        >
                          <XAxis type="number" hide />
                          <YAxis 
                            type="category" 
                            dataKey="nameAr" 
                            orientation="right"
                            width={110} 
                            tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} 
                            axisLine={false} 
                            tickLine={false}
                          />
                          <Tooltip 
                            cursor={{fill: 'transparent'}}
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div className="bg-slate-900 border border-slate-700 text-white rounded-xl p-3 shadow-xl">
                                    <p className="text-sm font-bold mb-1">{payload[0].payload.nameAr}</p>
                                    <p className="text-xs text-slate-400">
                                      عدد الأسر: <span className="text-white font-bold">{payload[0].value}</span>
                                    </p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={24}>
                            {simulation.byCategory.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={CATEGORY_COLORS_CHART[entry.category] ?? '#94a3b8'} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Modern Footer */}
        <div className="border-t border-slate-200 dark:border-slate-800 px-8 py-5 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
          {step === 1 ? (
            <>
              <Button variant="ghost" className="rounded-xl font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white" onClick={handleClose}>
                إلغاء التأسيس
              </Button>
              <Button
                className="rounded-xl h-12 px-8 bg-green-600 hover:bg-green-700 text-white font-bold shadow-md shadow-green-500/20"
                disabled={!selectedMonth || !selectedYear || (method === 'PROPORTIONAL' && !budget)}
                onClick={handleNext}
              >
                متابعة للمحاكاة
                <ChevronLeft className="h-5 w-5 ms-2" />
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                className="rounded-xl font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white"
                onClick={() => setStep(1)}
              >
                السابق
              </Button>
              
              {!simulation ? (
                <Button
                  className="rounded-xl h-12 px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-500/20"
                  onClick={handleSimulate}
                  disabled={isSimulating}
                >
                  {isSimulating ? 'جاري المحاكاة...' : 'بدء المحاكاة الأولية'}
                </Button>
              ) : (
                <Button
                  className="rounded-xl h-12 px-8 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold shadow-lg shadow-green-500/30"
                  onClick={handleCreate}
                  disabled={isCreating}
                >
                  {isCreating ? 'جاري الاعتماد...' : 'اعتماد وإنشاء الشهر'}
                </Button>
              )}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

function MetricTile({
  label,
  value,
  accent,
  suffix,
  icon
}: {
  label: string
  value: string
  accent?: 'emerald' | 'amber' | 'rose'
  suffix?: string
  icon?: 'users' | 'wallet' | 'average' | 'trending-up'
  description?: string
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 shadow-sm hover:shadow-md transition-shadow group">
      <div className="relative z-10">
        <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">{label}</p>
        <p className={`text-xl font-black font-mono tracking-tight ${
          accent === 'emerald' ? 'text-emerald-600 dark:text-emerald-400' :
          accent === 'amber' ? 'text-amber-600 dark:text-amber-400' :
          accent === 'rose' ? 'text-rose-600 dark:text-rose-400' :
          accent === 'indigo' ? 'text-indigo-600 dark:text-indigo-400' :
          'text-slate-800 dark:text-white'
        }`}>
          {value} {suffix && <span className="text-sm font-medium opacity-80 ms-1">{suffix}</span>}
        </p>
        {description && (
          <p className="mt-2 text-[10px] leading-relaxed text-slate-400 opacity-0 max-h-0 overflow-hidden group-hover:opacity-100 group-hover:max-h-20 transition-all duration-300">
            {description}
          </p>
        )}
      </div>
      {/* Decorative background circle depending on accent */}
      {accent && (
        <div className={`absolute -bottom-4 -left-4 w-16 h-16 rounded-full blur-xl opacity-20 ${
          accent === 'emerald' ? 'bg-emerald-500' : 
          accent === 'amber' ? 'bg-amber-500' : 'bg-rose-500'
        }`}></div>
      )}
    </div>
  )
}

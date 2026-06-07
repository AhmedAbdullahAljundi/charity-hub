'use client'

import { Button } from '@/components/ui/button'
import { ArrowRight, Download, FileText, RefreshCw, CheckCircle, Unlock, AlertTriangle, Lock, Eye, Pencil, Building2, Search, X } from 'lucide-react'
import Link from 'next/link'
import { mockMonths } from '@/lib/data'
import { useState, use } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Separator } from '@/components/ui/separator'
import { formatPeriod, formatAmount, getVulnerabilityColor } from '@/lib/utils-charity'
import { EnhancedPaymentTable } from '@/components/dashboard/enhanced-payment-table'

export default function MonthDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const month = mockMonths.find((m) => m.id === id)
  
  // Dialog states
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showReopenDialog, setShowReopenDialog] = useState(false)
  const [showAdjustmentDialog, setShowAdjustmentDialog] = useState(false)
  const [selectedFamilyForAdjustment, setSelectedFamilyForAdjustment] = useState<string | null>(null)
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all')
  const [externalOnly, setExternalOnly] = useState(false)

  if (!month) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">الشهر غير موجود</h1>
          <Link href="/">
            <Button variant="outline">العودة للرئيسية</Button>
          </Link>
        </div>
      </div>
    )
  }

  const totalSpent = month.families.reduce((sum, f) => sum + f.finalAmount, 0)
  const percentSpent = Math.round((totalSpent / month.totalBudget) * 100)

  // Filter families based on search and filters
  const filteredFamilies = month.families.filter(family => {
    const matchesSearch = family.code.includes(searchQuery) || family.name.includes(searchQuery)
    const matchesCategory = categoryFilter === 'all' || family.category === categoryFilter
    const matchesPaymentStatus = paymentStatusFilter === 'all' || family.meezaStatus === paymentStatusFilter
    const matchesExternal = !externalOnly || family.externalTotal > 0
    
    return matchesSearch && matchesCategory && matchesPaymentStatus && matchesExternal
  })

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header with Teal Background */}
      <div className="bg-teal-700 dark:bg-teal-900 text-white px-6 py-8 mb-8">
        <Link href="/">
          <Button variant="ghost" className="mb-4 text-white hover:bg-white/20">
            <ArrowRight className="w-4 h-4 ms-2" />
            العودة
          </Button>
        </Link>
        
        {/* Header Title and Status */}
        <div className="flex items-start justify-between mb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{formatPeriod(month.period)}</h1>
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                month.status === 'CALCULATED' ? 'bg-blue-500/30 border border-blue-400 text-blue-200'
                : month.status === 'APPROVED' ? 'bg-green-500/30 border border-green-400 text-green-200'
                : 'bg-yellow-500/30 border border-yellow-400 text-yellow-200'
              }`}>
                {month.status === 'CALCULATED' ? 'محسوب' : month.status === 'APPROVED' ? 'معتمد' : 'قيد التخطيط'}
              </span>
              {month.status === 'APPROVED' && (
                <div className="flex items-center gap-1 text-xs text-amber-300">
                  <Lock className="h-3 w-3" />
                  معتمد ومقفل
                </div>
              )}
            </div>
            <p className="text-teal-100 text-sm">
              {month.method === 'PROPORTIONAL' ? 'طريقة: توزيع الميزانية' : 'طريقة: حسب الهشاشة'}
              {month.totalBudget && ` · الميزانية: ${formatAmount(month.totalBudget)}`}
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="border-white/30 text-white hover:bg-white/10">
              <Download className="h-4 w-4 ms-1" />
              تصدير ميزة
            </Button>
            <Button variant="outline" size="sm" className="border-white/30 text-white hover:bg-white/10">
              <FileText className="h-4 w-4 ms-1" />
              كشف النقدي
            </Button>
            
            {month.status === 'CALCULATED' && (
              <>
                <Button variant="outline" size="sm" className="border-white/30 text-white hover:bg-white/10">
                  <RefreshCw className="h-4 w-4 ms-1" />
                  إعادة الحساب
                </Button>
                <Button size="sm" className="bg-white hover:bg-slate-100 text-teal-700" onClick={() => setShowApproveDialog(true)}>
                  <CheckCircle className="h-4 w-4 ms-1" />
                  اعتماد الشهر
                </Button>
              </>
            )}
            
            {month.status === 'APPROVED' && (
              <Button variant="outline" size="sm" className="border-amber-600 text-amber-300 hover:bg-amber-600/20" onClick={() => setShowReopenDialog(true)}>
                <Unlock className="h-4 w-4 ms-1" />
                إعادة الفتح
              </Button>
            )}
          </div>
        </div>
      </div>

      <main className="px-6 py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Summary Bar */}
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">عدد الأسر المشمولة</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{month.families.length}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">إجمالي المصروف</p>
              <p className="text-2xl font-bold text-green-600">{formatAmount(totalSpent)}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">الميزانية المتبقية</p>
              <p className={`text-2xl font-bold ${totalSpent <= month.totalBudget ? 'text-green-600' : 'text-red-600'}`}>
                {formatAmount(Math.max(0, month.totalBudget - totalSpent))}
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">نسبة الاستخدام</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{percentSpent}%</p>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 flex-wrap">
              {/* Search */}
              <div className="relative flex-1 min-w-48">
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input placeholder="رقم القيد أو اسم الأسرة..." className="ps-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>

              {/* Category filter */}
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="الفئة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كل الفئات</SelectItem>
                  <SelectItem value="أيتام">أيتام</SelectItem>
                  <SelectItem value="إعاقة">إعاقة</SelectItem>
                  <SelectItem value="طالب علم">طالب علم</SelectItem>
                  <SelectItem value="سجناء">سجناء</SelectItem>
                  <SelectItem value="مساعدات">مساعدات</SelectItem>
                  <SelectItem value="دعم خارجي">دعم خارجي</SelectItem>
                </SelectContent>
              </Select>

              {/* Payment status filter */}
              <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="حالة الصرف" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="PENDING">معلق</SelectItem>
                  <SelectItem value="PAID">تم الصرف</SelectItem>
                  <SelectItem value="FAILED">فشل</SelectItem>
                </SelectContent>
              </Select>

              {/* External contributions filter */}
              <Button 
                variant={externalOnly ? "default" : "outline"} 
                size="sm" 
                className="gap-1.5"
                onClick={() => setExternalOnly(!externalOnly)}
              >
                <Building2 className="h-3.5 w-3.5" />
                مساهمات خارجية
              </Button>

              {/* Reset */}
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-slate-400"
                onClick={() => {
                  setSearchQuery('')
                  setCategoryFilter('all')
                  setPaymentStatusFilter('all')
                  setExternalOnly(false)
                }}
              >
                <X className="h-3.5 w-3.5 ms-1" />
                إعادة تعيين
              </Button>
            </div>
          </div>

          {/* Payment Table */}
          <TooltipProvider>
            <EnhancedPaymentTable 
              families={filteredFamilies} 
              isApproved={month.status === 'APPROVED'}
              onAdjustment={(familyId) => {
                setSelectedFamilyForAdjustment(familyId)
                setShowAdjustmentDialog(true)
              }}
            />
          </TooltipProvider>
        </div>
      </main>

      {/* Approve Dialog */}
      <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <AlertDialogContent className="bg-slate-900 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">اعتماد شهر {formatPeriod(month.period)}</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم قفل الشهر بعد الاعتماد ولن يمكن إجراء تعديلات على القبض. تأكد من مراجعة جميع البيانات قبل المتابعة.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2">
            <Label className="text-white">ملاحظات (اختياري)</Label>
            <Textarea placeholder="أي ملاحظات على شهر الصرف..." rows={2} className="mt-1.5 bg-slate-800 border-slate-700 text-white" />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-800 border-slate-700 text-white">إلغاء</AlertDialogCancel>
            <AlertDialogAction className="bg-green-600 hover:bg-green-700">تأكيد الاعتماد</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reopen Dialog */}
      <Dialog open={showReopenDialog} onOpenChange={setShowReopenDialog}>
        <DialogContent className="bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-400">
              <AlertTriangle className="h-5 w-5" />
              إعادة فتح الشهر المعتمد
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-slate-400">
              ستتم إزالة اعتماد هذا الشهر وإعادته لحالة "محسوب". هذا الإجراء مقيد بصلاحيات المدير فقط.
            </p>
            <div className="space-y-1.5">
              <Label className="text-white">سبب إعادة الفتح</Label>
              <Textarea placeholder="اذكر سبب إعادة فتح الشهر..." rows={3} className="bg-slate-800 border-slate-700 text-white" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReopenDialog(false)}>إلغاء</Button>
            <Button className="bg-amber-600 hover:bg-amber-700">
              <Unlock className="h-4 w-4 ms-1" />
              إعادة الفتح
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manual Adjustment Dialog */}
      {selectedFamilyForAdjustment && (
        <ManualAdjustmentDialog 
          open={showAdjustmentDialog} 
          onOpenChange={setShowAdjustmentDialog}
          family={month.families.find(f => f.id === selectedFamilyForAdjustment)!}
          isApproved={month.status === 'APPROVED'}
        />
      )}
    </div>
  )
}

// Manual Adjustment Dialog Component
function ManualAdjustmentDialog({ open, onOpenChange, family, isApproved }: { open: boolean; onOpenChange: (v: boolean) => void; family: any; isApproved: boolean }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white">تعديل قبض الأسرة</DialogTitle>
          <DialogDescription>
            رقم القيد: {family.code} — {family.name}
          </DialogDescription>
        </DialogHeader>

        {isApproved ? (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-amber-950/30 border border-amber-800/30">
            <Lock className="h-5 w-5 text-amber-500" />
            <div>
              <p className="text-amber-400 font-medium text-sm">الشهر معتمد</p>
              <p className="text-slate-400 text-xs">لا يمكن إجراء تعديلات على شهر معتمد</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {/* Readonly summary */}
            <div className="rounded-lg bg-slate-800 p-3 space-y-2 text-sm border border-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-400">القبض المحسوب</span>
                <span className="font-mono">{formatAmount(family.calculatedAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">التعديل الحالي</span>
                <span className={`font-mono ${family.manualAdjustment >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {family.manualAdjustment >= 0 ? '+' : ''}{formatAmount(family.manualAdjustment)}
                </span>
              </div>
              <Separator className="bg-slate-700" />
              <div className="flex justify-between font-semibold text-white">
                <span>الإجمالي النهائي</span>
                <span className="text-green-400">{formatAmount(family.finalAmount)}</span>
              </div>
            </div>

            {/* Adjustment input */}
            <div className="space-y-2">
              <Label className="text-white">التعديل اليدوي (ج.م)</Label>
              <Input 
                type="number" 
                step="0.01"
                placeholder="أدخل قيمة موجبة للزيادة أو سالبة للخصم"
                className="bg-slate-800 border-slate-700 text-white"
              />
              <p className="text-xs text-slate-500">مثال: 100 للزيادة، أو -50 للخصم من المبلغ المحسوب</p>
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <Label className="text-white">سبب التعديل <span className="text-red-400">*</span></Label>
              <Textarea 
                placeholder="اذكر سبب التعديل بوضوح..."
                rows={3}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>

            {/* Fund source */}
            <div className="space-y-2">
              <Label className="text-white">مصدر التمويل</Label>
              <Select defaultValue="GENERAL">
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="GENERAL">عام</SelectItem>
                  <SelectItem value="ZAKAT">زكاة</SelectItem>
                  <SelectItem value="SADAQA">صدقة</SelectItem>
                  <SelectItem value="ORPHAN_FUND">صندوق الأيتام</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>إلغاء</Button>
          {!isApproved && <Button className="bg-green-600 hover:bg-green-700">حفظ التعديل</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

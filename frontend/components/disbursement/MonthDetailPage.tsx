'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { toast } from 'sonner'
import {
  ArrowLeft, Lock, Download, FileText, RefreshCw,
  CheckCircle, Unlock, AlertTriangle, Search, X, Building2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { StatusBadge } from '@/components/disbursement/status-badge'
import { PaymentTable } from '@/components/disbursement/payment-table'
import { formatPeriod, formatAmount, CATEGORY_LABELS } from '@/lib/disbursement/types'
import { useDisbursementStore } from '@/lib/disbursement/store'
import { getMeezaExportUrl } from '@/lib/api/disbursement-api'

interface MonthDetailPageProps {
  params: Promise<{ id: string }>
}

export function MonthDetailPage({ params }: MonthDetailPageProps) {
  const { id } = use(params)
  const locale  = useLocale()

  const {
    currentMonth, payments, loading, calculating, error,
    fetchMonth, calculateMonth, approveMonth, reopenMonth, clearError,
  } = useDisbursementStore()

  // Dialog states
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showReopenDialog,  setShowReopenDialog]  = useState(false)
  const [approveNotes,      setApproveNotes]       = useState('')
  const [reopenReason,      setReopenReason]       = useState('')
  const [approving,         setApproving]          = useState(false)
  const [reopening,         setReopening]          = useState(false)

  // Filter states
  const [search,          setSearch]          = useState('')
  const [categoryFilter,  setCategoryFilter]  = useState('all')
  const [paymentFilter,   setPaymentFilter]   = useState<'all' | 'meeza' | 'cash' | 'pending'>('all')

  useEffect(() => {
    fetchMonth(id)
  }, [id, fetchMonth])

  useEffect(() => {
    if (error) { toast.error(error); clearError() }
  }, [error, clearError])

  const handleCalculate = async () => {
    try {
      await calculateMonth(id)
      toast.success('تم الحساب بنجاح')
    } catch { /* error already in store */ }
  }

  const handleApprove = async () => {
    setApproving(true)
    try {
      await approveMonth(id, approveNotes || undefined)
      toast.success('تم اعتماد الشهر')
      setShowApproveDialog(false)
      setApproveNotes('')
    } catch { /* error already in store */ }
    finally { setApproving(false) }
  }

  const handleReopen = async () => {
    if (!reopenReason.trim()) { toast.error('سبب إعادة الفتح مطلوب'); return }
    setReopening(true)
    try {
      await reopenMonth(id, reopenReason)
      toast.success('تم إعادة فتح الشهر')
      setShowReopenDialog(false)
      setReopenReason('')
    } catch { /* error already in store */ }
    finally { setReopening(false) }
  }

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading && !currentMonth) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-slate-400">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <p className="text-sm">جاري التحميل...</p>
      </div>
    )
  }

  // ── Not found ──────────────────────────────────────────────────────────────
  if (!currentMonth) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <div className="text-5xl">🔍</div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">الشهر غير موجود</h2>
        <Link href={`/${locale}/dashboard/disbursement`}>
          <Button variant="outline">العودة للقائمة</Button>
        </Link>
      </div>
    )
  }

  const isApproved   = currentMonth.status === 'APPROVED' || currentMonth.status === 'PAID'
  const totalFinal   = payments.reduce((s, p) => s + Number(p.finalAmount), 0)
  const totalMeeza   = payments.reduce((s, p) => s + Number(p.meezaAmount), 0)
  const totalCash    = payments.reduce((s, p) => s + Number(p.cashAmount), 0)
  const unpaidCount  = payments.filter(p => p.meezaStatus === 'PENDING' || p.cashStatus === 'PENDING').length

  // Apply filters
  const filtered = payments.filter((p) => {
    const code    = p.household?.code ?? ''
    const name    = p.household?.familyName ?? ''
    const matchSearch   = !search || code.toLowerCase().includes(search.toLowerCase()) || name.includes(search)
    const matchCategory = categoryFilter === 'all' || p.category === categoryFilter
    const matchPayment  =
      paymentFilter === 'all' ||
      (paymentFilter === 'meeza'   && Number(p.meezaAmount) > 0) ||
      (paymentFilter === 'cash'    && Number(p.cashAmount) > 0) ||
      (paymentFilter === 'pending' && (p.meezaStatus === 'PENDING' || p.cashStatus === 'PENDING'))
    return matchSearch && matchCategory && matchPayment
  })

  const resetFilters   = () => { setSearch(''); setCategoryFilter('all'); setPaymentFilter('all') }
  const hasActiveFilters = search || categoryFilter !== 'all' || paymentFilter !== 'all'

  return (
    <div className="space-y-6">
      {/* Back + Header */}
      <div>
        <Link href={`/${locale}/dashboard/disbursement`}>
          <Button
            variant="ghost" size="sm"
            className="mb-3 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white gap-1.5 px-2"
          >
            <ArrowLeft className="h-4 w-4" />
            الصرف المالي
          </Button>
        </Link>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {formatPeriod(currentMonth.period)}
            </h1>
            <StatusBadge status={currentMonth.status} />
            {isApproved && (
              <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                <Lock className="h-3.5 w-3.5" />
                معتمد ومقفل
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            {/* Calculate / Recalculate */}
            {(currentMonth.status === 'DRAFT' || currentMonth.status === 'CALCULATED') && (
              <Button
                variant="outline" size="sm"
                className="gap-1.5 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300"
                onClick={handleCalculate}
                disabled={calculating}
              >
                <RefreshCw className={`h-4 w-4 ${calculating ? 'animate-spin' : ''}`} />
                {currentMonth.status === 'DRAFT' ? 'احسب الشهر' : 'إعادة الحساب'}
              </Button>
            )}

            {/* Approve */}
            {currentMonth.status === 'CALCULATED' && (
              <Button
                size="sm"
                className="gap-1.5 bg-green-600 hover:bg-green-700 text-white"
                onClick={() => setShowApproveDialog(true)}
                disabled={loading}
              >
                <CheckCircle className="h-4 w-4" />
                اعتماد الشهر
              </Button>
            )}

            {/* Export Meeza */}
            {(currentMonth.status === 'APPROVED' || currentMonth.status === 'PAID') && (
              <>
                <a href={getMeezaExportUrl(currentMonth.id)} download>
                  <Button
                    variant="outline" size="sm"
                    className="gap-1.5 border-blue-200 text-blue-600 dark:border-blue-800 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  >
                    <Download className="h-4 w-4" />
                    تصدير ميزة
                  </Button>
                </a>
                <Button
                  variant="outline" size="sm"
                  className="gap-1.5 border-amber-200 text-amber-600 dark:border-amber-800 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                >
                  <FileText className="h-4 w-4" />
                  كشف النقدي
                </Button>
              </>
            )}

            {/* Reopen */}
            {currentMonth.status === 'APPROVED' && (
              <Button
                variant="outline" size="sm"
                className="gap-1.5 border-amber-300 text-amber-600 dark:border-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                onClick={() => setShowReopenDialog(true)}
              >
                <Unlock className="h-4 w-4" />
                إعادة الفتح
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'عدد الأسر',      value: payments.length.toLocaleString('en-US'),     color: 'text-slate-800 dark:text-white' },
          { label: 'إجمالي القبض',   value: formatAmount(totalFinal),                   color: 'text-green-600 dark:text-green-400' },
          { label: 'تحويلات ميزة',   value: formatAmount(totalMeeza),                   color: 'text-blue-600 dark:text-blue-400' },
          { label: 'نقدي في المقر',  value: formatAmount(totalCash),                    color: 'text-amber-600 dark:text-amber-400' },
        ].map((item, idx) => (
          <div key={item.label} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 py-4 shadow-sm">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{item.label}</p>
            <p className={`text-xl font-bold font-mono ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 py-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="رقم القيد أو اسم الأسرة..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ps-9 h-9 border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm"
              id="input-search-families"
            />
          </div>

          {/* Category filter */}
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-36 h-9 text-sm border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700" id="select-category-filter">
              <SelectValue placeholder="الفئة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل الفئات</SelectItem>
              {Object.entries(CATEGORY_LABELS).map(([code, label]) => (
                <SelectItem key={code} value={code}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Payment filter */}
          <Select value={paymentFilter} onValueChange={(v) => setPaymentFilter(v as typeof paymentFilter)}>
            <SelectTrigger className="w-36 h-9 text-sm border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700" id="select-payment-filter">
              <SelectValue placeholder="حالة الصرف" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">الكل</SelectItem>
              <SelectItem value="meeza">ميزة</SelectItem>
              <SelectItem value="cash">نقدي</SelectItem>
              <SelectItem value="pending">معلق</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" className="gap-1.5 h-9 text-sm border-slate-200 dark:border-slate-600">
            <Building2 className="h-3.5 w-3.5" />
            مساهمات خارجية
          </Button>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" className="h-9 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 gap-1" onClick={resetFilters}>
              <X className="h-3.5 w-3.5" />
              إعادة تعيين
            </Button>
          )}

          <span className="ms-auto text-xs text-slate-500 dark:text-slate-400 shrink-0">
            {filtered.length} / {payments.length} أسرة
          </span>
        </div>
      </div>

      {/* Payment Table */}
      <PaymentTable families={filtered} isApproved={isApproved} monthId={id} />

      {/* Approve Dialog */}
      <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <AlertDialogContent className="bg-slate-900 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              اعتماد شهر {formatPeriod(currentMonth.period)}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              سيتم قفل الشهر بعد الاعتماد ولن يمكن إجراء تعديلات. تأكد من مراجعة جميع البيانات قبل المتابعة.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2">
            <Label className="text-white text-sm">ملاحظات (اختياري)</Label>
            <Textarea
              placeholder="أي ملاحظات على شهر الصرف..."
              rows={2}
              value={approveNotes}
              onChange={(e) => setApproveNotes(e.target.value)}
              className="mt-1.5 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 resize-none"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700">
              إلغاء
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={handleApprove}
              disabled={approving}
            >
              {approving ? 'جاري الاعتماد...' : 'تأكيد الاعتماد'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reopen Dialog */}
      <Dialog open={showReopenDialog} onOpenChange={setShowReopenDialog}>
        <DialogContent className="bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-amber-400 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              إعادة فتح الشهر المعتمد
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-slate-400">
              ستتم إزالة اعتماد هذا الشهر وإعادته لحالة &quot;محسوب&quot;. هذا الإجراء مقيد بصلاحيات المدير.
            </p>
            <div className="space-y-1.5">
              <Label className="text-white text-sm">سبب إعادة الفتح <span className="text-red-400">*</span></Label>
              <Textarea
                placeholder="اذكر سبب إعادة فتح الشهر..."
                rows={3}
                value={reopenReason}
                onChange={(e) => setReopenReason(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
              onClick={() => setShowReopenDialog(false)}
            >
              إلغاء
            </Button>
            <Button
              className="bg-amber-600 hover:bg-amber-700 text-white gap-1.5"
              onClick={handleReopen}
              disabled={reopening || !reopenReason.trim()}
            >
              <Unlock className="h-4 w-4" />
              {reopening ? 'جاري...' : 'إعادة الفتح'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

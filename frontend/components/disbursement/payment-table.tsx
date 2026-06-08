'use client'

import { useState } from 'react'
import { Pencil, Building2, ChevronDown, ChevronUp, Trash2, Info } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { CategoryBadge } from '@/components/disbursement/category-badge'
import { formatAmount, PAYMENT_STATUS_CONFIG } from '@/lib/disbursement/types'
import type { MonthlyPayment, PaymentStatus, FundSource } from '@/lib/disbursement/types'
import { useDisbursementStore } from '@/lib/disbursement/store'
import { Lock, Loader2 } from 'lucide-react'

// Helper to color vulnerability score
export const getVulnerabilityColor = (scoreStr: string | number): string => {
  const score = Number(scoreStr)
  if (score >= 80) return 'bg-rose-500'
  if (score >= 60) return 'bg-orange-500'
  if (score >= 40) return 'bg-amber-500'
  if (score >= 20) return 'bg-blue-500'
  return 'bg-slate-400'
}

export const getVulnerabilityTextColor = (scoreStr: string | number): string => {
  const score = Number(scoreStr)
  if (score >= 80) return 'text-rose-600'
  if (score >= 60) return 'text-orange-600'
  if (score >= 40) return 'text-amber-600'
  if (score >= 20) return 'text-blue-600'
  return 'text-slate-500'
}

interface PaymentTableProps {
  families: MonthlyPayment[]
  isApproved: boolean
  monthId: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isValidLuhn(value: string) {
  if (!/^\d+$/.test(value)) return false;
  let sum = 0;
  let shouldDouble = false;
  for (let i = value.length - 1; i >= 0; i--) {
    let digit = parseInt(value.charAt(i), 10);
    if (shouldDouble) {
      if ((digit *= 2) > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

// ─── Adjustment Dialog ────────────────────────────────────────────────────────

function AdjustmentDialog({
  open,
  onOpenChange,
  payment,
  isApproved,
  monthId,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  payment: MonthlyPayment
  isApproved: boolean
  monthId: string
}) {
  const [adjustment, setAdjustment] = useState(payment.manualAdjustment || '0')
  const [reason, setReason] = useState(payment.adjustmentReason || '')
  const [fundSource, setFundSource] = useState<FundSource>(payment.fundSource || 'GENERAL')
  const [meezaCardNumber, setMeezaCardNumber] = useState(payment.meezaCardNumber || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { adjustPayment } = useDisbursementStore()

  const handleSave = async () => {
    if (!reason.trim()) { toast.error('الرجاء إدخال سبب التعديل'); return }
    
    const cardNum = meezaCardNumber.replace(/\s/g, '');
    if (cardNum) {
      if (!/^\d{16}$/.test(cardNum)) {
        toast.error('رقم الكارت يجب أن يتكون من 16 رقماً فقط');
        return;
      }
      if (!isValidLuhn(cardNum)) {
        toast.error('رقم الكارت غير صالح (تأكد من كتابة الأرقام بشكل صحيح)');
        return;
      }
      const familiarPrefixes = ['5078', '4', '51', '52', '53', '54', '55'];
      if (!familiarPrefixes.some(prefix => cardNum.startsWith(prefix))) {
        toast.error('رقم الكارت غير مدعوم أو غير صحيح. يجب أن يبدأ الكارت بأرقام البنوك المتعارف عليها (ميزة، فيزا، أو ماستركارد)');
        return;
      }
    }

    setIsSubmitting(true)
    try {
      await adjustPayment(monthId, payment.id, {
        manualAdjustment: Number(adjustment),
        adjustmentReason: reason,
        fundSource,
        meezaCardNumber: cardNum || null,
      })
      toast.success('تم حفظ التعديل')
      onOpenChange(false)
    } catch { /* error handled by store */ }
    finally { setIsSubmitting(false) }
  }

  const code = payment.household?.code || ''
  const name = payment.household?.familyName || 'أسرة بدون اسم'
  const calculated = Number(payment.calculatedAmount || 0)
  const adjNum = Number(adjustment || 0)
  const final = calculated + adjNum

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            {isApproved && <Lock className="h-4 w-4 text-amber-400" />}
            تعديل قبض الأسرة
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            رقم القيد: {code} — {name}
          </DialogDescription>
        </DialogHeader>

        {isApproved ? (
          <div className="flex items-center gap-3 rounded-lg bg-amber-950/30 border border-amber-800/30 p-4">
            <Lock className="h-5 w-5 text-amber-500 shrink-0" />
            <div>
              <p className="text-amber-400 font-medium text-sm">الشهر معتمد — لا يمكن التعديل</p>
              <p className="text-slate-400 text-xs mt-0.5">يجب إعادة فتح الشهر لإجراء تعديلات</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            {/* Summary */}
            <div className="rounded-lg bg-slate-800 border border-slate-700 p-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">القبض المحسوب</span>
                <span className="font-mono text-white">{formatAmount(calculated)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">التعديل الحالي</span>
                <span className={`font-mono ${adjNum >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {adjNum > 0 ? '+' : ''}{formatAmount(adjNum)}
                </span>
              </div>
              <Separator className="bg-slate-700" />
              <div className="flex justify-between font-semibold">
                <span>الإجمالي النهائي</span>
                <span className="text-green-400 font-mono">{formatAmount(final)}</span>
              </div>
            </div>

            {/* Adjustment input */}
            <div className="space-y-1.5">
              <Label className="text-white text-sm">التعديل اليدوي (ج.م)</Label>
              <Input
                type="number"
                step="0.01"
                value={adjustment}
                onChange={(e) => setAdjustment(e.target.value)}
                placeholder="موجب للزيادة، سالب للخصم"
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              />
              <p className="text-xs text-slate-500">مثال: 100 للزيادة، أو -50 للخصم من المبلغ المحسوب</p>
            </div>

            {/* Reason */}
            <div className="space-y-1.5">
              <Label className="text-white text-sm">
                سبب التعديل <span className="text-red-400">*</span>
              </Label>
              <Textarea
                placeholder="اذكر سبب التعديل بوضوح..."
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 resize-none"
              />
            </div>

            {/* Meeza Card */}
            <div className="space-y-1.5">
              <Label className="text-white text-sm">رقم كارت ميزة / البنك</Label>
              <Input
                value={meezaCardNumber}
                onChange={(e) => setMeezaCardNumber(e.target.value)}
                placeholder="مثال: 507803..."
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 font-mono text-left"
                dir="ltr"
              />
              <p className="text-xs text-slate-500">بداية الكارت المألوفة للبنوك: بنك مصر، البنك الأهلي...</p>
            </div>

            {/* Fund source */}
            <div className="space-y-1.5">
              <Label className="text-white text-sm">مصدر التمويل</Label>
              <Select value={fundSource} onValueChange={(v) => setFundSource(v as FundSource)}>
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

        <DialogFooter className="gap-2">
          <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          {!isApproved && (
            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={handleSave}
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin ms-2" /> : null}
              حفظ التعديل
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Payment Status Cell ──────────────────────────────────────────────────────

function PaymentStatusCell({ amount, status }: { amount: string | number; status: PaymentStatus }) {
  const num = Number(amount)
  if (!num) return <span className="text-slate-400 text-xs">—</span>
  const config = PAYMENT_STATUS_CONFIG[status] || PAYMENT_STATUS_CONFIG.PENDING
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-mono text-slate-700 dark:text-slate-300">{formatAmount(num)}</span>
      <div className="flex items-center gap-1">
        <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
        <span className="text-[10px] text-slate-500 dark:text-slate-400">{config.label}</span>
      </div>
    </div>
  )
}

// ─── Expandable External Row ──────────────────────────────────────────────────

function ExternalContribRow({ payment }: { payment: MonthlyPayment }) {
  const [expanded, setExpanded] = useState(false)
  const externalTotal = Number(payment.externalTotal || 0)

  if (externalTotal === 0) {
    return <span className="text-slate-400 dark:text-slate-500 text-xs">—</span>
  }

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
      >
        <Building2 className="h-3 w-3" />
        <span className="text-xs font-mono">{formatAmount(externalTotal)}</span>
        {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>
      {expanded && payment.externalContributions && (
        <div className="mt-1.5 space-y-1 rounded-md bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 p-2 text-xs min-w-[160px] relative z-10 shadow-lg">
          {payment.externalContributions.map((c, i) => (
            <div key={i} className="flex items-center justify-between gap-3">
              <span className="text-slate-600 dark:text-slate-300">{c.institutionName}</span>
              <div className="flex items-center gap-1">
                <span className="font-mono text-slate-800 dark:text-white">{formatAmount(c.amount)}</span>
                <span className={`text-[10px] ${c.confirmed ? 'text-green-500' : 'text-amber-500'}`}>
                  {c.confirmed ? '✓' : '؟'}
                </span>
              </div>
            </div>
          ))}
          <Separator className="my-1 bg-slate-200 dark:bg-slate-600" />
          <div className="flex justify-between font-medium">
            <span className="text-slate-500">الفارق من مؤسستنا</span>
            <span className="text-green-600 dark:text-green-400 font-mono">{formatAmount(payment.compensationAmount)}</span>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function PaymentTable({ families, isApproved, monthId }: PaymentTableProps) {
  const [adjustPayment, setAdjustPayment] = useState<MonthlyPayment | null>(null)
  const [deletePayment, setDeletePayment] = useState<MonthlyPayment | null>(null)
  const { removePayment } = useDisbursementStore()

  const handleDelete = async () => {
    if (!deletePayment) return
    try {
      await removePayment(monthId, deletePayment.id)
      toast.success('تم حذف الأسرة من هذا الشهر')
    } catch { /* error handled by store */ }
    finally { setDeletePayment(null) }
  }

  if (families.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-16 text-center">
        <p className="text-slate-500 dark:text-slate-400">لا توجد أسر مطابقة للبحث</p>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-x-auto shadow-sm border-t-4 border-t-green-500/80">
        <table className="w-full text-sm min-w-[1200px]">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400">
              <th className="px-4 py-3.5 text-start text-xs font-semibold tracking-wide">رقم القيد</th>
              <th className="px-4 py-3.5 text-start text-xs font-semibold tracking-wide">اسم الأسرة</th>
              <th className="px-4 py-3.5 text-start text-xs font-semibold tracking-wide">الفئة</th>
              <th className="px-4 py-3.5 text-start text-xs font-semibold tracking-wide">الهشاشة%</th>
              <th className="px-4 py-3.5 text-start text-xs font-semibold tracking-wide">
                <div className="flex items-center gap-1">
                  القبض الأساسي
                  <Tooltip><TooltipTrigger><Info className="h-3 w-3 text-slate-400" /></TooltipTrigger><TooltipContent>المبلغ الافتراضي المحدد لهذه الفئة</TooltipContent></Tooltip>
                </div>
              </th>
              <th className="px-4 py-3.5 text-start text-xs font-semibold tracking-wide">
                <div className="flex items-center gap-1">
                  الحوافز
                  <Tooltip><TooltipTrigger><Info className="h-3 w-3 text-slate-400" /></TooltipTrigger><TooltipContent>إجمالي المنح (أيتام، أمراض، دمج) المضافة للقبض</TooltipContent></Tooltip>
                </div>
              </th>
              <th className="px-4 py-3.5 text-start text-xs font-semibold tracking-wide">
                <div className="flex items-center gap-1">
                  المستحق
                  <Tooltip><TooltipTrigger><Info className="h-3 w-3 text-slate-400" /></TooltipTrigger><TooltipContent>المبلغ المحسوب (الأساسي + الحوافز) مقيداً بالحد الأقصى المسموح</TooltipContent></Tooltip>
                </div>
              </th>
              <th className="px-4 py-3.5 text-start text-xs font-semibold tracking-wide hidden md:table-cell">
                <div className="flex items-center gap-1">
                  مساهمة خارجية
                  <Tooltip><TooltipTrigger><Info className="h-3 w-3 text-slate-400" /></TooltipTrigger><TooltipContent>المبالغ التي تتلقاها الأسرة من مؤسسات خيرية أخرى</TooltipContent></Tooltip>
                </div>
              </th>
              <th className="px-4 py-3.5 text-start text-xs font-semibold tracking-wide hidden md:table-cell">
                <div className="flex items-center gap-1">
                  التعويض
                  <Tooltip><TooltipTrigger><Info className="h-3 w-3 text-slate-400" /></TooltipTrigger><TooltipContent>ما ندفعه نحن (المستحق ناقص أي مساهمات خارجية تتلقاها الأسرة)</TooltipContent></Tooltip>
                </div>
              </th>
              <th className="px-4 py-3.5 text-start text-xs font-semibold tracking-wide">
                <div className="flex items-center gap-1">
                  الإجمالي
                  <Tooltip><TooltipTrigger><Info className="h-3 w-3 text-slate-400" /></TooltipTrigger><TooltipContent>المبلغ النهائي الفعلي (بعد أي تعديلات يدوية)</TooltipContent></Tooltip>
                </div>
              </th>
              <th className="px-4 py-3.5 text-start text-xs font-semibold tracking-wide">ميزة</th>
              <th className="px-4 py-3.5 text-start text-xs font-semibold tracking-wide">نقدي</th>
              <th className="px-4 py-3.5 text-center text-xs font-semibold tracking-wide">⚙</th>
            </tr>
          </thead>
          <tbody>
            {families.map((payment, idx) => {
              const code = payment.household?.code || ''
              const name = payment.household?.familyName || 'أسرة بدون اسم'
              const percent = Number(payment.normalizedPercent || 0)
              const incentives = Number(payment.grantsTotal || 0) + Number(payment.mergeBonus || 0)
              const manualAdj = Number(payment.manualAdjustment || 0)
              const compensation = Number(payment.compensationAmount || 0)

              return (
                <tr
                  key={payment.id}
                  className={`border-b border-slate-100 dark:border-slate-700 transition-colors hover:bg-green-50/40 dark:hover:bg-green-900/10 ${
                    idx % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-slate-50/30 dark:bg-slate-800/70'
                  }`}
                >
                  <td className="px-4 py-3 font-mono text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {code}
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                    {name}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex flex-col gap-1 items-start">
                      <CategoryBadge category={payment.category} />
                      {payment.isDonorSponsored && payment.donorName && (
                        <span className="text-[10px] bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-1.5 py-0.5 rounded font-bold">
                          متبرع: {payment.donorName}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-14 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-600">
                        <div
                          className={`h-full rounded-full transition-all ${getVulnerabilityColor(percent)}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span className={`text-xs font-mono font-semibold ${getVulnerabilityTextColor(percent)}`}>
                        {percent}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-700 dark:text-slate-300 whitespace-nowrap">
                    {formatAmount(payment.baseAmount)}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs whitespace-nowrap">
                    {incentives > 0 ? (
                      <span className="text-violet-600 dark:text-violet-400">+{formatAmount(incentives)}</span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs font-bold text-slate-900 dark:text-white whitespace-nowrap">
                    {formatAmount(payment.calculatedAmount)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap hidden md:table-cell">
                    <ExternalContribRow payment={payment} />
                  </td>
                  <td className="px-4 py-3 font-mono text-xs whitespace-nowrap hidden md:table-cell">
                    {compensation > 0 ? (
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        {formatAmount(compensation)}
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm font-mono text-slate-900 dark:text-white">
                        {formatAmount(payment.finalAmount)}
                      </span>
                      {manualAdj !== 0 && (
                        <Tooltip>
                          <TooltipTrigger>
                            <Badge
                              variant="outline"
                              className="border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-[10px] px-1.5 py-0"
                            >
                              معدّل
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>تعديل يدوي: {manualAdj >= 0 ? '+' : ''}{formatAmount(manualAdj)}</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <PaymentStatusCell amount={payment.meezaAmount} status={payment.meezaStatus} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <PaymentStatusCell amount={payment.cashAmount} status={payment.cashStatus} />
                  </td>
                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30"
                            disabled={isApproved}
                            onClick={() => setAdjustPayment(payment)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {isApproved ? 'الشهر معتمد — لا يمكن التعديل' : 'تعديل يدوي'}
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 disabled:opacity-30"
                            disabled={isApproved}
                            onClick={() => setDeletePayment(payment)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {isApproved ? 'الشهر معتمد — لا يمكن الحذف' : 'حذف من الشهر'}
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Adjustment Dialog */}
      {adjustPayment && (
        <AdjustmentDialog
          open={!!adjustPayment}
          onOpenChange={(v) => { if (!v) setAdjustPayment(null) }}
          payment={adjustPayment}
          isApproved={isApproved}
          monthId={monthId}
        />
      )}

      {/* Delete Dialog */}
      <AlertDialog open={!!deletePayment} onOpenChange={(v) => !v && setDeletePayment(null)}>
        <AlertDialogContent className="bg-slate-900 border-slate-700 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              هل أنت متأكد من حذف الأسرة (رقم القيد: {deletePayment?.household?.code}) من هذا الشهر؟
              ملاحظة: إذا قمت بإعادة الحساب الشاملة، قد تعود الأسرة إذا كانت مستحقة.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-slate-700 text-white hover:bg-slate-800">إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">حذف</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  )
}

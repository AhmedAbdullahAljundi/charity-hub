'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { ArrowLeft, Pencil, Settings, RefreshCw, Plus, CreditCard, ShieldCheck, Users, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CategoryBadge } from '@/components/disbursement/category-badge'
import { formatAmount } from '@/lib/disbursement/types'
import { getCategoryConfigs, getGrantConfigs, updateCategoryConfig, updateGrantConfig, createGrantConfig } from '@/lib/api/disbursement-api'
import type { CategoryConfig, GrantConfig } from '@/lib/disbursement/types'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Edit Category Dialog ─────────────────────────────────────────────────────

function EditCategoryDialog({
  cat,
  open,
  onOpenChange,
  onSaved,
}: {
  cat: CategoryConfig
  open: boolean
  onOpenChange: (v: boolean) => void
  onSaved: () => void
}) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    maxAmount: cat.maxAmount || '',
    capWithDeps: cat.capWithDeps || '',
    capNoDeps: cat.capNoDeps || ''
  })

  const handleSave = async () => {
    setIsSubmitting(true)
    try {
      // Auto-adjust caps if maxAmount is raised higher than the caps
      const newMax = Number(formData.maxAmount) || 0;
      const capWith = Math.max(Number(formData.capWithDeps) || 0, newMax);
      const capNo = Math.max(Number(formData.capNoDeps) || 0, newMax);

      await updateCategoryConfig(cat.code, {
        maxAmount: newMax.toString(),
        capWithDeps: capWith.toString(),
        capNoDeps: capNo.toString(),
      })
      onSaved()
      onOpenChange(false)
    } catch (e) {
      console.error(e)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-lg text-slate-900 dark:text-white">
            <div className="p-2 rounded-xl bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400">
              <Pencil className="w-5 h-5" />
            </div>
            تعديل: {cat.nameAr}
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-5 py-4">
          <div className="col-span-2 space-y-2">
            <Label className="text-slate-600 dark:text-slate-400 text-sm font-semibold flex items-center gap-2">
              <CreditCard className="w-4 h-4" /> أقصى مبلغ للفئة (ج.م)
            </Label>
            <Input
              type="number"
              value={formData.maxAmount}
              onChange={(e) => setFormData(p => ({ ...p, maxAmount: e.target.value }))}
              step={50}
              className="h-11 rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-lg focus-visible:ring-green-500"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-600 dark:text-slate-400 text-sm font-semibold flex items-center gap-2">
              <Users className="w-4 h-4" /> بأبناء (ج.م)
            </Label>
            <Input
              type="number"
              value={formData.capWithDeps}
              onChange={(e) => setFormData(p => ({ ...p, capWithDeps: e.target.value }))}
              step={50}
              className="h-11 rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-green-500"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-600 dark:text-slate-400 text-sm font-semibold flex items-center gap-2">
              <Info className="w-4 h-4" /> بدون أبناء (ج.م)
            </Label>
            <Input
              type="number"
              value={formData.capNoDeps}
              onChange={(e) => setFormData(p => ({ ...p, capNoDeps: e.target.value }))}
              step={50}
              className="h-11 rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-green-500"
            />
          </div>
        </div>
        <DialogFooter className="gap-3">
          <Button
            variant="ghost"
            className="rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            إلغاء
          </Button>
          <Button 
            className="rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-md shadow-green-500/20" 
            onClick={handleSave} 
            disabled={isSubmitting}
          >
            {isSubmitting ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'حفظ التغييرات'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Edit Grant Dialog ────────────────────────────────────────────────────────

function EditGrantDialog({
  grant,
  open,
  onOpenChange,
  onSaved,
}: {
  grant: GrantConfig
  open: boolean
  onOpenChange: (v: boolean) => void
  onSaved: () => void
}) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    nameAr: grant.nameAr,
    amount: grant.amount,
    type: grant.type,
    active: grant.active
  })

  const handleSave = async () => {
    setIsSubmitting(true)
    try {
      await updateGrantConfig(grant.code, {
        nameAr: formData.nameAr,
        amount: formData.amount,
        type: formData.type as any,
        active: formData.active
      })
      onSaved()
      onOpenChange(false)
    } catch (e) {
      console.error(e)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-lg text-slate-900 dark:text-white">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            تعديل حافز: {grant.nameAr}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-5 py-4">
          <div className="space-y-2">
            <Label className="text-slate-600 dark:text-slate-400 text-sm font-semibold">اسم الحافز</Label>
            <Input
              type="text"
              value={formData.nameAr}
              onChange={(e) => setFormData(p => ({ ...p, nameAr: e.target.value }))}
              className="h-11 rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-600 dark:text-slate-400 text-sm font-semibold">المبلغ (ج.م)</Label>
            <Input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData(p => ({ ...p, amount: e.target.value }))}
              step={10}
              min={0}
              className="h-11 rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500 text-lg"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-600 dark:text-slate-400 text-sm font-semibold">نوع الحافز</Label>
            <Select value={formData.type} onValueChange={(v) => setFormData(p => ({ ...p, type: v as any }))}>
              <SelectTrigger className="h-11 rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:ring-indigo-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800 shadow-xl">
                <SelectItem value="MONTHLY" className="rounded-lg">شهري</SelectItem>
                <SelectItem value="ANNUAL" className="rounded-lg">سنوي</SelectItem>
                <SelectItem value="PERIODIC" className="rounded-lg">دوري</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter className="gap-3">
          <Button
            variant="ghost"
            className="rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            إلغاء
          </Button>
          <Button 
            className="rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white shadow-md shadow-indigo-500/20" 
            onClick={handleSave} 
            disabled={isSubmitting}
          >
            {isSubmitting ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'حفظ الحافز'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Create Grant Dialog ──────────────────────────────────────────────────────

function CreateGrantDialog({
  open,
  onOpenChange,
  onSaved,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onSaved: () => void
}) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    code: '',
    nameAr: '',
    amount: '',
    type: 'MONTHLY',
    condition: 'isOrphan',
    active: true
  })

  const handleSave = async () => {
    setIsSubmitting(true)
    try {
      await createGrantConfig({
        code: formData.code,
        nameAr: formData.nameAr,
        nameEn: formData.code, // default to code
        amount: formData.amount as any,
        type: formData.type as any,
        condition: formData.condition,
        active: formData.active
      })
      onSaved()
      onOpenChange(false)
      // Reset form
      setFormData({ code: '', nameAr: '', amount: '', type: 'MONTHLY', condition: 'isOrphan', active: true })
    } catch (e: any) {
      console.error(e)
      alert(e.response?.data?.error?.message || e.message || 'حدث خطأ أثناء الإنشاء')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-lg text-slate-900 dark:text-white">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Plus className="w-5 h-5" />
            </div>
            تأسيس حافز جديد
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-slate-600 dark:text-slate-400 text-sm font-semibold">كود الحافز (إنجليزي/فريد)</Label>
            <Input
              type="text"
              placeholder="مثال: customGrant"
              value={formData.code}
              onChange={(e) => setFormData(p => ({ ...p, code: e.target.value }))}
              className="h-11 rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-600 dark:text-slate-400 text-sm font-semibold">اسم الحافز</Label>
            <Input
              type="text"
              placeholder="مثال: منحة استثنائية"
              value={formData.nameAr}
              onChange={(e) => setFormData(p => ({ ...p, nameAr: e.target.value }))}
              className="h-11 rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-600 dark:text-slate-400 text-sm font-semibold">المبلغ (ج.م)</Label>
            <Input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData(p => ({ ...p, amount: e.target.value }))}
              step={10}
              min={0}
              className="h-11 rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500 text-lg"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-600 dark:text-slate-400 text-sm font-semibold">نوع الحافز</Label>
            <Select value={formData.type} onValueChange={(v) => setFormData(p => ({ ...p, type: v as any }))}>
              <SelectTrigger className="h-11 rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:ring-indigo-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800 shadow-xl">
                <SelectItem value="MONTHLY" className="rounded-lg">شهري</SelectItem>
                <SelectItem value="ANNUAL" className="rounded-lg">سنوي</SelectItem>
                <SelectItem value="PERIODIC" className="rounded-lg">دوري</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter className="gap-3">
          <Button
            variant="ghost"
            className="rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            إلغاء
          </Button>
          <Button 
            className="rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white shadow-md shadow-indigo-500/20" 
            onClick={handleSave} 
            disabled={isSubmitting || !formData.code || !formData.nameAr || !formData.amount}
          >
            {isSubmitting ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'إنشاء الحافز'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const GRANT_TYPE_LABEL: Record<GrantConfig['type'], string> = {
  MONTHLY:  'شهري',
  ANNUAL:   'سنوي',
  PERIODIC: 'دوري',
}

const GRANT_TYPE_COLOR: Record<GrantConfig['type'], string> = {
  MONTHLY:  'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
  ANNUAL:   'bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20',
  PERIODIC: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function DisbursementSettingsPage() {
  const locale = useLocale()
  const [categories, setCategories] = useState<CategoryConfig[]>([])
  const [grants, setGrants] = useState<GrantConfig[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'categories'|'grants'>('categories')

  const [editCat, setEditCat] = useState<CategoryConfig | null>(null)
  const [editGrant, setEditGrant] = useState<GrantConfig | null>(null)
  const [createGrantOpen, setCreateGrantOpen] = useState(false)

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [cats, grnts] = await Promise.all([
        getCategoryConfigs(),
        getGrantConfigs()
      ])
      // Filter out legacy numeric codes so the UI only shows Arabic ones (if both exist)
      setCategories(cats.filter(c => isNaN(Number(c.code))))
      setGrants(grnts)
    } catch (e) {
      console.error("Failed to fetch disbursement settings", e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-green-200 dark:border-green-900 rounded-full animate-ping opacity-20"></div>
          <RefreshCw className="w-16 h-16 animate-spin text-green-500 drop-shadow-md" />
        </div>
        <p className="text-slate-500 dark:text-slate-400 font-medium animate-pulse">جاري جلب الإعدادات المتقدمة...</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* ── Header Section ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <Link href={`/${locale}/dashboard/disbursement`}>
            <Button
              variant="ghost"
              size="sm"
              className="mb-4 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 gap-2 px-3 rounded-xl transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
              العودة للصرف المالي
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-green-600 shadow-lg shadow-green-500/20">
              <Settings className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white bg-clip-text text-transparent bg-gradient-to-l from-slate-900 to-slate-600 dark:from-white dark:to-slate-300">
                إعدادات المحرك المالي
              </h1>
              <p className="text-base text-slate-500 dark:text-slate-400 mt-1">
                التحكم الكامل في سقف الفئات ومبالغ الحوافز والمنح
              </p>
            </div>
          </div>
        </div>

        {/* ── Pill Tabs ── */}
        <div className="flex p-1.5 bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-2xl shadow-inner w-full md:w-auto">
          <button
            onClick={() => setActiveTab('categories')}
            className={`relative flex-1 md:flex-none px-6 py-2.5 text-sm font-bold rounded-xl transition-colors duration-300 ${
              activeTab === 'categories' ? 'text-green-700 dark:text-green-300' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            {activeTab === 'categories' && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center justify-center gap-2">
              <Users className="w-4 h-4" /> فئات الأسر
            </span>
          </button>
          <button
            onClick={() => setActiveTab('grants')}
            className={`relative flex-1 md:flex-none px-6 py-2.5 text-sm font-bold rounded-xl transition-colors duration-300 ${
              activeTab === 'grants' ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            {activeTab === 'grants' && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4" /> الحوافز الإضافية
            </span>
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'categories' ? (
          <motion.div
            key="categories"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
          >
            {categories.map((cat, idx) => (
              <motion.div
                key={cat.code}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="group relative overflow-hidden bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                {/* Subtle Gradient Glow */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-green-400/10 dark:bg-green-500/10 blur-3xl rounded-full group-hover:bg-green-500/20 transition-all"></div>
                
                <div className="relative z-10 flex items-start justify-between mb-6">
                  <div className="flex flex-col gap-2">
                    <CategoryBadge category={cat.nameAr} />
                    {!cat.active && (
                      <Badge variant="outline" className="w-fit text-[10px] border-red-200 text-red-600 bg-red-50 dark:bg-red-500/10 dark:border-red-500/20">
                        غير نشط
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-500/20 transition-colors"
                    onClick={() => setEditCat(cat)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>

                <div className="relative z-10 space-y-4">
                  <div className="bg-slate-50 dark:bg-slate-950/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
                    <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">الحد الأقصى (القاعدة)</p>
                    <p className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
                      {formatAmount(cat.maxAmount)} <span className="text-sm font-medium text-slate-400">ج.م</span>
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-100 dark:border-slate-800">
                      <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                        <Users className="w-3 h-3" /> بوجود أبناء
                      </p>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{formatAmount(cat.capWithDeps)}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-100 dark:border-slate-800">
                      <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                        <Info className="w-3 h-3" /> بدون أبناء
                      </p>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{formatAmount(cat.capNoDeps)}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="grants"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="max-w-4xl space-y-4"
          >
            {grants.map((grant, idx) => (
              <motion.div
                key={grant.code}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border p-5 shadow-sm transition-all duration-300 ${
                  grant.active 
                    ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800/50' 
                    : 'bg-slate-50 dark:bg-slate-950/50 border-slate-100 dark:border-slate-800/50 opacity-70 hover:opacity-100'
                }`}
              >
                <div className="flex items-center gap-5">
                  <div className={`p-3 rounded-2xl ${grant.active ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className={`text-lg font-bold ${grant.active ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                      {grant.nameAr}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                      الشرط: <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md">{grant.condition}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-5 sm:ms-auto">
                  <Badge variant="outline" className={`px-3 py-1 font-bold text-xs border ${GRANT_TYPE_COLOR[grant.type]}`}>
                    {GRANT_TYPE_LABEL[grant.type]}
                  </Badge>
                  
                  <div className="text-left min-w-[100px]">
                    <span className="text-2xl font-black text-slate-900 dark:text-white">{formatAmount(grant.amount)}</span>
                    <span className="text-xs text-slate-500 font-medium ms-1">ج.م</span>
                  </div>

                  <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                    <Switch
                      checked={grant.active}
                      onCheckedChange={async (v) => {
                        try {
                          await updateGrantConfig(grant.code, { active: v })
                          fetchData()
                        } catch(e) {
                          console.error(e)
                        }
                      }}
                      className="data-[state=checked]:bg-indigo-500"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/20"
                      onClick={() => setEditGrant(grant)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}

            <motion.button
              onClick={() => setCreateGrantOpen(true)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: grants.length * 0.05 }}
              className="w-full mt-6 py-6 rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500/50 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all group flex flex-col items-center justify-center gap-2"
            >
              <div className="p-3 rounded-full bg-white dark:bg-slate-800 shadow-sm group-hover:scale-110 transition-transform">
                <Plus className="h-6 w-6" />
              </div>
              <span className="font-bold text-sm">تأسيس حافز جديد</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Dialogs */}
      {editCat && (
        <EditCategoryDialog
          cat={editCat}
          open={!!editCat}
          onOpenChange={(v) => { if (!v) setEditCat(null) }}
          onSaved={fetchData}
        />
      )}
      {editGrant && (
        <EditGrantDialog
          grant={editGrant}
          open={!!editGrant}
          onOpenChange={(v) => { if (!v) setEditGrant(null) }}
          onSaved={fetchData}
        />
      )}
      <CreateGrantDialog
        open={createGrantOpen}
        onOpenChange={setCreateGrantOpen}
        onSaved={fetchData}
      />
    </div>
  )
}

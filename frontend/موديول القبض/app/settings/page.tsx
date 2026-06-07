'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Pencil, Plus, ArrowRight } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'

// Mock data for categories and grants
const mockCategories = [
  { code: 'ORPHANS', nameAr: 'أيتام', capWithDeps: 1500, capNoDeps: 1200, maxAmount: 1800, active: true },
  { code: 'DISABLED', nameAr: 'إعاقة', capWithDeps: 1400, capNoDeps: 1100, maxAmount: 1700, active: true },
  { code: 'STUDENTS', nameAr: 'طالب علم', capWithDeps: 1200, capNoDeps: 1000, maxAmount: 1500, active: true },
  { code: 'PRISONERS', nameAr: 'سجناء', capWithDeps: 900, capNoDeps: 800, maxAmount: 1100, active: true },
  { code: 'ASSISTANCE', nameAr: 'مساعدات', capWithDeps: 1100, capNoDeps: 900, maxAmount: 1300, active: true },
  { code: 'EXTERNAL_SUPPORT', nameAr: 'دعم خارجي', capWithDeps: 1000, capNoDeps: 800, maxAmount: 1200, active: false },
]

const mockGrants = [
  { code: 'FUEL', nameAr: 'مستحقات الوقود', active: true, type: 'MONTHLY', amount: 200, condition: 'الأسرة صاحبة عمل' },
  { code: 'EDUCATION', nameAr: 'تعليم الأطفال', active: true, type: 'ANNUAL', amount: 500, condition: 'وجود طالب علم' },
  { code: 'CLOTHING', nameAr: 'ملابس الشتاء', active: true, type: 'ANNUAL', amount: 300, condition: 'موسم الشتاء' },
  { code: 'HEALTH', nameAr: 'مساعدة طبية', active: false, type: 'PERIODIC', amount: 150, condition: 'وجود مرض مزمن' },
]

const CATEGORY_COLORS: Record<string, string> = {
  ORPHANS: 'bg-red-500',
  DISABLED: 'bg-purple-500',
  STUDENTS: 'bg-blue-500',
  PRISONERS: 'bg-orange-500',
  ASSISTANCE: 'bg-green-500',
  EXTERNAL_SUPPORT: 'bg-cyan-500',
}

export default function SettingsPage() {
  const [categories, setCategories] = useState(mockCategories)
  const [grants, setGrants] = useState(mockGrants)
  const [showEditCategoryDialog, setShowEditCategoryDialog] = useState(false)
  const [editingCategory, setEditingCategory] = useState<typeof mockCategories[0] | null>(null)
  const [showEditGrantDialog, setShowEditGrantDialog] = useState(false)
  const [editingGrant, setEditingGrant] = useState<typeof mockGrants[0] | null>(null)

  const openEditCategory = (cat: typeof mockCategories[0]) => {
    setEditingCategory(cat)
    setShowEditCategoryDialog(true)
  }

  const openEditGrant = (grant: typeof mockGrants[0]) => {
    setEditingGrant(grant)
    setShowEditGrantDialog(true)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-teal-700 dark:bg-teal-900 text-white px-6 py-8 mb-8">
        <Link href="/">
          <Button variant="ghost" className="mb-4 text-white hover:bg-white/20">
            <ArrowRight className="w-4 h-4 ms-2" />
            العودة
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">الإعدادات</h1>
        <p className="text-teal-100 text-sm">إدارة إعدادات الفئات والحوافز والمنح</p>
      </div>

      <main className="px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <Tabs defaultValue="categories" dir="rtl">
            <TabsList className="mb-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <TabsTrigger value="categories">إعدادات الفئات</TabsTrigger>
              <TabsTrigger value="grants">الحوافز والمنح</TabsTrigger>
            </TabsList>

            {/* Categories Tab */}
            <TabsContent value="categories">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((cat) => (
                  <Card key={cat.code} className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <Badge className={`${CATEGORY_COLORS[cat.code] || 'bg-slate-500'} text-white`}>
                          {cat.nameAr}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => openEditCategory(cat)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">الحد الأقصى (بأبناء)</span>
                        <span className="font-mono">ج.م {cat.capWithDeps}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">الحد الأقصى (بدون)</span>
                        <span className="font-mono">ج.م {cat.capNoDeps}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">أقصى مبلغ للفئة</span>
                        <span className="font-mono text-green-400">ج.م {cat.maxAmount}</span>
                      </div>
                      {!cat.active && (
                        <Badge variant="outline" className="border-red-800 text-red-400 text-xs bg-red-950/20">
                          غير نشط
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Grants Tab */}
            <TabsContent value="grants">
              <div className="space-y-2">
                {grants.map((grant) => (
                  <div
                    key={grant.code}
                    className="flex items-center justify-between p-4 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    <div className="flex items-center gap-4">
                      <Switch checked={grant.active} />
                      <div>
                        <p className="font-medium text-sm text-slate-900 dark:text-white">{grant.nameAr}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">الشرط: {grant.condition}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <Badge variant="outline" className="text-xs">
                        {grant.type === 'MONTHLY' ? 'شهري' : grant.type === 'ANNUAL' ? 'سنوي' : 'دوري'}
                      </Badge>
                      <span className="font-mono text-green-400 text-sm">ج.م {grant.amount}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => openEditGrant(grant)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="mt-2 w-full border-dashed">
                  <Plus className="h-4 w-4 ms-1" />
                  إضافة حافز جديد
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Edit Category Dialog */}
      {editingCategory && (
        <Dialog open={showEditCategoryDialog} onOpenChange={setShowEditCategoryDialog}>
          <DialogContent className="bg-slate-900 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">تعديل إعدادات فئة {editingCategory.nameAr}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-1.5">
                <Label className="text-white">الحد الأقصى للمبلغ (ج.م)</Label>
                <Input
                  type="number"
                  defaultValue={editingCategory.maxAmount}
                  step="50"
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-white">الحد الأقصى بأبناء (ج.م)</Label>
                <Input
                  type="number"
                  defaultValue={editingCategory.capWithDeps}
                  step="50"
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-white">الحد الأقصى بدون أبناء (ج.م)</Label>
                <Input
                  type="number"
                  defaultValue={editingCategory.capNoDeps}
                  step="50"
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditCategoryDialog(false)}>
                إلغاء
              </Button>
              <Button className="bg-green-600 hover:bg-green-700">حفظ التغييرات</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Grant Dialog */}
      {editingGrant && (
        <Dialog open={showEditGrantDialog} onOpenChange={setShowEditGrantDialog}>
          <DialogContent className="bg-slate-900 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">تعديل {editingGrant.nameAr}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label className="text-white">اسم الحافز</Label>
                <Input
                  type="text"
                  defaultValue={editingGrant.nameAr}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-white">المبلغ (ج.م)</Label>
                <Input
                  type="number"
                  defaultValue={editingGrant.amount}
                  step="10"
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditGrantDialog(false)}>
                إلغاء
              </Button>
              <Button className="bg-green-600 hover:bg-green-700">حفظ التغييرات</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

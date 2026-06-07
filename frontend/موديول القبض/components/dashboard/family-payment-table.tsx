'use client'

import { Family } from '@/lib/types'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Edit2, Trash2, Eye } from 'lucide-react'
import { useState } from 'react'
import { Card } from '@/components/ui/card'

interface FamilyPaymentTableProps {
  families: Family[]
  editingId: string | null
  onEditStart: (id: string) => void
  onEditEnd: () => void
}

export function FamilyPaymentTable({ families, editingId, onEditStart, onEditEnd }: FamilyPaymentTableProps) {
  const [expandedFamilyId, setExpandedFamilyId] = useState<string | null>(null)

  const getPriorityColor = (priority: string) => {
    const colors = {
      HIGH: 'text-red-600 bg-red-50 dark:bg-red-900/20',
      MEDIUM: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20',
      LOW: 'text-green-600 bg-green-50 dark:bg-green-900/20',
    }
    return colors[priority as keyof typeof colors] || colors.LOW
  }

  const getPriorityLabel = (priority: string) => {
    const labels = { HIGH: 'عالي', MEDIUM: 'متوسط', LOW: 'منخفض' }
    return labels[priority as keyof typeof labels] || priority
  }

  return (
    <Card className="border border-slate-200 dark:border-slate-700">
      <div className="p-6">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">العائلات المستفيدة</h2>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-slate-200 dark:border-slate-700">
                <TableHead className="text-end">اسم العائلة</TableHead>
                <TableHead className="text-end">رب الأسرة</TableHead>
                <TableHead className="text-end">الحجم</TableHead>
                <TableHead className="text-end">الدخل الشهري</TableHead>
                <TableHead className="text-end">الأولوية</TableHead>
                <TableHead className="text-end">إجمالي المنح</TableHead>
                <TableHead className="text-end">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {families.map((family) => (
                <div key={family.id}>
                  <TableRow className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                    <TableCell className="text-end font-medium text-slate-900 dark:text-white">
                      {family.name}
                    </TableCell>
                    <TableCell className="text-end text-slate-600 dark:text-slate-400">
                      {family.headOfHousehold}
                    </TableCell>
                    <TableCell className="text-end text-slate-600 dark:text-slate-400">
                      {family.familySize}
                    </TableCell>
                    <TableCell className="text-end text-slate-600 dark:text-slate-400">
                      {family.monthlyIncome.toLocaleString()} ر.س
                    </TableCell>
                    <TableCell className="text-end">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(family.priority)}`}>
                        {getPriorityLabel(family.priority)}
                      </span>
                    </TableCell>
                    <TableCell className="text-end font-bold text-emerald-600">
                      {family.totalGrants}
                    </TableCell>
                    <TableCell className="text-end">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setExpandedFamilyId(expandedFamilyId === family.id ? null : family.id)
                          }
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditStart(family.id)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>

                  {/* Expanded Row - Family Details */}
                  {expandedFamilyId === family.id && (
                    <TableRow className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                      <TableCell colSpan={7} className="p-6">
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">العنوان</p>
                              <p className="font-medium text-slate-900 dark:text-white">{family.address}</p>
                            </div>
                            <div>
                              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">رقم الهاتف</p>
                              <p className="font-medium text-slate-900 dark:text-white">{family.phone}</p>
                            </div>
                          </div>

                          {family.notes && (
                            <div>
                              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">ملاحظات</p>
                              <p className="text-slate-900 dark:text-white">{family.notes}</p>
                            </div>
                          )}

                          {/* Grants List */}
                          <div>
                            <h4 className="font-bold text-slate-900 dark:text-white mb-3">المنح</h4>
                            <div className="space-y-2">
                              {family.grants.map((grant) => (
                                <div
                                  key={grant.id}
                                  className="flex items-center justify-between bg-white dark:bg-slate-700 p-3 rounded-lg"
                                >
                                  <div>
                                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                                      {grant.amount.toLocaleString()} ر.س
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                      {new Date(grant.date).toLocaleDateString('ar-SA')}
                                    </p>
                                  </div>
                                  <span
                                    className={`text-xs font-medium px-2 py-1 rounded ${
                                      grant.status === 'PAID'
                                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30'
                                        : grant.status === 'APPROVED'
                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30'
                                        : grant.status === 'PENDING'
                                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30'
                                        : 'bg-red-100 text-red-700 dark:bg-red-900/30'
                                    }`}
                                  >
                                    {grant.status === 'PAID'
                                      ? 'مدفوع'
                                      : grant.status === 'APPROVED'
                                      ? 'موافق'
                                      : grant.status === 'PENDING'
                                      ? 'قيد المراجعة'
                                      : 'مرفوض'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </div>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 text-sm text-slate-600 dark:text-slate-400">
          إجمالي العائلات: <span className="font-bold text-slate-900 dark:text-white">{families.length}</span>
        </div>
      </div>
    </Card>
  )
}

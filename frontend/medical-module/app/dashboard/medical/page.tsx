'use client'

import { useState } from 'react'
import { MedicalRecord } from '@/types/medical'
import { mockMedicalRecords } from '@/lib/medical/mock-data'
import { MedicalRecordsTable } from '@/components/medical-records-table'
import { EligibilityModal } from '@/components/eligibility-modal'
import { AddEditRecordModal } from '@/components/add-edit-record-modal'

export default function MedicalDashboard() {
  const [records, setRecords] = useState<MedicalRecord[]>(mockMedicalRecords)
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null)
  const [showEligibilityModal, setShowEligibilityModal] = useState(false)
  const [showAddEditModal, setShowAddEditModal] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)

  const handleViewEligibility = (record: MedicalRecord) => {
    setSelectedRecord(record)
    setShowEligibilityModal(true)
  }

  const handleEdit = (record: MedicalRecord) => {
    setSelectedRecord(record)
    setIsEditMode(true)
    setShowAddEditModal(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('هل تأكد من حذف هذا السجل؟')) {
      setRecords(records.filter(r => r.id !== id))
    }
  }

  const handleAddNew = () => {
    setSelectedRecord(null)
    setIsEditMode(false)
    setShowAddEditModal(true)
  }

  const handleSave = (record: MedicalRecord) => {
    if (isEditMode && record.id) {
      setRecords(records.map(r => r.id === record.id ? record : r))
    } else {
      setRecords([...records, { ...record, id: Date.now().toString() }])
    }
    setShowAddEditModal(false)
    setSelectedRecord(null)
  }

  const acceptedCount = records.filter(r => r.eligibilityStatus === 'مقبول').length
  const exceptionCount = records.filter(r => r.eligibilityStatus === 'استثناء').length
  const rejectedCount = records.filter(r => r.eligibilityStatus === 'مرفوض').length

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">السجلات الطبية</h1>
            <p className="text-sm text-slate-600">متابعة وإدارة الحالات الطبية والاستقطاعات</p>
          </div>
          <button
            onClick={handleAddNew}
            className="inline-flex items-center justify-center px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm"
          >
            + إضافة سجل طبي
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-3 gap-5 mb-8">
          <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                <span className="text-lg">📋</span>
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-slate-500 mb-0.5">إجمالي السجلات</p>
                <p className="text-2xl font-bold text-slate-900">{records.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <span className="text-lg">✓</span>
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-slate-500 mb-0.5">السجلات المقبولة</p>
                <p className="text-2xl font-bold text-emerald-600">{acceptedCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
                <span className="text-lg">⚠️</span>
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-slate-500 mb-0.5">حالات استثنائية</p>
                <p className="text-2xl font-bold text-rose-600">{exceptionCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <MedicalRecordsTable 
            records={records}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onViewEligibility={handleViewEligibility}
          />
        </div>
      </div>

      {/* Modals */}
      <EligibilityModal
        record={selectedRecord}
        isOpen={showEligibilityModal}
        onClose={() => {
          setShowEligibilityModal(false)
          setSelectedRecord(null)
        }}
      />

      <AddEditRecordModal
        record={selectedRecord}
        isOpen={showAddEditModal}
        onClose={() => {
          setShowAddEditModal(false)
          setSelectedRecord(null)
        }}
        onSave={handleSave}
      />
    </div>
  )
}

"use client";

import { Plus, Menu } from "lucide-react";
import { useMedicalModalStore } from "@/lib/medical/store";

export function DashboardHeader() {
  const openModal = useMedicalModalStore((s) => s.openModal);

  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900">إدارة السجلات الطبية</h1>
        <p className="text-gray-600 mt-2">نظام إدارة السجلات الطبية والمساعدات الطبية</p>
      </div>
      <button
        onClick={openModal}
        className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-semibold transition-colors"
      >
        <Plus className="w-5 h-5" />
        إضافة سجل جديد
      </button>
    </div>
  );
}

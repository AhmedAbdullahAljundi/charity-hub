"use client";

import { TrendingUp, DollarSign, Users, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "@/lib/medical/utils";

interface KPICardsProps {
  totalRecords: number;
  totalDisbursed: number;
  averageAmount: number;
  fullyEligibleCount: number;
}

export function KPICards({
  totalRecords,
  totalDisbursed,
  averageAmount,
  fullyEligibleCount,
}: KPICardsProps) {
  const cards = [
    {
      label: "إجمالي السجلات",
      value: totalRecords.toString(),
      icon: Users,
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "إجمالي الصرف",
      value: formatCurrency(totalDisbursed),
      icon: DollarSign,
      color: "bg-green-100 text-green-600",
    },
    {
      label: "متوسط المبلغ",
      value: formatCurrency(averageAmount),
      icon: TrendingUp,
      color: "bg-purple-100 text-purple-600",
    },
    {
      label: "مستحقون كاملاً",
      value: fullyEligibleCount.toString(),
      icon: CheckCircle2,
      color: "bg-emerald-100 text-emerald-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div key={idx} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">{card.label}</p>
                <p className="text-3xl font-bold mt-2">{card.value}</p>
              </div>
              <div className={`${card.color} p-3 rounded-lg`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

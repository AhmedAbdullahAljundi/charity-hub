'use client'

import { useState } from 'react'
import { Coins, X, RotateCcw } from 'lucide-react'
import {
  calculateZakat,
  formatCurrency,
  NISAB_EGP,
  GOLD_PRICE_PER_GRAM_EGP,
  type ZakatInput,
} from '@/lib/utils/zakatCalculator'

interface ZakatCalculatorProps {
  isOpen: boolean
  onClose: () => void
}

export default function ZakatCalculator({ isOpen, onClose }: ZakatCalculatorProps) {
  const [inputs, setInputs] = useState<ZakatInput>({
    cash: 0,
    gold: 0,
    silver: 0,
    stocks: 0,
    businessAssets: 0,
    receivables: 0,
    debts: 0,
  })

  const result = calculateZakat(inputs)

  const handleInputChange = (field: keyof ZakatInput, value: string) => {
    const numValue = value === '' ? 0 : parseFloat(value) || 0
    setInputs((prev) => ({
      ...prev,
      [field]: Math.max(0, numValue),
    }))
  }

  const handleReset = () => {
    setInputs({
      cash: 0,
      gold: 0,
      silver: 0,
      stocks: 0,
      businessAssets: 0,
      receivables: 0,
      debts: 0,
    })
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Popover */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="pointer-events-auto w-full max-w-sm max-h-[80vh] overflow-y-auto bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                حاسبة زكاة المال
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                النصاب التقريبي الحالي: {formatCurrency(NISAB_EGP)} جنيه
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            {/* Assets Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                الأصول والممتلكات
              </h3>

              {/* Cash */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  💵 النقد والرصيد البنكي
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={inputs.cash || ''}
                    onChange={(e) => handleInputChange('cash', e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 pr-12 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500 dark:text-slate-400">
                    ج
                  </span>
                </div>
              </div>

              {/* Gold */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  🏅 الذهب (بالجرام)
                </label>
                <input
                  type="number"
                  value={inputs.gold || ''}
                  onChange={(e) => handleInputChange('gold', e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  السعر التقريبي: {formatCurrency(GOLD_PRICE_PER_GRAM_EGP)} جنيه/جرام
                </p>
              </div>

              {/* Silver */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  🥈 الفضة (بالجرام)
                </label>
                <input
                  type="number"
                  value={inputs.silver || ''}
                  onChange={(e) => handleInputChange('silver', e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                />
              </div>

              {/* Stocks */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  📈 الأسهم والأوراق المالية
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={inputs.stocks || ''}
                    onChange={(e) => handleInputChange('stocks', e.target.value)}
                    placeholder="القيمة السوقية الحالية"
                    className="w-full px-3 py-2 pr-12 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500 dark:text-slate-400">
                    ج
                  </span>
                </div>
              </div>

              {/* Business Assets */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  🏪 الأصول التجارية
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={inputs.businessAssets || ''}
                    onChange={(e) => handleInputChange('businessAssets', e.target.value)}
                    placeholder="بضاعة + مخزون"
                    className="w-full px-3 py-2 pr-12 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500 dark:text-slate-400">
                    ج
                  </span>
                </div>
              </div>

              {/* Receivables */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  🤝 ديون لك عند الغير
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={inputs.receivables || ''}
                    onChange={(e) => handleInputChange('receivables', e.target.value)}
                    placeholder="مبالغ ستُسترد"
                    className="w-full px-3 py-2 pr-12 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500 dark:text-slate-400">
                    ج
                  </span>
                </div>
              </div>
            </div>

            {/* Debts Section */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
              <div>
                <label className="block text-sm font-medium text-red-600 dark:text-red-400 mb-1">
                  📉 الديون عليك (تُطرح)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={inputs.debts || ''}
                    onChange={(e) => handleInputChange('debts', e.target.value)}
                    placeholder="ديون واجبة الأداء"
                    className="w-full px-3 py-2 pr-12 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500 dark:text-slate-400">
                    ج
                  </span>
                </div>
              </div>
            </div>

            {/* Result Card */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
              {!result.isAboveNisab ? (
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                  <p className="text-sm font-semibold text-amber-700 dark:text-amber-400 mb-3">
                    لم يبلغ المال النصاب بعد
                  </p>
                  <div className="mb-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-amber-600 dark:text-amber-300">
                        المبلغ الحالي
                      </span>
                      <span className="text-xs font-medium text-amber-600 dark:text-amber-300">
                        {formatCurrency(result.netAssets)} جنيه
                      </span>
                    </div>
                    <div className="w-full bg-amber-200 dark:bg-amber-800 rounded-full h-2">
                      <div
                        className="bg-amber-500 h-2 rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, (result.netAssets / result.nisab) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-amber-600 dark:text-amber-300">
                    الباقي: {formatCurrency(result.nisab - result.netAssets)} جنيه لبلوغ النصاب
                  </p>
                </div>
              ) : (
                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <p className="text-sm font-semibold text-green-700 dark:text-green-400 mb-2">
                    زكاة واجبة
                  </p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                    {formatCurrency(result.zakatAmount)} جنيه
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-300">
                    2.5% من {formatCurrency(result.netAssets)} جنيه
                  </p>
                </div>
              )}
            </div>

            {/* Reset Button */}
            <button
              onClick={handleReset}
              className="w-full py-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              مسح الأرقام
            </button>

            {/* Disclaimer */}
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center italic py-2">
              هذه الحاسبة تقريبية — يُنصح باستشارة عالم دين
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

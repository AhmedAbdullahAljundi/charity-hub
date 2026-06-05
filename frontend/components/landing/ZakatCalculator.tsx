"use client";

import { useState, useEffect } from "react";
import { Coins, X, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  calculateZakat, NISAB_EGP, GOLD_PRICE_PER_GRAM_EGP,
  type ZakatInput, type ZakatResult,
} from "@/lib/utils/zakatCalculator";
import { useLocale } from "next-intl";

const EMPTY_INPUT: ZakatInput = {
  cash: 0, gold: 0, silver: 0, stocks: 0,
  businessAssets: 0, receivables: 0, debts: 0,
};

function NumberInput({
  label, value, onChange, helper, isDebt = false,
}: {
  label: string; value: number; onChange: (v: number) => void;
  helper?: string; isDebt?: boolean;
}) {
  return (
    <div className="space-y-1">
      <Label className={cn("text-xs font-medium", isDebt ? "text-red-500 dark:text-red-400" : "text-slate-700 dark:text-slate-300")}>
        {label}
      </Label>
      <Input
        type="number"
        min={0}
        value={value || ""}
        onChange={(e) => onChange(Math.max(0, Number(e.target.value)))}
        placeholder="0"
        className={cn(
          "h-9 text-sm bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700",
          isDebt && "border-red-200 dark:border-red-800 focus-visible:ring-red-300"
        )}
      />
      {helper && <p className="text-[11px] text-slate-400 dark:text-slate-500">{helper}</p>}
    </div>
  );
}

export function ZakatCalculatorPopover() {
  const locale = useLocale();
  const isRtl = locale === "ar";
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState<ZakatInput>(EMPTY_INPUT);
  const [result, setResult] = useState<ZakatResult | null>(null);

  useEffect(() => {
    const hasValue = Object.values(input).some((v) => (v as number) > 0);
    if (hasValue) {
      setResult(calculateZakat(input));
    } else {
      setResult(null);
    }
  }, [input]);

  const set = (key: keyof ZakatInput) => (v: number) =>
    setInput((prev) => ({ ...prev, [key]: v }));

  const reset = () => { setInput(EMPTY_INPUT); setResult(null); };

  const nisabFormatted = NISAB_EGP.toLocaleString("ar-EG");
  const goldPriceFormatted = GOLD_PRICE_PER_GRAM_EGP.toLocaleString("ar-EG");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-950/20 text-xs font-medium px-3"
        >
          <Coins className="w-4 h-4" />
          <span className="hidden sm:inline">
            {isRtl ? "حاسبة الزكاة" : "Zakat Calculator"}
          </span>
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-80 sm:w-96 p-0 shadow-xl border border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 max-h-[85vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-700">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {isRtl ? "حاسبة زكاة المال" : "Zakat Calculator"}
            </h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
              {isRtl
                ? `النصاب التقريبي: ${nisabFormatted} جنيه`
                : `Approx. Nisab: EGP ${NISAB_EGP.toLocaleString()}`}
            </p>
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setOpen(false)}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Inputs */}
        <div className="overflow-y-auto flex-1 p-4 space-y-3">
          <NumberInput
            label={isRtl ? "💵 النقد والرصيد البنكي" : "💵 Cash & Bank Balance"}
            value={input.cash}
            onChange={set("cash")}
          />
          <NumberInput
            label={isRtl ? "🏅 الذهب (بالجرام)" : "🏅 Gold (grams)"}
            value={input.gold}
            onChange={set("gold")}
            helper={isRtl
              ? `السعر التقريبي للجرام: ${goldPriceFormatted} جنيه`
              : `Approx. price/gram: EGP ${GOLD_PRICE_PER_GRAM_EGP.toLocaleString()}`}
          />
          <NumberInput
            label={isRtl ? "🥈 الفضة (بالجرام)" : "🥈 Silver (grams)"}
            value={input.silver}
            onChange={set("silver")}
          />
          <NumberInput
            label={isRtl ? "📈 الأسهم والأوراق المالية" : "📈 Stocks & Securities"}
            value={input.stocks}
            onChange={set("stocks")}
          />
          <NumberInput
            label={isRtl ? "🏪 الأصول التجارية" : "🏪 Business Assets"}
            value={input.businessAssets}
            onChange={set("businessAssets")}
          />
          <NumberInput
            label={isRtl ? "🤝 ديون لك عند الغير" : "🤝 Receivables"}
            value={input.receivables}
            onChange={set("receivables")}
          />
          <div className="border-t border-slate-100 dark:border-slate-700 pt-3">
            <NumberInput
              label={isRtl ? "📉 الديون عليك (تُطرح)" : "📉 Your Debts (deducted)"}
              value={input.debts}
              onChange={set("debts")}
              isDebt
            />
          </div>

          {/* Result */}
          {result && (
            <div className={cn(
              "mt-3 rounded-xl p-4 border transition-all",
              result.isAboveNisab
                ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
                : "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800"
            )}>
              {result.isAboveNisab ? (
                <div className="text-center">
                  <p className="text-sm font-semibold text-green-700 dark:text-green-400 mb-1">
                    {isRtl ? "زكاة واجبة" : "Zakat Due"}
                  </p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                    {result.zakatAmount.toLocaleString("ar-EG")}
                    <span className="text-sm font-normal ms-1">{isRtl ? "جنيه" : "EGP"}</span>
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-500 mt-1">
                    {isRtl
                      ? `2.5% من ${result.netAssets.toLocaleString("ar-EG")} جنيه`
                      : `2.5% of EGP ${result.netAssets.toLocaleString()}`}
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-semibold text-amber-700 dark:text-amber-400 mb-2">
                    {isRtl ? "لم يبلغ المال النصاب بعد" : "Below Nisab threshold"}
                  </p>
                  <div className="w-full bg-amber-200 dark:bg-amber-900/40 rounded-full h-2 mb-2" dir="ltr">
                    <div
                      className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, result.progressPercent)}%` }}
                    />
                  </div>
                  <p className="text-xs text-amber-600 dark:text-amber-500">
                    {isRtl
                      ? `الباقي: ${(result.nisab - result.netAssets).toLocaleString("ar-EG")} جنيه لبلوغ النصاب`
                      : `EGP ${(result.nisab - result.netAssets).toLocaleString()} remaining to reach Nisab`}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Reset */}
          <Button
            variant="ghost"
            size="sm"
            onClick={reset}
            className="w-full text-slate-400 dark:text-slate-500 hover:text-slate-600 gap-2 text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            {isRtl ? "مسح الأرقام" : "Reset"}
          </Button>
        </div>

        {/* Footer disclaimer */}
        <div className="px-4 pb-3 pt-1 border-t border-slate-100 dark:border-slate-700">
          <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center italic">
            {isRtl
              ? "هذه الحاسبة تقريبية — يُنصح باستشارة عالم دين"
              : "This calculator is approximate — consult a scholar for verification"}
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}

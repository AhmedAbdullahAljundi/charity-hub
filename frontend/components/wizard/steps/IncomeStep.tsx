"use client";

import { useState } from "react";

import { useTranslations } from "next-intl";

import { useWizardStore } from "@/lib/stores/wizardStore";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from "@/components/ui/select";
// Removed accordion imports
import { AlertCircle, CheckCircle2, Clock, Info, ShieldAlert, BadgeDollarSign, Wallet, Coins, TrendingDown, Landmark } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
 createIncome,
 deleteIncome,
 updateIncome as updateIncomeSource,
 verifyIncome,
} from "@/lib/api/households-api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const ALL_CHANNEL_KEYS: Array<{
 key: string;
 critical: boolean;
 requiresDivorce?: boolean;
}> = [
 { key: "PENSION", critical: true },
 { key: "TAKAFUL_KARAMA", critical: false },
 { key: "CHARITY_1", critical: false },
 { key: "CHARITY_2", critical: false },
 { key: "CHARITY_3", critical: false },
 { key: "DONOR_1", critical: false },
 { key: "DONOR_2", critical: false },
] as const;

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

export function IncomeStep() {
 const t = useTranslations("households");
 const householdId = useWizardStore((s) => s.householdId);
 const fd = useWizardStore((s) => s.formData);
 const flags = useWizardStore((s) => s.conditionalFlags);
 const setField = useWizardStore((s) => s.setField);
 const autoSave = useWizardStore((s) => s.autoSave);
 const members = fd.members ?? [];
 const income = fd.income ?? {};

 const [meezaError, setMeezaError] = useState<string | null>(null);

 const channels = ALL_CHANNEL_KEYS;

 let verifiedCount = 0;
 let totalIncome = 0;

 channels.forEach(c => {
 const row = income[c.key];
 if (row?.amount > 0) totalIncome += row.amount;
 if (row?.verified === "VERIFIED") verifiedCount++;
 });

 const pensionRow = income["PENSION"];
 const hasUnverifiedPension = pensionRow && pensionRow.amount > 0 && pensionRow.verified !== "VERIFIED";

 // Box 1 Calculations
 const brideCount = members.filter(m => m.isBride).length;
 const orphanCount = members.filter(m => m.isOrphan).length;
 const displacedCount = members.filter(m => m.isDisplaced).length;

 const prisonerSons = members.filter(m => m.isPrisoner && (m.role === "CHILD" || m.relationship === "SON"));

 const updateIncome = (channel: string, field: string, value: any) => {
 const row = income[channel] ?? { amount: 0, verified: "UNVERIFIED" };
 setField("income", {
 ...income,
 [channel]: { ...row, [field]: value }
 });
 };

 const ensureHouseholdId = async () => {
 if (householdId) return householdId;
 await autoSave();
 return useWizardStore.getState().householdId;
 };

 const persistIncomeAmount = async (channel: string, amount: number) => {
 const hid = await ensureHouseholdId();
 if (!hid) {
 toast.error(t("wizard.income.errors.noHousehold"));
 return;
 }

 const currentIncome = useWizardStore.getState().formData.income ?? {};
 const row = currentIncome[channel] ?? { amount: 0, verified: "UNVERIFIED" };

 try {
 if (amount > 0 && !row.id) {
 const saved = await createIncome(hid, { channel, monthlyAmount: amount });
 setField("income", {
 ...currentIncome,
 [channel]: { ...row, amount, id: saved.id, verified: saved.verified },
 });
 } else if (amount > 0 && row.id) {
 await updateIncomeSource(hid, row.id, { monthlyAmount: amount });
 setField("income", {
 ...currentIncome,
 [channel]: { ...row, amount },
 });
 } else if (amount <= 0 && row.id) {
 await deleteIncome(hid, row.id);
 setField("income", {
 ...currentIncome,
 [channel]: { ...row, amount: 0, id: undefined, verified: "UNVERIFIED" },
 });
 }
 } catch {
 toast.error(t("wizard.income.errors.saveError"));
 }
 };

 const toggleVerification = async (channel: string, isVerified: boolean) => {
 const hid = await ensureHouseholdId();
 if (!hid) {
 toast.error(t("wizard.income.errors.verifyNoHousehold"));
 return;
 }

 const currentIncome = useWizardStore.getState().formData.income ?? {};
 const row = currentIncome[channel];
 if (!row?.id) {
 toast.error(t("wizard.income.errors.verifyFirst"));
 return;
 }

 try {
 const saved = await verifyIncome(hid, row.id, {
 status: isVerified ? "VERIFIED" : "UNVERIFIED",
 note: "",
 verified: isVerified ? "VERIFIED" : "UNVERIFIED",
 verificationNote: "",
 });
 setField("income", {
 ...currentIncome,
 [channel]: { ...row, verified: saved.verified, note: saved.verificationNote ?? "" },
 });
 toast.success(isVerified ? t("wizard.income.errors.verifySuccess") : t("wizard.income.errors.unverifySuccess"));
 } catch {
 toast.error(t("wizard.income.errors.verifyError"));
 }
 };

 const updateBurden = (key: string, value: any) => {
 setField("burdens", { ...(fd.burdens ?? {}), [key]: value });
 };

 const inputClass = "h-9 text-sm focus-visible:ring-2 focus-visible:ring-green-500/20 focus-visible:border-green-400";
 const labelClass = "text-sm font-medium";

 return (
 <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500" >
 
  {/* PART 0: طريقة الاستلام */}
  <section className="bg-card text-card-foreground border rounded-xl p-6 shadow-sm">
    <div className="flex items-center gap-2 mb-6">
      <Landmark className="h-5 w-5 text-indigo-500" />
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">طريقة استلام المساعدات المالية (للأسرة)</h3>
    </div>
    <div className="flex flex-wrap gap-8 items-start w-full">
      <div className="space-y-3 min-w-[200px]">
        <Label className={labelClass}>طريقة الصرف</Label>
        <RadioGroup
          value={fd.meezaCardNumber !== null && fd.meezaCardNumber !== undefined ? "MEEZA" : "MANUAL"}
          onValueChange={(val) => {
            if (val === "MANUAL") setField("meezaCardNumber", null);
            else setField("meezaCardNumber", "");
          }}
          className="flex gap-6 mt-1"
        >
          <div className="flex items-center space-x-2 space-x-reverse">
            <RadioGroupItem value="MANUAL" id="disp-manual" />
            <Label htmlFor="disp-manual" className="cursor-pointer font-semibold">يدوي (نقدي)</Label>
          </div>
          <div className="flex items-center space-x-2 space-x-reverse">
            <RadioGroupItem value="MEEZA" id="disp-meeza" />
            <Label htmlFor="disp-meeza" className="cursor-pointer font-semibold">تحويل ميزة / بنكي</Label>
          </div>
        </RadioGroup>
      </div>

      {(fd.meezaCardNumber !== null && fd.meezaCardNumber !== undefined) && (
        <div className="space-y-1.5 flex-[2] min-w-[250px] animate-in fade-in slide-in-from-top-2">
          <Label className={labelClass}>رقم كارت ميزة / البنك (16 رقم) <span className="text-destructive">*</span></Label>
          <Input
            dir="ltr"
            className={cn("text-left font-mono tracking-widest text-lg h-10 border-indigo-200 focus-visible:ring-indigo-500/20 dark:border-indigo-800", inputClass)}
            placeholder="507803..."
            value={fd.meezaCardNumber || ""}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '').slice(0, 16);
              setField("meezaCardNumber", val);
              
              if (val.length > 0 && val.length < 16) {
                setMeezaError("رقم الكارت يجب أن يتكون من 16 رقماً");
              } else if (val.length === 16) {
                if (!isValidLuhn(val)) {
                  setMeezaError("رقم الكارت غير صالح (تأكد من الأرقام)");
                } else {
                  const familiarPrefixes = ['5078', '4', '51', '52', '53', '54', '55'];
                  if (!familiarPrefixes.some(prefix => val.startsWith(prefix))) {
                    setMeezaError("الرقم لا يبدأ بالبدايات المألوفة للبنوك المتعارف عليها!");
                  } else {
                    setMeezaError(null);
                  }
                }
              } else {
                setMeezaError(null);
              }
            }}
          />
          {meezaError ? (
            <p className="text-xs text-destructive mt-1 font-medium">{meezaError}</p>
          ) : (
            <p className="text-xs text-muted-foreground mt-1">يجب إدخال 16 رقماً وسيقوم النظام بالتحقق منها.</p>
          )}
        </div>
      )}
    </div>
  </section>

  {/* PART 1: قنوات الدخل الثابتة */}
  <section className="bg-card text-card-foreground border rounded-xl p-6 shadow-sm">
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
      <div>
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <Wallet className="h-5 w-5 text-emerald-500" />
          {t("wizard.income.title")}
        </h3>
        <p className="text-sm text-muted-foreground mt-1.5">{t("wizard.income.desc")}</p>
      </div>
      <div className="bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900/50 rounded-2xl px-6 py-4 flex items-center gap-5 shadow-sm">
        <div className="bg-emerald-100 dark:bg-emerald-900/50 p-3 rounded-full">
          <BadgeDollarSign className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <div className="text-sm font-medium text-emerald-800 dark:text-emerald-300 mb-1">{t("wizard.income.totalMonthly")}</div>
          <div className="text-3xl font-black text-emerald-700 dark:text-emerald-400 leading-none tracking-tight">
            {totalIncome.toLocaleString()} <span className="text-base font-medium">{t("wizard.income.currency")}</span>
          </div>
        </div>
        <div className="border-r-2 border-emerald-200 dark:border-emerald-800/60 pr-5 ml-3 flex flex-col justify-center">
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 uppercase font-bold tracking-widest mb-1">{t("wizard.income.verification")}</span>
          <span className="text-lg font-black text-emerald-700 dark:text-emerald-300">{verifiedCount}<span className="text-emerald-600/50 text-sm">/{channels.length}</span></span>
        </div>
      </div>
    </div>

    {/* Warnings */}
    <div className="flex flex-col gap-3 mb-8">
 {verifiedCount < 3 && (
 <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-lg p-2.5 flex items-center gap-2 text-amber-700 dark:text-amber-400 text-xs">
 <AlertCircle className="h-3.5 w-3.5 shrink-0" />
 {t("wizard.income.warnings.lowVerification")}
 </div>
 )}
 {hasUnverifiedPension && (
 <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-lg p-2.5 flex items-center gap-2 text-rose-700 dark:text-rose-400 text-xs">
 <AlertCircle className="h-3.5 w-3.5 shrink-0" />
 {t("wizard.income.warnings.unverifiedPension")}
 </div>
 )}
 </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {channels.map((c) => {
        const row = income[c.key] ?? { amount: 0, verified: "UNVERIFIED" };
        const isVerified = row.verified === "VERIFIED";
        return (
          <div
            key={c.key}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200",
              isVerified
                ? "bg-emerald-50/40 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/40 shadow-sm"
                : "bg-slate-50/50 border-slate-200 dark:bg-slate-900/50 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
            )}
          >
            {/* Source Label */}
            <div className="flex flex-col min-w-0 w-36 shrink-0 gap-1">
              <span className={cn("text-sm font-semibold truncate", isVerified ? "text-emerald-900 dark:text-emerald-200" : "text-slate-800 dark:text-slate-200")}>
                {t(`wizard.income.channels.${c.key}`)}
              </span>
              {c.critical && (
                <span className="text-[10px] text-amber-600 bg-amber-50 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-900/50 px-1.5 py-0.5 rounded border border-amber-200 w-fit shrink-0">
                  {t("wizard.income.mandatory")}
                </span>
              )}
            </div>

            {/* Amount Input */}
            <div className="relative flex-1 min-w-[120px] max-w-[180px]">
              <Input
                type="number"
                min="0"
                className={cn(
                  "h-10 font-bold text-base pr-3 pl-12 transition-all",
                  isVerified ? "border-emerald-300 focus-visible:ring-emerald-500/20 dark:border-emerald-800 dark:bg-slate-950/50" : inputClass
                )}
                value={row.amount || ""}
                onChange={(e) => updateIncome(c.key, "amount", parseFloat(e.target.value) || 0)}
                onBlur={(e) => void persistIncomeAmount(c.key, parseFloat(e.target.value) || 0)}
                placeholder="0"
              />
              <span className="absolute left-3 top-2.5 text-xs font-semibold text-slate-400 dark:text-slate-500">{t("wizard.income.currency")}</span>
            </div>

            {/* Verification */}
            <div className="flex flex-col items-end justify-center gap-1.5 shrink-0 ml-auto w-16">
              <Switch
                checked={isVerified}
                onCheckedChange={(checked) => void toggleVerification(c.key, checked)}
                disabled={!row.id}
                className={cn(isVerified ? "data-[state=checked]:bg-emerald-500" : "")}
              />
              {isVerified && (
                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">{t("wizard.income.verified")}</span>
              )}
              {row.verified === "PENDING" && (
                <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">{t("wizard.income.pending")}</span>
              )}
              {row.verified === "UNVERIFIED" && !isVerified && (
                <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">{t("wizard.income.unverified")}</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  </section>

  {flags.hasDivorce && (
    <section className="bg-card text-card-foreground border rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <Landmark className="h-5 w-5 text-indigo-500" />
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">{t("wizard.income.alimony.title")}</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-6 -mt-4">{t("wizard.income.alimony.subtitle")}</p>

      <RadioGroup 
        value={fd.alimonyStatus ?? "NONE"} 
        onValueChange={(v) => setField("alimonyStatus", v)}
        className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3"
      >
        <div className={cn("flex flex-col gap-1 p-4 rounded-xl border transition-all cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-700", fd.alimonyStatus === "FORMAL" ? "bg-indigo-50/50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800" : "bg-slate-50/50 border-slate-200 dark:bg-slate-900/50 dark:border-slate-800")}>
          <div className="flex items-center gap-3">
            <RadioGroupItem value="FORMAL" id="al_formal" className="mt-0.5" />
            <Label htmlFor="al_formal" className={cn(labelClass, "cursor-pointer leading-tight")}>{t("wizard.income.alimony.options.formal")}</Label>
          </div>
        </div>
        <div className={cn("flex flex-col gap-2 p-4 rounded-xl border transition-all cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-700", fd.alimonyStatus === "INFORMAL_SUFFICIENT" ? "bg-indigo-50/50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800" : "bg-slate-50/50 border-slate-200 dark:bg-slate-900/50 dark:border-slate-800")}>
          <div className="flex items-center gap-3">
            <RadioGroupItem value="INFORMAL_SUFFICIENT" id="al_inf_suff" className="mt-0.5" />
            <Label htmlFor="al_inf_suff" className={cn(labelClass, "cursor-pointer leading-tight")}>{t("wizard.income.alimony.options.informalSufficient")}</Label>
          </div>
          <span className="text-xs text-muted-foreground mr-7">{t("wizard.income.alimony.correction80")}</span>
        </div>
        <div className={cn("flex flex-col gap-2 p-4 rounded-xl border transition-all cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-700", fd.alimonyStatus === "INFORMAL_INSUFFICIENT" ? "bg-indigo-50/50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800" : "bg-slate-50/50 border-slate-200 dark:bg-slate-900/50 dark:border-slate-800")}>
          <div className="flex items-center gap-3">
            <RadioGroupItem value="INFORMAL_INSUFFICIENT" id="al_inf_insuff" className="mt-0.5" />
            <Label htmlFor="al_inf_insuff" className={cn(labelClass, "cursor-pointer leading-tight")}>{t("wizard.income.alimony.options.informalInsufficient")}</Label>
          </div>
          <span className="text-xs text-muted-foreground mr-7">{t("wizard.income.alimony.correction40")}</span>
        </div>
        <div className={cn("flex flex-col gap-1 p-4 rounded-xl border transition-all cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-700", fd.alimonyStatus === "NONE" ? "bg-indigo-50/50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800" : "bg-slate-50/50 border-slate-200 dark:bg-slate-900/50 dark:border-slate-800")}>
          <div className="flex items-center gap-3">
            <RadioGroupItem value="NONE" id="al_none" className="mt-0.5" />
            <Label htmlFor="al_none" className={cn(labelClass, "cursor-pointer leading-tight")}>{t("wizard.income.alimony.options.none")}</Label>
          </div>
        </div>
      </RadioGroup>

      {fd.alimonyStatus === "FORMAL" && (
        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{t("wizard.income.alimony.amount")}</span>
              <p className="text-xs text-muted-foreground">أدخل قيمة النفقة الرسمية إذا كانت محددة بحكم محكمة</p>
            </div>
            <div className="flex items-center gap-6 bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="relative w-40">
                <Input 
                  type="number" 
                  min="0"
                  className={cn(inputClass, "font-bold text-base pr-4 pl-12 h-10")}
                  value={income["ALIMONY"]?.amount || ""} 
                  onChange={(e) => updateIncome("ALIMONY", "amount", parseFloat(e.target.value) || 0)} 
                  onBlur={(e) => void persistIncomeAmount("ALIMONY", parseFloat(e.target.value) || 0)}
                  placeholder="0"
                />
                <span className="absolute left-3 top-2.5 text-xs font-semibold text-slate-400">{t("wizard.income.currency")}</span>
              </div>
              <div className="flex flex-col items-center gap-1 border-r border-slate-200 dark:border-slate-700 pr-6">
                <Switch 
                  checked={income["ALIMONY"]?.verified === "VERIFIED"}
                  onCheckedChange={(checked) => void toggleVerification("ALIMONY", checked)}
                  disabled={!income["ALIMONY"]?.id}
                  className={income["ALIMONY"]?.verified === "VERIFIED" ? "data-[state=checked]:bg-emerald-500" : ""}
                />
                <span className="text-[10px] font-medium text-slate-500">توثيق</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )}

  {/* PART 2: مؤشرات التصحيح */}
  <section className="bg-card text-card-foreground border rounded-xl p-6 shadow-sm">
    <div className="flex items-center gap-2 mb-6">
      <TrendingDown className="h-5 w-5 text-amber-500" />
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">{t("wizard.income.corrections.title")}</h3>
    </div>
    
    <div className="grid gap-6 lg:grid-cols-2">
      {/* BOX 1: Counts */}
      <div className="space-y-4 bg-slate-50/50 border border-slate-200 dark:bg-slate-900/50 dark:border-slate-800 rounded-xl p-5">
        <h4 className="font-semibold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t("wizard.income.corrections.countsTitle")}</h4>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
            <span className="text-slate-700 dark:text-slate-300 font-medium">{t("wizard.income.corrections.brides")}</span>
            <Badge variant="secondary" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm font-mono px-3 border border-slate-200 dark:border-slate-700">{brideCount}</Badge>
          </div>
          <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
            <span className="text-slate-700 dark:text-slate-300 font-medium">{t("wizard.income.corrections.orphans")}</span>
            <Badge variant="secondary" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm font-mono px-3 border border-slate-200 dark:border-slate-700">{orphanCount}</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-700 dark:text-slate-300 font-medium">{t("wizard.income.corrections.displaced")}</span>
            <Badge variant="secondary" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm font-mono px-3 border border-slate-200 dark:border-slate-700">{displacedCount}</Badge>
          </div>
        </div>
        <p className="text-xs text-amber-600 dark:text-amber-400 flex items-start gap-1.5 mt-4 bg-amber-50 dark:bg-amber-950/30 p-2.5 rounded-lg border border-amber-100 dark:border-amber-900/50 leading-relaxed">
          <Info className="w-4 h-4 shrink-0 mt-0.5" /> 
          {t("wizard.income.corrections.autoNote")}
        </p>
      </div>

      <div className="space-y-6">
        {/* BOX 2: Assets */}
        <div className="space-y-3 bg-slate-50/50 border border-slate-200 dark:bg-slate-900/50 dark:border-slate-800 rounded-xl p-5">
          <h4 className="font-semibold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t("wizard.income.corrections.assetsTitle")}</h4>
          <Select value={fd.bankAssetGrade ?? "__NONE__"} onValueChange={(v) => setField("bankAssetGrade", v === "__NONE__" ? null : v)}>
            <SelectTrigger className={cn(inputClass, "h-10 bg-white dark:bg-slate-950")}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__NONE__">{t("wizard.income.corrections.assetsOptions.none")}</SelectItem>
              <SelectItem value="A">{t("wizard.income.corrections.assetsOptions.a")}</SelectItem>
              <SelectItem value="B">{t("wizard.income.corrections.assetsOptions.b")}</SelectItem>
              <SelectItem value="C">{t("wizard.income.corrections.assetsOptions.c")}</SelectItem>
              <SelectItem value="D">{t("wizard.income.corrections.assetsOptions.d")}</SelectItem>
              <SelectItem value="E">{t("wizard.income.corrections.assetsOptions.e")}</SelectItem>
              <SelectItem value="F">{t("wizard.income.corrections.assetsOptions.f")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* BOX 3: Other Indicators */}
        <div className="space-y-3 bg-slate-50/50 border border-slate-200 dark:bg-slate-900/50 dark:border-slate-800 rounded-xl p-5">
          <h4 className="font-semibold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t("wizard.income.corrections.otherIndicators")}</h4>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between bg-white dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
              <Label className={cn(labelClass, "cursor-pointer text-slate-700 dark:text-slate-300")}>{t("wizard.income.corrections.familySupport")}</Label>
              <Switch checked={fd.hasFamilySupport ?? false} onCheckedChange={(v) => setField("hasFamilySupport", v)} />
            </div>
            <div className="flex items-center justify-between bg-white dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
              <Label className={cn(labelClass, "cursor-pointer text-slate-700 dark:text-slate-300")}>{t("wizard.income.corrections.foodAid")}</Label>
              <Switch checked={fd.hasFoodAid ?? false} onCheckedChange={(v) => setField("hasFoodAid", v)} />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
 
 </div>
 );
}

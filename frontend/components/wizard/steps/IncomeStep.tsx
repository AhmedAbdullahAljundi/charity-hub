"use client";

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
import {
 Accordion,
 AccordionContent,
 AccordionItem,
 AccordionTrigger,
} from "@/components/ui/accordion";
import { AlertCircle, CheckCircle2, Clock, Info, ShieldAlert, BadgeDollarSign } from "lucide-react";
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

export function IncomeStep() {
 const t = useTranslations("households");
 const householdId = useWizardStore((s) => s.householdId);
 const fd = useWizardStore((s) => s.formData);
 const flags = useWizardStore((s) => s.conditionalFlags);
 const setField = useWizardStore((s) => s.setField);
 const autoSave = useWizardStore((s) => s.autoSave);
 const members = fd.members ?? [];
 const income = fd.income ?? {};

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
 
 {/* PART 1: قنوات الدخل */}
 <section className="space-y-4">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 gap-4">
 <div>
 <h3 className="text-sm font-semibold uppercase text-muted-foreground">{t("wizard.income.title")}</h3>
 <p className="text-xs text-muted-foreground mt-1">{t("wizard.income.desc")}</p>
 </div>
 <div className="bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800 rounded-xl px-4 py-3 flex items-center gap-4">
 <div className="bg-green-100 dark:bg-green-800 p-2 rounded-full">
 <BadgeDollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
 </div>
 <div>
 <div className="text-sm font-medium text-green-800 dark:text-green-300">{t("wizard.income.totalMonthly")}</div>
 <div className="text-2xl font-bold text-green-700 dark:text-green-400 leading-none mt-1">
 {totalIncome.toLocaleString()} <span className="text-sm font-normal">{t("wizard.income.currency")}</span>
 </div>
 </div>
 <div className="border-r border-green-200 dark:border-green-800 pr-4 ml-2 flex flex-col justify-center">
 <span className="text-[10px] text-green-600 dark:text-green-400 uppercase font-bold tracking-wider">{t("wizard.income.verification")}</span>
 <span className="text-sm font-bold text-green-700 dark:text-green-300">{verifiedCount}/{channels.length}</span>
 </div>
 </div>
 </div>

 {/* Warnings */}
 <div className="flex flex-col gap-2">
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

 <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
 {channels.map((c) => {
 const row = income[c.key] ?? { amount: 0, verified: "UNVERIFIED" };
 const isVerified = row.verified === "VERIFIED";
 return (
 <div
 key={c.key}
 className={cn(
 "flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors",
 isVerified
 ? "bg-emerald-50/50 border-emerald-200"
 : "bg-card border-border/60 hover:bg-slate-50/50"
 )}
 >
 {/* Source Label */}
 <div className="flex items-center gap-1.5 min-w-0 w-44 shrink-0">
 <span className="text-sm font-semibold text-slate-800 truncate">{t(`wizard.income.channels.${c.key}`)}</span>
 {c.critical && (
 <span className="text-[10px] text-amber-600 bg-amber-50 px-1 rounded border border-amber-200 shrink-0">{t("wizard.income.mandatory")}</span>
 )}
 </div>

 {/* Amount Input */}
 <div className="relative flex-1 min-w-[100px] max-w-[160px]">
 <Input
 type="number"
 min="0"
 className={cn(inputClass, "font-bold pr-3 pl-12")}
 value={row.amount || ""}
 onChange={(e) => updateIncome(c.key, "amount", parseFloat(e.target.value) || 0)}
 onBlur={(e) => void persistIncomeAmount(c.key, parseFloat(e.target.value) || 0)}
 placeholder="0"
 />
 <span className="absolute left-3 top-2.5 text-xs font-semibold text-slate-400">{t("wizard.income.currency")}</span>
 </div>

 {/* Verification */}
 <div className="flex items-center gap-1.5 shrink-0">
 {isVerified && (
 <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 text-[10px] border-emerald-200 px-1.5 hidden sm:inline-flex">{t("wizard.income.verified")}</Badge>
 )}
 {row.verified === "PENDING" && (
 <Badge variant="secondary" className="bg-amber-100 text-amber-700 text-[10px] border-amber-200 px-1.5 hidden sm:inline-flex">{t("wizard.income.pending")}</Badge>
 )}
 {row.verified === "UNVERIFIED" && (
 <span className="text-[10px] text-muted-foreground hidden sm:inline">{t("wizard.income.unverified")}</span>
 )}
 <Switch
 checked={isVerified}
 onCheckedChange={(checked) => void toggleVerification(c.key, checked)}
 disabled={!row.id}
 className={isVerified ? "data-[state=checked]:bg-emerald-500 scale-[0.8]" : "scale-[0.8]"}
 />
 </div>
 </div>
 );
 })}

 {/* ALIMONY SECTION */}
 {flags.hasDivorce && (
 <div className="border rounded-xl p-4 flex flex-col gap-4 bg-card shadow-sm md:col-span-2">
 <div className="flex justify-between items-start">
 <div className="flex flex-col gap-1">
 <span className="text-sm font-semibold text-slate-800">{t("wizard.income.alimony.title")}</span>
 <span className="text-[10px] text-muted-foreground">{t("wizard.income.alimony.subtitle")}</span>
 </div>
 </div>

 <RadioGroup 
 value={fd.alimonyStatus ?? "NONE"} 
 onValueChange={(v) => setField("alimonyStatus", v)}
 className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2 mt-2"
 >
 <div className="flex flex-col gap-1 bg-white p-3 rounded-lg border border-slate-100">
 <div className="flex items-center gap-2">
 <RadioGroupItem value="FORMAL" id="al_formal" />
 <Label htmlFor="al_formal" className={cn(labelClass, "cursor-pointer")}>{t("wizard.income.alimony.options.formal")}</Label>
 </div>
 </div>
 <div className="flex flex-col gap-1 bg-white p-3 rounded-lg border border-slate-100">
 <div className="flex items-center gap-2">
 <RadioGroupItem value="INFORMAL_SUFFICIENT" id="al_inf_suff" />
 <Label htmlFor="al_inf_suff" className={cn(labelClass, "cursor-pointer")}>{t("wizard.income.alimony.options.informalSufficient")}</Label>
 </div>
 <span className="text-[10px] text-muted-foreground mr-6">{t("wizard.income.alimony.correction80")}</span>
 </div>
 <div className="flex flex-col gap-1 bg-white p-3 rounded-lg border border-slate-100">
 <div className="flex items-center gap-2">
 <RadioGroupItem value="INFORMAL_INSUFFICIENT" id="al_inf_insuff" />
 <Label htmlFor="al_inf_insuff" className={cn(labelClass, "cursor-pointer")}>{t("wizard.income.alimony.options.informalInsufficient")}</Label>
 </div>
 <span className="text-[10px] text-muted-foreground mr-6">{t("wizard.income.alimony.correction40")}</span>
 </div>
 <div className="flex flex-col gap-1 bg-white p-3 rounded-lg border border-slate-100">
 <div className="flex items-center gap-2">
 <RadioGroupItem value="NONE" id="al_none" />
 <Label htmlFor="al_none" className={cn(labelClass, "cursor-pointer")}>{t("wizard.income.alimony.options.none")}</Label>
 </div>
 </div>
 </RadioGroup>

 {fd.alimonyStatus === "FORMAL" && (
 <div className="mt-4 pt-4 border-t flex flex-col gap-3">
 <div className="flex justify-between items-center">
 <span className="text-sm font-semibold text-slate-800">{t("wizard.income.alimony.amount")}</span>
 <div className="flex items-center gap-2">
 {income["ALIMONY"]?.verified === "VERIFIED" && <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 text-[10px] border-emerald-200 px-1.5">{t("wizard.income.verified")} ✓</Badge>}
 {income["ALIMONY"]?.verified === "PENDING" && <Badge variant="secondary" className="bg-amber-100 text-amber-700 text-[10px] border-amber-200 px-1.5">{t("wizard.income.pending")}</Badge>}
 {income["ALIMONY"]?.verified === "UNVERIFIED" && <span className="text-[10px] text-muted-foreground">{t("wizard.income.unverified")}</span>}
 <Switch 
 checked={income["ALIMONY"]?.verified === "VERIFIED"}
 onCheckedChange={(checked) => void toggleVerification("ALIMONY", checked)}
 disabled={!income["ALIMONY"]?.id}
 className={income["ALIMONY"]?.verified === "VERIFIED" ? "data-[state=checked]:bg-emerald-500 scale-90" : "scale-90"}
 />
 </div>
 </div>
 <div className="flex items-center gap-3">
 <Label className="text-xs text-muted-foreground w-12 font-medium">{t("wizard.income.alimony.amountLabel")}</Label>
 <div className="relative flex-1">
 <Input 
 type="number" 
 min="0"
 className={cn(inputClass, "font-bold text-base pr-4 pl-12")}
 value={income["ALIMONY"]?.amount || ""} 
 onChange={(e) => updateIncome("ALIMONY", "amount", parseFloat(e.target.value) || 0)} 
 onBlur={(e) => void persistIncomeAmount("ALIMONY", parseFloat(e.target.value) || 0)}
 placeholder="0"
 />
 <span className="absolute left-3 top-2.5 text-xs font-semibold text-slate-400">{t("wizard.income.currency")}</span>
 </div>
 </div>
 </div>
 )}
 </div>
 )}
 </div>
 </section>

 {/* PART 2: مؤشرات التصحيح */}
 <section>
 <Accordion type="single" collapsible defaultValue="corrections" className="bg-white border rounded-xl shadow-sm">
 <AccordionItem value="corrections" className="border-none">
 <AccordionTrigger className="text-sm font-semibold px-4 py-3 hover:no-underline hover:bg-slate-50 rounded-xl transition-colors">
 {t("wizard.income.corrections.title")}
 </AccordionTrigger>
 <AccordionContent className="space-y-6 pt-2 pb-6 px-4">
 
 <div className="grid gap-6 sm:grid-cols-2">
 
 {/* BOX 1 */}
 <div className="space-y-3 bg-slate-50 border border-slate-100 rounded-lg p-4">
 <h4 className="font-semibold text-xs text-slate-500 uppercase tracking-wider">{t("wizard.income.corrections.countsTitle")}</h4>
 <div className="space-y-2 text-sm">
 <div className="flex justify-between items-center py-1.5 border-b border-border/50">
 <span className="text-slate-700">{t("wizard.income.corrections.brides")}</span>
 <Badge variant="outline" className="bg-white">{brideCount}</Badge>
 </div>
 <div className="flex justify-between items-center py-1.5 border-b border-border/50">
 <span className="text-slate-700">{t("wizard.income.corrections.orphans")}</span>
 <Badge variant="outline" className="bg-white">{orphanCount}</Badge>
 </div>
 <div className="flex justify-between items-center py-1.5">
 <span className="text-slate-700">{t("wizard.income.corrections.displaced")}</span>
 <Badge variant="outline" className="bg-white">{displacedCount}</Badge>
 </div>
 </div>
 <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-2 bg-white/50 p-1.5 rounded">
 <Info className="w-3 h-3" /> {t("wizard.income.corrections.autoNote")}
 </p>
 </div>

 {/* BOX 2: النفقة (محذوف من هنا وتم نقله للأعلى) */}

 {/* BOX 4: الأصول والمشاريع */}
 <div className="space-y-3 bg-slate-50 border border-slate-100 rounded-lg p-4">
 <h4 className="font-semibold text-xs text-slate-500 uppercase tracking-wider">{t("wizard.income.corrections.assetsTitle")}</h4>
 <Select value={fd.bankAssetGrade ?? "__NONE__"} onValueChange={(v) => setField("bankAssetGrade", v === "__NONE__" ? null : v)}>
 <SelectTrigger className={inputClass}>
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

 {/* BOX 5: مؤشرات أخرى */}
 <div className="space-y-3 bg-slate-50 border border-slate-100 rounded-lg p-4 sm:col-span-2">
 <h4 className="font-semibold text-xs text-slate-500 uppercase tracking-wider mb-3">{t("wizard.income.corrections.otherIndicators")}</h4>
 <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
 
 <div className="flex items-center justify-between bg-white p-2.5 rounded border border-slate-100">
 <Label className={cn(labelClass, "cursor-pointer text-slate-700")}>{t("wizard.income.corrections.familySupport")}</Label>
 <Switch checked={fd.hasFamilySupport ?? false} onCheckedChange={(v) => setField("hasFamilySupport", v)} />
 </div>
 
 <div className="flex items-center justify-between bg-white p-2.5 rounded border border-slate-100">
 <Label className={cn(labelClass, "cursor-pointer text-slate-700")}>{t("wizard.income.corrections.foodAid")}</Label>
 <Switch checked={fd.hasFoodAid ?? false} onCheckedChange={(v) => setField("hasFoodAid", v)} />
 </div>
 
 {/* Removed: social indicators had no backend implementation */}
 </div>
 </div>

 </div>

 </AccordionContent>
 </AccordionItem>
 </Accordion>
 </section>
 
 </div>
 );
}

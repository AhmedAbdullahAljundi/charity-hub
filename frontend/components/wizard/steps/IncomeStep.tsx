"use client";

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
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, Clock, Info, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  createIncome,
  deleteIncome,
  updateIncome as updateIncomeSource,
  verifyIncome,
} from "@/lib/api/households-api";
import { toast } from "sonner";

const ALL_CHANNELS: Array<{
  key: string;
  label: string;
  critical: boolean;
  requiresDivorce?: boolean;
}> = [
  { key: "PENSION", label: "المعاش التأميني", critical: true },
  { key: "TAKAFUL_KARAMA", label: "تكافل وكرامة والضمان الاجتماعي", critical: false },
  { key: "CHARITY_1", label: "جمعية خيرية 1", critical: false },
  { key: "CHARITY_2", label: "جمعية خيرية 2", critical: false },
  { key: "CHARITY_3", label: "جمعية خيرية 3", critical: false },
  { key: "DONOR_1", label: "فاعل خير 1", critical: false },
  { key: "DONOR_2", label: "فاعل خير 2", critical: false },
  { key: "ALIMONY", label: "نفقة رسمية", critical: false, requiresDivorce: true },
] as const;

export function IncomeStep() {
  const householdId = useWizardStore((s) => s.householdId);
  const fd = useWizardStore((s) => s.formData);
  const flags = useWizardStore((s) => s.conditionalFlags);
  const setField = useWizardStore((s) => s.setField);
  const autoSave = useWizardStore((s) => s.autoSave);
  const members = fd.members ?? [];
  const income = fd.income ?? {};

  const channels = ALL_CHANNELS.filter(c => !c.requiresDivorce || flags.hasDivorce);

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
  
  // Displaced logic: (hasDivorce OR hasPrison) AND role = DEPENDENT AND age < 15
  // Since age isn't strictly stored as a number, we approximate from isOrphan-like logic if we don't recalculate it.
  // Actually we can calculate age from NID.
  const displacedCount = members.filter(m => {
    if (!(flags.hasDivorce || flags.hasPrison)) return false;
    if (m.role !== "DEPENDENT_ADULT" && m.role !== "CHILD") return false; // assuming dependent
    if (!m.nationalId) return false;
    const year = parseInt(m.nationalId[0]) === 2 ? 1900 + parseInt(m.nationalId.substring(1, 3)) : 2000 + parseInt(m.nationalId.substring(1, 3));
    const age = new Date().getFullYear() - year;
    return age < 15;
  }).length;

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
      toast.error("احفظ بيانات الأسرة الأساسية أولاً قبل حفظ الدخل.");
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
      toast.error("تعذر حفظ مصدر الدخل. حاول مرة أخرى.");
    }
  };

  const verifyIncomeSource = async (channel: string) => {
    const hid = await ensureHouseholdId();
    if (!hid) {
      toast.error("احفظ بيانات الأسرة الأساسية أولاً قبل التوثيق.");
      return;
    }

    const currentIncome = useWizardStore.getState().formData.income ?? {};
    const row = currentIncome[channel];
    if (!row?.id) {
      toast.error("احفظ المبلغ أولاً قبل التوثيق");
      return;
    }

    try {
      const saved = await verifyIncome(hid, row.id, {
        status: "VERIFIED",
        note: "",
        verified: "VERIFIED",
        verificationNote: "",
      });
      setField("income", {
        ...currentIncome,
        [channel]: { ...row, verified: saved.verified, note: saved.verificationNote ?? "" },
      });
    } catch {
      toast.error("تعذر توثيق مصدر الدخل. حاول مرة أخرى.");
    }
  };

  const updateBurden = (key: string, value: any) => {
    setField("burdens", { ...(fd.burdens ?? {}), [key]: value });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500" dir="rtl">
      
      {/* PART 1: قنوات الدخل */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 gap-4">
          <div>
            <h3 className="text-lg font-semibold">1. قنوات الدخل الثمانية</h3>
            <p className="text-sm text-muted-foreground mt-1">يجب توثيق مصادر الدخل بدقة لضمان نزاهة التقييم.</p>
          </div>
          <div className="text-left">
            <div className="text-xl font-bold text-primary">
              إجمالي الدخل الشهري: <span className="text-2xl">{totalIncome.toLocaleString()}</span> جنيه
            </div>
            <div className="text-sm font-medium mt-1">
              موثق: {verifiedCount} من {channels.length} قنوات
            </div>
          </div>
        </div>

        {/* Warnings */}
        <div className="flex flex-col gap-2">
          {verifiedCount < 3 && (
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-lg p-3 flex items-center gap-2 text-amber-700 dark:text-amber-400 text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" />
              أقل من 3 مصادر موثقة — سيُطبَّق خصم -2.0 على درجة الموثوقية
            </div>
          )}
          {hasUnverifiedPension && (
            <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-lg p-3 flex items-center gap-2 text-rose-700 dark:text-rose-400 text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" />
              المعاش التأميني مسجل ولكن غير موثق — سيُطبَّق خصم -2.0
            </div>
          )}
        </div>

        <div className="bg-card border rounded-xl overflow-hidden">
          <div className="grid grid-cols-[1fr_120px_140px] sm:grid-cols-[1fr_150px_160px_120px] bg-muted/50 p-3 text-sm font-medium">
            <div>المصدر</div>
            <div>المبلغ (جنيه)</div>
            <div className="hidden sm:block">حالة التوثيق</div>
            <div className="text-center">إجراء</div>
          </div>
          <div className="divide-y">
            {channels.map((c) => {
              const row = income[c.key] ?? { amount: 0, verified: "UNVERIFIED" };
              return (
                <div key={c.key} className="grid grid-cols-[1fr_120px_140px] sm:grid-cols-[1fr_150px_160px_120px] items-center p-3 gap-2">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <span className="text-sm font-medium">{c.label}</span>
                    {c.critical && <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 border-amber-200 w-fit">⚠️ يجب توثيقه</Badge>}
                  </div>
                  <div>
                    <Input 
                      type="number" 
                      min="0"
                      className="h-8"
                      value={row.amount || ""} 
                      onChange={(e) => updateIncome(c.key, "amount", parseFloat(e.target.value) || 0)} 
                      onBlur={(e) => void persistIncomeAmount(c.key, parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="hidden sm:flex items-center">
                    {row.verified === "VERIFIED" && <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"><CheckCircle2 className="w-3 h-3 me-1" /> موثق ✓</Badge>}
                    {row.verified === "PENDING" && <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20"><Clock className="w-3 h-3 me-1" /> قيد التحقق</Badge>}
                    {row.verified === "UNVERIFIED" && <Badge variant="secondary" className="text-muted-foreground">غير موثق</Badge>}
                  </div>
                  <div>
                    <Button
                      type="button"
                      variant={row.verified === "VERIFIED" ? "secondary" : "outline"}
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => void verifyIncomeSource(c.key)}
                    >
                      {row.verified === "VERIFIED" ? "موثق ✓" : "توثيق"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* PART 2: مؤشرات التصحيح */}
      <section>
        <Accordion type="single" collapsible defaultValue="corrections" className="bg-card border rounded-xl px-4">
          <AccordionItem value="corrections" className="border-none">
            <AccordionTrigger className="text-lg font-semibold py-4 hover:no-underline">
              2. عوامل التصحيح والمؤشرات (L4 - L7)
            </AccordionTrigger>
            <AccordionContent className="space-y-6 pt-2 pb-6">
              
              <div className="grid gap-6 sm:grid-cols-2">
                
                {/* BOX 1 */}
                <div className="space-y-3 bg-muted/20 border rounded-lg p-4">
                  <h4 className="font-semibold text-primary">العروسة والأيتام والمشردون</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center py-1 border-b border-border/50">
                      <span>عدد العرائس المحتسَبات:</span>
                      <Badge variant="secondary">{brideCount}</Badge>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-border/50">
                      <span>عدد الأيتام المحتسَبين:</span>
                      <Badge variant="secondary">{orphanCount}</Badge>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span>عدد المشردين المحتسَبين:</span>
                      <Badge variant="secondary">{displacedCount}</Badge>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-2">
                    <Info className="w-3 h-3" /> تُحسب هذه القيم تلقائياً من بيانات الأفراد
                  </p>
                </div>

                {/* BOX 2: النفقة */}
                {flags.hasDivorce && (
                  <div className="space-y-3 bg-muted/20 border rounded-lg p-4">
                    <h4 className="font-semibold text-primary">إقرار النفقة للمطلقة</h4>
                    <RadioGroup 
                      value={fd.alimonyStatus ?? "NONE"} 
                      onValueChange={(v) => setField("alimonyStatus", v)}
                      className="space-y-2 mt-2"
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="FORMAL" id="al_formal" />
                        <Label htmlFor="al_formal" className="font-normal">نفقة رسمية (مُدخَلة في القنوات أعلاه)</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="INFORMAL_SUFFICIENT" id="al_inf_suff" />
                        <Label htmlFor="al_inf_suff" className="font-normal">نفقة ودية مجزئة (-0.8)</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="INFORMAL_INSUFFICIENT" id="al_inf_insuff" />
                        <Label htmlFor="al_inf_insuff" className="font-normal">نفقة ودية غير مجزئة (-0.4)</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="NONE" id="al_none" />
                        <Label htmlFor="al_none" className="font-normal">لا يوجد / ممتنع</Label>
                      </div>
                    </RadioGroup>
                  </div>
                )}

                {/* BOX 3: السجن */}
                {prisonerSons.length > 0 && (
                  <div className="space-y-3 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                    <h4 className="font-semibold flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-slate-600" />
                      الأبناء في السجن
                    </h4>
                    <div className="space-y-2">
                      {prisonerSons.map(s => (
                        <div key={s.id ?? s._localKey} className="flex justify-between items-center text-sm bg-white dark:bg-slate-900 p-2 rounded">
                          <span className="font-medium">{s.name || "بدون اسم"}</span>
                          <span className="text-muted-foreground text-xs">
                            مدة الحكم: {
                              s.prisonTerm === "SHORT" ? "أقل من 6 أشهر" : 
                              s.prisonTerm === "MEDIUM" ? "6 أشهر - سنتين" : 
                              s.prisonTerm === "LONG" ? "أكثر من سنتين" : "غير محدد"
                            }
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* BOX 4: الأصول والمشاريع */}
                <div className="space-y-3 bg-muted/20 border rounded-lg p-4">
                  <h4 className="font-semibold text-primary">الأصول والمشاريع المملوكة</h4>
                  <Select value={fd.bankAssetGrade ?? "__NONE__"} onValueChange={(v) => setField("bankAssetGrade", v === "__NONE__" ? null : v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__NONE__">لا يوجد أصول</SelectItem>
                      <SelectItem value="A">A — أصول رمزية (حصالة أو بضاعة صغيرة) (-0.3)</SelectItem>
                      <SelectItem value="B">B — أصول بسيطة (محل أو سيارة قديمة) (-0.8)</SelectItem>
                      <SelectItem value="C">C — أصول متوسطة (عقار أو نشاط مستمر) (-1.2)</SelectItem>
                      <SelectItem value="D">D — أصول معتبرة (عقارات متعددة) (-1.6)</SelectItem>
                      <SelectItem value="E">E — أصول كبيرة (ثروة واضحة) (-2.0)</SelectItem>
                      <SelectItem value="F">F — ثروة ظاهرة (دليل غنى صريح) (-4.0)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* BOX 5: مؤشرات أخرى */}
                <div className="space-y-3 bg-muted/20 border rounded-lg p-4 sm:col-span-2">
                  <h4 className="font-semibold text-primary mb-3">مؤشرات اجتماعية واقتصادية أخرى</h4>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    
                    <div className="flex items-center justify-between border-b sm:border-none pb-2 sm:pb-0">
                      <Label className="font-normal cursor-pointer text-sm">دعم عائلي مجهول المصدر (-0.5)</Label>
                      <Switch checked={fd.hasFamilySupport ?? false} onCheckedChange={(v) => setField("hasFamilySupport", v)} />
                    </div>
                    
                    <div className="flex items-center justify-between border-b sm:border-none pb-2 sm:pb-0">
                      <Label className="font-normal cursor-pointer text-sm">مساعدات غذائية شهرية ثابتة (-0.5)</Label>
                      <Switch checked={fd.hasFoodAid ?? false} onCheckedChange={(v) => setField("hasFoodAid", v)} />
                    </div>
                    
                    <div className="flex items-center justify-between border-b sm:border-none pb-2 sm:pb-0">
                      <Label className="font-normal cursor-pointer text-sm">تدخين (-0.3)</Label>
                      <Switch checked={fd.burdens?.hasSmoking ?? false} onCheckedChange={(v) => updateBurden("hasSmoking", v)} />
                    </div>
                    
                    <div className="flex items-center justify-between border-b sm:border-none pb-2 sm:pb-0">
                      <Label className="font-normal cursor-pointer text-sm text-destructive">مخدرات (-1.5)</Label>
                      <Switch checked={fd.burdens?.hasDrugs ?? false} onCheckedChange={(v) => updateBurden("hasDrugs", v)} />
                    </div>
                    
                    <div className="flex items-center justify-between pb-2 sm:pb-0">
                      <Label className="font-normal cursor-pointer text-sm text-amber-600">تسول (-1.0)</Label>
                      <Switch checked={fd.burdens?.hasBegging ?? false} onCheckedChange={(v) => updateBurden("hasBegging", v)} />
                    </div>

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

"use client";

import { useWizardStore } from "@/lib/stores/wizardStore";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { Plus, Trash2, AlertCircle } from "lucide-react";
import {
  createBurden,
  createDisease,
  createDisability,
  deleteBurden,
  deleteDisease,
  deleteDisability,
  updateBurden as updateBurdenRecord,
  updateDisease as updateDiseaseRecord,
  updateDisability as updateDisabilityRecord,
} from "@/lib/api/households-api";
import { toast } from "sonner";

type BurdenType = "DEBT" | "INJURY" | "SURGERY" | "SON_IN_PRISON";
type DiseaseDraft = NonNullable<ReturnType<typeof useWizardStore.getState>["formData"]["diseases"]>[number];
type DisabilityDraft = NonNullable<ReturnType<typeof useWizardStore.getState>["formData"]["disabilities"]>[number];

const BURDEN_CONFIG: Record<
  BurdenType,
  {
    enabledKey: "hasDebt" | "hasInjury" | "hasSurgery" | "hasSonInPrison";
    gradeKey: "debtGrade" | "injuryGrade" | "surgeryGrade" | "sonInPrisonGrade";
    idKey: "debtId" | "injuryId" | "surgeryId" | "sonInPrisonId";
    description: string;
  }
> = {
  DEBT: {
    enabledKey: "hasDebt",
    gradeKey: "debtGrade",
    idKey: "debtId",
    description: "Temporary debt burden from wizard",
  },
  INJURY: {
    enabledKey: "hasInjury",
    gradeKey: "injuryGrade",
    idKey: "injuryId",
    description: "Temporary injury burden from wizard",
  },
  SURGERY: {
    enabledKey: "hasSurgery",
    gradeKey: "surgeryGrade",
    idKey: "surgeryId",
    description: "Temporary surgery burden from wizard",
  },
  SON_IN_PRISON: {
    enabledKey: "hasSonInPrison",
    gradeKey: "sonInPrisonGrade",
    idKey: "sonInPrisonId",
    description: "Temporary son in prison burden from wizard",
  },
};

export function BurdensStep() {
  const householdId = useWizardStore((s) => s.householdId);
  const fd = useWizardStore((s) => s.formData);
  const setField = useWizardStore((s) => s.setField);
  const autoSave = useWizardStore((s) => s.autoSave);
  
  const burdens = fd.burdens ?? {};
  const diseases = fd.diseases ?? [];
  const disabilities = fd.disabilities ?? [];
  const members = [...(fd.head?.name ? [{ id: fd.head.personId || fd.head.id, _localKey: "head", name: fd.head.name, role: "HEAD" }] : []), ...(fd.members || [])];

  const ensureHouseholdId = async () => {
    if (householdId) return householdId;
    await autoSave();
    return useWizardStore.getState().householdId;
  };

  const getHeadPersistenceIds = async () => {
    const hid = await ensureHouseholdId();
    const headPersonId = useWizardStore.getState().formData.head?.personId || useWizardStore.getState().formData.head?.id;
    if (!hid || !headPersonId) {
      toast.warning("احفظ بيانات العائل أولاً في تابة الأفراد");
      return null;
    }
    return { hid, headPersonId };
  };

  const normalizeTreatmentCost = (value?: string | null) => {
    if (value === "PERIODIC_VERY_EXPENSIVE") return "VERY_EXPENSIVE";
    return value || "NONE";
  };

  const normalizeDiseaseFollowup = (value?: string | null) => {
    if (value === "PERIODIC_REGULAR") return "REGULAR";
    if (value === "PERIODIC_EXPENSIVE") return "EXPENSIVE";
    return value || "NONE_OR_RARE";
  };

  const normalizeDiseaseWorkImpact = (value?: string | null) => {
    if (value === "SLIGHT") return "MINOR";
    if (value === "SEVERE_BUT_WORKING") return "MAJOR_WORKS";
    return value || "NONE";
  };

  const normalizeDisabilityWorkImpact = (value?: string | null) => {
    if (value === "SLIGHT") return "LIMITED";
    if (value === "REQUIRES_SPECIAL") return "SPECIAL_WORK";
    return value || "NONE";
  };

  const normalizeCompanion = (value?: string | null) => {
    if (value === "FULL_DEPENDENCE") return "FULLY_DEPENDENT";
    return value || "NONE";
  };

  const persistDisease = async (idx: number, disease: DiseaseDraft) => {
    const ids = await getHeadPersistenceIds();
    if (!ids) return;

    const body = {
      name: disease.name || "",
      treatmentCost: normalizeTreatmentCost(disease.treatmentCost),
      followup: normalizeDiseaseFollowup(disease.followup),
      workImpact: normalizeDiseaseWorkImpact(disease.workImpact),
    };

    try {
      if (disease.id) {
        await updateDiseaseRecord(ids.hid, ids.headPersonId, disease.id, body);
      } else {
        const saved = await createDisease(ids.hid, ids.headPersonId, body);
        const latest = [...(useWizardStore.getState().formData.diseases ?? [])];
        if (latest[idx]) {
          latest[idx] = { ...latest[idx], id: saved.id, personId: ids.headPersonId };
          setField("diseases", latest);
        }
      }
    } catch {
      toast.error("تعذر حفظ بيانات المرض. حاول مرة أخرى.");
    }
  };

  const persistDisability = async (idx: number, disability: DisabilityDraft) => {
    const ids = await getHeadPersistenceIds();
    if (!ids) return;

    const body = {
      description: disability.description || "",
      workImpact: normalizeDisabilityWorkImpact(disability.workImpact),
      companion: normalizeCompanion(disability.companion),
      treatmentCost: normalizeTreatmentCost(disability.treatmentCost),
    };

    try {
      if (disability.id) {
        await updateDisabilityRecord(ids.hid, ids.headPersonId, disability.id, body);
      } else {
        const saved = await createDisability(ids.hid, ids.headPersonId, body);
        const latest = [...(useWizardStore.getState().formData.disabilities ?? [])];
        if (latest[idx]) {
          latest[idx] = { ...latest[idx], id: saved.id, personId: ids.headPersonId };
          setField("disabilities", latest);
        }
      }
    } catch {
      toast.error("تعذر حفظ بيانات الإعاقة. حاول مرة أخرى.");
    }
  };

  const persistBurdenToggle = async (type: BurdenType, enabled: boolean) => {
    const config = BURDEN_CONFIG[type];
    const current = useWizardStore.getState().formData.burdens ?? {};
    const existingId = current[config.idKey];
    const grade = current[config.gradeKey] || "A";
    const next = { ...current, [config.enabledKey]: enabled };

    try {
      if (enabled && !existingId) {
        const hid = await ensureHouseholdId();
        if (!hid) {
          toast.error("احفظ بيانات الأسرة الأساسية أولاً قبل حفظ الأحمال.");
          setField("burdens", next);
          return;
        }
        const saved = await createBurden(hid, {
          type,
          grade,
          description: config.description,
        });
        setField("burdens", { ...next, [config.gradeKey]: saved.grade ?? grade, [config.idKey]: saved.id });
      } else if (!enabled && existingId) {
        const hid = await ensureHouseholdId();
        if (!hid) {
          toast.error("تعذر تحديد الأسرة لحذف الحمل.");
          setField("burdens", next);
          return;
        }
        await deleteBurden(hid, existingId);
        setField("burdens", { ...next, [config.idKey]: undefined });
      } else {
        setField("burdens", next);
      }
    } catch {
      toast.error("تعذر حفظ بيانات الأحمال. حاول مرة أخرى.");
    }
  };

  const persistBurdenGrade = async (type: BurdenType, grade: string) => {
    const config = BURDEN_CONFIG[type];
    const current = useWizardStore.getState().formData.burdens ?? {};
    const existingId = current[config.idKey];
    const enabled = Boolean(current[config.enabledKey]);
    const next = { ...current, [config.gradeKey]: grade };

    try {
      if (existingId) {
        const hid = await ensureHouseholdId();
        if (!hid) {
          toast.error("تعذر تحديد الأسرة لتحديث درجة الحمل.");
          setField("burdens", next);
          return;
        }
        await updateBurdenRecord(hid, existingId, { grade });
      } else if (enabled) {
        const hid = await ensureHouseholdId();
        if (!hid) {
          toast.error("احفظ بيانات الأسرة الأساسية أولاً قبل حفظ الأحمال.");
          setField("burdens", next);
          return;
        }
        const saved = await createBurden(hid, {
          type,
          grade,
          description: config.description,
        });
        next[config.idKey] = saved.id;
      }
      setField("burdens", next);
    } catch {
      toast.error("تعذر تحديث درجة الحمل. حاول مرة أخرى.");
    }
  };

  const addDisease = async () => {
    const draft = { _localKey: `d-${Date.now()}`, treatmentCost: "NONE", followup: "NONE_OR_RARE", workImpact: "NONE" };
    const ids = await getHeadPersistenceIds();
    if (!ids) return;
    try {
      const saved = await createDisease(ids.hid, ids.headPersonId, {
        name: "",
        treatmentCost: "NONE",
        followup: "NONE_OR_RARE",
        workImpact: "NONE",
      });
      setField("diseases", [...diseases, { ...draft, id: saved.id, personId: ids.headPersonId }]);
    } catch {
      toast.error("تعذر حفظ بيانات المرض. حاول مرة أخرى.");
    }
  };

  const updateDisease = (idx: number, key: string, value: any) => {
    const next = [...diseases];
    next[idx] = { ...next[idx], [key]: value };
    setField("diseases", next);
    void persistDisease(idx, next[idx]);
  };

  const removeDisease = async (idx: number) => {
    const disease = diseases[idx];
    if (disease?.id) {
      const ids = await getHeadPersistenceIds();
      if (!ids) return;
      try {
        await deleteDisease(ids.hid, ids.headPersonId, disease.id);
      } catch {
        toast.error("تعذر حذف المرض. حاول مرة أخرى.");
        return;
      }
    }
    setField("diseases", diseases.filter((_, i) => i !== idx));
  };

  const getDiseaseScore = (d: any) => {
    let score = 0;
    if (d.treatmentCost === "PERIODIC_CHEAP") score += 0.2;
    if (d.treatmentCost === "PERIODIC_EXPENSIVE") score += 0.4;
    if (d.treatmentCost === "PERIODIC_VERY_EXPENSIVE") score += 0.6;

    if (d.followup === "PERIODIC_REGULAR") score += 0.3;
    if (d.followup === "PERIODIC_EXPENSIVE") score += 0.5;

    if (d.workImpact === "SLIGHT") score += 0.2;
    if (d.workImpact === "SEVERE_BUT_WORKING") score += 0.4;
    if (d.workImpact === "CANNOT_WORK") score += 0.6;
    return score;
  };

  const addDisability = async () => {
    const draft = { _localKey: `dis-${Date.now()}`, workImpact: "NONE", companion: "NONE", treatmentCost: "NONE" };
    const ids = await getHeadPersistenceIds();
    if (!ids) return;
    try {
      const saved = await createDisability(ids.hid, ids.headPersonId, {
        description: "",
        workImpact: "NONE",
        companion: "NONE",
        treatmentCost: "NONE",
      });
      setField("disabilities", [...disabilities, { ...draft, id: saved.id, personId: ids.headPersonId }]);
    } catch {
      toast.error("تعذر حفظ بيانات الإعاقة. حاول مرة أخرى.");
    }
  };

  const updateDisability = (idx: number, key: string, value: any) => {
    const next = [...disabilities];
    next[idx] = { ...next[idx], [key]: value };
    setField("disabilities", next);
    void persistDisability(idx, next[idx]);
  };

  const removeDisability = async (idx: number) => {
    const disability = disabilities[idx];
    if (disability?.id) {
      const ids = await getHeadPersistenceIds();
      if (!ids) return;
      try {
        await deleteDisability(ids.hid, ids.headPersonId, disability.id);
      } catch {
        toast.error("تعذر حذف الإعاقة. حاول مرة أخرى.");
        return;
      }
    }
    setField("disabilities", disabilities.filter((_, i) => i !== idx));
  };

  const getDisabilityScore = (d: any) => {
    let score = 0;
    if (d.workImpact === "SLIGHT") score += 0.2;
    if (d.workImpact === "REQUIRES_SPECIAL") score += 0.4;
    if (d.workImpact === "CANNOT_WORK") score += 0.7;

    if (d.companion === "OUTSIDE_ONLY") score += 0.2;
    if (d.companion === "FULL_DEPENDENCE") score += 0.4;

    if (d.treatmentCost === "PERIODIC_CHEAP") score += 0.2;
    if (d.treatmentCost === "PERIODIC_EXPENSIVE") score += 0.4;
    if (d.treatmentCost === "PERIODIC_VERY_EXPENSIVE") score += 0.6;
    return score;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500" dir="rtl">
      <Accordion type="multiple" defaultValue={["section-1", "section-2", "section-3"]} className="space-y-4">
        
        {/* SECTION 1: السكن والأعباء الأساسية */}
        <AccordionItem value="section-1" className="bg-card border rounded-xl px-4">
          <AccordionTrigger className="text-lg font-semibold hover:no-underline py-4">
            1. السكن والأعباء الأساسية
          </AccordionTrigger>
          <AccordionContent className="space-y-6 pt-2 pb-6">
            
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>نوع السكن</Label>
                <Select value={fd.housingType ?? "OWNED"} onValueChange={(v) => setField("housingType", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OWNED">ملك (0.0)</SelectItem>
                    <SelectItem value="SHARED">مشترك مع أسرة أخرى (0.3)</SelectItem>
                    <SelectItem value="DONATED_RENT">إيجار متبرع به (0.4)</SelectItem>
                    <SelectItem value="RENTED">إيجار يدفعه الأسرة (0.7)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between border rounded-lg p-3 bg-muted/10">
                <Label className="cursor-pointer">الأسرة لا تملك بطاقة تموين (0.4)</Label>
                <Switch checked={!(fd.hasRationCard ?? true)} onCheckedChange={(v) => setField("hasRationCard", !v)} />
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-3 border-t pt-4">
              {/* الديون */}
              <div className="space-y-3 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border">
                <div className="flex items-center justify-between">
                  <Label>توجد ديون مؤثرة؟</Label>
                  <Switch checked={burdens.hasDebt ?? false} onCheckedChange={(v) => void persistBurdenToggle("DEBT", v)} />
                </div>
                {burdens.hasDebt && (
                  <div className="space-y-2 pt-2 border-t">
                    <Label className="text-xs">درجة الدين</Label>
                    <Select value={burdens.debtGrade ?? "A"} onValueChange={(v) => void persistBurdenGrade("DEBT", v)}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">A — دين بسيط يُدار (0.2)</SelectItem>
                        <SelectItem value="B">B — دين متوسط (0.4)</SelectItem>
                        <SelectItem value="C">C — دين ثقيل (0.7)</SelectItem>
                        <SelectItem value="D">D — دين حرج جداً (1.0)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* الإصابات */}
              <div className="space-y-3 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border">
                <div className="flex items-center justify-between">
                  <Label>توجد إصابات مؤثرة؟</Label>
                  <Switch checked={burdens.hasInjury ?? false} onCheckedChange={(v) => void persistBurdenToggle("INJURY", v)} />
                </div>
                {burdens.hasInjury && (
                  <div className="space-y-2 pt-2 border-t">
                    <Label className="text-xs">درجة الإصابة</Label>
                    <Select value={burdens.injuryGrade ?? "A"} onValueChange={(v) => void persistBurdenGrade("INJURY", v)}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">A — إصابة بسيطة (0.2)</SelectItem>
                        <SelectItem value="B">B — إصابة متوسطة (0.4)</SelectItem>
                        <SelectItem value="C">C — إصابة شديدة (0.7)</SelectItem>
                        <SelectItem value="D">D — إصابة حرجة (1.0)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* العمليات الجراحية */}
              <div className="space-y-3 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border">
                <div className="flex items-center justify-between">
                  <Label>توجد عمليات جراحية؟</Label>
                  <Switch checked={burdens.hasSurgery ?? false} onCheckedChange={(v) => void persistBurdenToggle("SURGERY", v)} />
                </div>
                {burdens.hasSurgery && (
                  <div className="space-y-2 pt-2 border-t">
                    <Label className="text-xs">درجة العملية</Label>
                    <Select value={burdens.surgeryGrade ?? "A"} onValueChange={(v) => void persistBurdenGrade("SURGERY", v)}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">A (0.3)</SelectItem>
                        <SelectItem value="B">B (0.5)</SelectItem>
                        <SelectItem value="C">C (0.8)</SelectItem>
                        <SelectItem value="D">D (1.0)</SelectItem>
                        <SelectItem value="E">E — جراحة حرجة جداً (1.5)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>

          </AccordionContent>
        </AccordionItem>

        {/* SECTION 2: الأمراض المزمنة */}
        <AccordionItem value="section-2" className="bg-card border rounded-xl px-4">
          <AccordionTrigger className="text-lg font-semibold hover:no-underline py-4">
            2. الأمراض المزمنة
          </AccordionTrigger>
          <AccordionContent className="space-y-6 pt-2 pb-6">
            
            {diseases.map((d, idx) => (
              <div key={d.id ?? d._localKey} className="bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-xl p-4 relative">
                <Button variant="ghost" size="icon" className="absolute top-2 left-2 text-rose-500 hover:text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/50" onClick={() => void removeDisease(idx)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
                
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 pr-6">
                  <div className="space-y-2">
                    <Label className="text-xs">اسم المرض / الوصف</Label>
                    <Input className="h-8 text-sm bg-white dark:bg-black" value={d.name ?? ""} onChange={(e) => updateDisease(idx, "name", e.target.value)} />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-xs">الشخص المصاب</Label>
                    <Select value={d.personId ?? ""} onValueChange={(v) => updateDisease(idx, "personId", v)}>
                      <SelectTrigger className="h-8 text-xs bg-white dark:bg-black"><SelectValue placeholder="اختر الفرد" /></SelectTrigger>
                      <SelectContent>
                        {members.map(m => (
                          <SelectItem key={m.id || m._localKey} value={m.id || m._localKey || "unknown"}>{m.name || "بدون اسم"}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-xs">تكلفة العلاج</Label>
                    <Select value={d.treatmentCost ?? "NONE"} onValueChange={(v) => updateDisease(idx, "treatmentCost", v)}>
                      <SelectTrigger className="h-8 text-xs bg-white dark:bg-black"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NONE">لا يوجد/يسير (0.0)</SelectItem>
                        <SelectItem value="PERIODIC_CHEAP">دوري وغير مكلف (0.2)</SelectItem>
                        <SelectItem value="PERIODIC_EXPENSIVE">دوري ومكلف (0.4)</SelectItem>
                        <SelectItem value="PERIODIC_VERY_EXPENSIVE">دوري ومكلف جداً (0.6)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-xs">المتابعة الطبية</Label>
                    <Select value={d.followup ?? "NONE_OR_RARE"} onValueChange={(v) => updateDisease(idx, "followup", v)}>
                      <SelectTrigger className="h-8 text-xs bg-white dark:bg-black"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NONE_OR_RARE">لا يحتاج/متباعدة (0.0)</SelectItem>
                        <SelectItem value="PERIODIC_REGULAR">زيارات دورية منتظمة (0.3)</SelectItem>
                        <SelectItem value="PERIODIC_EXPENSIVE">زيارات دورية مكلفة (0.5)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2 lg:col-span-2">
                    <Label className="text-xs">التأثير على العمل</Label>
                    <Select value={d.workImpact ?? "NONE"} onValueChange={(v) => updateDisease(idx, "workImpact", v)}>
                      <SelectTrigger className="h-8 text-xs bg-white dark:bg-black"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NONE">لا يؤثر (0.0)</SelectItem>
                        <SelectItem value="SLIGHT">يحد قليلاً (0.2)</SelectItem>
                        <SelectItem value="SEVERE_BUT_WORKING">يؤثر كثيراً لكن يعمل (0.4)</SelectItem>
                        <SelectItem value="CANNOT_WORK">لا يستطيع العمل (0.6)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="lg:col-span-2 flex items-end justify-end pb-1">
                    <span className="text-sm font-semibold text-rose-700 dark:text-rose-400">
                      نقاط هذا المرض: {getDiseaseScore(d).toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {diseases.length >= 3 && (
              <div className="bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 text-sm p-3 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                ⚠️ من الحالة الثالثة فأكثر تُطبَّق قاعدة التناقص ×0.5 تلقائياً من قبل محرك التقييم.
              </div>
            )}

            <Button variant="outline" className="w-full border-dashed" onClick={() => void addDisease()}>
              <Plus className="w-4 h-4 me-2" /> إضافة مرض مزمن
            </Button>
            
          </AccordionContent>
        </AccordionItem>

        {/* SECTION 3: الإعاقات */}
        <AccordionItem value="section-3" className="bg-card border rounded-xl px-4">
          <AccordionTrigger className="text-lg font-semibold hover:no-underline py-4">
            3. الإعاقات
          </AccordionTrigger>
          <AccordionContent className="space-y-6 pt-2 pb-6">
            
            {disabilities.map((d, idx) => (
              <div key={d.id ?? d._localKey} className="bg-orange-50/50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30 rounded-xl p-4 relative">
                <Button variant="ghost" size="icon" className="absolute top-2 left-2 text-orange-500 hover:text-orange-600 hover:bg-orange-100 dark:hover:bg-orange-900/50" onClick={() => void removeDisability(idx)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
                
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 pr-6">
                  <div className="space-y-2">
                    <Label className="text-xs">وصف الإعاقة</Label>
                    <Input className="h-8 text-sm bg-white dark:bg-black" value={d.description ?? ""} onChange={(e) => updateDisability(idx, "description", e.target.value)} />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-xs">الشخص المعاق</Label>
                    <Select value={d.personId ?? ""} onValueChange={(v) => updateDisability(idx, "personId", v)}>
                      <SelectTrigger className="h-8 text-xs bg-white dark:bg-black"><SelectValue placeholder="اختر الفرد" /></SelectTrigger>
                      <SelectContent>
                        {members.map(m => (
                          <SelectItem key={m.id || m._localKey} value={m.id || m._localKey || "unknown"}>{m.name || "بدون اسم"}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-xs">التأثير على العمل</Label>
                    <Select value={d.workImpact ?? "NONE"} onValueChange={(v) => updateDisability(idx, "workImpact", v)}>
                      <SelectTrigger className="h-8 text-xs bg-white dark:bg-black"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NONE">لا مانع (0.0)</SelectItem>
                        <SelectItem value="SLIGHT">تحد قليلاً (0.2)</SelectItem>
                        <SelectItem value="REQUIRES_SPECIAL">تتطلب عملاً خاصاً (0.4)</SelectItem>
                        <SelectItem value="CANNOT_WORK">غير قادر إطلاقاً (0.7)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">الحاجة لمرافق</Label>
                    <Select value={d.companion ?? "NONE"} onValueChange={(v) => updateDisability(idx, "companion", v)}>
                      <SelectTrigger className="h-8 text-xs bg-white dark:bg-black"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NONE">لا يحتاج (0.0)</SelectItem>
                        <SelectItem value="OUTSIDE_ONLY">مرافق خارج المنزل فقط (0.2)</SelectItem>
                        <SelectItem value="FULL_DEPENDENCE">اعتماد كلي على المرافق (0.4)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2 lg:col-span-2">
                    <Label className="text-xs">تكلفة العلاج (أجهزة/علاج)</Label>
                    <Select value={d.treatmentCost ?? "NONE"} onValueChange={(v) => updateDisability(idx, "treatmentCost", v)}>
                      <SelectTrigger className="h-8 text-xs bg-white dark:bg-black"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NONE">لا يوجد/يسير (0.0)</SelectItem>
                        <SelectItem value="PERIODIC_CHEAP">دوري وغير مكلف (0.2)</SelectItem>
                        <SelectItem value="PERIODIC_EXPENSIVE">دوري ومكلف (0.4)</SelectItem>
                        <SelectItem value="PERIODIC_VERY_EXPENSIVE">دوري ومكلف جداً (0.6)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="lg:col-span-2 flex items-end justify-end pb-1">
                    <span className="text-sm font-semibold text-orange-700 dark:text-orange-400">
                      نقاط هذه الإعاقة: {getDisabilityScore(d).toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            <Button variant="outline" className="w-full border-dashed" onClick={() => void addDisability()}>
              <Plus className="w-4 h-4 me-2" /> إضافة إعاقة
            </Button>
            
          </AccordionContent>
        </AccordionItem>

      </Accordion>
    </div>
  );
}

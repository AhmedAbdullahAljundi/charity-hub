"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2, GraduationCap, Stethoscope, HeartPulse, ShieldAlert, Heart, Home, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useWizardStore, WizardPersonForm } from "@/lib/stores/wizardStore";
import {
  createDisease,
  createDisability,
  createPerson,
  deletePerson,
  updatePerson,
} from "@/lib/api/households-api";
import { toast } from "sonner";

function extractNationalIdInfo(nid: string) {
  if (!/^[23]\d{13}$/.test(nid)) return null;
  const century = nid[0] === "2" ? 1900 : 2000;
  const year = century + parseInt(nid.substring(1, 3));
  const month = parseInt(nid.substring(3, 5));
  const day = parseInt(nid.substring(5, 7));
  const genderDigit = parseInt(nid.substring(12, 13));
  const gender = genderDigit % 2 === 0 ? "FEMALE" : "MALE";
  
  const birthDate = new Date(year, month - 1, day);
  let age = new Date().getFullYear() - birthDate.getFullYear();
  const m = new Date().getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && new Date().getDate() < birthDate.getDate())) {
    age--;
  }
  return { gender, age, birthDate: birthDate.toISOString().split("T")[0] };
}

function normalizeRole(role?: string) {
  if (role === "HEAD" || role === "SPOUSE" || role === "DEPENDENT_ADULT" || role === "CHILD") return role;
  if (role === "زوج" || role === "زوجة") return "SPOUSE";
  if (role === "مستقل" || role === "INDEPENDENT") return "OTHER";
  return "OTHER";
}

function normalizeEmploymentQuality(value?: string | null) {
  if (value === "SUFFICIENT" || value === "UNSTABLE" || value === "WEAK") return value;
  if (value === "VERY_WEAK") return "WEAK";
  if (value === "IRREGULAR" || value === "REGULAR_PARTIAL") return "UNSTABLE";
  return null;
}

function normalizeStudentLevel(value?: string | null) {
  const map: Record<string, string> = {
    TODDLER: "CHILD",
    SECONDARY_TECHNICAL_FEMALE: "SECONDARY_VOCATIONAL_FEMALE",
    SECONDARY_TECHNICAL_MALE: "SECONDARY_VOCATIONAL_MALE",
    UNIVERSITY_STEM: "UNIVERSITY_SCIENTIFIC",
    UNIVERSITY_ARTS: "UNIVERSITY_HUMANITIES",
  };
  return value ? map[value] ?? value : null;
}

function normalizeTreatmentCost(value?: string | null) {
  if (value === "PERIODIC_VERY_EXPENSIVE") return "VERY_EXPENSIVE";
  return value || "NONE";
}

function normalizeDiseaseFollowup(value?: string | null) {
  if (value === "PERIODIC_REGULAR") return "REGULAR";
  if (value === "PERIODIC_EXPENSIVE") return "EXPENSIVE";
  return value || "NONE_OR_RARE";
}

function normalizeDiseaseWorkImpact(value?: string | null) {
  if (value === "SLIGHT") return "MINOR";
  if (value === "SEVERE_BUT_WORKING") return "MAJOR_WORKS";
  return value || "NONE";
}

function normalizeDisabilityWorkImpact(value?: string | null) {
  if (value === "SLIGHT") return "LIMITED";
  if (value === "REQUIRES_SPECIAL") return "SPECIAL_WORK";
  return value || "NONE";
}

function normalizeCompanion(value?: string | null) {
  if (value === "FULL_DEPENDENCE") return "FULLY_DEPENDENT";
  return value || "NONE";
}

export function PersonsStep() {
  const householdId = useWizardStore((s) => s.householdId);
  const fd = useWizardStore((s) => s.formData);
  const members = fd.members ?? [];
  const setField = useWizardStore((s) => s.setField);
  const flags = useWizardStore((s) => s.conditionalFlags);
  const autoSave = useWizardStore((s) => s.autoSave);
  
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [draft, setDraft] = useState<WizardPersonForm>({});

  const openNew = () => {
    setDraft({ _localKey: `m-${Date.now()}`, role: "DEPENDENT_ADULT", gender: "MALE" });
    setEditingIdx(null);
    setIsModalOpen(true);
  };

  const openEdit = (idx: number) => {
    setDraft({ ...members[idx] });
    setEditingIdx(idx);
    setIsModalOpen(true);
  };

  const ensureHouseholdId = async () => {
    if (householdId) return householdId;
    await autoSave();
    return useWizardStore.getState().householdId;
  };

  const removeMember = async (idx: number) => {
    const member = members[idx];
    try {
      if (member?.id && householdId) {
        await deletePerson(householdId, member.id);
      }
      setField("members", members.filter((_, i) => i !== idx));
    } catch {
      toast.error("تعذر حذف الفرد. حاول مرة أخرى.");
    }
  };

  const buildPersonPayload = (member: WizardPersonForm) => {
    const info = member.nationalId ? extractNationalIdInfo(member.nationalId) : null;
    const role = normalizeRole(member.role);
    const gender = member.gender || info?.gender || "MALE";
    const employmentType = member.employmentType || "NONE";
    const isWorkingSon = role === "CHILD" && gender === "MALE" && employmentType !== "NONE";
    const payload: Record<string, unknown> = {
      name: member.name,
      nationalId: member.nationalId,
      gender,
      birthDate: member.birthDate || info?.birthDate,
      role,
      isHead: false,
      maritalStatus: member.maritalStatus || "SINGLE",
      residencyStatus: "RESIDENT",
      employmentType,
      employmentQuality: normalizeEmploymentQuality(member.employmentQuality),
      educationLevel: member.educationLevel || "ILLITERATE",
      isStudent: member.isStudent || false,
      studentLevel: normalizeStudentLevel(member.studentLevel),
      isBride: member.isBride || false,
      brideHasSponsor: member.brideHasSponsor || false,
      isOrphan: member.isOrphan || false,
      isSonContributor: isWorkingSon,
      sonMarried: member.sonMarried || false,
      sonSameHouse: member.sonSameHouse ?? true,
      isPrisoner: member.isPrisoner || false,
      prisonTerm: member.prisonTerm || null,
    };
    if (role === "SPOUSE" && fd.socialStatus === "DIVORCED") {
      payload.alimonyStatus = fd.alimonyStatus || null;
    }
    return payload;
  };

  const saveMemberHealth = async (hid: string, pid: string, member: WizardPersonForm) => {
    const diseases = [...(member.diseases ?? []), ...(member.diseasesDraft ?? [])];
    const disabilities = [...(member.disabilities ?? []), ...(member.disabilitiesDraft ?? [])];
    const savedDiseases: any[] = [];
    const savedDisabilities: any[] = [];

    for (const disease of diseases) {
      if (!disease.id) {
        const savedDisease = await createDisease(hid, pid, {
          name: "name" in disease ? disease.name || "" : "",
          treatmentCost: normalizeTreatmentCost(disease.treatmentCost),
          followup: normalizeDiseaseFollowup(disease.followup),
          workImpact: normalizeDiseaseWorkImpact(disease.workImpact),
        });
        savedDiseases.push({ ...disease, ...savedDisease, id: savedDisease.id });
      } else {
        savedDiseases.push(disease);
      }
    }

    for (const disability of disabilities) {
      if (!disability.id) {
        const savedDisability = await createDisability(hid, pid, {
          description: "description" in disability ? disability.description || "" : "",
          workImpact: normalizeDisabilityWorkImpact(disability.workImpact),
          companion: normalizeCompanion(disability.companion),
          treatmentCost: normalizeTreatmentCost(disability.treatmentCost),
        });
        savedDisabilities.push({ ...disability, ...savedDisability, id: savedDisability.id });
      } else {
        savedDisabilities.push(disability);
      }
    }

    return {
      diseases: savedDiseases,
      disabilities: savedDisabilities,
      diseasesDraft: [],
      disabilitiesDraft: [],
    };
  };

  const saveMember = async () => {
    setIsSaving(true);
    try {
      const hid = await ensureHouseholdId();
      if (!hid) {
        toast.error("احفظ بيانات الأسرة الأساسية أولاً قبل إضافة الأفراد.");
        return;
      }
      const payload = buildPersonPayload(draft);
      if (!payload.name || !payload.birthDate || !payload.role) {
        toast.error("أدخل اسم الفرد وتاريخ الميلاد والدور قبل الحفظ.");
        return;
      }
      const saved = draft.id
        ? await updatePerson(hid, draft.id, payload)
        : await createPerson(hid, payload);
      const savedHealth = await saveMemberHealth(hid, saved.id, draft);

      const savedMember = { ...draft, ...saved, ...savedHealth, id: saved.id };
      const next = [...members];
      if (editingIdx !== null) {
        next[editingIdx] = savedMember;
      } else {
        next.push(savedMember);
      }
      setField("members", next);
      setIsModalOpen(false);
    } catch {
      toast.error("تعذر حفظ بيانات الفرد. حاول مرة أخرى.");
    } finally {
      setIsSaving(false);
    }
  };

  const updateDraft = (key: keyof WizardPersonForm, value: unknown) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  // Conditionals for the form
  const age = draft.nationalId ? extractNationalIdInfo(draft.nationalId)?.age ?? 0 : 0;
  const gender = draft.gender ?? "MALE";
  
  const showBrideToggle = gender === "FEMALE" && age >= 13 && age <= 25 && draft.maritalStatus === "SINGLE" && draft.role === "DEPENDENT_ADULT";
  const showOrphan = flags.hasWidow && draft.role === "DEPENDENT_ADULT" && age < 15;
  const showDisplaced = (flags.hasDivorce || flags.hasPrison) && draft.role === "DEPENDENT_ADULT" && age < 15;
  const showSonSection = draft.role === "CHILD" && gender === "MALE" && draft.employmentType && draft.employmentType !== "NONE";

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500" dir="rtl">
      
      {/* Persons Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        <AnimatePresence>
          {members.map((m, idx) => {
            const mAge = m.nationalId ? extractNationalIdInfo(m.nationalId)?.age : null;
            return (
              <motion.div
                key={m.id ?? m._localKey ?? idx}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-card border border-border/60 rounded-xl p-4 shadow-sm relative group overflow-hidden"
              >
                {/* Badges container */}
                <div className="absolute top-3 left-3 flex flex-col gap-1 items-end">
                  {m.isStudent && <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20"><GraduationCap className="w-3 h-3 me-1" />طالب</Badge>}
                  {m.hasDisease && <Badge className="bg-rose-500/10 text-rose-600 hover:bg-rose-500/20"><HeartPulse className="w-3 h-3 me-1" />مريض</Badge>}
                  {m.hasDisability && <Badge className="bg-orange-500/10 text-orange-600 hover:bg-orange-500/20"><Stethoscope className="w-3 h-3 me-1" />معاق</Badge>}
                  {m.isPrisoner && <Badge className="bg-slate-800 text-slate-100 hover:bg-slate-700"><ShieldAlert className="w-3 h-3 me-1" />سجين</Badge>}
                  {m.isBride && <Badge className="bg-pink-500/10 text-pink-600 hover:bg-pink-500/20"><Heart className="w-3 h-3 me-1" />عروسة</Badge>}
                  {m.isOrphan && <Badge className="bg-purple-500/10 text-purple-600 hover:bg-purple-500/20"><Home className="w-3 h-3 me-1" />يتيم</Badge>}
                </div>

                <div className="pe-16">
                  <h4 className="font-bold text-base flex items-center gap-2">
                    {m.name || "بدون اسم"}
                    <span className="text-muted-foreground text-xs font-normal">
                      ({m.gender === "FEMALE" ? "♀" : "♂"} {mAge != null ? `${mAge} سنة` : ""})
                    </span>
                  </h4>
                  <div className="flex flex-wrap gap-2 mt-2 text-xs text-muted-foreground">
                    <span className="bg-muted px-2 py-1 rounded-md">{m.role === "DEPENDENT_ADULT" ? "معال" : m.role === "CHILD" ? "ابن/ابنة" : "مستقل"}</span>
                    <span className="bg-muted px-2 py-1 rounded-md">{m.educationLevel || "لم يحدد التعليم"}</span>
                    <span className="bg-muted px-2 py-1 rounded-md">{m.employmentType !== "NONE" ? "يعمل" : "لا يعمل"}</span>
                  </div>
                </div>

                <div className="absolute bottom-3 left-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => openEdit(idx)}>
                    <Edit2 className="h-3 w-3" />
                  </Button>
                  <Button variant="destructive" size="icon" className="h-7 w-7" onClick={() => removeMember(idx)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        <button
          onClick={openNew}
          className="border-2 border-dashed border-border/60 hover:border-primary/50 hover:bg-primary/5 rounded-xl p-6 flex flex-col items-center justify-center text-muted-foreground transition-all min-h-[140px]"
        >
          <Plus className="h-8 w-8 mb-2 opacity-50" />
          <span className="font-medium">إضافة فرد للأسرة</span>
        </button>
      </div>

      {/* Person Form Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle>{editingIdx !== null ? "تعديل بيانات الفرد" : "إضافة فرد جديد"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Core Info */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>الاسم الكامل <span className="text-destructive">*</span></Label>
                <Input value={draft.name ?? ""} onChange={(e) => updateDraft("name", e.target.value)} />
              </div>
              
              <div className="space-y-2">
                <Label>الرقم القومي <span className="text-destructive">*</span></Label>
                <Input 
                  value={draft.nationalId ?? ""} 
                  maxLength={14}
                  onChange={(e) => {
                    const val = e.target.value;
                    updateDraft("nationalId", val);
                    const info = extractNationalIdInfo(val);
                    if (info) {
                      updateDraft("birthDate", info.birthDate);
                      updateDraft("gender", info.gender);
                    }
                  }} 
                />
                {draft.nationalId && extractNationalIdInfo(draft.nationalId) && (
                  <p className="text-xs text-muted-foreground mt-1">
                    تاريخ الميلاد: {extractNationalIdInfo(draft.nationalId)!.birthDate} | العمر: {extractNationalIdInfo(draft.nationalId)!.age} سنة | الجنس: {extractNationalIdInfo(draft.nationalId)!.gender === "MALE" ? "ذكر" : "أنثى"}
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>الصلة بالأسرة</Label>
                <Select value={draft.relationship ?? ""} onValueChange={(v) => updateDraft("relationship", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SPOUSE">زوج / زوجة</SelectItem>
                    <SelectItem value="SON">ابن</SelectItem>
                    <SelectItem value="DAUGHTER">ابنة</SelectItem>
                    <SelectItem value="FATHER">أب</SelectItem>
                    <SelectItem value="MOTHER">أم</SelectItem>
                    <SelectItem value="BROTHER">أخ</SelectItem>
                    <SelectItem value="SISTER">أخت</SelectItem>
                    <SelectItem value="GRANDFATHER">جد</SelectItem>
                    <SelectItem value="GRANDMOTHER">جدة</SelectItem>
                    <SelectItem value="OTHER">قريب آخر</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>الدور</Label>
                <Select value={draft.role ?? "DEPENDENT_ADULT"} onValueChange={(v) => updateDraft("role", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HEAD">عائل</SelectItem>
                    <SelectItem value="DEPENDENT_ADULT">معال</SelectItem>
                    <SelectItem value="CHILD">ابن / طفل</SelectItem>
                    <SelectItem value="INDEPENDENT">مستقل</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>الحالة الاجتماعية</Label>
                <Select value={draft.maritalStatus ?? "SINGLE"} onValueChange={(v) => updateDraft("maritalStatus", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SINGLE">أعزب/ة</SelectItem>
                    <SelectItem value="MARRIED">متزوج/ة</SelectItem>
                    <SelectItem value="DIVORCED">مطلق/ة</SelectItem>
                    <SelectItem value="WIDOWED">أرمل/ة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2 border-t pt-4">
              <Label>مستوى التعليم</Label>
              <Select value={draft.educationLevel ?? "ILLITERATE"} onValueChange={(v) => updateDraft("educationLevel", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ILLITERATE">أمي / يوميات</SelectItem>
                  <SelectItem value="MEDIUM">فوق متوسط / شركات</SelectItem>
                  <SelectItem value="HIGHER_LIMITED">تعليم عالٍ محدود</SelectItem>
                  <SelectItem value="HIGHER_STABLE">تعليم عالٍ مستقر</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">(يؤثر على معامل التصحيح الاقتصادي فقط)</p>
            </div>

            {/* Employment for Dependents */}
            {draft.role === "DEPENDENT_ADULT" && (
              <div className="space-y-2 border-t pt-4">
                <Label>جودة العمل</Label>
                <Select value={draft.employmentQuality ?? "NONE"} onValueChange={(v) => updateDraft("employmentQuality", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">لا يعمل</SelectItem>
                    <SelectItem value="VERY_WEAK">عمل قليل جداً (-0.2)</SelectItem>
                    <SelectItem value="IRREGULAR">عمل غير منتظم (-0.4)</SelectItem>
                    <SelectItem value="REGULAR_PARTIAL">عمل منتظم مجزئ (-0.6)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Student Section */}
            <div className="border-t pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <Label>طالب؟</Label>
                <Switch checked={draft.isStudent ?? false} onCheckedChange={(v) => updateDraft("isStudent", v)} />
              </div>
              {draft.isStudent && (
                <div className="space-y-2 pl-4 border-r-2 border-primary/20">
                  <Label>المرحلة الدراسية</Label>
                  <Select value={draft.studentLevel ?? "PRIMARY"} onValueChange={(v) => updateDraft("studentLevel", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TODDLER">طفل (0.5)</SelectItem>
                      <SelectItem value="KINDERGARTEN">حضانة (0.6)</SelectItem>
                      <SelectItem value="PRIMARY">ابتدائي (0.7)</SelectItem>
                      <SelectItem value="PREPARATORY">إعدادي (0.8)</SelectItem>
                      <SelectItem value="SECONDARY_GENERAL">ثانوي عام (1.0)</SelectItem>
                      <SelectItem value="SECONDARY_TECHNICAL_FEMALE">ثانوي تجاري/صناعي بنت (0.9)</SelectItem>
                      <SelectItem value="SECONDARY_TECHNICAL_MALE">ثانوي تجاري/صناعي ولد (0.7)</SelectItem>
                      <SelectItem value="UNIVERSITY_STEM">جامعة علمية (1.0)</SelectItem>
                      <SelectItem value="UNIVERSITY_ARTS">جامعة أدبية (0.8)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Sons working Section */}
            <div className="border-t pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <Label>يعمل؟ (للأبناء)</Label>
                <Switch checked={(draft.employmentType && draft.employmentType !== "NONE") ?? false} onCheckedChange={(v) => updateDraft("employmentType", v ? "WEAK" : "NONE")} />
              </div>
              
              {showSonSection && (
                <div className="space-y-4 pl-4 border-r-2 border-primary/20 bg-muted/10 p-4 rounded-xl">
                  <h5 className="font-semibold text-sm text-primary">قسم الابن المساهم</h5>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>نوع العمل</Label>
                      <Select value={draft.employmentType ?? "WEAK"} onValueChange={(v) => updateDraft("employmentType", v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="WEAK">يومية ضعيفة</SelectItem>
                          <SelectItem value="SEASONAL">موسمي</SelectItem>
                          <SelectItem value="REGULAR">منتظم</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">متزوج؟</Label>
                        <Switch checked={draft.sonMarried ?? false} onCheckedChange={(v) => updateDraft("sonMarried", v)} />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">يسكن مع الأسرة؟</Label>
                        <Switch checked={draft.sonSameHouse ?? false} onCheckedChange={(v) => updateDraft("sonSameHouse", v)} />
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2">هذه البيانات تحدد معامل التصحيح الاقتصادي للابن في L7</p>
                </div>
              )}
            </div>

            {/* Vulnerability Conditionals */}
            <div className="border-t pt-4 space-y-4">
              
              {showBrideToggle && (
                <div className="flex flex-col gap-3 bg-pink-50 dark:bg-pink-950/20 p-3 rounded-lg border border-pink-100 dark:border-pink-900/30">
                  <div className="flex items-center justify-between">
                    <Label className="text-pink-700 dark:text-pink-400">حالة عروسة</Label>
                    <Switch checked={draft.isBride ?? false} onCheckedChange={(v) => updateDraft("isBride", v)} />
                  </div>
                  {draft.isBride && (
                    <div className="flex items-center justify-between pl-4 border-r-2 border-pink-200">
                      <Label className="text-xs text-pink-700/80">يوجد كافل أو إرث؟ (-0.3)</Label>
                      <Switch checked={draft.brideHasSponsor ?? false} onCheckedChange={(v) => updateDraft("brideHasSponsor", v)} />
                    </div>
                  )}
                </div>
              )}

              {showOrphan && (
                <div className="flex items-center justify-between bg-purple-50 dark:bg-purple-950/20 p-3 rounded-lg border border-purple-100 dark:border-purple-900/30">
                  <div>
                    <Label className="text-purple-700 dark:text-purple-400">حالة يتيم</Label>
                    <p className="text-[10px] text-purple-700/70 mt-1">الحساب يختلف حسب الجنس والسن — يُحسب تلقائياً</p>
                  </div>
                  <Switch checked={draft.isOrphan ?? false} onCheckedChange={(v) => updateDraft("isOrphan", v)} />
                </div>
              )}

              {showDisplaced && (
                <div className="bg-orange-50 dark:bg-orange-950/20 p-3 rounded-lg border border-orange-100 dark:border-orange-900/30">
                  <Label className="text-orange-700 dark:text-orange-400 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> حالة مشرد (انفصال/سجن)
                  </Label>
                  <p className="text-[10px] text-orange-700/70 mt-1">يحسب له نصف وزن اليتيم تلقائياً</p>
                </div>
              )}

              {flags.hasPrison && (
                <div className="flex flex-col gap-3 bg-slate-100 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <Label>هل هذا الفرد هو المسجون؟</Label>
                    <Switch checked={draft.isPrisoner ?? false} onCheckedChange={(v) => updateDraft("isPrisoner", v)} />
                  </div>
                  {draft.isPrisoner && (
                    <div className="space-y-2 pl-4 border-r-2 border-slate-300 dark:border-slate-600">
                      <Label className="text-xs">مدة الحكم</Label>
                      <Select value={draft.prisonTerm ?? "SHORT"} onValueChange={(v) => updateDraft("prisonTerm", v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SHORT">أقل من 6 أشهر (0.4)</SelectItem>
                          <SelectItem value="MEDIUM">6 أشهر – سنتين (0.7)</SelectItem>
                          <SelectItem value="LONG">أكثر من سنتين (1.0)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Health / Disabilities */}
            <div className="grid gap-4 sm:grid-cols-2 border-t pt-4">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2"><HeartPulse className="w-4 h-4 text-rose-500" />مريض؟</Label>
                <Switch checked={draft.hasDisease ?? false} onCheckedChange={(v) => updateDraft("hasDisease", v)} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2"><Stethoscope className="w-4 h-4 text-orange-500" />معاق؟</Label>
                <Switch checked={draft.hasDisability ?? false} onCheckedChange={(v) => updateDraft("hasDisability", v)} />
              </div>
            </div>

            <div className="space-y-2 border-t pt-4">
              <Label>ملاحظة خاصة بالفرد</Label>
              <Textarea 
                value={draft.notes ?? ""} 
                onChange={(e) => updateDraft("notes", e.target.value)} 
                placeholder="أية تفاصيل إضافية..."
                className="resize-none"
              />
            </div>
            
            <div className="pt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>إلغاء</Button>
              <Button onClick={saveMember} disabled={isSaving}>
                {isSaving ? "جار الحفظ..." : "حفظ الفرد"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

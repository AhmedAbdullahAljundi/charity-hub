"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2, GraduationCap, Stethoscope, HeartPulse, ShieldAlert, Heart, Home, AlertCircle, Briefcase } from "lucide-react";
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
import { cn } from "@/lib/utils";

function extractNationalIdInfo(nid: string) {
 if (!nid || !/^([23])(\d{2})(0[1-9]|1[012])(0[1-9]|[12]\d|3[01])\d{7}$/.test(nid)) return null;
 const century = nid[0] === "2" ? 1900 : 2000;
 const year = century + parseInt(nid.substring(1, 3));
 const month = parseInt(nid.substring(3, 5));
 const day = parseInt(nid.substring(5, 7));
 const genderDigit = parseInt(nid.substring(12, 13));
 const gender = genderDigit % 2 === 0 ? "FEMALE" : "MALE";
 
 const birthDate = new Date(year, month - 1, day);
 const today = new Date();
 let age = today.getFullYear() - birthDate.getFullYear();
 const m = today.getMonth() - birthDate.getMonth();
 if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
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
 const t = useTranslations("households");
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

 const removeMember = (idx: number) => {
 const member = members[idx];
 const prevMembers = [...members];
 
 // Optimistic UI Update
 setField("members", members.filter((_, i) => i !== idx));
 
 toast(t("wizard.persons.deleteToast"), {
 description: t("wizard.persons.deleteToastDesc"),
 duration: 60000,
 action: {
 label: t("wizard.persons.undo"),
 onClick: () => {
 setField("members", prevMembers);
 toast.success(t("wizard.persons.undoSuccess"));
 },
 },
 onDismiss: async () => {
 executeDelete(member);
 },
 onAutoClose: async () => {
 executeDelete(member);
 }
 });
 };

 const executeDelete = async (member: WizardPersonForm) => {
 const currentMembers = useWizardStore.getState().formData.members || [];
 const isRestored = currentMembers.some(m => m.id === member.id || m._localKey === member._localKey);
 if (!isRestored && member?.id && householdId) {
 try {
 await deletePerson(householdId, member.id);
 } catch {
 toast.error(t("wizard.persons.deleteError"));
 }
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
 prisonSuspicion: member.prisonSuspicion ?? null,
 relationship: member.relationship || null,
 notes: member.notes || null,
 };
 if (role === "SPOUSE" || role === "HEAD") {
 payload.educationLevel = fd.head?.educationLevel || "ILLITERATE";
 payload.maritalStatus = fd.socialStatus === "SINGLE_OTHER" ? "SINGLE" : fd.socialStatus || "MARRIED";
 }
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
 if (editingIdx === -1) {
 setField("head", { ...fd.head, ...draft });
 if (draft.workCorrection) {
 setField("workCorrection", draft.workCorrection);
 }
 setIsModalOpen(false);
 setIsSaving(false);
 return;
 }
 
 const hid = await ensureHouseholdId();
 if (!hid) {
 toast.error(t("wizard.persons.saveError"));
 return;
 }
 const payload = buildPersonPayload(draft);
 if (!payload.name || !payload.birthDate || !payload.role) {
 toast.error(t("wizard.persons.validationError"));
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
 toast.error(t("wizard.persons.persistError"));
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

 const inputClass = "h-9 text-sm focus-visible:ring-2 focus-visible:ring-green-500/20 focus-visible:border-green-400";
 const labelClass = "text-sm font-medium";

 return (
 <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500" >
 
 {/* Persons Grid */}
 <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">


 <AnimatePresence>
 {members.map((m, idx) => {
 const mAge = m.nationalId ? extractNationalIdInfo(m.nationalId)?.age : null;
 const isSpouse = m.role === "SPOUSE";
 return (
 <motion.div
 key={m.id ?? m._localKey ?? idx}
 layout
 initial={{ opacity: 0, scale: 0.95 }}
 animate={{ opacity: 1, scale: 1 }}
 exit={{ opacity: 0, scale: 0.95 }}
 className={cn(
 "border rounded-xl p-5 shadow-sm relative group overflow-hidden transition-colors",
 isSpouse 
 ? "bg-green-50/30 border-green-200 hover:border-green-400" 
 : "bg-card border-border/80 hover:border-primary/40"
 )}
 >
 {/* Health Indicators (Colored Dots) */}
 <div className="absolute top-4 left-4 flex gap-1.5">
 {m.hasDisease && <div title={t("wizard.persons.disease")} className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"></div>}
 {m.hasDisability && <div title={t("wizard.persons.disability")} className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]"></div>}
 </div>

 <div className="pe-8 space-y-3">
 <div>
 <h4 className="font-bold text-base text-slate-900 line-clamp-1" title={m.name}>{m.name || t("wizard.persons.noName")}</h4>
 <div className="flex items-center gap-2 mt-1">
 <Badge variant="secondary" className={cn("text-[10px] px-1.5 py-0 text-white border-transparent", m.gender === "FEMALE" ? "bg-pink-500 hover:bg-pink-600" : "bg-blue-500 hover:bg-blue-600")}>
 {m.gender === "FEMALE" ? t("wizard.persons.female") : t("wizard.persons.male")}
 </Badge>
 {mAge != null && <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-slate-600 bg-slate-50">{mAge} {t("wizard.persons.years")}</Badge>}
 </div>
 </div>

 <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground bg-slate-50 p-2.5 rounded-lg border border-slate-100">
 <div className="flex items-center gap-1.5 line-clamp-1"><Home className="w-3.5 h-3.5 text-slate-400 shrink-0"/> {isSpouse ? t("wizard.persons.spouseCard") : m.role === "DEPENDENT_ADULT" ? t("wizard.persons.dependent") : m.role === "CHILD" ? t("wizard.persons.child") : t("wizard.persons.independent")}</div>
 <div className="flex items-center gap-1.5 line-clamp-1"><GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0"/> {m.isStudent ? t("wizard.persons.student") : (m.educationLevel === "ILLITERATE" ? t("wizard.persons.educationOptions.illiterate").split(" ")[0] : t("wizard.persons.literate"))}</div>
 <div className="flex items-center gap-1.5 line-clamp-1 col-span-2"><Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0"/> {m.employmentType !== "NONE" ? t("wizard.persons.working") : t("wizard.persons.notWorking")}</div>
 </div>
 
 {/* Status Badges Row */}
 <div className="flex flex-wrap gap-1.5 pt-1">
 {m.isPrisoner && <Badge variant="secondary" className="bg-slate-800 text-slate-100 hover:bg-slate-700 text-[10px] px-1.5 py-0 h-4 rounded">{t("tags.prisoner")}</Badge>}
 {m.isBride && <Badge variant="secondary" className="bg-pink-100 text-pink-700 hover:bg-pink-200 text-[10px] px-1.5 py-0 h-4 rounded border border-pink-200">{t("tags.bride")}</Badge>}
 {m.isOrphan && <Badge variant="secondary" className="bg-purple-100 text-purple-700 hover:bg-purple-200 text-[10px] px-1.5 py-0 h-4 rounded border border-purple-200">{t("tags.orphan")}</Badge>}
 </div>
 </div>

 <div className="absolute bottom-4 left-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur rounded-lg p-1 shadow-sm border border-slate-200">
 <Button variant="ghost" size="icon" className="h-7 w-7 text-blue-600 hover:text-blue-700 hover:bg-blue-50" onClick={() => openEdit(idx)}>
 <Edit2 className="h-3.5 w-3.5" />
 </Button>
 {!isSpouse && (
 <Button variant="ghost" size="icon" className="h-7 w-7 text-rose-600 hover:text-rose-700 hover:bg-rose-50" onClick={() => removeMember(idx)}>
 <Trash2 className="h-3.5 w-3.5" />
 </Button>
 )}
 </div>
 </motion.div>
 );
 })}
 </AnimatePresence>

 <button
 onClick={openNew}
 className="border-2 border-dashed border-border/60 hover:border-primary/50 hover:bg-primary/5 rounded-xl p-6 flex flex-col items-center justify-center text-muted-foreground transition-all min-h-[160px]"
 >
 <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center mb-3">
 <Plus className="h-5 w-5 text-slate-400" />
 </div>
 <span className="font-medium text-sm text-slate-600">{t("wizard.persons.addNew")}</span>
 </button>
 </div>

 {/* Person Form Modal */}
 <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
 <DialogContent className="sm:max-w-[650px] max-h-[85vh] overflow-y-auto" >
 <DialogHeader>
 <DialogTitle className="text-lg font-semibold">{editingIdx !== null ? t("wizard.persons.editTitle") : t("wizard.persons.addNew")}</DialogTitle>
 </DialogHeader>

 <div className="space-y-6 py-4">
 <div className="grid gap-4 sm:grid-cols-2">
 <div className="space-y-1.5">
 <Label className={labelClass}>{t("wizard.persons.name")} <span className="text-destructive">*</span></Label>
 <Input className={inputClass} value={draft.name ?? ""} placeholder="" onChange={(e) => updateDraft("name", e.target.value)} disabled={draft.role === "SPOUSE"} />
 </div>
 
 <div className="space-y-1.5">
 <Label className={labelClass}>{t("wizard.persons.nid")} <span className="text-destructive">*</span></Label>
 <Input 
 className={inputClass}
 value={draft.nationalId ?? ""} 
 maxLength={14}
 placeholder=""
 disabled={draft.role === "SPOUSE"}
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
 <p className="text-[11px] text-muted-foreground mt-1 flex gap-2">
 <span>{extractNationalIdInfo(draft.nationalId)!.birthDate}</span>
 <span>|</span>
 <span>{extractNationalIdInfo(draft.nationalId)!.age} {t("wizard.persons.years")}</span>
 <span>|</span>
 <span>{extractNationalIdInfo(draft.nationalId)!.gender === "MALE" ? t("wizard.persons.male") : t("wizard.persons.female")}</span>
 </p>
 )}
 </div>
 </div>

 <div className="grid gap-4 sm:grid-cols-3">
 <div className="space-y-1.5">
 <Label className={labelClass}>{t("wizard.persons.relationship")}</Label>
 <Select value={draft.relationship ?? ""} onValueChange={(v) => updateDraft("relationship", v)}>
 <SelectTrigger className={inputClass}><SelectValue placeholder="" /></SelectTrigger>
 <SelectContent>
 <SelectItem value="SPOUSE">{t("wizard.persons.relationshipOptions.spouse")}</SelectItem>
 <SelectItem value="SON">{t("wizard.persons.relationshipOptions.son")}</SelectItem>
 <SelectItem value="DAUGHTER">{t("wizard.persons.relationshipOptions.daughter")}</SelectItem>
 <SelectItem value="FATHER">{t("wizard.persons.relationshipOptions.father")}</SelectItem>
 <SelectItem value="MOTHER">{t("wizard.persons.relationshipOptions.mother")}</SelectItem>
 <SelectItem value="BROTHER">{t("wizard.persons.relationshipOptions.brother")}</SelectItem>
 <SelectItem value="SISTER">{t("wizard.persons.relationshipOptions.sister")}</SelectItem>
 <SelectItem value="GRANDFATHER">{t("wizard.persons.relationshipOptions.grandfather")}</SelectItem>
 <SelectItem value="GRANDMOTHER">{t("wizard.persons.relationshipOptions.grandmother")}</SelectItem>
 <SelectItem value="OTHER">{t("wizard.persons.relationshipOptions.other")}</SelectItem>
 </SelectContent>
 </Select>
 </div>

 <div className="space-y-1.5">
 <Label className={labelClass}>{t("wizard.persons.role")} <span className="text-destructive">*</span></Label>
 <Select value={draft.role ?? "DEPENDENT_ADULT"} onValueChange={(v) => updateDraft("role", v)} disabled={draft.role === "SPOUSE"}>
 <SelectTrigger className={inputClass}><SelectValue placeholder="" /></SelectTrigger>
 <SelectContent>
 <SelectItem value="HEAD">{t("wizard.persons.roleOptions.head")}</SelectItem>
 <SelectItem value="SPOUSE">{t("wizard.persons.roleOptions.spouse")}</SelectItem>
 <SelectItem value="DEPENDENT_ADULT">{t("wizard.persons.roleOptions.dependentAdult")}</SelectItem>
 <SelectItem value="INDEPENDENT">{t("wizard.persons.roleOptions.independent")}</SelectItem>
 <SelectItem value="CHILD">{t("wizard.persons.roleOptions.child")}</SelectItem>
 </SelectContent>
 </Select>
 </div>

 {draft.role !== "SPOUSE" && draft.role !== "HEAD" && (
 <div className="space-y-1.5">
 <Label className={labelClass}>{t("wizard.persons.maritalStatus")}</Label>
 <Select value={draft.maritalStatus ?? "SINGLE"} onValueChange={(v) => updateDraft("maritalStatus", v)}>
 <SelectTrigger className={inputClass}><SelectValue /></SelectTrigger>
 <SelectContent>
 <SelectItem value="SINGLE">{t("wizard.persons.maritalOptions.single")}</SelectItem>
 <SelectItem value="MARRIED">{t("wizard.persons.maritalOptions.married")}</SelectItem>
 <SelectItem value="DIVORCED">{t("wizard.persons.maritalOptions.divorced")}</SelectItem>
 <SelectItem value="WIDOWED">{t("wizard.persons.maritalOptions.widowed")}</SelectItem>
 </SelectContent>
 </Select>
 </div>
 )}
 </div>

 {/* Education + Employment for non-spouse/head */}
 {draft.role !== "SPOUSE" && draft.role !== "HEAD" && (
 <div className="border-t pt-4 space-y-3">
 <div className="grid gap-4 sm:grid-cols-2">
 <div className="space-y-1.5">
 <Label className={labelClass}>{t("wizard.persons.education")}</Label>
 <Select value={draft.educationLevel ?? "ILLITERATE"} onValueChange={(v) => updateDraft("educationLevel", v)}>
 <SelectTrigger className={inputClass}><SelectValue /></SelectTrigger>
 <SelectContent>
 <SelectItem value="ILLITERATE">{t("wizard.persons.educationOptions.illiterate")}</SelectItem>
 <SelectItem value="MEDIUM">{t("wizard.persons.educationOptions.medium")}</SelectItem>
 <SelectItem value="HIGHER_LIMITED">{t("wizard.persons.educationOptions.higherLimited")}</SelectItem>
 <SelectItem value="HIGHER_STABLE">{t("wizard.persons.educationOptions.higherStable")}</SelectItem>
 </SelectContent>
 </Select>
 </div>

 {draft.role === "DEPENDENT_ADULT" && (
 <div className="space-y-1.5">
 <Label className={labelClass}>{t("wizard.persons.employmentQuality")}</Label>
 <Select
 value={draft.employmentQuality ?? "NONE"}
 onValueChange={(v) => updateDraft("employmentQuality", v)}
 >
 <SelectTrigger className={inputClass}><SelectValue /></SelectTrigger>
 <SelectContent>
 <SelectItem value="NONE">{t("wizard.persons.employmentQualityOptions.none")}</SelectItem>
 <SelectItem value="WEAK">{t("wizard.persons.employmentQualityOptions.weak")}</SelectItem>
 <SelectItem value="UNSTABLE">{t("wizard.persons.employmentQualityOptions.unstable")}</SelectItem>
 <SelectItem value="SUFFICIENT">{t("wizard.persons.employmentQualityOptions.sufficient")}</SelectItem>
 </SelectContent>
 </Select>
 </div>
 )}
 </div>

 {/* Show computed correction for DEPENDENT_ADULT */}
 {draft.role === "DEPENDENT_ADULT" &&
 draft.employmentQuality &&
 draft.employmentQuality !== "NONE" &&
 (() => {
 const baseMap: Record<string, number> = {
 WEAK: -0.20,
 UNSTABLE: -0.40,
 SUFFICIENT: -0.60,
 };
 const eduMap: Record<string, number> = {
 ILLITERATE: 1,
 MEDIUM: 0.75,
 HIGHER_LIMITED: 0.5,
 HIGHER_STABLE: 0.25,
 };
 const base = baseMap[draft.employmentQuality!] ?? 0;
 const edu = eduMap[draft.educationLevel ?? "ILLITERATE"] ?? 1;
 const correction = base * edu;
 return (
 <div className="text-xs text-blue-700 bg-blue-50 border border-blue-100 rounded px-3 py-1.5 flex items-center gap-2">
 <span className="font-bold">التصحيح المحسوب:</span>
 <span className="font-mono font-semibold">{correction.toFixed(2)}</span>
 <span className="text-blue-500">نقطة على درجة الهشاشة</span>
 </div>
 );
 })()
 }
 </div>
 )}
 {/* Student Section */}
 <div className="border-t pt-4 space-y-4">
 <div className="flex items-center justify-between">
 <Label className={labelClass}>{t("wizard.persons.isStudent")}</Label>
 <Switch checked={draft.isStudent ?? false} onCheckedChange={(v) => updateDraft("isStudent", v)} />
 </div>
 {draft.isStudent && (
 <div className="space-y-1.5 pl-4 border-r-2 border-blue-500/20">
 <Label className={labelClass}>{t("wizard.persons.studentLevel")}</Label>
 <Select value={draft.studentLevel ?? "PRIMARY"} onValueChange={(v) => updateDraft("studentLevel", v)}>
 <SelectTrigger className={inputClass}><SelectValue /></SelectTrigger>
 <SelectContent>
 <SelectItem value="TODDLER">{t("wizard.persons.studentLevelOptions.toddler")}</SelectItem>
 <SelectItem value="KINDERGARTEN">{t("wizard.persons.studentLevelOptions.kindergarten")}</SelectItem>
 <SelectItem value="PRIMARY">{t("wizard.persons.studentLevelOptions.primary")}</SelectItem>
 <SelectItem value="PREPARATORY">{t("wizard.persons.studentLevelOptions.preparatory")}</SelectItem>
 <SelectItem value="SECONDARY_GENERAL">{t("wizard.persons.studentLevelOptions.secondaryGeneral")}</SelectItem>
 <SelectItem value="SECONDARY_TECHNICAL_FEMALE">{t("wizard.persons.studentLevelOptions.secondaryTechFemale")}</SelectItem>
 <SelectItem value="SECONDARY_TECHNICAL_MALE">{t("wizard.persons.studentLevelOptions.secondaryTechMale")}</SelectItem>
 <SelectItem value="UNIVERSITY_STEM">{t("wizard.persons.studentLevelOptions.uniStem")}</SelectItem>
 <SelectItem value="UNIVERSITY_ARTS">{t("wizard.persons.studentLevelOptions.uniArts")}</SelectItem>
 </SelectContent>
 </Select>
 </div>
 )}
 </div>

 {/* Sons working Section */}
 <div className="border-t pt-4 space-y-4">
 <div className="flex items-center justify-between">
 <Label className={labelClass}>{t("wizard.persons.sonWorking")}</Label>
 <Switch checked={(draft.employmentType && draft.employmentType !== "NONE") ?? false} onCheckedChange={(v) => updateDraft("employmentType", v ? "WEAK" : "NONE")} />
 </div>
 
 {showSonSection && (
 <div className="space-y-4 pl-4 border-r-2 border-green-500/20 bg-green-50/50 p-4 rounded-xl">
 <h5 className="font-semibold text-xs text-green-800 uppercase">{t("wizard.persons.sonWorkingDesc")}</h5>
 <div className="grid gap-4 sm:grid-cols-2">
 <div className="space-y-1.5">
 <Label className={labelClass}>{t("wizard.persons.workType")}</Label>
 <Select value={draft.employmentType ?? "WEAK"} onValueChange={(v) => updateDraft("employmentType", v)}>
 <SelectTrigger className={inputClass}><SelectValue /></SelectTrigger>
 <SelectContent>
 <SelectItem value="WEAK">{t("wizard.persons.workTypeOptions.weak")}</SelectItem>
 <SelectItem value="SEASONAL">{t("wizard.persons.workTypeOptions.seasonal")}</SelectItem>
 <SelectItem value="REGULAR">{t("wizard.persons.workTypeOptions.regular")}</SelectItem>
 </SelectContent>
 </Select>
 </div>
 <div className="space-y-3 pt-2">
 <div className="flex items-center justify-between">
 <Label className="text-xs">{t("wizard.persons.isMarried")}</Label>
 <Switch checked={draft.sonMarried ?? false} onCheckedChange={(v) => updateDraft("sonMarried", v)} />
 </div>
 <div className="flex items-center justify-between">
 <Label className="text-xs">{t("wizard.persons.sameHouse")}</Label>
 <Switch checked={draft.sonSameHouse ?? false} onCheckedChange={(v) => updateDraft("sonSameHouse", v)} />
 </div>
 </div>
 </div>
 </div>
 )}
 </div>

 {/* Vulnerability Conditionals */}
 <div className="border-t pt-4 space-y-4">
 
 {showBrideToggle && (
 <div className="flex flex-col gap-3 bg-pink-50 dark:bg-pink-950/20 p-3 rounded-lg border border-pink-100 dark:border-pink-900/30">
 <div className="flex items-center justify-between">
 <Label className="text-pink-700 dark:text-pink-400 font-semibold">{t("wizard.persons.brideState")}</Label>
 <Switch checked={draft.isBride ?? false} onCheckedChange={(v) => updateDraft("isBride", v)} />
 </div>
 {draft.isBride && (
 <div className="flex items-center justify-between pl-4 border-r-2 border-pink-200">
 <Label className="text-xs text-pink-700/80">{t("wizard.persons.brideHasSponsor")}</Label>
 <Switch checked={draft.brideHasSponsor ?? false} onCheckedChange={(v) => updateDraft("brideHasSponsor", v)} />
 </div>
 )}
 </div>
 )}

 {showOrphan && (
 <div className="flex items-center justify-between bg-purple-50 dark:bg-purple-950/20 p-3 rounded-lg border border-purple-100 dark:border-purple-900/30">
 <div>
 <Label className="text-purple-700 dark:text-purple-400 font-semibold">{t("wizard.persons.orphanState")}</Label>
 <p className="text-[10px] text-purple-700/70 mt-0.5">{t("wizard.persons.orphanDesc")}</p>
 </div>
 <Switch checked={draft.isOrphan ?? false} onCheckedChange={(v) => updateDraft("isOrphan", v)} />
 </div>
 )}

 {showDisplaced && (
 <div className="bg-orange-50 dark:bg-orange-950/20 p-3 rounded-lg border border-orange-100 dark:border-orange-900/30">
 <Label className="text-orange-700 dark:text-orange-400 flex items-center gap-1.5 font-semibold">
 <AlertCircle className="w-4 h-4" /> {t("wizard.persons.displacedState")}
 </Label>
 <p className="text-[10px] text-orange-700/70 mt-1">{t("wizard.persons.displacedDesc")}</p>
 </div>
 )}

 {flags.hasPrison && (
 <div className="flex flex-col gap-3 bg-slate-100 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
 <div className="flex items-center justify-between">
 <Label className="font-semibold text-slate-800">{t("wizard.persons.isPrisoner")}</Label>
 <Switch checked={draft.isPrisoner ?? false} onCheckedChange={(v) => updateDraft("isPrisoner", v)} />
 </div>
 {draft.isPrisoner && (
 <>
 <div className="space-y-1.5 pl-4 border-r-2 border-slate-300 dark:border-slate-600">
 <Label className="text-xs">{t("wizard.persons.prisonTerm")}</Label>
 <Select value={draft.prisonTerm ?? "SHORT"} onValueChange={(v) => updateDraft("prisonTerm", v)}>
 <SelectTrigger className={inputClass}><SelectValue /></SelectTrigger>
 <SelectContent>
 <SelectItem value="SHORT">{t("wizard.persons.prisonTermOptions.short")}</SelectItem>
 <SelectItem value="MEDIUM">{t("wizard.persons.prisonTermOptions.medium")}</SelectItem>
 <SelectItem value="LONG">{t("wizard.persons.prisonTermOptions.long")}</SelectItem>
 </SelectContent>
 </Select>
 </div>
 
 <div className="space-y-1.5 pl-4 border-r-2 border-slate-300 dark:border-slate-600">
 <Label className="text-xs">{t("wizard.persons.prisonSuspicion")}</Label>
 <Select 
 value={draft.prisonSuspicion?.toString() ?? "NONE"} 
 onValueChange={(v) => updateDraft("prisonSuspicion", v === "NONE" ? null : parseFloat(v))}
 >
 <SelectTrigger className={inputClass}><SelectValue placeholder="" /></SelectTrigger>
 <SelectContent>
 <SelectItem value="NONE">{t("wizard.persons.prisonSuspicionOptions.none")}</SelectItem>
 <SelectItem value="-0.4">{t("wizard.persons.prisonSuspicionOptions.light")}</SelectItem>
 <SelectItem value="-1.0">{t("wizard.persons.prisonSuspicionOptions.medium")}</SelectItem>
 <SelectItem value="-2.0">{t("wizard.persons.prisonSuspicionOptions.high")}</SelectItem>
 <SelectItem value="-3.0">{t("wizard.persons.prisonSuspicionOptions.extreme")}</SelectItem>
 </SelectContent>
 </Select>
 <p className="text-[10px] text-muted-foreground mt-1">{t("wizard.persons.prisonSuspicionDesc")}</p>
 </div>
 </>
 )}
 </div>
 )}
 </div>

 {/* Health / Disabilities */}
 <div className="grid gap-4 sm:grid-cols-2 border-t pt-4 bg-rose-50/30 rounded-lg p-2 mt-2">
 <div className="flex items-center justify-between">
 <Label className="flex items-center gap-2 font-semibold text-rose-800"><HeartPulse className="w-4 h-4" />{t("wizard.persons.hasDisease")}</Label>
 <Switch checked={draft.hasDisease ?? false} onCheckedChange={(v) => {
 updateDraft("hasDisease", v);
 if (v && (!draft.diseasesDraft || draft.diseasesDraft.length === 0) && (!draft.diseases || draft.diseases.length === 0)) {
 updateDraft("diseasesDraft", [{}]);
 }
 }} />
 </div>
 <div className="flex items-center justify-between">
 <Label className="flex items-center gap-2 font-semibold text-orange-800"><Stethoscope className="w-4 h-4" />{t("wizard.persons.hasDisability")}</Label>
 <Switch checked={draft.hasDisability ?? false} onCheckedChange={(v) => {
 updateDraft("hasDisability", v);
 if (v && (!draft.disabilitiesDraft || draft.disabilitiesDraft.length === 0) && (!draft.disabilities || draft.disabilities.length === 0)) {
 updateDraft("disabilitiesDraft", [{}]);
 }
 }} />
 </div>
 </div>

 {editingIdx === -1 && (
 <div className="border-t pt-4 space-y-4 bg-amber-50/50 border border-amber-100 p-4 rounded-xl mt-4">
 <h5 className="font-semibold text-xs text-amber-800 uppercase">{t("wizard.persons.workCorrection")}</h5>
 <div className="grid gap-4 sm:grid-cols-2">
 <div className="space-y-1.5">
 <Label className={labelClass}>{t("wizard.persons.workCorrectionType")}</Label>
 <Select 
 value={draft.workCorrection?.type ?? ""} 
 onValueChange={(v) => {
 let multiplier = 0;
 if (v === "head_weak") multiplier = -0.50;
 else if (v === "head_seasonal") multiplier = -0.30;
 else if (v === "head_regular") multiplier = 0;
 else if (v === "head_none") multiplier = 0;
 const edu = draft.workCorrection?.educationMultiplier ?? 1;
 updateDraft("workCorrection", { type: v, multiplier: multiplier * edu, educationMultiplier: edu });
 }}
 >
 <SelectTrigger className={inputClass}><SelectValue placeholder="" /></SelectTrigger>
 <SelectContent>
 <SelectItem value="head_weak">{t("wizard.persons.workCorrectionOptions.weak")}</SelectItem>
 <SelectItem value="head_seasonal">{t("wizard.persons.workCorrectionOptions.seasonal")}</SelectItem>
 <SelectItem value="head_regular">{t("wizard.persons.workCorrectionOptions.regular")}</SelectItem>
 <SelectItem value="head_none">{t("wizard.persons.workCorrectionOptions.none")}</SelectItem>
 </SelectContent>
 </Select>
 </div>
 <div className="space-y-1.5">
 <Label className={labelClass}>{t("wizard.persons.educationMultiplier")}</Label>
 <Select 
 value={draft.workCorrection?.educationMultiplier?.toString() ?? "1"} 
 onValueChange={(v) => {
 const edu = parseFloat(v);
 const type = draft.workCorrection?.type;
 let baseMultiplier = 0;
 if (type === "head_weak") baseMultiplier = -0.50;
 else if (type === "head_seasonal") baseMultiplier = -0.30;
 
 updateDraft("workCorrection", { ...draft.workCorrection, type: type || "", multiplier: baseMultiplier * edu, educationMultiplier: edu });
 }}
 >
 <SelectTrigger className={inputClass}><SelectValue placeholder="" /></SelectTrigger>
 <SelectContent>
 <SelectItem value="1">{t("wizard.persons.educationMultiplierOptions.illiterate")}</SelectItem>
 <SelectItem value="0.75">{t("wizard.persons.educationMultiplierOptions.medium")}</SelectItem>
 <SelectItem value="0.5">{t("wizard.persons.educationMultiplierOptions.higher")}</SelectItem>
 </SelectContent>
 </Select>
 </div>
 </div>
 </div>
 )}

 <div className="space-y-1.5 border-t pt-4">
 <Label className={labelClass}>{t("wizard.persons.notes")}</Label>
 <Textarea 
 value={draft.notes ?? ""} 
 onChange={(e) => updateDraft("notes", e.target.value)} 
 placeholder={t("wizard.persons.notesPlaceholder")}
 className="resize-none h-20 text-sm focus-visible:ring-2 focus-visible:ring-green-500/20 focus-visible:border-green-400"
 />
 </div>
 
 <div className="pt-4 flex justify-end gap-2 border-t mt-2">
 <Button variant="outline" onClick={() => setIsModalOpen(false)}>{t("wizard.persons.cancel")}</Button>
 <Button onClick={saveMember} disabled={isSaving} className="bg-green-600 hover:bg-green-700 text-white min-w-[120px]">
 {isSaving ? t("wizard.persons.saving") : t("wizard.persons.save")}
 </Button>
 </div>
 </div>
 </DialogContent>
 </Dialog>
 </div>
 );
}

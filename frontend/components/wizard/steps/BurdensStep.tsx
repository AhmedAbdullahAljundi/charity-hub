"use client";

import { useTranslations } from "next-intl";

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
import { cn } from "@/lib/utils";

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
 const t = useTranslations("households");
 const householdId = useWizardStore((s) => s.householdId);
 const fd = useWizardStore((s) => s.formData);
 const setField = useWizardStore((s) => s.setField);
 const autoSave = useWizardStore((s) => s.autoSave);
 
 const burdens = fd.burdens ?? {};
 const diseases = fd.diseases ?? [];
 const disabilities = fd.disabilities ?? [];
 const members = [
  ...(fd.head?.name ? [{ id: fd.head.personId || fd.head.id, _localKey: "head", name: fd.head.name, role: "HEAD", gender: fd.head.gender }] : []),
  ...(fd.wifeName ? [{ id: fd.wifePersonId, _localKey: "wife", name: fd.wifeName, role: "SPOUSE", gender: "FEMALE" }] : []),
  ...(fd.members || [])
 ];
 
 const hasMaleChild = fd.members?.some(m => m.role === "CHILD" && m.gender === "MALE");

 const ensureHouseholdId = async () => {
 if (householdId) return householdId;
 await autoSave();
 return useWizardStore.getState().householdId;
 };

 const getHeadPersistenceIds = async () => {
 const hid = await ensureHouseholdId();
 const headPersonId = useWizardStore.getState().formData.head?.personId || useWizardStore.getState().formData.head?.id;
 if (!hid || !headPersonId) {
 toast.warning(t("wizard.burdens.errors.noHead"));
 return null;
 }
 return { hid, headPersonId };
 };

 const normalizeTreatmentCost = (value?: string | null) => { return value || "NONE"; };

 const normalizeDiseaseFollowup = (value?: string | null) => { return value || "NONE_OR_RARE"; };

 const normalizeDiseaseWorkImpact = (value?: string | null) => { return value || "NONE"; };

 const normalizeDisabilityWorkImpact = (value?: string | null) => { return value || "NONE"; };

 const normalizeCompanion = (value?: string | null) => { return value || "NONE"; };

 const persistDisease = async (idx: number, disease: DiseaseDraft) => {
 const ids = await getHeadPersistenceIds();
 if (!ids) return;

 const body = {
 name: disease.name || "",
 treatmentCost: normalizeTreatmentCost(disease.treatmentCost),
 followup: normalizeDiseaseFollowup(disease.followup),
 workImpact: normalizeDiseaseWorkImpact(disease.workImpact),
 personId: disease.personId || ids.headPersonId,
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
 toast.error(t("wizard.burdens.errors.diseaseSaveError"));
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
 personId: disability.personId || ids.headPersonId,
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
 toast.error(t("wizard.burdens.errors.disabilitySaveError"));
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
 toast.error(t("wizard.burdens.errors.noHousehold"));
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
 toast.error(t("wizard.burdens.errors.deleteError"));
 setField("burdens", next);
 return;
 }
 await deleteBurden(hid, existingId);
 setField("burdens", { ...next, [config.idKey]: undefined });
 } else {
 setField("burdens", next);
 }
 } catch {
 toast.error(t("wizard.burdens.errors.saveError"));
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
 toast.error(t("wizard.burdens.errors.updateError"));
 setField("burdens", next);
 return;
 }
 await updateBurdenRecord(hid, existingId, { grade });
 } else if (enabled) {
 const hid = await ensureHouseholdId();
 if (!hid) {
 toast.error(t("wizard.burdens.errors.noHousehold"));
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
 toast.error(t("wizard.burdens.errors.gradeError"));
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
 toast.error(t("wizard.burdens.errors.diseaseSaveError"));
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
 toast.error(t("wizard.burdens.errors.diseaseDeleteError"));
 return;
 }
 }
 setField("diseases", diseases.filter((_, i) => i !== idx));
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
 toast.error(t("wizard.burdens.errors.disabilitySaveError"));
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
 toast.error(t("wizard.burdens.errors.disabilityDeleteError"));
 return;
 }
 }
 setField("disabilities", disabilities.filter((_, i) => i !== idx));
 };

 const inputClass = "h-9 text-sm focus-visible:ring-2 focus-visible:ring-green-500/20 focus-visible:border-green-400";
 const labelClass = "text-sm font-medium";

 return (
 <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500" >
 <Accordion type="multiple" defaultValue={["section-1", "section-2", "section-3"]} className="space-y-4">
 
 {/* SECTION 1: السكن والأعباء الأساسية */}
 <AccordionItem value="section-1" className="bg-white border rounded-xl shadow-sm overflow-hidden">
 <AccordionTrigger className="text-sm font-semibold hover:no-underline hover:bg-slate-50 px-4 py-3 transition-colors uppercase tracking-wider text-slate-600">
 {t("wizard.burdens.housing.title")}
 </AccordionTrigger>
 <AccordionContent className="space-y-6 pt-2 pb-6 px-4">
 
 <div className="grid gap-6 sm:grid-cols-2">
 <div className="space-y-1.5">
 <Label className={labelClass}>{t("wizard.burdens.housing.type")}</Label>
 <Select value={fd.housingType ?? "OWNED"} onValueChange={(v) => setField("housingType", v)}>
 <SelectTrigger className={inputClass}><SelectValue /></SelectTrigger>
 <SelectContent>
 <SelectItem value="OWNED">{t("wizard.burdens.housing.options.owned")}</SelectItem>
 <SelectItem value="SHARED">{t("wizard.burdens.housing.options.shared")}</SelectItem>
 <SelectItem value="DONATED_RENT">{t("wizard.burdens.housing.options.donated")}</SelectItem>
 <SelectItem value="RENTED">{t("wizard.burdens.housing.options.rented")}</SelectItem>
 </SelectContent>
 </Select>
 </div>

 <div className="flex items-center justify-between border border-slate-200 rounded-lg p-3 bg-slate-50">
 <Label className="cursor-pointer text-sm font-medium text-slate-700">{t("wizard.burdens.housing.rationCard")}</Label>
 <Switch checked={!(fd.hasRationCard ?? true)} onCheckedChange={(v) => setField("hasRationCard", !v)} />
 </div>
 </div>

 <div className="grid gap-6 sm:grid-cols-3 border-t border-slate-100 pt-4">
 {/* الديون */}
 <div className="space-y-3 bg-slate-50 border border-slate-200 p-4 rounded-xl">
 <div className="flex items-center justify-between">
 <Label className="font-semibold text-slate-800">{t("wizard.burdens.debt.title")}</Label>
 <Switch checked={burdens.hasDebt ?? false} onCheckedChange={(v) => void persistBurdenToggle("DEBT", v)} />
 </div>
 {burdens.hasDebt && (
 <div className="space-y-1.5 pt-2 border-t border-slate-200">
 <Label className="text-xs text-slate-500">{t("wizard.burdens.debt.grade")}</Label>
 <Select value={burdens.debtGrade ?? "A"} onValueChange={(v) => void persistBurdenGrade("DEBT", v)}>
 <SelectTrigger className={inputClass}><SelectValue /></SelectTrigger>
 <SelectContent>
 <SelectItem value="A">{t("wizard.burdens.debt.options.a")}</SelectItem>
 <SelectItem value="B">{t("wizard.burdens.debt.options.b")}</SelectItem>
 <SelectItem value="C">{t("wizard.burdens.debt.options.c")}</SelectItem>
 <SelectItem value="D">{t("wizard.burdens.debt.options.d")}</SelectItem>
 </SelectContent>
 </Select>
 </div>
 )}
 </div>

 {/* الإصابات */}
 <div className="space-y-3 bg-slate-50 border border-slate-200 p-4 rounded-xl">
 <div className="flex items-center justify-between">
 <Label className="font-semibold text-slate-800">{t("wizard.burdens.injury.title")}</Label>
 <Switch checked={burdens.hasInjury ?? false} onCheckedChange={(v) => void persistBurdenToggle("INJURY", v)} />
 </div>
 {burdens.hasInjury && (
 <div className="space-y-1.5 pt-2 border-t border-slate-200">
 <Label className="text-xs text-slate-500">{t("wizard.burdens.injury.grade")}</Label>
 <Select value={burdens.injuryGrade ?? "A"} onValueChange={(v) => void persistBurdenGrade("INJURY", v)}>
 <SelectTrigger className={inputClass}><SelectValue /></SelectTrigger>
 <SelectContent>
 <SelectItem value="A">{t("wizard.burdens.injury.options.a")}</SelectItem>
 <SelectItem value="B">{t("wizard.burdens.injury.options.b")}</SelectItem>
 <SelectItem value="C">{t("wizard.burdens.injury.options.c")}</SelectItem>
 <SelectItem value="D">{t("wizard.burdens.injury.options.d")}</SelectItem>
 </SelectContent>
 </Select>
 </div>
 )}
 </div>

 {/* العمليات الجراحية */}
 <div className="space-y-3 bg-slate-50 border border-slate-200 p-4 rounded-xl">
 <div className="flex items-center justify-between">
 <Label className="font-semibold text-slate-800">{t("wizard.burdens.surgery.title")}</Label>
 <Switch checked={burdens.hasSurgery ?? false} onCheckedChange={(v) => void persistBurdenToggle("SURGERY", v)} />
 </div>
 {burdens.hasSurgery && (
 <div className="space-y-1.5 pt-2 border-t border-slate-200">
 <Label className="text-xs text-slate-500">{t("wizard.burdens.surgery.grade")}</Label>
 <Select value={burdens.surgeryGrade ?? "A"} onValueChange={(v) => void persistBurdenGrade("SURGERY", v)}>
 <SelectTrigger className={inputClass}><SelectValue /></SelectTrigger>
 <SelectContent>
 <SelectItem value="A">{t("wizard.burdens.surgery.options.a")}</SelectItem>
 <SelectItem value="B">{t("wizard.burdens.surgery.options.b")}</SelectItem>
 <SelectItem value="C">{t("wizard.burdens.surgery.options.c")}</SelectItem>
 <SelectItem value="D">{t("wizard.burdens.surgery.options.d")}</SelectItem>
 <SelectItem value="E">{t("wizard.burdens.surgery.options.e")}</SelectItem>
 </SelectContent>
 </Select>
 </div>
 )}
 </div>

 </div>

 </AccordionContent>
 </AccordionItem>

 {/* SECTION 2: الأمراض المزمنة */}
 <AccordionItem value="section-2" className="bg-white border rounded-xl shadow-sm overflow-hidden">
 <AccordionTrigger className="text-sm font-semibold hover:no-underline hover:bg-slate-50 px-4 py-3 transition-colors uppercase tracking-wider text-rose-700">
 {t("wizard.burdens.disease.title")}
 </AccordionTrigger>
 <AccordionContent className="space-y-6 pt-2 pb-6 px-4">
 
 {diseases.map((d, idx) => (
 <div key={d.id ?? d._localKey} className="bg-rose-50/50 border border-rose-100 rounded-xl p-5 relative group transition-colors hover:border-rose-200">
 <Button variant="ghost" size="icon" className="absolute top-3 left-3 text-rose-500 hover:text-rose-700 hover:bg-rose-100 opacity-50 group-hover:opacity-100 transition-opacity" onClick={() => void removeDisease(idx)}>
 <Trash2 className="h-4 w-4" />
 </Button>
 
 <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 pr-6">
 <div className="space-y-1.5">
 <Label className={labelClass}>{t("wizard.burdens.disease.name")}</Label>
 <Input className={inputClass} value={d.name ?? ""} onChange={(e) => updateDisease(idx, "name", e.target.value)} />
 </div>
 
 <div className="space-y-1.5">
 <Label className={labelClass}>{t("wizard.burdens.disease.person")}</Label>
 <Select value={d.personId ?? ""} onValueChange={(v) => updateDisease(idx, "personId", v)}>
 <SelectTrigger className={inputClass}><SelectValue placeholder="" /></SelectTrigger>
 <SelectContent>
 {members.map(m => (
 <SelectItem key={m.id || m._localKey} value={m.id || m._localKey || "unknown"}>{m.name || t("wizard.persons.noName")}</SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>
 
 <div className="space-y-1.5">
 <Label className={labelClass}>{t("wizard.burdens.disease.treatmentCost")}</Label>
 <Select value={d.treatmentCost ?? "NONE"} onValueChange={(v) => updateDisease(idx, "treatmentCost", v)}>
 <SelectTrigger className={inputClass}><SelectValue /></SelectTrigger>
 <SelectContent>
 <SelectItem value="NONE">{t("wizard.burdens.disease.treatmentOptions.none")}</SelectItem>
 <SelectItem value="PERIODIC_CHEAP">{t("wizard.burdens.disease.treatmentOptions.cheap")}</SelectItem>
 <SelectItem value="PERIODIC_EXPENSIVE">{t("wizard.burdens.disease.treatmentOptions.expensive")}</SelectItem>
 <SelectItem value="VERY_EXPENSIVE">{t("wizard.burdens.disease.treatmentOptions.veryExpensive")}</SelectItem>
 </SelectContent>
 </Select>
 </div>
 
 <div className="space-y-1.5">
 <Label className={labelClass}>{t("wizard.burdens.disease.followup")}</Label>
 <Select value={d.followup ?? "NONE_OR_RARE"} onValueChange={(v) => updateDisease(idx, "followup", v)}>
 <SelectTrigger className={inputClass}><SelectValue /></SelectTrigger>
 <SelectContent>
 <SelectItem value="NONE_OR_RARE">{t("wizard.burdens.disease.followupOptions.none")}</SelectItem>
 <SelectItem value="REGULAR">{t("wizard.burdens.disease.followupOptions.regular")}</SelectItem>
 <SelectItem value="EXPENSIVE">{t("wizard.burdens.disease.followupOptions.expensive")}</SelectItem>
 </SelectContent>
 </Select>
 </div>
 
 <div className="space-y-1.5 lg:col-span-2">
 <Label className={labelClass}>{t("wizard.burdens.disease.workImpact")}</Label>
 <Select value={d.workImpact ?? "NONE"} onValueChange={(v) => updateDisease(idx, "workImpact", v)}>
 <SelectTrigger className={inputClass}><SelectValue /></SelectTrigger>
 <SelectContent>
 <SelectItem value="NONE">{t("wizard.burdens.disease.workImpactOptions.none")}</SelectItem>
 <SelectItem value="MINOR">{t("wizard.burdens.disease.workImpactOptions.slight")}</SelectItem>
 <SelectItem value="MAJOR_WORKS">{t("wizard.burdens.disease.workImpactOptions.severe")}</SelectItem>
 <SelectItem value="CANNOT_WORK">{t("wizard.burdens.disease.workImpactOptions.cannotWork")}</SelectItem>
 </SelectContent>
 </Select>
 </div>
 </div>
 </div>
 ))}

 {diseases.length >= 3 && (
 <div className="bg-amber-50 text-amber-700 text-sm p-3 rounded-lg flex items-center gap-2 border border-amber-200">
 <AlertCircle className="w-4 h-4 shrink-0" />
 {t("wizard.burdens.disease.limitWarning")}
 </div>
 )}

 <Button variant="outline" className="w-full border-dashed hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200" onClick={() => void addDisease()}>
 <Plus className="w-4 h-4 me-2" /> {t("wizard.burdens.disease.add")}
 </Button>
 
 </AccordionContent>
 </AccordionItem>

 {/* SECTION 3: الإعاقات */}
 <AccordionItem value="section-3" className="bg-white border rounded-xl shadow-sm overflow-hidden">
 <AccordionTrigger className="text-sm font-semibold hover:no-underline hover:bg-slate-50 px-4 py-3 transition-colors uppercase tracking-wider text-orange-700">
 {t("wizard.burdens.disability.title")}
 </AccordionTrigger>
 <AccordionContent className="space-y-6 pt-2 pb-6 px-4">
 
 {disabilities.map((d, idx) => (
 <div key={d.id ?? d._localKey} className="bg-orange-50/50 border border-orange-100 rounded-xl p-5 relative group transition-colors hover:border-orange-200">
 <Button variant="ghost" size="icon" className="absolute top-3 left-3 text-orange-500 hover:text-orange-700 hover:bg-orange-100 opacity-50 group-hover:opacity-100 transition-opacity" onClick={() => void removeDisability(idx)}>
 <Trash2 className="h-4 w-4" />
 </Button>
 
 <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 pr-6">
 <div className="space-y-1.5">
 <Label className={labelClass}>{t("wizard.burdens.disability.desc")}</Label>
 <Input className={inputClass} value={d.description ?? ""} onChange={(e) => updateDisability(idx, "description", e.target.value)} />
 </div>
 
 <div className="space-y-1.5">
 <Label className={labelClass}>{t("wizard.burdens.disability.person")}</Label>
 <Select value={d.personId ?? ""} onValueChange={(v) => updateDisability(idx, "personId", v)}>
 <SelectTrigger className={inputClass}><SelectValue placeholder="" /></SelectTrigger>
 <SelectContent>
 {members.map(m => (
 <SelectItem key={m.id || m._localKey} value={m.id || m._localKey || "unknown"}>{m.name || t("wizard.persons.noName")}</SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>
 
 <div className="space-y-1.5">
 <Label className={labelClass}>{t("wizard.burdens.disability.workImpact")}</Label>
 <Select value={d.workImpact ?? "NONE"} onValueChange={(v) => updateDisability(idx, "workImpact", v)}>
 <SelectTrigger className={inputClass}><SelectValue /></SelectTrigger>
 <SelectContent>
 <SelectItem value="NONE">{t("wizard.burdens.disability.workImpactOptions.none")}</SelectItem>
 <SelectItem value="LIMITED">{t("wizard.burdens.disability.workImpactOptions.slight")}</SelectItem>
 <SelectItem value="SPECIAL_WORK">{t("wizard.burdens.disability.workImpactOptions.special")}</SelectItem>
 <SelectItem value="CANNOT_WORK">{t("wizard.burdens.disability.workImpactOptions.cannotWork")}</SelectItem>
 </SelectContent>
 </Select>
 </div>

 <div className="space-y-1.5">
 <Label className={labelClass}>{t("wizard.burdens.disability.companion")}</Label>
 <Select value={d.companion ?? "NONE"} onValueChange={(v) => updateDisability(idx, "companion", v)}>
 <SelectTrigger className={inputClass}><SelectValue /></SelectTrigger>
 <SelectContent>
 <SelectItem value="NONE">{t("wizard.burdens.disability.companionOptions.none")}</SelectItem>
 <SelectItem value="OUTSIDE_ONLY">{t("wizard.burdens.disability.companionOptions.outside")}</SelectItem>
 <SelectItem value="FULLY_DEPENDENT">{t("wizard.burdens.disability.companionOptions.full")}</SelectItem>
 </SelectContent>
 </Select>
 </div>
 
 <div className="space-y-1.5 lg:col-span-2">
 <Label className={labelClass}>{t("wizard.burdens.disability.treatmentCost")}</Label>
 <Select value={d.treatmentCost ?? "NONE"} onValueChange={(v) => updateDisability(idx, "treatmentCost", v)}>
 <SelectTrigger className={inputClass}><SelectValue /></SelectTrigger>
 <SelectContent>
 <SelectItem value="NONE">{t("wizard.burdens.disease.treatmentOptions.none")}</SelectItem>
 <SelectItem value="PERIODIC_CHEAP">{t("wizard.burdens.disease.treatmentOptions.cheap")}</SelectItem>
 <SelectItem value="PERIODIC_EXPENSIVE">{t("wizard.burdens.disease.treatmentOptions.expensive")}</SelectItem>
 <SelectItem value="VERY_EXPENSIVE">{t("wizard.burdens.disease.treatmentOptions.veryExpensive")}</SelectItem>
 </SelectContent>
 </Select>
 </div>
 </div>
 </div>
 ))}

 <Button variant="outline" className="w-full border-dashed hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200" onClick={() => void addDisability()}>
 <Plus className="w-4 h-4 me-2" /> {t("wizard.burdens.disability.add")}
 </Button>
 
 </AccordionContent>
 </AccordionItem>

 </Accordion>
 </div>
 );
}

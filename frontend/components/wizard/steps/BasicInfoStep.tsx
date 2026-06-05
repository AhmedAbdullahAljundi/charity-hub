"use client";

import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useWizardStore } from "@/lib/stores/wizardStore";
import api from "@/lib/api/client";
import { AlertCircle, CheckCircle2, Loader2, Info, Link2, FileText, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

function extractNationalIdInfo(nid: string) {
 if (!nid || !/^([23])(\d{2})(0[1-9]|1[012])(0[1-9]|[12]\d|3[01])\d{7}$/.test(nid)) return null;
 const century = nid[0] === "2" ? 1900 : 2000;
 const year = century + parseInt(nid.substring(1, 3));
 const month = parseInt(nid.substring(3, 5));
 const day = parseInt(nid.substring(5, 7));
 const genderDigit = parseInt(nid.substring(12, 13));
 const gender = genderDigit % 2 === 0 ? "أنثى" : "ذكر"; 
 
 const birthDate = new Date(year, month - 1, day);
 const today = new Date();
 let age = today.getFullYear() - birthDate.getFullYear();
 const m = today.getMonth() - birthDate.getMonth();
 if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
 age--;
 }
 return { gender, age, birthDate: birthDate.toISOString().split("T")[0] };
}

export function BasicInfoStep() {
 const fd = useWizardStore((s) => s.formData);
 const setField = useWizardStore((s) => s.setField);
 const householdId = useWizardStore((s) => s.householdId);
 const t = useTranslations("households");

 // Suggested Code State
 const [suggestedCode, setSuggestedCode] = useState<string | null>(null);
 const [isCheckingCode, setIsCheckingCode] = useState(false);
 const [codeError, setCodeError] = useState<string | null>(null);
 const [codeSuccess, setCodeSuccess] = useState<string | null>(null);

 // Phone errors
  const [primaryPhoneError, setPrimaryPhoneError] = useState<string | null>(null);
  const [secondaryPhoneError, setSecondaryPhoneError] = useState<string | null>(null);
  const [backupPhoneError, setBackupPhoneError] = useState<string | null>(null);
  const [wifeNidError, setWifeNidError] = useState<string | null>(null);
  const [headNidError, setHeadNidError] = useState<string | null>(null);

  const [showSecondaryPhone, setShowSecondaryPhone] = useState(false);
  const [showBackupPhone, setShowBackupPhone] = useState(false);

  useEffect(() => {
    if (fd.secondaryPhone) setShowSecondaryPhone(true);
    if (fd.backupPhone) setShowBackupPhone(true);
  }, [fd.secondaryPhone, fd.backupPhone]);

 useEffect(() => {
  if (!fd.code && !householdId) {
  api.get("/households?limit=100&sort=createdAt&order=desc")
  .then((res) => {
  const list = res.data?.list || res.data?.data?.list || res.data?.data || [];
  let max = 0;
  if (Array.isArray(list)) {
    list.forEach((h: any) => {
      const val = parseInt(String(h.code).replace(/\D/g, ''), 10);
      if (!isNaN(val) && val <= 9999 && val > max) max = val;
    });
  }
  setSuggestedCode(max > 0 ? String(max + 1).padStart(4, '0') : "0001");
  })
  .catch(() => setSuggestedCode("1000"));
  }
  }, [fd.code, householdId]);

  useEffect(() => {
  if (!fd.registrationDate) {
  const today = new Date().toISOString().split("T")[0];
  setField("registrationDate", today);
  }
  }, [fd.registrationDate, setField]);

  const checkCodeUnique = async (code: string) => {
  if (!code) return;
  setIsCheckingCode(true);
  setCodeError(null);
  setCodeSuccess(null);
  try {
  const res = await api.get(`/households?search=${code}&limit=1000`);
  const list = res.data?.list || res.data?.data?.list || res.data?.data || res.data || [];
  const match = Array.isArray(list) ? list.find((h: any) => h.code === code && h.id !== householdId) : null;
  if (match) {
  setCodeError(t("wizard.basic.codeDuplicate"));
  } else {
  setCodeSuccess(t("wizard.basic.codeAvailable"));
  }
  } catch (err) {
  setCodeError(t("wizard.basic.codeError"));
  } finally {
  setIsCheckingCode(false);
  }
  };

  const validateNid = (val: string) => {
  if (!val) return null;
  if (!/^([23])(\d{2})(0[1-9]|1[012])(0[1-9]|[12]\d|3[01])\d{7}$/.test(val)) return t("wizard.basic.nidInvalid");
  return null;
  };

  const validatePhone = (val: string, setter: (e: string | null) => void) => {
  if (!val) {
  setter(null);
  return;
  }
  if (!/^01[0125]\d{8}$/.test(val)) {
  setter(t("wizard.basic.phoneInvalid"));
  } else {
  setter(null);
  }
  };

 const head = fd.head ?? {};
 const nidInfo = head.nationalId ? extractNationalIdInfo(head.nationalId) : null;

 const inputClass = "h-9 text-sm focus-visible:ring-2 focus-visible:ring-green-500/20 focus-visible:border-green-400";
 const labelClass = "text-sm font-medium";

 return (
  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500" >
  
  {/* SECTION 1: الأساسيات */}
  <section className="bg-card text-card-foreground border rounded-xl p-6 shadow-sm">
   <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-6">
     <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
     {t("wizard.basic.section")}
   </h3>
   <div className="flex flex-col gap-5">
    {/* Row 1: Family Name & PDF URL */}
    <div className="flex flex-wrap gap-4 items-start">
      {/* ── Family Name Dropdown Logic ── */}
      {(() => {
        const availableFamilyNames = [];
        if (fd.wifeName) availableFamilyNames.push({ name: fd.wifeName, role: "الزوجة" });
        if (fd.head?.name) availableFamilyNames.push({ name: fd.head.name, role: "الزوج/العائل" });
        if (fd.members?.length) {
          fd.members.forEach(m => {
            if (m.name && m.name !== fd.wifeName && m.name !== fd.head?.name) {
              let rLabel = m.role === "CHILD" ? "ابن/ـة" : "فرد";
              availableFamilyNames.push({ name: m.name, role: rLabel });
            }
          });
        }
        const currentFamilyNameBase = fd.familyName ? fd.familyName.replace(/^(أسرة|عائلة)\s*/, "") : (fd.wifeName || "");
        const uniqueFamilyNames = Array.from(new Map(availableFamilyNames.map(item => [item.name, item])).values());
        if (currentFamilyNameBase && !uniqueFamilyNames.some(n => n.name === currentFamilyNameBase)) {
          uniqueFamilyNames.push({ name: currentFamilyNameBase, role: "مخصص" });
        }

        return (
          <div className="space-y-1.5 flex-[2] min-w-[250px]">
            <Label className={labelClass}>{t("wizard.basic.familyName")} <span className="text-destructive">*</span></Label>
            <Select 
              value={currentFamilyNameBase} 
              onValueChange={(v) => setField("familyName", v)}
            >
              <SelectTrigger className={inputClass}>
                <SelectValue placeholder="اختر الاسم (تلقائي حسب الأفراد)" />
              </SelectTrigger>
              <SelectContent>
                {uniqueFamilyNames.length === 0 ? (
                  <div className="p-2 text-xs text-muted-foreground text-center">يرجى كتابة اسم الزوجة أو العائل أدناه أولاً</div>
                ) : (
                  uniqueFamilyNames.map((n, i) => (
                    <SelectItem key={i} value={n.name}>
                      {n.name} <span className="text-muted-foreground text-[10px] pr-1">({n.role})</span>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        );
      })()}

      <div className="space-y-1.5 flex-1 min-w-[200px]">
        <Label className={labelClass}>{t("wizard.basic.pdfUrl")}</Label>
        <div className="relative">
        {fd.pdfUrl ? (
          <a 
            href={fd.pdfUrl.startsWith('http') ? fd.pdfUrl : `https://${fd.pdfUrl}`} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="absolute right-2.5 top-2.5 text-blue-500 hover:text-blue-600 transition-colors z-10 cursor-pointer"
            title="فتح الرابط في نافذة جديدة"
          >
            <FileText className="h-4 w-4" />
          </a>
        ) : (
          <FileText className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
        )}
        <Input 
        className={cn(inputClass, "pr-9")} 
        dir="ltr" 
        placeholder="https://..." 
        value={fd.pdfUrl ?? ""} 
        onChange={(e) => setField("pdfUrl", e.target.value)} 
        />
        </div>
      </div>
    </div>

    {/* Row 2: Code & Registration Date */}
    <div className="flex flex-wrap gap-4 items-start">
      <div className="space-y-1.5 w-32 shrink-0">
        <Label className={labelClass}>{t("wizard.basic.codeLabel")} <span className="text-destructive">*</span></Label>
        <div className="flex gap-2">
        <Input
          className={inputClass}
          type="text"
          value={fd.code ?? ""}
          onChange={(e) => {
          setField("code", e.target.value);
          setCodeError(null);
          setCodeSuccess(null);
          }}
          onBlur={(e) => checkCodeUnique(e.target.value)}
          placeholder={suggestedCode ? `${suggestedCode}` : ""}
          />
        {isCheckingCode && <Loader2 className="h-5 w-5 animate-spin mt-2 text-muted-foreground" />}
        </div>
        {codeError && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3" />{codeError}</p>}
        {codeSuccess && <p className="text-xs text-emerald-600 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />{codeSuccess}</p>}
      </div>

      <div className="space-y-1.5 w-36 shrink-0">
        <Label className={labelClass}>{t("wizard.basic.registrationDate")}</Label>
        <Input 
        type="date" 
        className={cn(inputClass, "bg-muted cursor-not-allowed")}
        value={fd.registrationDate ? (fd.registrationDate.includes("T") ? fd.registrationDate.split("T")[0] : fd.registrationDate) : ""} 
        readOnly
        />
      </div>
    </div>
  </div>
  </section>

 {/* SECTION 2: ربة الأسرة */}
 <section className="bg-card text-card-foreground border rounded-xl p-6 shadow-sm">
   <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-6">
     <Info className="h-5 w-5 text-pink-500" />
     {t("wizard.basic.wifeSection")}
   </h3>
   <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
 <div className="space-y-1.5">
 <Label className={labelClass}>{t("wizard.basic.wifeName")} <span className="text-destructive">*</span></Label>
 <Input className={inputClass} value={fd.wifeName ?? ""}
 onChange={(e) => setField("wifeName", e.target.value)}
 onBlur={() => {
  if (fd.wifeName && !fd.familyName) {
  setField("familyName", fd.wifeName);
  }
 }}
 />
 </div>
 
 <div className="space-y-1.5">
 <Label className={labelClass}>{t("wizard.basic.wifeNid")} <span className="text-destructive">*</span></Label>
 <Input 
 id="wifeNationalId"
 className={inputClass}
 value={fd.wifeNationalId ?? ""} 
 onChange={(e) => {
   const rawVal = e.target.value;
   const sanitizedVal = rawVal.replace(/[٠-٩]/g, d => "٠١٢٣٤٥٦٧٨٩".indexOf(d).toString()).replace(/\D/g, "").slice(0, 14);
   e.target.value = sanitizedVal;
   setField("wifeNationalId", sanitizedVal);
   setWifeNidError(validateNid(sanitizedVal));
 }}
 />
 {wifeNidError ? (
 <p className="text-xs text-destructive mt-1">{wifeNidError}</p>
 ) : (fd.wifeNationalId && extractNationalIdInfo(fd.wifeNationalId)) ? (
 <div className="flex gap-1.5 mt-1">
 <Badge variant="secondary" className={cn("text-[10px] px-1.5 py-0 border-transparent text-white", extractNationalIdInfo(fd.wifeNationalId)!.gender === "ذكر" ? "bg-blue-500 hover:bg-blue-600" : "bg-pink-500 hover:bg-pink-600")}>
 {extractNationalIdInfo(fd.wifeNationalId)!.gender}
 </Badge>
 <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-slate-100 text-slate-700">{extractNationalIdInfo(fd.wifeNationalId)!.age} سنة</Badge>
 </div>
 ) : null}
 </div>

 <div className="space-y-1.5">
 <Label className={labelClass}>{t("wizard.basic.socialStatus")}</Label>
 <Select value={fd.socialStatus ?? ""} onValueChange={(v) => {
 setField("socialStatus", v);
  if (v === "DIVORCED") setField("head.residencyStatus", "ABSENT_DIVORCE");
  else if (v === "WIDOWED" || v === "WIDOWED_MARRIED") setField("head.residencyStatus", "ABSENT_DEATH");
  else if (v === "MARRIED") setField("head.residencyStatus", "RESIDENT");
  else setField("head.residencyStatus", null);
  
  if (v !== "DIVORCED" && v !== "WIDOWED" && v !== "WIDOWED_MARRIED") {
  setField("marriageCount", 1);
  setField("pastSpouses", []);
  }

  if (v !== "DIVORCED") {
    setField("divorceDocNumber", undefined);
    setField("divorceYear", undefined);
    const fdState = useWizardStore.getState().formData;
    if (fdState.members) {
      const cleanedMembers = fdState.members.map((m: any) => ({ ...m, isDisplaced: false, alimonyStatus: undefined }));
      setField("members", cleanedMembers);
    }
  }

  if (v !== "WIDOWED" && v !== "WIDOWED_MARRIED") {
    setField("deathCertNumber", undefined);
    setField("deathDate", undefined);
    const fdState = useWizardStore.getState().formData;
    if (fdState.members) {
      const cleanedMembers = fdState.members.map((m: any) => ({ ...m, isOrphan: false }));
      setField("members", cleanedMembers);
    }
  }
 }}>
 <SelectTrigger className={inputClass}><SelectValue placeholder={t("wizard.basic.socialOptions.select")} /></SelectTrigger>
 <SelectContent>
 <SelectItem value="MARRIED">{t("wizard.basic.socialOptions.married")}</SelectItem>
 <SelectItem value="DIVORCED">{t("wizard.basic.socialOptions.divorced")}</SelectItem>
 <SelectItem value="WIDOWED">{t("wizard.basic.socialOptions.widowed")}</SelectItem>
 <SelectItem value="WIDOWED_MARRIED">{t("wizard.basic.socialOptions.widowed_married")}</SelectItem>
 <SelectItem value="SINGLE_OTHER">{t("wizard.basic.socialOptions.single")}</SelectItem>
 </SelectContent>
 </Select>
 </div>
 </div>

 {/* Wife Employment Quality */}
 <div className="space-y-4 pt-6 mt-6 col-span-full border-t border-slate-200 dark:border-slate-800">
  <h4 className="text-sm font-semibold text-slate-700">{t("wizard.basic.wifeEmployment")}</h4>
 <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
 <div className="space-y-1.5">
 <Label className={labelClass}>{t("wizard.basic.wifeEmploymentType")}</Label>
 <Select value={(fd as any).wifeEmploymentQuality ?? "NONE"} onValueChange={(v) => {
 setField("wifeEmploymentQuality", v);
 // Sync to HEAD member
 const headExists = fd.members?.some(m => m.role === "HEAD");
 if (headExists) {
 const newMembers = fd.members!.map(m => m.role === "HEAD" ? { ...m, employmentType: v } : m);
 setField("members", newMembers);
 }
 }}>
 <SelectTrigger className={inputClass}><SelectValue placeholder={t("wizard.basic.wifeEmploymentOptions.select")} /></SelectTrigger>
 <SelectContent>
 <SelectItem value="NONE">{t("wizard.basic.wifeEmploymentOptions.none")}</SelectItem>
 <SelectItem value="WEAK">{t("wizard.basic.wifeEmploymentOptions.weak")}</SelectItem>
 <SelectItem value="UNSTABLE">{t("wizard.basic.wifeEmploymentOptions.unstable")}</SelectItem>
 <SelectItem value="SUFFICIENT">{t("wizard.basic.wifeEmploymentOptions.sufficient")}</SelectItem>
 </SelectContent>
 </Select>
 </div>

 <div className="space-y-1.5">
 <Label className={labelClass}>{t("wizard.basic.wifeEducation")}</Label>
 <Select value={(fd as any).wifeEducationLevel ?? "ILLITERATE"} onValueChange={(v) => {
 setField("wifeEducationLevel", v);
 // Sync to HEAD member
 const headExists = fd.members?.some(m => m.role === "HEAD");
 if (headExists) {
 const newMembers = fd.members!.map(m => m.role === "HEAD" ? { ...m, educationLevel: v } : m);
 setField("members", newMembers);
 }
 }}>
 <SelectTrigger className={inputClass}><SelectValue placeholder={t("wizard.basic.wifeEducationOptions.select")} /></SelectTrigger>
 <SelectContent>
 <SelectItem value="ILLITERATE">{t("wizard.basic.wifeEducationOptions.illiterate")}</SelectItem>
 <SelectItem value="MEDIUM">{t("wizard.basic.wifeEducationOptions.medium")}</SelectItem>
 <SelectItem value="HIGHER_LIMITED">{t("wizard.basic.wifeEducationOptions.higherLimited")}</SelectItem>
 <SelectItem value="HIGHER_STABLE">{t("wizard.basic.wifeEducationOptions.higherStable")}</SelectItem>
 </SelectContent>
 </Select>
 </div>
 </div>
 </div>

 {(fd.socialStatus === "MARRIED" || fd.socialStatus === "DIVORCED" || fd.socialStatus === "WIDOWED" || fd.socialStatus === "WIDOWED_MARRIED") && (
  <div className="space-y-4 pt-6 mt-6 col-span-full border-t border-slate-200 dark:border-slate-800">
 <h4 className="text-sm font-semibold text-slate-700">{t("wizard.basic.husband.section")} {fd.socialStatus === "DIVORCED" ? `(${t("wizard.basic.husband.last")})` : (fd.socialStatus === "WIDOWED" || fd.socialStatus === "WIDOWED_MARRIED") ? `(${t("wizard.basic.husband.deceased")})` : ""}</h4>
 <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
 <div className="space-y-1.5">
 <Label className={labelClass}>{t("wizard.basic.husband.name")} <span className="text-destructive">*</span></Label>
 <Input 
 className={inputClass} 
 value={head.name ?? ""} 
 onChange={(e) => setField("head.name", e.target.value)}
 />
 </div>
 
 <div className="space-y-1.5">
 <Label className={labelClass}>{t("wizard.basic.husband.nid")} <span className="text-destructive">*</span></Label>
 <Input 
 id="headNationalId"
 className={inputClass}
 value={head.nationalId ?? ""} 
 onChange={(e) => {
   const rawVal = e.target.value;
   const sanitizedVal = rawVal.replace(/[٠-٩]/g, d => "٠١٢٣٤٥٦٧٨٩".indexOf(d).toString()).replace(/\D/g, "").slice(0, 14);
   e.target.value = sanitizedVal;
   setField("head.nationalId", sanitizedVal);
   setHeadNidError(validateNid(sanitizedVal));
 }}
 maxLength={14}
 />
 {headNidError ? (
 <p className="text-xs text-destructive mt-1">{headNidError}</p>
 ) : nidInfo ? (
 <div className="flex gap-1.5 mt-1">
 <Badge variant="secondary" className={cn("text-[10px] px-1.5 py-0 border-transparent text-white", nidInfo.gender === "ذكر" ? "bg-blue-500 hover:bg-blue-600" : "bg-pink-500 hover:bg-pink-600")}>
 {nidInfo.gender}
 </Badge>
 <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-slate-100 text-slate-700">{nidInfo.age} سنة</Badge>
 </div>
 ) : null}
 </div>

 {fd.socialStatus === "MARRIED" && (
 <div className="space-y-1.5">
 <Label className={labelClass}>{t("wizard.basic.husband.status")} <span className="text-destructive">*</span></Label>
 <Select 
 value={head.residencyStatus ?? "RESIDENT"} 
 onValueChange={(v) => setField("head.residencyStatus", v)}
 >
 <SelectTrigger className={inputClass}><SelectValue placeholder={t("wizard.basic.husband.statusOptions.select")} /></SelectTrigger>
 <SelectContent>
 <SelectItem value="RESIDENT">{t("wizard.basic.husband.statusOptions.resident")}</SelectItem>
 <SelectItem value="ABSENT_OTHER">{t("wizard.basic.husband.statusOptions.absent")}</SelectItem>
 <SelectItem value="ABSENT_PRISON">{t("wizard.basic.husband.statusOptions.prison")}</SelectItem>
 </SelectContent>
 </Select>
 </div>
 )}

 {fd.socialStatus === "MARRIED" && (
 <>
 {head.residencyStatus !== "ABSENT_PRISON" && (
 <>
 <div className="space-y-1.5">
 <Label className={labelClass}>{t("wizard.basic.husband.employmentType")} <span className="text-destructive">*</span></Label>
 <Select 
 value={head.employmentType ?? ""} 
 onValueChange={(v) => {
 setField("head.employmentType", v);
 const spouseMemberExists = fd.members?.some(m => m.role === "SPOUSE");
 if (spouseMemberExists) {
 const newMembers = fd.members!.map(m => m.role === "SPOUSE" ? { ...m, employmentType: v } : m);
 setField("members", newMembers);
 }
 }}
 >
 <SelectTrigger className={inputClass}><SelectValue placeholder={t("wizard.basic.husband.employmentOptions.select")} /></SelectTrigger>
 <SelectContent>
 <SelectItem value="NONE">{t("wizard.basic.husband.employmentOptions.none")}</SelectItem>
 <SelectItem value="WEAK">{t("wizard.basic.husband.employmentOptions.weak")}</SelectItem>
 <SelectItem value="SEASONAL">{t("wizard.basic.husband.employmentOptions.seasonal")}</SelectItem>
 <SelectItem value="REGULAR">{t("wizard.basic.husband.employmentOptions.regular")}</SelectItem>
 <SelectItem value="ABROAD_WEAK">{t("wizard.basic.husband.employmentOptions.abroad_weak")}</SelectItem>
 <SelectItem value="ABROAD_MEDIUM">{t("wizard.basic.husband.employmentOptions.abroad_medium")}</SelectItem>
 <SelectItem value="ABROAD_REGULAR">{t("wizard.basic.husband.employmentOptions.abroad_regular")}</SelectItem>
 </SelectContent>
 </Select>
 </div>
 
 <div className="space-y-1.5">
 <Label className={labelClass}>{t("wizard.basic.husband.education")} <span className="text-destructive">*</span></Label>
 <Select 
 value={head.educationLevel ?? ""} 
 onValueChange={(v) => {
 setField("head.educationLevel", v);
 const spouseMemberExists = fd.members?.some(m => m.role === "SPOUSE");
 if (spouseMemberExists) {
 const newMembers = fd.members!.map(m => m.role === "SPOUSE" ? { ...m, educationLevel: v } : m);
 setField("members", newMembers);
 }
 }}
 >
 <SelectTrigger className={inputClass}><SelectValue placeholder={t("wizard.basic.husband.educationOptions.select")} /></SelectTrigger>
 <SelectContent>
 <SelectItem value="ILLITERATE">{t("wizard.basic.husband.educationOptions.illiterate")}</SelectItem>
 <SelectItem value="MEDIUM">{t("wizard.basic.husband.educationOptions.medium")}</SelectItem>
 <SelectItem value="HIGHER_LIMITED">{t("wizard.basic.husband.educationOptions.higherLimited")}</SelectItem>
 <SelectItem value="HIGHER_STABLE">{t("wizard.basic.husband.educationOptions.higherStable")}</SelectItem>
 </SelectContent>
 </Select>
 </div>
 </>
 )}

  {head.residencyStatus === "ABSENT_PRISON" && (
   <>
   <div className="space-y-1.5">
   <Label className={labelClass}>مدة الحكم <span className="text-destructive">*</span></Label>
   <Select 
   value={(head.prisonTerm as string) ?? ""} 
   onValueChange={(v) => setField("head.prisonTerm", v)}
   >
   <SelectTrigger className={inputClass}><SelectValue placeholder="اختر مدة الحكم" /></SelectTrigger>
   <SelectContent>
   <SelectItem value="SHORT">أقل من 6 أشهر</SelectItem>
   <SelectItem value="MEDIUM">6 أشهر – سنتان</SelectItem>
   <SelectItem value="LONG">أكثر من سنتين</SelectItem>
   </SelectContent>
   </Select>
   </div>

   <div className="space-y-1.5">
   <Label className={labelClass}>مستوى الاشتباه (بالسرقة أو وجود ثروة)</Label>
   <Select 
   value={(head.prisonSuspicion as string) ?? "NONE"} 
   onValueChange={(v) => setField("head.prisonSuspicion", v)}
   >
   <SelectTrigger className={inputClass}><SelectValue placeholder="اختر مستوى الاشتباه" /></SelectTrigger>
   <SelectContent>
   <SelectItem value="NONE">لا يوجد اشتباه</SelectItem>
   <SelectItem value="LOW">اشتباه خفيف</SelectItem>
   <SelectItem value="MID">اشتباه متوسط</SelectItem>
   <SelectItem value="HIGH">اشتباه شديد</SelectItem>
   <SelectItem value="MAX">اشتباه شديد جداً</SelectItem>
   </SelectContent>
   </Select>
   </div>
   </>
   )}
  </>
  )}
 </div>

 {/* IF مطلقة */}
 {fd.socialStatus === "DIVORCED" && (
 <div className="grid gap-4 sm:grid-cols-3 pt-4 border-t mt-4">
 <div className="space-y-1.5">
 <Label className={labelClass}>{t("wizard.basic.divorce.year")}</Label>
 <Input className={inputClass} type="number" placeholder="YYYY" value={fd.divorceYear ?? ""} onChange={(e) => setField("divorceYear", e.target.value)} />
 </div>
 <div className="space-y-1.5">
 <Label className={labelClass}>{t("wizard.basic.divorce.docNumber")}</Label>
 <Input className={inputClass} value={fd.divorceDocNumber ?? ""} onChange={(e) => setField("divorceDocNumber", e.target.value)} />
 </div>
 <div className="space-y-1.5">
 <Label className={labelClass}>{t("wizard.basic.divorce.marriageCount")}</Label>
 <Select value={fd.marriageCount ? String(fd.marriageCount) : "1"} onValueChange={(v) => {
 const count = parseInt(v);
 setField("marriageCount", count);
 const currentSpouses = fd.pastSpouses || [];
 const newLength = count > 1 ? count - 1 : 0;
 if (currentSpouses.length < newLength) {
 setField("pastSpouses", [...currentSpouses, ...Array.from({ length: newLength - currentSpouses.length }).map(() => ({}))]);
 } else {
 setField("pastSpouses", currentSpouses.slice(0, newLength));
 }
 }}>
 <SelectTrigger className={inputClass}><SelectValue /></SelectTrigger>
 <SelectContent>
 {[1, 2, 3, 4, 5].map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
 </SelectContent>
 </Select>
 </div>
 <div className="col-span-full">
 <p className="text-xs text-amber-600 flex items-center gap-1 bg-amber-50 dark:bg-amber-950/30 p-2 rounded w-fit">
 <Info className="h-4 w-4" />
 {t("wizard.basic.divorce.note")}
 </p>
 </div>
 </div>
 )}

 {/* IF أرملة */}
 {(fd.socialStatus === "WIDOWED" || fd.socialStatus === "WIDOWED_MARRIED") && (
 <div className="grid gap-4 sm:grid-cols-3 pt-4 border-t mt-4">
 <div className="space-y-1.5">
 <Label className={labelClass}>{t("wizard.basic.death.certNumber")}</Label>
 <Input className={inputClass} value={fd.deathCertNumber ?? ""} onChange={(e) => setField("deathCertNumber", e.target.value)} />
 </div>
 <div className="space-y-1.5">
 <Label className={labelClass}>{t("wizard.basic.death.date")}</Label>
 <Input className={inputClass} type="date" value={fd.deathDate ?? ""} onChange={(e) => setField("deathDate", e.target.value)} />
 </div>
 <div className="space-y-1.5">
 <Label className={labelClass}>{t("wizard.basic.death.marriageCount")}</Label>
 <Select value={fd.marriageCount ? String(fd.marriageCount) : "1"} onValueChange={(v) => {
 const count = parseInt(v);
 setField("marriageCount", count);
 const currentSpouses = fd.pastSpouses || [];
 const newLength = count > 1 ? count - 1 : 0;
 if (currentSpouses.length < newLength) {
 setField("pastSpouses", [...currentSpouses, ...Array.from({ length: newLength - currentSpouses.length }).map(() => ({}))]);
 } else {
 setField("pastSpouses", currentSpouses.slice(0, newLength));
 }
 }}>
 <SelectTrigger className={inputClass}><SelectValue /></SelectTrigger>
 <SelectContent>
 {[1, 2, 3, 4, 5].map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
 </SelectContent>
 </Select>
 </div>
 </div>
 )}

 {/* Dynamic Past Spouses */}
 {fd.marriageCount && fd.marriageCount > 1 && Array.from({ length: fd.marriageCount - 1 }).map((_, i) => (
 <div key={i} className="border border-slate-200 dark:border-slate-800 p-4 rounded-lg bg-muted/50 col-span-full space-y-4">
 <h5 className="font-semibold text-xs text-slate-500 uppercase">{t("wizard.basic.husband.pastSpouse")} {i + 1}</h5>
 <div className="grid grid-cols-2 gap-4">
 <div className="space-y-1.5">
 <Label className={labelClass}>{t("wizard.basic.husband.name")} <span className="text-destructive">*</span></Label>
 <Input 
 className={inputClass}
 value={fd.pastSpouses?.[i]?.name || ""} 
 onChange={e => {
 const arr = [...(fd.pastSpouses || [])];
 arr[i] = { ...arr[i], name: e.target.value };
 setField("pastSpouses", arr);
 }} 
 />
 </div>
 <div className="space-y-1.5">
 <Label className={labelClass}>{t("wizard.basic.husband.nidOptional")}</Label>
 <Input 
 className={inputClass}
 value={fd.pastSpouses?.[i]?.nationalId || ""} 
 maxLength={14}
 onChange={e => {
 const arr = [...(fd.pastSpouses || [])];
 arr[i] = { ...arr[i], nationalId: e.target.value };
 setField("pastSpouses", arr);
 }} 
 />
 </div>
 </div>
 </div>
 ))}
 </div>
 )}
 </section>

 {/* SECTION 3: التواصل والعنوان */}
 <section className="bg-card text-card-foreground border rounded-xl p-6 shadow-sm">
   <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-6">
     <Info className="h-5 w-5 text-emerald-500" />
     {t("wizard.basic.contact.section")}
   </h3>
   <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
 <div className="space-y-1.5">
 <Label className={labelClass}>{t("wizard.basic.contact.primaryPhone")} <span className="text-destructive">*</span></Label>
 <Input 
 dir="ltr"
 className={cn("text-right", inputClass)}
 placeholder="01XXXXXXXXX"
 value={fd.primaryPhone ?? ""} 
 onChange={(e) => {
 setField("primaryPhone", e.target.value);
 validatePhone(e.target.value, setPrimaryPhoneError);
 }} 
 />
 {primaryPhoneError && <p className="text-xs text-destructive mt-1">{primaryPhoneError}</p>}
 </div>

 <div className="space-y-1.5">
 <Label className={labelClass}>{t("wizard.basic.contact.whatsappPhone")}</Label>
 <div className="relative">
 <Input 
 dir="ltr"
 className={cn("text-right pr-9", inputClass)}
 placeholder="01XXXXXXXXX"
 value={fd.whatsappPhone ?? ""} 
 onChange={(e) => setField("whatsappPhone", e.target.value)} 
 />
 {fd.whatsappPhone && /^01[0125]\d{8}$/.test(fd.whatsappPhone) && (
 <a 
 href={`https://wa.me/+20${fd.whatsappPhone.substring(1)}`} 
 target="_blank" 
 rel="noreferrer"
 className="absolute right-2 top-2.5 text-emerald-500 hover:text-emerald-600 transition-colors"
 title={t("wizard.basic.contact.whatsappOpen")}
 >
 <Link2 className="h-4 w-4" />
 </a>
 )}
 </div>
 </div>

 {showSecondaryPhone && (
 <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2">
 <Label className={labelClass}>{t("wizard.basic.contact.secondaryPhone")} (اختياري)</Label>
 <Input 
 dir="ltr"
 className={cn("text-right", inputClass)}
 placeholder="01XXXXXXXXX"
 value={fd.secondaryPhone ?? ""} 
 onChange={(e) => {
 setField("secondaryPhone", e.target.value);
 validatePhone(e.target.value, setSecondaryPhoneError);
 }} 
 />
 {secondaryPhoneError && <p className="text-xs text-destructive mt-1">{secondaryPhoneError}</p>}
 </div>
 )}

 {showBackupPhone && (
 <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2">
 <Label className={labelClass}>{t("wizard.basic.contact.backupPhone")} (اختياري)</Label>
 <Input 
 dir="ltr"
 className={cn("text-right", inputClass)}
 placeholder="01XXXXXXXXX"
 value={fd.backupPhone ?? ""} 
 onChange={(e) => {
 setField("backupPhone", e.target.value);
 validatePhone(e.target.value, setBackupPhoneError);
 }} 
 />
 {backupPhoneError && <p className="text-xs text-destructive mt-1">{backupPhoneError}</p>}
 </div>
 )}

 </div>
 
 <div className="flex gap-2 mb-4">
 {!showSecondaryPhone && (
 <Button type="button" variant="outline" size="sm" onClick={() => setShowSecondaryPhone(true)} className="border-dashed text-slate-500 hover:text-slate-700">
 <Plus className="w-4 h-4 ml-1" /> إضافة رقم احتياطي 1
 </Button>
 )}
 {showSecondaryPhone && !showBackupPhone && (
 <Button type="button" variant="outline" size="sm" onClick={() => setShowBackupPhone(true)} className="border-dashed text-slate-500 hover:text-slate-700">
 <Plus className="w-4 h-4 ml-1" /> إضافة رقم احتياطي 2
 </Button>
 )}
 </div>
 
 <div className="flex flex-col lg:flex-row gap-4 items-end">
 <div className="space-y-1.5 w-full lg:w-24 shrink-0">
 <Label className={labelClass}>{t("wizard.basic.contact.region")}</Label>
 <Select value={fd.addressRegion ?? ""} onValueChange={(v) => setField("addressRegion", v)}>
 <SelectTrigger className={inputClass}><SelectValue placeholder={t("wizard.basic.contact.select")} /></SelectTrigger>
 <SelectContent>
 {Array.from({ length: 10 }).map((_, i) => (
 <SelectItem key={i + 1} value={String(i + 1)}>{i + 1}</SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>

 <div className="space-y-1.5 w-full lg:w-32 shrink-0">
 <Label className={labelClass}>{fd.addressRegion === "10" ? t("wizard.basic.contact.village") : t("wizard.basic.contact.district")}</Label>
 <Input className={inputClass} value={fd.district ?? ""} onChange={(e) => setField("district", e.target.value)} />
 </div>

 <div className="space-y-1.5 w-full lg:w-48 shrink-0">
 <Label className={labelClass}>{t("wizard.basic.contact.street")}</Label>
 <Input className={inputClass} value={fd.addressStreet ?? ""} onChange={(e) => setField("addressStreet", e.target.value)} />
 </div>

 <div className="space-y-1.5 w-full flex-1">
 <Label className={labelClass}>{t("wizard.basic.contact.addressDetails")} <span className="text-destructive">*</span></Label>
 <Input className={inputClass} value={fd.addressDetails ?? ""} onChange={(e) => setField("addressDetails", e.target.value)} />
 </div>
 </div>
 </section>

 {/* SECTION 4: إعدادات البحث */}
 <section className="bg-card text-card-foreground border rounded-xl p-6 shadow-sm">
   <div className="flex justify-between items-center mb-6">
   <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
     <Info className="h-5 w-5 text-purple-500" />
     {t("wizard.basic.search.section")}
   </h3>
 <div className="flex items-center gap-4">
 <div className="flex items-center gap-1.5">
 <Label className="text-xs text-muted-foreground">{t("wizard.basic.search.modest")}</Label>
 <Switch className="scale-75" checked={fd.isModest ?? false} onCheckedChange={(v) => setField("isModest", v)} />
 </div>
 <div className="flex items-center gap-1.5">
 <Label className="text-xs text-muted-foreground">{t("wizard.basic.search.officeDealings")}</Label>
 <Switch className="scale-75" checked={fd.officeDealings ?? false} onCheckedChange={(v) => {
 setField("officeDealings", v);
 if (v && fd.searchType?.includes("FIELD")) {
   let current = fd.searchType ? fd.searchType.split(",") : [];
   current = current.filter(x => x !== "FIELD");
   if (!current.includes("DESK")) current.push("DESK");
   setField("searchType", current.join(","));
 }
 }} />
 </div>
 </div>
 </div>
 
 <div className="flex gap-4">
 <div className="space-y-2 border border-slate-200 dark:border-slate-800 rounded-lg p-3 bg-muted/30 flex-1 flex items-center justify-between">
 <div className="flex items-center gap-3">
 <Switch 
 checked={fd.searchType?.includes("DESK") ?? false} 
 onCheckedChange={(v) => {
   let current = fd.searchType ? fd.searchType.split(",") : [];
   if (v) {
     if (!current.includes("DESK")) current.push("DESK");
     setField("searchType", current.join(","));
     setField("registrationDate", new Date().toISOString().split("T")[0]);
   } else {
     current = current.filter(x => x !== "DESK");
     setField("searchType", current.length ? current.join(",") : null);
   }
 }} 
 />
 <Label className="text-sm font-semibold text-slate-700">{t("wizard.basic.search.desk")}</Label>
 </div>
 {fd.searchType?.includes("DESK") && (
 <span className="text-xs text-slate-500 font-mono" dir="ltr">
   {fd.registrationDate ? (fd.registrationDate.includes("T") ? fd.registrationDate.split("T")[0] : fd.registrationDate) : ""}
 </span>
 )}
 </div>

 <div className={cn("space-y-2 border border-slate-200 dark:border-slate-800 rounded-lg p-3 bg-muted/30 flex-1 flex items-center justify-between", fd.officeDealings ? "opacity-50 pointer-events-none" : "")}>
 <div className="flex items-center gap-3">
 <Switch 
 checked={fd.searchType?.includes("FIELD") ?? false} 
 onCheckedChange={(v) => {
   let current = fd.searchType ? fd.searchType.split(",") : [];
   if (v) {
     if (!current.includes("FIELD")) current.push("FIELD");
     setField("searchType", current.join(","));
     setField("registrationDate", new Date().toISOString().split("T")[0]);
   } else {
     current = current.filter(x => x !== "FIELD");
     setField("searchType", current.length ? current.join(",") : null);
   }
 }} 
 disabled={fd.officeDealings}
 />
 <Label className="text-sm font-semibold text-slate-700">{t("wizard.basic.search.field")}</Label>
 </div>
 {fd.searchType?.includes("FIELD") && (
 <div className="flex flex-col items-end">
 <span className="text-xs text-slate-500 font-mono" dir="ltr">
   {fd.registrationDate ? (fd.registrationDate.includes("T") ? fd.registrationDate.split("T")[0] : fd.registrationDate) : ""}
 </span>
 {fd.registrationDate && (new Date().getTime() - new Date(fd.registrationDate).getTime()) > 31536000000 && (
 <span className="text-[10px] text-destructive flex items-center gap-1 mt-1">
 <AlertCircle className="w-3 h-3" /> {t("wizard.basic.search.expired")}
 </span>
 )}
 </div>
 )}
 </div>
 </div>
 </section>

 {/* SECTION 5: الملاحظات */}
 <section className="space-y-4">
 <h3 className="text-sm font-semibold uppercase text-muted-foreground border-b pb-1.5">{t("wizard.basic.notes.section")}</h3>
 <div className="grid gap-4 sm:grid-cols-2">
 <div className="space-y-1.5">
 <Label className={labelClass}>{t("wizard.basic.notes.general")}</Label>
 <Textarea 
 value={fd.notes ?? ""} 
 onChange={(e) => setField("notes", e.target.value)} 
 placeholder={t("wizard.basic.notes.generalPlaceholder")}
 className="h-20 resize-none text-sm focus-visible:ring-2 focus-visible:ring-green-500/20 focus-visible:border-green-400"
 />
 </div>
 <div className="space-y-1.5 relative">
 <Label className={labelClass}>{t("wizard.basic.notes.field")}</Label>
 <Textarea 
 value={fd.fieldNotes ?? ""} 
 onChange={(e) => setField("fieldNotes", e.target.value)} 
 placeholder={t("wizard.basic.notes.fieldPlaceholder")}
 className="h-20 resize-none border-dashed text-sm focus-visible:ring-2 focus-visible:ring-green-500/20 focus-visible:border-green-400"
 />
 </div>
 </div>
 </section>

 </div>
 );
}

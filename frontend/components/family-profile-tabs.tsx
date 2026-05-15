"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  User, Users, Wallet, Receipt, Stethoscope, BarChart3, Plus, FileText,
  Phone, MapPin, CreditCard, Calendar, Trash2, CheckCircle2, XCircle,
  HandCoins, Shield, AlertTriangle, Heart, Loader2,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useTranslations, useLocale } from "next-intl";
import { dictLabel } from "@/lib/i18n/dict-label";
import {
  useFamiliesStore,
  INCOME_SOURCES,
  EXPENSE_CATEGORIES,
  MEMBER_RELATIONS,
  EDUCATION_LEVELS,
  DISABILITY_CLASSES,
  CHRONIC_SEVERITY,
  GENDER_OPTIONS,
  MARITAL_OPTIONS,
} from "@/lib/store";

const legacyClassificationMap: Record<string, string> = {
  'هش للغاية (حرج)': 'VERY_FRAGILE',
  'هش للغاية': 'FRAGILE',
  'ضعيف': 'WEAK',
  'متوسط': 'MODERATE',
  'خارج الأولوية': 'OUT_OF_PRIORITY',
};

const classificationColors: Record<string, string> = {
  VERY_FRAGILE: "bg-destructive/15 text-destructive border-destructive/30",
  FRAGILE: "bg-destructive/15 text-destructive border-destructive/30",
  WEAK: "bg-warning/15 text-warning-foreground border-warning/30",
  MODERATE: "bg-primary/12 text-primary border-primary/25",
  OUT_OF_PRIORITY: "bg-muted text-muted-foreground border-border",
  "هش للغاية (حرج)": "bg-destructive/15 text-destructive border-destructive/30",
  "هش للغاية": "bg-destructive/15 text-destructive border-destructive/30",
  "ضعيف": "bg-warning/15 text-warning-foreground border-warning/30",
  "متوسط": "bg-primary/12 text-primary border-primary/25",
  "خارج الأولوية": "bg-muted text-muted-foreground border-border",
};

/* ═══════════════════════════════════════════════
   MAIN COMPONENT — Lazy Tab Mounting
   Each tab's heavy content (form + schema + hooks) is only
   instantiated the FIRST TIME the user clicks on it.
   ═══════════════════════════════════════════════ */
export function FamilyProfileTabs({ family }: { family: any }) {
  const tProfile = useTranslations("families.profile.tabs");
  // Support both 'income' (old local state) and 'incomes' (API response)
  const incomeList = family.incomes || family.income || [];
  const expenseList = family.expenses || [];
  const medicalList = family.medicalRecords || [];

  const totalIncome = incomeList.reduce((s: any, i: any) => s + (parseFloat(i.amount) || 0), 0);
  const totalExpenses = expenseList.reduce((s: any, e: any) => s + (parseFloat(e.amount) || 0), 0);
  const totalMedicalCost = medicalList.reduce((s: any, r: any) => s + (parseFloat(r.monthlyCost) || 0), 0);
  const netBalance = totalIncome - (totalExpenses + totalMedicalCost);

  // Track which tabs have ever been opened — mount content only on first visit
  const [activeTab, setActiveTab] = useState("basic");
  const [mountedTabs, setMountedTabs] = useState<Set<string>>(new Set(["basic"]));

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setMountedTabs((prev) => new Set([...prev, tab]));
  };

  const locale = useLocale();

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <TabsList className="w-full justify-start overflow-x-auto flex-nowrap bg-card border border-border p-1 h-auto">
        <TabsTrigger value="basic" className="gap-1.5 text-xs sm:text-sm whitespace-nowrap">
          <User className="h-4 w-4" /> {tProfile("basicInfo")}
        </TabsTrigger>
        <TabsTrigger value="members" className="gap-1.5 text-xs sm:text-sm whitespace-nowrap">
          <Users className="h-4 w-4" /> {tProfile("members")}
        </TabsTrigger>
        <TabsTrigger value="income" className="gap-1.5 text-xs sm:text-sm whitespace-nowrap">
          <Wallet className="h-4 w-4" /> {tProfile("income")}
        </TabsTrigger>
        <TabsTrigger value="expenses" className="gap-1.5 text-xs sm:text-sm whitespace-nowrap">
          <Receipt className="h-4 w-4" /> {tProfile("expenses")}
        </TabsTrigger>
        <TabsTrigger value="medical" className="gap-1.5 text-xs sm:text-sm whitespace-nowrap">
          <Stethoscope className="h-4 w-4" /> {tProfile("medical")}
        </TabsTrigger>
        <TabsTrigger value="scoring" className="gap-1.5 text-xs sm:text-sm whitespace-nowrap">
          <BarChart3 className="h-4 w-4" /> {tProfile("scoring")}
        </TabsTrigger>
      </TabsList>

      {/* ─────── TAB 1: Basic Info — always mounted (default tab) ─────── */}
      <TabsContent value="basic">
        <BasicInfoTab family={family} />
      </TabsContent>

      {/* ─────── TAB 2: Members — lazy mount ─────── */}
      <TabsContent value="members">
        {mountedTabs.has("members") && <MembersTab family={family} />}
      </TabsContent>

      {/* ─────── TAB 3: Income — lazy mount ─────── */}
      <TabsContent value="income">
        {mountedTabs.has("income") && (
          <IncomeTab family={{ ...family, income: incomeList }} totalIncome={totalIncome} />
        )}
      </TabsContent>

      {/* ─────── TAB 4: Expenses — lazy mount ─────── */}
      <TabsContent value="expenses">
        {mountedTabs.has("expenses") && (
          <ExpensesTab family={{ ...family, expenses: expenseList }} totalExpenses={totalExpenses} netBalance={netBalance} />
        )}
      </TabsContent>

      {/* ─────── TAB 5: Medical — lazy mount ─────── */}
      <TabsContent value="medical">
        {mountedTabs.has("medical") && (
          <MedicalTab family={{ ...family, medicalRecords: medicalList }} />
        )}
      </TabsContent>

      {/* ─────── TAB 6: Scoring — lazy mount ─────── */}
      <TabsContent value="scoring">
        {mountedTabs.has("scoring") && (
          <ScoringTab
            family={{ ...family, income: incomeList, medicalRecords: medicalList }}
            totalIncome={totalIncome}
            totalExpenses={totalExpenses}
            totalMedicalCost={totalMedicalCost}
            netBalance={netBalance}
          />
        )}
      </TabsContent>
    </Tabs>
  );
}


/* ═══════════════════════════════════════════════
   TAB 1: Basic Info
   ═══════════════════════════════════════════════ */
function BasicInfoTab({ family }: { family: any }) {
  const tDomain = useTranslations("domain");
  const tProfile = useTranslations("families.profile.basicInfo");
  const tScore = useTranslations("families.profile.scoring");

  const getDomainLabel = (group: string, val: string | null | undefined) => {
    if (!val) return "---";
    const mappedVal = group === "vulnerability" ? (legacyClassificationMap[val] || val) : val;
    try {
      const key = `${group}.${mappedVal}`;
      return tDomain.has(key as any) ? tDomain(key as any) : mappedVal;
    } catch {
      return val;
    }
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">{tProfile("title")}</CardTitle>
        <div className="flex items-center gap-2">
          {family.dataVerified && (
            <Badge variant="outline" className="bg-success/12 text-success border-success/25 gap-1">
              <CheckCircle2 className="h-3 w-3" /> {tProfile("verified")}
            </Badge>
          )}
          {family.fieldResearchDone && (
            <Badge variant="outline" className="bg-primary/12 text-primary border-primary/25 gap-1">
              <Shield className="h-3 w-3" /> {tProfile("fieldResearch")}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Personal Info */}
        <div>
          <h4 className="text-sm font-semibold text-muted-foreground mb-3">{tProfile("familyData")}</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <InfoField icon={User} label={tProfile("headName")} value={family.headName} />
            <InfoField icon={User} label={tProfile("wifeName")} value={family.wifeName || "---"} />
            <InfoField icon={CreditCard} label={tProfile("nationalId")} value={family.nationalId} dir="ltr" />
            <InfoField icon={CreditCard} label={tProfile("wifeNationalId")} value={family.wifeNationalId || "---"} dir="ltr" />
            <InfoField icon={Phone} label={tProfile("phone")} value={family.phone} dir="ltr" />
            <InfoField icon={Phone} label={tProfile("phone2")} value={family.phone2 || "---"} dir="ltr" />
            <InfoField icon={MapPin} label={tProfile("address")} value={family.address} />
            <InfoField icon={Calendar} label={tProfile("registrationDate")} value={family.registrationDate} />
            <InfoField icon={Users} label={tProfile("membersCount")} value={`${Array.isArray(family.members) ? family.members.length : family.members || 0} ${tProfile("membersSuffix")}`} />
          </div>
        </div>

        <Separator />

        {/* Financial Info */}
        <div>
          <h4 className="text-sm font-semibold text-muted-foreground mb-3">{tProfile("financialData")}</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <InfoField icon={CreditCard} label={tProfile("meezaCard")} value={family.meezaCard || tProfile("notRegistered")} dir="ltr" />
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <FileText className="h-3 w-3" /> {tProfile("classification")}
              </p>
              <Badge variant="outline" className={classificationColors[family.classification] || ""}>
                {getDomainLabel("vulnerability", family.classification)}
              </Badge>
            </div>
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Heart className="h-3 w-3" /> {tProfile("caseCategory")}
              </p>
              <Badge variant="secondary">
                {getDomainLabel("social_status", family.category)}
              </Badge>
            </div>
            <InfoField icon={FileText} label={tProfile("categoryReason")} value={family.categoryReason || "---"} />
            <InfoField icon={HandCoins} label={tProfile("aidDecision")} value={family.aidDecision || "---"} />
            <InfoField icon={HandCoins} label={tProfile("monthlyAid")} value={family.monthlyAidAmount ? `${family.monthlyAidAmount} ${tScore("currency")}` : "---"} />
          </div>
        </div>

        {/* Field Research Notes */}
        {family.fieldResearchNotes && (
          <>
            <Separator />
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground mb-2">{tProfile("fieldResearchNotes")}</h4>
              <p className="text-sm text-foreground bg-secondary/50 p-3 rounded-xl leading-relaxed">{family.fieldResearchNotes}</p>
            </div>
          </>
        )}

        {family.notes && (
          <>
            <Separator />
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground mb-2">{tProfile("generalNotes")}</h4>
              <p className="text-sm text-foreground bg-secondary/50 p-3 rounded-xl leading-relaxed">{family.notes}</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

/* ═══════════════════════════════════════════════
   TAB 2: Members + Add Member Form
   ═══════════════════════════════════════════════ */
const createMemberSchema = (tV: any) => z.object({
  name: z.string().min(3, tV("nameMin")),
  nationalId: z.string().optional().refine(
    (val) => !val || (val.length === 14 && /^\d+$/.test(val)),
    tV("nationalId14")
  ),
  relation: z.string().min(1, tV("relationRequired")),
  birthDate: z.string().min(1, tV("birthRequired")),
  gender: z.string().min(1, tV("genderRequired")),
  education: z.string().optional(),
  job: z.string().optional(),
  jobIncome: z.coerce.number().min(0),
  maritalStatus: z.string().optional(),
  hasDisability: z.boolean(),
  disabilityClass: z.string().optional().nullable(),
  disabilityDescription: z.string().optional(),
  hasChronicIllness: z.boolean(),
  chronicIllness: z.string().optional(),
  chronicSeverity: z.string().optional().nullable(),
  notes: z.string().optional(),
});

function MembersTab({ family }: { family: any }) {
  const [open, setOpen] = useState(false);
  const members = Array.isArray(family.members) ? family.members : [];
  const addMember = useFamiliesStore(state => state.addMember);
  const deleteMember = useFamiliesStore(state => state.deleteMember);
  const t = useTranslations("families");
  const tDomain = useTranslations("domain");
  const tM = useTranslations("families.profile.members");
  const tV = useTranslations("validation.member");

  const memberSchema = React.useMemo(() => createMemberSchema(tV), [tV]);

  const getDomainLabel = (group: string, val: string | null | undefined) => {
    if (!val) return "---";
    try {
      const key = `${group}.${val}`;
      return tDomain.has(key as any) ? tDomain(key as any) : val;
    } catch {
      return val;
    }
  };

  const {
    register, handleSubmit, setValue, watch, formState: { errors }, reset,
  } = useForm({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      name: "", nationalId: "", relation: "", birthDate: "", gender: "male",
      education: "", job: "", jobIncome: 0, maritalStatus: "",
      hasDisability: false, disabilityClass: null, disabilityDescription: "",
      hasChronicIllness: false, chronicIllness: "", chronicSeverity: null, notes: "",
    },
  });

  const hasDisability = watch("hasDisability");
  const hasChronicIllness = watch("hasChronicIllness");

  const onSubmit = (data: any) => {
    const birthYear = new Date(data.birthDate).getFullYear();
    const age = new Date().getFullYear() - birthYear;
    addMember(family.id, { ...data, age });
    toast.success(tM("addSuccess"));
    reset();
    setOpen(false);
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">{tM("title")} ({members.length})</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1"><Plus className="h-3.5 w-3.5" /> {tM("addMember")}</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{tM("dialogTitle")}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>{tM("fullName")} *</Label>
                  <Input {...register("name")} placeholder={tM("fullNamePh")} />
                  {errors.name && <p className="text-xs text-destructive">{errors.name.message as string}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>{tM("nationalId")}</Label>
                  <Input {...register("nationalId")} placeholder={tM("nationalIdPh")} dir="ltr" className="text-right" />
                  {errors.nationalId && <p className="text-xs text-destructive">{errors.nationalId.message as string}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label>{tM("relation")} *</Label>
                  <Select onValueChange={(v) => setValue("relation", v, { shouldValidate: true })}>
                    <SelectTrigger><SelectValue placeholder={tM("selectPh")} /></SelectTrigger>
                    <SelectContent>
                      {MEMBER_RELATIONS.map((r) => (
                        <SelectItem key={r.value} value={r.value}>
                          {dictLabel(t, "memberRelations", r)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.relation && <p className="text-xs text-destructive">{errors.relation.message as string}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>{tM("birthDate")} *</Label>
                  <Input type="date" {...register("birthDate")} dir="ltr" className="text-right" />
                  {errors.birthDate && <p className="text-xs text-destructive">{errors.birthDate.message as string}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>{tM("gender")} *</Label>
                  <Select defaultValue={GENDER_OPTIONS[0]?.value} onValueChange={(v) => setValue("gender", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {GENDER_OPTIONS.map((g) => (
                        <SelectItem key={g.value} value={g.value}>
                          {dictLabel(t, "gender", g)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label>{tM("education")}</Label>
                  <Select onValueChange={(v) => setValue("education", v, { shouldValidate: true })}>
                    <SelectTrigger><SelectValue placeholder={tM("selectPh")} /></SelectTrigger>
                    <SelectContent>
                      {EDUCATION_LEVELS.map((e) => (
                        <SelectItem key={e.value} value={e.value}>
                          {dictLabel(t, "educationLevels", e)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.education && <p className="text-xs text-destructive">{errors.education.message as string}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>{tM("job")}</Label>
                  <Input {...register("job")} placeholder={tM("jobPh")} />
                  {errors.job && <p className="text-xs text-destructive">{errors.job.message as string}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>{tM("jobIncome")}</Label>
                  <Input type="number" {...register("jobIncome")} min={0} dir="ltr" className="text-right" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>{tM("maritalStatus")}</Label>
                <Select onValueChange={(v) => setValue("maritalStatus", v, { shouldValidate: true })}>
                  <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder={tM("selectPh")} /></SelectTrigger>
                    <SelectContent>
                      {MARITAL_OPTIONS.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {dictLabel(t, "marital", s)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                </Select>
                {errors.maritalStatus && <p className="text-xs text-destructive">{errors.maritalStatus.message as string}</p>}
              </div>

              <Separator />

              {/* Disability Section */}
              <div className="space-y-3 rounded-xl bg-secondary/50 p-4">
                <div className="flex items-center justify-between">
                  <Label className="font-medium">{tM("hasDisability")}</Label>
                  <Switch checked={hasDisability} onCheckedChange={(v) => setValue("hasDisability", v)} />
                </div>
                {hasDisability && (
                  <div className="space-y-3 pt-2">
                    <div className="space-y-1.5">
                      <Label>{tM("disabilityClass")}</Label>
                      <Select onValueChange={(v) => setValue("disabilityClass", v)}>
                        <SelectTrigger><SelectValue placeholder={tM("selectClass")} /></SelectTrigger>
                        <SelectContent>
                          {DISABILITY_CLASSES.map((d) => (
                            <SelectItem key={d.code} value={d.code}>
                              <span className="font-medium">{t("profile.misc.tier", { code: d.code })}</span>
                              {" — "}
                              {t(`dictionaries.disability.${d.key}_label`)} ({d.score} {t("profile.misc.points")})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {DISABILITY_CLASSES.map((d) =>
                        watch("disabilityClass") === d.code ? (
                          <p key={d.code} className="text-[11px] text-muted-foreground">
                            {t(`dictionaries.disability.${d.key}_desc`)}
                          </p>
                        ) : null
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label>{tM("disabilityDesc")}</Label>
                      <Textarea {...register("disabilityDescription")} placeholder={tM("disabilityDescPh")} rows={2} />
                    </div>
                  </div>
                )}
              </div>

              {/* Chronic Illness Section */}
              <div className="space-y-3 rounded-xl bg-secondary/50 p-4">
                <div className="flex items-center justify-between">
                  <Label className="font-medium">{tM("hasChronicIllness")}</Label>
                  <Switch checked={hasChronicIllness} onCheckedChange={(v) => setValue("hasChronicIllness", v)} />
                </div>
                {hasChronicIllness && (
                  <div className="space-y-3 pt-2">
                    <div className="space-y-1.5">
                      <Label>{tM("illnessName")}</Label>
                      <Input {...register("chronicIllness")} placeholder={tM("illnessNamePh")} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>{tM("severity")}</Label>
                      <Select onValueChange={(v) => setValue("chronicSeverity", v)}>
                        <SelectTrigger><SelectValue placeholder={tM("selectPh")} /></SelectTrigger>
                        <SelectContent>
                          {CHRONIC_SEVERITY.map((s) => (
                            <SelectItem key={s.code} value={s.code}>
                              {t(`dictionaries.chronicSeverity.${s.key}`)} ({s.score} {t("profile.misc.points")}) —{" "}
                              {t(`dictionaries.chronicSeverity.${s.key}_desc`)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <Label>{tM("notes")}</Label>
                <Textarea {...register("notes")} placeholder={tM("notesPh")} rows={2} />
              </div>

              <Button type="submit" className="w-full bg-primary text-primary-foreground">{tM("saveMember")}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {members.length === 0 ? (
          <EmptyState icon={Users} message={tM("emptyState")} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {members.map((member: any) => (
              <Card key={member.id} className="shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 border-border/40 hover:border-primary/30 overflow-hidden bg-card/60 backdrop-blur-sm rounded-2xl">
                <CardContent className="p-5 flex flex-col gap-4">
                  {/* Header Area */}
                  <div className="flex items-start justify-between">
                    <div className="flex flex-col gap-1.5">
                      <h4 className="font-bold text-foreground text-[15px] flex items-center gap-2">
                        {member.name}
                        {member.gender === "FEMALE" || member.gender === "أنثى" || member.gender === "female" ? (
                          <span className="text-[10px] bg-pink-500/10 text-pink-600 border border-pink-500/20 px-2 py-0.5 rounded-full font-medium">{tM("female")}</span>
                        ) : (
                          <span className="text-[10px] bg-blue-500/10 text-blue-600 border border-blue-500/20 px-2 py-0.5 rounded-full font-medium">{tM("male")}</span>
                        )}
                      </h4>
                      <p className="text-[13px] font-medium text-primary bg-primary/10 w-fit px-2 py-0.5 rounded-md">
                        {getDomainLabel("role", member.relation)} • {member.age} {tM("years")}
                      </p>
                      
                      {/* Health Badges */}
                      {(member.hasDisability || member.hasChronicIllness) && (
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {member.hasDisability && (
                            <Badge variant="outline" className="bg-chart-2/10 text-chart-2 border-chart-2/20 text-[10px] font-semibold">
                              {tM("disability")} {getDomainLabel("disabilitySeverities", member.disabilityClass)}
                            </Badge>
                          )}
                          {member.hasChronicIllness && (
                            <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 text-[10px] font-semibold">
                              {tM("chronicIllness")}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <Button
                      variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
                      onClick={() => {
                        deleteMember(family.id, member.id);
                        toast.success(tM("deleteSuccess"));
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <Separator className="opacity-50" />

                  {/* Data Grid Area */}
                  <div className="grid grid-cols-2 gap-y-4 gap-x-4">
                    <MiniField label={tM("nationalId")} value={member.nationalId || tM("notRegistered")} dir="ltr" />
                    <MiniField label={tM("maritalStatus")} value={getDomainLabel("maritalStatus", member.maritalStatus)} />
                    <MiniField label={tM("education")} value={getDomainLabel("education", member.education)} />
                    <MiniField label={tM("currentJob")} value={member.job || tM("noJob")} />
                    <MiniField label={tM("jobIncome")} value={member.jobIncome > 0 ? `${member.jobIncome} ${t("profile.scoring.currency")}` : tM("noIncome")} />
                    
                    {member.hasDisability && (
                      <MiniField label={tM("disabilityDesc")} value={member.disabilityDescription && member.disabilityDescription !== "undefined" ? member.disabilityDescription : `${t("profile.misc.tier", { code: getDomainLabel("disabilitySeverities", member.disabilityClass) })}`} />
                    )}
                    {member.hasChronicIllness && (
                      <MiniField label={tM("illnessName")} value={`${member.chronicIllness} (${getDomainLabel("chronicSeverities", member.chronicSeverity)})`} />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ═══════════════════════════════════════════════
   TAB 3: Income + Add Income Form
   ═══════════════════════════════════════════════ */
const createIncomeSchema = (tV: any) => z.object({
  source: z.string().min(1, tV("sourceRequired")),
  amount: z.coerce.number().min(1, tV("amountRequired")),
  frequency: z.string().min(1, tV("frequencyRequired")),
  verified: z.boolean(),
  notes: z.string().optional(),
});

function IncomeTab({ family, totalIncome }: { family: any; totalIncome: number }) {
  const [open, setOpen] = useState(false);
  const addIncome = useFamiliesStore(state => state.addIncome);
  const deleteIncome = useFamiliesStore(state => state.deleteIncome);

  const getIncomeSourceKey = (raw: string) => {
    if (!raw) return "other";
    if (raw === "SALARY") return "fixed_salary";
    if (raw === "TAKAFUL_KARAMA") return "takafol";
    if (raw === "PENSION") return "pension";
    if (raw === "PROJECT") return "project_income";
    if (raw === "PROPERTY") return "real_estate_income";
    if (raw === "RATION_CARD") return "ration_card";
    const found = INCOME_SOURCES.find((x) => x.value === raw || x.key === raw);
    return found ? found.key : "other";
  };

  const incomes = family.income || [];
  const t = useTranslations("families");
  const tInc = useTranslations("families.profile.income");
  const tV = useTranslations("validation.member");
  const tM = useTranslations("families.profile.members");
  const incomeSchema = React.useMemo(() => createIncomeSchema(tV), [tV]);

  const { register, handleSubmit, setValue, watch, formState: { errors }, reset } = useForm({
    resolver: zodResolver(incomeSchema),
    defaultValues: { source: "", amount: 0, frequency: "monthly", verified: false, notes: "" },
  });

  const onSubmit = async (data: any) => {
    try {
      await addIncome(family.id, data);
      toast.success(tInc("addSuccess"));
      reset();
      setOpen(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || tInc("addError"));
    }
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">{tInc("title")} ({incomes.length})</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1"><Plus className="h-3.5 w-3.5" /> {tInc("addIncome")}</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>{tInc("dialogTitle")}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label>{tInc("source")} *</Label>
                <Select onValueChange={(v) => setValue("source", v, { shouldValidate: true })}>
                  <SelectTrigger><SelectValue placeholder={tInc("sourcePh")} /></SelectTrigger>
                  <SelectContent>
                    {INCOME_SOURCES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {dictLabel(t, "incomeSources", s)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.source && <p className="text-xs text-destructive">{errors.source.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>{tInc("amount")} *</Label>
                  <Input type="number" {...register("amount")} min={0} dir="ltr" className="text-right" />
                  {errors.amount && <p className="text-xs text-destructive">{errors.amount.message as string}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>{tInc("frequency")}</Label>
                  <Select defaultValue="monthly" onValueChange={(v) => setValue("frequency", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">{tInc("monthly")}</SelectItem>
                      <SelectItem value="daily">{tInc("daily")}</SelectItem>
                      <SelectItem value="weekly">{tInc("weekly")}</SelectItem>
                      <SelectItem value="seasonal">{tInc("seasonal")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-secondary/50 p-3">
                <Label>{tInc("verified")}</Label>
                <Switch checked={watch("verified")} onCheckedChange={(v) => setValue("verified", v)} />
              </div>
              <div className="space-y-1.5">
                <Label>{tM("notes")}</Label>
                <Input {...register("notes")} placeholder={tM("notesPh")} />
              </div>
              <Button type="submit" className="w-full bg-primary text-primary-foreground">{tInc("save")}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-3">
        {incomes.length === 0 ? (
          <EmptyState icon={Wallet} message={tInc("emptyState")} />
        ) : (
          <>
            {incomes.map((inc: any) => (
              <div key={inc.id} className="group flex items-center justify-between p-3 rounded-xl border border-transparent bg-secondary/40 hover:bg-secondary/60 hover:border-border/50 hover:shadow-sm transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Wallet className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {dictLabel(t, "incomeSources", { key: getIncomeSourceKey(inc.source), value: inc.source })}
                    </p>
                    <p className="text-xs text-muted-foreground">{inc.amount.toLocaleString()} {tInc("currency")}</p>
                  </div>
                </div>
                <Button
                  variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={() => {
                    deleteIncome(family.id, inc.id);
                    toast.success(tInc("deleteSuccess"));
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between items-center pt-1">
              <span className="font-semibold text-foreground">{tInc("total")}</span>
              <span className="font-bold text-lg text-primary">{totalIncome.toLocaleString()} {tInc("currency")}</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

/* ═══════════════════════════════════════════════
   TAB 4: Expenses + Add Expense Form
   ═══════════════════════════════════════════════ */
const createExpenseSchema = (tV: any) => z.object({
  item: z.string().min(1, tV("expenseCategoryRequired")),
  amount: z.coerce.number().min(1, tV("amountRequired")),
  priority: z.string().optional(),
  notes: z.string().optional(),
});

function ExpensesTab({ family, totalExpenses, netBalance }: any) {
  const [open, setOpen] = useState(false);
  const addExpense = useFamiliesStore(state => state.addExpense);
  const deleteExpense = useFamiliesStore((s) => s.deleteExpense);
  const expenses = family.expenses || [];
  const t = useTranslations("families");
  const tExp = useTranslations("families.profile.expenses");
  const tM = useTranslations("families.profile.members");
  const tV = useTranslations("validation.member");

  const expenseSchema = React.useMemo(() => createExpenseSchema(tV), [tV]);

  const { register, handleSubmit, setValue, formState: { errors }, reset } = useForm({
    resolver: zodResolver(expenseSchema),
    defaultValues: { item: "", amount: 0, priority: "basic", notes: "" },
  });

  const onSubmit = async (data: any) => {
    try {
      await addExpense(family.id, data);
      toast.success(tExp("addSuccess"));
      reset();
      setOpen(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || tExp("addError"));
    }
  };

  const getExpenseCategoryKey = (raw: string) => {
    if (!raw) return "other";
    const found = EXPENSE_CATEGORIES.find((x) => x.value === raw || x.key === raw);
    return found ? found.key : "other";
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">{tExp("title")} ({expenses.length})</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1"><Plus className="h-3.5 w-3.5" /> {tExp("addExpense")}</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>{tExp("dialogTitle")}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label>{tExp("category")} *</Label>
                <Select onValueChange={(v) => setValue("item", v, { shouldValidate: true })}>
                  <SelectTrigger><SelectValue placeholder={tExp("categoryPh")} /></SelectTrigger>
                  <SelectContent>
                    {EXPENSE_CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {dictLabel(t, "expenseCategories", c)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.item && <p className="text-xs text-destructive">{errors.item.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>{tExp("amount")} *</Label>
                  <Input type="number" {...register("amount")} min={0} dir="ltr" className="text-right" />
                  {errors.amount && <p className="text-xs text-destructive">{errors.amount.message as string}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Priority</Label>
                  <Select defaultValue="basic" onValueChange={(v) => setValue("priority", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="secondary">Secondary</SelectItem>
                      <SelectItem value="luxury">Luxury</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>{tExp("notes")}</Label>
                <Input {...register("notes")} placeholder={tM("notesPh")} />
              </div>
              <Button type="submit" className="w-full bg-primary text-primary-foreground">{tExp("save")}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-3">
        {expenses.length === 0 ? (
          <EmptyState icon={Receipt} message={tExp("emptyState")} />
        ) : (
          <>
            {expenses.map((exp: any) => (
              <div key={exp.id} className="group flex items-center justify-between p-3 rounded-xl border border-transparent bg-secondary/40 hover:bg-secondary/60 hover:border-border/50 hover:shadow-sm transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
                    <Receipt className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{dictLabel(t, "expenseCategories", { key: getExpenseCategoryKey(exp.item), value: exp.item })}</p>
                    <p className="text-xs text-muted-foreground">{exp.amount.toLocaleString()} {tExp("currency")}</p>
                  </div>
                </div>
                <Button
                  variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={() => {
                    deleteExpense(family.id, exp.id);
                    toast.success(tExp("deleteSuccess"));
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between items-center pt-1">
              <span className="font-semibold text-foreground">{tExp("total")}</span>
              <span className="font-bold text-lg text-destructive">{totalExpenses.toLocaleString()} {tExp("currency")}</span>
            </div>
            <div className={`flex justify-between items-center p-3 rounded-xl border ${netBalance < 0 ? 'bg-destructive/5 border-destructive/20' : 'bg-primary/5 border-primary/20'}`}>
              <span className={`font-semibold flex items-center gap-1 ${netBalance < 0 ? 'text-destructive' : 'text-primary'}`}>
                {netBalance < 0 ? <AlertTriangle className="h-4 w-4" /> : <Wallet className="h-4 w-4" />}
                {tExp("netBalance")}
              </span>
              <span className={`font-bold text-lg ${netBalance < 0 ? 'text-destructive' : 'text-primary'}`}>
                {Math.abs(netBalance).toLocaleString()} {tExp("currency")} {netBalance < 0 ? '(-)' : '(+)'}
              </span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

/* ═══════════════════════════════════════════════
   TAB 5: Medical Records + Add Form
   ═══════════════════════════════════════════════ */
const medicalSchema = z.object({
  memberName: z.string().optional(),
  type: z.string().optional(),
  condition: z.string().optional(),
  severity: z.string().optional(),
  disabilityClass: z.string().optional().nullable(),
  treatment: z.string().optional(),
  monthlyCost: z.coerce.number().min(0).optional(),
  hospital: z.string().optional(),
  startDate: z.string().optional(),
  needsFollowup: z.boolean().optional(),
  notes: z.string().optional(),
});

function MedicalTab({ family }) {
  const [open, setOpen] = useState(false);
  const addMedicalRecord = useFamiliesStore(state => state.addMedicalRecord);
  const deleteMedicalRecord = useFamiliesStore(state => state.deleteMedicalRecord);
  const records = family.medicalRecords || [];
  const members = family.members || [];
  const t = useTranslations("families");
  const tMed = useTranslations("families.profile.medical");
  const tM = useTranslations("families.profile.members");

  const getChronicSeverityKey = (raw: string) => {
    if (!raw) return "moderate";
    if (raw === "CRITICAL") return "critical";
    if (raw === "SEVERE") return "severe";
    if (raw === "MODERATE") return "moderate";
    if (raw === "MILD") return "mild";
    const found = CHRONIC_SEVERITY.find((x) => x.code === raw || x.key === raw);
    return found ? found.key : "moderate";
  };

  const { register, handleSubmit, setValue, watch, formState: { errors }, reset } = useForm({
    resolver: zodResolver(medicalSchema),
    defaultValues: {
      memberName: "", type: "chronic", condition: "", severity: "",
      disabilityClass: null, treatment: "", monthlyCost: 0,
      hospital: "", startDate: "", needsFollowup: true, notes: "",
    },
  });

  const recordType = watch("type");

  const onSubmit = async (data: any) => {
    if (!data.memberName) {
      toast.error(tMed("personRequired"));
      return;
    }

    const severityObj = recordType === "disability"
      ? DISABILITY_CLASSES.find((d) => d.code === data.disabilityClass)
      : CHRONIC_SEVERITY.find((s) => s.code === data.severity);
    const matchedMember = members.find((m: any) => m.name === data.memberName);
    const personId = matchedMember?.id || family.id;
    try {
      await addMedicalRecord(family.id, personId, {
        ...data,
        severityScore: severityObj?.score || 0,
      });
      toast.success(tMed("addSuccess"));
      reset();
      setOpen(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || tMed("addError"));
    }
  };

  const totalMedicalCost = records.reduce((s, r) => s + r.monthlyCost, 0);

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">{tMed("title")} ({records.length})</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1"><Plus className="h-3.5 w-3.5" /> {tMed("addRecord")}</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{tMed("dialogTitle")}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label>{tMed("patientName")}</Label>
                {members.length > 0 ? (
                  <Select onValueChange={(v) => setValue("memberName", v, { shouldValidate: true })}>
                    <SelectTrigger><SelectValue placeholder={tM("selectPh")} /></SelectTrigger>
                    <SelectContent>
                      {members.map((m: any) => <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input {...register("memberName")} placeholder={tM("fullNamePh")} />
                )}
                {errors.memberName && <p className="text-xs text-destructive">{errors.memberName.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>{tMed("conditionType")}</Label>
                  <Select defaultValue="chronic" onValueChange={(v) => setValue("type", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="chronic">{tMed("typechronic")}</SelectItem>
                      <SelectItem value="disability">{tMed("typedisability")}</SelectItem>
                      <SelectItem value="temp_injury">{tMed("typetemp_injury")}</SelectItem>
                      <SelectItem value="surgery">{tMed("typesurgery")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>{tMed("diagnosis")}</Label>
                  <Input {...register("condition")} placeholder={tMed("diagnosisPh")} />
                  {errors.condition && <p className="text-xs text-destructive">{errors.condition.message}</p>}
                </div>
              </div>

              {/* Severity selection based on type */}
              {recordType === "disability" ? (
                <div className="space-y-1.5">
                  <Label>{tM("disabilityClass")}</Label>
                  <Select onValueChange={(v) => {
                    setValue("disabilityClass", v);
                    setValue("severity", v, { shouldValidate: true });
                  }}>
                    <SelectTrigger><SelectValue placeholder={tM("selectClass")} /></SelectTrigger>
                    <SelectContent>
                      {DISABILITY_CLASSES.map((d) => (
                        <SelectItem key={d.code} value={d.code}>
                          {t("profile.misc.tier", { code: d.code })} — {t(`dictionaries.disability.${d.key}_label`)} (
                          {d.score} {t("profile.misc.points")})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {DISABILITY_CLASSES.map((d) =>
                    watch("disabilityClass") === d.code ? (
                      <p key={d.code} className="text-[11px] text-muted-foreground bg-secondary/50 p-2 rounded-lg">
                        {t(`dictionaries.disability.${d.key}_desc`)}
                      </p>
                    ) : null
                  )}
                  {errors.severity && <p className="text-xs text-destructive">{errors.severity.message}</p>}
                </div>
              ) : (
                <div className="space-y-1.5">
                  <Label>{tM("severity")}</Label>
                  <Select onValueChange={(v) => setValue("severity", v, { shouldValidate: true })}>
                    <SelectTrigger><SelectValue placeholder={tM("selectPh")} /></SelectTrigger>
                    <SelectContent>
                      {CHRONIC_SEVERITY.map((s) => (
                        <SelectItem key={s.code} value={s.code}>
                          {t(`dictionaries.chronicSeverity.${s.key}`)} ({s.score} {t("profile.misc.points")}) —{" "}
                          {t(`dictionaries.chronicSeverity.${s.key}_desc`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.severity && <p className="text-xs text-destructive">{errors.severity.message}</p>}
                </div>
              )}

              <div className="space-y-1.5">
                <Label>{tMed("treatment")}</Label>
                <Input {...register("treatment")} placeholder={tMed("treatmentPh")} />
                {errors.treatment && <p className="text-xs text-destructive">{errors.treatment.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>{tMed("monthlyCost")}</Label>
                  <Input type="number" {...register("monthlyCost")} min={0} dir="ltr" className="text-right" />
                </div>
                <div className="space-y-1.5">
                  <Label>{tMed("startDate")}</Label>
                  <Input type="date" {...register("startDate")} dir="ltr" className="text-right" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>{tMed("hospital")}</Label>
                <Input {...register("hospital")} placeholder={tMed("hospitalPh")} />
              </div>

              <div className="flex items-center justify-between rounded-xl bg-secondary/50 p-3">
                <Label>{tMed("needsFollowup")}</Label>
                <Switch checked={watch("needsFollowup")} onCheckedChange={(v) => setValue("needsFollowup", v)} />
              </div>

              <div className="space-y-1.5">
                <Label>{tMed("notes")}</Label>
                <Textarea {...register("notes")} placeholder={tM("notesPh")} rows={2} />
              </div>

              <Button type="submit" className="w-full bg-primary text-primary-foreground">{tMed("save")}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {records.length === 0 ? (
          <EmptyState icon={Stethoscope} message={tMed("emptyState")} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {records.map((record: any) => (
              <Card key={record.id} className="shadow-sm hover:shadow-md transition-all duration-300 border-border/40 hover:border-primary/30 bg-card/60 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-foreground">{record.condition}</h4>
                      <p className="text-xs text-muted-foreground">{record.memberName}</p>
                    </div>
                    <Button
                      variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => {
                        deleteMedicalRecord(family.id, record.id);
                        toast.success(tMed("deleteSuccess"));
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <MiniField label={tMed("treatment")} value={record.treatment} />
                    <MiniField label={tMed("monthlyCost")} value={`${record.monthlyCost} ${tMed("currency")}`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ═══════════════════════════════════════════════
   TAB 6: Scoring / PMT Assessment
   ═══════════════════════════════════════════════ */
function ScoringTab({ family, totalIncome, totalExpenses, totalMedicalCost, netBalance }: any) {
  const [recalcLoading, setRecalcLoading] = useState(false);
  const fetchFamilyDetails = useFamiliesStore(state => state.fetchFamilyDetails);
  const members = Array.isArray(family.members) ? family.members : [];
  const records = Array.isArray(family.medicalRecords) ? family.medicalRecords : [];
  const vi = parseFloat(family.vulnerabilityIndex) || 0; // scale 0-10
  const t = useTranslations("families");
  const tScore = useTranslations("families.profile.scoring");
  const tDomain = useTranslations("domain");

  const getDomainLabel = (group: string, val: string | null | undefined) => {
    if (!val) return "---";
    const mappedVal = group === "classification" ? (legacyClassificationMap[val] || val) : val;
    try {
      const key = `${group}.${mappedVal}`;
      return tDomain.has(key as any) ? tDomain(key as any) : mappedVal;
    } catch {
      return val;
    }
  };

  const handleRecalculate = async () => {
    try {
      setRecalcLoading(true);
      const { default: api } = await import("@/lib/api");
      await api.post(`/v1/scoring/${family.id}/recalculate`);
      await fetchFamilyDetails(family.id);
      const { toast } = await import("sonner");
      toast.success(tScore("recalculateSuccess"));
    } catch (err: any) {
      console.error("Recalculate error", err);
      const { toast } = await import("sonner");
      toast.error(err?.response?.data?.message || tScore("recalculateError"));
    } finally {
      setRecalcLoading(false);
    }
  };

  // Calculate disability & chronic scores from members
  const disabilityScores = members
    .filter((m: any) => m.hasDisability && m.disabilityClass)
    .map((m: any) => {
      const cls = DISABILITY_CLASSES.find((d) => d.code === m.disabilityClass);
      return { name: m.name, score: cls?.score || 0, disabilityKey: cls?.key };
    });

  const chronicScores = members
    .filter((m: any) => m.hasChronicIllness && m.chronicSeverity)
    .map((m: any) => {
      const sev = CHRONIC_SEVERITY.find((s) => s.code === m.chronicSeverity);
      return { name: m.name, illness: m.chronicIllness, score: sev?.score || 0 };
    });

  const medicalScoreFromRecords = records.reduce((s, r) => s + (r.severityScore || 0), 0);
  const memberDisabilityTotal = disabilityScores.reduce((s, d) => s + d.score, 0);
  const memberChronicTotal = chronicScores.reduce((s, c) => s + c.score, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Financial Summary */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">{tScore("financialSummary")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <SummaryRow label={tScore("totalIncome")} value={`${totalIncome.toLocaleString()} ${tScore("currency")}`} color="text-primary" />
            <SummaryRow label={tScore("totalExpenses")} value={`${totalExpenses.toLocaleString()} ${tScore("currency")}`} color="text-destructive" />
            <SummaryRow label={tScore("medicalCost")} value={`${totalMedicalCost.toLocaleString()} ${tScore("currency")}`} color="text-destructive" />
            <Separator />
            <SummaryRow
              label={tScore("netBalance")}
              value={`${Math.abs(netBalance).toLocaleString()} ${tScore("currency")} ${netBalance < 0 ? '(-)' : '(+)'}`}
              color={netBalance < 0 ? "text-destructive" : "text-primary"}
              bold
            />
            {family.monthlyAidAmount > 0 && (
              <SummaryRow label={tScore("monthlyAidApproved")} value={`${family.monthlyAidAmount} ${tScore("currency")}`} color="text-primary" />
            )}
          </div>

          {/* Disability Scores */}
          {disabilityScores.length > 0 && (
            <>
              <Separator />
              <h4 className="text-sm font-semibold text-muted-foreground">{tScore("disabilityPointsTitle")}</h4>
              {disabilityScores.map((d, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {d.name} —{" "}
                    {d.disabilityKey ? t(`dictionaries.disability.${d.disabilityKey}_label`) : ""}
                  </span>
                  <span className="font-bold text-foreground">{d.score}</span>
                </div>
              ))}
              <SummaryRow label={tScore("disabilityPointsTotal")} value={memberDisabilityTotal.toFixed(1)} color="text-foreground" bold />
            </>
          )}

          {/* Chronic Scores */}
          {chronicScores.length > 0 && (
            <>
              <Separator />
              <h4 className="text-sm font-semibold text-muted-foreground">{tScore("membersChronicTitle")}</h4>
              {chronicScores.map((c, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{c.name} - {c.illness}</span>
                  <span className="font-bold text-foreground">{c.score}</span>
                </div>
              ))}
              <SummaryRow label={tScore("membersChronicTotal")} value={memberChronicTotal.toFixed(1)} color="text-foreground" bold />
            </>
          )}

          {/* Medical records score */}
          {medicalScoreFromRecords > 0 && (
            <>
              <Separator />
              <SummaryRow label={tScore("medicalRecordsScore")} value={medicalScoreFromRecords.toFixed(1)} color="text-foreground" bold />
            </>
          )}
        </CardContent>
      </Card>

      {/* Vulnerability Index */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">{tScore("classificationTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-foreground">{tScore("vulnerabilityIndex")}</span>
              <span className="text-2xl font-bold text-foreground">
                {Math.min(vi * 10, 100).toFixed(0)}%
              </span>
            </div>
            <div className="relative">
              <Progress value={Math.min(vi * 10, 100)} className="h-4 rounded-full" />
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>{tScore("outOfPriority")}</span>
              <span>{tScore("moderate")}</span>
              <span>{tScore("weak")}</span>
              <span>{tScore("fragile")}</span>
            </div>
          </div>

          {/* Visual Classification */}
          <div className="flex flex-col items-center justify-center py-6 gap-4">
            <div
              className={`h-28 w-28 rounded-full flex items-center justify-center border-4 ${vi >= 8
                ? "border-destructive/80 bg-destructive/12"
                : vi >= 5
                  ? "border-destructive/50 bg-destructive/8"
                  : vi >= 3
                    ? "border-warning/70 bg-warning/12"
                    : vi >= 1.5
                      ? "border-primary/60 bg-primary/10"
                      : "border-border bg-muted/40"
                }`}
            >
              <span className="text-3xl font-bold text-foreground">
                {Math.min(vi * 10, 100).toFixed(0)}%
              </span>
            </div>
            <Badge
              variant="outline"
              className={`text-base px-4 py-1 ${classificationColors[family.classification] || ""}`}
            >
              {getDomainLabel("vulnerability", family.classification)}
            </Badge>
            <p className="text-sm text-muted-foreground text-center max-w-xs leading-relaxed">
              {vi >= 8
                ? tScore("descCritical")
                : vi >= 5
                  ? tScore("descFragile")
                  : vi >= 3
                    ? tScore("descWeak")
                    : vi >= 1.5
                      ? tScore("descModerate")
                      : tScore("descOutOfPriority")}
            </p>
          </div>

          {/* Aid Decision */}
          {family.aidDecision && (
            <>
              <Separator />
              <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">{tScore("aidDecision")}</p>
                <p className="font-bold text-primary text-lg">{family.aidDecision}</p>
                {family.monthlyAidAmount > 0 && (
                  <p className="text-sm text-foreground mt-1">{family.monthlyAidAmount} {tScore("currency")} {tScore("monthlyAid")}</p>
                )}
              </div>
            </>
          )}
          {/* Recalculate Button */}
          <Separator />
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={handleRecalculate}
            disabled={recalcLoading}
          >
            {recalcLoading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> {tScore("recalculating")}</>
            ) : (
              <><BarChart3 className="h-4 w-4" /> {tScore("recalculate")}</>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Helper Components
   ═══════════════════════════════════════════════ */
function InfoField({ icon: Icon, label, value, dir }: { icon: any, label: string, value: any, dir?: string }) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs text-muted-foreground flex items-center gap-1">
        <Icon className="h-3 w-3" /> {label}
      </p>
      <p className="text-sm font-medium text-foreground" dir={dir}>{value}</p>
    </div>
  );
}

function MiniField({ label, value, dir }: { label: string, value: any, dir?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-muted-foreground text-[11px] font-medium uppercase tracking-wider">{label}</span>
      <span className="text-foreground text-sm font-semibold" dir={dir}>{value}</span>
    </div>
  );
}

function EmptyState({ icon: Icon, message }: { icon: any, message: string }) {
  return (
    <div className="text-center py-12">
      <Icon className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}

function SummaryRow({ label, value, color = "text-foreground", bold = false }: { label: string, value: any, color?: string, bold?: boolean }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={`${bold ? "font-bold" : "font-medium"} ${color}`}>{value}</span>
    </div>
  );
}

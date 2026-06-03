"use client";

import { useState } from "react";
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
import { useTranslations } from "next-intl";
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

/* ظ¤ظ¤ظ¤ظ¤ظ¤ظ¤ظ¤ظ¤ظ¤ظ¤ظ¤ Classification Colors ظ¤ظ¤ظ¤ظ¤ظ¤ظ¤ظ¤ظ¤ظ¤ظ¤ظ¤ */
/* Classification enum ظْ Arabic labels */
const classificationLabelsMap: Record<string, string> = {
  VERY_FRAGILE: '┘ç╪┤ ┘┘╪║╪د┘è╪ر (╪ص╪▒╪ش)',
  FRAGILE: '┘ç╪┤ ┘┘╪║╪د┘è╪ر',
  WEAK: '╪╢╪╣┘è┘',
  MODERATE: '┘à╪ز┘ê╪│╪╖',
  OUT_OF_PRIORITY: '╪«╪د╪▒╪ش ╪د┘╪ث┘ê┘┘ê┘è╪ر',
  // Arabic keys (for backward compat)
  '┘ç╪┤ ┘┘╪║╪د┘è╪ر (╪ص╪▒╪ش)': '┘ç╪┤ ┘┘╪║╪د┘è╪ر (╪ص╪▒╪ش)',
  '┘ç╪┤ ┘┘╪║╪د┘è╪ر': '┘ç╪┤ ┘┘╪║╪د┘è╪ر',
  '╪╢╪╣┘è┘': '╪╢╪╣┘è┘',
  '┘à╪ز┘ê╪│╪╖': '┘à╪ز┘ê╪│╪╖',
  '╪«╪د╪▒╪ش ╪د┘╪ث┘ê┘┘ê┘è╪ر': '╪«╪د╪▒╪ش ╪د┘╪ث┘ê┘┘ê┘è╪ر',
};

const classificationColors: Record<string, string> = {
  VERY_FRAGILE: "bg-destructive/15 text-destructive border-destructive/30",
  FRAGILE: "bg-destructive/15 text-destructive border-destructive/30",
  WEAK: "bg-warning/15 text-warning-foreground border-warning/30",
  MODERATE: "bg-primary/12 text-primary border-primary/25",
  OUT_OF_PRIORITY: "bg-muted text-muted-foreground border-border",
  "┘ç╪┤ ┘┘╪║╪د┘è╪ر (╪ص╪▒╪ش)": "bg-destructive/15 text-destructive border-destructive/30",
  "┘ç╪┤ ┘┘╪║╪د┘è╪ر": "bg-destructive/15 text-destructive border-destructive/30",
  "╪╢╪╣┘è┘": "bg-warning/15 text-warning-foreground border-warning/30",
  "┘à╪ز┘ê╪│╪╖": "bg-primary/12 text-primary border-primary/25",
  "╪«╪د╪▒╪ش ╪د┘╪ث┘ê┘┘ê┘è╪ر": "bg-muted text-muted-foreground border-border",
};

/* ظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـ
   MAIN COMPONENT ظ¤ Lazy Tab Mounting
   Each tab's heavy content (form + schema + hooks) is only
   instantiated the FIRST TIME the user clicks on it.
   ظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـ */
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

  // Track which tabs have ever been opened ظ¤ mount content only on first visit
  const [activeTab, setActiveTab] = useState("basic");
  const [mountedTabs, setMountedTabs] = useState<Set<string>>(new Set(["basic"]));

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setMountedTabs((prev) => new Set([...prev, tab]));
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
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

      {/* ظ¤ظ¤ظ¤ظ¤ظ¤ظ¤ظ¤ TAB 1: Basic Info ظ¤ always mounted (default tab) ظ¤ظ¤ظ¤ظ¤ظ¤ظ¤ظ¤ */}
      <TabsContent value="basic">
        <BasicInfoTab family={family} />
      </TabsContent>

      {/* ظ¤ظ¤ظ¤ظ¤ظ¤ظ¤ظ¤ TAB 2: Members ظ¤ lazy mount ظ¤ظ¤ظ¤ظ¤ظ¤ظ¤ظ¤ */}
      <TabsContent value="members">
        {mountedTabs.has("members") && <MembersTab family={family} />}
      </TabsContent>

      {/* ظ¤ظ¤ظ¤ظ¤ظ¤ظ¤ظ¤ TAB 3: Income ظ¤ lazy mount ظ¤ظ¤ظ¤ظ¤ظ¤ظ¤ظ¤ */}
      <TabsContent value="income">
        {mountedTabs.has("income") && (
          <IncomeTab family={{ ...family, income: incomeList }} totalIncome={totalIncome} />
        )}
      </TabsContent>

      {/* ظ¤ظ¤ظ¤ظ¤ظ¤ظ¤ظ¤ TAB 4: Expenses ظ¤ lazy mount ظ¤ظ¤ظ¤ظ¤ظ¤ظ¤ظ¤ */}
      <TabsContent value="expenses">
        {mountedTabs.has("expenses") && (
          <ExpensesTab family={{ ...family, expenses: expenseList }} totalExpenses={totalExpenses} netBalance={netBalance} />
        )}
      </TabsContent>

      {/* ظ¤ظ¤ظ¤ظ¤ظ¤ظ¤ظ¤ TAB 5: Medical ظ¤ lazy mount ظ¤ظ¤ظ¤ظ¤ظ¤ظ¤ظ¤ */}
      <TabsContent value="medical">
        {mountedTabs.has("medical") && (
          <MedicalTab family={{ ...family, medicalRecords: medicalList }} />
        )}
      </TabsContent>

      {/* ظ¤ظ¤ظ¤ظ¤ظ¤ظ¤ظ¤ TAB 6: Scoring ظ¤ lazy mount ظ¤ظ¤ظ¤ظ¤ظ¤ظ¤ظ¤ */}
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


/* ظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـ
   TAB 1: Basic Info
   ظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـ */
function BasicInfoTab({ family }: { family: any }) {
  const tDomain = useTranslations("domain");
  const tProfile = useTranslations("families.profile.basicInfo");
  const getDomainLabel = (group: string, val: string | null | undefined) => {
    if (!val) return "---";
    try {
      const key = `${group}.${val}`;
      return tDomain.has(key as any) ? tDomain(key as any) : val;
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
                {classificationLabelsMap[family.classification] || family.classification}
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
            <InfoField icon={HandCoins} label={tProfile("monthlyAid")} value={family.monthlyAidAmount ? `${family.monthlyAidAmount} ╪ش.┘à` : "---"} />
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
              <h4 className="text-sm font-semibold text-muted-foreground mb-2">┘à┘╪د╪ص╪╕╪د╪ز ╪╣╪د┘à╪ر</h4>
              <p className="text-sm text-foreground bg-secondary/50 p-3 rounded-xl leading-relaxed">{family.notes}</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

/* ظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـ
   TAB 2: Members + Add Member Form
   ظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـ */
const memberSchema = z.object({
  name: z.string().min(3, "╪د┘╪د╪│┘à ┘à╪╖┘┘ê╪ذ (3 ╪ث╪ص╪▒┘ ╪╣┘┘ë ╪د┘╪ث┘é┘)"),
  nationalId: z.string().optional().refine(
    (val) => !val || (val.length === 14 && /^\d+$/.test(val)),
    "╪د┘╪▒┘é┘à ╪د┘┘é┘ê┘à┘è ┘è╪ش╪ذ ╪ث┘ ┘è┘â┘ê┘ 14 ╪▒┘é┘à"
  ),
  relation: z.string().min(1, "╪د╪«╪ز╪▒ ╪╡┘╪ر ╪د┘┘é╪▒╪د╪ذ╪ر"),
  birthDate: z.string().min(1, "╪ز╪د╪▒┘è╪« ╪د┘┘à┘è┘╪د╪» ┘à╪╖┘┘ê╪ذ"),
  gender: z.string().min(1, "╪د╪«╪ز╪▒ ╪د┘┘┘ê╪╣"),
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
      name: "", nationalId: "", relation: "", birthDate: "", gender: "╪░┘â╪▒",
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
                              {" ظ¤ "}
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
                              {t(`dictionaries.chronicSeverity.${s.key}`)} ({s.score} {t("profile.misc.points")}) ظ¤{" "}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {members.map((member) => (
              <Card key={member.id} className="shadow-md hover:shadow-lg transition-shadow duration-200 border border-border/50 overflow-hidden bg-gradient-to-br from-card to-muted/10">
                <div className="h-1 w-full bg-primary/20"></div>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4 pb-4 border-b border-border/50">
                    <div className="flex flex-col gap-1">
                      <h4 className="font-bold text-foreground text-base flex items-center gap-2">
                        {member.name}
                        {member.gender === "FEMALE" || member.gender === "╪ث┘╪س┘ë" ? (
                          <span className="text-[10px] bg-pink-100 text-pink-700 px-1.5 py-0.5 rounded-full">╪ث┘╪س┘ë</span>
                        ) : (
                          <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">╪░┘â╪▒</span>
                        )}
                      </h4>
                      <p className="text-sm font-medium text-primary">{getDomainLabel("role", member.relation)} <span className="text-muted-foreground font-normal mx-1">ظت</span> <span className="text-muted-foreground font-normal">{member.age} ╪│┘╪ر</span></p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {member.hasDisability && (
                        <Badge variant="outline" className="bg-chart-2/15 text-chart-2 border-chart-2/30 text-[11px] font-semibold">
                          ╪ح╪╣╪د┘é╪ر {getDomainLabel("disabilitySeverities", member.disabilityClass)}
                        </Badge>
                      )}
                      {member.hasChronicIllness && (
                        <Badge variant="outline" className="bg-destructive/15 text-destructive border-destructive/30 text-[11px] font-semibold">
                          ┘à╪▒╪╢ ┘à╪▓┘à┘
                        </Badge>
                      )}
                      <Button
                        variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          deleteMember(family.id, member.id);
                          toast.success("╪ز┘à ╪ص╪░┘ ╪د┘┘╪▒╪»");
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-y-4 gap-x-4 bg-muted/30 p-4 rounded-xl">
                    <MiniField label="╪د┘╪▒┘é┘à ╪د┘┘é┘ê┘à┘è" value={member.nationalId || "╪║┘è╪▒ ┘à╪│╪ش┘"} dir="ltr" />
                    <MiniField label="╪د┘╪ص╪د┘╪ر ╪د┘╪د╪ش╪ز┘à╪د╪╣┘è╪ر" value={getDomainLabel("maritalStatus", member.maritalStatus)} />
                    <MiniField label="╪د┘╪ز╪╣┘┘è┘à" value={getDomainLabel("education", member.education)} />
                    <MiniField label="╪د┘╪╣┘à┘ ╪د┘╪ص╪د┘┘è" value={member.job || "┘╪د ┘è╪╣┘à┘"} />
                    <MiniField label="╪»╪«┘ ╪د┘╪╣┘à┘" value={member.jobIncome > 0 ? `${member.jobIncome} ╪ش.┘à` : "╪ذ╪»┘ê┘ ╪»╪«┘"} />
                    {member.hasDisability && (
                      <MiniField label="╪ز┘╪د╪╡┘è┘ ╪د┘╪ح╪╣╪د┘é╪ر" value={member.disabilityDescription && member.disabilityDescription !== "undefined" ? member.disabilityDescription : `┘╪خ╪ر ${getDomainLabel("disabilitySeverities", member.disabilityClass)}`} />
                    )}
                    {member.hasChronicIllness && (
                      <MiniField label="╪د┘┘à╪▒╪╢ ╪د┘┘à╪▓┘à┘" value={`${member.chronicIllness} (${getDomainLabel("chronicSeverities", member.chronicSeverity)})`} />
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

/* ظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـ
   TAB 3: Income + Add Income Form
   ظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـ */
const incomeSchema = z.object({
  source: z.string().min(1, "╪د╪«╪ز╪▒ ┘à╪╡╪»╪▒ ╪د┘╪»╪«┘"),
  amount: z.coerce.number().min(1, "╪د┘┘à╪ذ┘╪║ ┘à╪╖┘┘ê╪ذ"),
  frequency: z.string().min(1, "╪د╪«╪ز╪▒ ╪د┘╪ز┘â╪▒╪د╪▒"),
  verified: z.boolean(),
  notes: z.string().optional(),
});

function IncomeTab({ family, totalIncome }: { family: any; totalIncome: number }) {
  const [open, setOpen] = useState(false);
  const addIncome = useFamiliesStore(state => state.addIncome);
  const deleteIncome = useFamiliesStore(state => state.deleteIncome);
  const incomes = family.income || [];
  const t = useTranslations("families");

  const { register, handleSubmit, setValue, watch, formState: { errors }, reset } = useForm({
    resolver: zodResolver(incomeSchema),
    defaultValues: { source: "", amount: 0, frequency: "╪┤┘ç╪▒┘è", verified: false, notes: "" },
  });

  const onSubmit = async (data: any) => {
    try {
      await addIncome(family.id, data);
      toast.success("╪ز┘à ╪ح╪╢╪د┘╪ر ┘à╪╡╪»╪▒ ╪د┘╪»╪«┘");
      reset();
      setOpen(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "┘╪┤┘ ╪ح╪╢╪د┘╪ر ┘à╪╡╪»╪▒ ╪د┘╪»╪«┘");
    }
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">┘à╪╡╪د╪»╪▒ ╪د┘╪»╪«┘ ({incomes.length})</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1"><Plus className="h-3.5 w-3.5" /> ╪ح╪╢╪د┘╪ر ╪»╪«┘</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>╪ح╪╢╪د┘╪ر ┘à╪╡╪»╪▒ ╪»╪«┘</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label>┘à╪╡╪»╪▒ ╪د┘╪»╪«┘ *</Label>
                <Select onValueChange={(v) => setValue("source", v, { shouldValidate: true })}>
                  <SelectTrigger><SelectValue placeholder="╪د╪«╪ز╪▒ ╪د┘┘à╪╡╪»╪▒" /></SelectTrigger>
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
                  <Label>╪د┘┘à╪ذ┘╪║ (╪ش.┘à) *</Label>
                  <Input type="number" {...register("amount")} min={0} dir="ltr" className="text-right" />
                  {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>╪د┘╪ز┘â╪▒╪د╪▒</Label>
                  <Select defaultValue="╪┤┘ç╪▒┘è" onValueChange={(v) => setValue("frequency", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="╪┤┘ç╪▒┘è">╪┤┘ç╪▒┘è</SelectItem>
                      <SelectItem value="┘è┘ê┘à┘è">┘è┘ê┘à┘è</SelectItem>
                      <SelectItem value="╪ث╪│╪ذ┘ê╪╣┘è">╪ث╪│╪ذ┘ê╪╣┘è</SelectItem>
                      <SelectItem value="┘à┘ê╪│┘à┘è">┘à┘ê╪│┘à┘è</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-secondary/50 p-3">
                <Label>┘à┘ê╪س┘é (╪ز┘à ╪د┘╪ز╪ص┘é┘é)</Label>
                <Switch checked={watch("verified")} onCheckedChange={(v) => setValue("verified", v)} />
              </div>
              <div className="space-y-1.5">
                <Label>┘à┘╪د╪ص╪╕╪د╪ز</Label>
                <Input {...register("notes")} placeholder="┘à╪س╪د┘: ╪▒┘é┘à ╪ذ╪╖╪د┘é╪ر╪î ╪د╪│┘à ╪د┘╪ش┘ç╪ر..." />
              </div>
              <Button type="submit" className="w-full bg-primary text-primary-foreground">╪ص┘╪╕</Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-3">
        {incomes.length === 0 ? (
          <EmptyState icon={Wallet} message="┘╪د ╪ز┘ê╪ش╪» ┘à╪╡╪د╪»╪▒ ╪»╪«┘ ┘à╪│╪ش┘╪ر" />
        ) : (
          <>
            {incomes.map((inc) => (
              <div key={inc.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Wallet className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{inc.source}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground">{inc.frequency}</span>
                      {inc.notes && <span className="text-xs text-muted-foreground">- {inc.notes}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground">{inc.amount.toLocaleString("ar-EG")} ╪ش.┘à</span>
                  {inc.verified ? (
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  ) : (
                    <XCircle className="h-4 w-4 text-muted-foreground/40" />
                  )}
                  <Button
                    variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => {
                      deleteIncome(family.id, inc.id);
                      toast.success("╪ز┘à ╪ص╪░┘ ┘à╪╡╪»╪▒ ╪د┘╪»╪«┘");
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between items-center pt-1">
              <span className="font-semibold text-foreground">╪ح╪ش┘à╪د┘┘è ╪د┘╪»╪«┘ ╪د┘╪┤┘ç╪▒┘è</span>
              <span className="font-bold text-lg text-primary">{totalIncome.toLocaleString("ar-EG")} ╪ش.┘à</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

/* ظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـ
   TAB 4: Expenses + Add Expense Form
   ظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـ */
const expenseSchema = z.object({
  item: z.string().min(1, "╪د╪«╪ز╪▒ ╪ذ┘╪» ╪د┘┘à╪╡╪▒┘ê┘"),
  amount: z.coerce.number().min(1, "╪د┘┘à╪ذ┘╪║ ┘à╪╖┘┘ê╪ذ"),
  priority: z.string().min(1, "╪د╪«╪ز╪▒ ╪د┘╪ث┘ê┘┘ê┘è╪ر"),
  notes: z.string().optional(),
});

function ExpensesTab({ family, totalExpenses, netBalance }: any) {
  const [open, setOpen] = useState(false);
  const addExpense = useFamiliesStore(state => state.addExpense);
  const deleteExpense = useFamiliesStore(state => state.deleteExpense);
  const expenses = family.expenses || [];
  const t = useTranslations("families");

  const { register, handleSubmit, setValue, formState: { errors }, reset } = useForm({
    resolver: zodResolver(expenseSchema),
    defaultValues: { item: "", amount: 0, priority: "╪ث╪│╪د╪│┘è", notes: "" },
  });

  const onSubmit = async (data: any) => {
    try {
      await addExpense(family.id, data);
      toast.success("╪ز┘à ╪ح╪╢╪د┘╪ر ╪د┘┘à╪╡╪▒┘ê┘");
      reset();
      setOpen(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "┘╪┤┘ ╪ح╪╢╪د┘╪ر ╪د┘┘à╪╡╪▒┘ê┘");
    }
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">╪د┘┘à╪╡╪▒┘ê┘╪د╪ز ╪د┘╪┤┘ç╪▒┘è╪ر ({expenses.length})</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1"><Plus className="h-3.5 w-3.5" /> ╪ح╪╢╪د┘╪ر ┘à╪╡╪▒┘ê┘</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>╪ح╪╢╪د┘╪ر ┘à╪╡╪▒┘ê┘</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label>╪ذ┘╪» ╪د┘┘à╪╡╪▒┘ê┘ *</Label>
                <Select onValueChange={(v) => setValue("item", v, { shouldValidate: true })}>
                  <SelectTrigger><SelectValue placeholder="╪د╪«╪ز╪▒ ╪د┘╪ذ┘╪»" /></SelectTrigger>
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
                  <Label>╪د┘┘à╪ذ┘╪║ (╪ش.┘à) *</Label>
                  <Input type="number" {...register("amount")} min={0} dir="ltr" className="text-right" />
                  {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>╪د┘╪ث┘ê┘┘ê┘è╪ر</Label>
                  <Select defaultValue="╪ث╪│╪د╪│┘è" onValueChange={(v) => setValue("priority", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="╪ث╪│╪د╪│┘è">╪ث╪│╪د╪│┘è</SelectItem>
                      <SelectItem value="╪س╪د┘┘ê┘è">╪س╪د┘┘ê┘è</SelectItem>
                      <SelectItem value="┘â┘à╪د┘┘è">┘â┘à╪د┘┘è</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>┘à┘╪د╪ص╪╕╪د╪ز</Label>
                <Input {...register("notes")} placeholder="╪ز┘╪د╪╡┘è┘ ╪ح╪╢╪د┘┘è╪ر..." />
              </div>
              <Button type="submit" className="w-full bg-primary text-primary-foreground">╪ص┘╪╕</Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-3">
        {expenses.length === 0 ? (
          <EmptyState icon={Receipt} message="┘╪د ╪ز┘ê╪ش╪» ┘à╪╡╪▒┘ê┘╪د╪ز ┘à╪│╪ش┘╪ر" />
        ) : (
          <>
            {expenses.map((exp) => (
              <div key={exp.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
                    <Receipt className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{exp.item}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="outline" className="text-[10px]">{exp.priority}</Badge>
                      {exp.notes && <span className="text-xs text-muted-foreground">{exp.notes}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground">{exp.amount.toLocaleString("ar-EG")} ╪ش.┘à</span>
                  <Button
                    variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => {
                      deleteExpense(family.id, exp.id);
                      toast.success("╪ز┘à ╪ص╪░┘ ╪د┘┘à╪╡╪▒┘ê┘");
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between items-center pt-1">
              <span className="font-semibold text-foreground">╪ح╪ش┘à╪د┘┘è ╪د┘┘à╪╡╪▒┘ê┘╪د╪ز</span>
              <span className="font-bold text-lg text-destructive">{totalExpenses.toLocaleString("ar-EG")} ╪ش.┘à</span>
            </div>
            <div className={`flex justify-between items-center p-3 rounded-xl border ${netBalance < 0 ? 'bg-destructive/5 border-destructive/20' : 'bg-primary/5 border-primary/20'}`}>
              <span className={`font-semibold flex items-center gap-1 ${netBalance < 0 ? 'text-destructive' : 'text-primary'}`}>
                {netBalance < 0 ? <AlertTriangle className="h-4 w-4" /> : <Wallet className="h-4 w-4" />}
                ╪د┘╪▒╪╡┘è╪» ╪د┘┘à╪ز╪ذ┘é┘è
              </span>
              <span className={`font-bold text-lg ${netBalance < 0 ? 'text-destructive' : 'text-primary'}`}>
                {Math.abs(netBalance).toLocaleString("ar-EG")} ╪ش.┘à {netBalance < 0 ? '(╪╣╪ش╪▓)' : '(┘╪د╪خ╪╢)'}
              </span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

/* ظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـ
   TAB 5: Medical Records + Add Form
   ظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـ */
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

  const { register, handleSubmit, setValue, watch, formState: { errors }, reset } = useForm({
    resolver: zodResolver(medicalSchema),
    defaultValues: {
      memberName: "", type: "┘à╪▒╪╢ ┘à╪▓┘à┘", condition: "", severity: "",
      disabilityClass: null, treatment: "", monthlyCost: 0,
      hospital: "", startDate: "", needsFollowup: true, notes: "",
    },
  });

  const recordType = watch("type");

  const onSubmit = async (data: any) => {
    if (!data.memberName) {
      toast.error("╪ذ╪▒╪ش╪د╪ة ╪د╪«╪ز┘è╪د╪▒ ┘ê╪د╪│┘à ╪د┘┘╪▒╪» ╪╡╪د╪ص╪ذ ╪د┘╪│╪ش┘ ╪د┘╪╖╪ذ┘è ╪ث┘ê┘╪د┘ï");
      return;
    }

    const severityObj = recordType === "╪ح╪╣╪د┘é╪ر"
      ? DISABILITY_CLASSES.find((d) => d.code === data.disabilityClass)
      : CHRONIC_SEVERITY.find((s) => s.code === data.severity);
    const matchedMember = members.find((m: any) => m.name === data.memberName);
    const personId = matchedMember?.id || family.id;
    try {
      await addMedicalRecord(family.id, personId, {
        ...data,
        severityScore: severityObj?.score || 0,
      });
      toast.success("╪ز┘à ╪ح╪╢╪د┘╪ر ╪د┘╪│╪ش┘ ╪د┘╪╖╪ذ┘è");
      reset();
      setOpen(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "┘╪┤┘ ╪ح╪╢╪د┘╪ر ╪د┘╪│╪ش┘ ╪د┘╪╖╪ذ┘è");
    }
  };

  const totalMedicalCost = records.reduce((s, r) => s + r.monthlyCost, 0);

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">╪د┘╪│╪ش┘ ╪د┘╪╖╪ذ┘è ({records.length})</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1"><Plus className="h-3.5 w-3.5" /> ╪ح╪╢╪د┘╪ر ╪│╪ش┘</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>╪ح╪╢╪د┘╪ر ╪│╪ش┘ ╪╖╪ذ┘è</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label>╪د╪│┘à ╪د┘┘╪▒╪»</Label>
                {members.length > 0 ? (
                  <Select onValueChange={(v) => setValue("memberName", v, { shouldValidate: true })}>
                    <SelectTrigger><SelectValue placeholder="╪د╪«╪ز╪▒ ╪د┘┘╪▒╪»" /></SelectTrigger>
                    <SelectContent>
                      {members.map((m) => <SelectItem key={m.id} value={m.name}>{m.name} ({m.relation})</SelectItem>)}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input {...register("memberName")} placeholder="╪د┘â╪ز╪ذ ╪د╪│┘à ╪د┘┘╪▒╪»" />
                )}
                {errors.memberName && <p className="text-xs text-destructive">{errors.memberName.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>┘┘ê╪╣ ╪د┘╪ص╪د┘╪ر</Label>
                  <Select defaultValue="┘à╪▒╪╢ ┘à╪▓┘à┘" onValueChange={(v) => setValue("type", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="┘à╪▒╪╢ ┘à╪▓┘à┘">┘à╪▒╪╢ ┘à╪▓┘à┘</SelectItem>
                      <SelectItem value="╪ح╪╣╪د┘é╪ر">╪ح╪╣╪د┘é╪ر</SelectItem>
                      <SelectItem value="╪ح╪╡╪د╪ذ╪ر ┘à╪ج┘é╪ز╪ر">╪ح╪╡╪د╪ذ╪ر ┘à╪ج┘é╪ز╪ر</SelectItem>
                      <SelectItem value="╪╣┘à┘┘è╪ر ╪ش╪▒╪د╪ص┘è╪ر">╪╣┘à┘┘è╪ر ╪ش╪▒╪د╪ص┘è╪ر</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>╪د╪│┘à ╪د┘┘à╪▒╪╢ / ╪د┘╪ص╪د┘╪ر</Label>
                  <Input {...register("condition")} placeholder="┘à╪س╪د┘: ╪│┘â╪▒┘è╪î ╪┤┘┘ ┘╪╡┘┘è..." />
                  {errors.condition && <p className="text-xs text-destructive">{errors.condition.message}</p>}
                </div>
              </div>

              {/* Severity selection based on type */}
              {recordType === "╪ح╪╣╪د┘é╪ر" ? (
                <div className="space-y-1.5">
                  <Label>╪ز╪╡┘┘è┘ ╪د┘╪ح╪╣╪د┘é╪ر</Label>
                  <Select onValueChange={(v) => {
                    setValue("disabilityClass", v);
                    setValue("severity", v, { shouldValidate: true });
                  }}>
                    <SelectTrigger><SelectValue placeholder="╪د╪«╪ز╪▒ ╪د┘┘╪خ╪ر" /></SelectTrigger>
                    <SelectContent>
                      {DISABILITY_CLASSES.map((d) => (
                        <SelectItem key={d.code} value={d.code}>
                          {t("profile.misc.tier", { code: d.code })} ظ¤ {t(`dictionaries.disability.${d.key}_label`)} (
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
                  <Label>╪»╪▒╪ش╪ر ╪د┘╪«╪╖┘ê╪▒╪ر</Label>
                  <Select onValueChange={(v) => setValue("severity", v, { shouldValidate: true })}>
                    <SelectTrigger><SelectValue placeholder="╪د╪«╪ز╪▒" /></SelectTrigger>
                    <SelectContent>
                      {CHRONIC_SEVERITY.map((s) => (
                        <SelectItem key={s.code} value={s.code}>
                          {t(`dictionaries.chronicSeverity.${s.key}`)} ({s.score} {t("profile.misc.points")}) ظ¤{" "}
                          {t(`dictionaries.chronicSeverity.${s.key}_desc`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.severity && <p className="text-xs text-destructive">{errors.severity.message}</p>}
                </div>
              )}

              <div className="space-y-1.5">
                <Label>╪د┘╪╣┘╪د╪ش ╪د┘╪ص╪د┘┘è</Label>
                <Input {...register("treatment")} placeholder="┘à╪س╪د┘: ╪ث┘╪│┘ê┘┘è┘ + ╪ث╪»┘ê┘è╪ر╪î ╪╣┘╪د╪ش ╪╖╪ذ┘è╪╣┘è..." />
                {errors.treatment && <p className="text-xs text-destructive">{errors.treatment.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>╪د┘╪ز┘â┘┘╪ر ╪د┘╪┤┘ç╪▒┘è╪ر (╪ش.┘à)</Label>
                  <Input type="number" {...register("monthlyCost")} min={0} dir="ltr" className="text-right" />
                </div>
                <div className="space-y-1.5">
                  <Label>╪ز╪د╪▒┘è╪« ╪د┘╪ذ╪»╪د┘è╪ر</Label>
                  <Input type="date" {...register("startDate")} dir="ltr" className="text-right" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>╪د┘┘à╪│╪ز╪┤┘┘ë / ╪د┘┘à┘â╪د┘</Label>
                <Input {...register("hospital")} placeholder="╪د╪│┘à ╪د┘┘à╪│╪ز╪┤┘┘ë ╪ث┘ê ╪د┘┘ê╪ص╪»╪ر ╪د┘╪╡╪ص┘è╪ر" />
              </div>

              <div className="flex items-center justify-between rounded-xl bg-secondary/50 p-3">
                <Label>┘è╪ص╪ز╪د╪ش ┘à╪ز╪د╪ذ╪╣╪ر ╪»┘ê╪▒┘è╪ر</Label>
                <Switch checked={watch("needsFollowup")} onCheckedChange={(v) => setValue("needsFollowup", v)} />
              </div>

              <div className="space-y-1.5">
                <Label>┘à┘╪د╪ص╪╕╪د╪ز</Label>
                <Textarea {...register("notes")} placeholder="┘à┘╪د╪ص╪╕╪د╪ز ╪ح╪╢╪د┘┘è╪ر..." rows={2} />
              </div>

              <Button type="submit" className="w-full bg-primary text-primary-foreground">╪ص┘╪╕ ╪د┘╪│╪ش┘</Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {records.length === 0 ? (
          <EmptyState icon={Stethoscope} message="┘╪د ╪ز┘ê╪ش╪» ╪│╪ش┘╪د╪ز ╪╖╪ذ┘è╪ر" />
        ) : (
          <div className="space-y-4">
            {records.map((record) => (
              <Card key={record.id} className="shadow-none border">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-foreground">{record.condition}</h4>
                      <p className="text-xs text-muted-foreground">{record.memberName} - {record.type}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className={
                        record.severity === "╪ص╪▒╪ش" || record.severity === "╪»"
                          ? "bg-destructive/12 text-destructive border-destructive/25"
                          : record.severity === "╪┤╪»┘è╪»" || record.severity === "╪ش"
                            ? "bg-warning/12 text-warning-foreground border-warning/25"
                            : record.severity === "┘à╪ز┘ê╪│╪╖" || record.severity === "╪ذ"
                              ? "bg-warning/8 text-warning-foreground border-warning/20"
                              : "bg-primary/12 text-primary border-primary/25"
                      }>
                        {record.type === "╪ح╪╣╪د┘é╪ر" ? `┘╪خ╪ر ${record.disabilityClass || record.severity}` : record.severity}
                        {record.severityScore ? ` (${record.severityScore})` : ""}
                      </Badge>
                      {record.needsFollowup && (
                        <Badge variant="outline" className="bg-chart-2/12 text-chart-2 border-chart-2/25 text-[10px]">
                          ┘à╪ز╪د╪ذ╪╣╪ر
                        </Badge>
                      )}
                      <Button
                        variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => {
                          deleteMedicalRecord(family.id, record.id);
                          toast.success("╪ز┘à ╪ص╪░┘ ╪د┘╪│╪ش┘");
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
                    <MiniField label="╪د┘╪╣┘╪د╪ش" value={record.treatment} />
                    <MiniField label="╪د┘╪ز┘â┘┘╪ر ╪د┘╪┤┘ç╪▒┘è╪ر" value={`${record.monthlyCost} ╪ش.┘à`} />
                    {record.hospital && <MiniField label="╪د┘┘à╪│╪ز╪┤┘┘ë" value={record.hospital} />}
                    {record.startDate && <MiniField label="╪ز╪د╪▒┘è╪« ╪د┘╪ذ╪»╪د┘è╪ر" value={record.startDate} />}
                  </div>
                  {record.notes && <p className="text-xs text-muted-foreground mt-2 bg-secondary/50 p-2 rounded-lg">{record.notes}</p>}
                </CardContent>
              </Card>
            ))}
            <Separator />
            <div className="flex justify-between items-center pt-1">
              <span className="font-semibold text-foreground">╪ح╪ش┘à╪د┘┘è ╪ز┘â┘┘╪ر ╪د┘╪╣┘╪د╪ش ╪د┘╪┤┘ç╪▒┘è╪ر</span>
              <span className="font-bold text-lg text-destructive">{totalMedicalCost.toLocaleString("ar-EG")} ╪ش.┘à</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـ
   TAB 6: Scoring / PMT Assessment
   ظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـ */
function ScoringTab({ family, totalIncome, totalExpenses, totalMedicalCost, netBalance }: any) {
  const [recalcLoading, setRecalcLoading] = useState(false);
  const fetchFamilyDetails = useFamiliesStore(state => state.fetchFamilyDetails);
  const members = Array.isArray(family.members) ? family.members : [];
  const records = Array.isArray(family.medicalRecords) ? family.medicalRecords : [];
  const vi = parseFloat(family.vulnerabilityIndex) || 0; // scale 0-10
  const t = useTranslations("families");

  const handleRecalculate = async () => {
    try {
      setRecalcLoading(true);
      const { default: api } = await import("@/lib/api");
      await api.post(`/v1/scoring/${family.id}/recalculate`);
      // Refresh family data to get new scoring
      await fetchFamilyDetails(family.id);
      const { toast } = await import("sonner");
      toast.success("╪ز┘à ╪ح╪╣╪د╪»╪ر ╪ص╪│╪د╪ذ ╪د┘╪ز┘é┘è┘è┘à ╪ذ┘╪ش╪د╪ص");
    } catch (err: any) {
      console.error("Recalculate error", err);
      const { toast } = await import("sonner");
      toast.error(err?.response?.data?.message || "┘╪┤┘ ╪ح╪╣╪د╪»╪ر ╪ص╪│╪د╪ذ ╪د┘╪ز┘é┘è┘è┘à");
    } finally {
      setRecalcLoading(false);
    }
  };

  // Calculate disability & chronic scores from members
  const disabilityScores = members
    .filter((m) => m.hasDisability && m.disabilityClass)
    .map((m) => {
      const cls = DISABILITY_CLASSES.find((d) => d.code === m.disabilityClass);
      return { name: m.name, score: cls?.score || 0, disabilityKey: cls?.key };
    });

  const chronicScores = members
    .filter((m) => m.hasChronicIllness && m.chronicSeverity)
    .map((m) => {
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
          <CardTitle className="text-lg">╪د┘┘à┘╪«╪╡ ╪د┘┘à╪د┘┘è</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <SummaryRow label="╪ح╪ش┘à╪د┘┘è ╪د┘╪»╪«┘ ╪د┘╪┤┘ç╪▒┘è" value={`${totalIncome.toLocaleString("ar-EG")} ╪ش.┘à`} color="text-primary" />
            <SummaryRow label="╪ح╪ش┘à╪د┘┘è ╪د┘┘à╪╡╪▒┘ê┘╪د╪ز" value={`${totalExpenses.toLocaleString("ar-EG")} ╪ش.┘à`} color="text-destructive" />
            <SummaryRow label="╪ز┘â┘┘╪ر ╪د┘╪╣┘╪د╪ش ╪د┘╪┤┘ç╪▒┘è╪ر" value={`${totalMedicalCost.toLocaleString("ar-EG")} ╪ش.┘à`} color="text-destructive" />
            <Separator />
            <SummaryRow
              label="╪د┘╪╡╪د┘┘è (╪╣╪ش╪▓ / ┘╪د╪خ╪╢)"
              value={`${Math.abs(netBalance).toLocaleString("ar-EG")} ╪ش.┘à ${netBalance < 0 ? '(╪╣╪ش╪▓)' : '(┘╪د╪خ╪╢)'}`}
              color={netBalance < 0 ? "text-destructive" : "text-primary"}
              bold
            />
            {family.monthlyAidAmount > 0 && (
              <SummaryRow label="╪د┘┘à╪│╪د╪╣╪»╪ر ╪د┘╪┤┘ç╪▒┘è╪ر ╪د┘┘à┘é╪▒╪▒╪ر" value={`${family.monthlyAidAmount} ╪ش.┘à`} color="text-primary" />
            )}
          </div>

          {/* Disability Scores */}
          {disabilityScores.length > 0 && (
            <>
              <Separator />
              <h4 className="text-sm font-semibold text-muted-foreground">┘┘é╪د╪╖ ╪د┘╪ح╪╣╪د┘é╪ر (┘à┘ ╪د┘╪ث┘╪▒╪د╪»)</h4>
              {disabilityScores.map((d, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {d.name} ظ¤{" "}
                    {d.disabilityKey ? t(`dictionaries.disability.${d.disabilityKey}_label`) : ""}
                  </span>
                  <span className="font-bold text-foreground">{d.score}</span>
                </div>
              ))}
              <SummaryRow label="╪ح╪ش┘à╪د┘┘è ┘┘é╪د╪╖ ╪د┘╪ح╪╣╪د┘é╪ر" value={memberDisabilityTotal.toFixed(1)} color="text-foreground" bold />
            </>
          )}

          {/* Chronic Scores */}
          {chronicScores.length > 0 && (
            <>
              <Separator />
              <h4 className="text-sm font-semibold text-muted-foreground">┘┘é╪د╪╖ ╪د┘╪ث┘à╪▒╪د╪╢ ╪د┘┘à╪▓┘à┘╪ر (┘à┘ ╪د┘╪ث┘╪▒╪د╪»)</h4>
              {chronicScores.map((c, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{c.name} - {c.illness}</span>
                  <span className="font-bold text-foreground">{c.score}</span>
                </div>
              ))}
              <SummaryRow label="╪ح╪ش┘à╪د┘┘è ┘┘é╪د╪╖ ╪د┘╪ث┘à╪▒╪د╪╢" value={memberChronicTotal.toFixed(1)} color="text-foreground" bold />
            </>
          )}

          {/* Medical records score */}
          {medicalScoreFromRecords > 0 && (
            <>
              <Separator />
              <SummaryRow label="┘┘é╪د╪╖ ╪د┘╪│╪ش┘╪د╪ز ╪د┘╪╖╪ذ┘è╪ر" value={medicalScoreFromRecords.toFixed(1)} color="text-foreground" bold />
            </>
          )}
        </CardContent>
      </Card>

      {/* Vulnerability Index */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">┘à╪ج╪┤╪▒ ╪د┘┘ç╪┤╪د╪┤╪ر ┘ê╪د┘╪ز╪╡┘┘è┘</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-foreground">┘à╪ج╪┤╪▒ ╪د┘┘ç╪┤╪د╪┤╪ر</span>
              <span className="text-2xl font-bold text-foreground">
                {Math.min(vi * 10, 100).toFixed(0)}%
              </span>
            </div>
            <div className="relative">
              <Progress value={Math.min(vi * 10, 100)} className="h-4 rounded-full" />
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>╪«╪د╪▒╪ش ╪د┘╪ث┘ê┘┘ê┘è╪ر (0%)</span>
              <span>┘à╪ز┘ê╪│╪╖ (15%)</span>
              <span>╪╢╪╣┘è┘ (30%)</span>
              <span>┘ç╪┤ (50%+)</span>
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
              {classificationLabelsMap[family.classification] || family.classification}
            </Badge>
            <p className="text-sm text-muted-foreground text-center max-w-xs leading-relaxed">
              {vi >= 8
                ? "┘ç╪░┘ç ╪د┘╪ث╪│╪▒╪ر ┘┘è ╪ص╪د╪ش╪ر ┘à╪د╪│╪ر ┘ê╪╣╪د╪ش┘╪ر ┘┘╪»╪╣┘à ╪د┘┘à╪د╪»┘è ┘ê╪د┘╪╣┘è┘┘è"
                : vi >= 5
                  ? "┘ç╪░┘ç ╪د┘╪ث╪│╪▒╪ر ┘ç╪┤╪ر ┘ê╪ز╪ص╪ز╪د╪ش ┘╪»╪╣┘à ┘à╪│╪ز┘à╪▒ ┘ê┘à╪ز╪د╪ذ╪╣╪ر ╪»┘ê╪▒┘è╪ر"
                  : vi >= 3
                    ? "┘ç╪░┘ç ╪د┘╪ث╪│╪▒╪ر ╪╢╪╣┘è┘╪ر ┘ê╪ز╪ص╪ز╪د╪ش ┘╪»╪╣┘à ┘ê┘à╪ز╪د╪ذ╪╣╪ر"
                    : vi >= 1.5
                      ? "┘ç╪░┘ç ╪د┘╪ث╪│╪▒╪ر ╪ز╪ص╪ز╪د╪ش ┘┘à╪│╪د╪╣╪»╪ر ┘à┘ê╪│┘à┘è╪ر ┘ê┘à╪ز╪د╪ذ╪╣╪ر"
                      : "┘ç╪░┘ç ╪د┘╪ث╪│╪▒╪ر ╪«╪د╪▒╪ش ╪د┘╪ث┘ê┘┘ê┘è╪ر ╪ص╪د┘┘è╪د┘ï"}
            </p>
          </div>

          {/* Aid Decision */}
          {family.aidDecision && (
            <>
              <Separator />
              <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">┘é╪▒╪د╪▒ ╪د┘┘à╪│╪د╪╣╪»╪ر</p>
                <p className="font-bold text-primary text-lg">{family.aidDecision}</p>
                {family.monthlyAidAmount > 0 && (
                  <p className="text-sm text-foreground mt-1">{family.monthlyAidAmount} ╪ش.┘à ╪┤┘ç╪▒┘è┘ï╪د</p>
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
              <><Loader2 className="h-4 w-4 animate-spin" /> ╪ش╪د╪▒┘è ╪ح╪╣╪د╪»╪ر ╪د┘╪ص╪│╪د╪ذ...</>
            ) : (
              <><BarChart3 className="h-4 w-4" /> ╪ح╪╣╪د╪»╪ر ╪ص╪│╪د╪ذ ╪د┘╪ز┘é┘è┘è┘à</>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

/* ظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـ
   Helper Components
   ظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـظـ */
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

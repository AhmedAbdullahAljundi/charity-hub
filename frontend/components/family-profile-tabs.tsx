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
import {
  useFamiliesStore,
  INCOME_SOURCES, EXPENSE_CATEGORIES, MEMBER_RELATIONS,
  EDUCATION_LEVELS, DISABILITY_CLASSES, CHRONIC_SEVERITY,
} from "@/lib/store";

/* ─────────── Classification Colors ─────────── */
/* Classification enum → Arabic labels */
const classificationLabelsMap: Record<string, string> = {
  VERY_FRAGILE: 'هش للغاية (حرج)',
  FRAGILE: 'هش للغاية',
  WEAK: 'ضعيف',
  MODERATE: 'متوسط',
  OUT_OF_PRIORITY: 'خارج الأولوية',
  // Arabic keys (for backward compat)
  'هش للغاية (حرج)': 'هش للغاية (حرج)',
  'هش للغاية': 'هش للغاية',
  'ضعيف': 'ضعيف',
  'متوسط': 'متوسط',
  'خارج الأولوية': 'خارج الأولوية',
};

const classificationColors: Record<string, string> = {
  // English enum keys
  VERY_FRAGILE: "bg-red-100 text-red-700 border-red-200",
  FRAGILE: "bg-red-100 text-red-700 border-red-200",
  WEAK: "bg-orange-100 text-orange-700 border-orange-200",
  MODERATE: "bg-blue-100 text-blue-700 border-blue-200",
  OUT_OF_PRIORITY: "bg-gray-100 text-gray-600 border-gray-200",
  // Arabic keys (backward compat)
  "هش للغاية (حرج)": "bg-red-100 text-red-700 border-red-200",
  "هش للغاية": "bg-red-100 text-red-700 border-red-200",
  "ضعيف": "bg-orange-100 text-orange-700 border-orange-200",
  "متوسط": "bg-blue-100 text-blue-700 border-blue-200",
  "خارج الأولوية": "bg-gray-100 text-gray-600 border-gray-200",
};

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════ */
export function FamilyProfileTabs({ family }) {
  // Support both 'income' (old local state) and 'incomes' (API response)
  const incomeList = family.incomes || family.income || [];
  const expenseList = family.expenses || [];
  const medicalList = family.medicalRecords || [];

  const totalIncome = incomeList.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);
  const totalExpenses = expenseList.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);
  const totalMedicalCost = medicalList.reduce((s, r) => s + (parseFloat(r.monthlyCost) || 0), 0);

  // الرصيد النهائي = الدخل - (المصروفات + العلاج)
  // إذا كان سالباً فهو عجز (احتياج)، وإذا كان موجباً فهو فائض.
  const netBalance = totalIncome - (totalExpenses + totalMedicalCost);

  return (
    <Tabs defaultValue="basic" className="space-y-4">
      <TabsList className="w-full justify-start overflow-x-auto flex-nowrap bg-card border border-border p-1 h-auto">
        <TabsTrigger value="basic" className="gap-1.5 text-xs sm:text-sm whitespace-nowrap">
          <User className="h-4 w-4" /> البيانات الأساسية
        </TabsTrigger>
        <TabsTrigger value="members" className="gap-1.5 text-xs sm:text-sm whitespace-nowrap">
          <Users className="h-4 w-4" /> الأفراد
        </TabsTrigger>
        <TabsTrigger value="income" className="gap-1.5 text-xs sm:text-sm whitespace-nowrap">
          <Wallet className="h-4 w-4" /> الدخل
        </TabsTrigger>
        <TabsTrigger value="expenses" className="gap-1.5 text-xs sm:text-sm whitespace-nowrap">
          <Receipt className="h-4 w-4" /> المصروفات
        </TabsTrigger>
        <TabsTrigger value="medical" className="gap-1.5 text-xs sm:text-sm whitespace-nowrap">
          <Stethoscope className="h-4 w-4" /> السجل الطبي
        </TabsTrigger>
        <TabsTrigger value="scoring" className="gap-1.5 text-xs sm:text-sm whitespace-nowrap">
          <BarChart3 className="h-4 w-4" /> نتيجة التقييم
        </TabsTrigger>
      </TabsList>

      {/* ─────── TAB 1: Basic Info ─────── */}
      <TabsContent value="basic">
        <BasicInfoTab family={family} />
      </TabsContent>

      {/* ─────── TAB 2: Members ─────── */}
      <TabsContent value="members">
        <MembersTab family={family} />
      </TabsContent>

      {/* ─────── TAB 3: Income ─────── */}
      <TabsContent value="income">
        <IncomeTab family={{ ...family, income: incomeList }} totalIncome={totalIncome} />
      </TabsContent>

      {/* ─────── TAB 4: Expenses ─────── */}
      <TabsContent value="expenses">
        <ExpensesTab family={{ ...family, expenses: expenseList }} totalExpenses={totalExpenses} netBalance={netBalance} />
      </TabsContent>

      {/* ─────── TAB 5: Medical ─────── */}
      <TabsContent value="medical">
        <MedicalTab family={{ ...family, medicalRecords: medicalList }} />
      </TabsContent>

      {/* ─────── TAB 6: Scoring ─────── */}
      <TabsContent value="scoring">
        <ScoringTab
          family={{ ...family, income: incomeList, medicalRecords: medicalList }}
          totalIncome={totalIncome}
          totalExpenses={totalExpenses}
          totalMedicalCost={totalMedicalCost}
          netBalance={netBalance}
        />
      </TabsContent>
    </Tabs>
  );
}

/* ═══════════════════════════════════════════════
   TAB 1: Basic Info
   ═══════════════════════════════════════════════ */
function BasicInfoTab({ family }) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">البيانات الأساسية</CardTitle>
        <div className="flex items-center gap-2">
          {family.dataVerified && (
            <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200 gap-1">
              <CheckCircle2 className="h-3 w-3" /> موثق
            </Badge>
          )}
          {family.fieldResearchDone && (
            <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 gap-1">
              <Shield className="h-3 w-3" /> بحث ميداني
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Personal Info */}
        <div>
          <h4 className="text-sm font-semibold text-muted-foreground mb-3">بيانات الأسرة</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <InfoField icon={User} label="اسم رب الأسرة" value={family.headName} />
            <InfoField icon={User} label="اسم الزوجة" value={family.wifeName || "---"} />
            <InfoField icon={CreditCard} label="الرقم القومي" value={family.nationalId} dir="ltr" />
            <InfoField icon={CreditCard} label="الرقم القومي للزوجة" value={family.wifeNationalId || "---"} dir="ltr" />
            <InfoField icon={Phone} label="الهاتف" value={family.phone} dir="ltr" />
            <InfoField icon={Phone} label="هاتف بديل" value={family.phone2 || "---"} dir="ltr" />
            <InfoField icon={MapPin} label="العنوان" value={family.address} />
            <InfoField icon={Calendar} label="تاريخ التسجيل" value={family.registrationDate} />
            <InfoField icon={Users} label="عدد الأفراد" value={`${Array.isArray(family.members) ? family.members.length : family.members || 0} أفراد`} />
          </div>
        </div>

        <Separator />

        {/* Financial Info */}
        <div>
          <h4 className="text-sm font-semibold text-muted-foreground mb-3">البيانات المالية والإدارية</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <InfoField icon={CreditCard} label="رقم بطاقة ميزة" value={family.meezaCard || "لم يتم التسجيل"} dir="ltr" />
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <FileText className="h-3 w-3" /> تصنيف الحالة
              </p>
              <Badge variant="outline" className={classificationColors[family.classification] || ""}>
                {classificationLabelsMap[family.classification] || family.classification}
              </Badge>
            </div>
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Heart className="h-3 w-3" /> نوع الحالة
              </p>
              <Badge variant="secondary">{{
                NEEDY: 'محتاج',
                ORPHAN: 'يتيم',
                WIDOW: 'أرملة',
                DIVORCED: 'مطلقة',
                DISABLED: 'إعاقة',
                ELDERLY: 'كبار سن',
                CHRONIC_ILLNESS: 'أمراض مزمنة',
                PRISONER_FAMILY: 'أسر سجناء',
                STUDENT: 'طالب علم',
                OTHER: 'أخرى',
              }[family.category] || family.category}</Badge>
            </div>
            <InfoField icon={FileText} label="سبب التصنيف" value={family.categoryReason || "---"} />
            <InfoField icon={HandCoins} label="قرار المساعدة" value={family.aidDecision || "---"} />
            <InfoField icon={HandCoins} label="مبلغ المساعدة الشهرية" value={family.monthlyAidAmount ? `${family.monthlyAidAmount} ج.م` : "---"} />
          </div>
        </div>

        {/* Field Research Notes */}
        {family.fieldResearchNotes && (
          <>
            <Separator />
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground mb-2">ملاحظات البحث الميداني</h4>
              <p className="text-sm text-foreground bg-secondary/50 p-3 rounded-xl leading-relaxed">{family.fieldResearchNotes}</p>
            </div>
          </>
        )}

        {family.notes && (
          <>
            <Separator />
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground mb-2">ملاحظات عامة</h4>
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
const memberSchema = z.object({
  name: z.string().min(3, "الاسم مطلوب (3 أحرف على الأقل)"),
  nationalId: z.string().optional().refine(
    (val) => !val || (val.length === 14 && /^\d+$/.test(val)),
    "الرقم القومي يجب أن يكون 14 رقم"
  ),
  relation: z.string().min(1, "اختر صلة القرابة"),
  birthDate: z.string().min(1, "تاريخ الميلاد مطلوب"),
  gender: z.string().min(1, "اختر النوع"),
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

function MembersTab({ family }) {
  const [open, setOpen] = useState(false);
  const members = Array.isArray(family.members) ? family.members : [];
  const { addMember, deleteMember } = useFamiliesStore();

  const {
    register, handleSubmit, setValue, watch, formState: { errors }, reset,
  } = useForm({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      name: "", nationalId: "", relation: "", birthDate: "", gender: "ذكر",
      education: "", job: "", jobIncome: 0, maritalStatus: "",
      hasDisability: false, disabilityClass: null, disabilityDescription: "",
      hasChronicIllness: false, chronicIllness: "", chronicSeverity: null, notes: "",
    },
  });

  const hasDisability = watch("hasDisability");
  const hasChronicIllness = watch("hasChronicIllness");

  const onSubmit = (data) => {
    const birthYear = new Date(data.birthDate).getFullYear();
    const age = new Date().getFullYear() - birthYear;
    addMember(family.id, { ...data, age });
    toast.success("تم إضافة الفرد بنجاح");
    reset();
    setOpen(false);
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">أفراد الأسرة ({members.length})</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1"><Plus className="h-3.5 w-3.5" /> إضافة فرد</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>إضافة فرد جديد</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>الاسم الكامل *</Label>
                  <Input {...register("name")} placeholder="الاسم الرباعي" />
                  {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>الرقم القومي</Label>
                  <Input {...register("nationalId")} placeholder="14 رقم" dir="ltr" className="text-right" />
                  {errors.nationalId && <p className="text-xs text-destructive">{errors.nationalId.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label>صلة القرابة *</Label>
                  <Select onValueChange={(v) => setValue("relation", v, { shouldValidate: true })}>
                    <SelectTrigger><SelectValue placeholder="اختر" /></SelectTrigger>
                    <SelectContent>
                      {MEMBER_RELATIONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {errors.relation && <p className="text-xs text-destructive">{errors.relation.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>تاريخ الميلاد *</Label>
                  <Input type="date" {...register("birthDate")} dir="ltr" className="text-right" />
                  {errors.birthDate && <p className="text-xs text-destructive">{errors.birthDate.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>النوع *</Label>
                  <Select defaultValue="ذكر" onValueChange={(v) => setValue("gender", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ذكر">ذكر</SelectItem>
                      <SelectItem value="أنثى">أنثى</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label>المستوى التعليمي</Label>
                  <Select onValueChange={(v) => setValue("education", v, { shouldValidate: true })}>
                    <SelectTrigger><SelectValue placeholder="اختر" /></SelectTrigger>
                    <SelectContent>
                      {EDUCATION_LEVELS.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {errors.education && <p className="text-xs text-destructive">{errors.education.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>الوظيفة / العمل</Label>
                  <Input {...register("job")} placeholder="طالب، عامل يومي، ربة منزل..." />
                  {errors.job && <p className="text-xs text-destructive">{errors.job.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>دخل العمل (ج.م)</Label>
                  <Input type="number" {...register("jobIncome")} min={0} dir="ltr" className="text-right" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>الحالة الاجتماعية</Label>
                <Select onValueChange={(v) => setValue("maritalStatus", v, { shouldValidate: true })}>
                  <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="اختر" /></SelectTrigger>
                  <SelectContent>
                    {["أعزب", "متزوج", "متزوجة", "مطلق", "مطلقة", "أرمل", "أرملة", "غير متزوجة"].map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.maritalStatus && <p className="text-xs text-destructive">{errors.maritalStatus.message}</p>}
              </div>

              <Separator />

              {/* Disability Section */}
              <div className="space-y-3 rounded-xl bg-secondary/50 p-4">
                <div className="flex items-center justify-between">
                  <Label className="font-medium">هل يعاني من إعاقة؟</Label>
                  <Switch checked={hasDisability} onCheckedChange={(v) => setValue("hasDisability", v)} />
                </div>
                {hasDisability && (
                  <div className="space-y-3 pt-2">
                    <div className="space-y-1.5">
                      <Label>تصنيف الإعاقة</Label>
                      <Select onValueChange={(v) => setValue("disabilityClass", v)}>
                        <SelectTrigger><SelectValue placeholder="اختر الفئة" /></SelectTrigger>
                        <SelectContent>
                          {DISABILITY_CLASSES.map((d) => (
                            <SelectItem key={d.code} value={d.code}>
                              <span className="font-medium">فئة {d.code}</span> - {d.label} ({d.score} نقطة)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {DISABILITY_CLASSES.map((d) =>
                        watch("disabilityClass") === d.code ? (
                          <p key={d.code} className="text-[11px] text-muted-foreground">{d.description}</p>
                        ) : null
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label>وصف الإعاقة</Label>
                      <Textarea {...register("disabilityDescription")} placeholder="وصف تفصيلي للإعاقة..." rows={2} />
                    </div>
                  </div>
                )}
              </div>

              {/* Chronic Illness Section */}
              <div className="space-y-3 rounded-xl bg-secondary/50 p-4">
                <div className="flex items-center justify-between">
                  <Label className="font-medium">هل يعاني من مرض مزمن؟</Label>
                  <Switch checked={hasChronicIllness} onCheckedChange={(v) => setValue("hasChronicIllness", v)} />
                </div>
                {hasChronicIllness && (
                  <div className="space-y-3 pt-2">
                    <div className="space-y-1.5">
                      <Label>اسم المرض</Label>
                      <Input {...register("chronicIllness")} placeholder="مثال: سكري، ضغط دم، قلب..." />
                    </div>
                    <div className="space-y-1.5">
                      <Label>درجة الخطورة</Label>
                      <Select onValueChange={(v) => setValue("chronicSeverity", v)}>
                        <SelectTrigger><SelectValue placeholder="اختر" /></SelectTrigger>
                        <SelectContent>
                          {CHRONIC_SEVERITY.map((s) => (
                            <SelectItem key={s.code} value={s.code}>
                              {s.code} ({s.score} نقطة) - {s.description}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <Label>ملاحظات</Label>
                <Textarea {...register("notes")} placeholder="ملاحظات إضافية..." rows={2} />
              </div>

              <Button type="submit" className="w-full bg-primary text-primary-foreground">حفظ الفرد</Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {members.length === 0 ? (
          <EmptyState icon={Users} message="لا يوجد أفراد مسجلون بعد" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {members.map((member) => (
              <Card key={member.id} className="shadow-none border">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-foreground">{member.name}</h4>
                      <p className="text-xs text-muted-foreground">{member.relation} - {member.age} سنة</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {member.hasDisability && (
                        <Badge variant="outline" className="bg-purple-50 text-purple-600 border-purple-200 text-[10px]">
                          إعاقة {member.disabilityClass}
                        </Badge>
                      )}
                      {member.hasChronicIllness && (
                        <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 text-[10px]">
                          مرض مزمن
                        </Badge>
                      )}
                      <Button
                        variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => {
                          deleteMember(family.id, member.id);
                          toast.success("تم حذف الفرد");
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
                    <MiniField label="الرقم القومي" value={member.nationalId} dir="ltr" />
                    <MiniField label="النوع" value={member.gender} />
                    <MiniField label="التعليم" value={member.education} />
                    <MiniField label="العمل" value={member.job} />
                    <MiniField label="دخل العمل" value={member.jobIncome > 0 ? `${member.jobIncome} ج.م` : "بدون دخل"} />
                    <MiniField label="الحالة الاجتماعية" value={member.maritalStatus} />
                    {member.hasDisability && (
                      <MiniField label="تفاصيل الإعاقة" value={member.disabilityDescription || `فئة ${member.disabilityClass}`} />
                    )}
                    {member.hasChronicIllness && (
                      <MiniField label="المرض المزمن" value={`${member.chronicIllness} (${member.chronicSeverity})`} />
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
const incomeSchema = z.object({
  source: z.string().min(1, "اختر مصدر الدخل"),
  amount: z.coerce.number().min(1, "المبلغ مطلوب"),
  frequency: z.string().min(1, "اختر التكرار"),
  verified: z.boolean(),
  notes: z.string().optional(),
});

function IncomeTab({ family, totalIncome }) {
  const [open, setOpen] = useState(false);
  const { addIncome, deleteIncome } = useFamiliesStore();
  const incomes = family.income || [];

  const { register, handleSubmit, setValue, watch, formState: { errors }, reset } = useForm({
    resolver: zodResolver(incomeSchema),
    defaultValues: { source: "", amount: 0, frequency: "شهري", verified: false, notes: "" },
  });

  const onSubmit = async (data: any) => {
    try {
      await addIncome(family.id, data);
      toast.success("تم إضافة مصدر الدخل");
      reset();
      setOpen(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "فشل إضافة مصدر الدخل");
    }
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">مصادر الدخل ({incomes.length})</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1"><Plus className="h-3.5 w-3.5" /> إضافة دخل</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>إضافة مصدر دخل</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label>مصدر الدخل *</Label>
                <Select onValueChange={(v) => setValue("source", v, { shouldValidate: true })}>
                  <SelectTrigger><SelectValue placeholder="اختر المصدر" /></SelectTrigger>
                  <SelectContent>
                    {INCOME_SOURCES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.source && <p className="text-xs text-destructive">{errors.source.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>المبلغ (ج.م) *</Label>
                  <Input type="number" {...register("amount")} min={0} dir="ltr" className="text-right" />
                  {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>التكرار</Label>
                  <Select defaultValue="شهري" onValueChange={(v) => setValue("frequency", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="شهري">شهري</SelectItem>
                      <SelectItem value="يومي">يومي</SelectItem>
                      <SelectItem value="أسبوعي">أسبوعي</SelectItem>
                      <SelectItem value="موسمي">موسمي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-secondary/50 p-3">
                <Label>موثق (تم التحقق)</Label>
                <Switch checked={watch("verified")} onCheckedChange={(v) => setValue("verified", v)} />
              </div>
              <div className="space-y-1.5">
                <Label>ملاحظات</Label>
                <Input {...register("notes")} placeholder="مثال: رقم بطاقة، اسم الجهة..." />
              </div>
              <Button type="submit" className="w-full bg-primary text-primary-foreground">حفظ</Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-3">
        {incomes.length === 0 ? (
          <EmptyState icon={Wallet} message="لا توجد مصادر دخل مسجلة" />
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
                  <span className="font-bold text-foreground">{inc.amount.toLocaleString("ar-EG")} ج.م</span>
                  {inc.verified ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-muted-foreground/40" />
                  )}
                  <Button
                    variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => {
                      deleteIncome(family.id, inc.id);
                      toast.success("تم حذف مصدر الدخل");
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between items-center pt-1">
              <span className="font-semibold text-foreground">إجمالي الدخل الشهري</span>
              <span className="font-bold text-lg text-primary">{totalIncome.toLocaleString("ar-EG")} ج.م</span>
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
const expenseSchema = z.object({
  item: z.string().min(1, "اختر بند المصروف"),
  amount: z.coerce.number().min(1, "المبلغ مطلوب"),
  priority: z.string().min(1, "اختر الأولوية"),
  notes: z.string().optional(),
});

function ExpensesTab({ family, totalExpenses, netBalance }: any) {
  const [open, setOpen] = useState(false);
  const { addExpense, deleteExpense } = useFamiliesStore();
  const expenses = family.expenses || [];

  const { register, handleSubmit, setValue, formState: { errors }, reset } = useForm({
    resolver: zodResolver(expenseSchema),
    defaultValues: { item: "", amount: 0, priority: "أساسي", notes: "" },
  });

  const onSubmit = async (data: any) => {
    try {
      await addExpense(family.id, data);
      toast.success("تم إضافة المصروف");
      reset();
      setOpen(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "فشل إضافة المصروف");
    }
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">المصروفات الشهرية ({expenses.length})</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1"><Plus className="h-3.5 w-3.5" /> إضافة مصروف</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>إضافة مصروف</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label>بند المصروف *</Label>
                <Select onValueChange={(v) => setValue("item", v, { shouldValidate: true })}>
                  <SelectTrigger><SelectValue placeholder="اختر البند" /></SelectTrigger>
                  <SelectContent>
                    {EXPENSE_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.item && <p className="text-xs text-destructive">{errors.item.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>المبلغ (ج.م) *</Label>
                  <Input type="number" {...register("amount")} min={0} dir="ltr" className="text-right" />
                  {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>الأولوية</Label>
                  <Select defaultValue="أساسي" onValueChange={(v) => setValue("priority", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="أساسي">أساسي</SelectItem>
                      <SelectItem value="ثانوي">ثانوي</SelectItem>
                      <SelectItem value="كمالي">كمالي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>ملاحظات</Label>
                <Input {...register("notes")} placeholder="تفاصيل إضافية..." />
              </div>
              <Button type="submit" className="w-full bg-primary text-primary-foreground">حفظ</Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-3">
        {expenses.length === 0 ? (
          <EmptyState icon={Receipt} message="لا توجد مصروفات مسجلة" />
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
                  <span className="font-bold text-foreground">{exp.amount.toLocaleString("ar-EG")} ج.م</span>
                  <Button
                    variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => {
                      deleteExpense(family.id, exp.id);
                      toast.success("تم حذف المصروف");
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between items-center pt-1">
              <span className="font-semibold text-foreground">إجمالي المصروفات</span>
              <span className="font-bold text-lg text-destructive">{totalExpenses.toLocaleString("ar-EG")} ج.م</span>
            </div>
            <div className={`flex justify-between items-center p-3 rounded-xl border ${netBalance < 0 ? 'bg-destructive/5 border-destructive/20' : 'bg-primary/5 border-primary/20'}`}>
              <span className={`font-semibold flex items-center gap-1 ${netBalance < 0 ? 'text-destructive' : 'text-primary'}`}>
                {netBalance < 0 ? <AlertTriangle className="h-4 w-4" /> : <Wallet className="h-4 w-4" />}
                الرصيد المتبقي
              </span>
              <span className={`font-bold text-lg ${netBalance < 0 ? 'text-destructive' : 'text-primary'}`}>
                {Math.abs(netBalance).toLocaleString("ar-EG")} ج.م {netBalance < 0 ? '(عجز)' : '(فائض)'}
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
  const { addMedicalRecord, deleteMedicalRecord } = useFamiliesStore();
  const records = family.medicalRecords || [];
  const members = family.members || [];

  const { register, handleSubmit, setValue, watch, formState: { errors }, reset } = useForm({
    resolver: zodResolver(medicalSchema),
    defaultValues: {
      memberName: "", type: "مرض مزمن", condition: "", severity: "",
      disabilityClass: null, treatment: "", monthlyCost: 0,
      hospital: "", startDate: "", needsFollowup: true, notes: "",
    },
  });

  const recordType = watch("type");

  const onSubmit = async (data: any) => {
    if (!data.memberName) {
      toast.error("برجاء اختيار واسم الفرد صاحب السجل الطبي أولاً");
      return;
    }

    const severityObj = recordType === "إعاقة"
      ? DISABILITY_CLASSES.find((d) => d.code === data.disabilityClass)
      : CHRONIC_SEVERITY.find((s) => s.code === data.severity);
    const matchedMember = members.find((m: any) => m.name === data.memberName);
    const personId = matchedMember?.id || family.id;
    try {
      await addMedicalRecord(family.id, personId, {
        ...data,
        severityScore: severityObj?.score || 0,
      });
      toast.success("تم إضافة السجل الطبي");
      reset();
      setOpen(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "فشل إضافة السجل الطبي");
    }
  };

  const totalMedicalCost = records.reduce((s, r) => s + r.monthlyCost, 0);

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">السجل الطبي ({records.length})</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1"><Plus className="h-3.5 w-3.5" /> إضافة سجل</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>إضافة سجل طبي</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label>اسم الفرد</Label>
                {members.length > 0 ? (
                  <Select onValueChange={(v) => setValue("memberName", v, { shouldValidate: true })}>
                    <SelectTrigger><SelectValue placeholder="اختر الفرد" /></SelectTrigger>
                    <SelectContent>
                      {members.map((m) => <SelectItem key={m.id} value={m.name}>{m.name} ({m.relation})</SelectItem>)}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input {...register("memberName")} placeholder="اكتب اسم الفرد" />
                )}
                {errors.memberName && <p className="text-xs text-destructive">{errors.memberName.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>نوع الحالة</Label>
                  <Select defaultValue="مرض مزمن" onValueChange={(v) => setValue("type", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="مرض مزمن">مرض مزمن</SelectItem>
                      <SelectItem value="إعاقة">إعاقة</SelectItem>
                      <SelectItem value="إصابة مؤقتة">إصابة مؤقتة</SelectItem>
                      <SelectItem value="عملية جراحية">عملية جراحية</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>اسم المرض / الحالة</Label>
                  <Input {...register("condition")} placeholder="مثال: سكري، شلل نصفي..." />
                  {errors.condition && <p className="text-xs text-destructive">{errors.condition.message}</p>}
                </div>
              </div>

              {/* Severity selection based on type */}
              {recordType === "إعاقة" ? (
                <div className="space-y-1.5">
                  <Label>تصنيف الإعاقة</Label>
                  <Select onValueChange={(v) => {
                    setValue("disabilityClass", v);
                    setValue("severity", v, { shouldValidate: true });
                  }}>
                    <SelectTrigger><SelectValue placeholder="اختر الفئة" /></SelectTrigger>
                    <SelectContent>
                      {DISABILITY_CLASSES.map((d) => (
                        <SelectItem key={d.code} value={d.code}>
                          فئة {d.code} - {d.label} ({d.score} نقطة)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {DISABILITY_CLASSES.map((d) =>
                    watch("disabilityClass") === d.code ? (
                      <p key={d.code} className="text-[11px] text-muted-foreground bg-secondary/50 p-2 rounded-lg">{d.description}</p>
                    ) : null
                  )}
                  {errors.severity && <p className="text-xs text-destructive">{errors.severity.message}</p>}
                </div>
              ) : (
                <div className="space-y-1.5">
                  <Label>درجة الخطورة</Label>
                  <Select onValueChange={(v) => setValue("severity", v, { shouldValidate: true })}>
                    <SelectTrigger><SelectValue placeholder="اختر" /></SelectTrigger>
                    <SelectContent>
                      {CHRONIC_SEVERITY.map((s) => (
                        <SelectItem key={s.code} value={s.code}>
                          {s.code} ({s.score} نقطة) - {s.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.severity && <p className="text-xs text-destructive">{errors.severity.message}</p>}
                </div>
              )}

              <div className="space-y-1.5">
                <Label>العلاج الحالي</Label>
                <Input {...register("treatment")} placeholder="مثال: أنسولين + أدوية، علاج طبيعي..." />
                {errors.treatment && <p className="text-xs text-destructive">{errors.treatment.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>التكلفة الشهرية (ج.م)</Label>
                  <Input type="number" {...register("monthlyCost")} min={0} dir="ltr" className="text-right" />
                </div>
                <div className="space-y-1.5">
                  <Label>تاريخ البداية</Label>
                  <Input type="date" {...register("startDate")} dir="ltr" className="text-right" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>المستشفى / المكان</Label>
                <Input {...register("hospital")} placeholder="اسم المستشفى أو الوحدة الصحية" />
              </div>

              <div className="flex items-center justify-between rounded-xl bg-secondary/50 p-3">
                <Label>يحتاج متابعة دورية</Label>
                <Switch checked={watch("needsFollowup")} onCheckedChange={(v) => setValue("needsFollowup", v)} />
              </div>

              <div className="space-y-1.5">
                <Label>ملاحظات</Label>
                <Textarea {...register("notes")} placeholder="ملاحظات إضافية..." rows={2} />
              </div>

              <Button type="submit" className="w-full bg-primary text-primary-foreground">حفظ السجل</Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {records.length === 0 ? (
          <EmptyState icon={Stethoscope} message="لا توجد سجلات طبية" />
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
                        record.severity === "حرج" || record.severity === "د"
                          ? "bg-red-50 text-red-600 border-red-200"
                          : record.severity === "شديد" || record.severity === "ج"
                            ? "bg-orange-50 text-orange-600 border-orange-200"
                            : record.severity === "متوسط" || record.severity === "ب"
                              ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                              : "bg-blue-50 text-blue-600 border-blue-200"
                      }>
                        {record.type === "إعاقة" ? `فئة ${record.disabilityClass || record.severity}` : record.severity}
                        {record.severityScore ? ` (${record.severityScore})` : ""}
                      </Badge>
                      {record.needsFollowup && (
                        <Badge variant="outline" className="bg-purple-50 text-purple-600 border-purple-200 text-[10px]">
                          متابعة
                        </Badge>
                      )}
                      <Button
                        variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => {
                          deleteMedicalRecord(family.id, record.id);
                          toast.success("تم حذف السجل");
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
                    <MiniField label="العلاج" value={record.treatment} />
                    <MiniField label="التكلفة الشهرية" value={`${record.monthlyCost} ج.م`} />
                    {record.hospital && <MiniField label="المستشفى" value={record.hospital} />}
                    {record.startDate && <MiniField label="تاريخ البداية" value={record.startDate} />}
                  </div>
                  {record.notes && <p className="text-xs text-muted-foreground mt-2 bg-secondary/50 p-2 rounded-lg">{record.notes}</p>}
                </CardContent>
              </Card>
            ))}
            <Separator />
            <div className="flex justify-between items-center pt-1">
              <span className="font-semibold text-foreground">إجمالي تكلفة العلاج الشهرية</span>
              <span className="font-bold text-lg text-destructive">{totalMedicalCost.toLocaleString("ar-EG")} ج.م</span>
            </div>
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
  const { fetchFamilyDetails } = useFamiliesStore();
  const members = Array.isArray(family.members) ? family.members : [];
  const records = Array.isArray(family.medicalRecords) ? family.medicalRecords : [];
  const vi = parseFloat(family.vulnerabilityIndex) || 0; // scale 0-10

  const handleRecalculate = async () => {
    try {
      setRecalcLoading(true);
      const { default: api } = await import("@/lib/api");
      await api.post(`/v1/scoring/${family.id}/recalculate`);
      // Refresh family data to get new scoring
      await fetchFamilyDetails(family.id);
      const { toast } = await import("sonner");
      toast.success("تم إعادة حساب التقييم بنجاح");
    } catch (err: any) {
      console.error("Recalculate error", err);
      const { toast } = await import("sonner");
      toast.error(err?.response?.data?.message || "فشل إعادة حساب التقييم");
    } finally {
      setRecalcLoading(false);
    }
  };

  // Calculate disability & chronic scores from members
  const disabilityScores = members
    .filter((m) => m.hasDisability && m.disabilityClass)
    .map((m) => {
      const cls = DISABILITY_CLASSES.find((d) => d.code === m.disabilityClass);
      return { name: m.name, score: cls?.score || 0, label: cls?.label || "" };
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
          <CardTitle className="text-lg">الملخص المالي</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <SummaryRow label="إجمالي الدخل الشهري" value={`${totalIncome.toLocaleString("ar-EG")} ج.م`} color="text-primary" />
            <SummaryRow label="إجمالي المصروفات" value={`${totalExpenses.toLocaleString("ar-EG")} ج.م`} color="text-destructive" />
            <SummaryRow label="تكلفة العلاج الشهرية" value={`${totalMedicalCost.toLocaleString("ar-EG")} ج.م`} color="text-destructive" />
            <Separator />
            <SummaryRow
              label="الصافي (عجز / فائض)"
              value={`${Math.abs(netBalance).toLocaleString("ar-EG")} ج.م ${netBalance < 0 ? '(عجز)' : '(فائض)'}`}
              color={netBalance < 0 ? "text-destructive" : "text-primary"}
              bold
            />
            {family.monthlyAidAmount > 0 && (
              <SummaryRow label="المساعدة الشهرية المقررة" value={`${family.monthlyAidAmount} ج.م`} color="text-primary" />
            )}
          </div>

          {/* Disability Scores */}
          {disabilityScores.length > 0 && (
            <>
              <Separator />
              <h4 className="text-sm font-semibold text-muted-foreground">نقاط الإعاقة (من الأفراد)</h4>
              {disabilityScores.map((d, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{d.name} - {d.label}</span>
                  <span className="font-bold text-foreground">{d.score}</span>
                </div>
              ))}
              <SummaryRow label="إجمالي نقاط الإعاقة" value={memberDisabilityTotal.toFixed(1)} color="text-foreground" bold />
            </>
          )}

          {/* Chronic Scores */}
          {chronicScores.length > 0 && (
            <>
              <Separator />
              <h4 className="text-sm font-semibold text-muted-foreground">نقاط الأمراض المزمنة (من الأفراد)</h4>
              {chronicScores.map((c, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{c.name} - {c.illness}</span>
                  <span className="font-bold text-foreground">{c.score}</span>
                </div>
              ))}
              <SummaryRow label="إجمالي نقاط الأمراض" value={memberChronicTotal.toFixed(1)} color="text-foreground" bold />
            </>
          )}

          {/* Medical records score */}
          {medicalScoreFromRecords > 0 && (
            <>
              <Separator />
              <SummaryRow label="نقاط السجلات الطبية" value={medicalScoreFromRecords.toFixed(1)} color="text-foreground" bold />
            </>
          )}
        </CardContent>
      </Card>

      {/* Vulnerability Index */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">مؤشر الهشاشة والتصنيف</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-foreground">مؤشر الهشاشة</span>
              <span className="text-2xl font-bold text-foreground">
                {Math.min(vi * 10, 100).toFixed(0)}%
              </span>
            </div>
            <div className="relative">
              <Progress value={Math.min(vi * 10, 100)} className="h-4 rounded-full" />
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>خارج الأولوية (0%)</span>
              <span>متوسط (15%)</span>
              <span>ضعيف (30%)</span>
              <span>هش (50%+)</span>
            </div>
          </div>

          {/* Visual Classification */}
          <div className="flex flex-col items-center justify-center py-6 gap-4">
            <div
              className={`h-28 w-28 rounded-full flex items-center justify-center border-4 ${vi >= 8
                ? "border-red-400 bg-red-50"
                : vi >= 5
                  ? "border-red-300 bg-red-50"
                  : vi >= 3
                    ? "border-orange-400 bg-orange-50"
                    : vi >= 1.5
                      ? "border-blue-400 bg-blue-50"
                      : "border-gray-300 bg-gray-50"
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
                ? "هذه الأسرة في حاجة ماسة وعاجلة للدعم المادي والعيني"
                : vi >= 5
                  ? "هذه الأسرة هشة وتحتاج لدعم مستمر ومتابعة دورية"
                  : vi >= 3
                    ? "هذه الأسرة ضعيفة وتحتاج لدعم ومتابعة"
                    : vi >= 1.5
                      ? "هذه الأسرة تحتاج لمساعدة موسمية ومتابعة"
                      : "هذه الأسرة خارج الأولوية حالياً"}
            </p>
          </div>

          {/* Aid Decision */}
          {family.aidDecision && (
            <>
              <Separator />
              <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">قرار المساعدة</p>
                <p className="font-bold text-primary text-lg">{family.aidDecision}</p>
                {family.monthlyAidAmount > 0 && (
                  <p className="text-sm text-foreground mt-1">{family.monthlyAidAmount} ج.م شهريًا</p>
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
              <><Loader2 className="h-4 w-4 animate-spin" /> جاري إعادة الحساب...</>
            ) : (
              <><BarChart3 className="h-4 w-4" /> إعادة حساب التقييم</>
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
    <div>
      <span className="text-muted-foreground text-xs">{label}: </span>
      <span className="text-foreground text-sm" dir={dir}>{value}</span>
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

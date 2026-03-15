"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useFamiliesStore, CASE_CATEGORIES, AID_DECISIONS } from "@/lib/store";
import api from "@/lib/api";
import { Loader2, User, Phone, MapPin, CreditCard, FileText, HandCoins } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const familySchema = z.object({
  headName: z.string().min(3, "يجب أن يكون الاسم 3 أحرف على الأقل"),
  wifeName: z.string().optional(),
  nationalId: z
    .string()
    .length(14, "الرقم القومي يجب أن يكون 14 رقم")
    .regex(/^\d+$/, "الرقم القومي يجب أن يحتوي على أرقام فقط"),
  wifeNationalId: z.string().optional().refine(
    (val) => !val || (val.length === 14 && /^\d+$/.test(val)),
    "الرقم القومي يجب أن يكون 14 رقم"
  ),
  phone: z
    .string()
    .min(11, "رقم الهاتف يجب أن يكون 11 رقم")
    .regex(/^01[0125]\d{8}$/, "رقم هاتف غير صحيح"),
  phone2: z.string().optional().refine(
    (val) => !val || /^01[0125]\d{8}$/.test(val),
    "رقم هاتف غير صحيح"
  ),
  address: z.string().min(5, "يجب إدخال العنوان بالتفصيل"),
  housingType: z.string().min(1, "يجب اختيار نوع السكن"),
  meezaCard: z.string().optional().refine(
    (val) => !val || (val.length >= 16 && /^\d+$/.test(val)),
    "رقم بطاقة ميزة يجب أن يكون 16 رقم على الأقل"
  ),
  category: z.string().min(1, "يجب اختيار تصنيف الحالة"),
  categoryReason: z.string().min(5, "يجب كتابة سبب التصنيف"),
  aidDecision: z.string().min(1, "يجب اختيار نوع المساعدة"),
  monthlyAidAmount: z.coerce.number().min(0, "المبلغ يجب أن يكون 0 أو أكثر").max(9999, "المبلغ لا يتجاوز 4 أرقام"),
  pdfName: z.string().optional(),
  notes: z.string().optional(),
  fieldResearchDone: z.boolean().optional(),
  dataVerified: z.boolean().optional(),
});

const HOUSING_TYPES = [
  { value: "RENT", label: "إيجار" },
  { value: "OWNED", label: "تمليك" },
  { value: "SHARED", label: "مشترك / عائلة" },
];

type FamilyFormValues = z.infer<typeof familySchema>;

export function AddFamilyForm({ onSuccess, initialData }: { onSuccess?: () => void; initialData?: any }) {
  const { addFamily, updateFamily } = useFamiliesStore();
  const [loading, setLoading] = useState(false);
  const isEdit = !!initialData;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<FamilyFormValues>({
    resolver: zodResolver(familySchema),
    defaultValues: initialData
      ? { ...initialData, housingType: initialData.housingType || initialData.housing_type || "RENT" }
      : {
        headName: "",
        wifeName: "",
        nationalId: "",
        wifeNationalId: "",
        phone: "",
        phone2: "",
        address: "",
        housingType: "RENT",
        meezaCard: "",
        category: "",
        categoryReason: "",
        aidDecision: "",
        monthlyAidAmount: 0,
        pdfName: "",
        notes: "",
        fieldResearchDone: false,
        dataVerified: false,
      },
  });

  const fieldResearchDone = watch("fieldResearchDone");
  const dataVerified = watch("dataVerified");

  const mapCategoryToSocialStatus = (category) => {
    switch (category) {
      case "أسرة أيتام":
        return "ORPHANS";
      case "مطلقات":
        return "DIVORCED";
      case "فقراء":
        return "POOR";
      case "مساكين":
        return "NEEDY";
      case "أسر إعاقة":
        return "DISABILITY";
      case "طالب علم":
        return "STUDENT";
      case "أسر سجناء":
        return "PRISONER";
      case "كبار سن":
        return "ELDERLY";
      case "حالات هجر واختفاء الزوج":
        return "ABANDONMENT";
      case "أمراض مزمنة":
        return "CHRONIC_DISEASE";
      case "إصابة مؤقتة":
        return "TEMPORARY_INJURY";
      default:
        return "OTHER";
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      if (isEdit) {
        // ── EDIT MODE: PUT /v1/families/:id (حفظ حقيقي في قاعدة البيانات) ──
        await api.put(`/v1/families/${initialData.id}`, {
          address: data.address,
          phone: data.phone,
          housing_type: data.housingType,
          notes: data.notes || null,
          social_status: mapCategoryToSocialStatus(data.category),
        });
        updateFamily(initialData.id, { ...data, housing_type: data.housingType });
        toast.success("تم تعديل الأسرة وحفظها بنجاح");
        onSuccess?.();
        return;
      }

      // ── CREATE MODE: POST /v1/families/register ──
      const payload = {
        family: {
          registration_number: data.nationalId,
          address: data.address,
          region: null,
          housing_type: data.housingType,
          rent_value: null,
          phone: data.phone,
          notes: data.notes || null,
          social_status: mapCategoryToSocialStatus(data.category),
        },
        persons: [
          {
            full_name: data.headName,
            national_id: data.nationalId,
            role_in_family: "HUSBAND",
            gender: "MALE",
            birth_date: null,
            marital_status: null,
            education_level: null,
            occupation: null,
            smoker: false,
            disability: false,
          },
          ...(data.wifeName
            ? [
              {
                full_name: data.wifeName,
                national_id: data.wifeNationalId || null,
                role_in_family: "WIFE",
                gender: "FEMALE",
                birth_date: null,
                marital_status: null,
                education_level: null,
                occupation: null,
                smoker: false,
                disability: false,
              },
            ]
            : []),
        ],
        incomes: [],
        medicalCases: [],
        educationRecords: [],
      };

      const response = await api.post("/v1/families/register", payload);

      const vulnerabilityIndex = response.data?.vulnerabilityIndex ?? 0;
      const classification = response.data?.classification ?? "متوسط";

      // Update local UI store so existing v0 dashboards/tabs keep working
      addFamily({
        ...data,
        id: response.data.familyId,
        registrationDate: new Date().toISOString().split("T")[0],
        status: "نشط",
        vulnerabilityIndex,
        classification,
      });

      reset();
      toast.success("تم تسجيل الأسرة بنجاح");
      onSuccess?.();
    } catch (error: any) {
      console.error("Family save error", error);
      const message =
        error.response?.data?.message ||
        (isEdit ? "حدث خطأ أثناء تعديل الأسرة." : "حدث خطأ أثناء تسجيل الأسرة.");
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* ── Section 1: Basic Info ── */}
      <div className="flex items-center gap-2 text-sm font-semibold text-primary">
        <User className="h-4 w-4" />
        <span>البيانات الأساسية</span>
      </div>

      <div className="space-y-2">
        <Label htmlFor="headName">اسم رب الأسرة *</Label>
        <Input id="headName" {...register("headName")} placeholder="الاسم الرباعي" />
        {errors.headName && <p className="text-xs text-destructive">{errors.headName.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="wifeName">اسم الزوجة</Label>
        <Input id="wifeName" {...register("wifeName")} placeholder="اسم الزوجة (يُستخدم لتسمية ملف PDF)" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nationalId">الرقم القومي لرب الأسرة *</Label>
          <Input id="nationalId" {...register("nationalId")} placeholder="14 رقم" dir="ltr" className="text-right" />
          {errors.nationalId && <p className="text-xs text-destructive">{errors.nationalId.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="wifeNationalId">الرقم القومي للزوجة</Label>
          <Input id="wifeNationalId" {...register("wifeNationalId")} placeholder="14 رقم" dir="ltr" className="text-right" />
          {errors.wifeNationalId && <p className="text-xs text-destructive">{errors.wifeNationalId.message}</p>}
        </div>
      </div>

      <Separator />

      {/* ── Section 2: Contact ── */}
      <div className="flex items-center gap-2 text-sm font-semibold text-primary">
        <Phone className="h-4 w-4" />
        <span>بيانات الاتصال</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">رقم الهاتف الأساسي *</Label>
          <Input id="phone" {...register("phone")} placeholder="01xxxxxxxxx" dir="ltr" className="text-right" />
          {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone2">رقم هاتف بديل</Label>
          <Input id="phone2" {...register("phone2")} placeholder="01xxxxxxxxx" dir="ltr" className="text-right" />
          {errors.phone2 && <p className="text-xs text-destructive">{errors.phone2.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="address">العنوان بالتفصيل *</Label>
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground mt-2.5 shrink-0" />
            <Input id="address" {...register("address")} placeholder="الشارع، الحي، المدينة، المحافظة" className="flex-1" />
          </div>
          {errors.address && <p className="text-xs text-destructive mr-6">{errors.address.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>نوع السكن *</Label>
          <Select
            defaultValue={watch("housingType") || "RENT"}
            onValueChange={(v) => setValue("housingType", v, { shouldValidate: true })}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر نوع السكن" />
            </SelectTrigger>
            <SelectContent>
              {HOUSING_TYPES.map((ht) => (
                <SelectItem key={ht.value} value={ht.value}>{ht.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.housingType && <p className="text-xs text-destructive">{errors.housingType.message}</p>}
        </div>
      </div>

      <Separator />

      {/* ── Section 3: Financial ── */}
      <div className="flex items-center gap-2 text-sm font-semibold text-primary">
        <CreditCard className="h-4 w-4" />
        <span>البيانات المالية</span>
      </div>

      <div className="space-y-2">
        <Label htmlFor="meezaCard">رقم بطاقة ميزة (فيزا)</Label>
        <Input id="meezaCard" {...register("meezaCard")} placeholder="رقم البطاقة (16 رقم)" dir="ltr" className="text-right" />
        {errors.meezaCard && <p className="text-xs text-destructive">{errors.meezaCard.message}</p>}
        <p className="text-[11px] text-muted-foreground">رقم البطاقة المستخدمة لصرف المساعدات عبر البنك</p>
      </div>

      <Separator />

      {/* ── Section 4: Classification ── */}
      <div className="flex items-center gap-2 text-sm font-semibold text-primary">
        <FileText className="h-4 w-4" />
        <span>التصنيف والحالة</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>تصنيف الحالة *</Label>
          <Select onValueChange={(val) => setValue("category", val, { shouldValidate: true })}>
            <SelectTrigger>
              <SelectValue placeholder="اختر التصنيف" />
            </SelectTrigger>
            <SelectContent>
              {CASE_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>قرار المساعدة *</Label>
          <Select onValueChange={(val) => setValue("aidDecision", val, { shouldValidate: true })}>
            <SelectTrigger>
              <SelectValue placeholder="نوع المساعدة" />
            </SelectTrigger>
            <SelectContent>
              {AID_DECISIONS.map((aid) => (
                <SelectItem key={aid} value={aid}>{aid}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.aidDecision && <p className="text-xs text-destructive">{errors.aidDecision.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="categoryReason">سبب التصنيف *</Label>
        <Textarea
          id="categoryReason"
          {...register("categoryReason")}
          placeholder="اكتب سبب تصنيف هذه الأسرة في هذه الفئة..."
          rows={2}
        />
        {errors.categoryReason && <p className="text-xs text-destructive">{errors.categoryReason.message}</p>}
      </div>

      <Separator />

      {/* ── Section 5: Aid Amount ── */}
      <div className="flex items-center gap-2 text-sm font-semibold text-primary">
        <HandCoins className="h-4 w-4" />
        <span>المساعدة المقررة</span>
      </div>

      <div className="space-y-2">
        <Label htmlFor="monthlyAidAmount">مبلغ المساعدة الشهرية (ج.م)</Label>
        <Input
          id="monthlyAidAmount"
          type="number"
          {...register("monthlyAidAmount")}
          min={0}
          max={9999}
          placeholder="الحد الأقصى 4 أرقام"
          dir="ltr"
          className="text-right"
        />
        {errors.monthlyAidAmount && <p className="text-xs text-destructive">{errors.monthlyAidAmount.message}</p>}
        <p className="text-[11px] text-muted-foreground">المبلغ لا يتجاوز 9999 ج.م (4 أرقام) للتوافق مع نظام البنك</p>
      </div>

      <Separator />

      {/* ── Section 6: Verification ── */}
      <div className="space-y-4 rounded-xl bg-secondary/50 p-4">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-medium">تم إجراء بحث ميداني</Label>
            <p className="text-[11px] text-muted-foreground mt-0.5">هل تم إرسال متطوع لزيارة الأسرة؟</p>
          </div>
          <Switch
            checked={fieldResearchDone}
            onCheckedChange={(val) => setValue("fieldResearchDone", val)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-medium">تم التحقق من البيانات</Label>
            <p className="text-[11px] text-muted-foreground mt-0.5">هل تم مراجعة المستندات وتأكيد صحة البيانات؟</p>
          </div>
          <Switch
            checked={dataVerified}
            onCheckedChange={(val) => setValue("dataVerified", val)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="pdfName">اسم ملف PDF</Label>
        <Input id="pdfName" {...register("pdfName")} placeholder="عادةً يكون اسم الزوجة" />
        <p className="text-[11px] text-muted-foreground">اسم الزوجة لأنها الأكثر ترددًا على الجمعية</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">ملاحظات إضافية</Label>
        <Textarea id="notes" {...register("notes")} placeholder="أي ملاحظات أخرى..." rows={2} />
      </div>
      {/* ── Submit Button ── */}
      <Button
        type="submit"
        className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
        disabled={loading}
      >
        {loading && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
        {loading ? "جاري الحفظ..." : isEdit ? "حفظ التعديلات" : "تسجيل الأسرة"}
      </Button>
    </form>
  );
}

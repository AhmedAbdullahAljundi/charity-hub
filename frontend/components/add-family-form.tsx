"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { dictLabel } from "@/lib/i18n/dict-label";
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
import { useState, useMemo } from "react";
import { toast } from "sonner";

function createFamilySchema(tv: (key: string) => string) {
  return z.object({
    headName: z.string().min(3, tv("headNameMin")),
    wifeName: z.string().optional(),
    nationalId: z
      .string()
      .length(14, tv("nationalIdLength"))
      .regex(/^\d+$/, tv("nationalIdDigits")),
    wifeNationalId: z.string().optional().refine(
      (val) => !val || (val.length === 14 && /^\d+$/.test(val)),
      tv("nationalIdLength")
    ),
    phone: z
      .string()
      .min(11, tv("phoneMin"))
      .regex(/^01[0125]\d{8}$/, tv("phoneInvalid")),
    phone2: z.string().optional().refine(
      (val) => !val || /^01[0125]\d{8}$/.test(val),
      tv("phoneInvalid")
    ),
    address: z.string().min(5, tv("addressMin")),
    housingType: z.string().min(1, tv("housingRequired")),
    meezaCard: z.string().optional().refine(
      (val) => !val || (val.length >= 16 && /^\d+$/.test(val)),
      tv("meezaLength")
    ),
    category: z.string().min(1, tv("categoryRequired")),
    categoryReason: z.string().min(5, tv("categoryReasonMin")),
    aidDecision: z.string().min(1, tv("aidRequired")),
    monthlyAidAmount: z.coerce.number().min(0, tv("monthlyAidRange")).max(9999, tv("monthlyAidRange")),
    pdfName: z.string().optional(),
    notes: z.string().optional(),
    fieldResearchDone: z.boolean().optional(),
    dataVerified: z.boolean().optional(),
  });
}

type FamilyFormValues = z.infer<ReturnType<typeof createFamilySchema>>;

const HOUSING_VALUES = ["RENT", "OWNED", "SHARED"] as const;

export function AddFamilyForm({ onSuccess, initialData }: { onSuccess?: () => void; initialData?: any }) {
  const addFamily = useFamiliesStore(state => state.addFamily);
  const updateFamily = useFamiliesStore(state => state.updateFamily);
  const [loading, setLoading] = useState(false);
  const isEdit = !!initialData;
  const tv = useTranslations("validation.family");
  const tf = useTranslations("families.form");
  const tDict = useTranslations("families");
  const familySchema = useMemo(() => createFamilySchema(tv), [tv]);

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
      case "orphans":
        return "ORPHANS";
      case "divorced":
        return "DIVORCED";
      case "poor":
        return "POOR";
      case "needy":
        return "NEEDY";
      case "disability":
        return "DISABILITY";
      case "student":
        return "STUDENT";
      case "prisoner":
        return "PRISONER";
      case "elderly":
        return "ELDERLY";
      case "absence":
        return "ABANDONMENT";
      case "chronic":
        return "CHRONIC_DISEASE";
      case "temporary_injury":
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
        toast.success(tf("toast_edit_ok"));
        onSuccess?.();
        return;
      }

      // ── CREATE MODE: POST /v1/families ──
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

      const response = await api.post("/v1/families", payload);

      const vulnerabilityIndex = response.data?.vulnerabilityIndex ?? 0;
      const classification = response.data?.classification ?? "متوسط";

      // Update local UI store so existing v0 dashboards/tabs keep working
      addFamily({
        ...data,
        id: response.data.familyId,
        vulnerabilityIndex,
        classification,
      });

      reset();
      toast.success(tf("toast_add_ok"));
      onSuccess?.();
    } catch (error: any) {
      console.error("Family save error", error);
      const message =
        error.response?.data?.message ||
        (isEdit ? tf("toast_edit_err") : tf("toast_add_err"));
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
        <span>{tf("section_basic")}</span>
      </div>

      <div className="space-y-2">
        <Label htmlFor="headName">{tf("headName")}</Label>
        <Input id="headName" {...register("headName")} placeholder={tf("headNamePh")} />
        {errors.headName && <p className="text-xs text-destructive">{errors.headName.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="wifeName">{tf("wifeName")}</Label>
        <Input id="wifeName" {...register("wifeName")} placeholder={tf("wifeNamePh")} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nationalId">{tf("nationalId")}</Label>
          <Input id="nationalId" {...register("nationalId")} placeholder={tf("nationalIdPh")} dir="ltr" className="text-right" />
          {errors.nationalId && <p className="text-xs text-destructive">{errors.nationalId.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="wifeNationalId">{tf("wifeNationalId")}</Label>
          <Input id="wifeNationalId" {...register("wifeNationalId")} placeholder={tf("nationalIdPh")} dir="ltr" className="text-right" />
          {errors.wifeNationalId && <p className="text-xs text-destructive">{errors.wifeNationalId.message}</p>}
        </div>
      </div>

      <Separator />

      {/* ── Section 2: Contact ── */}
      <div className="flex items-center gap-2 text-sm font-semibold text-primary">
        <Phone className="h-4 w-4" />
        <span>{tf("section_contact")}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">{tf("phone")}</Label>
          <Input id="phone" {...register("phone")} placeholder={tf("phonePh")} dir="ltr" className="text-right" />
          {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone2">{tf("phone2")}</Label>
          <Input id="phone2" {...register("phone2")} placeholder={tf("phonePh")} dir="ltr" className="text-right" />
          {errors.phone2 && <p className="text-xs text-destructive">{errors.phone2.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="address">{tf("address")}</Label>
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground mt-2.5 shrink-0" />
            <Input id="address" {...register("address")} placeholder={tf("addressPh")} className="flex-1" />
          </div>
          {errors.address && <p className="text-xs text-destructive me-6">{errors.address.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>{tf("housingType")}</Label>
          <Select
            defaultValue={watch("housingType") || "RENT"}
            onValueChange={(v) => setValue("housingType", v, { shouldValidate: true })}
          >
            <SelectTrigger>
              <SelectValue placeholder={tf("housingPlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              {HOUSING_VALUES.map((hv) => (
                <SelectItem key={hv} value={hv}>
                  {tDict(`housing.${hv}`)}
                </SelectItem>
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
        <span>{tf("section_financial")}</span>
      </div>

      <div className="space-y-2">
        <Label htmlFor="meezaCard">{tf("meezaCard")}</Label>
        <Input id="meezaCard" {...register("meezaCard")} placeholder={tf("meezaPh")} dir="ltr" className="text-right" />
        {errors.meezaCard && <p className="text-xs text-destructive">{errors.meezaCard.message}</p>}
        <p className="text-[11px] text-muted-foreground">{tf("meezaHint")}</p>
      </div>

      <Separator />

      {/* ── Section 4: Classification ── */}
      <div className="flex items-center gap-2 text-sm font-semibold text-primary">
        <FileText className="h-4 w-4" />
        <span>{tf("section_classification")}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{tf("category")}</Label>
          <Select onValueChange={(val) => setValue("category", val, { shouldValidate: true })}>
            <SelectTrigger>
              <SelectValue placeholder={tf("categoryPh")} />
            </SelectTrigger>
            <SelectContent>
              {CASE_CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.key}>
                  {dictLabel(tDict, "caseCategories", cat)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>{tf("aidDecision")}</Label>
          <Select onValueChange={(val) => setValue("aidDecision", val, { shouldValidate: true })}>
            <SelectTrigger>
              <SelectValue placeholder={tf("aidDecisionPh")} />
            </SelectTrigger>
            <SelectContent>
              {AID_DECISIONS.map((aid) => (
                <SelectItem key={aid.value} value={aid.key}>
                  {dictLabel(tDict, "aidDecisions", aid)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.aidDecision && <p className="text-xs text-destructive">{errors.aidDecision.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="categoryReason">{tf("categoryReason")}</Label>
        <Textarea
          id="categoryReason"
          {...register("categoryReason")}
          placeholder={tf("categoryReasonPh")}
          rows={2}
        />
        {errors.categoryReason && <p className="text-xs text-destructive">{errors.categoryReason.message}</p>}
      </div>

      <Separator />

      {/* ── Section 5: Aid Amount ── */}
      <div className="flex items-center gap-2 text-sm font-semibold text-primary">
        <HandCoins className="h-4 w-4" />
        <span>{tf("section_aid")}</span>
      </div>

      <div className="space-y-2">
        <Label htmlFor="monthlyAidAmount">{tf("monthlyAidAmount")}</Label>
        <Input
          id="monthlyAidAmount"
          type="number"
          {...register("monthlyAidAmount")}
          min={0}
          max={9999}
          placeholder={tf("monthlyAidPlaceholder")}
          dir="ltr"
          className="text-right"
        />
        {errors.monthlyAidAmount && <p className="text-xs text-destructive">{errors.monthlyAidAmount.message}</p>}
        <p className="text-[11px] text-muted-foreground">{tf("monthlyAidHint")}</p>
      </div>

      <Separator />

      {/* ── Section 6: Verification ── */}
      <div className="space-y-4 rounded-xl bg-secondary/50 p-4">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-medium">{tf("fieldResearchTitle")}</Label>
            <p className="text-[11px] text-muted-foreground mt-0.5">{tf("fieldResearchHint")}</p>
          </div>
          <Switch
            checked={fieldResearchDone}
            onCheckedChange={(val) => setValue("fieldResearchDone", val)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-medium">{tf("dataVerifiedTitle")}</Label>
            <p className="text-[11px] text-muted-foreground mt-0.5">{tf("dataVerifiedHint")}</p>
          </div>
          <Switch
            checked={dataVerified}
            onCheckedChange={(val) => setValue("dataVerified", val)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="pdfName">{tf("pdfName")}</Label>
        <Input id="pdfName" {...register("pdfName")} placeholder={tf("pdfNamePh")} />
        <p className="text-[11px] text-muted-foreground">{tf("pdfNameHint")}</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">{tf("notes")}</Label>
        <Textarea id="notes" {...register("notes")} placeholder={tf("notesPh")} rows={2} />
      </div>
      {/* ── Submit Button ── */}
      <Button
        type="submit"
        className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
        disabled={loading}
      >
        {loading && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
        {loading ? tf("saving") : isEdit ? tf("submitEdit") : tf("submitAdd")}
      </Button>
    </form>
  );
}

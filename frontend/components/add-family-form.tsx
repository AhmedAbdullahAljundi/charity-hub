/* eslint-disable react-hooks/incompatible-library */
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
import { useFamiliesStore } from "@/lib/store";
import api from "@/lib/api/client";
import { Loader2, User, Phone, MapPin, CreditCard, FileText } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const formSchema = z.object({
 name: z.string().min(4, "يجب أن يكون الاسم 4 حروف على الأقل"),
 spouseName: z.string().optional(),
 nationalId: z.string().length(14, "الرقم القومي يجب أن يكون 14 رقماً").regex(/^\d+$/, "أرقام فقط"),
 spouseNationalId: z.string().optional().refine(val => !val || (val.length === 14 && /^\d+$/.test(val)), "الرقم القومي يجب أن يكون 14 رقماً"),
 phone: z.string().regex(/^01\d{9}$/, "رقم الهاتف غير صحيح"),
 alternatePhone: z.string().optional().refine(val => !val || /^01\d{9}$/.test(val), "رقم الهاتف غير صحيح"),
 address: z.string().min(10, "العنوان يجب أن يكون 10 حروف على الأقل"),
 meezaCardNumber: z.string().optional().refine(val => !val || (val.length === 16 && /^\d+$/.test(val)), "رقم البطاقة يجب أن يكون 16 رقماً"),
 classification: z.string().min(1, "هذا الحقل مطلوب"),
 assistanceDecision: z.string().min(1, "هذا الحقل مطلوب"),
});

type FamilyFormValues = z.infer<typeof formSchema>;

export function AddFamilyForm({ onSuccess, initialData }: { onSuccess?: () => void; initialData?: any }) {
 const addFamily = useFamiliesStore(state => state.addFamily);
 const updateFamily = useFamiliesStore(state => state.updateFamily);
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
 resolver: zodResolver(formSchema),
 defaultValues: initialData ? {
 name: initialData.headName || initialData.name || "",
 spouseName: initialData.spouseName || "",
 nationalId: initialData.nationalId || "",
 spouseNationalId: initialData.spouseNationalId || "",
 phone: initialData.phone || "",
 alternatePhone: initialData.alternatePhone || "",
 address: initialData.address || "",
 meezaCardNumber: initialData.meezaCardNumber || "",
 classification: initialData.classification || "MODERATE_NEED",
 assistanceDecision: initialData.assistanceDecision || "PENDING",
 } : {
 name: "",
 spouseName: "",
 nationalId: "",
 spouseNationalId: "",
 phone: "",
 alternatePhone: "",
 address: "",
 meezaCardNumber: "",
 classification: "",
 assistanceDecision: "",
 },
 });

 const classificationVal = watch("classification");
 const assistanceDecisionVal = watch("assistanceDecision");

 const onSubmit = async (data: FamilyFormValues) => {
 try {
 setLoading(true);

 const notesJson = JSON.stringify({
 meezaCardNumber: data.meezaCardNumber,
 alternatePhone: data.alternatePhone,
 spouseNationalId: data.spouseNationalId,
 spouseName: data.spouseName,
 });

 if (isEdit) {
 await api.put(`/v1/families/${initialData.id}`, {
 address: data.address,
 phone: data.phone,
 notes: notesJson,
 social_status: data.classification,
 });
 updateFamily(initialData.id, { 
 headName: data.name,
 nationalId: data.nationalId,
 phone: data.phone,
 address: data.address,
 classification: data.classification,
 assistanceDecision: data.assistanceDecision
 });
 toast.success("تم تعديل بيانات الأسرة بنجاح");
 onSuccess?.();
 return;
 }

 const payload = {
 family: {
 registration_number: data.nationalId,
 address: data.address,
 housing_type: "RENT",
 phone: data.phone,
 notes: notesJson,
 social_status: data.classification,
 },
 persons: [
 {
 full_name: data.name,
 national_id: data.nationalId,
 role_in_family: "HUSBAND",
 gender: "MALE",
 smoker: false,
 disability: false,
 },
 ...(data.spouseName ? [{
 full_name: data.spouseName,
 national_id: data.spouseNationalId || null,
 role_in_family: "WIFE",
 gender: "FEMALE",
 smoker: false,
 disability: false,
 }] : []),
 ],
 incomes: [],
 medicalCases: [],
 educationRecords: [],
 };

 const response = await api.post("/v1/families", payload);
 
 addFamily({
 ...data,
 id: response.data.familyId || crypto.randomUUID(),
 headName: data.name,
 classification: data.classification,
 assistanceDecision: data.assistanceDecision,
 vulnerabilityIndex: 0,
 });

 reset();
 toast.success("تم إضافة الأسرة بنجاح");
 onSuccess?.();
 } catch (error) {
 console.error(error);
 toast.error("حدث خطأ أثناء حفظ البيانات");
 } finally {
 setLoading(false);
 }
 };

 return (
 <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white rounded-xl" >
 {/* SECTION 1 - البيانات الأساسية */}
 <div>
 <div className="flex items-center gap-2 mb-4 border-b border-gray-200 pb-2">
 <User className="h-5 w-5 text-green-600" />
 <h3 className="text-green-600 font-bold text-lg">البيانات الأساسية</h3>
 </div>
 
 <div className="space-y-4">
 <div>
 <Label className="text-sm text-gray-600 mb-1 text-right block">اسم رب الأسرة *</Label>
 <Input 
 {...register("name")} 
 placeholder="الاسم الرباعي"
 className={`border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:border-green-500 focus:ring-1 focus:ring-green-500 text-right text-gray-800 placeholder-gray-400 w-full`}
 />
 {errors.name && <p className="text-red-500 text-xs mt-1 text-right">{errors.name.message}</p>}
 </div>
 
 <div>
 <Label className="text-sm text-gray-600 mb-1 text-right block">اسم الزوجة</Label>
 <Input 
 {...register("spouseName")} 
 placeholder="اسم الزوجة (يُستخدم لتسمية ملف PDF)"
 className={`border ${errors.spouseName ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:border-green-500 focus:ring-1 focus:ring-green-500 text-right text-gray-800 placeholder-gray-400 w-full`}
 />
 {errors.spouseName && <p className="text-red-500 text-xs mt-1 text-right">{errors.spouseName.message}</p>}
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
 <div className="sm:col-span-2">
 <Label className="text-sm text-gray-600 mb-1 text-right block">الرقم القومي لرب الأسرة *</Label>
 <Input 
 {...register("nationalId")} 
 placeholder="رقم 14"
 maxLength={14}
 dir="ltr"
 className={`border ${errors.nationalId ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:border-green-500 focus:ring-1 focus:ring-green-500 text-right text-gray-800 placeholder-gray-400 w-full`}
 />
 {errors.nationalId && <p className="text-red-500 text-xs mt-1 text-right">{errors.nationalId.message}</p>}
 </div>
 <div className="sm:col-span-1">
 <Label className="text-sm text-gray-600 mb-1 text-right block">الرقم القومي للزوجة</Label>
 <Input 
 {...register("spouseNationalId")} 
 placeholder="رقم 14"
 maxLength={14}
 dir="ltr"
 className={`border ${errors.spouseNationalId ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:border-green-500 focus:ring-1 focus:ring-green-500 text-right text-gray-800 placeholder-gray-400 w-full`}
 />
 {errors.spouseNationalId && <p className="text-red-500 text-xs mt-1 text-right">{errors.spouseNationalId.message}</p>}
 </div>
 </div>
 </div>
 </div>

 {/* SECTION 2 - بيانات الاتصال */}
 <div>
 <div className="flex items-center gap-2 mb-4 border-b border-gray-200 pb-2">
 <Phone className="h-5 w-5 text-green-600" />
 <h3 className="text-green-600 font-bold text-lg">بيانات الاتصال</h3>
 </div>
 <div className="space-y-4">
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-row-reverse">
 <div>
 <Label className="text-sm text-gray-600 mb-1 text-right block">رقم الهاتف الأساسي *</Label>
 <Input 
 {...register("phone")} 
 placeholder="01xxxxxxxx"
 dir="ltr"
 className={`border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:border-green-500 focus:ring-1 focus:ring-green-500 text-right text-gray-800 placeholder-gray-400 w-full`}
 />
 {errors.phone && <p className="text-red-500 text-xs mt-1 text-right">{errors.phone.message}</p>}
 </div>
 <div>
 <Label className="text-sm text-gray-600 mb-1 text-right block">رقم هاتف بديل</Label>
 <Input 
 {...register("alternatePhone")} 
 placeholder="01xxxxxxxx"
 dir="ltr"
 className={`border ${errors.alternatePhone ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:border-green-500 focus:ring-1 focus:ring-green-500 text-right text-gray-800 placeholder-gray-400 w-full`}
 />
 {errors.alternatePhone && <p className="text-red-500 text-xs mt-1 text-right">{errors.alternatePhone.message}</p>}
 </div>
 </div>
 <div>
 <Label className="text-sm text-gray-600 mb-1 text-right block">العنوان بالتفصيل *</Label>
 <div className="relative">
 <Input 
 {...register("address")} 
 placeholder="الشارع، الحي، المدينة، المحافظة"
 className={`border ${errors.address ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:border-green-500 focus:ring-1 focus:ring-green-500 text-right pr-10 text-gray-800 placeholder-gray-400 w-full`}
 />
 <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
 </div>
 {errors.address && <p className="text-red-500 text-xs mt-1 text-right">{errors.address.message}</p>}
 </div>
 </div>
 </div>

 {/* SECTION 3 - البيانات المالية */}
 <div>
 <div className="flex items-center gap-2 mb-4 border-b border-gray-200 pb-2">
 <CreditCard className="h-5 w-5 text-green-600" />
 <h3 className="text-green-600 font-bold text-lg">البيانات المالية</h3>
 </div>
 <div className="space-y-4">
 <div>
 <Label className="text-sm text-gray-600 mb-1 text-right block">رقم بطاقة ميزة (فيزا)</Label>
 <Input 
 {...register("meezaCardNumber")} 
 placeholder="رقم البطاقة (16 رقم)"
 maxLength={16}
 dir="ltr"
 className={`border ${errors.meezaCardNumber ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:border-green-500 focus:ring-1 focus:ring-green-500 text-right text-gray-800 placeholder-gray-400 w-full`}
 />
 <p className="text-xs text-gray-400 mt-1 text-right">رقم البطاقة المستخدمة لصرف المساعدات عبر البنك</p>
 {errors.meezaCardNumber && <p className="text-red-500 text-xs mt-1 text-right">{errors.meezaCardNumber.message}</p>}
 </div>
 </div>
 </div>

 {/* SECTION 4 - التصنيف والحالة */}
 <div>
 <div className="flex items-center gap-2 mb-4 border-b border-gray-200 pb-2">
 <FileText className="h-5 w-5 text-green-600" />
 <h3 className="text-green-600 font-bold text-lg">التصنيف والحالة</h3>
 </div>
 <div className="space-y-4">
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-row-reverse">
 <div>
 <Label className="text-sm text-gray-600 mb-1 text-right block">تصنيف الحالة *</Label>
 <Select onValueChange={(v) => setValue("classification", v, { shouldValidate: true })} value={classificationVal}>
 <SelectTrigger className={`border ${errors.classification ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-green-500 text-right w-full bg-white`}>
 <SelectValue placeholder="اختر التصنيف" />
 </SelectTrigger>
 <SelectContent >
 <SelectItem value="CRITICAL">هش للغاية</SelectItem>
 <SelectItem value="HIGH_NEED">هش</SelectItem>
 <SelectItem value="MODERATE_NEED">ضعيف</SelectItem>
 <SelectItem value="LOW_NEED">متوسط</SelectItem>
 <SelectItem value="NOT_ELIGIBLE">خارج الأولوية</SelectItem>
 </SelectContent>
 </Select>
 {errors.classification && <p className="text-red-500 text-xs mt-1 text-right">{errors.classification.message}</p>}
 </div>
 <div>
 <Label className="text-sm text-gray-600 mb-1 text-right block">قرار المساعدة *</Label>
 <Select onValueChange={(v) => setValue("assistanceDecision", v, { shouldValidate: true })} value={assistanceDecisionVal}>
 <SelectTrigger className={`border ${errors.assistanceDecision ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-green-500 text-right w-full bg-white`}>
 <SelectValue placeholder="نوع المساعدة" />
 </SelectTrigger>
 <SelectContent >
 <SelectItem value="APPROVED">موافقة</SelectItem>
 <SelectItem value="PENDING">قيد المراجعة</SelectItem>
 <SelectItem value="REJECTED">رفض</SelectItem>
 </SelectContent>
 </Select>
 {errors.assistanceDecision && <p className="text-red-500 text-xs mt-1 text-right">{errors.assistanceDecision.message}</p>}
 </div>
 </div>
 </div>
 </div>

 {/* FOOTER */}
 <div className="flex items-center justify-start gap-4 mt-8 pt-4 border-t border-gray-200">
 <Button 
 type="button" 
 onClick={onSuccess}
 variant="outline"
 className="border border-gray-300 text-gray-600 rounded-lg px-8 py-2 bg-transparent hover:bg-gray-50 font-medium"
 >
 إلغاء
 </Button>
 <Button 
 type="submit" 
 disabled={loading}
 className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-8 py-2 font-medium"
 >
 {loading && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
 حفظ
 </Button>
 </div>
 </form>
 );
}

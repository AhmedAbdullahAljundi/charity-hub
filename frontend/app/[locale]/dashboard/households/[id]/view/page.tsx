"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getHousehold } from "@/lib/api/households-api";
import { HouseholdDto } from "@/lib/types/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Activity, Users, MapPin, Briefcase, FileText, Download, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const ELIGIBILITY_COLORS: Record<string, string> = {
 CRITICAL: "text-rose-700 bg-rose-100 border-rose-200",
 HIGH_NEED: "text-amber-700 bg-amber-100 border-amber-200",
 MODERATE_NEED: "text-orange-700 bg-orange-100 border-orange-200",
 LOW_NEED: "text-blue-700 bg-blue-100 border-blue-200",
 NOT_ELIGIBLE: "text-slate-700 bg-slate-100 border-slate-200",
};

const ELIGIBILITY_LABELS: Record<string, string> = {
 CRITICAL: "حرجة جداً",
 HIGH_NEED: "احتياج عالي",
 MODERATE_NEED: "احتياج متوسط",
 LOW_NEED: "احتياج منخفض",
 NOT_ELIGIBLE: "غير مستحق",
};

export default function HouseholdViewPage() {
 const params = useParams();
 const router = useRouter();
 const id = params.id as string;
 const [household, setHousehold] = useState<HouseholdDto | null>(null);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 async function loadData() {
 try {
 const data = await getHousehold(id);
 setHousehold(data);
 } catch (error) {
 toast.error("حدث خطأ أثناء تحميل بيانات الأسرة.");
 console.error(error);
 } finally {
 setLoading(false);
 }
 }
 if (id) {
 loadData();
 }
 }, [id]);

 if (loading) {
 return (
 <div className="container mx-auto py-8 space-y-6" >
 <Skeleton className="h-12 w-1/4 rounded-xl" />
 <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
 <Skeleton className="h-48 rounded-xl" />
 <Skeleton className="h-48 rounded-xl" />
 <Skeleton className="h-48 rounded-xl" />
 </div>
 </div>
 );
 }

 if (!household) {
 return (
 <div className="container mx-auto py-12 text-center" >
 <h2 className="text-2xl font-bold text-slate-800">الأسرة غير موجودة</h2>
 <Button onClick={() => router.back()} variant="outline" className="mt-4">
 العودة
 </Button>
 </div>
 );
 }

 const score = household.scores?.[0];
 const membersCount = household.persons?.length || 0;
 const incomes = household.incomeSources || [];
 const totalIncome = incomes.reduce((sum, inc) => sum + (inc.monthlyAmount || 0), 0);

 return (
 <div className="container mx-auto py-8 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500" >
 
 {/* Header */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
 <div className="flex items-center gap-4">
 <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full hover:bg-slate-100">
 <ArrowRight className="h-5 w-5 text-slate-600" />
 </Button>
 <div>
 <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
 ملف الأسرة: {household.code}
 {household.status === "PUBLISHED" && <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200">معتمد</Badge>}
 {household.status === "DRAFT" && <Badge variant="secondary">مسودة</Badge>}
 </h1>
 <p className="text-sm text-slate-500 mt-1">تاريخ التسجيل: {new Date(household.registrationDate).toLocaleDateString("ar-EG")}</p>
 </div>
 </div>
 <div className="flex gap-2">
 {household.pdfUrl && (
 <Button variant="outline" className="border-slate-200 text-slate-700 bg-white hover:bg-slate-50" onClick={() => window.open(household.pdfUrl, "_blank")}>
 <Download className="w-4 h-4 ml-2" />
 عرض الملف الورقي
 </Button>
 )}
 <Button onClick={() => router.push(`/${params.locale}/dashboard/households/${id}/wizard`)} className="bg-slate-900 hover:bg-slate-800 text-white">
 تعديل الاستمارة
 </Button>
 </div>
 </div>

 {/* High-density grid overview */}
 <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
 
 {/* Score Card */}
 <Card className="bg-slate-900 text-white border-none shadow-md overflow-hidden relative">
 <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
 <CardContent className="p-6 relative z-10 flex flex-col justify-between h-full">
 <div>
 <p className="text-slate-400 text-sm font-medium mb-1">التقييم الحالي</p>
 <div className="text-4xl font-bold font-mono">
 {score ? `${Math.round(score.normalizedPercent)}%` : "N/A"}
 </div>
 </div>
 {score && (
 <div className="mt-4">
 <Badge className={cn("text-xs px-2.5 py-1 border", ELIGIBILITY_COLORS[score.systemRecommendation] || "bg-slate-800 text-slate-200")}>
 {ELIGIBILITY_LABELS[score.systemRecommendation] || score.systemRecommendation}
 </Badge>
 </div>
 )}
 </CardContent>
 </Card>

 <Card className="bg-white border border-slate-100 shadow-sm">
 <CardContent className="p-6 flex flex-col justify-between h-full">
 <div className="flex items-center gap-3 text-slate-500 mb-2">
 <div className="bg-blue-50 p-2 rounded-lg"><Users className="w-5 h-5 text-blue-600" /></div>
 <span className="font-semibold">الأفراد</span>
 </div>
 <div>
 <div className="text-3xl font-bold text-slate-800">{membersCount}</div>
 <p className="text-sm text-slate-500 mt-1">عائل + {membersCount - 1} تابعين</p>
 </div>
 </CardContent>
 </Card>

 <Card className="bg-white border border-slate-100 shadow-sm">
 <CardContent className="p-6 flex flex-col justify-between h-full">
 <div className="flex items-center gap-3 text-slate-500 mb-2">
 <div className="bg-green-50 p-2 rounded-lg"><Briefcase className="w-5 h-5 text-green-600" /></div>
 <span className="font-semibold">إجمالي الدخل</span>
 </div>
 <div>
 <div className="text-3xl font-bold text-slate-800">{totalIncome.toLocaleString()}</div>
 <p className="text-sm text-slate-500 mt-1">جنيه / شهر</p>
 </div>
 </CardContent>
 </Card>

 <Card className="bg-white border border-slate-100 shadow-sm">
 <CardContent className="p-6 flex flex-col justify-between h-full">
 <div className="flex items-center gap-3 text-slate-500 mb-2">
 <div className="bg-orange-50 p-2 rounded-lg"><MapPin className="w-5 h-5 text-orange-600" /></div>
 <span className="font-semibold">العنوان</span>
 </div>
 <div>
 <p className="text-sm text-slate-800 font-medium line-clamp-1" title={household.addressRegion || household.village}>
 {household.addressRegion || household.village || "غير محدد"}
 </p>
 <p className="text-xs text-slate-500 mt-1 line-clamp-2" title={household.addressDetails}>
 {household.addressDetails || "بدون تفاصيل إضافية"}
 </p>
 </div>
 </CardContent>
 </Card>

 </div>

 <div className="grid gap-6 lg:grid-cols-3">
 
 {/* Left Column: Basic Info & Incomes */}
 <div className="lg:col-span-2 space-y-6">
 
 <Card className="bg-white border border-slate-100 shadow-sm">
 <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
 <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
 <FileText className="w-4 h-4 text-slate-500" /> البيانات الأساسية
 </CardTitle>
 </CardHeader>
 <CardContent className="p-0">
 <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x sm:divide-x-reverse divide-slate-100">
 <div className="p-5 space-y-4">
 <div>
 <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">الحالة الاجتماعية</p>
 <p className="font-semibold text-slate-800">
 {household.socialStatus === "MARRIED" ? "متزوجة" :
 household.socialStatus === "DIVORCED" ? "مطلقة" :
 household.socialStatus === "WIDOWED" ? "أرملة" : "عزباء / أخرى"}
 </p>
 </div>
 <div>
 <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">الموبايل الأساسي</p>
 <p className="font-semibold text-slate-800" dir="ltr">{household.primaryPhone || "-"}</p>
 </div>
 <div>
 <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">واتساب</p>
 <p className="font-semibold text-slate-800" dir="ltr">{household.whatsappPhone || "-"}</p>
 </div>
 </div>
 <div className="p-5 space-y-4 bg-slate-50/30">
 <div>
 <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">نوع السكن</p>
 <p className="font-semibold text-slate-800">
 {household.housingType === "OWNED" ? "ملك" :
 household.housingType === "SHARED" ? "مشترك" :
 household.housingType === "RENTED" ? "إيجار" : "متبرع به"}
 </p>
 </div>
 <div>
 <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">نوع البحث</p>
 <p className="font-semibold text-slate-800">
 {household.searchType === "FIELD" ? "ميداني" : "مكتبي"}
 </p>
 </div>
 <div className="flex gap-2">
 {household.isModest && <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">حالة تعفف</Badge>}
 {household.officeDealings && <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">تعامل مقر</Badge>}
 </div>
 </div>
 </div>
 </CardContent>
 </Card>

 <Card className="bg-white border border-slate-100 shadow-sm">
 <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4 flex flex-row items-center justify-between">
 <CardTitle className="text-base font-bold text-slate-800">أفراد الأسرة</CardTitle>
 </CardHeader>
 <CardContent className="p-0">
 <div className="divide-y divide-slate-100">
 {household.persons?.map(p => (
 <div key={p.id} className="p-4 hover:bg-slate-50 flex items-center justify-between gap-4">
 <div>
 <div className="flex items-center gap-2">
 <span className="font-semibold text-slate-800">{p.name}</span>
 {p.isHead && <Badge className="bg-slate-800 text-slate-100 text-[10px] h-5 px-1.5">عائل</Badge>}
 </div>
 <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
 <span>{p.role === "CHILD" ? "ابن" : p.role === "SPOUSE" ? "زوج" : "معال"}</span>
 <span>•</span>
 <span>{p.gender === "MALE" ? "ذكر" : "أنثى"}</span>
 {p.nationalId && (
 <>
 <span>•</span>
 <span>{p.nationalId}</span>
 </>
 )}
 </div>
 </div>
 <div className="flex gap-1.5 flex-wrap justify-end max-w-[150px]">
 {p.isStudent && <Badge variant="outline" className="text-[10px] border-blue-200 text-blue-700 bg-blue-50">طالب</Badge>}
 {(p.diseases?.length ?? 0) > 0 && <Badge variant="outline" className="text-[10px] border-rose-200 text-rose-700 bg-rose-50">مريض</Badge>}
 {(p.disabilities?.length ?? 0) > 0 && <Badge variant="outline" className="text-[10px] border-orange-200 text-orange-700 bg-orange-50">معاق</Badge>}
 {p.isOrphan && <Badge variant="outline" className="text-[10px] border-purple-200 text-purple-700 bg-purple-50">يتيم</Badge>}
 </div>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>

 </div>

 {/* Right Column: Incomes, Burdens */}
 <div className="space-y-6">
 
 <Card className="bg-white border border-slate-100 shadow-sm">
 <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
 <CardTitle className="text-base font-bold text-slate-800">مصادر الدخل</CardTitle>
 </CardHeader>
 <CardContent className="p-0">
 <div className="divide-y divide-slate-100">
 {incomes.length === 0 ? (
 <div className="p-6 text-center text-slate-500 text-sm">لا توجد مصادر دخل مسجلة</div>
 ) : (
 incomes.map(inc => (
 <div key={inc.id} className="p-4 flex items-center justify-between">
 <div>
 <p className="font-medium text-slate-800 text-sm">{inc.channel}</p>
 <div className="mt-1">
 {inc.status === "VERIFIED" ? (
 <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
 <CheckCircle2 className="w-3 h-3" /> موثق
 </span>
 ) : (
 <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
 <AlertCircle className="w-3 h-3" /> غير موثق
 </span>
 )}
 </div>
 </div>
 <div className="font-bold text-slate-900 font-mono">
 {inc.monthlyAmount}
 </div>
 </div>
 ))
 )}
 </div>
 </CardContent>
 </Card>

 {(household.temporaryBurdens?.length ?? 0) > 0 && (
 <Card className="bg-white border border-slate-100 shadow-sm">
 <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
 <CardTitle className="text-base font-bold text-slate-800">الأعباء الإضافية</CardTitle>
 </CardHeader>
 <CardContent className="p-0">
 <div className="divide-y divide-slate-100">
 {household.temporaryBurdens?.map(b => (
 <div key={b.id} className="p-4 flex items-center justify-between">
 <span className="font-medium text-slate-800 text-sm">{b.type}</span>
 <Badge variant="outline" className="bg-slate-50">الفئة {b.grade}</Badge>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>
 )}
 
 <Card className="bg-slate-50 border border-slate-200 shadow-sm">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-bold text-slate-700">ملاحظات</CardTitle>
 </CardHeader>
 <CardContent className="pt-0 text-sm text-slate-600 whitespace-pre-wrap">
 {household.notes || "لا توجد ملاحظات عامة مسجلة لهذه الأسرة."}
 </CardContent>
 </Card>

 </div>

 </div>

 </div>
 );
}

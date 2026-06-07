"use client";

import { useState, useEffect } from "react";
import { useMedicalStore } from "../../lib/stores/medicalStore";
import { useMedicalModalStore } from "../../lib/stores/medicalModalStore";
import { MedicalRecordsTable } from "./dashboard/records-table";
import { AddRecordModal } from "./modals/add-record-modal";
import {
  Activity,
  AlertTriangle,
  Banknote,
  FileText,
  History,
  LayoutDashboard,
  PieChart,
  Plus,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function MedicalPage() {
  const { loadCases, loadKpis, isLoading, error, kpis, cases } = useMedicalStore();
  const openModal = useMedicalModalStore((state) => state.openModal);

  const [filterCritical, setFilterCritical] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadKpis();
    loadCases();
  }, []);

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    loadCases({ search: q, criticalOnly: filterCritical });
  };

  if (isLoading && cases.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50/50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin" />
          <p className="text-slate-500 font-medium animate-pulse">جاري تحميل السجلات الطبية...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-red-50 text-red-600 rounded-xl m-8 border border-red-100">
        <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-80" />
        <h3 className="text-lg font-bold mb-2">حدث خطأ</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-12">
      {/* 
        PREMIUM HEADER SECTION 
        Uses a subtle gradient and a pattern overlay for a high-end feel.
      */}
      <div className="relative bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 pt-16 pb-24 overflow-hidden shadow-lg">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/2 -left-24 w-72 h-72 bg-teal-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-emerald-100 text-sm font-medium backdrop-blur-md">
                <Activity className="w-4 h-4" />
                <span>إدارة القطاع الطبي</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                السجلات الطبية والاعانات
              </h1>
              <p className="text-emerald-100/80 text-lg max-w-xl leading-relaxed">
                متابعة دقيقة وشاملة للحالات المرضية، إدارة الاستقطاعات، وتحليل المصروفات الطبية لضمان تقديم الرعاية الأمثل للمستفيدين.
              </p>
            </div>

            <button
              onClick={openModal}
              className="group relative inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-emerald-900 rounded-xl hover:bg-emerald-50 transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)] font-bold text-base overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-100 to-teal-50 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Plus className="w-5 h-5 relative z-10 transition-transform group-hover:rotate-90" />
              <span className="relative z-10">إضافة سجل طبي جديد</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-12 relative z-20">
        {/* KPI CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Card 1: Total Cases */}
          <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-slate-200/60 dark:border-slate-800 shadow-lg shadow-slate-200/40 dark:shadow-none hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">إجمالي السجلات الطبية</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{kpis?.totalCases || 0}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900/50 shadow-inner">
                  <FileText className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Critical Cases */}
          <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-slate-200/60 dark:border-slate-800 shadow-lg shadow-slate-200/40 dark:shadow-none hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">حالات حرجة ومزمنة</p>
                  <p className="text-3xl font-bold text-rose-600 dark:text-rose-500">{kpis?.criticalCases || 0}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-100 dark:border-rose-900/50 shadow-inner">
                  <AlertTriangle className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Monthly Estimate */}
          <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-slate-200/60 dark:border-slate-800 shadow-lg shadow-slate-200/40 dark:shadow-none hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">التكلفة الشهرية المقدرة</p>
                  <div className="flex items-baseline gap-1">
                    <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-500">{kpis?.monthlyEstimate || 0}</p>
                    <span className="text-sm text-emerald-600/70 dark:text-emerald-500/70 font-semibold">ج.م</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-900/50 shadow-inner">
                  <Banknote className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 4: Active Treatments */}
          <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-slate-200/60 dark:border-slate-800 shadow-lg shadow-slate-200/40 dark:shadow-none hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">إجراءات قيد التنفيذ</p>
                  <p className="text-3xl font-bold text-amber-600 dark:text-amber-500">0</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-100 dark:border-amber-900/50 shadow-inner">
                  <Activity className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* MAIN CONTENT TABS */}
        <Tabs defaultValue="active-cases" className="space-y-6">
          <TabsList className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-1 rounded-xl shadow-sm inline-flex">
            <TabsTrigger 
              value="active-cases" 
              className="rounded-lg px-6 py-2.5 text-slate-600 dark:text-slate-400 data-[state=active]:bg-emerald-50 dark:data-[state=active]:bg-emerald-900/30 data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-sm transition-all"
            >
              <LayoutDashboard className="w-4 h-4 ml-2 inline-block" />
              السجلات النشطة
            </TabsTrigger>
            <TabsTrigger 
              value="history" 
              className="rounded-lg px-6 py-2.5 text-slate-600 dark:text-slate-400 data-[state=active]:bg-emerald-50 dark:data-[state=active]:bg-emerald-900/30 data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-sm transition-all"
            >
              <History className="w-4 h-4 ml-2 inline-block" />
              تاريخ الصرف الطبي
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="rounded-lg px-6 py-2.5 text-slate-600 dark:text-slate-400 data-[state=active]:bg-emerald-50 dark:data-[state=active]:bg-emerald-900/30 data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-sm transition-all"
            >
              <PieChart className="w-4 h-4 ml-2 inline-block" />
              تحليلات وإحصائيات
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: ACTIVE CASES */}
          <TabsContent value="active-cases" className="outline-none">
            <Card className="border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none rounded-2xl overflow-hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm">
              <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-100">قائمة الحالات</CardTitle>
                    <CardDescription className="text-slate-500 dark:text-slate-400 mt-1">
                      إدارة والبحث في سجلات المستفيدين الطبية.
                    </CardDescription>
                  </div>
                  <div className="w-72">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="ابحث بالاسم، المرض، أو رقم الأسرة..."
                        className="w-full pl-4 pr-10 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                      />
                      <svg
                        className="absolute right-3 top-2.5 w-4 h-4 text-slate-400 dark:text-slate-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <MedicalRecordsTable records={cases} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 2: DISBURSEMENT HISTORY */}
          <TabsContent value="history" className="outline-none">
            <Card className="border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none rounded-2xl bg-white/95 dark:bg-slate-900/95 p-12 text-center">
              <History className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
              <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-2">سجل الصرف الطبي</h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                هذه الشاشة ستعرض جميع عمليات الصرف والمساعدات الطبية السابقة التي تم تقديمها. سيتم تفعيلها قريباً.
              </p>
            </Card>
          </TabsContent>

          {/* TAB 3: ANALYTICS */}
          <TabsContent value="analytics" className="outline-none">
            <Card className="border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none rounded-2xl bg-white/95 dark:bg-slate-900/95 p-12 text-center">
              <PieChart className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
              <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-2">التحليلات الطبية</h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                مؤشرات أداء الرعاية الصحية وتوزيع الأمراض والتكاليف سيتم عرضها هنا في تحديث قادم.
              </p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <AddRecordModal />
    </div>
  );
}

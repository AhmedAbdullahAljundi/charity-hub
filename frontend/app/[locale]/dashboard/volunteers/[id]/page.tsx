"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { 
  ArrowRight, 
  MapPin, 
  Phone, 
  Calendar, 
  Briefcase,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  Users,
  MessageCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api/client";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";
import { AppLocale } from "@/lib/i18n/locales";
import { useLocale } from "next-intl";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { TaskModal } from "@/components/volunteers/TaskModal";

interface VolunteerTask {
  id: string;
  title: string;
  description: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  dueDate: string;
  createdAt: string;
  householdId?: string;
  household?: {
    code: string;
    familyName: string;
  };
}

interface Volunteer {
  id: string;
  name: string;
  nationalId: string;
  phone: string;
  whatsapp: string;
  imageUrl?: string;
  address: string;
  assignedArea: string;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  specialties: string[];
  createdAt: string;
  tasks: VolunteerTask[];
}

export default function VolunteerProfilePage() {
  const t = useTranslations("volunteers");
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [volunteer, setVolunteer] = useState<Volunteer | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  useEffect(() => {
    fetchVolunteer();
  }, [id]);

  const fetchVolunteer = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/volunteers/${id}`);
      if (data.success) {
        setVolunteer(data.data);
      }
    } catch (e) {
      toast.error(locale === "ar" ? "فشل تحميل المتطوع" : "Failed to load volunteer");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'COMPLETED': return <CheckCircle2 className="h-4 w-4 text-success" />;
      case 'IN_PROGRESS': return <Clock className="h-4 w-4 text-warning" />;
      case 'CANCELLED': return <AlertCircle className="h-4 w-4 text-destructive" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!volunteer) return null;

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-900/50 pb-12 [--border-subtle:#F1F5F9] [--border:#E2E8F0] [--brand-dark:#16A34A] [--brand:#22C55E] [--page-bg:#F8FAFC] [--surface-raised:#F1F5F9] [--surface:#FFFFFF] [--text-muted:#94A3B8] [--text-primary:#0F172A] [--text-secondary:#475569] dark:[--border-subtle:#1E293B] dark:[--border:#334155] dark:[--brand-dark:#4ADE80] dark:[--brand:#22C55E] dark:[--page-bg:#0F172A] dark:[--surface-raised:#334155] dark:[--surface:#1E293B] dark:[--text-muted:#475569] dark:[--text-primary:#F1F5F9] dark:[--text-secondary:#94A3B8]">
      
      {/* PREMIUM HEADER SECTION */}
      <div className="relative pt-16 pb-24 overflow-hidden shadow-lg min-h-[300px]">
        {volunteer.imageUrl ? (
          <>
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-105"
              style={{ backgroundImage: `url(${volunteer.imageUrl})` }}
            />
            <div className="absolute inset-0 bg-indigo-950/70 mix-blend-multiply backdrop-blur-[2px]" />
            <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/90 via-violet-900/60 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-violet-900 to-indigo-950" />
        )}
        
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/2 -left-24 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto px-6 z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/20 border border-violet-500/30 text-violet-200 text-sm font-medium backdrop-blur-md">
                <Users className="w-4 h-4" />
                <span>ملف المتطوع الميداني</span>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="icon" onClick={() => router.back()} className="bg-transparent text-white border-white/20 hover:bg-white/10 hover:text-white">
                  <ArrowRight className="h-4 w-4 rtl:-scale-x-100" />
                </Button>
                {volunteer.imageUrl && (
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/30 shadow-md">
                    <img src={volunteer.imageUrl} alt={volunteer.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                  {volunteer.name}
                </h1>
                <Badge
                  variant="outline"
                  className={
                    volunteer.status === "ACTIVE"
                      ? "bg-success/20 text-success border-success/30"
                      : "bg-muted text-muted-foreground border-border"
                  }
                >
                  {t(`status.${volunteer.status}` as any)}
                </Badge>
              </div>
              <p className="text-slate-300 text-lg max-w-xl leading-relaxed">
                {volunteer.specialties?.map(s => t(`specialty.${s}` as any)).join(", ") || t("specialty.GENERAL")}
              </p>
            </div>

            <Button
              className="group relative inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-emerald-950 rounded-xl hover:bg-emerald-50 transition-all duration-300 shadow-[0_0_40px_rgba(16,185,129,0.15)] hover:shadow-[0_0_60px_rgba(16,185,129,0.25)] font-bold text-base overflow-hidden"
              onClick={() => setIsTaskModalOpen(true)}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-50 to-slate-50 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Plus className="w-5 h-5 relative z-10 text-emerald-600 transition-transform group-hover:rotate-90" />
              <span className="relative z-10">{t("tasks.assignNew")}</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-12 relative z-20 space-y-6 flex flex-col min-h-[500px]">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar Info */}
        <div className="space-y-6 lg:col-span-1">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">المعلومات الشخصية</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">المنطقة المخصصة</p>
                  <p className="text-sm text-muted-foreground">{volunteer.assignedArea || "---"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">رقم الهاتف</p>
                  {volunteer.phone ? (
                    <a href={`tel:${volunteer.phone}`} className="text-sm text-blue-600 hover:underline block" dir="ltr">
                      {volunteer.phone}
                    </a>
                  ) : (
                    <p className="text-sm text-muted-foreground">---</p>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MessageCircle className="h-5 w-5 text-emerald-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">واتساب</p>
                  {volunteer.whatsapp ? (
                    <a 
                      href={`https://wa.me/${volunteer.whatsapp.replace(/^0+/, "20").replace(/\D/g, '')}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-emerald-600 hover:underline block" 
                      dir="ltr"
                    >
                      {volunteer.whatsapp}
                    </a>
                  ) : (
                    <p className="text-sm text-muted-foreground">---</p>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">الرقم القومي</p>
                  <p className="text-sm text-muted-foreground" dir="ltr">{volunteer.nationalId || "---"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">تاريخ الانضمام</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(volunteer.createdAt), 'PPP', { locale: ar })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content (Tasks) */}
        <div className="space-y-6 lg:col-span-2">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">{t("tasks.title")} ({volunteer.tasks?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              {volunteer.tasks && volunteer.tasks.length > 0 ? (
                <div className="space-y-4">
                  {volunteer.tasks.map((task) => (
                    <div key={task.id} className="p-4 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <h4 className="font-semibold text-foreground flex items-center gap-2">
                            {task.title}
                            <Badge variant="secondary" className="text-xs">
                              {t(`tasks.priorityLevels.${task.priority}` as any)}
                            </Badge>
                          </h4>
                          {task.description && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 bg-background px-3 py-1 rounded-full border border-border text-sm whitespace-nowrap">
                          {getStatusIcon(task.status)}
                          {t(`tasks.statusLevels.${task.status}` as any)}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-4 pt-4 border-t border-border">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>تاريخ الاستحقاق: <span dir="ltr">{format(new Date(task.dueDate), 'yyyy/MM/dd')}</span></span>
                        </div>
                        {task.household && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            <span>الأسرة: {task.household.familyName} ({task.household.code})</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Briefcase className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground text-lg">لا توجد مهام حالياً</p>
                  <Button variant="outline" className="mt-4" onClick={() => setIsTaskModalOpen(true)}>
                    <Plus className="h-4 w-4 ms-2" />
                    إسناد أول مهمة
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
      
      {volunteer && (
        <TaskModal 
          open={isTaskModalOpen}
          onOpenChange={setIsTaskModalOpen}
          onSuccess={fetchVolunteer}
          volunteerId={volunteer.id}
        />
      )}
    </div>
  );
}

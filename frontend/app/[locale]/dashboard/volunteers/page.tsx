"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  Plus,
  Search,
  MapPin,
  Phone,
  Calendar,
  User,
  Users,
  MessageCircle,
  Star,
  Edit3,
  Briefcase
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { api } from "@/lib/api/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { AppLocale } from "@/lib/i18n/locales";
import { useLocale } from "next-intl";
import { VolunteerModal } from "@/components/volunteers/VolunteerModal";

interface Volunteer {
  id: string;
  name: string;
  phone: string;
  whatsapp?: string;
  imageUrl?: string;
  assignedArea: string;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  specialties: string[];
  tasks: {
    id: string;
    title: string;
    status: string;
    priority: string;
  }[];
  _count: {
    tasks: number;
  };
}

export default function VolunteersPage() {
  const t = useTranslations("volunteers");
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  
  const [search, setSearch] = useState("");
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null);

  useEffect(() => {
    fetchVolunteers();
  }, []);

  const fetchVolunteers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/volunteers");
      if (data.success) {
        setVolunteers(data.data.data || []);
      }
    } catch (e) {
      toast.error(locale === "ar" ? "فشل تحميل المتطوعين" : "Failed to load volunteers");
    } finally {
      setLoading(false);
    }
  };

  const filtered = volunteers.filter(
    (v) =>
      v.name?.toLowerCase().includes(search.toLowerCase()) ||
      v.assignedArea?.toLowerCase().includes(search.toLowerCase()) ||
      v.phone?.includes(search)
  );

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-900/50 pb-12 [--border-subtle:#F1F5F9] [--border:#E2E8F0] [--brand-dark:#16A34A] [--brand:#22C55E] [--page-bg:#F8FAFC] [--surface-raised:#F1F5F9] [--surface:#FFFFFF] [--text-muted:#94A3B8] [--text-primary:#0F172A] [--text-secondary:#475569] dark:[--border-subtle:#1E293B] dark:[--border:#334155] dark:[--brand-dark:#4ADE80] dark:[--brand:#22C55E] dark:[--page-bg:#0F172A] dark:[--surface-raised:#334155] dark:[--surface:#1E293B] dark:[--text-muted:#475569] dark:[--text-primary:#F1F5F9] dark:[--text-secondary:#94A3B8]">
      
      {/* PREMIUM HEADER SECTION */}
      <div className="relative bg-gradient-to-br from-indigo-950 via-violet-900 to-indigo-950 pt-16 pb-24 overflow-hidden shadow-lg">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/2 -left-24 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/20 border border-violet-500/30 text-violet-200 text-sm font-medium backdrop-blur-md">
                <Users className="w-4 h-4" />
                <span>إدارة فريق المتطوعين</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                {t("title")}
              </h1>
              <p className="text-slate-300 text-lg max-w-xl leading-relaxed">
                {t("subtitle")}
              </p>
            </div>

            <Button
              className="group relative inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-emerald-950 rounded-xl hover:bg-emerald-50 transition-all duration-300 shadow-[0_0_40px_rgba(16,185,129,0.15)] hover:shadow-[0_0_60px_rgba(16,185,129,0.25)] font-bold text-base overflow-hidden"
              onClick={() => {
                setSelectedVolunteer(null);
                setIsModalOpen(true);
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-50 to-slate-50 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Plus className="w-5 h-5 relative z-10 text-emerald-600 transition-transform group-hover:rotate-90" />
              <span className="relative z-10">{t("addVolunteer")}</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-12 relative z-20 space-y-6 flex flex-col min-h-[500px]">
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200/60 bg-white/95 backdrop-blur-sm px-4 py-3 shadow-lg shadow-slate-200/40 dark:border-slate-800 dark:bg-slate-900/95 dark:shadow-none">
          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute inset-e-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ps-10 h-9 rounded-lg border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-900"
            />
          </div>
        </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((vol) => (
            <Card 
              key={vol.id} 
              className="group relative border border-white/20 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer overflow-visible mt-8"
              onClick={() => router.push(`/${locale}/dashboard/volunteers/${vol.id}`)}
            >
              <div className="absolute -top-6 rtl:right-4 ltr:left-4 w-16 h-16 rounded-full border-4 border-white dark:border-slate-800 shadow-lg overflow-hidden bg-white dark:bg-slate-800 z-10 transition-transform group-hover:scale-110">
                {vol.imageUrl ? (
                  <img src={vol.imageUrl} alt={vol.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-xl">
                    {vol.name?.[0] || <User className="h-6 w-6" />}
                  </div>
                )}
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-3 rtl:left-3 ltr:right-3 h-8 w-8 text-muted-foreground hover:text-emerald-600 bg-white/50 backdrop-blur-sm z-20"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedVolunteer(vol);
                  setIsModalOpen(true);
                }}
              >
                <Edit3 className="h-4 w-4" />
              </Button>

              <CardContent className="p-5 pt-12 relative z-0">
                <div className="flex-1 min-w-0 mb-4">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-semibold text-foreground truncate text-lg">{vol.name}</h3>
                    <Badge
                      variant="outline"
                      className={
                        vol.status === "ACTIVE"
                          ? "bg-success/12 text-success border-success/25"
                          : vol.status === "SUSPENDED" 
                          ? "bg-destructive/12 text-destructive border-destructive/25"
                          : "bg-muted text-muted-foreground border-border"
                      }
                    >
                      {t(`status.${vol.status}` as any)}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-1">
                    {vol.specialties?.map(s => t(`specialty.${s}` as any)).join(", ") || t("specialty.GENERAL")}
                  </p>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-3.5 w-3.5 shrink-0" />
                    <span dir="ltr">{vol.phone || "---"}</span>
                  </div>
                  {vol.whatsapp && (
                    <div className="flex items-center gap-2 text-emerald-500">
                      <MessageCircle className="h-3.5 w-3.5 shrink-0" />
                      <a 
                        href={`https://wa.me/${vol.whatsapp.replace(/^0+/, "20").replace(/\D/g, '')}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-emerald-600 hover:underline" 
                        dir="ltr"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {vol.whatsapp}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{vol.assignedArea || "---"}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <div className="flex flex-col gap-1 w-full">
                      <div className="flex items-center justify-between text-muted-foreground w-full">
                        <div className="flex items-center gap-1">
                          <Briefcase className="h-3.5 w-3.5" />
                          <span>إجمالي المهام: {vol._count?.tasks || 0}</span>
                        </div>
                        {vol.tasks?.length > 0 && (
                          <div className="flex gap-2 text-[10px]">
                            {vol.tasks.filter(t => t.status === 'COMPLETED').length > 0 && (
                              <Badge variant="outline" className="bg-success/10 text-success border-success/20 px-1 py-0 h-4">
                                مكتملة: {vol.tasks.filter(t => t.status === 'COMPLETED').length}
                              </Badge>
                            )}
                            {vol.tasks.filter(t => t.status !== 'COMPLETED').length > 0 && (
                              <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20 px-1 py-0 h-4">
                                قيد العمل: {vol.tasks.filter(t => t.status !== 'COMPLETED').length}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                      {vol.tasks && vol.tasks[0] && (
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground bg-slate-100 dark:bg-slate-800 p-1.5 rounded mt-1 truncate">
                          <span className="font-semibold shrink-0">آخر مهمة مسندة:</span>
                          <span className="truncate">{vol.tasks[0].title}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center p-8 text-muted-foreground">
              لا توجد بيانات تطابق بحثك.
            </div>
          )}
        </div>
      )}
      </div>

      <VolunteerModal 
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSuccess={fetchVolunteers}
        volunteer={selectedVolunteer}
      />
    </div>
  );
}

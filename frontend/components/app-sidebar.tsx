"use client";

import { useState } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  LayoutDashboard,
  Users,
  BarChart3,
  ShieldCheck,
  Settings,
  History,
  ChevronRight,
  ChevronLeft,
  HeartPulse,
  GraduationCap,
  Heart,
  FileText,
  Shield,
  Banknote,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/lib/stores/authStore";

const menuGroups = [
  {
    labelKey: "groups.main",
    items: [
      { key: "dashboard",      href: "/dashboard",                   icon: LayoutDashboard },
      { key: "households",     href: "/dashboard/households",        icon: Users },
      { key: "medical",        href: "/dashboard/medical",           icon: HeartPulse },
      { key: "education",      href: "/dashboard/education",         icon: GraduationCap },
      { key: "disbursement",   href: "/dashboard/disbursement",      icon: Banknote },
      { key: "volunteers",     href: "/dashboard/volunteers",        icon: Heart },
    ]
  },
  {
    labelKey: "groups.management",
    items: [
      { key: "analytics",     href: "/dashboard/analytics",     icon: BarChart3 },
      { key: "verification",  href: "/dashboard/verification",  icon: ShieldCheck, roles: ["ADMIN", "SUPERVISOR", "WORKER"] },
      { key: "reports",       href: "/dashboard/reports",       icon: FileText },
    ]
  },
  {
    labelKey: "groups.system",
    items: [
      { key: "auditLog",    href: "/dashboard/audit",        icon: History,  roles: ["ADMIN", "SUPERVISOR"] },
      { key: "users",       href: "/dashboard/users",        icon: Shield,   roles: ["ADMIN"] },
      { key: "ruleEditor",  href: "/dashboard/admin/rules",  icon: Settings, roles: ["ADMIN"] },
    ]
  }
];

function SidebarContent({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const user = useAuthStore((s) => s.user);

  return (
    <div className="flex h-full flex-col bg-slate-900 dark:bg-slate-950 text-slate-300">
      <div className="flex items-center justify-center border-b border-white/10 px-4 py-4">
        {collapsed ? (
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-500/15 ring-1 ring-green-400/20">
            <span className="text-sm font-semibold text-green-300">C</span>
          </div>
        ) : (
          <div className="flex w-full items-center gap-3 text-start">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-green-500/15 ring-1 ring-green-400/20">
              <span className="text-sm font-semibold text-green-300">C</span>
            </div>
            <div className="min-w-0">
              <h1 className="text-base font-bold leading-tight">
                <span className="text-white">Charity</span><span className="text-green-500">Hub</span>
              </h1>
              <p className="truncate text-xs text-slate-400">Case Management</p>
            </div>
          </div>
        )}
      </div>

      <ScrollArea className="flex-1 py-3">
        <nav className="flex flex-col gap-4">
          {menuGroups.map((group, gIndex) => {
            const filteredItems = group.items.filter((item) => {
              if (!(item as any).roles) return true;
              return user && (item as any).roles.includes(user.role);
            });
            if (filteredItems.length === 0) return null;

            return (
              <div key={gIndex} className="flex flex-col gap-1 px-2.5">
                {!collapsed && (
                  <div className="flex items-center gap-3 px-3 py-1 mb-1">
                    <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">{t(group.labelKey as any)}</span>
                    <div className="h-px flex-1 bg-slate-700/50"></div>
                  </div>
                )}
                {collapsed && gIndex > 0 && (
                  <div className="mx-4 my-2 h-px bg-slate-700/50"></div>
                )}
                {filteredItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center justify-start gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-150 relative",
                      collapsed && "justify-center px-2",
                      isActive
                        ? "bg-green-500/12 text-green-300 font-medium"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    )}
                  >
                    {isActive && (
                      <div className="absolute start-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-e-full bg-green-500" />
                    )}
                    <Icon className={cn("h-[18px] w-[18px] shrink-0", isActive ? "text-green-400" : "text-slate-400 group-hover:text-white")} />
                    {!collapsed && <span className="flex-1 text-start">{t(item.key as "dashboard")}</span>}
                  </Link>
                );
              })}
            </div>
          )})}
        </nav>
      </ScrollArea>

      {user && !collapsed && (
        <div className="border-t border-slate-700 px-4 py-3 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-600 text-white font-semibold text-sm">
            {user.name.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-white">{user.name}</p>
            <Badge className="mt-0.5 border-0 bg-slate-700 text-[10px] text-slate-300 hover:bg-slate-700">
              {user.role}
            </Badge>
          </div>
        </div>
      )}
    </div>
  );
}

export function AppSidebar({
  collapsed,
  setCollapsed,
}: {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}) {
  const locale = useLocale();
  const isRtl = locale === "ar";

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-screen flex-col border-slate-700 bg-slate-900 dark:bg-slate-950 transition-all duration-300 lg:flex",
        isRtl ? "border-s" : "border-e",
        collapsed ? "w-[72px]" : "w-[248px]"
      )}
    >
      <SidebarContent collapsed={collapsed} />
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "absolute top-6 z-10 h-6 w-6 rounded-full border border-slate-700 bg-slate-800 text-slate-300 shadow-sm hover:bg-slate-700",
          isRtl ? "-start-3" : "-end-3"
        )}
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? (
          isRtl ? <ChevronLeft className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />
        ) : isRtl ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </Button>
    </aside>
  );
}

export function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const locale = useLocale();
  const t = useTranslations("common");

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <span className="sr-only">{t("mobile.open_menu")}</span>
        </Button>
      </SheetTrigger>
      <SheetContent side={locale === "ar" ? "right" : "left"} className="w-[260px] bg-slate-900 p-0">
        <SheetTitle className="sr-only">{t("mobile.menu_title")}</SheetTitle>
        <SidebarContent collapsed={false} />
      </SheetContent>
    </Sheet>
  );
}

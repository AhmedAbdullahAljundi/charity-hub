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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/lib/stores/authStore";

const menuItems = [
  { key: "dashboard", href: "/dashboard", icon: LayoutDashboard },
  { key: "households", href: "/dashboard/households", icon: Users },
  { key: "medical", href: "/dashboard/medical", icon: HeartPulse },
  { key: "education", href: "/dashboard/education", icon: GraduationCap },
  { key: "volunteers", href: "/dashboard/volunteers", icon: Heart },
  { key: "analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { key: "verification", href: "/dashboard/verification", icon: ShieldCheck },
  { key: "admin", href: "/dashboard/admin", icon: Settings },
  { key: "audit", href: "/dashboard/audit", icon: History },
  { key: "reports", href: "/dashboard/reports", icon: FileText },
  { key: "users", href: "/dashboard/users", icon: Shield },
];

function SidebarContent({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const user = useAuthStore((s) => s.user);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-center p-6 border-b border-sidebar-border">
        {collapsed ? (
          <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center">
            <span className="text-sidebar-primary-foreground font-bold text-lg">C</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center shrink-0">
              <span className="text-sidebar-primary-foreground font-bold text-lg">C</span>
            </div>
            <div>
              <h1 className="text-sidebar-foreground font-bold text-lg leading-tight">CharityHub</h1>
              <p className="text-sidebar-foreground/60 text-xs">Targeting Platform</p>
            </div>
          </div>
        )}
      </div>

      {user && !collapsed && (
        <div className="px-4 py-3 border-b border-sidebar-border">
          <p className="text-sm font-medium text-sidebar-foreground truncate">{user.name}</p>
          <Badge variant="secondary" className="mt-1 text-[10px]">
            {user.role}
          </Badge>
        </div>
      )}

      <ScrollArea className="flex-1 py-4">
        <nav className="flex flex-col gap-1 px-3">
          {menuItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 justify-start rounded-xl px-3 py-2.5 text-sm transition-all duration-200",
                  collapsed && "justify-center px-2",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span className="flex-1 text-start">{t(item.key as "dashboard")}</span>}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
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
        "hidden lg:flex flex-col h-screen bg-sidebar border-sidebar-border transition-all duration-300 sticky top-0",
        isRtl ? "border-s" : "border-e",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      <SidebarContent collapsed={collapsed} />
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "absolute top-8 h-6 w-6 rounded-full bg-sidebar-primary text-sidebar-primary-foreground shadow-lg z-10",
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
      <SheetContent side={locale === "ar" ? "right" : "left"} className="w-[260px] p-0 bg-sidebar">
        <SheetTitle className="sr-only">{t("mobile.menu_title")}</SheetTitle>
        <SidebarContent collapsed={false} />
      </SheetContent>
    </Sheet>
  );
}

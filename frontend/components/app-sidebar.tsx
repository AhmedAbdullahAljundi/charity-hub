"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  GraduationCap,
  Heart,
  FileBarChart,
  History,
  Shield,
  ChevronRight,
  ChevronLeft,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

const menuItems = [
  { label: "لوحة التحكم", href: "/dashboard", icon: LayoutDashboard },
  { label: "الأسر", href: "/dashboard/families", icon: Users },
  { label: "السجل الطبي", href: "/dashboard/medical", icon: Stethoscope },
  { label: "التعليم", href: "/dashboard/education", icon: GraduationCap },
  { label: "المتطوعين", href: "/dashboard/volunteers", icon: Heart },
  { label: "التقارير", href: "/dashboard/reports", icon: FileBarChart },
  { label: "سجل التعديلات", href: "/dashboard/audit", icon: History },
  { label: "المستخدمين والصلاحيات", href: "/dashboard/users", icon: Shield },
];

function SidebarContent({ collapsed, pathname }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-center p-6 border-b border-sidebar-border">
        {collapsed ? (
          <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center">
            <span className="text-sidebar-primary-foreground font-bold text-lg">C</span>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center shrink-0">
              <span className="text-sidebar-primary-foreground font-bold text-lg">C</span>
            </div>
            <div>
              <h1 className="text-sidebar-foreground font-bold text-lg leading-tight">CharityHub</h1>
              <p className="text-sidebar-foreground/60 text-xs">نظام إدارة الجمعيات</p>
            </div>
          </div>
        )}
      </div>

      <ScrollArea className="flex-1 py-4">
        <nav className="flex flex-col gap-1 px-3">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href));
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
                dir="rtl"
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span className="flex-1 text-start">{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      <div className="p-4 border-t border-sidebar-border">
        {!collapsed && (
          <div className="text-sidebar-foreground/40 text-xs text-center">
            CharityHub v1.0.0
          </div>
        )}
      </div>
    </div>
  );
}

export function AppSidebar({ collapsed, setCollapsed }) {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col h-screen bg-sidebar border-l border-sidebar-border transition-all duration-300 sticky top-0",
          collapsed ? "w-[72px]" : "w-[260px]"
        )}
      >
        <SidebarContent collapsed={collapsed} pathname={pathname} />
        <Button
          variant="ghost"
          size="icon"
          className="absolute -left-3 top-8 h-6 w-6 rounded-full bg-sidebar-primary text-sidebar-primary-foreground shadow-lg hover:bg-sidebar-primary/90 z-10"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronLeft className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        </Button>
      </aside>
    </>
  );
}

export function MobileSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <span className="sr-only">فتح القائمة</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[260px] p-0 bg-sidebar">
        <SheetTitle className="sr-only">القائمة الرئيسية</SheetTitle>
        <SidebarContent collapsed={false} pathname={pathname} />
      </SheetContent>
    </Sheet>
  );
}

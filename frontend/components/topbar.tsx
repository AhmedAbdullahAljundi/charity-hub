"use client";

import { useMemo, useState } from "react";
import { Bell, Search, LogOut, User, ChevronDown, Clock, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useAuthStore } from "@/lib/stores/authStore";
import { MobileSidebar } from "@/components/app-sidebar";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { getRoleBadgeClass } from "@/lib/hooks/usePermission";
import { useLocale } from "next-intl";
import { AccountSettingsModal } from "@/components/AccountSettingsModal";
import { useNotificationStore } from "@/lib/stores/notificationStore";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

const ROLE_LABELS: Record<string, { ar: string; en: string }> = {
  ADMIN:      { ar: "مدير النظام", en: "System Admin" },
  SUPERVISOR: { ar: "مشرف",        en: "Supervisor" },
  WORKER:     { ar: "موظف إدخال", en: "Data Entry" },
  VIEWER:     { ar: "مستعرض",      en: "Viewer" },
};

function formatRelativeDate(dateStr: string | null | undefined, isRtl: boolean): string {
  if (!dateStr) return isRtl ? "لا يوجد" : "Never";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return isRtl ? "لا يوجد" : "Never";
  return date.toLocaleDateString(isRtl ? "ar-EG" : "en-US", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export function Topbar() {
  const t = useTranslations("common");
  const router = useRouter();
  const locale = useLocale();
  const isRtl = locale === "ar";

  const { notifications, markAsRead, markAllAsRead, fetchNotifications } = useNotificationStore();

  useEffect(() => {
    // Fetch immediately
    void fetchNotifications();

    // Poll every 60 seconds
    const interval = setInterval(() => {
      void fetchNotifications();
    }, 60000);

    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const role = user?.role ?? "";
  const [searchValue, setSearchValue] = useState("");
  const [userPopoverOpen, setUserPopoverOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const unreadCount = notifications.filter((n) => n.unread).length;

  const roleLabel = role ? (isRtl ? ROLE_LABELS[role]?.ar : ROLE_LABELS[role]?.en) : role;
  const roleBadgeClass = getRoleBadgeClass(role);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 lg:px-6 bg-card border-b border-border shadow-sm transition-colors duration-200">
      <div className="flex items-center gap-3">
        <MobileSidebar />
        <div className="relative hidden sm:block">
          <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("topbar.search_placeholder")}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                router.push(
                  searchValue.trim()
                    ? `/dashboard/households?search=${encodeURIComponent(searchValue.trim())}`
                    : `/dashboard/households`
                );
              }
            }}
            className="w-64 lg:w-80 pe-10 bg-secondary border-0 placeholder:text-muted-foreground/60"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <LanguageSwitcher />

        {/* Notifications */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -end-0.5 h-4 w-4 rounded-full bg-destructive text-[10px] text-destructive-foreground flex items-center justify-center font-bold">
                  {unreadCount}
                </span>
              )}
              <span className="sr-only">{t("topbar.notifications")}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0">
            <div className="p-3 border-b border-border flex justify-between items-center">
              <h3 className="font-semibold text-sm">{t("topbar.notifications")}</h3>
              {unreadCount > 0 && (
                <button 
                  onClick={markAllAsRead} 
                  className="text-xs text-green-600 hover:text-green-700 font-medium"
                >
                  {isRtl ? "تحديد الكل كمقروء" : "Mark all as read"}
                </button>
              )}
            </div>
            <div className="max-h-72 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-slate-500 text-sm">
                  {isRtl ? "لا توجد إشعارات" : "No notifications"}
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => markAsRead(notif.id)}
                    className={cn(
                      "flex items-start gap-3 p-3 border-b border-border/50 last:border-0 hover:bg-accent/50 transition-colors cursor-pointer",
                      notif.unread && "bg-slate-50/50 dark:bg-slate-800/20"
                    )}
                  >
                    {notif.unread ? (
                      <span className="mt-1.5 h-2 w-2 rounded-full bg-green-500 shrink-0" />
                    ) : (
                      <span className="mt-1.5 h-2 w-2 shrink-0 bg-transparent" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-sm leading-relaxed", notif.unread ? "font-semibold text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300")}>{notif.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{notif.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* User Popover */}
        <Popover open={userPopoverOpen} onOpenChange={setUserPopoverOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" className="gap-2 px-2">
              <div className="h-8 w-8 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center">
                <span className="text-green-600 dark:text-green-400 text-sm font-bold">
                  {user?.name?.[0] || "U"}
                </span>
              </div>
              <div className="hidden md:flex flex-col items-start">
                <span className="text-sm font-medium leading-none">
                  {user?.name || t("topbar.admin")}
                </span>
                {role && (
                  <span className={`mt-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${roleBadgeClass}`}>
                    {roleLabel}
                  </span>
                )}
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground hidden md:inline" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-64 p-0">
            {/* User info header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center shrink-0">
                  <span className="text-green-600 dark:text-green-400 font-bold">
                    {user?.name?.[0] || "U"}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                    {isRtl ? "مرحباً،" : "Hello,"} {user?.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
              </div>
              {/* Role badge */}
              {role && (
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${roleBadgeClass}`}>
                  {isRtl ? "الدور:" : "Role:"} {roleLabel}
                </span>
              )}
            </div>

            {/* Last login */}
            {(user as any)?.lastLoginAt && (
              <div className="px-4 py-2.5 border-b border-border flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {isRtl ? "آخر دخول: " : "Last login: "}
                  {formatRelativeDate((user as any).lastLoginAt, isRtl)}
                </span>
              </div>
            )}

            {/* Actions */}
            <div className="p-2">
              <button 
                onClick={() => { setSettingsOpen(true); setUserPopoverOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-accent rounded-lg transition-colors"
              >
                <Settings className="w-4 h-4" />
                {isRtl ? "إعدادات الحساب" : "Account Settings"}
              </button>
              <button
                onClick={() => { void logout(); setUserPopoverOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                {isRtl ? "تسجيل الخروج" : "Sign Out"}
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {settingsOpen && (
        <AccountSettingsModal onClose={() => setSettingsOpen(false)} />
      )}
    </header>
  );
}

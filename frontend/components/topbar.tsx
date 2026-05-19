"use client";

import { useMemo, useState } from "react";
import { Bell, Search, LogOut, User, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useAuthStore } from "@/lib/stores/authStore";
import { useFamiliesStore } from "@/lib/store";
import { MobileSidebar } from "@/components/app-sidebar";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/common/theme-toggle";

export function Topbar() {
  const t = useTranslations("common");
  const router = useRouter();
  const notifications = useMemo(
    () => [
      { id: 1, text: t("demo_notifications.n1"), time: t("demo_notifications.t1"), unread: true },
      { id: 2, text: t("demo_notifications.n2"), time: t("demo_notifications.t2"), unread: true },
      { id: 3, text: t("demo_notifications.n3"), time: t("demo_notifications.t3"), unread: false },
      { id: 4, text: t("demo_notifications.n4"), time: t("demo_notifications.t4"), unread: false },
    ],
    [t]
  );

  const user = useAuthStore(state => state.user);
  const logout = useAuthStore((state) => state.logout);
  const role = user?.role;
  const filters = useFamiliesStore(state => state.filters);
  const setFilters = useFamiliesStore(state => state.setFilters);
  const [searchValue, setSearchValue] = useState(filters.search || "");
  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 lg:px-6 bg-card border-b border-border shadow-sm transition-colors duration-200">
      <div className="flex items-center gap-3">
        <MobileSidebar />
        <div className="relative hidden sm:block">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground rtl:right-auto rtl:left-3" />
          <Input
            placeholder={t("topbar.search_placeholder")}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setFilters({ search: searchValue });
                router.push("/dashboard/families");
              }
            }}
            className="w-64 lg:w-80 pr-10 rtl:pr-3 rtl:pl-10 bg-secondary border-0 placeholder:text-muted-foreground/60"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <LanguageSwitcher />
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -left-0.5 rtl:left-auto rtl:-right-0.5 h-4 w-4 rounded-full bg-destructive text-[10px] text-destructive-foreground flex items-center justify-center font-bold">
                  {unreadCount}
                </span>
              )}
              <span className="sr-only">{t("topbar.notifications")}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0">
            <div className="p-3 border-b border-border">
              <h3 className="font-semibold text-sm">{t("topbar.notifications")}</h3>
            </div>
            <div className="max-h-72 overflow-y-auto">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className="flex items-start gap-3 p-3 border-b border-border/50 last:border-0 hover:bg-accent/50 transition-colors"
                >
                  {notif.unread ? (
                    <span className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />
                  ) : (
                    <span className="mt-1.5 h-2 w-2 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-relaxed">{notif.text}</p>
                    <p className="text-xs text-muted-foreground mt-1">{notif.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 px-2">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground text-sm font-bold">
                  {user?.name?.[0] || t("topbar.admin").charAt(0)}
                </span>
              </div>
              <span className="hidden md:inline text-sm font-medium">
                {user?.name || t("topbar.admin")}
                {role && (
                  <Badge variant="outline" className="ms-2 text-[10px] py-0">
                    {role}
                  </Badge>
                )}
              </span>
              <ChevronDown className="h-4 w-4 text-muted-foreground hidden md:inline" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem className="gap-2 cursor-pointer">
              <User className="h-4 w-4" />
              <span>{t("topbar.profile")}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 cursor-pointer text-destructive"
              onClick={() => void logout()}
            >
              <LogOut className="h-4 w-4" />
              <span>{t("topbar.logout")}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

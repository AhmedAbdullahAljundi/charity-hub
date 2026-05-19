"use client";

import * as React from "react";
import { Globe, Check, Languages } from "lucide-react";
import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function LanguageSwitcher() {
  const t = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const setLocale = (next: "ar" | "en") => {
    if (next === locale) return;
    if (typeof window !== "undefined") {
      localStorage.setItem("charityhub_lang", next);
    }
    router.replace(pathname, { locale: next });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-9 gap-2 rounded-lg border-border/60 px-2.5 text-xs font-medium shadow-none",
            "transition-colors duration-200 hover:bg-accent"
          )}
          aria-label={t("language.menu_label")}
        >
          <Globe className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          <span className="hidden sm:inline">{locale === "ar" ? t("language.ar") : t("language.en")}</span>
          <Languages className="size-3.5 shrink-0 opacity-60 sm:hidden" aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[12rem] p-1">
        <DropdownMenuItem
          className={cn("gap-2 rounded-md cursor-pointer", locale === "ar" && "bg-accent")}
          onClick={() => setLocale("ar")}
        >
          <span className="flex flex-1 flex-col gap-0.5">
            <span className="font-medium">{t("language.ar")}</span>
            <span className="text-[10px] text-muted-foreground">{t("language.ar_hint")}</span>
          </span>
          {locale === "ar" ? <Check className="size-4 text-primary shrink-0" /> : <span className="size-4 shrink-0" />}
        </DropdownMenuItem>
        <DropdownMenuSeparator className="my-1" />
        <DropdownMenuItem
          className={cn("gap-2 rounded-md cursor-pointer", locale === "en" && "bg-accent")}
          onClick={() => setLocale("en")}
        >
          <span className="flex flex-1 flex-col gap-0.5">
            <span className="font-medium">{t("language.en")}</span>
            <span className="text-[10px] text-muted-foreground">{t("language.en_hint")}</span>
          </span>
          {locale === "en" ? <Check className="size-4 text-primary shrink-0" /> : <span className="size-4 shrink-0" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

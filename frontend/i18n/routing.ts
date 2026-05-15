import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["ar", "en"],
  defaultLocale: "ar",
  localePrefix: "always",
  localeCookie: {
    name: "charityhub_lang",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
    sameSite: "lax",
  },
});

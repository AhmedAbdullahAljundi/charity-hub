import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

import arCommon from "../messages/ar/common.json";
import arDomain from "../messages/ar/domain.json";
import arDashboard from "../messages/ar/dashboard.json";
import arFamilies from "../messages/ar/families.json";
import arForms from "../messages/ar/forms.json";
import arSurface from "../messages/ar/surface.json";
import arUsers from "../messages/ar/users.json";
import arVolunteers from "../messages/ar/volunteers.json";

import enCommon from "../messages/en/common.json";
import enDomain from "../messages/en/domain.json";
import enDashboard from "../messages/en/dashboard.json";
import enFamilies from "../messages/en/families.json";
import enForms from "../messages/en/forms.json";
import enSurface from "../messages/en/surface.json";
import enUsers from "../messages/en/users.json";
import enVolunteers from "../messages/en/volunteers.json";

const messagesMap = {
  ar: {
    common: arCommon,
    domain: arDomain,
    dashboard: arDashboard,
    families: arFamilies,
    forms: arForms,
    surface: arSurface,
    users: arUsers,
    volunteers: arVolunteers,
  },
  en: {
    common: enCommon,
    domain: enDomain,
    dashboard: enDashboard,
    families: enFamilies,
    forms: enForms,
    surface: enSurface,
    users: enUsers,
    volunteers: enVolunteers,
  }
};

/**
 * Message loading: Statically mapped JSON files.
 * Replaced slow `import()` dynamic imports which caused Next.js routing bottlenecks.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  const data = messagesMap[locale as "ar" | "en"];
  const formsData = data.forms as { validation: Record<string, unknown>; auth: Record<string, unknown> };
  const surfaceData = data.surface as {
    education: Record<string, unknown>;
    medical: Record<string, unknown>;
    audit: Record<string, unknown>;
    reports: Record<string, unknown>;
  };

  return {
    locale,
    messages: {
      common: data.common,
      domain: data.domain,
      dashboard: data.dashboard,
      families: data.families,
      validation: formsData.validation,
      auth: formsData.auth,
      education: surfaceData.education,
      medical: surfaceData.medical,
      audit: surfaceData.audit,
      reports: surfaceData.reports,
      users: data.users,
      volunteers: data.volunteers,
    },
  };
});

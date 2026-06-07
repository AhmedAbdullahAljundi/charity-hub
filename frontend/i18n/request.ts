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
import arScoring from "../messages/ar/scoring.json";
import arRules from "../messages/ar/rules.json";
import arHouseholds from "../messages/ar/households.json";
import arVerification from "../messages/ar/verification.json";
import arRuleEditor from "../messages/ar/ruleEditor.json";
import arAnalytics from "../messages/ar/analytics.json";
import arEducation from "../messages/ar/education.json";
import arDisbursement from "../messages/ar/disbursement.json";

import enCommon from "../messages/en/common.json";
import enDomain from "../messages/en/domain.json";
import enDashboard from "../messages/en/dashboard.json";
import enFamilies from "../messages/en/families.json";
import enForms from "../messages/en/forms.json";
import enSurface from "../messages/en/surface.json";
import enUsers from "../messages/en/users.json";
import enVolunteers from "../messages/en/volunteers.json";
import enScoring from "../messages/en/scoring.json";
import enRules from "../messages/en/rules.json";
import enHouseholds from "../messages/en/households.json";
import enVerification from "../messages/en/verification.json";
import enRuleEditor from "../messages/en/ruleEditor.json";
import enAnalytics from "../messages/en/analytics.json";
import enEducation from "../messages/en/education.json";
import enDisbursement from "../messages/en/disbursement.json";

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
    scoring: arScoring,
    rules: arRules,
    households: arHouseholds,
    verification: arVerification,
    ruleEditor: arRuleEditor,
    analytics: arAnalytics,
    education: arEducation,
    disbursement: arDisbursement,
    nav: arCommon.nav,
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
    scoring: enScoring,
    rules: enRules,
    households: enHouseholds,
    verification: enVerification,
    ruleEditor: enRuleEditor,
    analytics: enAnalytics,
    education: enEducation,
    disbursement: enDisbursement,
    nav: enCommon.nav,
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
      education: data.education,
      medical: surfaceData.medical,
      audit: surfaceData.audit,
      reports: surfaceData.reports,
      users: data.users,
      volunteers: data.volunteers,
      scoring: data.scoring,
      rules: data.rules,
      households: data.households,
      verification: data.verification,
      ruleEditor: data.ruleEditor,
      analytics: data.analytics,
      disbursement: data.disbursement,
      nav: data.nav,
    },
  };
});
// Trigger reload for analytics.json keys update
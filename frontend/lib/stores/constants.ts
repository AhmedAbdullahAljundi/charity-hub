"use client";

/** Canonical Arabic value (API) + stable key for `families.dictionaries.*` */
export type LabeledValue = { readonly value: string; readonly key: string };

/* ─────────── Income Source Types ─────────── */
export const INCOME_SOURCES: LabeledValue[] = [
  { value: "عمل يومي", key: "daily_work" },
  { value: "عمل حر", key: "freelance" },
  { value: "راتب ثابت", key: "fixed_salary" },
  { value: "معاش تأميني", key: "pension" },
  { value: "تكافل وكرامة", key: "takafol" },
  { value: "مساعدات أهالي 1", key: "family_aid_1" },
  { value: "مساعدات أهالي 2", key: "family_aid_2" },
  { value: "مساعدات أهالي 3", key: "family_aid_3" },
  { value: "مساعدات جمعية خيرية 1", key: "charity_aid_1" },
  { value: "مساعدات جمعية خيرية 2", key: "charity_aid_2" },
  { value: "مساعدات غذائية شهرية", key: "monthly_food_aid" },
  { value: "دخل من مشاريع", key: "project_income" },
  { value: "دخل من عقارات", key: "real_estate_income" },
  { value: "شهريات الأبناء العاملين", key: "children_support" },
  { value: "أنشطة مكسبة للمال (الزوج)", key: "husband_income_activity" },
  { value: "أنشطة مكسبة للمال (الزوجة)", key: "wife_income_activity" },
  { value: "بطاقة التموين", key: "ration_card" },
  { value: "تدخين يومي × 30 (ردع)", key: "smoking_deterrent" },
  { value: "أخرى", key: "other" },
];

/* ─────────── Expense Categories ─────────── */
export const EXPENSE_CATEGORIES: LabeledValue[] = [
  { value: "إيجار المسكن", key: "rent" },
  { value: "أقساط", key: "installments" },
  { value: "غذاء", key: "food" },
  { value: "كهرباء ومياه وغاز", key: "utilities" },
  { value: "مواصلات", key: "transport" },
  { value: "علاج ودواء", key: "medical" },
  { value: "تعليم ومصاريف مدرسة", key: "education" },
  { value: "ملابس", key: "clothing" },
  { value: "مستلزمات منزلية", key: "household" },
  { value: "اتصالات", key: "communications" },
  { value: "ديون مستحقة", key: "debts" },
  { value: "أخرى", key: "other" },
];

/* ─────────── Case Categories ─────────── */
export const CASE_CATEGORIES: LabeledValue[] = [
  { value: "أسرة أيتام", key: "orphans" },
  { value: "مطلقات", key: "divorced" },
  { value: "فقراء", key: "poor" },
  { value: "مساكين", key: "needy" },
  { value: "أسر إعاقة", key: "disability" },
  { value: "طالب علم", key: "student" },
  { value: "أسر سجناء", key: "prisoner" },
  { value: "كبار سن", key: "elderly" },
  { value: "حالات هجر واختفاء الزوج", key: "absence" },
  { value: "أمراض مزمنة", key: "chronic" },
  { value: "إصابة مؤقتة", key: "temporary_injury" },
  { value: "أرامل", key: "widows" },
  { value: "لا يستحق", key: "ineligible" },
];

/* ─────────── Aid Decision Types ─────────── */
export const AID_DECISIONS: LabeledValue[] = [
  { value: "مساعدات مادية شهرية", key: "monthly_material" },
  { value: "مساعدات علاجية شهرية", key: "monthly_medical" },
  { value: "مساعدات موسمية غذائية", key: "seasonal_food" },
  { value: "مساعدات موسمية مادية", key: "seasonal_material" },
  { value: "مساعدات موسمية غذائية ومادية", key: "seasonal_both" },
  { value: "لا يستحق", key: "none" },
];

/* ─────────── Family Member Relations ─────────── */
export const MEMBER_RELATIONS: LabeledValue[] = [
  { value: "رب الأسرة", key: "head" },
  { value: "الزوجة", key: "wife" },
  { value: "ابن", key: "son" },
  { value: "ابنة", key: "daughter" },
  { value: "الأم", key: "mother" },
  { value: "الأب", key: "father" },
  { value: "أخ", key: "brother" },
  { value: "أخت", key: "sister" },
  { value: "حفيد", key: "grandson" },
  { value: "حفيدة", key: "granddaughter" },
  { value: "قريب آخر", key: "other_relative" },
];

/* ─────────── Education Levels ─────────── */
export const EDUCATION_LEVELS: LabeledValue[] = [
  { value: "أمي (لا يقرأ ولا يكتب)", key: "illiterate" },
  { value: "يقرأ ويكتب", key: "literate" },
  { value: "ابتدائي", key: "primary" },
  { value: "إعدادي", key: "preparatory" },
  { value: "ثانوي عام", key: "secondary" },
  { value: "ثانوي فني", key: "technical_secondary" },
  { value: "دبلوم", key: "diploma" },
  { value: "جامعي", key: "university" },
  { value: "دراسات عليا", key: "postgraduate" },
  { value: "حضانة", key: "kindergarten" },
  { value: "لا ينطبق (رضيع)", key: "infant_na" },
];

export type DisabilityClassRow = {
  readonly code: string;
  readonly key: "a" | "b" | "c" | "d";
  readonly score: number;
};

/* ─────────── Disability Classifications ─────────── */
export const DISABILITY_CLASSES: DisabilityClassRow[] = [
  { code: "أ", key: "a", score: 0.2 },
  { code: "ب", key: "b", score: 0.5 },
  { code: "ج", key: "c", score: 0.8 },
  { code: "د", key: "d", score: 1.2 },
];

export type ChronicSeverityRow = {
  readonly code: string;
  readonly key: "mild" | "moderate" | "severe" | "critical";
  readonly score: number;
};

/* ─────────── Chronic Illness Severity ─────────── */
export const CHRONIC_SEVERITY: ChronicSeverityRow[] = [
  { code: "خفيف", key: "mild", score: 0.2 },
  { code: "متوسط", key: "moderate", score: 0.5 },
  { code: "شديد", key: "severe", score: 0.8 },
  { code: "حرج", key: "critical", score: 1.0 },
];

export const GENDER_OPTIONS: LabeledValue[] = [
  { value: "ذكر", key: "male" },
  { value: "أنثى", key: "female" },
];

export const MARITAL_OPTIONS: LabeledValue[] = [
  { value: "أعزب", key: "single_m" },
  { value: "متزوج", key: "married_m" },
  { value: "متزوجة", key: "married_f" },
  { value: "مطلق", key: "divorced_m" },
  { value: "مطلقة", key: "divorced_f" },
  { value: "أرمل", key: "widower" },
  { value: "أرملة", key: "widow" },
  { value: "غير متزوجة", key: "single_f" },
];

export const INCOME_FREQUENCIES: LabeledValue[] = [{ value: "شهري", key: "monthly" }];

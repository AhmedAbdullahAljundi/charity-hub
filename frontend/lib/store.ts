import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "./api";

/* ─────────── Auth Store ─────────── */
interface AuthState {
  user: any;
  token: any;
  isAuthenticated: boolean;
  login: (user: any, token: string) => void;
  logout: () => void;
}
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => {
        if (typeof window !== "undefined") {
          localStorage.setItem("charityhub_token", token);
        }
        set({ user, token, isAuthenticated: true });
      },
      logout: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("charityhub_token");
        }
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    { name: "charityhub-auth" }
  )
);

/* ─────────── Dashboard Store ─────────── */
type DashboardEndpointKey = "stats" | "prediction" | "regions" | "workflow";

interface DashboardState {
  stats: any;
  familyClassification: any;
  classificationExpenses: any;
  monthlyIncome: any;
  monthlyRegistrations: any;
  monthlySeries: any[];
  financialTrendMonthly: any[];
  prediction: Record<string, unknown> | null;
  regionsOverview: any[];
  workflow: Record<string, unknown> | null;
  loadingDashboard: boolean;
  /** Set only when every dashboard endpoint failed */
  dashboardError: string | null;
  /** Per-widget failures; UI can show inline without blocking the page */
  dashboardErrors: Record<DashboardEndpointKey, string | null>;
  setStats: (stats: any) => void;
  fetchStats: () => Promise<void>;
  fetchDashboardBundle: (force?: boolean) => Promise<void>;
}
/** Module-level cache: timestamp of the last successful dashboard bundle fetch */
let _dashboardFetchedAt = 0;
const DASHBOARD_TTL_MS = 5 * 60 * 1000; // 5 minutes

export const useDashboardStore = create<DashboardState>()((set, get) => ({
  stats: {
    totalFamilies: 0,
    totalNeed: 0,
    totalIncome: 0,
    vulnerabilityIndex: 0,
    criticalMedical: 0,
    incompleteFamilies: 0,
    criticalFamilies: 0,
  },
  familyClassification: [],
  classificationExpenses: [],
  monthlyIncome: [],
  monthlyRegistrations: [],
  monthlySeries: [],
  financialTrendMonthly: [],
  prediction: null,
  regionsOverview: [],
  workflow: null,
  loadingDashboard: false,
  dashboardError: null,
  dashboardErrors: { stats: null, prediction: null, regions: null, workflow: null },
  setStats: (stats) => set({ stats }),
  fetchStats: async () => {
    await get().fetchDashboardBundle();
  },
  fetchDashboardBundle: async (force = false) => {
    const now = Date.now();
    // Skip fetch if data is fresh and not forced (e.g. user presses Refresh)
    if (!force && now - _dashboardFetchedAt < DASHBOARD_TTL_MS && get().stats.totalFamilies > 0) {
      return;
    }
    const prev = get();
    set({
      loadingDashboard: true,
      dashboardError: null,
      dashboardErrors: { stats: null, prediction: null, regions: null, workflow: null },
    });

    const results = await Promise.allSettled([
      api.get("/v1/dashboard/stats"),
      api.get("/v1/dashboard/prediction"),
      api.get("/v1/dashboard/regions-overview"),
      api.get("/v1/dashboard/workflow"),
    ]);

    const errors: Record<DashboardEndpointKey, string | null> = {
      stats: null,
      prediction: null,
      regions: null,
      workflow: null,
    };

    let statsPayload = prev.stats;
    let familyClassification = prev.familyClassification;
    let classificationExpenses = prev.classificationExpenses;
    let monthlySeries = prev.monthlySeries;
    let financialTrendMonthly = prev.financialTrendMonthly;
    let monthlyRegistrations = prev.monthlyRegistrations;
    let monthlyIncome = prev.monthlyIncome;
    let prediction = prev.prediction;
    let regionsOverview = prev.regionsOverview;
    let workflow = prev.workflow;

    const parseOk = (idx: number) => {
      const r = results[idx];
      if (r.status !== "fulfilled") return { ok: false as const, reason: "NETWORK" };
      const body = r.value.data as {
        success?: boolean;
        data?: unknown;
        error?: { code?: string; message?: string };
      };
      if (body?.success && body.data !== undefined && body.data !== null)
        return { ok: true as const, data: body.data };
      return {
        ok: false as const,
        reason: body?.error?.code || body?.error?.message || "API_ERROR",
      };
    };

    const s = parseOk(0);
    if (s.ok) {
      const d = s.data as Record<string, unknown>;
      statsPayload = d.stats ?? prev.stats;
      familyClassification = Array.isArray(d.familyClassification) ? d.familyClassification : [];
      classificationExpenses = Array.isArray(d.classificationExpenses) ? d.classificationExpenses : [];
      monthlySeries = Array.isArray(d.monthlySeries) ? d.monthlySeries : [];
      financialTrendMonthly = Array.isArray(d.financialTrendMonthly) ? d.financialTrendMonthly : [];
      const registrationsLine =
        Array.isArray(d.monthlySeries) && d.monthlySeries.length > 0
          ? d.monthlySeries.map((row: Record<string, unknown>) => ({
              month: String(row.monthLabelShort ?? ""),
              families: Number(row.families ?? 0),
            }))
          : [];
      const incomeTrend = Array.isArray(d.monthlySeries)
        ? d.monthlySeries.map((row: Record<string, unknown>) => ({
            label: String(row.monthLabelShort ?? ""),
            amt: Number(row.householdIncome ?? 0),
          }))
        : [];
      monthlyRegistrations = registrationsLine;
      monthlyIncome = incomeTrend;
    } else {
      errors.stats = s.reason;
    }

    const p = parseOk(1);
    if (p.ok) prediction = p.data as Record<string, unknown>;
    else errors.prediction = p.reason;

    const g = parseOk(2);
    if (g.ok) regionsOverview = Array.isArray(g.data) ? g.data : [];
    else errors.regions = g.reason;

    const w = parseOk(3);
    if (w.ok) workflow = w.data as Record<string, unknown>;
    else errors.workflow = w.reason;

    const anyOk = s.ok || p.ok || g.ok || w.ok;
    if (!anyOk) {
      console.error("Dashboard bundle: all endpoints failed", errors);
    } else {
      _dashboardFetchedAt = Date.now(); // stamp cache only on partial/full success
    }

    set({
      stats: statsPayload,
      familyClassification,
      classificationExpenses,
      monthlySeries,
      financialTrendMonthly,
      monthlyRegistrations,
      monthlyIncome,
      prediction,
      regionsOverview,
      workflow,
      dashboardErrors: errors,
      dashboardError: anyOk ? null : "LOAD_FAILED",
      loadingDashboard: false,
    });
  },
}));

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

/* ─────────── Families Store (Full Data Model) ─────────── */
interface FamiliesState {
  families: any[];
  filters: any;
  selectedFamily: any;
  loading?: boolean;
  error?: string | null;
  setFilters: (filters: any) => void;
  fetchFamilies: () => Promise<void>;
  fetchFamilyDetails: (id: string | number) => Promise<void>;
  setSelectedFamily: (family: any) => void;
  addFamily: (family: any) => void;
  updateFamily: (id: string | number, updates: any) => void;
  deleteFamily: (id: string | number) => Promise<void>;
  addMember: (familyId: string | number, member: any) => Promise<void>;
  updateMember: (familyId: string | number, memberId: string | number, updates: any) => Promise<void>;
  deleteMember: (familyId: string | number, memberId: string | number) => Promise<void>;
  addIncome: (familyId: string | number, income: any) => Promise<void>;
  deleteIncome: (familyId: string | number, incomeId: string | number) => Promise<void>;
  addExpense: (familyId: string | number, expense: any) => Promise<void>;
  deleteExpense: (familyId: string | number, expenseId: string | number) => Promise<void>;
  addMedicalRecord: (familyId: string | number, personId: string | number, record: any) => Promise<void>;
  deleteMedicalRecord: (familyId: string | number, recordId: string | number) => Promise<void>;
}

/** Debounce timer for search/filter changes — fires fetchFamilies 400ms after last setFilters call */
let _searchTimer: ReturnType<typeof setTimeout> | null = null;
function _scheduleSearch(get: () => FamiliesState) {
  if (_searchTimer) clearTimeout(_searchTimer);
  _searchTimer = setTimeout(() => {
    _searchTimer = null;
    get().fetchFamilies();
  }, 400);
}

export const useFamiliesStore = create<FamiliesState>()((set, get) => ({
  // ── Initial state: empty (data loaded from backend) ──

  families: [],
  filters: {
    search: "",
    classification: "all",
    category: "all",
  },
  selectedFamily: null,

  setFilters: (filters) => {
    set((state) => ({ filters: { ...state.filters, ...filters } }));
    _scheduleSearch(get);
  },

  fetchFamilies: async () => {
    try {
      set({ loading: true, error: null });
      const { filters } = get();
      const params = new URLSearchParams();
      if (filters.search) params.append("search", filters.search);
      if (filters.classification && filters.classification !== "all") {
        params.append("classification", filters.classification);
      }

      const response = await api.get(`/v1/families?${params.toString()}`);
      if (response.data.success) {
        set({ families: response.data.data, loading: false });
      }
    } catch (error) {
      console.error("Fetch families error", error);
      set({ error: "فشل تحميل البيانات", loading: false });
    }
  },

  fetchFamilyDetails: async (id) => {
    try {
      set({ loading: true, error: null });
      const response = await api.get(`/v1/families/${id}`);
      if (response.data.success) {
        const fullData = response.data.data;
        set((state) => ({
          families: state.families.some((f) => String(f.id) === String(id))
            ? state.families.map((f) => (String(f.id) === String(id) ? fullData : f))
            : [...state.families, fullData],
          loading: false,
        }));
      }
    } catch (error) {
      console.error("Fetch family details error", error);
      set({ error: "فشل تحميل تفاصيل الأسرة", loading: false });
    }
  },

  setSelectedFamily: (family) => set({ selectedFamily: family }),

  addFamily: (family: any) =>
    set((state: any) => ({
      families: [
        ...state.families,
        {
          ...family,
          id: family.id || Math.random().toString(36).substr(2, 9),
          members: family.members || [],
          income: family.income || [],
          expenses: family.expenses || [],
          medicalRecords: family.medicalRecords || [],
          totalIncome: family.totalIncome || 0,
          totalExpenses: family.totalExpenses || 0,
          vulnerabilityIndex: family.vulnerabilityIndex || 0,
          classification: family.classification || "متوسط",
        },
      ],
    })),

  updateFamily: (id: string | number, updates: any) =>
    set((state: any) => ({
      families: state.families.map((f: any) => (f.id === id ? { ...f, ...updates } : f)),
    })),

  deleteFamily: async (id) => {
    try {
      await api.delete(`/v1/families/${id}`);
      set((state) => ({
        families: state.families.filter((f) => f.id !== id),
      }));
    } catch (error) {
      console.error("Delete family error", error);
      throw error;
    }
  },

  /* ── Member CRUD ── */
  addMember: async (familyId, member) => {
    // Optimistic: add a temp placeholder immediately
    const tempId = `temp-${Date.now()}`;
    set((state: any) => ({
      families: state.families.map((f: any) =>
        String(f.id) === String(familyId)
          ? { ...f, members: [...(f.members || []), { ...member, id: tempId, _temp: true }] }
          : f
      ),
    }));
    try {
      const response = await api.post(`/v1/families/${familyId}/persons`, member);
      if (response.data.success) {
        const newMember = response.data.data ?? { ...member, id: tempId };
        // Replace temp with real server data
        set((state: any) => ({
          families: state.families.map((f: any) =>
            String(f.id) === String(familyId)
              ? {
                  ...f,
                  members: (f.members || []).map((m: any) =>
                    m.id === tempId ? { ...newMember, _temp: undefined } : m
                  ),
                }
              : f
          ),
        }));
      }
    } catch (error) {
      // Rollback on failure
      set((state: any) => ({
        families: state.families.map((f: any) =>
          String(f.id) === String(familyId)
            ? { ...f, members: (f.members || []).filter((m: any) => m.id !== tempId) }
            : f
        ),
      }));
      console.error("Add member error", error);
      throw error;
    }
  },

  updateMember: async (familyId, memberId, updates) => {
    // Snapshot for rollback
    const prev = get().families;
    set((state: any) => ({
      families: state.families.map((f: any) => {
        if (String(f.id) !== String(familyId)) return f;
        return {
          ...f,
          members: Array.isArray(f.members)
            ? f.members.map((m: any) => (String(m.id) === String(memberId) ? { ...m, ...updates } : m))
            : f.members,
        };
      }),
    }));
    try {
      await api.patch(`/v1/families/persons/${memberId}`, updates);
    } catch (error) {
      set({ families: prev });
      console.error("Update member error", error);
      throw error;
    }
  },

  deleteMember: async (familyId, memberId) => {
    // Optimistic remove
    const prev = get().families;
    set((state: any) => ({
      families: state.families.map((f: any) =>
        String(f.id) === String(familyId)
          ? { ...f, members: (f.members || []).filter((m: any) => String(m.id) !== String(memberId)) }
          : f
      ),
    }));
    try {
      await api.delete(`/v1/families/persons/${memberId}`);
    } catch (error) {
      set({ families: prev });
      console.error("Delete member error", error);
      throw error;
    }
  },

  /* ── Income CRUD ── */
  addIncome: async (familyId, income) => {
    const tempId = `temp-${Date.now()}`;
    set((state: any) => ({
      families: state.families.map((f: any) =>
        String(f.id) === String(familyId)
          ? { ...f, incomes: [...(f.incomes || f.income || []), { ...income, id: tempId, _temp: true }] }
          : f
      ),
    }));
    try {
      const response = await api.post(`/v1/families/${familyId}/incomes`, income);
      if (response.data.success) {
        const newIncome = response.data.data ?? { ...income, id: tempId };
        set((state: any) => ({
          families: state.families.map((f: any) =>
            String(f.id) === String(familyId)
              ? {
                  ...f,
                  incomes: (f.incomes || f.income || []).map((inc: any) =>
                    inc.id === tempId ? { ...newIncome, _temp: undefined } : inc
                  ),
                }
              : f
          ),
        }));
      }
    } catch (error) {
      set((state: any) => ({
        families: state.families.map((f: any) =>
          String(f.id) === String(familyId)
            ? { ...f, incomes: (f.incomes || f.income || []).filter((inc: any) => inc.id !== tempId) }
            : f
        ),
      }));
      console.error("Add income error", error);
      throw error;
    }
  },

  deleteIncome: async (familyId, incomeId) => {
    const prev = get().families;
    set((state: any) => ({
      families: state.families.map((f: any) =>
        String(f.id) === String(familyId)
          ? {
              ...f,
              incomes: (f.incomes || f.income || []).filter((inc: any) => String(inc.id) !== String(incomeId)),
              income: (f.income || f.incomes || []).filter((inc: any) => String(inc.id) !== String(incomeId)),
            }
          : f
      ),
    }));
    try {
      await api.delete(`/v1/families/incomes/${incomeId}`);
    } catch (error) {
      set({ families: prev });
      console.error("Delete income error", error);
      throw error;
    }
  },

  /* ── Expenses CRUD ── */
  addExpense: async (familyId, expense) => {
    const tempId = `temp-${Date.now()}`;
    set((state: any) => ({
      families: state.families.map((f: any) =>
        String(f.id) === String(familyId)
          ? { ...f, expenses: [...(f.expenses || []), { ...expense, id: tempId, _temp: true }] }
          : f
      ),
    }));
    try {
      const response = await api.post(`/v1/families/${familyId}/expenses`, expense);
      if (response.data.success) {
        const newExpense = response.data.data ?? { ...expense, id: tempId };
        set((state: any) => ({
          families: state.families.map((f: any) =>
            String(f.id) === String(familyId)
              ? {
                  ...f,
                  expenses: (f.expenses || []).map((exp: any) =>
                    exp.id === tempId ? { ...newExpense, _temp: undefined } : exp
                  ),
                }
              : f
          ),
        }));
      }
    } catch (error) {
      set((state: any) => ({
        families: state.families.map((f: any) =>
          String(f.id) === String(familyId)
            ? { ...f, expenses: (f.expenses || []).filter((exp: any) => exp.id !== tempId) }
            : f
        ),
      }));
      console.error("Add expense error", error);
      throw error;
    }
  },

  deleteExpense: async (familyId, expenseId) => {
    const prev = get().families;
    set((state: any) => ({
      families: state.families.map((f: any) =>
        String(f.id) === String(familyId)
          ? { ...f, expenses: (f.expenses || []).filter((exp: any) => String(exp.id) !== String(expenseId)) }
          : f
      ),
    }));
    try {
      await api.delete(`/v1/families/expenses/${expenseId}`);
    } catch (error) {
      set({ families: prev });
      console.error("Delete expense error", error);
      throw error;
    }
  },

  /* ── Medical Records CRUD ── */
  addMedicalRecord: async (familyId, personId, record) => {
    const tempId = `temp-${Date.now()}`;
    set((state: any) => ({
      families: state.families.map((f: any) =>
        String(f.id) === String(familyId)
          ? { ...f, medicalRecords: [...(f.medicalRecords || []), { ...record, id: tempId, personId, _temp: true }] }
          : f
      ),
    }));
    try {
      const response = await api.post(`/v1/families/persons/${personId}/medical`, record);
      if (response.data.success) {
        const newRecord = response.data.data ?? { ...record, id: tempId, personId };
        set((state: any) => ({
          families: state.families.map((f: any) =>
            String(f.id) === String(familyId)
              ? {
                  ...f,
                  medicalRecords: (f.medicalRecords || []).map((r: any) =>
                    r.id === tempId ? { ...newRecord, _temp: undefined } : r
                  ),
                }
              : f
          ),
        }));
      }
    } catch (error) {
      set((state: any) => ({
        families: state.families.map((f: any) =>
          String(f.id) === String(familyId)
            ? { ...f, medicalRecords: (f.medicalRecords || []).filter((r: any) => r.id !== tempId) }
            : f
        ),
      }));
      console.error("Add medical record error", error);
      throw error;
    }
  },

  deleteMedicalRecord: async (familyId, recordId) => {
    const prev = get().families;
    set((state: any) => ({
      families: state.families.map((f: any) =>
        String(f.id) === String(familyId)
          ? { ...f, medicalRecords: (f.medicalRecords || []).filter((r: any) => String(r.id) !== String(recordId)) }
          : f
      ),
    }));
    try {
      await api.delete(`/v1/families/medical/${recordId}`);
    } catch (error) {
      set({ families: prev });
      console.error("Delete medical record error", error);
      throw error;
    }
  },
}));

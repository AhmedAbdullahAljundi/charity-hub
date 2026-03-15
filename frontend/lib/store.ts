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
interface DashboardState {
  stats: any;
  familyClassification: any;
  classificationExpenses: any;
  monthlyIncome: any;
  monthlyRegistrations: any;
  setStats: (stats: any) => void;
  fetchStats: () => Promise<void>;
}
export const useDashboardStore = create<DashboardState>()((set) => ({
  stats: {
    totalFamilies: 0,
    totalNeed: 0,
    totalIncome: 0,
    vulnerabilityIndex: 0,
    criticalMedical: 0,
  },
  familyClassification: [],
  classificationExpenses: [],
  monthlyIncome: [],
  monthlyRegistrations: [],
  setStats: (stats) => set({ stats }),
  fetchStats: async () => {
    try {
      const response = await api.get("/v1/dashboard/stats");
      if (response.data.success) {
        set({
          stats: response.data.data.stats,
          familyClassification: response.data.data.familyClassification || [],
          classificationExpenses: response.data.data.classificationExpenses || [],
        });
      }
    } catch (error) {
      console.error("Dashboard stats fetch error", error);
      // Keep default zeros on error
    }
  },
}));

/* ─────────── Income Source Types ─────────── */
export const INCOME_SOURCES = [
  "عمل يومي",
  "عمل حر",
  "راتب ثابت",
  "معاش تأميني",
  "تكافل وكرامة",
  "مساعدات أهالي 1",
  "مساعدات أهالي 2",
  "مساعدات أهالي 3",
  "مساعدات جمعية خيرية 1",
  "مساعدات جمعية خيرية 2",
  "مساعدات غذائية شهرية",
  "دخل من مشاريع",
  "دخل من عقارات",
  "شهريات الأبناء العاملين",
  "أنشطة مكسبة للمال (الزوج)",
  "أنشطة مكسبة للمال (الزوجة)",
  "بطاقة التموين",
  "تدخين يومي × 30 (ردع)",
  "أخرى",
];

/* ─────────── Expense Categories ─────────── */
export const EXPENSE_CATEGORIES = [
  "إيجار المسكن",
  "أقساط",
  "غذاء",
  "كهرباء ومياه وغاز",
  "مواصلات",
  "علاج ودواء",
  "تعليم ومصاريف مدرسة",
  "ملابس",
  "مستلزمات منزلية",
  "اتصالات",
  "ديون مستحقة",
  "أخرى",
];

/* ─────────── Case Categories ─────────── */
export const CASE_CATEGORIES = [
  "أسرة أيتام",
  "مطلقات",
  "فقراء",
  "مساكين",
  "أسر إعاقة",
  "طالب علم",
  "أسر سجناء",
  "كبار سن",
  "حالات هجر واختفاء الزوج",
  "أمراض مزمنة",
  "إصابة مؤقتة",
  "أرامل",
  "لا يستحق",
];

/* ─────────── Aid Decision Types ─────────── */
export const AID_DECISIONS = [
  "مساعدات مادية شهرية",
  "مساعدات علاجية شهرية",
  "مساعدات موسمية غذائية",
  "مساعدات موسمية مادية",
  "مساعدات موسمية غذائية ومادية",
  "لا يستحق",
];

/* ─────────── Family Member Relations ─────────── */
export const MEMBER_RELATIONS = [
  "رب الأسرة",
  "الزوجة",
  "ابن",
  "ابنة",
  "الأم",
  "الأب",
  "أخ",
  "أخت",
  "حفيد",
  "حفيدة",
  "قريب آخر",
];

/* ─────────── Education Levels ─────────── */
export const EDUCATION_LEVELS = [
  "أمي (لا يقرأ ولا يكتب)",
  "يقرأ ويكتب",
  "ابتدائي",
  "إعدادي",
  "ثانوي عام",
  "ثانوي فني",
  "دبلوم",
  "جامعي",
  "دراسات عليا",
  "حضانة",
  "لا ينطبق (رضيع)",
];

/* ─────────── Disability Classifications ─────────── */
export const DISABILITY_CLASSES = [
  {
    code: "أ",
    label: "إعاقة خفيفة",
    description: "لا تمنع العمل، لا تحتاج مرافق، لا أدوية (ضعف سمع بسيط، ضعف بصر قابل للتعديل، تشوه بسيط)",
    score: 0.2,
  },
  {
    code: "ب",
    label: "إعاقة متوسطة",
    description: "تؤثر على العمل جزئيًا، لا تحتاج مرافق، أدوية غير مكلفة (بتر جزئي، شلل جزئي، ضعف شديد في البصر)",
    score: 0.5,
  },
  {
    code: "ج",
    label: "إعاقة شديدة",
    description: "تمنع العمل، يعتمد على الغير في الحركة (شلل نصفي، إعاقة ذهنية، كفيف)",
    score: 0.8,
  },
  {
    code: "د",
    label: "إعاقة كاملة",
    description: "غير قادر على الحركة ولا أي عمل، يحتاج مرافق دائم (شلل رباعي، تخلف عقلي شديد، ضمور كامل)",
    score: 1.2,
  },
];

/* ─────────── Chronic Illness Severity ─────────── */
export const CHRONIC_SEVERITY = [
  { code: "خفيف", score: 0.2, description: "لا يحتاج علاج مستمر" },
  { code: "متوسط", score: 0.5, description: "يحتاج أدوية غير مكلفة" },
  { code: "شديد", score: 0.8, description: "يحتاج علاج مكلف مستمر" },
  { code: "حرج", score: 1.0, description: "يحتاج عناية طبية دائمة" },
];

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
    get().fetchFamilies();
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
    try {
      const response = await api.post(`/v1/families/${familyId}/persons`, member);
      if (response.data.success) {
        await get().fetchFamilyDetails(familyId);
      }
    } catch (error) {
      console.error("Add member error", error);
      throw error;
    }
  },

  updateMember: async (familyId, memberId, updates) => {
    try {
      // Optimistic update (no backend PUT /persons/:id endpoint yet)
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
    } catch (error) {
      console.error("Update member error", error);
      throw error;
    }
  },

  deleteMember: async (familyId, memberId) => {
    try {
      const response = await api.delete(`/v1/families/persons/${memberId}`);
      if (response.data.success) {
        await get().fetchFamilyDetails(familyId);
      }
    } catch (error) {
      console.error("Delete member error", error);
      throw error;
    }
  },

  /* ── Income CRUD ── */
  addIncome: async (familyId, income) => {
    try {
      const response = await api.post(`/v1/families/${familyId}/incomes`, income);
      if (response.data.success) {
        await get().fetchFamilyDetails(familyId);
      }
    } catch (error) {
      console.error("Add income error", error);
      throw error;
    }
  },

  deleteIncome: async (familyId, incomeId) => {
    try {
      const response = await api.delete(`/v1/families/incomes/${incomeId}`);
      if (response.data.success) {
        await get().fetchFamilyDetails(familyId);
      }
    } catch (error) {
      console.error("Delete income error", error);
      throw error;
    }
  },

  /* ── Expenses CRUD ── */
  addExpense: async (familyId, expense) => {
    try {
      const response = await api.post(`/v1/families/${familyId}/expenses`, expense);
      if (response.data.success) {
        await get().fetchFamilyDetails(familyId);
      }
    } catch (error) {
      console.error("Add expense error", error);
      throw error;
    }
  },

  deleteExpense: async (familyId, expenseId) => {
    try {
      const response = await api.delete(`/v1/families/expenses/${expenseId}`);
      if (response.data.success) {
        await get().fetchFamilyDetails(familyId);
      }
    } catch (error) {
      console.error("Delete expense error", error);
      throw error;
    }
  },

  /* ── Medical Records CRUD ── */
  addMedicalRecord: async (familyId, personId, record) => {
    try {
      const response = await api.post(`/v1/families/persons/${personId}/medical`, record);
      if (response.data.success) {
        await get().fetchFamilyDetails(familyId);
      }
    } catch (error) {
      console.error("Add medical record error", error);
      throw error;
    }
  },

  deleteMedicalRecord: async (familyId, recordId) => {
    try {
      const response = await api.delete(`/v1/families/medical/${recordId}`);
      if (response.data.success) {
        await get().fetchFamilyDetails(familyId);
      }
    } catch (error) {
      console.error("Delete medical record error", error);
      throw error;
    }
  },
}));

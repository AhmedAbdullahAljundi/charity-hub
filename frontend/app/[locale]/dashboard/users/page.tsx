"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale } from "next-intl";
import {
  Shield, Plus, Search, MoreHorizontal, UserCheck, UserX,
  RefreshCw, Key, Loader2, Copy, Check, AlertTriangle,
  ChevronDown, X, Zap, Send
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { getRoleBadgeClass } from "@/lib/hooks/usePermission";
import { generateTempPassword } from "@/lib/utils/passwordStrength";
import {
  listUsersApi, setTempPasswordApi, changeRoleApi, deactivateUserApi,
  createUserApi, setPermissionsApi, type UserDto,
} from "@/lib/api/users-api";
import { useAuthStore } from "@/lib/stores/authStore";
import { SendMessageModal } from "./SendMessageModal";
import { cn } from "@/lib/utils";


// ── Permission labels (bilingual) ─────────────────────────────────────────
const PERM_LABELS: Record<string, { ar: string; en: string }> = {
  "household:read":    { ar: "قراءة الأسر",        en: "Read Households" },
  "household:write":   { ar: "كتابة الأسر",        en: "Write Households" },
  "household:delete":  { ar: "حذف الأسر",          en: "Delete Households" },
  "household:publish": { ar: "نشر الأسر",           en: "Publish Households" },
  "person:write":      { ar: "كتابة الأفراد",      en: "Write Persons" },
  "person:delete":     { ar: "حذف الأفراد",        en: "Delete Persons" },
  "income:write":      { ar: "كتابة الدخل",        en: "Write Income" },
  "income:verify":     { ar: "توثيق الدخل",        en: "Verify Income" },
  "income:delete":     { ar: "حذف الدخل",          en: "Delete Income" },
  "burden:write":      { ar: "كتابة الأعباء",      en: "Write Burdens" },
  "score:calculate":   { ar: "حساب الدرجة",        en: "Calculate Score" },
  "score:read":        { ar: "عرض الدرجة",         en: "Read Score" },
  "score:decide":      { ar: "اتخاذ القرار",       en: "Score Decide" },
  "score:simulate":    { ar: "محاكاة الدرجة",      en: "Simulate Score" },
  "rules:read":        { ar: "عرض القواعد",        en: "Read Rules" },
  "rules:write":       { ar: "تعديل القواعد",      en: "Write Rules" },
  "analytics:read":    { ar: "التحليلات",          en: "Read Analytics" },
  "audit:read":        { ar: "سجل الأحداث",        en: "Read Audit" },
  "verification:read": { ar: "عرض التوثيق",        en: "Read Verification" },
  "verification:write":{ ar: "كتابة التوثيق",      en: "Write Verification" },
  "verification:bulk": { ar: "التوثيق الجماعي",   en: "Bulk Verification" },
  "education:read":    { ar: "عرض التعليم",        en: "Read Education" },
  "education:write":   { ar: "كتابة التعليم",      en: "Write Education" },
  "education:delete":  { ar: "حذف التعليم",        en: "Delete Education" },
  "user:read":         { ar: "عرض المستخدمين",    en: "Read Users" },
  "user:write":        { ar: "إدارة المستخدمين",  en: "Write Users" },
  "user:delete":       { ar: "حذف المستخدمين",    en: "Delete Users" },
};

const ALL_PERMISSIONS = Object.keys(PERM_LABELS);

const ROLE_LABELS: Record<string, { ar: string; en: string }> = {
  ADMIN:      { ar: "مدير النظام", en: "System Admin" },
  SUPERVISOR: { ar: "مشرف",        en: "Supervisor" },
  WORKER:     { ar: "موظف إدخال", en: "Data Entry" },
  VIEWER:     { ar: "مستعرض",      en: "Viewer" },
};
const ROLES = ["ADMIN", "SUPERVISOR", "WORKER", "VIEWER"];

function formatDate(d: string | null | undefined, locale: string) {
  if (!d) return locale === "ar" ? "لا يوجد" : "Never";
  return new Date(d).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", {
    day: "numeric", month: "short", year: "numeric",
  });
}

// ── Temp Password Modal ───────────────────────────────────────────────────
function TempPasswordModal({
  user, onClose, onSuccess, isRtl,
}: { user: UserDto; onClose: () => void; onSuccess: () => void; isRtl: boolean }) {
  const [pwd, setPwd] = useState(generateTempPassword());
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(pwd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const confirm = async () => {
    setLoading(true);
    try {
      await setTempPasswordApi(user.id, pwd);
      toast.success(isRtl ? `تم تعيين كلمة المرور المؤقتة لـ ${user.name}` : `Temp password set for ${user.name}`);
      onSuccess();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || (isRtl ? "حدث خطأ" : "Error occurred"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 ring-1 ring-slate-200 dark:ring-slate-700">
        <button onClick={onClose} className="absolute top-4 end-4 text-slate-400 hover:text-slate-600">
          <X className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-amber-100 dark:bg-amber-950/30 rounded-xl flex items-center justify-center">
            <Key className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">
              {isRtl ? "تعيين كلمة مرور مؤقتة" : "Set Temporary Password"}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{user.name}</p>
          </div>
        </div>

        {/* Password display */}
        <div className="mb-4">
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 block">
            {isRtl ? "كلمة المرور المؤقتة" : "Temporary Password"}
          </label>
          <div className="flex gap-2">
            <input
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              className="flex-1 px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 text-slate-900 dark:text-white"
              dir="ltr"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPwd(generateTempPassword())}
              className="shrink-0 gap-1 text-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              {isRtl ? "توليد" : "Generate"}
            </Button>
          </div>
        </div>

        {/* Copy */}
        <button
          onClick={copy}
          className={cn(
            "w-full mb-4 py-2 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all",
            copied
              ? "bg-green-50 dark:bg-green-950/20 text-green-600 border border-green-200"
              : "bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-green-300"
          )}
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? (isRtl ? "تم النسخ ✓" : "Copied ✓") : (isRtl ? "نسخ" : "Copy")}
        </button>

        {/* Warning */}
        <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl mb-4">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-700 dark:text-amber-400">
            <p className="font-medium">{isRtl ? "أخبر المستخدم بكلمة المرور هذه مباشرة" : "Share this password directly with the user"}</p>
            <p className="mt-0.5 text-amber-600 dark:text-amber-500">
              {isRtl ? "سيُطلب منه تغييرها فور تسجيل الدخول" : "They will be required to change it on first login"}
            </p>
          </div>
        </div>

        <button
          onClick={confirm}
          disabled={!pwd || pwd.length < 8 || loading}
          className="w-full py-2.5 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {isRtl ? "تأكيد التعيين" : "Confirm & Set"}
        </button>
      </div>
    </div>
  );
}

// ── Add User Modal ─────────────────────────────────────────────────────────
function AddUserModal({ onClose, onSuccess, isRtl }: { onClose: () => void; onSuccess: () => void; isRtl: boolean }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "WORKER" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await createUserApi(form);
      toast.success(isRtl ? "تم إضافة المستخدم بنجاح" : "User added successfully");
      onSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.error || (isRtl ? "حدث خطأ" : "Error"));
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full px-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 text-slate-900 dark:text-white";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 ring-1 ring-slate-200 dark:ring-slate-700">
        <button onClick={onClose} className="absolute top-4 end-4 text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-5">
          {isRtl ? "إضافة مستخدم جديد" : "Add New User"}
        </h3>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">{isRtl ? "الاسم الكامل" : "Full Name"}</label>
            <input value={form.name} onChange={set("name")} required className={inputCls} />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">{isRtl ? "البريد الإلكتروني" : "Email"}</label>
            <input type="email" value={form.email} onChange={set("email")} required className={inputCls} dir="ltr" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">{isRtl ? "كلمة المرور" : "Password"}</label>
            <input type="password" value={form.password} onChange={set("password")} required minLength={8} className={inputCls} />
            <p className="text-[11px] text-slate-400 mt-1">{isRtl ? "8 أحرف على الأقل" : "At least 8 characters"}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">{isRtl ? "الدور" : "Role"}</label>
            <select value={form.role} onChange={set("role")} className={inputCls}>
              {ROLES.map((r) => (
                <option key={r} value={r}>{isRtl ? ROLE_LABELS[r]?.ar : ROLE_LABELS[r]?.en}</option>
              ))}
            </select>
          </div>
          {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-bold rounded-xl flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isRtl ? "إضافة المستخدم" : "Add User"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Permissions Modal ──────────────────────────────────────────────────────
function PermissionsModal({
  user, onClose, onSuccess, isRtl,
}: { user: UserDto; onClose: () => void; onSuccess: () => void; isRtl: boolean }) {
  const [selected, setSelected] = useState<string[]>(user.customPermissions || []);
  const [loading, setLoading] = useState(false);

  const rolePerms = new Set(user.effectivePermissions || []);
  const toggle = (p: string) =>
    setSelected((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]);

  const save = async () => {
    setLoading(true);
    try {
      await setPermissionsApi(user.id, selected);
      toast.success(isRtl ? "تم حفظ الصلاحيات المخصصة" : "Custom permissions saved");
      onSuccess();
    } catch {
      toast.error(isRtl ? "حدث خطأ" : "Error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg p-6 ring-1 ring-slate-200 dark:ring-slate-700 max-h-[85vh] flex flex-col">
        <button onClick={onClose} className="absolute top-4 end-4 text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-green-100 dark:bg-green-950/30 rounded-xl flex items-center justify-center">
            <Zap className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">{isRtl ? "الصلاحيات المخصصة" : "Custom Permissions"}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">{user.name}</p>
          </div>
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">
          {isRtl ? "الصلاحيات الإضافية تُمنح فوق صلاحيات الدور" : "Extra permissions granted on top of role permissions"}
        </p>
        <div className="overflow-y-auto flex-1 grid grid-cols-1 gap-2 mb-4">
          {ALL_PERMISSIONS.map((p) => {
            const grantedByRole = rolePerms.has(p) && !user.customPermissions?.includes(p);
            const isSelected = selected.includes(p);
            const label = isRtl ? PERM_LABELS[p]?.ar : PERM_LABELS[p]?.en;
            return (
              <label
                key={p}
                className={cn(
                  "flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl border cursor-pointer transition-all",
                  grantedByRole
                    ? "bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-700/50 opacity-60 cursor-not-allowed"
                    : isSelected
                    ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-green-300"
                )}
              >
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm font-medium", isSelected || grantedByRole ? "text-green-700 dark:text-green-400" : "text-slate-700 dark:text-slate-300")}>
                    {label}
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">{p}</p>
                </div>
                {grantedByRole ? (
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded-full shrink-0">
                    {isRtl ? "من الدور" : "from role"}
                  </span>
                ) : (
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggle(p)}
                    className="w-4 h-4 accent-green-500 shrink-0"
                  />
                )}
              </label>
            );
          })}
        </div>
        <button
          onClick={save}
          disabled={loading}
          className="w-full py-2.5 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-bold rounded-xl flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {isRtl ? "حفظ الصلاحيات" : "Save Permissions"}
        </button>
      </div>
    </div>
  );
}

// ── Main Users Page ────────────────────────────────────────────────────────
export default function UsersPage() {
  const locale = useLocale();
  const isRtl = locale === "ar";
  const currentUser = useAuthStore((s) => s.user);
  const isAdmin = currentUser?.role === "ADMIN";

  const [users, setUsers] = useState<UserDto[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"all" | "pending">("all");

  const [tempModal, setTempModal] = useState<UserDto | null>(null);
  const [addModal, setAddModal] = useState(false);
  const [permsModal, setPermsModal] = useState<UserDto | null>(null);
  const [messageModal, setMessageModal] = useState<UserDto | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listUsersApi({ search, limit: 50 });
      setUsers(res.users);
      setTotal(res.total);
    } catch {
      toast.error(isRtl ? "خطأ في تحميل المستخدمين" : "Error loading users");
    } finally {
      setLoading(false);
    }
  }, [search, isRtl]);

  useEffect(() => { load(); }, [load]);

  const resetRequests = users.filter((u) => u.passwordResetRequest);
  const displayed = tab === "pending" ? resetRequests : users;

  const handleDeactivate = async (u: UserDto) => {
    if (!confirm(isRtl ? `تعطيل حساب ${u.name}؟` : `Deactivate ${u.name}?`)) return;
    try {
      await deactivateUserApi(u.id);
      toast.success(isRtl ? "تم تعطيل الحساب" : "Account deactivated");
      load();
    } catch {
      toast.error(isRtl ? "حدث خطأ" : "Error");
    }
  };

  const handleRoleChange = async (u: UserDto, role: string) => {
    try {
      await changeRoleApi(u.id, role);
      toast.success(isRtl ? `تم تغيير الدور إلى ${ROLE_LABELS[role]?.ar}` : `Role changed to ${ROLE_LABELS[role]?.en}`);
      load();
    } catch {
      toast.error(isRtl ? "حدث خطأ" : "Error");
    }
  };

  const activeCount   = users.filter((u) => u.active).length;
  const inactiveCount = users.filter((u) => !u.active).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {isRtl ? "المستخدمين والصلاحيات" : "Users & Permissions"}
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            {isRtl ? "إدارة حسابات المستخدمين وصلاحياتهم" : "Manage user accounts and permissions"}
          </p>
        </div>
        {isAdmin && (
          <Button className="gap-2" onClick={() => setAddModal(true)}>
            <Plus className="h-4 w-4" />
            {isRtl ? "إضافة مستخدم" : "Add User"}
          </Button>
        )}
      </div>

      {/* Reset requests banner */}
      {isAdmin && resetRequests.length > 0 && (
        <div className="flex items-center justify-between gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
            <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
              {isRtl
                ? `${resetRequests.length} مستخدم طلب استعادة كلمة المرور`
                : `${resetRequests.length} user(s) requested a password reset`}
            </p>
          </div>
          <button
            onClick={() => setTab("pending")}
            className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline"
          >
            {isRtl ? "عرض الطلبات" : "View Requests"}
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: Shield,    label: isRtl ? "إجمالي المستخدمين" : "Total Users",  value: total,         color: "bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400" },
          { icon: UserCheck, label: isRtl ? "نشطون" : "Active",                   value: activeCount,   color: "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400" },
          { icon: UserX,     label: isRtl ? "غير نشطين" : "Inactive",             value: inactiveCount, color: "bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="border-0 shadow-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${s.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-xl font-bold text-foreground">{s.value}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Search + Tabs */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4 space-y-3">
          <div className="relative">
            <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={isRtl ? "بحث بالاسم أو البريد أو الدور…" : "Search by name, email, or role…"}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pe-10"
            />
          </div>
          <div className="flex gap-2">
            {(["all", "pending"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "px-4 py-1.5 text-sm font-medium rounded-lg transition-colors",
                  tab === t
                    ? "bg-green-500 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                )}
              >
                {t === "all"
                  ? (isRtl ? "الكل" : "All")
                  : (isRtl ? `طلبات الاستعادة (${resetRequests.length})` : `Reset Requests (${resetRequests.length})`)}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-start">{isRtl ? "المستخدم" : "User"}</TableHead>
                <TableHead className="text-start">{isRtl ? "الدور" : "Role"}</TableHead>
                <TableHead className="text-start">{isRtl ? "الحالة" : "Status"}</TableHead>
                <TableHead className="text-start">{isRtl ? "آخر دخول" : "Last Login"}</TableHead>
                <TableHead className="text-start w-12">{isRtl ? "إجراءات" : "Actions"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-16 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : displayed.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-16 text-center text-muted-foreground">
                    {isRtl ? "لا توجد نتائج" : "No results"}
                  </TableCell>
                </TableRow>
              ) : (
                displayed.map((u) => {
                  const roleLabel = isRtl ? ROLE_LABELS[u.role]?.ar : ROLE_LABELS[u.role]?.en;
                  const roleBadge = getRoleBadgeClass(u.role);
                  return (
                    <TableRow key={u.id} className="hover:bg-accent/50 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 shrink-0">
                            <AvatarFallback className="bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 text-sm font-bold">
                              {u.name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-medium text-foreground text-sm truncate">{u.name}</p>
                            <p className="text-xs text-muted-foreground truncate" dir="ltr">{u.email}</p>
                            {u.passwordResetRequest && (
                              <span className="inline-flex items-center gap-1 mt-0.5 text-[10px] bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded-full">
                                <AlertTriangle className="w-2.5 h-2.5" />
                                {isRtl ? "طلب استعادة" : "Reset Requested"}
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-xs ${roleBadge}`}>
                          {roleLabel}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={u.active
                            ? "bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800 text-xs"
                            : "bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 text-xs"
                          }
                        >
                          {u.active ? (isRtl ? "نشط" : "Active") : (isRtl ? "معطل" : "Inactive")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDate(u.lastLoginAt, locale)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-52">
                            <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => setMessageModal(u)}>
                              <Send className="w-4 h-4" />
                              {isRtl ? "إرسال رسالة" : "Send Message"}
                            </DropdownMenuItem>
                            
                            {isAdmin && (
                              <>
                                <DropdownMenuSeparator />
                                {/* Role submenu */}
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="gap-2 cursor-pointer">
                                      <Shield className="w-4 h-4" />
                                      {isRtl ? "تغيير الدور" : "Change Role"}
                                      <ChevronDown className="w-3 h-3 ms-auto" />
                                    </DropdownMenuItem>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent side="left">
                                    {ROLES.filter((r) => r !== u.role).map((r) => (
                                      <DropdownMenuItem key={r} onClick={() => handleRoleChange(u, r)}>
                                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${getRoleBadgeClass(r)}`}>
                                          {isRtl ? ROLE_LABELS[r]?.ar : ROLE_LABELS[r]?.en}
                                        </span>
                                      </DropdownMenuItem>
                                    ))}
                                  </DropdownMenuContent>
                                </DropdownMenu>

                                <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => setPermsModal(u)}>
                                  <Zap className="w-4 h-4" />
                                  {isRtl ? "الصلاحيات المخصصة" : "Custom Permissions"}
                                </DropdownMenuItem>

                                <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => setTempModal(u)}>
                                  <Key className="w-4 h-4" />
                                  {isRtl ? "تعيين كلمة مرور مؤقتة" : "Set Temp Password"}
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="gap-2 cursor-pointer text-destructive"
                                  onClick={() => handleDeactivate(u)}
                                >
                                  <UserX className="w-4 h-4" />
                                  {isRtl ? "تعطيل الحساب" : "Deactivate"}
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Modals */}
      {tempModal && (
        <TempPasswordModal
          user={tempModal}
          isRtl={isRtl}
          onClose={() => setTempModal(null)}
          onSuccess={() => { setTempModal(null); load(); }}
        />
      )}
      {addModal && (
        <AddUserModal
          isRtl={isRtl}
          onClose={() => setAddModal(false)}
          onSuccess={() => { setAddModal(false); load(); }}
        />
      )}
      {permsModal && (
        <PermissionsModal
          user={permsModal}
          isRtl={isRtl}
          onClose={() => setPermsModal(null)}
          onSuccess={() => { setPermsModal(null); load(); }}
        />
      )}
    </div>
  );
}

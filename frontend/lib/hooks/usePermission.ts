"use client";

import { useAuthStore } from "@/lib/stores/authStore";

// Mirror of backend permissions — must stay in sync with backend/src/shared/permissions.js
const PERMISSIONS_MAP: Record<string, string[]> = {
  // Households
  "household:read":    ["ADMIN", "SUPERVISOR", "WORKER", "VIEWER"],
  "household:write":   ["ADMIN", "SUPERVISOR", "WORKER"],
  "household:delete":  ["ADMIN"],
  "household:publish": ["ADMIN", "SUPERVISOR", "WORKER"],
  // Persons
  "person:write":      ["ADMIN", "SUPERVISOR", "WORKER"],
  "person:delete":     ["ADMIN", "SUPERVISOR"],
  // Income
  "income:write":      ["ADMIN", "SUPERVISOR", "WORKER"],
  "income:verify":     ["ADMIN", "SUPERVISOR"],
  "income:delete":     ["ADMIN", "SUPERVISOR"],
  // Burdens
  "burden:write":      ["ADMIN", "SUPERVISOR", "WORKER"],
  // Scoring
  "score:calculate":   ["ADMIN", "SUPERVISOR", "WORKER"],
  "score:read":        ["ADMIN", "SUPERVISOR", "WORKER", "VIEWER"],
  "score:decide":      ["ADMIN", "SUPERVISOR"],
  "score:simulate":    ["ADMIN", "SUPERVISOR", "WORKER"],
  // Rules
  "rules:read":        ["ADMIN"],
  "rules:write":       ["ADMIN"],
  // Analytics
  "analytics:read":    ["ADMIN", "SUPERVISOR", "WORKER", "VIEWER"],
  // Audit
  "audit:read":        ["ADMIN", "SUPERVISOR"],
  // Verification
  "verification:read":  ["ADMIN", "SUPERVISOR", "WORKER", "VIEWER"],
  "verification:write": ["ADMIN", "SUPERVISOR"],
  "verification:bulk":  ["ADMIN", "SUPERVISOR"],
  // Education
  "education:read":    ["ADMIN", "SUPERVISOR", "WORKER", "VIEWER"],
  "education:write":   ["ADMIN", "SUPERVISOR", "WORKER"],
  "education:delete":  ["ADMIN"],
  // Users
  "user:read":         ["ADMIN"],
  "user:write":        ["ADMIN"],
  "user:delete":       ["ADMIN"],
};

/**
 * Check if the current user has a specific permission.
 * Checks role-based permissions + custom (additive) permissions.
 */
export function usePermission(permission: string): boolean {
  const user = useAuthStore((s) => s.user);
  if (!user) return false;

  // Role-based check
  const rolePerms = PERMISSIONS_MAP[permission] || [];
  if (rolePerms.includes(user.role)) return true;

  // Custom (additive) check
  if (Array.isArray((user as any).customPermissions)) {
    return (user as any).customPermissions.includes(permission);
  }

  return false;
}

/** Returns the current user's role string, or null if unauthenticated */
export function useRole(): string | null {
  const user = useAuthStore((s) => s.user);
  return user?.role ?? null;
}

/** Returns true if current user is VIEWER */
export function useIsViewer(): boolean {
  const user = useAuthStore((s) => s.user);
  return user?.role === "VIEWER";
}

/** Returns true if current user is ADMIN */
export function useIsAdmin(): boolean {
  const user = useAuthStore((s) => s.user);
  return user?.role === "ADMIN";
}

/** Returns true if current user is ADMIN or SUPERVISOR */
export function useIsSupervisorOrAbove(): boolean {
  const user = useAuthStore((s) => s.user);
  return user?.role === "ADMIN" || user?.role === "SUPERVISOR";
}

/** Returns the role badge color class */
export function getRoleBadgeClass(role: string): string {
  const map: Record<string, string> = {
    ADMIN:      "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400",
    SUPERVISOR: "bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400",
    WORKER:     "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400",
    VIEWER:     "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  };
  return map[role] ?? map.VIEWER;
}

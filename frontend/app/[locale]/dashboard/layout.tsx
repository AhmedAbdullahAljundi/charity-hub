"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "@/i18n/navigation";
import { useAuthStore } from "@/lib/stores/authStore";
import { AppSidebar } from "@/components/app-sidebar";
import { ForcePasswordChange } from "@/components/ForcePasswordChange";
import { cn } from "@/lib/utils";

const Topbar = dynamic(() => import("@/components/topbar").then((m) => m.Topbar), {
  ssr: false,
  loading: () => (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 lg:px-6 bg-card border-b border-border shadow-sm" />
  ),
});

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  // Block dashboard entirely if user must change password
  if (user?.mustChangePassword) {
    return <ForcePasswordChange />;
  }

  // Prevent rendering dashboard content until redirect happens
  if (!isAuthenticated) {
    return null; 
  }

  return (
    <div className="flex min-h-screen flex-row">
      <AppSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

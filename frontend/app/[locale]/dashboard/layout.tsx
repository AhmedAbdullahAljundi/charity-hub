"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { AppSidebar } from "@/components/app-sidebar";

const Topbar = dynamic(() => import("@/components/topbar").then((m) => m.Topbar), {
  ssr: false,
  loading: () => (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 lg:px-6 bg-card border-b border-border shadow-sm" />
  ),
});

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

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

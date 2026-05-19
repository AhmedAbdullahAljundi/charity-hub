import React from "react";
import { LucideIcon } from "lucide-react";

export function InfoField({ icon: Icon, label, value, dir }: { icon: LucideIcon, label: string, value: any, dir?: string }) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs text-muted-foreground flex items-center gap-1">
        <Icon className="h-3 w-3" /> {label}
      </p>
      <p className="text-sm font-medium text-foreground" dir={dir}>{value}</p>
    </div>
  );
}

export function MiniField({ label, value, dir }: { label: string, value: any, dir?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-muted-foreground text-[11px] font-medium uppercase tracking-wider">{label}</span>
      <span className="text-foreground text-sm font-semibold" dir={dir}>{value}</span>
    </div>
  );
}

export function EmptyState({ icon: Icon, message }: { icon: LucideIcon, message: string }) {
  return (
    <div className="text-center py-12">
      <Icon className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}

export function SummaryRow({ label, value, color = "text-foreground", bold = false }: { label: string, value: any, color?: string, bold?: boolean }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={`${bold ? "font-bold" : "font-medium"} ${color}`}>{value}</span>
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function ScoreDeltaBadge({ delta }: { delta: number | null | undefined }) {
  if (delta == null || Math.abs(delta) < 0.01) return null;
  const up = delta > 0;
  return (
    <motion.span
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 18 }}
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-bold",
        up ? "bg-rose-500/15 text-rose-600" : "bg-emerald-500/15 text-emerald-600"
      )}
    >
      {up ? "▲" : "▼"} {up ? "+" : ""}
      {delta.toFixed(1)}
    </motion.span>
  );
}

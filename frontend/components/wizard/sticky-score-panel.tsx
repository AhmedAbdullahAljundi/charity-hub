"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Loader2, Shield, Heart, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useScoringStore } from "@/lib/stores/scoringStore";
import { useWizardStore } from "@/lib/stores/wizardStore";
import {
  parsePercent,
  ELIGIBILITY_TAILWIND,
  ELIGIBILITY_COLORS,
  categoryBarsFromLayers,
} from "@/lib/eligibility";
import type { EligibilityLevel } from "@/lib/types/api";
import { ScoreDeltaBadge } from "./score-delta-badge";
import { cn } from "@/lib/utils";

function ScoreGauge({ percent, level }: { percent: number; level: EligibilityLevel }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(100, Math.max(0, percent)) / 100) * c;
  const stroke = ELIGIBILITY_COLORS[level] ?? "#94a3b8";

  return (
    <motion.div
      className="relative mx-auto h-32 w-32"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" strokeWidth="10" className="stroke-muted/30" />
        <motion.circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke={stroke}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </svg>
      <motion.span
        key={percent}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute inset-0 flex flex-col items-center justify-center"
      >
        <span className="text-2xl font-bold">{percent.toFixed(1)}%</span>
      </motion.span>
    </motion.div>
  );
}

export function StickyScorePanel({ onRecalculate }: { onRecalculate?: () => void }) {
  const t = useTranslations("scoring");
  const liveScore = useScoringStore((s) => s.liveScore);
  const isCalculating = useScoringStore((s) => s.isCalculating);
  const householdId = useWizardStore((s) => s.householdId);
  const calculate = useScoringStore((s) => s.calculate);

  const percent = parsePercent(liveScore?.normalizedPercent);
  const level = (liveScore?.systemRecommendation ?? "NOT_ELIGIBLE") as EligibilityLevel;
  const bars = categoryBarsFromLayers(liveScore?.layerBreakdown);
  const warnings = liveScore?.warnings ?? [];
  const delta = liveScore?.scoreDelta != null ? parsePercent(liveScore.scoreDelta) : null;

  const handleRecalc = async () => {
    if (onRecalculate) {
      onRecalculate();
      return;
    }
    if (householdId) await calculate(householdId);
  };

  return (
    <aside className="sticky top-20 z-20 w-full shrink-0 lg:w-72">
      <div className="rounded-2xl border border-border bg-card p-4 shadow-lg">
        {liveScore ? (
          <>
            <motion.div layout className="mb-3 flex items-center justify-between gap-2">
              <Badge className={cn("text-xs", ELIGIBILITY_TAILWIND[level])}>
                {t(`eligibility.${level}`)}
              </Badge>
              <ScoreDeltaBadge delta={delta} />
            </motion.div>
            <ScoreGauge percent={percent} level={level} />
            <p className="mb-4 text-center text-xs text-muted-foreground">{t("panel.percent")}</p>

            <motion.div className="mb-4 space-y-1.5">
              {bars.map((b) => (
                <div key={b.id} className="flex items-center gap-2 text-xs">
                  <span className="w-8 shrink-0 text-muted-foreground">
                    {t(`layers.${b.id}` as "layers.L1")}
                  </span>
                  <motion.div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <motion.div
                      className="h-full rounded-full bg-primary"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, Math.abs(b.value) * 8)}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </motion.div>
                </div>
              ))}
            </motion.div>

            <div className="mb-4 grid grid-cols-4 gap-1 text-center text-[10px]">
              {[
                { icon: Shield, key: "vulnerability", val: liveScore.vulnerabilityScore },
                { icon: Heart, key: "reduction", val: liveScore.reductionScore },
                { icon: CheckCircle2, key: "confidence", val: liveScore.confidenceScore },
                { icon: AlertTriangle, key: "fraud", val: liveScore.fraudRiskScore },
              ].map(({ icon: Icon, key, val }) => (
                <div key={key} className="rounded-lg bg-muted/50 p-1.5">
                  <Icon className="mx-auto h-3.5 w-3.5 text-muted-foreground" />
                  <div className="mt-0.5 font-semibold">{parsePercent(val).toFixed(1)}</div>
                  <motion.div className="text-muted-foreground truncate">
                    {t(`engines.${key}` as "engines.vulnerability")}
                  </motion.div>
                </div>
              ))}
            </div>

            {warnings.length > 0 && (
              <Badge variant="destructive" className="mb-3 w-full justify-center">
                {t("panel.warnings")}: {warnings.length}
              </Badge>
            )}
          </>
        ) : (
          <p className="py-8 text-center text-sm text-muted-foreground">{t("panel.noScore")}</p>
        )}

        <Button className="w-full" onClick={handleRecalc} disabled={!householdId || isCalculating}>
          {isCalculating && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
          {isCalculating ? t("panel.calculating") : t("panel.recalculate")}
        </Button>
      </div>
    </aside>
  );
}

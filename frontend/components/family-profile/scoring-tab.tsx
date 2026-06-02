"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, BarChart3, TrendingUp, AlertCircle, ShieldAlert } from "lucide-react";
import { useTranslations } from "next-intl";

import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from "recharts";

interface ScoringTabProps {
  family: any;
  totalIncome: number;
  totalExpenses: number;
  totalMedicalCost: number;
  netBalance: number;
  getDomainLabel: (group: string, val: string | null | undefined) => string;
  recColor: string;
}

export function ScoringTab({
  family,
  totalIncome,
  totalExpenses,
  totalMedicalCost,
  netBalance,
  getDomainLabel,
  recColor,
}: ScoringTabProps) {
  const tScoring = useTranslations("families.profile.tabs");
  const tDomain = useTranslations("domain");
  const [recalcLoading, setRecalcLoading] = useState(false);

  const handleRecalculate = async () => {
    try {
      setRecalcLoading(true);
      const { default: api } = await import("@/lib/api/client");
      await api.post(`/scoring/${family.id}/recalculate`);
      
      const { toast } = await import("sonner");
      toast.success("Recalculation successful");
      window.location.reload();
    } catch (err: any) {
      console.error("Recalculate error", err);
      const { toast } = await import("sonner");
      toast.error(err?.response?.data?.message || "Failed to recalculate");
    } finally {
      setRecalcLoading(false);
    }
  };

  // Safe fallback scores
  const finalScore = parseFloat(family.finalScore) || 0;
  const normalizedPercent = parseFloat(family.normalizedPercent) || 0;
  
  // Extract breakdown values for the Radar chart (L1 - L8)
  const breakdown = family.scoreResult?.layerBreakdown || [];
  const chartData = [
    { subject: "L1: Demographics", value: parseFloat(breakdown.find((l: any) => l.layerId === "L1")?.cappedScore || 0) },
    { subject: "L2: Dependents", value: parseFloat(breakdown.find((l: any) => l.layerId === "L2")?.cappedScore || 0) },
    { subject: "L3: Housing/Assets", value: parseFloat(breakdown.find((l: any) => l.layerId === "L3")?.cappedScore || 0) },
    { subject: "L4: Extremes", value: parseFloat(breakdown.find((l: any) => l.layerId === "L4")?.cappedScore || 0) },
    { subject: "L5: Burdens", value: parseFloat(breakdown.find((l: any) => l.layerId === "L5")?.cappedScore || 0) },
    { subject: "L6: Social", value: parseFloat(breakdown.find((l: any) => l.layerId === "L6")?.cappedScore || 0) },
    { subject: "L7: Corrections", value: Math.abs(parseFloat(breakdown.find((l: any) => l.layerId === "L7")?.cappedScore || 0)) },
    { subject: "L8: Verification", value: Math.abs(parseFloat(breakdown.find((l: any) => l.layerId === "L8")?.cappedScore || 0)) },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Visual Analytics & Breakdown */}
      <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Vulnerability Radar & Target Diagnostics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Radar Chart Panel */}
          <div className="h-64 w-full flex items-center justify-center bg-muted/20 rounded-xl overflow-hidden p-2">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} />
                <Radar
                  name="Vulnerability Weight"
                  dataKey="value"
                  stroke="var(--primary)"
                  fill="var(--primary)"
                  fillOpacity={0.25}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold">Overall Vulnerability Percentile</span>
              <span className="text-2xl font-extrabold text-primary">
                {normalizedPercent.toFixed(1)}%
              </span>
            </div>
            <Progress value={normalizedPercent} className="h-3 rounded-full" />
          </div>

          {/* Details on calculations */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="bg-muted/30 p-3 rounded-xl">
              <p className="text-xs text-muted-foreground">Raw Final Score</p>
              <p className="text-xl font-bold">{finalScore.toFixed(2)}</p>
            </div>
            <div className="bg-muted/30 p-3 rounded-xl">
              <p className="text-xs text-muted-foreground">System Recommendation</p>
              <Badge className={`mt-1 capitalize ${recColor}`}>
                {getDomainLabel("systemRecommendation", family.systemRecommendation)}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recalculation, Overrides & Decisional Workflows */}
      <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Decision Engine & Financial Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-muted-foreground">Financial Parameters</h4>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Self-reported Monthly Income</span>
                <span className="font-bold">{totalIncome.toLocaleString()} EGP</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Verified External Income</span>
                <span className="font-bold text-destructive">
                  {(parseFloat(family.scoreResult?.incomeAdjustment) || 0).toLocaleString()} EGP
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Total Stated Expenses</span>
                <span className="font-bold">{totalExpenses.toLocaleString()} EGP</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Total Medical Cost Burden</span>
                <span className="font-bold">{totalMedicalCost.toLocaleString()} EGP</span>
              </div>
              <Separator />
              <div className="flex justify-between text-sm font-bold">
                <span>Net Disposable Balance</span>
                <span className={netBalance < 0 ? "text-destructive" : "text-primary"}>
                  {netBalance.toLocaleString()} EGP
                </span>
              </div>
            </div>
          </div>

          {/* Warnings & Recommendations from Engine */}
          {(family.scoreResult?.warnings?.length > 0 || family.scoreResult?.recommendations?.length > 0) && (
            <div className="space-y-4 pt-2">
              <h4 className="text-sm font-semibold text-muted-foreground">System Engine Diagnostics</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {family.scoreResult?.warnings?.map((w: string, idx: number) => (
                  <div key={idx} className="flex gap-2 items-start text-xs bg-destructive/10 text-destructive p-2.5 rounded-lg border border-destructive/20">
                    <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{w}</span>
                  </div>
                ))}
                {family.scoreResult?.recommendations?.map((r: string, idx: number) => (
                  <div key={idx} className="flex gap-2 items-start text-xs bg-primary/10 text-primary p-2.5 rounded-lg border border-primary/20">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{r}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Recalculate Trigger */}
          <div className="pt-2">
            <Button
              className="w-full gap-2 py-6 font-semibold"
              onClick={handleRecalculate}
              disabled={recalcLoading}
            >
              {recalcLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Running Decisional Pipeline...
                </>
              ) : (
                <>
                  <BarChart3 className="h-5 w-5" />
                  Execute Full Recalculation
                </>
              )}
            </Button>
            <p className="text-[11px] text-muted-foreground text-center mt-2 leading-relaxed">
              Triggers a deterministic scoring recalculation in the backend (immutably persisted to history).
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

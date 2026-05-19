"use client";

import React from "react";
import { BarChart3, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface RecommendationPanelProps {
  family: any;
  normalizedPercent: number;
  finalScore: number;
  systemRecommendation: string;
  humanDecision: string;
  reviewStatus: string;
  recColor: string;
  recalcLoading: boolean;
  onRecalculate: () => void;
  getDomainLabel: (group: string, val: string) => string;
  tScore: (key: string) => string;
}

export function RecommendationPanel({
  family,
  normalizedPercent,
  finalScore,
  systemRecommendation,
  humanDecision,
  reviewStatus,
  recColor,
  recalcLoading,
  onRecalculate,
  getDomainLabel,
  tScore,
}: RecommendationPanelProps) {
  return (
    <Card className="border-0 shadow-sm overflow-hidden">
      <div className={`h-2 w-full ${recColor.split(' ')[0].replace('/15', '').replace('/10', '').replace('/12', '')}`} />
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-muted/20" />
                <circle 
                  cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" 
                  strokeDasharray={251.2} 
                  strokeDashoffset={251.2 - (251.2 * (normalizedPercent || 0)) / 100}
                  className={recColor.split(' ')[1]} 
                />
              </svg>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl font-bold">
                {Math.round(normalizedPercent || 0)}%
              </div>
            </div>
            <div className="space-y-2 text-center md:text-start">
              <h3 className="text-sm font-medium text-muted-foreground">{tScore("systemRecommendation")}</h3>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-lg font-bold border ${recColor}`}>
                {getDomainLabel("eligibility", systemRecommendation || "NOT_ELIGIBLE")}
              </div>
              <div className="text-sm text-muted-foreground">
                {finalScore?.toFixed(2)} {tScore("pointsOutOf100")}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 min-w-[200px]">
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">{tScore("humanDecision")}</div>
              <div className="font-semibold">{getDomainLabel("decision", humanDecision || "PENDING")}</div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">{tScore("reviewStatus")}</div>
              <div className="font-semibold">{getDomainLabel("review", reviewStatus || "PENDING_REVIEW")}</div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2 mt-2"
              onClick={onRecalculate}
              disabled={recalcLoading}
            >
              {recalcLoading ? (
                <><Loader2 className="h-3.5 w-3.5 animate-spin" /> {tScore("recalculating")}</>
              ) : (
                <><BarChart3 className="h-3.5 w-3.5" /> {tScore("recalculate")}</>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

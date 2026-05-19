"use client";

import React from "react";
import { Shield, Heart, CheckCircle2, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface EngineGaugesProps {
  vulnerabilityScore: number;
  reductionScore: number;
  confidenceScore: number;
  fraudRiskScore: number;
  tScore: (key: string) => string;
}

export function EngineGauges({
  vulnerabilityScore,
  reductionScore,
  confidenceScore,
  fraudRiskScore,
  tScore,
}: EngineGaugesProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card className="border-0 shadow-sm bg-destructive/5">
        <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-2">
          <Shield className="h-5 w-5 text-destructive/70" />
          <div className="text-xs font-medium text-muted-foreground">{tScore("vulnerabilityScore")}</div>
          <div className="text-2xl font-bold text-destructive">{vulnerabilityScore?.toFixed(1) || "0.0"}</div>
        </CardContent>
      </Card>
      
      <Card className="border-0 shadow-sm bg-primary/5">
        <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-2">
          <Heart className="h-5 w-5 text-primary/70" />
          <div className="text-xs font-medium text-muted-foreground">{tScore("reductionScore")}</div>
          <div className="text-2xl font-bold text-primary">-{reductionScore?.toFixed(1) || "0.0"}</div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm bg-foreground/5">
        <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-2">
          <CheckCircle2 className="h-5 w-5 text-foreground/70" />
          <div className="text-xs font-medium text-muted-foreground">{tScore("confidenceScore")}</div>
          <div className="text-2xl font-bold text-foreground">
            {((confidenceScore || 0) * 100).toFixed(0)}%
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm bg-warning/10">
        <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-2">
          <AlertTriangle className="h-5 w-5 text-warning-foreground/70" />
          <div className="text-xs font-medium text-muted-foreground">{tScore("fraudRiskScore")}</div>
          <div className="text-2xl font-bold text-warning-foreground">
            {((fraudRiskScore || 0) * 100).toFixed(0)}%
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

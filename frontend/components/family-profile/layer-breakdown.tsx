"use client";

import React from "react";
import { FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface LayerBreakdownProps {
  layerBreakdown: any[];
  tScore: (key: string) => string;
}

export function LayerBreakdown({ layerBreakdown, tScore }: LayerBreakdownProps) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          {tScore("layerBreakdown")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {layerBreakdown && Array.isArray(layerBreakdown) ? (
          <Accordion type="single" collapsible className="w-full">
            {layerBreakdown.map((layer: any) => (
              <AccordionItem value={layer.layerId} key={layer.layerId}>
                <AccordionTrigger className="hover:no-underline hover:bg-muted/50 px-4 rounded-md transition-colors">
                  <div className="flex items-center justify-between w-full pr-4">
                    <span className="font-medium text-sm md:text-base">
                      {tScore(`layer_${layer.layerId}`)}
                    </span>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground hidden sm:inline-block">
                        {layer.triggeredRules?.length || 0} {tScore("rulesTriggered")}
                      </span>
                      <Badge variant={layer.layerId === 'L7' ? "default" : "destructive"}>
                        {layer.layerId === 'L7' ? "-" : "+"}{parseFloat(layer.cappedScore).toFixed(1)} {tScore("points")}
                      </Badge>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 pt-2">
                  {layer.triggeredRules?.length > 0 ? (
                    <div className="space-y-2">
                      {layer.triggeredRules.map((rule: any, i: number) => (
                        <div key={i} className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
                          <div>
                            <div className="font-medium text-sm">{tScore(`rule_${rule.ruleId}`) || rule.label}</div>
                            {rule.detail && <div className="text-xs text-muted-foreground">{rule.detail}</div>}
                          </div>
                          <div className="font-bold whitespace-nowrap">
                            {layer.layerId === 'L7' ? "-" : "+"}{parseFloat(rule.points).toFixed(1)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground py-2 italic text-center">
                      {tScore("noRulesTriggered")}
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="text-center py-8 text-muted-foreground text-sm">
            {tScore("noBreakdownAvailable")}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

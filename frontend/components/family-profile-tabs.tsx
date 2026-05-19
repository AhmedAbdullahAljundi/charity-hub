"use client";

import React, { useState } from "react";
import {
  User, Users, Wallet, Receipt, Stethoscope, BarChart3,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslations, useLocale } from "next-intl";

import { BasicInfoTab } from "./family-profile/basic-info-tab";
import { MembersTab } from "./family-profile/members-tab";
import { IncomeTab } from "./family-profile/income-tab";
import { ExpensesTab } from "./family-profile/expenses-tab";
import { MedicalTab } from "./family-profile/medical-tab";
import { ScoringTab } from "./family-profile/scoring-tab";

const legacyClassificationMap: Record<string, string> = {
  'هش للغاية (حرج)': 'VERY_FRAGILE',
  'هش للغاية': 'FRAGILE',
  'ضعيف': 'WEAK',
  'متوسط': 'MODERATE',
  'خارج الأولوية': 'OUT_OF_PRIORITY',
};

const classificationColors: Record<string, string> = {
  VERY_FRAGILE: "bg-destructive/15 text-destructive border-destructive/30",
  FRAGILE: "bg-destructive/15 text-destructive border-destructive/30",
  WEAK: "bg-warning/15 text-warning-foreground border-warning/30",
  MODERATE: "bg-primary/12 text-primary border-primary/25",
  OUT_OF_PRIORITY: "bg-muted text-muted-foreground border-border",
  "هش للغاية (حرج)": "bg-destructive/15 text-destructive border-destructive/30",
  "هش للغاية": "bg-destructive/15 text-destructive border-destructive/30",
  "ضعيف": "bg-warning/15 text-warning-foreground border-warning/30",
  "متوسط": "bg-primary/12 text-primary border-primary/25",
  "خارج الأولوية": "bg-muted text-muted-foreground border-border",
};

export function FamilyProfileTabs({ family }: { family: any }) {
  const tProfile = useTranslations("families.profile.tabs");
  const tDomain = useTranslations("domain");

  // Support both 'income' (old local state) and 'incomes' (API response)
  const incomeList = family.incomes || family.income || [];
  const expenseList = family.expenses || [];
  const medicalList = family.medicalRecords || [];

  const totalIncome = incomeList.reduce((s: any, i: any) => s + (parseFloat(i.amount) || 0), 0);
  const totalExpenses = expenseList.reduce((s: any, e: any) => s + (parseFloat(e.amount) || 0), 0);
  const totalMedicalCost = medicalList.reduce((s: any, r: any) => s + (parseFloat(r.monthlyCost) || 0), 0);
  const netBalance = totalIncome - (totalExpenses + totalMedicalCost);

  // Track which tabs have ever been opened — mount content only on first visit
  const [activeTab, setActiveTab] = useState("basic");
  const [mountedTabs, setMountedTabs] = useState<Set<string>>(new Set(["basic"]));

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setMountedTabs((prev) => new Set([...prev, tab]));
  };

  const getDomainLabel = (group: string, val: string | null | undefined) => {
    if (!val) return "---";
    const mappedVal = group === "vulnerability" ? (legacyClassificationMap[val] || val) : val;
    try {
      const key = `${group}.${mappedVal}`;
      return tDomain.has(key as any) ? tDomain(key as any) : mappedVal;
    } catch {
      return val;
    }
  };

  const locale = useLocale();

  // Determine system recommendation color for ScoringTab
  let recColor = "bg-muted text-muted-foreground";
  if (family.systemRecommendation === "CRITICAL_PRIORITY") recColor = "bg-destructive/15 text-destructive border-destructive/30";
  else if (family.systemRecommendation === "HIGH_PRIORITY") recColor = "bg-destructive/10 text-destructive border-destructive/20";
  else if (family.systemRecommendation === "MEDIUM_PRIORITY") recColor = "bg-warning/15 text-warning-foreground border-warning/30";
  else if (family.systemRecommendation === "LOW_PRIORITY") recColor = "bg-primary/12 text-primary border-primary/25";

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <TabsList className="w-full justify-start overflow-x-auto flex-nowrap bg-card border border-border p-1 h-auto">
        <TabsTrigger value="basic" className="gap-1.5 text-xs sm:text-sm whitespace-nowrap">
          <User className="h-4 w-4" /> {tProfile("basicInfo")}
        </TabsTrigger>
        <TabsTrigger value="members" className="gap-1.5 text-xs sm:text-sm whitespace-nowrap">
          <Users className="h-4 w-4" /> {tProfile("members")}
        </TabsTrigger>
        <TabsTrigger value="income" className="gap-1.5 text-xs sm:text-sm whitespace-nowrap">
          <Wallet className="h-4 w-4" /> {tProfile("income")}
        </TabsTrigger>
        <TabsTrigger value="expenses" className="gap-1.5 text-xs sm:text-sm whitespace-nowrap">
          <Receipt className="h-4 w-4" /> {tProfile("expenses")}
        </TabsTrigger>
        <TabsTrigger value="medical" className="gap-1.5 text-xs sm:text-sm whitespace-nowrap">
          <Stethoscope className="h-4 w-4" /> {tProfile("medical")}
        </TabsTrigger>
        <TabsTrigger value="scoring" className="gap-1.5 text-xs sm:text-sm whitespace-nowrap">
          <BarChart3 className="h-4 w-4" /> {tProfile("scoring")}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="basic">
        <BasicInfoTab 
          family={family} 
          getDomainLabel={getDomainLabel} 
          classificationColors={classificationColors} 
        />
      </TabsContent>

      <TabsContent value="members">
        {mountedTabs.has("members") && <MembersTab family={family} />}
      </TabsContent>

      <TabsContent value="income">
        {mountedTabs.has("income") && (
          <IncomeTab family={{ ...family, income: incomeList }} totalIncome={totalIncome} />
        )}
      </TabsContent>

      <TabsContent value="expenses">
        {mountedTabs.has("expenses") && (
          <ExpensesTab 
            family={{ ...family, expenses: expenseList }} 
            totalExpenses={totalExpenses} 
            netBalance={netBalance} 
          />
        )}
      </TabsContent>

      <TabsContent value="medical">
        {mountedTabs.has("medical") && (
          <MedicalTab family={{ ...family, medicalRecords: medicalList }} />
        )}
      </TabsContent>

      <TabsContent value="scoring">
        {mountedTabs.has("scoring") && (
          <ScoringTab
            family={{ ...family, income: incomeList, medicalRecords: medicalList }}
            totalIncome={totalIncome}
            totalExpenses={totalExpenses}
            totalMedicalCost={totalMedicalCost}
            netBalance={netBalance}
            getDomainLabel={getDomainLabel}
            recColor={recColor}
          />
        )}
      </TabsContent>
    </Tabs>
  );
}

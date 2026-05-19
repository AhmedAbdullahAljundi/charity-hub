"use client";

import React from "react";
import { User, CreditCard, Phone, Calendar, Users, FileText, Heart, Shield, CheckCircle2, MapPin, HandCoins } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useTranslations } from "next-intl";
import { InfoField } from "./shared";

interface BasicInfoTabProps {
  family: any;
  getDomainLabel: (group: string, val: string) => string;
  classificationColors: Record<string, string>;
}

export function BasicInfoTab({ family, getDomainLabel, classificationColors }: BasicInfoTabProps) {
  const tProfile = useTranslations("families.profile.basicInfo");
  const tScore = useTranslations("families.profile.scoring");

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">{tProfile("title")}</CardTitle>
        <div className="flex items-center gap-2">
          {family.dataVerified && (
            <Badge variant="outline" className="bg-success/12 text-success border-success/25 gap-1">
              <CheckCircle2 className="h-3 w-3" /> {tProfile("verified")}
            </Badge>
          )}
          {family.fieldResearchDone && (
            <Badge variant="outline" className="bg-primary/12 text-primary border-primary/25 gap-1">
              <Shield className="h-3 w-3" /> {tProfile("fieldResearch")}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Personal Info */}
        <div>
          <h4 className="text-sm font-semibold text-muted-foreground mb-3">{tProfile("familyData")}</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <InfoField icon={User} label={tProfile("headName")} value={family.headName} />
            <InfoField icon={User} label={tProfile("wifeName")} value={family.wifeName || "---"} />
            <InfoField icon={CreditCard} label={tProfile("nationalId")} value={family.nationalId} dir="ltr" />
            <InfoField icon={CreditCard} label={tProfile("wifeNationalId")} value={family.wifeNationalId || "---"} dir="ltr" />
            <InfoField icon={Phone} label={tProfile("phone")} value={family.phone} dir="ltr" />
            <InfoField icon={Phone} label={tProfile("phone2")} value={family.phone2 || "---"} dir="ltr" />
            <InfoField icon={MapPin} label={tProfile("address")} value={family.address} />
            <InfoField icon={Calendar} label={tProfile("registrationDate")} value={family.registrationDate} />
            <InfoField icon={Users} label={tProfile("membersCount")} value={`${Array.isArray(family.members) ? family.members.length : family.members || 0} ${tProfile("membersSuffix")}`} />
          </div>
        </div>

        <Separator />

        {/* Financial Info */}
        <div>
          <h4 className="text-sm font-semibold text-muted-foreground mb-3">{tProfile("financialData")}</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <InfoField icon={CreditCard} label={tProfile("meezaCard")} value={family.meezaCard || tProfile("notRegistered")} dir="ltr" />
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <FileText className="h-3 w-3" /> {tProfile("classification")}
              </p>
              <Badge variant="outline" className={classificationColors[family.classification] || ""}>
                {getDomainLabel("vulnerability", family.classification)}
              </Badge>
            </div>
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Heart className="h-3 w-3" /> {tProfile("caseCategory")}
              </p>
              <Badge variant="secondary">
                {getDomainLabel("social_status", family.category)}
              </Badge>
            </div>
            <InfoField icon={FileText} label={tProfile("categoryReason")} value={family.categoryReason || "---"} />
            <InfoField icon={HandCoins} label={tProfile("aidDecision")} value={family.aidDecision || "---"} />
            <InfoField icon={HandCoins} label={tProfile("monthlyAid")} value={family.monthlyAidAmount ? `${family.monthlyAidAmount} ${tScore("currency")}` : "---"} />
          </div>
        </div>

        {/* Field Research Notes */}
        {family.fieldResearchNotes && (
          <>
            <Separator />
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground mb-2">{tProfile("fieldResearchNotes")}</h4>
              <p className="text-sm text-foreground bg-secondary/50 p-3 rounded-xl leading-relaxed">{family.fieldResearchNotes}</p>
            </div>
          </>
        )}

        {family.notes && (
          <>
            <Separator />
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground mb-2">{tProfile("generalNotes")}</h4>
              <p className="text-sm text-foreground bg-secondary/50 p-3 rounded-xl leading-relaxed">{family.notes}</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

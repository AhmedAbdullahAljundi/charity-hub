"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { api } from "@/lib/api/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Users, AlertCircle, Map, Target, Stethoscope, HeartPulse } from "lucide-react";
import { motion } from "framer-motion";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart,
  PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis
} from "recharts";

const COLORS = ['#0ea5e9', '#22c55e', '#eab308', '#f97316', '#ef4444'];

export function AnalyticsClient() {
  const t = useTranslations("analytics");
  const locale = useLocale();
  const isRtl = locale === "ar";
  
  const [data, setData] = useState<{
    distribution: any;
    regional: any[];
    healthBurden: any;
    scoreTrends: any[];
  } | null>(null);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const [d, r, h, s] = await Promise.all([
          api.get("/analytics/distribution"),
          api.get("/analytics/regional"),
          api.get("/analytics/health-burden"),
          api.get("/analytics/score-trends"),
        ]);
        setData({ 
          distribution: d.data.data, 
          regional: r.data.data,
          healthBurden: h.data.data,
          scoreTrends: s.data.data
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-500" />
      </div>
    );
  }

  if (!data) return null;

  const formatLevel = (level: string) => {
    const key = `level${level}`;
    return t.has(key as any) ? t(key as any) : level;
  };

  const distributionPieData = data.distribution?.byLevel?.map((item: any) => ({
    name: formatLevel(item.level),
    value: item.count
  })) || [];

  const formatLayer = (layerId: string) => {
    // If translation exists in analytics namespace, use it. Otherwise fallback to layerId
    const key = `layer${layerId}`;
    return t.has(key as any) ? t(key as any) : layerId;
  };

  const radarData = data.distribution?.layerAverages?.map((item: any) => ({
    subject: formatLayer(item.layerId),
    A: item.average,
    fullMark: 100,
  })) || [];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("statTotalHouseholds")}</CardTitle>
            <Users className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.distribution?.totalHouseholds || 0}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("statPendingDecision")}</CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.distribution?.pendingDecision || 0}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("statFieldVisit")}</CardTitle>
            <Map className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.distribution?.fieldVisitRequired || 0}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("statDisease")}</CardTitle>
            <Stethoscope className="h-4 w-4 text-sky-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.healthBurden?.diseaseContribution?.toFixed(1) || 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Distribution Pie Chart */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>{t("chartDistribution")}</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributionPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {distributionPieData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Score Trends Area Chart */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>{t("chartTrends")}</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.scoreTrends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCRITICAL" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorHIGH" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" opacity={0.2} />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="CRITICAL" name={t("levelCRITICAL")} stroke="#ef4444" fillOpacity={1} fill="url(#colorCRITICAL)" />
                <Area type="monotone" dataKey="HIGH_NEED" name={t("levelHIGH_NEED")} stroke="#f97316" fillOpacity={1} fill="url(#colorHIGH)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Regional Bar Chart */}
        <Card className="shadow-sm md:col-span-2">
          <CardHeader>
            <CardTitle>{t("chartRegional")}</CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.regional} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" opacity={0.2} />
                <XAxis dataKey="governorate" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }} />
                <Legend />
                <Bar dataKey="count" name={t("count")} fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                <Bar dataKey="avgPercent" name={t("average")} fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Radar Chart for Layers */}
        <Card className="shadow-sm md:col-span-2">
          <CardHeader>
            <CardTitle>{t("chartRadar")}</CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#333" opacity={0.2} />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "#888", fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#888", fontSize: 10 }} />
                <Radar name={t("average")} dataKey="A" stroke="#22c55e" fill="#22c55e" fillOpacity={0.6} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

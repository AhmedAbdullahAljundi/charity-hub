"use client";

import { useEffect, useState, useCallback } from "react";
import { getDistribution, getRegional, getScoreTrends } from "@/lib/api/analytics-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { 
 BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell,
 LineChart, Line 
} from "recharts";

const ELIGIBILITY_COLORS: Record<string, string> = {
 CRITICAL: "#e11d48", // rose-600
 HIGH_NEED: "#ea580c", // orange-600
 MODERATE_NEED: "#ca8a04", // yellow-600
 LOW_NEED: "#2563eb", // blue-600
 NOT_ELIGIBLE: "#64748b" // slate-500
};

const ELIGIBILITY_LABELS: Record<string, string> = {
 CRITICAL: "حرجة جداً",
 HIGH_NEED: "احتياج عالي",
 MODERATE_NEED: "احتياج متوسط",
 LOW_NEED: "احتياج منخفض",
 NOT_ELIGIBLE: "غير مستحق"
};

export function MainChartsGrid() {
 const [distData, setDistData] = useState<any>(null);
 const [distLoading, setDistLoading] = useState(true);

 const [regData, setRegData] = useState<any[]>([]);
 const [regLoading, setRegLoading] = useState(true);

 const [trendData, setTrendData] = useState<any[]>([]);
 const [trendLoading, setTrendLoading] = useState(true);

 const fetchDistribution = useCallback(async () => {
 setDistLoading(true);
 try {
 const res = await getDistribution();
 setDistData(res);
 } catch (e) {
 console.error(e);
 }
 setDistLoading(false);
 }, []);

 const fetchRegional = useCallback(async () => {
 setRegLoading(true);
 try {
 const res = await getRegional();
 // sort desc by avgPercent
 setRegData(res.sort((a: any, b: any) => b.avgPercent - a.avgPercent));
 } catch (e) {
 console.error(e);
 }
 setRegLoading(false);
 }, []);

 const fetchTrends = useCallback(async () => {
 setTrendLoading(true);
 try {
 const res = await getScoreTrends();
 setTrendData(res);
 } catch (e) {
 console.error(e);
 }
 setTrendLoading(false);
 }, []);

 useEffect(() => {
 // eslint-disable-next-line react-hooks/set-state-in-effect
 void fetchDistribution();
 // eslint-disable-next-line react-hooks/set-state-in-effect
 void fetchRegional();
 // eslint-disable-next-line react-hooks/set-state-in-effect
 void fetchTrends();
 }, [fetchDistribution, fetchRegional, fetchTrends]);

 // Chart 1: Distribution
 const distChartData = distData?.byLevel?.map((d: any) => ({
 name: ELIGIBILITY_LABELS[d.level] || d.level,
 count: d.count,
 level: d.level
 })) || [];

 // Chart 2: Layer Averages
 const layerChartData = distData?.layerAverages?.map((d: any) => ({
 layer: d.layerId,
 average: Number(d.average.toFixed(2))
 })) || [];

 return (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4" >
 {/* CHART 1 — توزيع درجات الاستحقاق */}
 <Card>
 <CardHeader className="flex flex-row items-center justify-between py-3 bg-muted/20">
 <CardTitle className="text-sm font-bold">توزيع درجات الاستحقاق</CardTitle>
 <Button variant="ghost" size="icon" className="h-6 w-6" onClick={fetchDistribution} disabled={distLoading}>
 <RefreshCw className={`h-3 w-3 ${distLoading ? "animate-spin" : ""}`} />
 </Button>
 </CardHeader>
 <CardContent className="p-4 h-[300px]" dir="ltr">
 {distLoading ? <Skeleton className="w-full h-full" /> : (
 <ResponsiveContainer width="100%" height="100%">
 <BarChart data={distChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
 <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
 <XAxis dataKey="name" tick={{ fontSize: 10 }} />
 <YAxis tick={{ fontSize: 10 }} />
 <Tooltip 
 cursor={{ fill: 'transparent' }}
 contentStyle={{ borderRadius: '8px', fontSize: '12px', direction: 'rtl' }}
 />
 <Bar dataKey="count" name="عدد الأسر" radius={[4, 4, 0, 0]}>
 {distChartData.map((entry: any, index: number) => (
 <Cell key={`cell-${index}`} fill={ELIGIBILITY_COLORS[entry.level] || "#cbd5e1"} />
 ))}
 </Bar>
 </BarChart>
 </ResponsiveContainer>
 )}
 </CardContent>
 </Card>

 {/* CHART 2 — متوسط إسهام الطبقات */}
 <Card>
 <CardHeader className="flex flex-row items-center justify-between py-3 bg-muted/20">
 <CardTitle className="text-sm font-bold">متوسط إسهام الطبقات</CardTitle>
 <Button variant="ghost" size="icon" className="h-6 w-6" onClick={fetchDistribution} disabled={distLoading}>
 <RefreshCw className={`h-3 w-3 ${distLoading ? "animate-spin" : ""}`} />
 </Button>
 </CardHeader>
 <CardContent className="p-4 h-[300px]" dir="ltr">
 {distLoading ? <Skeleton className="w-full h-full" /> : (
 <ResponsiveContainer width="100%" height="100%">
 <BarChart data={layerChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
 <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
 <XAxis dataKey="layer" tick={{ fontSize: 10 }} />
 <YAxis tick={{ fontSize: 10 }} />
 <Tooltip 
 cursor={{ fill: '#f1f5f9' }}
 contentStyle={{ borderRadius: '8px', fontSize: '12px', direction: 'rtl' }}
 />
 <Bar dataKey="average" name="متوسط الدرجة" fill="#6366f1" radius={[4, 4, 0, 0]} />
 </BarChart>
 </ResponsiveContainer>
 )}
 </CardContent>
 </Card>

 {/* CHART 3 — توزيع جغرافي */}
 <Card>
 <CardHeader className="flex flex-row items-center justify-between py-3 bg-muted/20">
 <CardTitle className="text-sm font-bold">التوزيع الجغرافي للدرجات</CardTitle>
 <Button variant="ghost" size="icon" className="h-6 w-6" onClick={fetchRegional} disabled={regLoading}>
 <RefreshCw className={`h-3 w-3 ${regLoading ? "animate-spin" : ""}`} />
 </Button>
 </CardHeader>
 <CardContent className="p-4 h-[300px]" dir="ltr">
 {regLoading ? <Skeleton className="w-full h-full" /> : (
 <ResponsiveContainer width="100%" height="100%">
 <BarChart data={regData} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
 <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.3} />
 <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
 <YAxis type="category" dataKey="governorate" tick={{ fontSize: 10 }} width={80} />
 <Tooltip 
 cursor={{ fill: 'transparent' }}
 contentStyle={{ borderRadius: '8px', fontSize: '12px', direction: 'rtl' }}
 />
 <Bar dataKey="avgPercent" name="متوسط الاستحقاق %" radius={[0, 4, 4, 0]}>
 {regData.map((entry: any, index: number) => {
 const color = entry.avgPercent > 70 ? "#e11d48" : entry.avgPercent > 40 ? "#ca8a04" : "#2563eb";
 return <Cell key={`cell-${index}`} fill={color} />;
 })}
 </Bar>
 </BarChart>
 </ResponsiveContainer>
 )}
 </CardContent>
 </Card>

 {/* CHART 4 — اتجاه الدرجات */}
 <Card>
 <CardHeader className="flex flex-row items-center justify-between py-3 bg-muted/20">
 <CardTitle className="text-sm font-bold">اتجاه الاستحقاق (آخر 12 شهر)</CardTitle>
 <Button variant="ghost" size="icon" className="h-6 w-6" onClick={fetchTrends} disabled={trendLoading}>
 <RefreshCw className={`h-3 w-3 ${trendLoading ? "animate-spin" : ""}`} />
 </Button>
 </CardHeader>
 <CardContent className="p-4 h-[300px]" dir="ltr">
 {trendLoading ? <Skeleton className="w-full h-full" /> : (
 <ResponsiveContainer width="100%" height="100%">
 <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
 <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
 <XAxis dataKey="month" tick={{ fontSize: 10 }} />
 <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
 <Tooltip 
 contentStyle={{ borderRadius: '8px', fontSize: '12px', direction: 'rtl' }}
 />
 <Legend wrapperStyle={{ fontSize: '10px' }} />
 {Object.keys(ELIGIBILITY_COLORS).map(level => (
 <Line 
 key={level}
 type="monotone" 
 dataKey={level} 
 name={ELIGIBILITY_LABELS[level]} 
 stroke={ELIGIBILITY_COLORS[level]} 
 strokeWidth={2}
 dot={false}
 connectNulls
 />
 ))}
 </LineChart>
 </ResponsiveContainer>
 )}
 </CardContent>
 </Card>
 </div>
 );
}

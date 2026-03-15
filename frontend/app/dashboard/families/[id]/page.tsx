"use client";

import { use, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFamiliesStore } from "@/lib/store";
import dynamic from "next/dynamic";

const FamilyProfileTabsWrapper = dynamic(
    () => import("@/components/family-profile-tabs").then((mod) => mod.FamilyProfileTabs),
    { ssr: false }
);

interface PageParams {
    params: Promise<{ id: string }>;
}

export default function FamilyProfilePage({ params }: PageParams) {
    const { id } = use(params);
    const { families, fetchFamilyDetails, loading } = useFamiliesStore();
    const family = families.find((f: { id: string | number }) => String(f.id) === String(id));

    useEffect(() => {
        if (!family || typeof family.members === "number") {
            fetchFamilyDetails(id);
        }
    }, [id, family, fetchFamilyDetails]);

    if (loading && families.length === 0) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!family) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-3xl text-muted-foreground">!</span>
                </div>
                <h3 className="text-lg font-semibold text-foreground">لم يتم العثور على الأسرة</h3>
                <p className="text-muted-foreground text-sm">الأسرة المطلوبة غير موجودة في النظام</p>
                <Button variant="outline" asChild>
                    <Link href="/dashboard/families" className="gap-2">
                        <ArrowRight className="h-4 w-4" />
                        العودة للقائمة
                    </Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard/families">
                        <ArrowRight className="h-5 w-5" />
                        <span className="sr-only">رجوع</span>
                    </Link>
                </Button>
                <div>
                    <h2 className="text-2xl font-bold text-foreground">{family.headName}</h2>
                    <p className="text-muted-foreground text-sm">{family.category} - {family.address}</p>
                </div>
            </div>

            <FamilyProfileTabsWrapper family={family} />
        </div>
    );
}

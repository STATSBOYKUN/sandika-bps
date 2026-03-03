"use client";

import dynamic from "next/dynamic";

import PageHeader from "@/components/layout/PageHeader";
import PageShell from "@/components/layout/PageShell";

const PetaIndustriMap = dynamic(
    () => import("@/components/peta-industri/PetaIndustriMap"),
    {
        ssr: false,
        loading: () => (
            <section className="rounded-xl border border-base-300 bg-base-200/50 p-6">
                <div className="h-[560px] animate-pulse rounded-xl bg-base-300/50" />
            </section>
        ),
    },
);

export default function PetaIndustriPage() {
    return (
        <PageShell width="4xl" className="space-y-6">
            <PageHeader
                title="Peta Industri"
                description="Visualisasi persebaran industri digital di Karanganyar dengan peta interaktif, filter, dan detail entitas saat mappin diklik."
                badge="Spasial"
            />
            <PetaIndustriMap />
        </PageShell>
    );
}

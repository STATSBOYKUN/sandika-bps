"use client";

import dynamic from "next/dynamic";

import { PageSkeletonContent } from "@/components/layout/PageSkeleton";
import PageHeader from "@/components/layout/PageHeader";
import PageShell from "@/components/layout/PageShell";

const PetaIndustriMap = dynamic(
    () => import("@/components/peta-industri/PetaIndustriMap"),
    {
        ssr: false,
        loading: () => <PageSkeletonContent variant="map" />,
    },
);

export default function PetaIndustriPage() {
    return (
        <PageShell width="4xl" className="space-y-6">
            <PageHeader
                title="Peta Industri"
                description="Deskripsi Peta Industri"
                badge="Spasial"
            />
            <PetaIndustriMap />
        </PageShell>
    );
}

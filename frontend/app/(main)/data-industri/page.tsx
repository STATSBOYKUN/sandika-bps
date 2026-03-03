"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import {
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    type ColumnDef,
    type PaginationState,
    type SortingState,
    useReactTable,
} from "@tanstack/react-table";

import DataIndustriFilterModal from "@/components/data-industri/DataIndustriFilterModal";
import DataIndustriDetailModal from "@/components/data-industri/DataIndustriDetailModal";
import DataIndustriTable from "@/components/data-industri/DataIndustriTable";
import DataIndustriToolbar from "@/components/data-industri/DataIndustriToolbar";
import { buildDummyRows } from "@/components/data-industri/mock-data";
import {
    KBLI_OPTIONS,
    PLATFORM_FILTER_OPTIONS,
    type IndustryRow,
    type PlatformFilterOption,
} from "@/components/data-industri/types";
import PageHeader from "@/components/layout/PageHeader";
import PageShell from "@/components/layout/PageShell";

function platformBadgeTone(platform: IndustryRow["platform"]) {
    if (platform === "YouTube") return "badge-error";
    if (platform === "Lynk Id") return "badge-info";
    if (platform === "Google Maps") return "badge-success";
    return "badge-secondary";
}

const columns: ColumnDef<IndustryRow>[] = [
    {
        accessorKey: "id",
        header: "ID",
        size: 190,
        minSize: 150,
        cell: (info) => (
            <span className="font-mono text-xs">{String(info.getValue())}</span>
        ),
    },
    { accessorKey: "namaUsaha", header: "Nama Usaha", size: 380, minSize: 280 },
    {
        accessorKey: "kbliKategori",
        header: "KBLI BPS",
        size: 600,
        minSize: 420,
        filterFn: (row, columnId, filterValue) => {
            const selected = (filterValue ?? []) as string[];
            if (!selected.length) return true;
            return selected.includes(row.getValue(columnId));
        },
        cell: (info) => (
            <span className="line-clamp-2 leading-relaxed">
                {String(info.getValue())}
            </span>
        ),
    },
    { accessorKey: "provinsiId", header: "Provinsi ID", size: 180, minSize: 150 },
    { accessorKey: "kabupatenId", header: "Kabupaten ID", size: 190, minSize: 160 },
    { accessorKey: "kecamatanId", header: "Kecamatan ID", size: 190, minSize: 160 },
    { accessorKey: "kecamatanNama", header: "Kecamatan", size: 280, minSize: 220 },
    {
        accessorKey: "platform",
        header: "Platform",
        size: 210,
        minSize: 170,
        cell: (info) => <span className={`badge badge-sm ${platformBadgeTone(info.getValue() as IndustryRow["platform"])}`}>{String(info.getValue())}</span>,
    },
    {
        accessorKey: "latitude",
        header: "Latitude",
        size: 210,
        minSize: 170,
        cell: (info) => (
            <span className="font-mono text-xs">{Number(info.getValue()).toFixed(6)}</span>
        ),
    },
    {
        accessorKey: "longitude",
        header: "Longitude",
        size: 210,
        minSize: 170,
        cell: (info) => (
            <span className="font-mono text-xs">{Number(info.getValue()).toFixed(6)}</span>
        ),
    },
    {
        accessorKey: "status",
        header: "Status",
        size: 170,
        minSize: 140,
        cell: (info) => {
            const value = info.getValue() as IndustryRow["status"];
            const tone =
                value === "Aktif"
                    ? "badge-success"
                    : value === "Verifikasi"
                      ? "badge-info"
                      : "badge-warning";
            return <span className={`badge ${tone}`}>{value}</span>;
        },
    },
    { accessorKey: "updatedAt", header: "Terakhir Update", size: 280, minSize: 220 },
];

export default function DataIndustriPage() {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [searchInput, setSearchInput] = useState("");
    const deferredSearch = useDeferredValue(searchInput);
    const [globalFilter, setGlobalFilter] = useState("");
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 100,
    });

    const [selectedKbli, setSelectedKbli] = useState<string[]>([
        ...KBLI_OPTIONS,
    ]);
    const [tempKbli, setTempKbli] = useState<string[]>([...KBLI_OPTIONS]);
    const [selectedPlatforms, setSelectedPlatforms] = useState<
        PlatformFilterOption[]
    >([...PLATFORM_FILTER_OPTIONS]);
    const [tempPlatforms, setTempPlatforms] = useState<PlatformFilterOption[]>([
        ...PLATFORM_FILTER_OPTIONS,
    ]);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [previewRow, setPreviewRow] = useState<IndustryRow | null>(null);

    const baseData = useMemo(() => buildDummyRows(10_000), []);
    const data = useMemo(() => {
        return baseData.filter((row) => {
            const matchesPlatform = selectedPlatforms.includes(row.platform);
            return matchesPlatform;
        });
    }, [baseData, selectedPlatforms]);

    const columnFilters = useMemo(
        () => [{ id: "kbliKategori", value: selectedKbli }],
        [selectedKbli],
    );

    useEffect(() => {
        setGlobalFilter(deferredSearch.trim());
    }, [deferredSearch]);

    // eslint-disable-next-line react-hooks/incompatible-library
    const table = useReactTable({
        data,
        columns,
        defaultColumn: {
            minSize: 160,
            size: 220,
        },
        columnResizeMode: "onChange",
        state: {
            sorting,
            globalFilter,
            pagination,
            columnFilters,
        },
        onSortingChange: setSorting,
        onPaginationChange: setPagination,
        onGlobalFilterChange: setGlobalFilter,
        globalFilterFn: (row, _columnId, filterValue) => {
            const q = String(filterValue ?? "").toLowerCase();
            if (!q) return true;
            return [
                row.original.id,
                row.original.namaUsaha,
                row.original.kecamatanNama,
            ]
                .join(" ")
                .toLowerCase()
                .includes(q);
        },
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        enableColumnResizing: true,
    });

    useEffect(() => {
        setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }, [globalFilter, selectedKbli, selectedPlatforms]);

    const filteredCount = table.getFilteredRowModel().rows.length;

    const openFilterModal = () => {
        setTempKbli([...selectedKbli]);
        setTempPlatforms([...selectedPlatforms]);
        setIsFilterModalOpen(true);
    };

    const applyFilters = () => {
        setSelectedKbli([...tempKbli]);
        setSelectedPlatforms([...tempPlatforms]);
        setIsFilterModalOpen(false);
    };

    const toggleKbli = (value: string) => {
        setTempKbli((prev) =>
            prev.includes(value)
                ? prev.filter((item) => item !== value)
                : [...prev, value],
        );
    };

    const togglePlatform = (value: PlatformFilterOption) => {
        setTempPlatforms((prev) =>
            prev.includes(value)
                ? prev.filter((item) => item !== value)
                : [...prev, value],
        );
    };

    const anomalyCount = table
        .getFilteredRowModel()
        .rows.filter((row) => !row.original.isInsideKaranganyar).length;

    return (
        <PageShell width="4xl" className="space-y-6">
            <PageHeader
                title="Data Industri"
                description="Dummy 10.000 entitas industri digital dengan koordinat spasial kecamatan Karanganyar (95% dalam wilayah), filter multi-kriteria, dan virtualized rendering."
                badge="Master Data"
            />

            <DataIndustriToolbar
                selectedKbli={selectedKbli}
                totalKbliOptions={KBLI_OPTIONS.length}
                selectedPlatforms={selectedPlatforms}
                totalPlatformOptions={PLATFORM_FILTER_OPTIONS.length}
                anomalyCount={anomalyCount}
                searchInput={searchInput}
                onSearchChange={setSearchInput}
                onOpenFilter={openFilterModal}
            />

            <DataIndustriTable
                table={table}
                filteredCount={filteredCount}
                pagination={pagination}
                onRowClick={setPreviewRow}
            />

            <DataIndustriFilterModal
                isOpen={isFilterModalOpen}
                kbliOptions={KBLI_OPTIONS}
                selectedKbli={tempKbli}
                platformOptions={PLATFORM_FILTER_OPTIONS}
                selectedPlatforms={tempPlatforms}
                onToggleKbli={toggleKbli}
                onTogglePlatform={togglePlatform}
                onSelectAll={() => {
                    setTempKbli([...KBLI_OPTIONS]);
                    setTempPlatforms([...PLATFORM_FILTER_OPTIONS]);
                }}
                onClearAll={() => {
                    setTempKbli([]);
                    setTempPlatforms([]);
                }}
                onReset={() => {
                    setTempKbli([...KBLI_OPTIONS]);
                    setTempPlatforms([...PLATFORM_FILTER_OPTIONS]);
                }}
                onClose={() => setIsFilterModalOpen(false)}
                onApply={applyFilters}
            />

            <DataIndustriDetailModal row={previewRow} onClose={() => setPreviewRow(null)} />
        </PageShell>
    );
}

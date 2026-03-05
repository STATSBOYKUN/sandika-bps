import {
    AlertTriangle,
    Building2,
    Landmark,
    Search,
    Settings2,
} from "lucide-react";

interface DataIndustriToolbarProps {
    selectedKbli: string[];
    totalKbliOptions: number;
    selectedKecamatan: string;
    selectedDesa: string;
    anomalyCount: number;
    searchInput: string;
    onSearchChange: (value: string) => void;
    onOpenFilter: () => void;
}

export default function DataIndustriToolbar({
    selectedKbli,
    totalKbliOptions,
    selectedKecamatan,
    selectedDesa,
    anomalyCount,
    searchInput,
    onSearchChange,
    onOpenFilter,
}: DataIndustriToolbarProps) {
    const kbliLabel =
        selectedKbli.length === totalKbliOptions
            ? "Semua KBLI"
            : `${selectedKbli.length} KBLI dipilih`;

    return (
        <section className="rounded-xl border border-base-300 bg-base-200/50 p-3 sm:p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm text-base-content/60">
                        Filter:
                    </span>

                    <span className="badge badge-primary">{kbliLabel}</span>
                    <span className="badge badge-info gap-1.5">
                        <Landmark className="h-3.5 w-3.5" />
                        {selectedKecamatan}
                    </span>
                    <span className="badge badge-secondary gap-1.5">
                        <Building2 className="h-3.5 w-3.5" />
                        {selectedDesa}
                    </span>
                    <div
                        className="tooltip tooltip-bottom"
                        data-tip="Daerah yang diluar wilayah"
                    >
                        <div className="badge badge-warning gap-2">
                            <AlertTriangle className="h-4 w-4" />
                            <span>{anomalyCount}</span>
                        </div>
                    </div>
                </div>

                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                    <label className="input input-bordered input-sm flex w-full items-center gap-2 bg-base-100 sm:w-auto sm:min-w-72">
                        <Search className="h-4 w-4 opacity-60" />
                        <input
                            value={searchInput}
                            onChange={(event) =>
                                onSearchChange(event.target.value)
                            }
                            placeholder="Cari nama, id, kecamatan"
                        />
                    </label>
                    <button
                        type="button"
                        className="btn btn-sm btn-primary w-full gap-2 sm:w-auto"
                        onClick={onOpenFilter}
                    >
                        <Settings2 className="h-4 w-4" />
                        Filter
                    </button>
                </div>
            </div>
        </section>
    );
}

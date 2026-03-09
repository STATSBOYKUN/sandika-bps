import { Check, Filter, RefreshCw, X } from "lucide-react";

import type { IndustryRow } from "@/components/data-industri/types";

import type { MapFilters, WilayahMode } from "@/components/peta-industri/types";

interface MapFilterModalProps {
    isOpen: boolean;
    wilayahMode: WilayahMode;
    filters: MapFilters;
    statusOptions: readonly IndustryRow["status"][];
    kecamatanOptions: string[];
    desaOptions: string[];
    totalShown: number;
    onChange: (next: MapFilters) => void;
    onReset: () => void;
    onClose: () => void;
    onApply: () => void;
}

export default function MapFilterModal({
    isOpen,
    wilayahMode,
    filters,
    statusOptions,
    kecamatanOptions,
    desaOptions,
    totalShown,
    onChange,
    onReset,
    onClose,
    onApply,
}: MapFilterModalProps) {
    if (!isOpen) return null;

    const activeStatusCount = filters.statuses.length;

    return (
        <div className="modal modal-open overflow-x-hidden">
            <div className="modal-box mx-auto w-[calc(100%-1rem)] max-w-[95vw] p-4 sm:w-full sm:max-w-3xl sm:p-6 lg:max-w-4xl">
                <div className="border-b border-base-200 pb-3 sm:pb-4">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                            <div className="rounded-lg bg-primary/10 p-2.5">
                                <Filter className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold leading-tight sm:text-lg">
                                    Filter Peta Industri
                                </h3>
                                <p className="mt-1 text-xs text-base-content/65">
                                    Atur cakupan wilayah dan karakteristik data
                                    untuk memfokuskan titik pada peta.
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            className="btn btn-circle btn-ghost btn-sm"
                            onClick={onClose}
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1.5 sm:gap-2">
                        <span className="badge badge-primary">
                            Mode:{" "}
                            {wilayahMode === "desa" ? "Desa" : "Kecamatan"}
                        </span>
                        <span className="badge badge-accent">
                            Status: {activeStatusCount}
                        </span>
                        <span className="badge badge-outline">
                            Kecamatan: {filters.kecamatan}
                        </span>
                        <span className="badge badge-outline">
                            Desa: {filters.desa}
                        </span>
                        <span className="badge badge-success">
                            Hasil: {totalShown.toLocaleString("id-ID")} titik
                        </span>
                    </div>
                </div>

                <div className="flex-1 min-h-0 space-y-4 overflow-y-auto overscroll-contain py-4 pr-1 sm:py-5">
                    <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-[1.05fr_1fr]">
                        <div className="space-y-4 rounded-2xl border border-base-300 bg-base-100 p-3 sm:p-4">
                            <div>
                                <h4 className="text-sm font-semibold">
                                    Wilayah Administratif
                                </h4>
                                <p className="mt-1 text-xs text-base-content/60">
                                    Pilih kecamatan dan desa untuk menyempitkan
                                    cakupan visualisasi.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                <label className="form-control">
                                    <span className="label-text mb-1 text-xs text-base-content/70">
                                        Filter Kecamatan
                                    </span>
                                    <select
                                        className="select select-bordered select-sm w-full"
                                        value={filters.kecamatan}
                                        onChange={(event) =>
                                            onChange({
                                                ...filters,
                                                kecamatan: event.target.value,
                                                desa: "Semua",
                                            })
                                        }
                                    >
                                        {kecamatanOptions.map((option) => (
                                            <option key={option} value={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                <label className="form-control">
                                    <span className="label-text mb-1 text-xs text-base-content/70">
                                        Filter Desa
                                    </span>
                                    <select
                                        className="select select-bordered select-sm w-full"
                                        value={filters.desa}
                                        onChange={(event) =>
                                            onChange({
                                                ...filters,
                                                desa: event.target.value,
                                            })
                                        }
                                    >
                                        {desaOptions.map((option) => (
                                            <option key={option} value={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            </div>
                        </div>

                        <div className="space-y-3 sm:space-y-4">
                            <div className="rounded-2xl border border-base-300 bg-base-100 p-3 sm:p-4">
                                <div className="mb-3 flex items-center justify-between gap-2">
                                    <h4 className="text-sm font-semibold">
                                        Status
                                    </h4>
                                    <span className="badge badge-sm badge-accent">
                                        {activeStatusCount}
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {statusOptions.map((status) => {
                                        const active =
                                            filters.statuses.includes(status);
                                        return (
                                            <button
                                                key={status}
                                                type="button"
                                                className={`btn btn-sm ${active ? "btn-secondary" : "btn-outline"}`}
                                                onClick={() => {
                                                    const next = active
                                                        ? filters.statuses.filter(
                                                              (item) =>
                                                                  item !==
                                                                  status,
                                                          )
                                                        : [
                                                              ...filters.statuses,
                                                              status,
                                                          ];
                                                    onChange({
                                                        ...filters,
                                                        statuses: next,
                                                    });
                                                }}
                                            >
                                                {active ? (
                                                    <Check className="h-3 w-3" />
                                                ) : null}
                                                {status}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-3 border-t border-base-200 bg-base-100 pt-3 sm:flex-row sm:items-center sm:justify-between sm:pt-4">
                    <button
                        type="button"
                        className="btn btn-outline btn-error w-full sm:w-auto"
                        onClick={onReset}
                    >
                        <RefreshCw className="h-4 w-4" />
                        Reset
                    </button>
                    <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-2">
                        <button
                            type="button"
                            className="btn btn-ghost w-full sm:w-auto"
                            onClick={onClose}
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            className="btn btn-primary w-full sm:w-auto"
                            onClick={onApply}
                            disabled={filters.statuses.length === 0}
                        >
                            Terapkan
                        </button>
                    </div>
                </div>
            </div>
            <div className="modal-backdrop" onClick={onClose}>
                <button type="button" className="cursor-default">
                    close
                </button>
            </div>
        </div>
    );
}

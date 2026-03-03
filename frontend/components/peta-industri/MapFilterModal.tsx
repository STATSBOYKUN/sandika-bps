import { Check, Filter, RefreshCw, Search, X } from "lucide-react";

import type { IndustryRow, PlatformFilterOption } from "@/components/data-industri/types";

import type { MapFilters, WilayahMode } from "@/components/peta-industri/types";

interface MapFilterModalProps {
  isOpen: boolean;
  wilayahMode: WilayahMode;
  filters: MapFilters;
  platformOptions: readonly PlatformFilterOption[];
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
  platformOptions,
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

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-4xl w-full max-h-[88vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between border-b border-base-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Filter className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-lg font-bold">Filter & Information Peta</h3>
          </div>
          <button type="button" className="btn btn-circle btn-ghost btn-sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-5 space-y-4">
          <div className="rounded-xl border border-base-300 bg-base-100 p-4">
            <h4 className="text-sm font-semibold">Filter Information</h4>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="badge badge-primary">Mode: {wilayahMode === "desa" ? "Desa" : "Kecamatan"}</span>
              <span className="badge badge-secondary">Platform: {filters.platforms.length}</span>
              <span className="badge badge-accent">Status: {filters.statuses.length}</span>
              <span className="badge badge-outline">Kecamatan: {filters.kecamatan}</span>
              <span className="badge badge-outline">Desa: {filters.desa}</span>
              <span className="badge badge-success">Hasil: {totalShown.toLocaleString("id-ID")} titik</span>
            </div>

            <label className="input input-bordered input-sm mt-4 flex items-center gap-2">
              <Search className="h-4 w-4 opacity-60" />
              <input
                value={filters.search}
                onChange={(event) => onChange({ ...filters, search: event.target.value })}
                placeholder="Cari id / nama / wilayah"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="form-control">
              <span className="label-text mb-1 text-xs text-base-content/70">Filter Kecamatan</span>
              <select
                className="select select-bordered select-sm w-full"
                value={filters.kecamatan}
                onChange={(event) => onChange({ ...filters, kecamatan: event.target.value, desa: "Semua" })}
              >
                {kecamatanOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="form-control">
              <span className="label-text mb-1 text-xs text-base-content/70">Filter Desa</span>
              <select
                className="select select-bordered select-sm w-full"
                value={filters.desa}
                onChange={(event) => onChange({ ...filters, desa: event.target.value })}
              >
                {desaOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="rounded-xl border border-base-300 bg-base-100 p-4">
            <h4 className="text-sm font-semibold mb-3">Platform</h4>
            <div className="flex flex-wrap gap-2">
              {platformOptions.map((platform) => {
                const active = filters.platforms.includes(platform);
                return (
                  <button
                    key={platform}
                    type="button"
                    className={`btn btn-sm ${active ? "btn-primary" : "btn-outline"}`}
                    onClick={() => {
                      const next = active
                        ? filters.platforms.filter((item) => item !== platform)
                        : [...filters.platforms, platform];
                      onChange({ ...filters, platforms: next });
                    }}
                  >
                    {active ? <Check className="h-3 w-3" /> : null}
                    {platform}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border border-base-300 bg-base-100 p-4">
            <h4 className="text-sm font-semibold mb-3">Status</h4>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((status) => {
                const active = filters.statuses.includes(status);
                return (
                  <button
                    key={status}
                    type="button"
                    className={`btn btn-sm ${active ? "btn-secondary" : "btn-outline"}`}
                    onClick={() => {
                      const next = active
                        ? filters.statuses.filter((item) => item !== status)
                        : [...filters.statuses, status];
                      onChange({ ...filters, statuses: next });
                    }}
                  >
                    {active ? <Check className="h-3 w-3" /> : null}
                    {status}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex justify-between gap-2 border-t border-base-200 pt-4">
          <button type="button" className="btn btn-outline btn-error" onClick={onReset}>
            <RefreshCw className="h-4 w-4" />
            Reset
          </button>
          <div className="flex gap-2">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Batal
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={onApply}
              disabled={filters.platforms.length === 0 || filters.statuses.length === 0}
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

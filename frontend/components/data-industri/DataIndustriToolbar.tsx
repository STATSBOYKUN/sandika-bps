import { Search, Settings2 } from "lucide-react";

import type { PlatformFilterOption } from "@/components/data-industri/types";

interface DataIndustriToolbarProps {
  selectedKbli: string[];
  totalKbliOptions: number;
  selectedPlatforms: PlatformFilterOption[];
  totalPlatformOptions: number;
  anomalyCount: number;
  searchInput: string;
  onSearchChange: (value: string) => void;
  onOpenFilter: () => void;
}

export default function DataIndustriToolbar({
  selectedKbli,
  totalKbliOptions,
  selectedPlatforms,
  totalPlatformOptions,
  anomalyCount,
  searchInput,
  onSearchChange,
  onOpenFilter,
}: DataIndustriToolbarProps) {
  const kbliLabel = selectedKbli.length === totalKbliOptions ? "Semua KBLI" : `${selectedKbli.length} KBLI dipilih`;

  const platformTone = (platform: PlatformFilterOption) => {
    if (platform === "YouTube") return "badge-error";
    if (platform === "Lynk Id") return "badge-info";
    if (platform === "Google Maps") return "badge-success";
    return "badge-secondary";
  };

  return (
    <section className="rounded-xl border border-base-300 bg-base-200/50 p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-base-content/60">Filter:</span>
          <span className="badge badge-primary">{kbliLabel}</span>
          {selectedPlatforms.length === totalPlatformOptions ? (
            <span className="badge badge-accent">Semua platform</span>
          ) : (
            selectedPlatforms.map((platform) => (
              <span key={platform} className={`badge ${platformTone(platform)}`}>
                {platform}
              </span>
            ))
          )}
          <span className="badge badge-warning">Anomali luar daerah: {anomalyCount}</span>
        </div>

        <div className="flex items-center gap-2">
          <label className="input input-bordered input-sm flex items-center gap-2 bg-base-100">
            <Search className="h-4 w-4 opacity-60" />
            <input
              value={searchInput}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Cari nama, id, kecamatan"
            />
          </label>
          <button type="button" className="btn btn-sm btn-primary gap-2" onClick={onOpenFilter}>
            <Settings2 className="h-4 w-4" />
            Filter
          </button>
        </div>
      </div>
    </section>
  );
}

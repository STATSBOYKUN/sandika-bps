import { Check, Filter, RefreshCw, X } from "lucide-react";

import type { PlatformFilterOption } from "@/components/data-industri/types";

interface DataIndustriFilterModalProps {
  isOpen: boolean;
  kbliOptions: readonly string[];
  selectedKbli: string[];
  platformOptions: readonly PlatformFilterOption[];
  selectedPlatforms: PlatformFilterOption[];
  onToggleKbli: (value: string) => void;
  onTogglePlatform: (value: PlatformFilterOption) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  onReset: () => void;
  onClose: () => void;
  onApply: () => void;
}

export default function DataIndustriFilterModal({
  isOpen,
  kbliOptions,
  selectedKbli,
  platformOptions,
  selectedPlatforms,
  onToggleKbli,
  onTogglePlatform,
  onSelectAll,
  onClearAll,
  onReset,
  onClose,
  onApply,
}: DataIndustriFilterModalProps) {
  if (!isOpen) return null;

  const platformButtonTone = (platform: PlatformFilterOption) => {
    if (platform === "YouTube") return "btn-error";
    if (platform === "Lynk Id") return "btn-info";
    if (platform === "Google Maps") return "btn-success";
    return "btn-secondary";
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-3xl w-full max-h-[88vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between border-b border-base-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Filter className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-lg font-bold">Filter Data Industri</h3>
          </div>
          <button type="button" className="btn btn-circle btn-ghost btn-sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-5">
          <div className="space-y-4">
            <div className="rounded-xl border border-base-300 bg-base-100 p-5">
              <div className="mb-4 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">KBLI BPS</span>
                  <span className="badge badge-sm badge-primary">{selectedKbli.length}</span>
                </div>
                <div className="flex gap-2">
                  <button type="button" className="btn btn-xs btn-outline" onClick={onSelectAll}>
                    <Check className="h-3 w-3" />
                    Semua
                  </button>
                  <button type="button" className="btn btn-xs btn-outline" onClick={onClearAll}>
                    Kosongkan
                  </button>
                  <button type="button" className="btn btn-xs btn-outline btn-error" onClick={onReset}>
                    <RefreshCw className="h-3 w-3" />
                    Reset
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {kbliOptions.map((option) => {
                  const selected = selectedKbli.includes(option);
                  return (
                    <button
                      key={option}
                      type="button"
                      className={`btn h-auto w-full justify-start px-4 py-4 text-left transition-all ${selected ? "btn-primary" : "btn-outline"}`}
                      onClick={() => onToggleKbli(option)}
                    >
                      <div className="flex w-full items-start justify-between gap-3">
                        <span className="whitespace-normal text-sm leading-relaxed">{option}</span>
                        {selected && <Check className="mt-0.5 h-4 w-4 shrink-0" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-xl border border-base-300 bg-base-100 p-5">
              <div className="mb-3 flex items-center justify-between gap-2">
                <span className="font-semibold">Sumber Data Platform</span>
                <span className="badge badge-sm badge-secondary">{selectedPlatforms.length}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {platformOptions.map((option) => {
                  const selected = selectedPlatforms.includes(option);
                  return (
                    <button
                      key={option}
                      type="button"
                      className={`btn btn-sm ${selected ? platformButtonTone(option) : "btn-outline"}`}
                      onClick={() => onTogglePlatform(option)}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-base-200 pt-4">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Batal
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onApply}
            disabled={selectedKbli.length === 0 || selectedPlatforms.length === 0}
          >
            Terapkan
          </button>
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

import {
  Building2,
  Check,
  Filter,
  Landmark,
  MapPinned,
  RefreshCw,
  X,
} from "lucide-react";

interface DataIndustriFilterModalProps {
  isOpen: boolean;
  kbliOptions: readonly string[];
  selectedKbli: string[];
  kecamatanOptions: string[];
  desaOptions: string[];
  selectedKecamatan: string;
  selectedDesa: string;
  totalShown: number;
  onToggleKbli: (value: string) => void;
  onChangeKecamatan: (value: string) => void;
  onChangeDesa: (value: string) => void;
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
  kecamatanOptions,
  desaOptions,
  selectedKecamatan,
  selectedDesa,
  totalShown,
  onToggleKbli,
  onChangeKecamatan,
  onChangeDesa,
  onSelectAll,
  onClearAll,
  onReset,
  onClose,
  onApply,
}: DataIndustriFilterModalProps) {
  if (!isOpen) return null;

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
                <h3 className="text-base font-bold leading-tight sm:text-lg">Filter Data Industri</h3>
                <p className="mt-1 text-xs text-base-content/65">
                  Atur wilayah administratif dan kategori KBLI untuk memfokuskan tabel data.
                </p>
              </div>
            </div>
            <button type="button" className="btn btn-circle btn-ghost btn-sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5 sm:gap-2">
            <span className="badge badge-primary">KBLI: {selectedKbli.length}</span>
            <span className="badge badge-info gap-1.5">
              <Landmark className="h-3.5 w-3.5" />
              {selectedKecamatan}
            </span>
            <span className="badge badge-secondary gap-1.5">
              <Building2 className="h-3.5 w-3.5" />
              {selectedDesa}
            </span>
            <span className="badge badge-success gap-1.5">
              <MapPinned className="h-3.5 w-3.5" />
              {totalShown.toLocaleString("id-ID")} data
            </span>
          </div>
        </div>

        <div className="flex-1 min-h-0 space-y-4 overflow-y-auto overscroll-contain py-4 pr-1 sm:py-5">
          <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-[1.05fr_1fr]">
            <div className="space-y-4 rounded-2xl border border-base-300 bg-base-100 p-3 sm:p-4">
              <div>
                <h4 className="text-sm font-semibold">Wilayah Administratif</h4>
                <p className="mt-1 text-xs text-base-content/60">
                  Pilih kecamatan dan desa untuk mempersempit cakupan data industri.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <label className="form-control">
                  <span className="label-text mb-1 text-xs text-base-content/70">Filter Kecamatan</span>
                  <select
                    className="select select-bordered select-sm w-full"
                    value={selectedKecamatan}
                    onChange={(event) => onChangeKecamatan(event.target.value)}
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
                    value={selectedDesa}
                    onChange={(event) => onChangeDesa(event.target.value)}
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

            <div className="rounded-2xl border border-base-300 bg-base-100 p-3 sm:p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm font-semibold">KBLI BPS</h4>
                  <p className="text-xs text-base-content/60">Pilih satu atau lebih kategori klasifikasi kegiatan usaha.</p>
                </div>
                <span className="badge badge-sm badge-primary">{selectedKbli.length}</span>
              </div>

              <div className="max-h-[38dvh] space-y-2.5 overflow-y-auto pr-1 sm:max-h-[420px] sm:space-y-3">
                {kbliOptions.map((option) => {
                  const selected = selectedKbli.includes(option);
                  return (
                    <button
                      key={option}
                      type="button"
                      className={`btn h-auto w-full justify-start px-3 py-3 text-left transition-all sm:px-4 sm:py-4 ${selected ? "btn-primary" : "btn-outline"}`}
                      onClick={() => onToggleKbli(option)}
                    >
                      <div className="flex w-full items-start justify-between gap-3">
                        <span className="whitespace-normal text-xs leading-relaxed sm:text-sm">{option}</span>
                        {selected ? <Check className="mt-0.5 h-4 w-4 shrink-0" /> : null}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-base-200 bg-base-100 pt-3 sm:flex-row sm:items-center sm:justify-between sm:pt-4">
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" className="btn btn-xs btn-outline" onClick={onSelectAll}>
              <Check className="h-3 w-3" />
              Pilih Semua
            </button>
            <button type="button" className="btn btn-xs btn-outline" onClick={onClearAll}>
              Kosongkan
            </button>
            <button type="button" className="btn btn-xs btn-outline btn-error" onClick={onReset}>
              <RefreshCw className="h-3 w-3" />
              Reset
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-2">
            <button type="button" className="btn btn-ghost w-full sm:w-auto" onClick={onClose}>
              Batal
            </button>
            <button
              type="button"
              className="btn btn-primary w-full sm:w-auto"
              onClick={onApply}
              disabled={selectedKbli.length === 0}
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

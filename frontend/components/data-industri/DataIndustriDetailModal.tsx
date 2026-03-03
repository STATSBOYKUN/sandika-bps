import { X } from "lucide-react";

import type { IndustryRow } from "@/components/data-industri/types";

interface DataIndustriDetailModalProps {
  row: IndustryRow | null;
  onClose: () => void;
}

function platformTone(platform: IndustryRow["platform"]) {
  if (platform === "YouTube") return "badge-error";
  if (platform === "Lynk Id") return "badge-info";
  if (platform === "Google Maps") return "badge-success";
  return "badge-secondary";
}

export default function DataIndustriDetailModal({ row, onClose }: DataIndustriDetailModalProps) {
  if (!row) return null;

  const fields = [
    ["ID", row.id],
    ["Nama Usaha", row.namaUsaha],
    ["KBLI", row.kbliKategori],
    ["Provinsi ID", row.provinsiId],
    ["Kabupaten ID", row.kabupatenId],
    ["Kecamatan ID", row.kecamatanId],
    ["Kecamatan", row.kecamatanNama],
    ["Desa ID", row.desaId],
    ["Desa", row.desaNama],
    ["Status", row.status],
    ["Latitude", row.latitude.toFixed(6)],
    ["Longitude", row.longitude.toFixed(6)],
    ["Updated At", row.updatedAt],
    ["Anomali", row.isInsideKaranganyar ? "Tidak" : "Ya"],
  ] as const;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-3xl w-full max-h-[88vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between border-b border-base-200 pb-4">
          <h3 className="text-lg font-bold">Preview Data Industri</h3>
          <button type="button" className="btn btn-circle btn-ghost btn-sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-5 space-y-4">
          <div className="flex items-center gap-2">
            <span className={`badge ${platformTone(row.platform)}`}>{row.platform}</span>
            {!row.isInsideKaranganyar && <span className="badge badge-warning">Luar Karanganyar</span>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {fields.map(([label, value]) => (
              <div key={label} className="rounded-lg border border-base-300 bg-base-100 px-3 py-2">
                <div className="text-xs text-base-content/60">{label}</div>
                <div className="mt-1 text-sm font-medium break-words">{value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end border-t border-base-200 pt-4">
          <button type="button" className="btn btn-primary" onClick={onClose}>
            Tutup
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

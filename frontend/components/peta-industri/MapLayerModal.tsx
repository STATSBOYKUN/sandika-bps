import { Layers, X } from "lucide-react";

import type { BasemapOption } from "@/components/peta-industri/types";

interface MapLayerModalProps {
  isOpen: boolean;
  basemap: BasemapOption;
  onChangeBasemap: (value: BasemapOption) => void;
  onResetView: () => void;
  onClose: () => void;
}

export default function MapLayerModal({
  isOpen,
  basemap,
  onChangeBasemap,
  onResetView,
  onClose,
}: MapLayerModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-xl w-full">
        <div className="flex items-center justify-between border-b border-base-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Layers className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-lg font-bold">Kontrol Basemap</h3>
          </div>
          <button type="button" className="btn btn-circle btn-ghost btn-sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="py-5 space-y-4">
          <div className="rounded-lg border border-base-300 bg-base-100 p-3">
            <p className="text-sm font-semibold mb-2">Basemap</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className={`btn btn-sm ${basemap === "osm" ? "btn-primary" : "btn-outline"}`}
                onClick={() => onChangeBasemap("osm")}
              >
                OSM Default
              </button>
              <button
                type="button"
                className={`btn btn-sm ${basemap === "light" ? "btn-primary" : "btn-outline"}`}
                onClick={() => onChangeBasemap("light")}
              >
                Light
              </button>
              <button
                type="button"
                className={`btn btn-sm ${basemap === "dark" ? "btn-primary" : "btn-outline"}`}
                onClick={() => onChangeBasemap("dark")}
              >
                Dark
              </button>
            </div>
          </div>

          <button type="button" className="btn btn-outline w-full" onClick={onResetView}>
            Fokus Titik Awal
          </button>
        </div>

        <div className="flex justify-end border-t border-base-200 pt-4">
          <button type="button" className="btn btn-primary" onClick={onClose}>
            Selesai
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

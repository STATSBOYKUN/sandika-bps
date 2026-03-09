import { Layers, X } from "lucide-react";

import type { BasemapOption } from "@/components/peta-industri/types";

interface MapLayerModalProps {
	isOpen: boolean;
	basemap: BasemapOption;
	onChangeBasemap: (value: BasemapOption) => void;
	onClose: () => void;
}

export default function MapLayerModal({
	isOpen,
	basemap,
	onChangeBasemap,
	onClose,
}: MapLayerModalProps) {
	if (!isOpen) return null;

	return (
		<div className="modal modal-open overflow-x-hidden">
			<div className="modal-box mx-auto">
				<div className="border-base-200 flex items-center justify-between border-b pb-3 sm:pb-4">
					<div className="flex items-center gap-3">
						<div className="bg-primary/10 rounded-lg p-2">
							<Layers className="text-primary h-5 w-5" />
						</div>
						<h3 className="text-base font-bold sm:text-lg">
							Kontrol Basemap
						</h3>
					</div>
					<button
						type="button"
						className="btn btn-circle btn-ghost btn-sm"
						onClick={onClose}
					>
						<X className="h-4 w-4" />
					</button>
				</div>

				<div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain py-4 sm:py-5">
					<div className="border-base-300 bg-base-100 rounded-lg border p-3 sm:p-4">
						<p className="mb-2 text-sm font-semibold">Basemap</p>
						<div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap">
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
				</div>

				<div className="border-base-200 flex justify-end border-t pt-3 sm:pt-4">
					<button
						type="button"
						className="btn btn-primary w-full sm:w-auto"
						onClick={onClose}
					>
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

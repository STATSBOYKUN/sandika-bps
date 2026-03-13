"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
	Focus,
	Layers,
	RefreshCw,
	Search,
	SlidersHorizontal,
} from "lucide-react";
import type { FeatureCollection, Geometry } from "geojson";
import type { StyleSpecification } from "maplibre-gl";

import DataIndustriDetailModal from "@/components/data-industri/DataIndustriDetailModal";
import PageState from "@/components/layout/PageState";
import { type IndustryRow } from "@/components/data-industri/types";
import MapFilterModal from "@/components/peta-industri/MapFilterModal";
import MapLayerModal from "@/components/peta-industri/MapLayerModal";
import PetaIndustriMapCanvas from "@/components/peta-industri/PetaIndustriMapCanvas";
import {
	buildLargeIndustryPayload,
	rowsToPointGeoJson,
} from "@/components/peta-industri/map-data";
import type {
	BasemapOption,
	LayerVisibility,
	MapFilters,
	WilayahMode,
} from "@/components/peta-industri/types";
import karanganyarDesa from "@/constant/geojson/karanganyar_desa.json";
import karanganyarKecamatan from "@/constant/geojson/karanganyar_kecamatan.json";

const STATUS_OPTIONS: IndustryRow["status"][] = [
	"Aktif",
	"Verifikasi",
	"Draft",
];

const DEFAULT_FILTERS: MapFilters = {
	search: "",
	statuses: [...STATUS_OPTIONS],
	kecamatan: "Semua",
	desa: "Semua",
};

const DEFAULT_LAYERS: LayerVisibility = {
	boundaryFill: true,
	boundaryLine: true,
	boundaryHover: true,
	clusters: true,
	clusterCount: true,
	points: true,
};

const KECAMATAN_GEOJSON = karanganyarKecamatan as FeatureCollection<Geometry>;
const DESA_GEOJSON = karanganyarDesa as FeatureCollection<Geometry>;

const OSM_STYLE: StyleSpecification = {
	version: 8,
	sources: {
		osm: {
			type: "raster",
			tiles: [
				"https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
				"https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
				"https://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
			],
			tileSize: 256,
			attribution: "&copy; OpenStreetMap contributors",
		},
	},
	layers: [{ id: "osm", type: "raster", source: "osm" }],
};

const MAP_STYLES: Record<BasemapOption, string | StyleSpecification> = {
	osm: OSM_STYLE,
	light: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
	dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
};

const BOUNDARY_GRADIENT_COLORS = [
	"#99f6e4",
	"#5eead4",
	"#2dd4bf",
	"#14b8a6",
	"#0f766e",
] as const;

const normalizeBoundaryName = (value: string) =>
	value.toLocaleLowerCase("id-ID").replace(/\s+/g, " ").trim();

export default function PetaIndustriMap() {
	const [rows, setRows] = useState<IndustryRow[]>([]);
	const [loading, setLoading] = useState(true);
	const [hasError, setHasError] = useState(false);
	const [wilayahMode, setWilayahMode] = useState<WilayahMode>("kecamatan");
	const [filters, setFilters] = useState<MapFilters>(DEFAULT_FILTERS);
	const [tempFilters, setTempFilters] = useState<MapFilters>(DEFAULT_FILTERS);
	const [basemap, setBasemap] = useState<BasemapOption>("osm");
	const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
	const [isLayerModalOpen, setIsLayerModalOpen] = useState(false);
	const [hoveredBoundaryName, setHoveredBoundaryName] = useState<
		string | null
	>(null);
	const [selectedRow, setSelectedRow] = useState<IndustryRow | null>(null);
	const [focusToken, setFocusToken] = useState(0);
	const [isInfoHintExpanded, setIsInfoHintExpanded] = useState(true);

	const loadRows = useCallback(async () => {
		setLoading(true);
		setHasError(false);
		try {
			const payload = await buildLargeIndustryPayload();
			setRows(payload);
		} catch {
			setHasError(true);
			setRows([]);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		void loadRows();
	}, [loadRows]);

	useEffect(() => {
		const timer = window.setTimeout(() => {
			setIsInfoHintExpanded(false);
		}, 10000);

		return () => {
			window.clearTimeout(timer);
		};
	}, []);

	const mapRows = useMemo(
		() => rows.filter((row) => row.platform === "Google Maps"),
		[rows],
	);

	const kecamatanOptions = useMemo(() => {
		const values = new Set(mapRows.map((row) => row.kecamatanNama));
		return [
			"Semua",
			...Array.from(values).sort((a, b) => a.localeCompare(b, "id-ID")),
		];
	}, [mapRows]);

	const layers: LayerVisibility = DEFAULT_LAYERS;

	const tempDesaOptions = useMemo(() => {
		const filteredByKec =
			tempFilters.kecamatan === "Semua"
				? mapRows
				: mapRows.filter(
						(row) => row.kecamatanNama === tempFilters.kecamatan,
					);
		const values = new Set(filteredByKec.map((row) => row.desaNama));
		return [
			"Semua",
			...Array.from(values).sort((a, b) => a.localeCompare(b, "id-ID")),
		];
	}, [mapRows, tempFilters.kecamatan]);

	const filteredRows = useMemo(() => {
		const q = filters.search.trim().toLowerCase();
		return mapRows.filter((row) => {
			if (!filters.statuses.includes(row.status)) return false;
			if (
				filters.kecamatan !== "Semua" &&
				row.kecamatanNama !== filters.kecamatan
			)
				return false;
			if (filters.desa !== "Semua" && row.desaNama !== filters.desa)
				return false;
			if (!q) return true;
			return [
				row.id,
				row.namaUsaha,
				row.kecamatanNama,
				row.desaNama,
				row.platform,
			]
				.join(" ")
				.toLowerCase()
				.includes(q);
		});
	}, [filters, mapRows]);

	const rowById = useMemo(() => {
		const map = new Map<string, IndustryRow>();
		for (const row of filteredRows) map.set(row.id, row);
		return map;
	}, [filteredRows]);

	const pointGeoJson = useMemo(
		() => rowsToPointGeoJson(filteredRows),
		[filteredRows],
	);

	const activeBoundary =
		wilayahMode === "desa" ? DESA_GEOJSON : KECAMATAN_GEOJSON;

	const boundaryNameEntries = useMemo(() => {
		return activeBoundary.features
			.map((feature) => {
				const properties =
					typeof feature.properties === "object" && feature.properties
						? (feature.properties as Record<string, unknown>)
						: {};
				const rawName =
					wilayahMode === "desa"
						? properties.kel_desa
						: properties.kecamatan;
				if (typeof rawName !== "string") return null;
				const normalized = normalizeBoundaryName(rawName);
				if (!normalized) return null;
				return { normalized, label: rawName };
			})
			.filter((entry): entry is { normalized: string; label: string } =>
				Boolean(entry),
			);
	}, [activeBoundary, wilayahMode]);

	const boundaryPointCountByName = useMemo(() => {
		const counts = new Map<string, number>();
		for (const { normalized } of boundaryNameEntries) {
			if (!counts.has(normalized)) counts.set(normalized, 0);
		}

		for (const row of filteredRows) {
			const sourceName =
				wilayahMode === "desa" ? row.desaNama : row.kecamatanNama;
			const normalized = normalizeBoundaryName(sourceName);
			if (!counts.has(normalized)) continue;
			counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
		}

		return counts;
	}, [boundaryNameEntries, filteredRows, wilayahMode]);

	const boundaryColorScale = useMemo(() => {
		const values = Array.from(boundaryPointCountByName.values());
		const min = values.length > 0 ? Math.min(...values) : 0;
		const max = values.length > 0 ? Math.max(...values) : 0;
		const span = max - min;

		const getColorIndex = (count: number) => {
			if (span <= 0) return 0;
			const ratio = (count - min) / span;
			return Math.min(
				BOUNDARY_GRADIENT_COLORS.length - 1,
				Math.floor(ratio * BOUNDARY_GRADIENT_COLORS.length),
			);
		};

		if (span <= 0) {
			return {
				min,
				max,
				getColorIndex,
				ranges: [
					{
						index: 0,
						color: BOUNDARY_GRADIENT_COLORS[0],
						label: `${min.toLocaleString("id-ID")}`,
					},
				],
			};
		}

		const interval = span / BOUNDARY_GRADIENT_COLORS.length;
		const ranges = BOUNDARY_GRADIENT_COLORS.map((color, index) => {
			const start = min + interval * index;
			const end =
				index === BOUNDARY_GRADIENT_COLORS.length - 1
					? max
					: min + interval * (index + 1);

			const labelMin =
				index === 0 ? Math.round(start) : Math.floor(start) + 1;
			let labelMax =
				index === BOUNDARY_GRADIENT_COLORS.length - 1
					? Math.round(end)
					: Math.floor(end);

			if (labelMax < labelMin) labelMax = labelMin;

			return {
				index,
				color,
				label: `${labelMin.toLocaleString("id-ID")} - ${labelMax.toLocaleString("id-ID")}`,
			};
		});

		return {
			min,
			max,
			getColorIndex,
			ranges,
		};
	}, [boundaryPointCountByName]);

	const boundaryDataWithCounts = useMemo<FeatureCollection<Geometry>>(() => {
		return {
			...activeBoundary,
			features: activeBoundary.features.map((feature) => {
				const properties =
					typeof feature.properties === "object" && feature.properties
						? (feature.properties as Record<string, unknown>)
						: {};
				const rawName =
					wilayahMode === "desa"
						? properties.kel_desa
						: properties.kecamatan;
				const normalized =
					typeof rawName === "string"
						? normalizeBoundaryName(rawName)
						: "";
				const pointCount =
					boundaryPointCountByName.get(normalized) ?? 0;
				const colorIndex = boundaryColorScale.getColorIndex(pointCount);

				return {
					...feature,
					properties: {
						...properties,
						point_count: pointCount,
						color_index: colorIndex,
					},
				};
			}),
		};
	}, [
		activeBoundary,
		boundaryColorScale,
		boundaryPointCountByName,
		wilayahMode,
	]);

	return (
		<section className="border-base-300 bg-base-200/50 space-y-4 rounded-xl border p-3 sm:p-4 md:p-5">
			<div className="space-y-3">
				<div className="border-base-300 bg-base-100 rounded-xl border p-3 md:p-4">
					<div className="text-base-content/60 mb-2 text-xs font-semibold tracking-wide uppercase">
						Kontrol Peta
					</div>
					<div className="flex flex-wrap items-center justify-between gap-2">
						<div className="join rounded-full">
							<button
								type="button"
								className={`join-item btn btn-sm ${wilayahMode === "kecamatan" ? "btn-primary" : "btn-outline"}`}
								onClick={() => setWilayahMode("kecamatan")}
							>
								Kecamatan
							</button>
							<button
								type="button"
								className={`join-item btn btn-sm ${wilayahMode === "desa" ? "btn-primary" : "btn-outline"}`}
								onClick={() => setWilayahMode("desa")}
							>
								Desa
							</button>
						</div>

						<div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
							<button
								type="button"
								className="btn btn-sm btn-outline w-full gap-2 sm:w-auto"
								onClick={() => {
									setTempFilters({ ...filters });
									setIsFilterModalOpen(true);
								}}
							>
								<SlidersHorizontal className="h-4 w-4" />
								Filter
							</button>
							<button
								type="button"
								className="btn btn-sm btn-outline w-full gap-2 sm:w-auto"
								onClick={() => setIsLayerModalOpen(true)}
							>
								<Layers className="h-4 w-4" />
								Layers
							</button>
							<button
								type="button"
								className="btn btn-sm btn-primary w-full gap-2 sm:w-auto"
								onClick={() =>
									setFocusToken((prev) => prev + 1)
								}
							>
								<Focus className="h-4 w-4" />
								Fokus Titik Awal
							</button>
						</div>
					</div>
				</div>

				<div className="border-base-300 bg-base-100 rounded-xl border p-3 md:p-4">
					<div className="text-base-content/60 mb-2 text-xs font-semibold tracking-wide uppercase">
						Informasi Filter
					</div>
					<div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto] md:items-center">
						<div className="flex flex-wrap items-center gap-2 text-xs">
							<span className="badge badge-outline">
								Titik:{" "}
								{filteredRows.length.toLocaleString("id-ID")}
							</span>
							<span className="badge badge-primary">
								Mode:{" "}
								{wilayahMode === "desa" ? "Desa" : "Kecamatan"}
							</span>
							<span className="badge badge-accent">
								Status: {filters.statuses.length}
							</span>
							<span className="badge badge-outline">
								Kecamatan: {filters.kecamatan}
							</span>
							<span className="badge badge-outline">
								Desa: {filters.desa}
							</span>
						</div>

						<label className="input input-bordered input-sm bg-base-100 flex w-full items-center gap-2 md:min-w-72">
							<Search className="h-4 w-4 opacity-60" />
							<input
								value={filters.search}
								onChange={(event) =>
									setFilters((prev) => ({
										...prev,
										search: event.target.value,
									}))
								}
								placeholder="Cari id / nama / wilayah"
							/>
						</label>
					</div>
				</div>
			</div>

			<div className="border-base-300 bg-base-100 relative h-[56dvh] min-h-[340px] overflow-hidden rounded-xl border sm:h-[60dvh] md:h-[600px]">
				{loading ? (
					<div className="h-full p-3 sm:p-4">
						<div className="border-base-300 bg-base-100 h-full space-y-3 rounded-xl border p-3">
							<div className="grid grid-cols-2 gap-2 md:grid-cols-4">
								{Array.from({ length: 6 }).map((_, index) => (
									<div
										key={`map-loading-badge-${index}`}
										className="skeleton h-6 w-full"
									/>
								))}
							</div>
							<div className="skeleton h-[calc(100%-3rem)] min-h-[280px] w-full rounded-lg" />
						</div>
					</div>
				) : hasError ? (
					<PageState
						variant="error"
						title="Peta belum bisa ditampilkan"
						description="Terjadi kendala saat memuat data spasial."
						className="grid h-full place-content-center border-0 bg-transparent shadow-none"
						action={
							<button
								type="button"
								className="btn btn-primary btn-sm gap-2"
								onClick={() => void loadRows()}
							>
								<RefreshCw className="h-4 w-4" />
								Coba Lagi
							</button>
						}
					/>
				) : filteredRows.length === 0 ? (
					<PageState
						variant="empty"
						title="Tidak ada titik pada filter ini"
						description="Peta disembunyikan karena tidak ada data yang cocok."
						className="grid h-full place-content-center border-0 bg-transparent shadow-none"
						action={
							<button
								type="button"
								className="btn btn-primary btn-sm"
								onClick={() => {
									setFilters(DEFAULT_FILTERS);
									setTempFilters(DEFAULT_FILTERS);
								}}
							>
								Reset Filter
							</button>
						}
					/>
				) : (
					<>
						<PetaIndustriMapCanvas
							boundaryMode={wilayahMode}
							boundaryData={boundaryDataWithCounts}
							boundaryFillColors={[...BOUNDARY_GRADIENT_COLORS]}
							pointsData={pointGeoJson}
							layers={layers}
							selectedPoint={selectedRow}
							focusToken={focusToken}
							mapStyle={MAP_STYLES[basemap]}
							rowById={rowById}
							onHoverBoundaryName={setHoveredBoundaryName}
							onSelectPoint={setSelectedRow}
						/>

						<div className="border-base-300 bg-base-100/90 absolute top-2 left-2 z-10 max-w-[calc(100%-1rem)] rounded-lg border px-2.5 py-2 text-[11px] sm:top-3 sm:left-3 sm:px-3 sm:text-xs">
							{hoveredBoundaryName
								? `Wilayah ${wilayahMode === "desa" ? "Desa " : "Kecamatan "}: ${hoveredBoundaryName}`
								: `Arahkan kursor ke ${wilayahMode === "desa" ? "Desa " : "Kecamatan "}`}
						</div>
					</>
				)}
			</div>

			<div className="group">
				<div
					tabIndex={0}
					role="button"
					aria-label="Informasi rentang warna peta"
					onMouseEnter={() => setIsInfoHintExpanded(true)}
					onMouseLeave={() => setIsInfoHintExpanded(false)}
					onFocus={() => setIsInfoHintExpanded(true)}
					onBlur={() => setIsInfoHintExpanded(false)}
					className={`border-info/30 text-base-content/80 focus-visible:ring-info/40 focus-visible:ring-offset-base-100 flex h-10 items-center gap-2 overflow-hidden rounded-lg border px-2.5 transition-all duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 ${
						isInfoHintExpanded
							? "bg-info/20 w-full"
							: "bg-info/10 hover:bg-info/20 h-10 w-10 gap-1.5 px-2 group-focus-within:w-full hover:w-full"
					}`}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						className="-ml-0.5 h-5 w-5 shrink-0 stroke-current opacity-95"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="2"
							d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						></path>
					</svg>

					<div
						className={`min-w-0 text-[13px] font-medium transition-all duration-300 ease-out ${
							isInfoHintExpanded
								? "max-w-[72rem] opacity-100"
								: "max-w-0 opacity-0 group-focus-within:max-w-[72rem] group-focus-within:opacity-100 group-hover:max-w-[72rem] group-hover:opacity-100"
						}`}
					>
						<div className="flex flex-nowrap items-center gap-1.5 overflow-x-auto">
							{boundaryColorScale.ranges.map((range) => (
								<div
									key={`range-${range.index}`}
									className="flex shrink-0 items-center gap-2 whitespace-nowrap"
								>
									<span
										className="h-3.5 w-3.5 shrink-0 rounded-sm border border-black/10"
										style={{
											backgroundColor: range.color,
										}}
									/>
									<span>{range.label}</span>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>

			<MapFilterModal
				isOpen={isFilterModalOpen}
				wilayahMode={wilayahMode}
				filters={tempFilters}
				statusOptions={STATUS_OPTIONS}
				kecamatanOptions={kecamatanOptions}
				desaOptions={tempDesaOptions}
				totalShown={filteredRows.length}
				onChange={setTempFilters}
				onReset={() => setTempFilters(DEFAULT_FILTERS)}
				onClose={() => setIsFilterModalOpen(false)}
				onApply={() => {
					setFilters(tempFilters);
					setIsFilterModalOpen(false);
				}}
			/>

			<MapLayerModal
				isOpen={isLayerModalOpen}
				basemap={basemap}
				onChangeBasemap={setBasemap}
				onClose={() => setIsLayerModalOpen(false)}
			/>

			<DataIndustriDetailModal
				row={selectedRow}
				editable={false}
				onClose={() => setSelectedRow(null)}
			/>
		</section>
	);
}

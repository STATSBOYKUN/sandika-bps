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

    return (
        <section className="space-y-4 rounded-xl border border-base-300 bg-base-200/50 p-3 sm:p-4 md:p-5">
            <div className="space-y-3">
                <div className="rounded-xl border border-base-300 bg-base-100 p-3 md:p-4">
                    <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-base-content/60">
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
                                onClick={() => setFocusToken((prev) => prev + 1)}
                            >
                                <Focus className="h-4 w-4" />
                                Fokus Titik Awal
                            </button>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-base-300 bg-base-100 p-3 md:p-4">
                    <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-base-content/60">
                        Informasi Filter
                    </div>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto] md:items-center">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="badge badge-outline">
                                Titik: {filteredRows.length.toLocaleString("id-ID")}
                            </span>
                            <span className="badge badge-primary">
                                Mode: {wilayahMode === "desa" ? "Desa" : "Kecamatan"}
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

                        <label className="input input-bordered input-sm flex w-full items-center gap-2 bg-base-100 md:min-w-72">
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

            <div className="relative h-[56dvh] min-h-[340px] overflow-hidden rounded-xl border border-base-300 bg-base-100 sm:h-[60dvh] md:h-[600px]">
                {loading ? (
                    <div className="h-full p-3 sm:p-4">
                        <div className="h-full space-y-3 rounded-xl border border-base-300 bg-base-100 p-3">
                            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                                {Array.from({ length: 6 }).map((_, index) => (
                                    <div key={`map-loading-badge-${index}`} className="skeleton h-6 w-full" />
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
                            <button type="button" className="btn btn-primary btn-sm gap-2" onClick={() => void loadRows()}>
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
                            boundaryData={activeBoundary}
                            pointsData={pointGeoJson}
                            layers={layers}
                            selectedPoint={selectedRow}
                            focusToken={focusToken}
                            mapStyle={MAP_STYLES[basemap]}
                            rowById={rowById}
                            onHoverBoundaryName={setHoveredBoundaryName}
                            onSelectPoint={setSelectedRow}
                        />

                        <div className="absolute left-2 top-2 z-10 max-w-[calc(100%-1rem)] rounded-lg border border-base-300 bg-base-100/90 px-2.5 py-2 text-[11px] sm:left-3 sm:top-3 sm:px-3 sm:text-xs">
                            {hoveredBoundaryName
                                ? `Wilayah ${wilayahMode === "desa" ? "Desa " : "Kecamatan "}: ${hoveredBoundaryName}`
                                : `Arahkan kursor ke ${wilayahMode === "desa" ? "Desa " : "Kecamatan "}`}
                        </div>
                    </>
                )}
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

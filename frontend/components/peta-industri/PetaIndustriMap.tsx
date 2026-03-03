"use client";

import { useEffect, useMemo, useState } from "react";
import { Focus, Layers, LoaderCircle, SlidersHorizontal } from "lucide-react";
import type { FeatureCollection, Geometry } from "geojson";
import type { StyleSpecification } from "maplibre-gl";

import DataIndustriDetailModal from "@/components/data-industri/DataIndustriDetailModal";
import {
  PLATFORM_FILTER_OPTIONS,
  type IndustryRow,
} from "@/components/data-industri/types";
import MapFilterModal from "@/components/peta-industri/MapFilterModal";
import MapLayerModal from "@/components/peta-industri/MapLayerModal";
import PetaIndustriMapCanvas from "@/components/peta-industri/PetaIndustriMapCanvas";
import { buildLargeIndustryPayload, rowsToPointGeoJson } from "@/components/peta-industri/map-data";
import type {
  BasemapOption,
  LayerVisibility,
  MapFilters,
  WilayahMode,
} from "@/components/peta-industri/types";
import karanganyarDesa from "@/constant/geojson/karanganyar_desa.json";
import karanganyarKecamatan from "@/constant/geojson/karanganyar_kecamatan.json";

const STATUS_OPTIONS: IndustryRow["status"][] = ["Aktif", "Verifikasi", "Draft"];

const DEFAULT_FILTERS: MapFilters = {
  search: "",
  platforms: [...PLATFORM_FILTER_OPTIONS],
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
  const [wilayahMode, setWilayahMode] = useState<WilayahMode>("kecamatan");
  const [filters, setFilters] = useState<MapFilters>(DEFAULT_FILTERS);
  const [tempFilters, setTempFilters] = useState<MapFilters>(DEFAULT_FILTERS);
  const [basemap, setBasemap] = useState<BasemapOption>("osm");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isLayerModalOpen, setIsLayerModalOpen] = useState(false);
  const [hoveredBoundaryName, setHoveredBoundaryName] = useState<string | null>(null);
  const [selectedRow, setSelectedRow] = useState<IndustryRow | null>(null);
  const [focusToken, setFocusToken] = useState(0);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      const payload = await buildLargeIndustryPayload(25_000);
      if (!active) return;
      setRows(payload);
      setLoading(false);
    };
    void load();
    return () => {
      active = false;
    };
  }, []);

  const kecamatanOptions = useMemo(() => {
    const values = new Set(rows.map((row) => row.kecamatanNama));
    return ["Semua", ...Array.from(values).sort((a, b) => a.localeCompare(b, "id-ID"))];
  }, [rows]);

  const layers: LayerVisibility = DEFAULT_LAYERS;

  const tempDesaOptions = useMemo(() => {
    const filteredByKec =
      tempFilters.kecamatan === "Semua"
        ? rows
        : rows.filter((row) => row.kecamatanNama === tempFilters.kecamatan);
    const values = new Set(filteredByKec.map((row) => row.desaNama));
    return ["Semua", ...Array.from(values).sort((a, b) => a.localeCompare(b, "id-ID"))];
  }, [rows, tempFilters.kecamatan]);

  const filteredRows = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return rows.filter((row) => {
      if (!filters.platforms.includes(row.platform)) return false;
      if (!filters.statuses.includes(row.status)) return false;
      if (filters.kecamatan !== "Semua" && row.kecamatanNama !== filters.kecamatan) return false;
      if (filters.desa !== "Semua" && row.desaNama !== filters.desa) return false;
      if (!q) return true;
      return [row.id, row.namaUsaha, row.kecamatanNama, row.desaNama, row.platform]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [filters, rows]);

  const rowById = useMemo(() => {
    const map = new Map<string, IndustryRow>();
    for (const row of filteredRows) map.set(row.id, row);
    return map;
  }, [filteredRows]);

  const pointGeoJson = useMemo(() => rowsToPointGeoJson(filteredRows), [filteredRows]);

  const activeBoundary = wilayahMode === "desa" ? DESA_GEOJSON : KECAMATAN_GEOJSON;

  return (
    <section className="space-y-4 rounded-xl border border-base-300 bg-base-200/50 p-4 md:p-5">
      <div className="rounded-xl border border-base-300 bg-base-100 p-3 md:p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className={`btn btn-sm ${wilayahMode === "kecamatan" ? "btn-primary" : "btn-outline"}`}
              onClick={() => setWilayahMode("kecamatan")}
            >
              Kecamatan
            </button>
            <button
              type="button"
              className={`btn btn-sm ${wilayahMode === "desa" ? "btn-primary" : "btn-outline"}`}
              onClick={() => setWilayahMode("desa")}
            >
              Desa
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="badge badge-outline">Titik: {filteredRows.length.toLocaleString("id-ID")}</span>
            <button
              type="button"
              className="btn btn-sm btn-outline gap-2"
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
              className="btn btn-sm btn-outline gap-2"
              onClick={() => setIsLayerModalOpen(true)}
            >
              <Layers className="h-4 w-4" />
              Layers
            </button>
            <button type="button" className="btn btn-sm btn-primary gap-2" onClick={() => setFocusToken((prev) => prev + 1)}>
              <Focus className="h-4 w-4" />
              Fokus Titik Awal
            </button>
          </div>
        </div>
      </div>

      <div className="relative h-[600px] overflow-hidden rounded-xl border border-base-300 bg-base-100">
        {loading ? (
          <div className="absolute inset-0 z-20 flex items-center justify-center gap-3 bg-base-100/90">
            <LoaderCircle className="h-5 w-5 animate-spin text-primary" />
            <p className="text-sm text-base-content/70">Memuat payload spasial industri skala besar...</p>
          </div>
        ) : null}

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

        <div className="absolute bottom-3 left-3 z-10 rounded-lg border border-base-300 bg-base-100/90 px-3 py-2 text-xs">
          {hoveredBoundaryName
            ? `Hover ${wilayahMode === "desa" ? "desa" : "kecamatan"}: ${hoveredBoundaryName}`
            : `Arahkan kursor ke ${wilayahMode === "desa" ? "desa" : "kecamatan"}`}
        </div>
      </div>

      <MapFilterModal
        isOpen={isFilterModalOpen}
        wilayahMode={wilayahMode}
        filters={tempFilters}
        platformOptions={PLATFORM_FILTER_OPTIONS}
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
        onResetView={() => setFocusToken((prev) => prev + 1)}
        onClose={() => setIsLayerModalOpen(false)}
      />

      <DataIndustriDetailModal row={selectedRow} onClose={() => setSelectedRow(null)} />
    </section>
  );
}

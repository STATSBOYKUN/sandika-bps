import { useEffect, useMemo, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import maplibregl, { type GeoJSONSource, type StyleSpecification } from "maplibre-gl";
import Map, {
  FullscreenControl,
  Layer,
  Marker,
  NavigationControl,
  ScaleControl,
  Source,
  type LayerProps,
  type MapLayerMouseEvent,
  type MapMouseEvent,
  type MapRef,
} from "react-map-gl/maplibre";

import type { GoogleMapsIndustryRow, IndustryRow } from "@/components/data-industri/types";
import type {
  BoundaryGeoJson,
  IndustryPointGeoJson,
  LayerVisibility,
  WilayahMode,
} from "@/components/peta-industri/types";

const INITIAL_VIEW = {
  latitude: -7.62,
  longitude: 110.98,
  zoom: 10,
  bearing: 0,
  pitch: 0,
};

interface PetaIndustriMapCanvasProps {
  boundaryMode: WilayahMode;
  boundaryData: BoundaryGeoJson;
  pointsData: IndustryPointGeoJson;
  layers: LayerVisibility;
  selectedPoint: IndustryRow | null;
  focusToken: number;
  mapStyle: string | StyleSpecification;
  rowById: Map<string, IndustryRow>;
  onHoverBoundaryName: (name: string | null) => void;
  onSelectPoint: (row: IndustryRow | null) => void;
}

export default function PetaIndustriMapCanvas({
  boundaryMode,
  boundaryData,
  pointsData,
  layers,
  selectedPoint,
  focusToken,
  mapStyle,
  rowById,
  onHoverBoundaryName,
  onSelectPoint,
}: PetaIndustriMapCanvasProps) {
  const mapRef = useRef<MapRef | null>(null);
  const [hoveredFeatureId, setHoveredFeatureId] = useState<string | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.getMap().jumpTo(INITIAL_VIEW);
  }, [focusToken]);

  const boundaryFillLayer: LayerProps = {
    id: "boundary-fill",
    type: "fill",
    paint: {
      "fill-color": boundaryMode === "desa" ? "#0284c7" : "#16a34a",
      "fill-opacity": 0.14,
    },
  };

  const boundaryLineLayer: LayerProps = {
    id: "boundary-line",
    type: "line",
    paint: {
      "line-color": boundaryMode === "desa" ? "#075985" : "#14532d",
      "line-width": 1.1,
      "line-opacity": 0.85,
    },
  };

  const boundaryHoverLayer: LayerProps = {
    id: "boundary-hover",
    type: "line",
    paint: {
      "line-color": "#f59e0b",
      "line-width": 2.7,
      "line-opacity": 0.95,
    },
    filter: hoveredFeatureId
      ? ["==", ["to-string", ["get", "fid"]], hoveredFeatureId]
      : ["==", ["to-string", ["get", "fid"]], ""],
  };

  const clusterLayer: LayerProps = {
    id: "industry-clusters",
    type: "circle",
    filter: ["has", "point_count"],
    paint: {
      "circle-color": ["step", ["get", "point_count"], "#2563eb", 30, "#f59e0b", 100, "#dc2626"],
      "circle-radius": ["step", ["get", "point_count"], 15, 30, 20, 100, 25],
      "circle-stroke-color": "#ffffff",
      "circle-stroke-width": 1.4,
    },
  };

  const clusterCountLayer: LayerProps = {
    id: "industry-cluster-count",
    type: "symbol",
    filter: ["has", "point_count"],
    layout: {
      "text-field": ["get", "point_count_abbreviated"],
      "text-size": 12,
      "text-font": ["Open Sans Bold"],
    },
    paint: {
      "text-color": "#ffffff",
    },
  };

  const unclusteredLayer: LayerProps = {
    id: "industry-unclustered",
    type: "circle",
    filter: ["!", ["has", "point_count"]],
    paint: {
      "circle-color": "#1d4ed8",
      "circle-radius": ["interpolate", ["linear"], ["zoom"], 7, 4, 10, 5.5, 13, 7, 16, 8.5],
      "circle-stroke-color": "#ffffff",
      "circle-stroke-width": 1.5,
    },
  };

  const selectedMapsPoint = useMemo<GoogleMapsIndustryRow | null>(() => {
    if (!selectedPoint || selectedPoint.platform !== "Google Maps") return null;
    return selectedPoint as GoogleMapsIndustryRow;
  }, [selectedPoint]);

  const onHover = (event: MapLayerMouseEvent) => {
    const feature = event.features?.[0];
    const fid = feature?.properties?.fid;

    if (fid !== undefined && fid !== null) {
      setHoveredFeatureId(String(fid));
      const boundaryName = boundaryMode === "desa" ? feature?.properties?.kel_desa : feature?.properties?.kecamatan;
      onHoverBoundaryName(typeof boundaryName === "string" ? boundaryName : null);
      return;
    }

    setHoveredFeatureId(null);
    onHoverBoundaryName(null);
  };

  const onMapClick = (event: MapMouseEvent) => {
    const feature = event.features?.[0];
    if (!feature) return;

    if (feature.layer.id === "industry-clusters") {
      const clusterId = feature.properties?.cluster_id;
      if (clusterId === undefined || clusterId === null || !mapRef.current) return;

      const map = mapRef.current.getMap();
      const source = map.getSource("industry-points") as GeoJSONSource | undefined;
      void source
        ?.getClusterExpansionZoom(Number(clusterId))
        .then((zoom) => {
          const coords = feature.geometry.type === "Point" ? feature.geometry.coordinates : null;
          if (!coords) return;
          map.easeTo({ center: [coords[0], coords[1]], zoom, duration: 700 });
        })
        .catch(() => undefined);
      return;
    }

    if (feature.layer.id === "industry-unclustered") {
      const id = feature.properties?.id;
      if (typeof id !== "string") return;
      onSelectPoint(rowById.get(id) ?? null);
    }
  };

  return (
    <Map
      ref={mapRef}
      mapLib={maplibregl}
      initialViewState={INITIAL_VIEW}
      mapStyle={mapStyle}
      interactiveLayerIds={[
        "boundary-fill",
        "boundary-line",
        "industry-clusters",
        "industry-unclustered",
      ]}
      onMouseMove={onHover}
      onMouseLeave={() => {
        setHoveredFeatureId(null);
        onHoverBoundaryName(null);
      }}
      onClick={onMapClick}
      cursor={hoveredFeatureId ? "pointer" : "grab"}
    >
      <Source id="boundary-source" type="geojson" data={boundaryData}>
        {layers.boundaryFill ? <Layer {...boundaryFillLayer} /> : null}
        {layers.boundaryLine ? <Layer {...boundaryLineLayer} /> : null}
        {layers.boundaryHover ? <Layer {...boundaryHoverLayer} /> : null}
      </Source>

      <Source
        id="industry-points"
        type="geojson"
        data={pointsData}
        cluster={true}
        clusterMaxZoom={13}
        clusterRadius={55}
      >
        {layers.clusters ? <Layer {...clusterLayer} /> : null}
        {layers.clusterCount ? <Layer {...clusterCountLayer} /> : null}
        {layers.points ? <Layer {...unclusteredLayer} /> : null}
      </Source>

      {selectedMapsPoint ? (
        <Marker
          longitude={selectedMapsPoint.metadata.longitude}
          latitude={selectedMapsPoint.metadata.latitude}
          anchor="bottom"
        >
          <div className="tooltip tooltip-top" data-tip="Lokasi terpilih">
            <MapPin className="h-8 w-8 text-error drop-shadow-md" />
          </div>
        </Marker>
      ) : null}

      <NavigationControl position="top-right" showCompass={true} />
      <ScaleControl position="bottom-right" />
      <FullscreenControl position="top-right" />
    </Map>
  );
}

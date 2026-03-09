import type { FeatureCollection, Geometry, Point } from "geojson";

import type { IndustryRow } from "@/components/data-industri/types";

export type WilayahMode = "kecamatan" | "desa";

export type LayerVisibility = {
	boundaryFill: boolean;
	boundaryLine: boolean;
	boundaryHover: boolean;
	clusters: boolean;
	clusterCount: boolean;
	points: boolean;
};

export type BasemapOption = "osm" | "light" | "dark";

export type MapFilters = {
	search: string;
	statuses: IndustryRow["status"][];
	kecamatan: string;
	desa: string;
};

export type BoundaryGeoJson = FeatureCollection<Geometry>;

export type IndustryPointFeature = {
	type: "Feature";
	geometry: Point;
	properties: {
		id: string;
		namaUsaha: string;
		platform: IndustryRow["platform"];
		status: IndustryRow["status"];
	};
};

export type IndustryPointGeoJson = FeatureCollection<
	Point,
	IndustryPointFeature["properties"]
>;

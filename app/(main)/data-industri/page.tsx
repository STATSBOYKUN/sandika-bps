"use client";

import {
	useCallback,
	useDeferredValue,
	useEffect,
	useMemo,
	useState,
} from "react";
import { MapPin, Music2, PlayCircle, RefreshCw } from "lucide-react";
import {
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type PaginationState,
	type SortingState,
	useReactTable,
} from "@tanstack/react-table";

import DataIndustriFilterModal from "@/components/data-industri/DataIndustriFilterModal";
import DataIndustriDetailModal from "@/components/data-industri/DataIndustriDetailModal";
import DataIndustriTable from "@/components/data-industri/DataIndustriTable";
import DataIndustriToolbar from "@/components/data-industri/DataIndustriToolbar";
import {
	DATA_INDUSTRI_TABS,
	getTabConfigByKey,
	type DataIndustriTabKey,
} from "@/components/data-industri/table-metadata";
import {
	getKaranganyarCoverageLabel,
	KBLI_OPTIONS,
	type KaranganyarCoverageFilter,
	type IndustryRow,
} from "@/components/data-industri/types";
import PageHeader from "@/components/layout/PageHeader";
import PageShell from "@/components/layout/PageShell";
import PageState from "@/components/layout/PageState";

const ALL_KECAMATAN = "Semua";
const ALL_DESA = "Semua";

function sortUnique(values: Array<string | undefined>) {
	return Array.from(
		new Set(
			values.filter(
				(value): value is string =>
					typeof value === "string" && value.trim().length > 0,
			),
		),
	).sort((a, b) => a.localeCompare(b, "id-ID"));
}

function buildDesaOptions(rows: IndustryRow[], kecamatan: string) {
	const scopedRows =
		kecamatan === ALL_KECAMATAN
			? rows
			: rows.filter((row) => row.kecamatanNama === kecamatan);

	return [ALL_DESA, ...sortUnique(scopedRows.map((row) => row.desaNama))];
}

function tabActiveTone(tabKey: DataIndustriTabKey) {
	if (tabKey === "google-maps") return "text-success border-success";
	if (tabKey === "youtube") return "text-error border-error";
	return "text-info border-info";
}

function tabIcon(tabKey: DataIndustriTabKey) {
	if (tabKey === "google-maps") return <MapPin className="h-4 w-4" />;
	if (tabKey === "youtube") return <PlayCircle className="h-4 w-4" />;
	return <Music2 className="h-4 w-4" />;
}

export default function DataIndustriPage() {
	const [activeTab, setActiveTab] =
		useState<DataIndustriTabKey>("google-maps");
	const [sorting, setSorting] = useState<SortingState>([]);
	const [searchInput, setSearchInput] = useState("");
	const deferredSearch = useDeferredValue(searchInput);
	const [globalFilter, setGlobalFilter] = useState("");
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 100,
	});

	const [selectedKbli, setSelectedKbli] = useState<string[]>([
		...KBLI_OPTIONS,
	]);
	const [tempKbli, setTempKbli] = useState<string[]>([...KBLI_OPTIONS]);
	const [selectedKecamatan, setSelectedKecamatan] =
		useState<string>(ALL_KECAMATAN);
	const [selectedDesa, setSelectedDesa] = useState<string>(ALL_DESA);
	const [selectedCoverage, setSelectedCoverage] =
		useState<KaranganyarCoverageFilter>("inside");
	const [tempKecamatan, setTempKecamatan] = useState<string>(ALL_KECAMATAN);
	const [tempDesa, setTempDesa] = useState<string>(ALL_DESA);
	const [tempCoverage, setTempCoverage] =
		useState<KaranganyarCoverageFilter>("inside");
	const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
	const [previewRow, setPreviewRow] = useState<IndustryRow | null>(null);

	const [rowsState, setRowsState] = useState<IndustryRow[]>([]);
	const [isLoadingRows, setIsLoadingRows] = useState(true);
	const [hasRowsError, setHasRowsError] = useState(false);
	const activeTabConfig = useMemo(
		() => getTabConfigByKey(activeTab),
		[activeTab],
	);
	const isGoogleMapsTab = activeTabConfig.platform === "Google Maps";
	const platformRows = useMemo(() => {
		return rowsState.filter((row) => {
			const matchesPlatform = row.platform === activeTabConfig.platform;
			return matchesPlatform;
		});
	}, [rowsState, activeTabConfig]);
	const coverageFilteredRows = useMemo(() => {
		return platformRows.filter((row) => {
			if (selectedCoverage === "inside") return row.isInsideKaranganyar;
			if (selectedCoverage === "outside") return !row.isInsideKaranganyar;
			return true;
		});
	}, [platformRows, selectedCoverage]);

	const kecamatanOptions = useMemo(
		() =>
			isGoogleMapsTab
				? [
						ALL_KECAMATAN,
						...sortUnique(
							coverageFilteredRows.map(
								(row) => row.kecamatanNama,
							),
						),
					]
				: [ALL_KECAMATAN],
		[coverageFilteredRows, isGoogleMapsTab],
	);
	const desaOptions = useMemo(
		() =>
			isGoogleMapsTab
				? buildDesaOptions(coverageFilteredRows, selectedKecamatan)
				: [ALL_DESA],
		[coverageFilteredRows, isGoogleMapsTab, selectedKecamatan],
	);
	const tempDesaOptions = useMemo(
		() =>
			isGoogleMapsTab
				? buildDesaOptions(coverageFilteredRows, tempKecamatan)
				: [ALL_DESA],
		[coverageFilteredRows, isGoogleMapsTab, tempKecamatan],
	);

	const data = useMemo(() => {
		if (!isGoogleMapsTab) return coverageFilteredRows;

		return coverageFilteredRows.filter((row) => {
			const matchesKecamatan =
				selectedKecamatan === ALL_KECAMATAN ||
				row.kecamatanNama === selectedKecamatan;
			const matchesDesa =
				selectedDesa === ALL_DESA || row.desaNama === selectedDesa;
			return matchesKecamatan && matchesDesa;
		});
	}, [
		coverageFilteredRows,
		isGoogleMapsTab,
		selectedDesa,
		selectedKecamatan,
	]);

	const columns = useMemo(() => activeTabConfig.columns, [activeTabConfig]);

	const columnFilters = useMemo(
		() => [{ id: "kbliKategori", value: selectedKbli }],
		[selectedKbli],
	);

	useEffect(() => {
		setGlobalFilter(deferredSearch.trim());
	}, [deferredSearch]);

	const loadRows = useCallback(async () => {
		setIsLoadingRows(true);
		setHasRowsError(false);
		try {
			const response = await fetch("/api/industry", {
				cache: "no-store",
			});
			if (!response.ok) {
				setHasRowsError(true);
				setRowsState([]);
				return;
			}
			const payload = (await response.json()) as {
				data?: IndustryRow[];
			};
			setRowsState(Array.isArray(payload.data) ? payload.data : []);
		} catch {
			setHasRowsError(true);
			setRowsState([]);
		} finally {
			setIsLoadingRows(false);
		}
	}, []);

	useEffect(() => {
		void loadRows();
	}, [loadRows]);

	useEffect(() => {
		if (!kecamatanOptions.includes(selectedKecamatan)) {
			setSelectedKecamatan(ALL_KECAMATAN);
			setSelectedDesa(ALL_DESA);
		}
	}, [kecamatanOptions, selectedKecamatan]);

	useEffect(() => {
		if (!desaOptions.includes(selectedDesa)) {
			setSelectedDesa(ALL_DESA);
		}
	}, [desaOptions, selectedDesa]);

	useEffect(() => {
		if (!kecamatanOptions.includes(tempKecamatan)) {
			setTempKecamatan(ALL_KECAMATAN);
			setTempDesa(ALL_DESA);
		}
	}, [kecamatanOptions, tempKecamatan]);

	useEffect(() => {
		if (!tempDesaOptions.includes(tempDesa)) {
			setTempDesa(ALL_DESA);
		}
	}, [tempDesa, tempDesaOptions]);

	const table = useReactTable({
		data,
		columns,
		defaultColumn: {
			minSize: 160,
			size: 220,
		},
		columnResizeMode: "onChange",
		state: {
			sorting,
			globalFilter,
			pagination,
			columnFilters,
		},
		onSortingChange: setSorting,
		onPaginationChange: setPagination,
		onGlobalFilterChange: setGlobalFilter,
		globalFilterFn: (row, _columnId, filterValue) => {
			const q = String(filterValue ?? "").toLowerCase();
			if (!q) return true;
			return activeTabConfig.getSearchText(row.original).includes(q);
		},
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		enableColumnResizing: true,
		autoResetPageIndex: false,
	});

	useEffect(() => {
		setPagination((prev) => ({ ...prev, pageIndex: 0 }));
	}, [
		activeTab,
		globalFilter,
		selectedCoverage,
		selectedDesa,
		selectedKbli,
		selectedKecamatan,
	]);

	const filteredCount = table.getFilteredRowModel().rows.length;

	const openFilterModal = () => {
		setTempKbli([...selectedKbli]);
		setTempKecamatan(selectedKecamatan);
		setTempDesa(selectedDesa);
		setTempCoverage(selectedCoverage);
		setIsFilterModalOpen(true);
	};

	const applyFilters = () => {
		setSelectedKbli([...tempKbli]);
		setSelectedKecamatan(tempKecamatan);
		setSelectedDesa(tempDesa);
		setSelectedCoverage(tempCoverage);
		setIsFilterModalOpen(false);
	};

	const toggleKbli = (value: string) => {
		setTempKbli((prev) =>
			prev.includes(value)
				? prev.filter((item) => item !== value)
				: [...prev, value],
		);
	};

	const anomalyCount = table
		.getFilteredRowModel()
		.rows.filter((row) => !row.original.isInsideKaranganyar).length;

	const handleSavePreviewRow = (updated: IndustryRow) => {
		setRowsState((prev) =>
			prev.map((row) => (row.id === updated.id ? updated : row)),
		);
		setPreviewRow(updated);
	};

	const resetAllFilters = () => {
		setSearchInput("");
		setSelectedKbli([...KBLI_OPTIONS]);
		setSelectedKecamatan(ALL_KECAMATAN);
		setSelectedDesa(ALL_DESA);
		setSelectedCoverage("inside");
		setTempKbli([...KBLI_OPTIONS]);
		setTempKecamatan(ALL_KECAMATAN);
		setTempDesa(ALL_DESA);
		setTempCoverage("inside");
	};

	return (
		<PageShell width="4xl" className="space-y-6">
			<PageHeader
				title="Data Industri"
				description="Deskripsi Data Industri"
				badge="Master Data"
			/>

			<section>
				<div
					className="tabs tabs-lift overflow-x-auto pb-1 whitespace-nowrap"
					role="tablist"
				>
					{DATA_INDUSTRI_TABS.map((tab) => (
						<button
							key={tab.key}
							role="tab"
							type="button"
							className={`tab inline-flex min-w-max items-center gap-2 ${
								activeTab === tab.key
									? `tab-active ${tabActiveTone(tab.key)}`
									: "text-base-content/70"
							}`}
							aria-selected={activeTab === tab.key}
							onClick={() => setActiveTab(tab.key)}
						>
							{tabIcon(tab.key)}
							{tab.label}
						</button>
					))}
				</div>
			</section>

			<DataIndustriToolbar
				selectedKbli={selectedKbli}
				totalKbliOptions={KBLI_OPTIONS.length}
				anomalyCount={anomalyCount}
				searchInput={searchInput}
				selectedCoverage={getKaranganyarCoverageLabel(selectedCoverage)}
				selectedKecamatan={selectedKecamatan}
				selectedDesa={selectedDesa}
				showRegionFilters={isGoogleMapsTab}
				onSearchChange={setSearchInput}
				onOpenFilter={openFilterModal}
			/>

			{isLoadingRows ? (
				<section className="border-base-300 bg-base-100 rounded-xl border p-4">
					<div className="space-y-3">
						{Array.from({ length: 8 }).map((_, index) => (
							<div
								key={`industry-loading-row-${index}`}
								className="grid grid-cols-3 gap-3 md:grid-cols-6"
							>
								{Array.from({ length: 6 }).map(
									(__, cellIndex) => (
										<div
											key={`industry-loading-cell-${index}-${cellIndex}`}
											className="skeleton h-5 w-full"
										/>
									),
								)}
							</div>
						))}
					</div>
				</section>
			) : hasRowsError ? (
				<PageState
					variant="error"
					title="Data industri belum bisa ditampilkan"
					description="Terjadi kendala saat mengambil data. Silakan coba lagi."
					className="grid min-h-[320px] place-content-center"
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
			) : filteredCount === 0 ? (
				<PageState
					variant="empty"
					title={
						rowsState.length === 0
							? "Belum ada data industri"
							: "Tidak ada data sesuai filter"
					}
					description={
						rowsState.length === 0
							? "Tabel disembunyikan sampai data tersedia dari sumber utama."
							: "Coba ubah filter atau reset pencarian untuk melihat data yang tersedia."
					}
					className="grid min-h-[320px] place-content-center"
					action={
						rowsState.length === 0 ? (
							<button
								type="button"
								className="btn btn-primary btn-sm gap-2"
								onClick={() => void loadRows()}
							>
								<RefreshCw className="h-4 w-4" />
								Muat Ulang
							</button>
						) : (
							<button
								type="button"
								className="btn btn-primary btn-sm"
								onClick={resetAllFilters}
							>
								Reset Filter
							</button>
						)
					}
				/>
			) : (
				<DataIndustriTable
					table={table}
					filteredCount={filteredCount}
					pagination={pagination}
					onRowClick={setPreviewRow}
				/>
			)}

			<DataIndustriFilterModal
				isOpen={isFilterModalOpen}
				kbliOptions={KBLI_OPTIONS}
				selectedKbli={tempKbli}
				selectedCoverage={tempCoverage}
				kecamatanOptions={kecamatanOptions}
				desaOptions={tempDesaOptions}
				selectedKecamatan={tempKecamatan}
				selectedDesa={tempDesa}
				showRegionFilters={isGoogleMapsTab}
				totalShown={filteredCount}
				onToggleKbli={toggleKbli}
				onChangeCoverage={setTempCoverage}
				onChangeKecamatan={(value) => {
					setTempKecamatan(value);
					setTempDesa(ALL_DESA);
				}}
				onChangeDesa={setTempDesa}
				onSelectAll={() => {
					setTempKbli([...KBLI_OPTIONS]);
					setTempCoverage("all");
					setTempKecamatan(ALL_KECAMATAN);
					setTempDesa(ALL_DESA);
				}}
				onClearAll={() => {
					setTempKbli([]);
					setTempCoverage("all");
					setTempKecamatan(ALL_KECAMATAN);
					setTempDesa(ALL_DESA);
				}}
				onReset={() => {
					setTempKbli([...KBLI_OPTIONS]);
					setTempCoverage("inside");
					setTempKecamatan(ALL_KECAMATAN);
					setTempDesa(ALL_DESA);
				}}
				onClose={() => setIsFilterModalOpen(false)}
				onApply={applyFilters}
			/>

			<DataIndustriDetailModal
				row={previewRow}
				editable
				onSave={handleSavePreviewRow}
				onClose={() => setPreviewRow(null)}
			/>
		</PageShell>
	);
}

"use client";

import { useCallback, useMemo, useState } from "react";
import {
	Check,
	ChevronLeft,
	Download,
	FileSpreadsheet,
	RotateCcw,
} from "lucide-react";
import * as XLSX from "xlsx";

import type { IndustryRow } from "@/components/data-industri/types";
import { useTimedAlert } from "@/contexts/TimedAlertContext";

type ExportCoverage = "inside" | "outside" | "all";
type ExportStatus = "all" | "Aktif" | "Verifikasi" | "Draft";

interface ExportWizardProps {
	onBack: () => void;
}

function downloadArrayBuffer(data: ArrayBuffer, fileName: string) {
	const blob = new Blob([data], {
		type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	});
	const url = URL.createObjectURL(blob);
	const anchor = document.createElement("a");
	anchor.href = url;
	anchor.download = fileName;
	anchor.click();
	URL.revokeObjectURL(url);
}

export default function ExportWizard({ onBack }: ExportWizardProps) {
	const { showAlert } = useTimedAlert();
	const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([
		"Google Maps",
		"YouTube",
		"TikTok",
	]);
	const [coverage, setCoverage] = useState<ExportCoverage>("all");
	const [status, setStatus] = useState<ExportStatus>("all");
	const [includeMetadata, setIncludeMetadata] = useState(true);
	const [isExporting, setIsExporting] = useState(false);
	const [isComplete, setIsComplete] = useState(false);
	const [lastExportCount, setLastExportCount] = useState(0);

	const isValid = selectedPlatforms.length > 0;

	const selectedSummary = useMemo(() => {
		return [
			`${selectedPlatforms.length} platform`,
			coverage === "all"
				? "Semua wilayah"
				: coverage === "inside"
					? "Dalam Karanganyar"
					: "Luar Karanganyar",
			status === "all" ? "Semua status" : `Status ${status}`,
			includeMetadata ? "Metadata lengkap" : "Metadata ringkas",
		].join(" • ");
	}, [coverage, includeMetadata, selectedPlatforms.length, status]);

	const handleTogglePlatform = (platform: string) => {
		setSelectedPlatforms((prev) =>
			prev.includes(platform)
				? prev.filter((item) => item !== platform)
				: [...prev, platform],
		);
	};

	const handleExport = useCallback(async () => {
		if (!isValid) return;

		setIsExporting(true);
		try {
			const response = await fetch("/api/industry", {
				cache: "no-store",
			});
			if (!response.ok) {
				throw new Error("Gagal mengambil data untuk diexport.");
			}

			const payload = (await response.json()) as { data?: IndustryRow[] };
			const allRows = Array.isArray(payload.data) ? payload.data : [];
			const filtered = allRows.filter((row) => {
				if (!selectedPlatforms.includes(row.platform)) return false;
				if (coverage === "inside" && !row.isInsideKaranganyar)
					return false;
				if (coverage === "outside" && row.isInsideKaranganyar)
					return false;
				if (status !== "all" && row.status !== status) return false;
				return true;
			});

			if (filtered.length === 0) {
				showAlert({
					variant: "warning",
					title: "Tidak ada data",
					description:
						"Tidak ada baris yang cocok dengan filter export.",
				});
				return;
			}

			const workbook = XLSX.utils.book_new();

			for (const platform of selectedPlatforms) {
				const platformRows = filtered.filter(
					(row) => row.platform === platform,
				);
				if (!platformRows.length) continue;

				const sheetRows = platformRows.map((row) => {
					const base = {
						sourceKey: row.id,
						platform: row.platform,
						namaUsaha: row.namaUsaha,
						kbliKategori: row.kbliKategori,
						status: row.status,
						isInsideKaranganyar: row.isInsideKaranganyar,
						kecamatanNama: row.kecamatanNama,
						desaNama: row.desaNama,
						updatedAt: row.updatedAt,
					};

					if (!includeMetadata) return base;

					return {
						...base,
						metadata: JSON.stringify(row.metadata),
					};
				});

				const sheetName =
					platform === "Google Maps"
						? "Google Maps"
						: platform === "YouTube"
							? "YouTube"
							: "TikTok";

				const worksheet = XLSX.utils.json_to_sheet(sheetRows);
				XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
			}

			const output = XLSX.write(workbook, {
				bookType: "xlsx",
				type: "array",
			}) as ArrayBuffer;

			const today = new Date().toISOString().slice(0, 10);
			downloadArrayBuffer(output, `industry-export-${today}.xlsx`);
			setLastExportCount(filtered.length);
			setIsComplete(true);
		} catch (error) {
			showAlert({
				variant: "error",
				title: "Export gagal",
				description:
					error instanceof Error
						? error.message
						: "Terjadi kendala saat memproses export.",
			});
		} finally {
			setIsExporting(false);
		}
	}, [
		coverage,
		includeMetadata,
		isValid,
		selectedPlatforms,
		showAlert,
		status,
	]);

	if (isComplete) {
		return (
			<section className="space-y-6 py-8 text-center">
				<div className="bg-success/15 text-success mx-auto flex h-20 w-20 items-center justify-center rounded-full">
					<Check className="h-10 w-10" />
				</div>
				<div>
					<h2 className="text-xl font-semibold">Export selesai</h2>
					<p className="text-base-content/70 mt-1 text-sm">
						{lastExportCount} baris berhasil diexport ke file XLSX.
					</p>
				</div>
				<div className="flex flex-wrap justify-center gap-2">
					<button
						type="button"
						className="btn btn-outline btn-sm"
						onClick={() => {
							setIsComplete(false);
							setLastExportCount(0);
						}}
					>
						<RotateCcw className="h-4 w-4" />
						Export lagi
					</button>
					<button
						type="button"
						className="btn btn-primary btn-sm"
						onClick={onBack}
					>
						Kembali
					</button>
				</div>
			</section>
		);
	}

	return (
		<section className="space-y-6">
			<h2 className="text-xl font-semibold">Pengaturan Export</h2>

			<div className="border-base-300 bg-base-100 rounded-xl border p-4">
				<p className="text-sm font-medium">Platform</p>
				<div className="mt-3 grid gap-2 sm:grid-cols-3">
					{["Google Maps", "YouTube", "TikTok"].map((platform) => (
						<label
							key={platform}
							className="border-base-300 bg-base-100 flex cursor-pointer items-center gap-2 rounded-lg border p-3"
						>
							<input
								type="checkbox"
								className="checkbox checkbox-primary checkbox-sm"
								checked={selectedPlatforms.includes(platform)}
								onChange={() => handleTogglePlatform(platform)}
							/>
							<span className="text-sm">{platform}</span>
						</label>
					))}
				</div>
			</div>

			<div className="grid gap-4 md:grid-cols-2">
				<div className="border-base-300 bg-base-100 rounded-xl border p-4">
					<p className="text-sm font-medium">Cakupan Wilayah</p>
					<select
						value={coverage}
						onChange={(event) =>
							setCoverage(event.target.value as ExportCoverage)
						}
						className="select select-bordered mt-2 w-full"
					>
						<option value="all">Semua wilayah</option>
						<option value="inside">Dalam Karanganyar</option>
						<option value="outside">Luar Karanganyar</option>
					</select>
				</div>

				<div className="border-base-300 bg-base-100 rounded-xl border p-4">
					<p className="text-sm font-medium">Status Data</p>
					<select
						value={status}
						onChange={(event) =>
							setStatus(event.target.value as ExportStatus)
						}
						className="select select-bordered mt-2 w-full"
					>
						<option value="all">Semua status</option>
						<option value="Aktif">Aktif</option>
						<option value="Verifikasi">Verifikasi</option>
						<option value="Draft">Draft</option>
					</select>
				</div>
			</div>

			<label className="border-base-300 bg-base-100 flex cursor-pointer items-center gap-3 rounded-xl border p-4">
				<input
					type="checkbox"
					className="checkbox checkbox-primary checkbox-sm"
					checked={includeMetadata}
					onChange={(event) =>
						setIncludeMetadata(event.target.checked)
					}
				/>
				<div>
					<p className="text-sm font-medium">Sertakan metadata</p>
					<p className="text-base-content/70 text-xs">
						Jika aktif, metadata disimpan sebagai JSON pada kolom
						terpisah.
					</p>
				</div>
			</label>

			<div className="border-base-300 bg-base-200/70 rounded-xl border p-4">
				<p className="text-sm font-medium">Ringkasan</p>
				<p className="text-base-content/70 mt-1 text-sm">
					{selectedSummary}
				</p>
			</div>

			<div className="flex flex-wrap justify-between gap-2 pt-2">
				<button
					type="button"
					className="btn btn-ghost btn-sm"
					onClick={onBack}
				>
					<ChevronLeft className="h-4 w-4" />
					Kembali
				</button>
				<button
					type="button"
					className="btn btn-primary btn-sm"
					onClick={() => void handleExport()}
					disabled={!isValid || isExporting}
				>
					{isExporting ? (
						<>
							<span className="loading loading-spinner loading-xs" />
							Memproses...
						</>
					) : (
						<>
							<Download className="h-4 w-4" />
							Export XLSX
						</>
					)}
				</button>
			</div>

			<div className="text-base-content/60 flex items-center gap-2 text-xs">
				<FileSpreadsheet className="h-3.5 w-3.5" />
				File export disusun per sheet: Google Maps, YouTube, dan TikTok.
			</div>
		</section>
	);
}

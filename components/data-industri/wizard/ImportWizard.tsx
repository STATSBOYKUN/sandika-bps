"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import {
	AlertCircle,
	Check,
	ChevronLeft,
	ChevronRight,
	RotateCcw,
	Upload,
} from "lucide-react";
import * as XLSX from "xlsx";

import { KBLI_OPTIONS } from "@/components/data-industri/types";
import { useTimedAlert } from "@/contexts/TimedAlertContext";

type ImportStep = "upload" | "preview" | "settings" | "confirm" | "complete";

type StatusOverride = "auto" | "Aktif" | "Verifikasi" | "Draft";

type ImportPreviewRow = {
	index: number;
	namaUsaha: string;
	platform: string;
	kbliKategori: string;
	status: string;
};

type ImportPreview = {
	totalRows: number;
	unknownPlatformRows: number;
	platformCounts: Record<string, number>;
	sampleRows: ImportPreviewRow[];
	sheets: Array<{
		sheetName: string;
		rowCount: number;
	}>;
};

interface ImportWizardProps {
	onBack: () => void;
}

function normalizeHeader(value: string) {
	return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function pick(row: Record<string, string>, keys: string[]) {
	for (const key of keys) {
		const value = row[key];
		if (value && value.trim()) return value.trim();
	}
	return "";
}

function detectPlatform(row: Record<string, string>) {
	const raw = pick(row, [
		"platform",
		"sumberplatform",
		"source",
	]).toLowerCase();
	if (raw.includes("google")) return "Google Maps";
	if (raw.includes("youtube")) return "YouTube";
	if (raw.includes("tiktok") || raw.includes("tik tok")) return "TikTok";

	const hasLatLong =
		pick(row, ["latitude", "lat"]) &&
		pick(row, ["longitude", "lng", "long"]);
	if (hasLatLong) return "Google Maps";

	if (
		pick(row, ["channelid", "channel_id", "channeltitle", "channel_name"])
	) {
		return "YouTube";
	}

	if (pick(row, ["authorid", "author_id", "authorusername", "username"])) {
		return "TikTok";
	}

	return "Tidak dikenali";
}

function parseWorkbookPreview(
	file: File,
	workbook: XLSX.WorkBook,
): ImportPreview {
	const sampleRows: ImportPreviewRow[] = [];
	const platformCounts: Record<string, number> = {
		"Google Maps": 0,
		YouTube: 0,
		TikTok: 0,
	};

	let totalRows = 0;
	let unknownPlatformRows = 0;
	const sheets: ImportPreview["sheets"] = [];

	for (const sheetName of workbook.SheetNames) {
		const sheet = workbook.Sheets[sheetName];
		const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
			defval: "",
			raw: false,
		});
		totalRows += rows.length;
		sheets.push({ sheetName, rowCount: rows.length });

		rows.forEach((raw, idx) => {
			const normalized: Record<string, string> = {};
			for (const [key, value] of Object.entries(raw)) {
				normalized[normalizeHeader(key)] = String(value ?? "").trim();
			}

			const platform = detectPlatform(normalized);
			if (platform === "Tidak dikenali") {
				unknownPlatformRows += 1;
			} else {
				platformCounts[platform] = (platformCounts[platform] ?? 0) + 1;
			}

			if (sampleRows.length < 10) {
				sampleRows.push({
					index: sampleRows.length + 1,
					namaUsaha:
						pick(normalized, [
							"namausaha",
							"nama_usaha",
							"title",
							"name",
						]) || `Baris ${idx + 1}`,
					platform,
					kbliKategori:
						pick(normalized, [
							"kblikategori",
							"kbli",
							"kbli_kategori",
						]) || "-",
					status: pick(normalized, ["status"]) || "Verifikasi",
				});
			}
		});
	}

	if (totalRows === 0) {
		throw new Error(`File ${file.name} tidak memiliki data.`);
	}

	return {
		totalRows,
		unknownPlatformRows,
		platformCounts,
		sampleRows,
		sheets,
	};
}

export default function ImportWizard({ onBack }: ImportWizardProps) {
	const { showAlert } = useTimedAlert();
	const inputRef = useRef<HTMLInputElement>(null);

	const [step, setStep] = useState<ImportStep>("upload");
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [preview, setPreview] = useState<ImportPreview | null>(null);
	const [isProcessing, setIsProcessing] = useState(false);
	const [maxRows, setMaxRows] = useState(5000);
	const [defaultKbli, setDefaultKbli] = useState("J");
	const [statusOverride, setStatusOverride] =
		useState<StatusOverride>("auto");
	const [importResult, setImportResult] = useState<{
		imported: number;
		skipped: number;
		totalRead: number;
		errors: string[];
	} | null>(null);

	const canContinueFromPreview = useMemo(() => {
		if (!preview) return false;
		if (preview.totalRows === 0) return false;
		if (maxRows < 1) return false;
		return true;
	}, [maxRows, preview]);

	const handleFileChange = (file?: File) => {
		if (!file) return;
		setSelectedFile(file);
		setPreview(null);
		setImportResult(null);
	};

	const handlePreview = useCallback(async () => {
		if (!selectedFile) return;

		setIsProcessing(true);
		try {
			const bytes = await selectedFile.arrayBuffer();
			const workbook = XLSX.read(bytes, { type: "array", raw: false });
			const parsed = parseWorkbookPreview(selectedFile, workbook);
			setPreview(parsed);
			setMaxRows(Math.min(parsed.totalRows, 5000));
			setStep("preview");
		} catch (error) {
			showAlert({
				variant: "error",
				title: "Gagal membaca file",
				description:
					error instanceof Error
						? error.message
						: "File tidak dapat dipreview.",
			});
		} finally {
			setIsProcessing(false);
		}
	}, [selectedFile, showAlert]);

	const handleImport = useCallback(async () => {
		if (!selectedFile || !preview) return;

		setIsProcessing(true);
		try {
			const formData = new FormData();
			formData.append("file", selectedFile);
			formData.append("maxRows", String(maxRows));
			formData.append("defaultKbli", defaultKbli);
			if (statusOverride !== "auto") {
				formData.append("forceStatus", statusOverride);
			}

			const response = await fetch("/api/industry", {
				method: "POST",
				body: formData,
			});

			const payload = (await response.json()) as {
				message?: string;
				imported?: number;
				skipped?: number;
				totalRead?: number;
				errors?: string[];
			};

			if (!response.ok) {
				throw new Error(payload.message ?? "Import gagal diproses.");
			}

			setImportResult({
				imported: payload.imported ?? 0,
				skipped: payload.skipped ?? 0,
				totalRead: payload.totalRead ?? preview.totalRows,
				errors: payload.errors ?? [],
			});
			setStep("complete");
		} catch (error) {
			showAlert({
				variant: "error",
				title: "Import gagal",
				description:
					error instanceof Error
						? error.message
						: "Terjadi kendala saat menyimpan data.",
			});
		} finally {
			setIsProcessing(false);
		}
	}, [
		defaultKbli,
		maxRows,
		preview,
		selectedFile,
		showAlert,
		statusOverride,
	]);

	if (step === "upload") {
		return (
			<section className="space-y-6">
				<h2 className="text-xl font-semibold">Upload File Import</h2>
				<div className="border-base-300 bg-base-100 rounded-xl border border-dashed p-6">
					<input
						ref={inputRef}
						type="file"
						accept=".csv,.xlsx"
						className="hidden"
						onChange={(event) => {
							handleFileChange(event.target.files?.[0]);
							event.currentTarget.value = "";
						}}
					/>
					<div className="space-y-4 text-center">
						<div className="bg-primary/10 text-primary mx-auto flex h-14 w-14 items-center justify-center rounded-lg">
							<Upload className="h-7 w-7" />
						</div>
						<p className="text-base-content/70 text-sm">
							Pilih file CSV atau XLSX untuk dipreview sebelum
							import.
						</p>
						{selectedFile ? (
							<div className="space-y-1">
								<p className="text-sm font-medium">
									{selectedFile.name}
								</p>
								<p className="text-base-content/60 text-xs">
									Ukuran{" "}
									{(selectedFile.size / 1024).toFixed(1)} KB
								</p>
							</div>
						) : null}
						<button
							type="button"
							className="btn btn-outline btn-sm"
							onClick={() => inputRef.current?.click()}
						>
							Pilih File
						</button>
					</div>
				</div>

				<div className="flex flex-wrap justify-between gap-2">
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
						onClick={() => void handlePreview()}
						disabled={!selectedFile || isProcessing}
					>
						{isProcessing ? (
							<>
								<span className="loading loading-spinner loading-xs" />
								Membaca...
							</>
						) : (
							<>
								Lanjut ke Preview
								<ChevronRight className="h-4 w-4" />
							</>
						)}
					</button>
				</div>
			</section>
		);
	}

	if (step === "preview" && preview) {
		return (
			<section className="space-y-6">
				<h2 className="text-xl font-semibold">Preview Import</h2>

				{preview.unknownPlatformRows > 0 ? (
					<div className="alert alert-warning">
						<AlertCircle className="h-5 w-5" />
						<span>
							{preview.unknownPlatformRows} baris tidak dikenali
							platform-nya dan akan dilewati.
						</span>
					</div>
				) : null}

				<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
					<div className="bg-base-100 rounded-lg p-3">
						<p className="text-base-content/70 text-xs">
							Total Baris
						</p>
						<p className="text-lg font-semibold">
							{preview.totalRows}
						</p>
					</div>
					<div className="bg-base-100 rounded-lg p-3">
						<p className="text-base-content/70 text-xs">
							Google Maps
						</p>
						<p className="text-lg font-semibold">
							{preview.platformCounts["Google Maps"] ?? 0}
						</p>
					</div>
					<div className="bg-base-100 rounded-lg p-3">
						<p className="text-base-content/70 text-xs">YouTube</p>
						<p className="text-lg font-semibold">
							{preview.platformCounts.YouTube ?? 0}
						</p>
					</div>
					<div className="bg-base-100 rounded-lg p-3">
						<p className="text-base-content/70 text-xs">TikTok</p>
						<p className="text-lg font-semibold">
							{preview.platformCounts.TikTok ?? 0}
						</p>
					</div>
				</div>

				<div className="border-base-300 bg-base-100 rounded-xl border p-4">
					<p className="text-sm font-medium">Sampel Data</p>
					<div className="mt-3 overflow-x-auto">
						<table className="table-sm table">
							<thead>
								<tr>
									<th>#</th>
									<th>Nama</th>
									<th>Platform</th>
									<th>KBLI</th>
									<th>Status</th>
								</tr>
							</thead>
							<tbody>
								{preview.sampleRows.map((row) => (
									<tr key={`sample-${row.index}`}>
										<td>{row.index}</td>
										<td>{row.namaUsaha}</td>
										<td>{row.platform}</td>
										<td>{row.kbliKategori}</td>
										<td>{row.status}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>

				<div className="flex flex-wrap justify-between gap-2">
					<button
						type="button"
						className="btn btn-ghost btn-sm"
						onClick={() => setStep("upload")}
					>
						<ChevronLeft className="h-4 w-4" />
						Ganti File
					</button>
					<button
						type="button"
						className="btn btn-primary btn-sm"
						onClick={() => setStep("settings")}
					>
						Atur Import
						<ChevronRight className="h-4 w-4" />
					</button>
				</div>
			</section>
		);
	}

	if (step === "settings" && preview) {
		return (
			<section className="space-y-6">
				<h2 className="text-xl font-semibold">Pengaturan Import</h2>

				<div className="grid gap-4 md:grid-cols-2">
					<div className="border-base-300 bg-base-100 rounded-xl border p-4">
						<label className="text-sm font-medium">
							Maksimal baris diproses
						</label>
						<input
							type="number"
							min={1}
							max={5000}
							value={maxRows}
							onChange={(event) =>
								setMaxRows(
									Number.parseInt(
										event.target.value || "1",
										10,
									),
								)
							}
							className="input input-bordered mt-2 w-full"
						/>
						<p className="text-base-content/60 mt-2 text-xs">
							Batas server: 5000 baris per import.
						</p>
					</div>

					<div className="border-base-300 bg-base-100 rounded-xl border p-4">
						<label className="text-sm font-medium">
							Default KBLI
						</label>
						<select
							value={defaultKbli}
							onChange={(event) =>
								setDefaultKbli(event.target.value)
							}
							className="select select-bordered mt-2 w-full"
						>
							{KBLI_OPTIONS.map((item) => (
								<option key={item} value={item}>
									{item}
								</option>
							))}
						</select>
						<p className="text-base-content/60 mt-2 text-xs">
							Dipakai ketika nilai KBLI pada file kosong atau
							tidak valid.
						</p>
					</div>
				</div>

				<div className="border-base-300 bg-base-100 rounded-xl border p-4">
					<label className="text-sm font-medium">
						Override status data
					</label>
					<select
						value={statusOverride}
						onChange={(event) =>
							setStatusOverride(
								event.target.value as StatusOverride,
							)
						}
						className="select select-bordered mt-2 w-full"
					>
						<option value="auto">Gunakan status dari file</option>
						<option value="Aktif">Paksa semua jadi Aktif</option>
						<option value="Verifikasi">
							Paksa semua jadi Verifikasi
						</option>
						<option value="Draft">Paksa semua jadi Draft</option>
					</select>
				</div>

				<div className="flex flex-wrap justify-between gap-2">
					<button
						type="button"
						className="btn btn-ghost btn-sm"
						onClick={() => setStep("preview")}
					>
						<ChevronLeft className="h-4 w-4" />
						Kembali
					</button>
					<button
						type="button"
						className="btn btn-primary btn-sm"
						onClick={() => setStep("confirm")}
						disabled={!canContinueFromPreview}
					>
						Lanjut Konfirmasi
						<ChevronRight className="h-4 w-4" />
					</button>
				</div>
			</section>
		);
	}

	if (step === "confirm" && preview) {
		return (
			<section className="space-y-6">
				<h2 className="text-xl font-semibold">Konfirmasi Import</h2>

				<div className="border-warning bg-warning/10 rounded-xl border p-4 text-sm">
					<div className="flex items-start gap-2">
						<AlertCircle className="text-warning mt-0.5 h-4 w-4" />
						<p>
							Data dengan <code>sourceKey</code> yang sama akan
							di-update. Pastikan file sudah benar sebelum import.
						</p>
					</div>
				</div>

				<div className="border-base-300 bg-base-100 rounded-xl border p-4">
					<p className="text-sm font-medium">Ringkasan</p>
					<div className="mt-2 space-y-1 text-sm">
						<p>Total baris terbaca: {preview.totalRows}</p>
						<p>Baris diproses: {maxRows}</p>
						<p>Default KBLI: {defaultKbli}</p>
						<p>
							Status:{" "}
							{statusOverride === "auto"
								? "Dari file"
								: statusOverride}
						</p>
					</div>
				</div>

				<div className="flex flex-wrap justify-between gap-2">
					<button
						type="button"
						className="btn btn-ghost btn-sm"
						onClick={() => setStep("settings")}
						disabled={isProcessing}
					>
						<ChevronLeft className="h-4 w-4" />
						Kembali
					</button>
					<button
						type="button"
						className="btn btn-success btn-sm"
						onClick={() => void handleImport()}
						disabled={isProcessing}
					>
						{isProcessing ? (
							<>
								<span className="loading loading-spinner loading-xs" />
								Mengimport...
							</>
						) : (
							"Konfirmasi Import"
						)}
					</button>
				</div>
			</section>
		);
	}

	if (step === "complete") {
		return (
			<section className="space-y-6 py-8 text-center">
				<div className="bg-success/15 text-success mx-auto flex h-20 w-20 items-center justify-center rounded-full">
					<Check className="h-10 w-10" />
				</div>
				<div>
					<h2 className="text-xl font-semibold">Import selesai</h2>
					<p className="text-base-content/70 mt-1 text-sm">
						Berhasil {importResult?.imported ?? 0} baris, dilewati{" "}
						{importResult?.skipped ?? 0} baris.
					</p>
				</div>

				{importResult?.errors?.length ? (
					<div className="bg-error/10 mx-auto max-h-48 w-full max-w-2xl overflow-y-auto rounded-xl p-4 text-left">
						<p className="mb-2 text-sm font-medium">Error</p>
						<ul className="space-y-1 text-xs">
							{importResult.errors.slice(0, 10).map((item) => (
								<li key={item}>- {item}</li>
							))}
						</ul>
					</div>
				) : null}

				<div className="flex flex-wrap justify-center gap-2">
					<button
						type="button"
						className="btn btn-outline btn-sm"
						onClick={() => {
							setStep("upload");
							setSelectedFile(null);
							setPreview(null);
							setImportResult(null);
							if (inputRef.current) inputRef.current.value = "";
						}}
					>
						<RotateCcw className="h-4 w-4" />
						Import lagi
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

	return null;
}

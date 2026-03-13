"use client";

import { useMemo, useState } from "react";
import {
	CircleUser,
	Clock3,
	FileText,
	MessageSquare,
	Paperclip,
	RefreshCw,
	Send,
	Ticket,
} from "lucide-react";

import PageHeader from "@/components/layout/PageHeader";
import PageShell from "@/components/layout/PageShell";
import PageState from "@/components/layout/PageState";
import { useTimedAlert } from "@/contexts/TimedAlertContext";

type TicketSummary = {
	id: string;
	ticketCode: string;
	title: string;
	status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
	priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
	reporterName: string;
	modulePath: string | null;
	createdAt: string;
};

const STORAGE_KEY = "helpdeskTickets";

const statusClass: Record<TicketSummary["status"], string> = {
	OPEN: "badge badge-warning",
	IN_PROGRESS: "badge badge-info",
	RESOLVED: "badge badge-success",
	CLOSED: "badge badge-neutral",
};

function readStoredTickets(): TicketSummary[] {
	if (typeof window === "undefined") return [];
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw) as TicketSummary[];
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}

function saveStoredTickets(tickets: TicketSummary[]) {
	if (typeof window === "undefined") return;
	localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
}

export default function HelpTicketingPage() {
	const { showAlert } = useTimedAlert();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isLoadingTickets, setIsLoadingTickets] = useState(false);
	const [tickets, setTickets] = useState<TicketSummary[]>([]);
	const [tab, setTab] = useState<"create" | "history">("create");
	const [hasSubmitted, setHasSubmitted] = useState(false);

	const [form, setForm] = useState({
		reporterName: "",
		reporterUnit: "",
		reporterContact: "",
		modulePath: "",
		title: "",
		description: "",
		category: "BUG",
	});
	const [attachments, setAttachments] = useState<File[]>([]);

	const canSubmit = useMemo(() => {
		return (
			form.reporterName.trim().length > 1 &&
			form.title.trim().length > 4 &&
			form.description.trim().length > 9
		);
	}, [form]);

	const loadTickets = async () => {
		setIsLoadingTickets(true);
		try {
			const stored = readStoredTickets();
			setTickets(
				stored.sort(
					(a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
				),
			);
		} catch {
			showAlert({
				variant: "error",
				title: "Gagal memuat riwayat",
				description: "Gagal membaca data tiket lokal.",
			});
		} finally {
			setIsLoadingTickets(false);
		}
	};

	const onSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
		event.preventDefault();
		setHasSubmitted(true);

		if (!canSubmit) {
			showAlert({
				variant: "error",
				title: "Validasi gagal",
				description: "Lengkapi kolom wajib sebelum mengirim tiket.",
				durationMs: 4000,
			});
			return;
		}

		setIsSubmitting(true);
		try {
			const createdAt = new Date().toISOString();
			const ticketCode = `TCK-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

			const newTicket: TicketSummary = {
				id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
				ticketCode,
				title: form.title,
				status: "OPEN",
				priority:
					form.category === "BUG"
						? "HIGH"
						: form.category === "DATA_ISSUE"
							? "MEDIUM"
							: "LOW",
				reporterName: form.reporterName,
				modulePath: form.modulePath || null,
				createdAt,
			};

			const nextTickets = [newTicket, ...readStoredTickets()];
			saveStoredTickets(nextTickets);

			showAlert({
				variant: "success",
				title: "Berhasil",
				description: `Laporan berhasil dibuat dengan kode ${ticketCode}.`,
			});

			setForm({
				reporterName: "",
				reporterUnit: "",
				reporterContact: "",
				modulePath: "",
				title: "",
				description: "",
				category: "BUG",
			});
			setAttachments([]);
			setHasSubmitted(false);
			setTab("history");
			await loadTickets();
		} catch {
			showAlert({
				variant: "error",
				title: "Gagal mengirim tiket",
				description: "Tiket gagal disimpan ke penyimpanan lokal.",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<PageShell width="4xl" className="space-y-6">
			<article className="space-y-6">
				<PageHeader
					title="Ticketing Laporan Masalah"
					description="Laporkan kendala sistem, lampirkan bukti pendukung, lalu pantau progres penanganan tiket Anda."
					badge="Helpdesk Internal"
				/>

				<div className="w-full overflow-x-auto">
					<div className="tabs tabs-boxed bg-base-200 w-fit p-1">
						<button
							type="button"
							className={`tab gap-2 px-6 ${tab === "create" ? "tab-active" : ""}`}
							onClick={() => setTab("create")}
						>
							<MessageSquare className="h-4 w-4" />
							<span className="hidden sm:inline">Buat Tiket</span>
						</button>
						<button
							type="button"
							className={`tab gap-2 px-6 ${tab === "history" ? "tab-active" : ""}`}
							onClick={async () => {
								setTab("history");
								await loadTickets();
							}}
						>
							<Ticket className="h-4 w-4" />
							<span className="hidden sm:inline">
								Riwayat Tiket
							</span>
						</button>
					</div>
				</div>

				{tab === "create" && (
					<form
						className="card border-base-300 bg-base-100 border shadow-sm"
						onSubmit={onSubmit}
					>
						<div className="card-body gap-6">
							<h2 className="card-title text-xl">
								Form Laporan Masalah
							</h2>

							<fieldset className="fieldset border-base-200 bg-base-50 rounded-lg border p-4">
								<legend className="fieldset-legend">
									<CircleUser className="mr-1 h-4 w-4" /> Data
									Pelapor
								</legend>

								<div className="grid grid-cols-1 gap-4">
									<label
										className={`input input-bordered flex items-center gap-2 ${hasSubmitted && form.reporterName.trim().length <= 1 ? "input-error" : ""}`}
									>
										<span className="label-text-alt text-base-content/70 w-20 shrink-0">
											Nama
										</span>
										<input
											className="min-w-0 flex-1"
											value={form.reporterName}
											onChange={(e) =>
												setForm((prev) => ({
													...prev,
													reporterName:
														e.target.value,
												}))
											}
											required
										/>
									</label>
									{hasSubmitted &&
										form.reporterName.trim().length <=
											1 && (
											<div className="text-error ml-2 text-sm">
												Nama pelapor wajib diisi (min. 2
												karakter)
											</div>
										)}

									<label className="input input-bordered flex items-center gap-2">
										<span className="label-text-alt text-base-content/70 w-20 shrink-0">
											Unit/Bidang
										</span>
										<input
											className="min-w-0 flex-1"
											value={form.reporterUnit}
											onChange={(e) =>
												setForm((prev) => ({
													...prev,
													reporterUnit:
														e.target.value,
												}))
											}
										/>
									</label>

									<label className="input input-bordered flex items-center gap-2">
										<span className="label-text-alt text-base-content/70 w-20 shrink-0">
											Kontak
										</span>
										<input
											className="min-w-0 flex-1"
											value={form.reporterContact}
											onChange={(e) =>
												setForm((prev) => ({
													...prev,
													reporterContact:
														e.target.value,
												}))
											}
										/>
										<span className="badge badge-neutral badge-xs shrink-0">
											Optional
										</span>
									</label>
								</div>
							</fieldset>

							<fieldset className="fieldset border-base-200 bg-base-50 rounded-lg border p-4">
								<legend className="fieldset-legend">
									<FileText className="mr-1 h-4 w-4" /> Detail
									Laporan
								</legend>

								<div className="grid grid-cols-1 gap-4">
									<fieldset className="fieldset">
										<legend className="fieldset-legend">
											Judul Laporan
										</legend>
										<input
											className={`input input-bordered w-full ${hasSubmitted && form.title.trim().length <= 4 ? "input-error" : ""}`}
											placeholder="Ringkasan singkat masalah"
											value={form.title}
											onChange={(e) =>
												setForm((prev) => ({
													...prev,
													title: e.target.value,
												}))
											}
											required
										/>
										{hasSubmitted &&
											form.title.trim().length <= 4 && (
												<div className="text-error text-sm">
													Judul wajib diisi (min. 5
													karakter)
												</div>
											)}
									</fieldset>

									<div className="flex flex-wrap items-end gap-4">
										<fieldset className="fieldset">
											<legend className="fieldset-legend">
												Kategori
											</legend>
											<select
												className="select select-bordered select-sm w-40"
												value={form.category}
												onChange={(e) =>
													setForm((prev) => ({
														...prev,
														category:
															e.target.value,
													}))
												}
											>
												<option value="BUG">Bug</option>
												<option value="DATA_ISSUE">
													Data Issue
												</option>
												<option value="FEATURE_REQUEST">
													Feature Request
												</option>
												<option value="ACCESS">
													Access
												</option>
												<option value="OTHER">
													Lainnya
												</option>
											</select>
										</fieldset>
									</div>

									<label className="input input-bordered flex items-center gap-2">
										<span className="label-text-alt text-base-content/70 w-20 shrink-0">
											Path
										</span>
										<input
											className="min-w-0 flex-1"
											placeholder="Contoh: /data-industri"
											value={form.modulePath}
											onChange={(e) =>
												setForm((prev) => ({
													...prev,
													modulePath: e.target.value,
												}))
											}
										/>
										<span className="badge badge-neutral badge-xs shrink-0">
											Optional
										</span>
									</label>

									<fieldset className="fieldset">
										<legend className="fieldset-legend">
											Deskripsi Masalah
										</legend>
										<textarea
											className={`textarea textarea-bordered min-h-28 w-full ${hasSubmitted && form.description.trim().length <= 9 ? "textarea-error" : ""}`}
											value={form.description}
											onChange={(e) =>
												setForm((prev) => ({
													...prev,
													description: e.target.value,
												}))
											}
											required
										/>
										{hasSubmitted &&
											form.description.trim().length <=
												9 && (
												<div className="text-error text-sm">
													Deskripsi wajib diisi (min.
													10 karakter)
												</div>
											)}
									</fieldset>
								</div>
							</fieldset>

							<fieldset className="fieldset border-base-200 bg-base-50 rounded-lg border p-4">
								<legend className="fieldset-legend">
									<Paperclip className="mr-1 h-4 w-4" />{" "}
									Lampiran
								</legend>
								<p className="text-base-content/60 text-sm">
									Optional (maks 5 file)
								</p>

								<input
									type="file"
									multiple
									className="file-input file-input-bordered w-full max-w-md"
									onChange={(e) => {
										const selected = Array.from(
											e.target.files || [],
										).slice(0, 5);
										setAttachments(selected);
									}}
								/>
								{attachments.length > 0 && (
									<div className="mt-2 flex flex-wrap gap-2">
										{attachments.map((file, idx) => (
											<div
												key={`${file.name}-${idx}`}
												className="badge badge-outline gap-1"
											>
												<Paperclip className="h-3 w-3" />
												{file.name}
												<button
													type="button"
													className="hover:text-error ml-1"
													onClick={() =>
														setAttachments((prev) =>
															prev.filter(
																(_, i) =>
																	i !== idx,
															),
														)
													}
												>
													x
												</button>
											</div>
										))}
									</div>
								)}
							</fieldset>

							<div className="card-actions border-base-300 justify-end border-t pt-2">
								<button
									className="btn btn-primary"
									type="submit"
									disabled={isSubmitting}
								>
									<Send className="h-4 w-4" />
									{isSubmitting
										? "Mengirim tiket..."
										: "Kirim Tiket"}
								</button>
							</div>
						</div>
					</form>
				)}

				{tab === "history" && (
					<section className="card border-base-300 bg-base-100 border shadow-sm">
						<div className="card-body gap-4">
							<div className="flex items-center justify-between">
								<h2 className="card-title text-xl">
									Riwayat Tiket Terbaru
								</h2>
								<button
									type="button"
									className="btn btn-sm btn-outline gap-2"
									onClick={loadTickets}
									disabled={isLoadingTickets}
								>
									{isLoadingTickets ? (
										<span className="loading loading-bars loading-xs" />
									) : (
										<RefreshCw className="h-4 w-4" />
									)}
									Refresh
								</button>
							</div>

							{isLoadingTickets && tickets.length === 0 && (
								<PageState variant="loading" />
							)}

							{!isLoadingTickets && tickets.length === 0 && (
								<PageState
									variant="empty"
									title="Belum ada tiket"
									description="Silakan buat laporan baru untuk memulai riwayat tiket."
									icon={Clock3}
								/>
							)}

							<div className="space-y-3">
								{tickets.map((ticket) => (
									<div
										key={ticket.id}
										className="border-base-200 hover:bg-base-50 rounded-lg border p-4 transition-colors"
									>
										<div className="flex flex-wrap items-start justify-between gap-3">
											<div className="min-w-0 flex-1">
												<div className="flex flex-wrap items-center gap-2">
													<span className="text-primary font-mono text-sm font-semibold">
														{ticket.ticketCode}
													</span>
													<span className="text-base-content/90 font-medium">
														{ticket.title}
													</span>
												</div>
												<p className="text-base-content/60 mt-1 text-sm">
													<span className="text-base-content/70">
														Pelapor:
													</span>{" "}
													{ticket.reporterName}
													{ticket.modulePath ? (
														<span className="text-base-content/50">
															{" "}
															|{" "}
															<span className="text-base-content/70">
																Modul:
															</span>{" "}
															{ticket.modulePath}
														</span>
													) : (
														""
													)}
												</p>
											</div>
											<div className="flex shrink-0 items-center gap-2">
												<span
													className={
														statusClass[
															ticket.status
														]
													}
												>
													{ticket.status}
												</span>
												<span className="badge badge-outline badge-sm">
													{ticket.priority}
												</span>
											</div>
										</div>
										<p className="text-base-content/40 border-base-200 mt-3 border-t pt-2 text-xs">
											Dibuat:{" "}
											{new Date(
												ticket.createdAt,
											).toLocaleString("id-ID")}
										</p>
									</div>
								))}
							</div>
						</div>
					</section>
				)}
			</article>
		</PageShell>
	);
}

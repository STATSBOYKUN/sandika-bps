"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
	Briefcase,
	CheckCircle2,
	Clock3,
	Edit3,
	Mail,
	MapPin,
	Phone,
	Save,
	ShieldCheck,
	User,
	X,
} from "lucide-react";

import { PageSkeletonContent } from "@/components/layout/PageSkeleton";
import PageHeader from "@/components/layout/PageHeader";
import PageShell from "@/components/layout/PageShell";
import PageState from "@/components/layout/PageState";
import { useTimedAlert } from "@/contexts/TimedAlertContext";
import { authClient } from "@/lib/auth-client";

type UserProfile = {
	fullName: string;
	email: string;
	phone: string;
	unit: string;
	position: string;
	location: string;
	bio: string;
	lastLogin: string;
};

type ActivityIconKey = "account" | "industry";

type ProfileActivity = {
	id: string;
	label: string;
	timestamp: string;
	iconKey: ActivityIconKey;
};

const PROFILE_STORAGE_KEY = "userProfile";

const defaultProfileTemplate = {
	phone: "0812-3456-7890",
	unit: "BPS Kabupaten Karanganyar",
	position: "Analis Data Industri",
	location: "Karanganyar, Jawa Tengah",
	bio: "Berfokus pada validasi dan pengelolaan data industri digital lintas wilayah.",
};

function buildDefaultProfile(fullName = "Pengguna", email = "-"): UserProfile {
	return {
		fullName,
		email,
		...defaultProfileTemplate,
		lastLogin: new Date().toISOString(),
	};
}

function readStoredProfile(): UserProfile | null {
	if (typeof window === "undefined") return null;

	try {
		const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
		if (!raw) return null;

		const parsed = JSON.parse(raw) as UserProfile;
		if (!parsed.fullName || !parsed.email) return null;
		return parsed;
	} catch {
		return null;
	}
}

function saveStoredProfile(profile: UserProfile) {
	if (typeof window === "undefined") return;
	localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
}

function formatDateTime(value: string) {
	return new Date(value).toLocaleString("id-ID", {
		day: "2-digit",
		month: "short",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

function parseDate(value: string) {
	const parsed = new Date(value);
	if (!Number.isNaN(parsed.getTime())) return parsed;

	const fallback = new Date(value.replace(" ", "T"));
	if (!Number.isNaN(fallback.getTime())) return fallback;

	return null;
}

function formatRelativeTime(value: string) {
	const date = parseDate(value);
	if (!date) return "Waktu tidak diketahui";

	const deltaMs = Date.now() - date.getTime();
	if (!Number.isFinite(deltaMs) || deltaMs < 0) return "Baru saja";

	const minutes = Math.floor(deltaMs / 60000);
	if (minutes < 1) return "Baru saja";
	if (minutes < 60) return `${minutes} menit lalu`;

	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `${hours} jam lalu`;

	const days = Math.floor(hours / 24);
	return `${days} hari lalu`;
}

function getActivityIcon(iconKey: ActivityIconKey) {
	if (iconKey === "industry") return Briefcase;
	return ShieldCheck;
}

export default function ProfilePage() {
	const router = useRouter();
	const { showAlert } = useTimedAlert();
	const { data: session, isPending } = authClient.useSession();
	const [profile, setProfile] = useState<UserProfile>(
		() => readStoredProfile() ?? buildDefaultProfile(),
	);
	const [draft, setDraft] = useState<UserProfile>(
		() => readStoredProfile() ?? buildDefaultProfile(),
	);
	const [isEditing, setIsEditing] = useState(false);
	const [recentActivities, setRecentActivities] = useState<ProfileActivity[]>(
		[],
	);
	const [isActivitiesLoading, setIsActivitiesLoading] = useState(true);
	const [activitiesError, setActivitiesError] = useState<string | null>(null);

	useEffect(() => {
		if (!isPending && !session) {
			router.replace("/login");
		}
	}, [isPending, router, session]);

	useEffect(() => {
		if (isPending || !session) return;

		const controller = new AbortController();
		let mounted = true;

		setIsActivitiesLoading(true);
		setActivitiesError(null);

		const loadActivities = async () => {
			try {
				const response = await fetch("/api/profile/activities", {
					signal: controller.signal,
				});

				if (!response.ok) {
					throw new Error("Gagal memuat aktivitas terbaru.");
				}

				const payload = (await response.json()) as {
					data?: ProfileActivity[];
				};
				const next = Array.isArray(payload.data) ? payload.data : [];

				if (!mounted) return;
				setRecentActivities(next);
			} catch {
				if (!mounted || controller.signal.aborted) return;
				setActivitiesError("Aktivitas belum bisa ditampilkan.");
				setRecentActivities([]);
			} finally {
				if (!mounted) return;
				setIsActivitiesLoading(false);
			}
		};

		void loadActivities();

		return () => {
			mounted = false;
			controller.abort();
		};
	}, [isPending, session]);

	const sessionFullName = session?.user.name?.trim() || "Pengguna";
	const sessionEmail = session?.user.email?.trim() || "-";
	const profileView: UserProfile = {
		...profile,
		fullName: sessionFullName,
		email: sessionEmail,
	};

	const validation = useMemo(() => {
		const errors: string[] = [];
		if (draft.fullName.trim().length < 2) {
			errors.push("Nama lengkap minimal 2 karakter.");
		}
		if (!/^\S+@\S+\.\S+$/.test(draft.email.trim())) {
			errors.push("Format email tidak valid.");
		}
		return {
			isValid: errors.length === 0,
			errors,
		};
	}, [draft.email, draft.fullName]);

	if (isPending || !session) {
		return (
			<PageShell width="4xl">
				<PageSkeletonContent variant="form" />
			</PageShell>
		);
	}

	const startEdit = () => {
		setDraft(profileView);
		setIsEditing(true);
	};

	const cancelEdit = () => {
		setDraft(profileView);
		setIsEditing(false);
	};

	const saveProfile = () => {
		if (!validation.isValid) {
			showAlert({
				variant: "error",
				title: "Validasi gagal",
				description:
					validation.errors[0] ?? "Periksa kembali data profil.",
			});
			return;
		}

		const nextProfile: UserProfile = {
			...draft,
			lastLogin: profile.lastLogin,
		};

		setProfile(nextProfile);
		setDraft(nextProfile);
		setIsEditing(false);
		saveStoredProfile(nextProfile);

		showAlert({
			variant: "success",
			title: "Profil diperbarui",
			description: "Perubahan profil berhasil disimpan.",
		});
	};

	const inputClass = (field: "fullName" | "email") => {
		if (!isEditing) return "input input-bordered w-full";
		if (field === "fullName" && draft.fullName.trim().length < 2) {
			return "input input-bordered input-error w-full";
		}
		if (field === "email" && !/^\S+@\S+\.\S+$/.test(draft.email.trim())) {
			return "input input-bordered input-error w-full";
		}
		return "input input-bordered w-full";
	};

	return (
		<PageShell width="4xl" className="space-y-6">
			<PageHeader
				title="Profil Pengguna"
				description="Kelola informasi akun, data kontak, dan identitas pengguna Anda."
				badge="Akun"
				actions={
					isEditing ? (
						<div className="flex flex-wrap gap-2">
							<button
								type="button"
								className="btn btn-sm btn-ghost"
								onClick={cancelEdit}
							>
								<X className="h-4 w-4" />
								Batal
							</button>
							<button
								type="button"
								className="btn btn-sm btn-primary"
								onClick={saveProfile}
							>
								<Save className="h-4 w-4" />
								Simpan Profil
							</button>
						</div>
					) : (
						<button
							type="button"
							className="btn btn-sm btn-primary"
							onClick={startEdit}
						>
							<Edit3 className="h-4 w-4" />
							Edit Profil
						</button>
					)
				}
			/>

			<section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
				<article className="border-base-300 bg-base-200/50 rounded-xl border p-5 xl:col-span-1">
					<div className="flex items-start gap-4">
						<div className="avatar placeholder">
							<div className="bg-primary/15 text-primary flex h-16 w-16 items-center justify-center rounded-xl">
								<span className="text-lg font-bold">
									{profileView.fullName.charAt(0)}
								</span>
							</div>
						</div>
						<div>
							<h2 className="text-lg font-semibold">
								{profileView.fullName}
							</h2>
							<p className="text-base-content/70 text-sm">
								{profileView.position}
							</p>
							<p className="text-base-content/70 text-sm">
								{profileView.unit}
							</p>
						</div>
					</div>

					<div className="mt-4 space-y-2">
						<div className="border-base-300 bg-base-100 flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
							<span className="text-base-content/70">
								Status Akun
							</span>
							<span className="badge badge-success gap-1">
								<CheckCircle2 className="h-3.5 w-3.5" />
								Aktif
							</span>
						</div>
						<div className="border-base-300 bg-base-100 flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
							<span className="text-base-content/70">Role</span>
							<span className="badge badge-info gap-1">
								<ShieldCheck className="h-3.5 w-3.5" />
								Editor
							</span>
						</div>
						<div className="border-base-300 bg-base-100 flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
							<span className="text-base-content/70">
								Login Terakhir
							</span>
							<span className="font-medium">
								{formatDateTime(profileView.lastLogin)}
							</span>
						</div>
					</div>
				</article>

				<article className="border-base-300 bg-base-200/50 rounded-xl border p-5 xl:col-span-2">
					<h2 className="text-lg font-semibold">Informasi Akun</h2>
					<div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
						<label className="form-control">
							<span className="label-text text-base-content/70 mb-1 text-sm">
								Nama Lengkap
							</span>
							<label className={inputClass("fullName")}>
								<User className="h-4 w-4 opacity-60" />
								<input
									type="text"
									value={draft.fullName}
									disabled={!isEditing}
									onChange={(event) =>
										setDraft((prev) => ({
											...prev,
											fullName: event.target.value,
										}))
									}
								/>
							</label>
						</label>

						<label className="form-control">
							<span className="label-text text-base-content/70 mb-1 text-sm">
								Email
							</span>
							<label className={inputClass("email")}>
								<Mail className="h-4 w-4 opacity-60" />
								<input
									type="email"
									value={draft.email}
									disabled={!isEditing}
									onChange={(event) =>
										setDraft((prev) => ({
											...prev,
											email: event.target.value,
										}))
									}
								/>
							</label>
						</label>

						<label className="form-control">
							<span className="label-text text-base-content/70 mb-1 text-sm">
								No. Telepon
							</span>
							<label className="input input-bordered w-full">
								<Phone className="h-4 w-4 opacity-60" />
								<input
									type="text"
									value={draft.phone}
									disabled={!isEditing}
									onChange={(event) =>
										setDraft((prev) => ({
											...prev,
											phone: event.target.value,
										}))
									}
								/>
							</label>
						</label>

						<label className="form-control">
							<span className="label-text text-base-content/70 mb-1 text-sm">
								Lokasi
							</span>
							<label className="input input-bordered w-full">
								<MapPin className="h-4 w-4 opacity-60" />
								<input
									type="text"
									value={draft.location}
									disabled={!isEditing}
									onChange={(event) =>
										setDraft((prev) => ({
											...prev,
											location: event.target.value,
										}))
									}
								/>
							</label>
						</label>

						<label className="form-control">
							<span className="label-text text-base-content/70 mb-1 text-sm">
								Unit Kerja
							</span>
							<input
								className="input input-bordered w-full"
								type="text"
								value={draft.unit}
								disabled={!isEditing}
								onChange={(event) =>
									setDraft((prev) => ({
										...prev,
										unit: event.target.value,
									}))
								}
							/>
						</label>

						<label className="form-control">
							<span className="label-text text-base-content/70 mb-1 text-sm">
								Jabatan
							</span>
							<input
								className="input input-bordered w-full"
								type="text"
								value={draft.position}
								disabled={!isEditing}
								onChange={(event) =>
									setDraft((prev) => ({
										...prev,
										position: event.target.value,
									}))
								}
							/>
						</label>

						<label className="form-control md:col-span-2">
							<span className="label-text text-base-content/70 mb-1 text-sm">
								Bio Singkat
							</span>
							<textarea
								className="textarea textarea-bordered min-h-24 w-full"
								value={draft.bio}
								disabled={!isEditing}
								onChange={(event) =>
									setDraft((prev) => ({
										...prev,
										bio: event.target.value,
									}))
								}
							/>
						</label>
					</div>

					{isEditing && !validation.isValid && (
						<p className="text-error mt-3 text-sm">
							{validation.errors[0]}
						</p>
					)}
				</article>
			</section>

			<section className="border-base-300 bg-base-200/50 rounded-xl border p-6">
				<h2 className="mb-4 text-xl font-semibold">
					Aktivitas Terbaru
				</h2>
				{isActivitiesLoading ? (
					<ul className="space-y-3">
						{Array.from({ length: 3 }).map((_, index) => (
							<li
								key={`activity-skeleton-${index}`}
								className="border-base-300 bg-base-100 flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm"
							>
								<div className="flex items-center gap-2">
									<div className="skeleton h-4 w-4 rounded" />
									<div className="skeleton h-4 w-56 rounded" />
								</div>
								<div className="skeleton h-3 w-20 rounded" />
							</li>
						))}
					</ul>
				) : activitiesError ? (
					<PageState
						variant="error"
						title="Aktivitas belum bisa ditampilkan"
						description={activitiesError}
						className="grid min-h-[180px] place-content-center"
					/>
				) : recentActivities.length === 0 ? (
					<PageState
						variant="empty"
						title="Belum ada aktivitas"
						description="Aktivitas akan muncul setelah ada login atau perubahan data industri."
						className="grid min-h-[180px] place-content-center"
					/>
				) : (
					<ul className="space-y-3">
						{recentActivities.map((activity) => {
							const Icon = getActivityIcon(activity.iconKey);
							return (
								<li
									key={activity.id}
									className="border-base-300 bg-base-100 flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm"
								>
									<div className="flex items-center gap-2">
										<Icon className="text-primary h-4 w-4" />
										<span>{activity.label}</span>
									</div>
									<span className="text-base-content/60 inline-flex items-center gap-1">
										<Clock3 className="h-3.5 w-3.5" />
										{formatRelativeTime(activity.timestamp)}
									</span>
								</li>
							);
						})}
					</ul>
				)}
			</section>
		</PageShell>
	);
}

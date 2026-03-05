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

import PageHeader from "@/components/layout/PageHeader";
import PageShell from "@/components/layout/PageShell";
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

export default function ProfilePage() {
  const router = useRouter();
  const { showAlert } = useTimedAlert();
  const { data: session, isPending } = authClient.useSession();
  const [profile, setProfile] = useState<UserProfile>(() => readStoredProfile() ?? buildDefaultProfile());
  const [draft, setDraft] = useState<UserProfile>(() => readStoredProfile() ?? buildDefaultProfile());
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/login");
    }
  }, [isPending, router, session]);

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
        <div className="rounded-xl border border-base-300 bg-base-200/50 p-6 text-sm text-base-content/70">
          Memuat profil...
        </div>
      </PageShell>
    );
  }

  const recentActivities = [
    {
      label: "Memperbarui preferensi akun",
      when: "Hari ini",
      icon: Edit3,
    },
    {
      label: "Membuka modul Data Industri",
      when: "Kemarin",
      icon: Briefcase,
    },
    {
      label: "Meninjau peta industri wilayah",
      when: "2 hari lalu",
      icon: MapPin,
    },
  ];

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
        description: validation.errors[0] ?? "Periksa kembali data profil.",
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
              <button type="button" className="btn btn-sm btn-ghost" onClick={cancelEdit}>
                <X className="h-4 w-4" />
                Batal
              </button>
              <button type="button" className="btn btn-sm btn-primary" onClick={saveProfile}>
                <Save className="h-4 w-4" />
                Simpan Profil
              </button>
            </div>
          ) : (
            <button type="button" className="btn btn-sm btn-primary" onClick={startEdit}>
              <Edit3 className="h-4 w-4" />
              Edit Profil
            </button>
          )
        }
      />

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <article className="rounded-xl border border-base-300 bg-base-200/50 p-5 xl:col-span-1">
          <div className="flex items-start gap-4">
              <div className="avatar placeholder">
                <div className="h-16 w-16 rounded-xl bg-primary/15 text-primary">
                  <span className="text-lg font-semibold">{profileView.fullName.charAt(0)}</span>
                </div>
              </div>
              <div>
                <h2 className="text-lg font-semibold">{profileView.fullName}</h2>
                <p className="text-sm text-base-content/70">{profileView.position}</p>
                <p className="text-sm text-base-content/70">{profileView.unit}</p>
              </div>
            </div>

          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between rounded-lg border border-base-300 bg-base-100 px-3 py-2 text-sm">
              <span className="text-base-content/70">Status Akun</span>
              <span className="badge badge-success gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Aktif
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-base-300 bg-base-100 px-3 py-2 text-sm">
              <span className="text-base-content/70">Role</span>
              <span className="badge badge-info gap-1">
                <ShieldCheck className="h-3.5 w-3.5" />
                Editor
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-base-300 bg-base-100 px-3 py-2 text-sm">
              <span className="text-base-content/70">Login Terakhir</span>
              <span className="font-medium">{formatDateTime(profileView.lastLogin)}</span>
            </div>
          </div>
        </article>

        <article className="rounded-xl border border-base-300 bg-base-200/50 p-5 xl:col-span-2">
          <h2 className="text-lg font-semibold">Informasi Akun</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="form-control">
              <span className="label-text mb-1 text-sm text-base-content/70">Nama Lengkap</span>
              <label className={inputClass("fullName")}>
                <User className="h-4 w-4 opacity-60" />
                <input
                  type="text"
                  value={draft.fullName}
                  disabled={!isEditing}
                  onChange={(event) => setDraft((prev) => ({ ...prev, fullName: event.target.value }))}
                />
              </label>
            </label>

            <label className="form-control">
              <span className="label-text mb-1 text-sm text-base-content/70">Email</span>
              <label className={inputClass("email")}>
                <Mail className="h-4 w-4 opacity-60" />
                <input
                  type="email"
                  value={draft.email}
                  disabled={!isEditing}
                  onChange={(event) => setDraft((prev) => ({ ...prev, email: event.target.value }))}
                />
              </label>
            </label>

            <label className="form-control">
              <span className="label-text mb-1 text-sm text-base-content/70">No. Telepon</span>
              <label className="input input-bordered w-full">
                <Phone className="h-4 w-4 opacity-60" />
                <input
                  type="text"
                  value={draft.phone}
                  disabled={!isEditing}
                  onChange={(event) => setDraft((prev) => ({ ...prev, phone: event.target.value }))}
                />
              </label>
            </label>

            <label className="form-control">
              <span className="label-text mb-1 text-sm text-base-content/70">Lokasi</span>
              <label className="input input-bordered w-full">
                <MapPin className="h-4 w-4 opacity-60" />
                <input
                  type="text"
                  value={draft.location}
                  disabled={!isEditing}
                  onChange={(event) => setDraft((prev) => ({ ...prev, location: event.target.value }))}
                />
              </label>
            </label>

            <label className="form-control">
              <span className="label-text mb-1 text-sm text-base-content/70">Unit Kerja</span>
              <input
                className="input input-bordered w-full"
                type="text"
                value={draft.unit}
                disabled={!isEditing}
                onChange={(event) => setDraft((prev) => ({ ...prev, unit: event.target.value }))}
              />
            </label>

            <label className="form-control">
              <span className="label-text mb-1 text-sm text-base-content/70">Jabatan</span>
              <input
                className="input input-bordered w-full"
                type="text"
                value={draft.position}
                disabled={!isEditing}
                onChange={(event) => setDraft((prev) => ({ ...prev, position: event.target.value }))}
              />
            </label>

            <label className="form-control md:col-span-2">
              <span className="label-text mb-1 text-sm text-base-content/70">Bio Singkat</span>
              <textarea
                className="textarea textarea-bordered min-h-24 w-full"
                value={draft.bio}
                disabled={!isEditing}
                onChange={(event) => setDraft((prev) => ({ ...prev, bio: event.target.value }))}
              />
            </label>
          </div>

          {isEditing && !validation.isValid && (
            <p className="mt-3 text-sm text-error">{validation.errors[0]}</p>
          )}
        </article>
      </section>

      <section className="rounded-xl border border-base-300 bg-base-200/50 p-6">
        <h2 className="mb-4 text-xl font-semibold">Aktivitas Terbaru</h2>
        <ul className="space-y-3">
          {recentActivities.map((activity) => {
            const Icon = activity.icon;
            return (
              <li key={activity.label} className="flex items-center justify-between gap-3 rounded-lg border border-base-300 bg-base-100 px-4 py-3 text-sm">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-primary" />
                  <span>{activity.label}</span>
                </div>
                <span className="inline-flex items-center gap-1 text-base-content/60">
                  <Clock3 className="h-3.5 w-3.5" />
                  {activity.when}
                </span>
              </li>
            );
          })}
        </ul>
      </section>
    </PageShell>
  );
}

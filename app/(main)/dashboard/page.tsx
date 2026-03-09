import { Activity, BarChart3, Clock3, MapPinned, ShieldCheck } from "lucide-react";

import PageHeader from "@/components/layout/PageHeader";
import PageShell from "@/components/layout/PageShell";
import PageState from "@/components/layout/PageState";
import { getDashboardSummary } from "@/lib/dashboard";

export const dynamic = "force-dynamic";

function formatCount(value: number) {
  return value.toLocaleString("id-ID");
}

function parseUpdatedAt(value: string) {
  const iso = value.includes("T") ? value : value.replace(" ", "T");
  const withTimezone = iso.endsWith("Z") ? iso : `${iso}Z`;
  const parsed = new Date(withTimezone);
  if (Number.isNaN(parsed.getTime())) return new Date(iso);
  return parsed;
}

function formatRelativeTime(value: string) {
  const date = parseUpdatedAt(value);
  const deltaMs = Date.now() - date.getTime();
  if (!Number.isFinite(deltaMs) || deltaMs < 0) return "Baru diperbarui";

  const minutes = Math.floor(deltaMs / 60000);
  if (minutes < 1) return "Baru diperbarui";
  if (minutes < 60) return `${minutes} menit lalu`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;

  const days = Math.floor(hours / 24);
  return `${days} hari lalu`;
}

export default async function DashboardPage() {
  let summary: Awaited<ReturnType<typeof getDashboardSummary>> | null = null;

  try {
    summary = await getDashboardSummary();
  } catch {
    summary = null;
  }

  if (!summary) {
    return (
      <PageShell width="4xl" className="space-y-6">
        <PageHeader
          title="Dashboard"
          description="Ringkasan kondisi data industri berdasarkan data aktual sistem."
          badge="Monitoring"
        />
        <PageState
          variant="error"
          title="Dashboard belum bisa ditampilkan"
          description="Terjadi kendala saat memuat ringkasan data industri."
          className="min-h-[320px] grid place-content-center"
        />
      </PageShell>
    );
  }

  const platformEntries = Object.entries(summary.platformCounts);
  const stats = [
    {
      label: "Total Data Industri",
      value: formatCount(summary.totalRecords),
      helper: "Seluruh entitas dari sumber data aktif",
      icon: BarChart3,
      tone: "text-primary",
    },
    {
      label: "Dalam Karanganyar",
      value: formatCount(summary.insideKaranganyarCount),
      helper: "Titik berada dalam cakupan wilayah",
      icon: MapPinned,
      tone: "text-secondary",
    },
    {
      label: "Update 24 Jam",
      value: formatCount(summary.updatedLast24HoursCount),
      helper: "Data yang diperbarui dalam 24 jam terakhir",
      icon: Clock3,
      tone: "text-accent",
    },
    {
      label: "Di Luar Karanganyar",
      value: formatCount(summary.outsideKaranganyarCount),
      helper: "Perlu validasi lokasi lanjutan",
      icon: ShieldCheck,
      tone: "text-warning",
    },
  ];

  return (
    <PageShell width="4xl" className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Ringkasan kondisi data industri berdasarkan data aktual sistem."
        badge="Monitoring"
      />

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.label} className="rounded-xl border border-base-300 bg-base-200/50 p-5">
              <div className="flex items-start justify-between">
                <p className="text-sm text-base-content/70">{item.label}</p>
                <Icon className={`h-5 w-5 ${item.tone}`} />
              </div>
              <p className="mt-2 text-3xl font-bold">{item.value}</p>
              <p className="mt-2 text-xs text-base-content/60">{item.helper}</p>
            </article>
          );
        })}
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <article className="rounded-xl border border-base-300 bg-base-200/50 p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <BarChart3 className="h-5 w-5 text-primary" />
            Distribusi Platform
          </h2>
          {summary.totalRecords === 0 ? (
            <PageState
              variant="empty"
              title="Belum ada data distribusi"
              description="Bagian distribusi platform akan tampil setelah data industri tersedia."
              className="min-h-[220px] grid place-content-center"
            />
          ) : (
            <div className="space-y-4 rounded-lg border border-base-300 bg-base-100 p-4">
              {platformEntries.map(([platform, count]) => {
                const percentage = summary.totalRecords === 0 ? 0 : (count / summary.totalRecords) * 100;
                return (
                  <div key={platform} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <p className="font-medium">{platform}</p>
                      <p className="text-base-content/70">
                        {formatCount(count)} ({percentage.toFixed(1)}%)
                      </p>
                    </div>
                    <progress
                      className="progress progress-primary h-2 w-full"
                      value={count}
                      max={Math.max(summary.totalRecords, 1)}
                    />
                  </div>
                );
              })}

              <div className="divider my-2" />

              <div className="flex flex-wrap gap-2 text-xs">
                <span className="badge badge-success">Aktif: {formatCount(summary.statusCounts.Aktif)}</span>
                <span className="badge badge-info">Verifikasi: {formatCount(summary.statusCounts.Verifikasi)}</span>
                <span className="badge badge-ghost">Draft: {formatCount(summary.statusCounts.Draft)}</span>
              </div>
            </div>
          )}
        </article>

        <article className="rounded-xl border border-base-300 bg-base-200/50 p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <Activity className="h-5 w-5 text-secondary" />
            Aktivitas Terbaru
          </h2>
          {summary.recentActivities.length === 0 ? (
            <PageState
              variant="empty"
              title="Belum ada aktivitas terbaru"
              description="Aktivitas akan muncul setelah data industri diperbarui."
              className="min-h-[220px] grid place-content-center"
            />
          ) : (
            <ul className="space-y-3">
              {summary.recentActivities.map((item) => (
                <li key={item.id} className="rounded-lg border border-base-300 bg-base-100 px-4 py-3">
                  <p className="text-sm font-semibold">{item.namaUsaha}</p>
                  <p className="mt-1 text-xs text-base-content/70">
                    {item.platform} - {item.kecamatanNama}, {item.desaNama}
                  </p>
                  <p className="mt-1 text-xs text-base-content/60">{formatRelativeTime(item.updatedAt)}</p>
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>
    </PageShell>
  );
}

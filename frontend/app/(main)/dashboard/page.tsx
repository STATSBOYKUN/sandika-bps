import { Activity, BarChart3, Clock3, ServerCog, ShieldCheck, Workflow } from "lucide-react";

import PageHeader from "@/components/layout/PageHeader";
import PageShell from "@/components/layout/PageShell";

const stats = [
  { label: "Sinkronisasi Data", value: "98.6%", icon: Workflow, tone: "text-primary" },
  { label: "Modul Aktif", value: "12", icon: ServerCog, tone: "text-secondary" },
  { label: "Validasi Harian", value: "1,284", icon: ShieldCheck, tone: "text-accent" },
  { label: "Antrian Proses", value: "27", icon: Clock3, tone: "text-warning" },
];

export default function DashboardPage() {
  return (
    <PageShell width="4xl" className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Ringkasan performa sistem dan indikator operasional (dummy)."
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
            </article>
          );
        })}
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <article className="rounded-xl border border-base-300 bg-base-200/50 p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <BarChart3 className="h-5 w-5 text-primary" />
            Tren Aktivitas (Dummy)
          </h2>
          <div className="h-56 rounded-lg border border-base-300 bg-base-100 p-4">
            <div className="h-full w-full bg-[linear-gradient(rgba(148,163,184,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.18)_1px,transparent_1px)] bg-[size:24px_24px]" />
          </div>
        </article>

        <article className="rounded-xl border border-base-300 bg-base-200/50 p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <Activity className="h-5 w-5 text-secondary" />
            Aktivitas Terbaru (Dummy)
          </h2>
          <ul className="space-y-3">
            <li className="rounded-lg border border-base-300 bg-base-100 px-4 py-3 text-sm">Data Industri diperbarui oleh admin wilayah Jawa Barat.</li>
            <li className="rounded-lg border border-base-300 bg-base-100 px-4 py-3 text-sm">Validasi metadata peta selesai untuk 4 provinsi.</li>
            <li className="rounded-lg border border-base-300 bg-base-100 px-4 py-3 text-sm">Permintaan bantuan baru masuk ke helpdesk internal.</li>
          </ul>
        </article>
      </section>
    </PageShell>
  );
}

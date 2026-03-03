import { BookOpen, CircleCheckBig, FileText, Lightbulb, Workflow } from "lucide-react";

import PageHeader from "@/components/layout/PageHeader";
import PageShell from "@/components/layout/PageShell";

const guides = [
  {
    title: "Mulai dari Dashboard",
    desc: "Pahami indikator ringkas sebelum masuk ke modul data dan peta.",
    icon: Workflow,
  },
  {
    title: "Kelola Data Industri",
    desc: "Perbarui entitas, cek status validasi, dan pastikan kelengkapan metadata.",
    icon: FileText,
  },
  {
    title: "Analisis Peta Industri",
    desc: "Gunakan layer dan filter wilayah untuk memantau persebaran sektor digital.",
    icon: BookOpen,
  },
  {
    title: "Laporkan Kendala",
    desc: "Buat tiket bantuan jika menemukan isu data atau kendala penggunaan sistem.",
    icon: Lightbulb,
  },
];

export default function PanduanPage() {
  return (
    <PageShell width="4xl" className="space-y-6">
      <PageHeader
        title="Panduan"
        description="Halaman panduan dummy untuk alur penggunaan platform industri digital."
        badge="Dokumentasi"
      />

      <section className="rounded-xl border border-base-300 bg-base-200/50 p-6">
        <h2 className="mb-4 text-xl font-semibold">Langkah Utama</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {guides.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className="rounded-lg border border-base-300 bg-base-100 p-5">
                <div className="mb-2 flex items-center gap-2">
                  <Icon className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">{item.title}</h3>
                </div>
                <p className="text-sm text-base-content/70">{item.desc}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="rounded-xl border border-base-300 bg-base-200/50 p-6">
        <h2 className="mb-4 text-xl font-semibold">Checklist Dummy</h2>
        <ul className="space-y-3">
          <li className="flex items-center gap-2 rounded-lg border border-base-300 bg-base-100 px-4 py-3 text-sm">
            <CircleCheckBig className="h-4 w-4 text-success" />
            Cek konfigurasi tema dan akses akun.
          </li>
          <li className="flex items-center gap-2 rounded-lg border border-base-300 bg-base-100 px-4 py-3 text-sm">
            <CircleCheckBig className="h-4 w-4 text-success" />
            Verifikasi data utama sebelum dipublikasikan.
          </li>
          <li className="flex items-center gap-2 rounded-lg border border-base-300 bg-base-100 px-4 py-3 text-sm">
            <CircleCheckBig className="h-4 w-4 text-success" />
            Gunakan helpdesk untuk pelaporan kendala.
          </li>
        </ul>
      </section>
    </PageShell>
  );
}

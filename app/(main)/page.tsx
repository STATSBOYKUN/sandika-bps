import Link from "next/link";
import {
	BookOpen,
	ChevronRight,
	CircleHelp,
	Database,
	LayoutDashboard,
	MapPinned,
} from "lucide-react";

import PageHeader from "@/components/layout/PageHeader";
import PageShell from "@/components/layout/PageShell";

const menuItems = [
	{
		title: "Dashboard",
		description: "Ringkasan sistem dan status operasional.",
		href: "/dashboard",
		icon: LayoutDashboard,
	},
	{
		title: "Data Industri",
		description: "Kelola entitas industri digital berbasis tabel.",
		href: "/data-industri",
		icon: Database,
	},
	{
		title: "Peta Industri",
		description: "Lihat persebaran industri digital pada peta.",
		href: "/peta-industri",
		icon: MapPinned,
	},
	{
		title: "Panduan",
		description: "Baca alur kerja dan petunjuk penggunaan sistem.",
		href: "/panduan",
		icon: BookOpen,
	},
	{
		title: "Bantuan",
		description: "Akses bantuan umum dan dukungan operasional.",
		href: "/help",
		icon: CircleHelp,
	},
];

export default function HomePage() {
	return (
		<PageShell width="4xl" className="space-y-6">
			<PageHeader
				title="Portal Industri Digital"
				description="Akses cepat untuk membuka halaman utama yang tersedia."
				badge="Beranda"
			/>

			<section className="border-base-300 bg-base-200/50 rounded-xl border p-6">
				<h2 className="mb-4 text-xl font-semibold">Menu Utama</h2>
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					{menuItems.map((item) => {
						const Icon = item.icon;

						return (
							<Link
								key={item.title}
								href={item.href}
								className="card border-base-300 bg-base-100 hover:border-primary border transition hover:shadow-md"
							>
								<div className="card-body p-5">
									<div className="flex items-start justify-between gap-3">
										<span className="bg-primary/15 text-primary inline-flex h-10 w-10 items-center justify-center rounded-md">
											<Icon className="h-5 w-5" />
										</span>
									</div>
									<h3 className="mt-1 text-lg font-semibold">
										{item.title}
									</h3>
									<p className="text-base-content/70 text-sm">
										{item.description}
									</p>
									<div className="text-primary mt-2 flex items-center gap-1 text-sm font-medium">
										Buka halaman
										<ChevronRight className="h-4 w-4" />
									</div>
								</div>
							</Link>
						);
					})}
				</div>
			</section>
		</PageShell>
	);
}

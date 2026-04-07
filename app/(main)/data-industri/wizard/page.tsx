"use client";

import { useState } from "react";
import { Download, Upload } from "lucide-react";

import ExportWizard from "@/components/data-industri/wizard/ExportWizard";
import ImportWizard from "@/components/data-industri/wizard/ImportWizard";
import PageHeader from "@/components/layout/PageHeader";
import PageShell from "@/components/layout/PageShell";

type WizardMode = "select" | "export" | "import";

export default function DataIndustriWizardPage() {
	const [mode, setMode] = useState<WizardMode>("select");

	return (
		<PageShell width="4xl" className="space-y-6">
			<PageHeader
				title="Wizard Import/Export"
				description="Kelola data industri secara massal dengan alur preview sebelum import dan pengaturan export yang fleksibel."
				badge="Data Industri"
			/>

			<div className="border-base-300 bg-base-200/60 rounded-xl border p-5 md:p-6">
				{mode === "select" ? (
					<div className="space-y-6">
						<p className="text-base-content/60 text-xs font-semibold tracking-wider uppercase">
							Pilih Operasi
						</p>
						<div className="grid gap-4 md:grid-cols-2">
							<button
								type="button"
								onClick={() => setMode("export")}
								className="group border-base-300 bg-base-100 hover:border-primary hover:bg-primary/5 flex h-full flex-col items-center gap-4 rounded-xl border px-6 py-8 text-center transition-all"
							>
								<span className="bg-primary/15 text-primary inline-flex h-14 w-14 items-center justify-center rounded-lg">
									<Download className="h-7 w-7" />
								</span>
								<div>
									<span className="block text-lg font-semibold">
										Export Data
									</span>
									<span className="text-base-content/70 text-sm">
										Export data terfilter ke file XLSX per
										platform.
									</span>
								</div>
							</button>

							<button
								type="button"
								onClick={() => setMode("import")}
								className="group border-base-300 bg-base-100 hover:border-primary hover:bg-primary/5 flex h-full flex-col items-center gap-4 rounded-xl border px-6 py-8 text-center transition-all"
							>
								<span className="bg-primary/15 text-primary inline-flex h-14 w-14 items-center justify-center rounded-lg">
									<Upload className="h-7 w-7" />
								</span>
								<div>
									<span className="block text-lg font-semibold">
										Import Data
									</span>
									<span className="text-base-content/70 text-sm">
										Preview data dulu, atur opsi import,
										lalu konfirmasi.
									</span>
								</div>
							</button>
						</div>
					</div>
				) : null}

				{mode === "export" ? (
					<ExportWizard onBack={() => setMode("select")} />
				) : null}
				{mode === "import" ? (
					<ImportWizard onBack={() => setMode("select")} />
				) : null}
			</div>
		</PageShell>
	);
}

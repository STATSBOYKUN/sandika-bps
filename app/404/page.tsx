import ErrorStatePage from "@/components/layout/ErrorStatePage";

export default function NotFoundDirectPage() {
	return (
		<ErrorStatePage
			statusCode="404"
			title="Halaman tidak ditemukan"
			description="Halaman yang Anda cari tidak tersedia. Periksa kembali URL atau kembali ke beranda."
			iconName="search"
			primaryAction={{ label: "Ke beranda", href: "/", style: "primary" }}
			secondaryAction={{
				label: "Bantuan",
				href: "/help",
				style: "secondary",
			}}
		/>
	);
}

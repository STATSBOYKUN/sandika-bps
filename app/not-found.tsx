import ErrorStatePage from "@/components/layout/ErrorStatePage";

export default function NotFound() {
	return (
		<ErrorStatePage
			statusCode="404"
			title="Halaman tidak ditemukan"
			description="Alamat yang Anda buka tidak tersedia atau sudah dipindahkan."
			iconName="search"
			primaryAction={{
				label: "Ke beranda",
				href: "/",
				style: "primary",
			}}
			secondaryAction={{
				label: "Bantuan",
				href: "/help",
				style: "secondary",
			}}
		/>
	);
}

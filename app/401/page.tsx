import ErrorStatePage from "@/components/layout/ErrorStatePage";

export default function UnauthorizedPage() {
	return (
		<ErrorStatePage
			statusCode="401"
			title="Akses belum terautentikasi"
			description="Anda perlu login terlebih dahulu untuk membuka halaman ini."
			iconName="shield-alert"
			primaryAction={{ label: "Login", href: "/login", style: "primary" }}
			secondaryAction={{
				label: "Ke beranda",
				href: "/",
				style: "secondary",
			}}
		/>
	);
}

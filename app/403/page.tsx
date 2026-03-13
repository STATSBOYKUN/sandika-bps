import ErrorStatePage from "@/components/layout/ErrorStatePage";

export default function ForbiddenPage() {
	return (
		<ErrorStatePage
			statusCode="403"
			title="Akses ditolak"
			description="Anda tidak memiliki izin untuk mengakses halaman ini."
			iconName="shield-x"
			primaryAction={{ label: "Ke beranda", href: "/", style: "primary" }}
			secondaryAction={{
				label: "Bantuan",
				href: "/help",
				style: "secondary",
			}}
		/>
	);
}

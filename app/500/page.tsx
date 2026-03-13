import ErrorStatePage from "@/components/layout/ErrorStatePage";

export default function InternalErrorPage() {
	return (
		<ErrorStatePage
			statusCode="500"
			title="Terjadi kesalahan server"
			description="Layanan sedang mengalami gangguan sementara. Silakan muat ulang beberapa saat lagi."
			iconName="server-crash"
			primaryAction={{ label: "Ke beranda", href: "/", style: "primary" }}
			secondaryAction={{
				label: "Bantuan",
				href: "/help",
				style: "secondary",
			}}
		/>
	);
}

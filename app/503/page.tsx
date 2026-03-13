import ErrorStatePage from "@/components/layout/ErrorStatePage";

export default function MaintenancePage() {
	return (
		<ErrorStatePage
			statusCode="503"
			title="Layanan sedang perawatan"
			description="Kami sedang melakukan pemeliharaan untuk peningkatan sistem. Silakan coba kembali nanti."
			iconName="wrench"
			primaryAction={{ label: "Ke beranda", href: "/", style: "primary" }}
			secondaryAction={{
				label: "Hubungi dukungan",
				href: "/help",
				style: "secondary",
			}}
		/>
	);
}

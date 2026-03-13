"use client";

import { useEffect } from "react";

import ErrorStatePage from "@/components/layout/ErrorStatePage";

export default function GlobalError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<html lang="id" data-theme="winter">
			<body className="font-sans antialiased">
				<ErrorStatePage
					statusCode="500"
					title="Aplikasi sedang mengalami gangguan"
					description="Terjadi kesalahan yang tidak terduga. Tim kami akan menanganinya secepat mungkin."
					iconName="alert-octagon"
					primaryAction={{
						label: "Muat ulang",
						onClick: reset,
						style: "primary",
					}}
					secondaryAction={{
						label: "Hubungi dukungan",
						href: "/help",
						style: "secondary",
					}}
				/>
			</body>
		</html>
	);
}

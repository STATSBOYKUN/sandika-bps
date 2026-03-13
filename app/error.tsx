"use client";

import { useEffect } from "react";

import ErrorStatePage from "@/components/layout/ErrorStatePage";

export default function Error({
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
		<ErrorStatePage
			statusCode="500"
			title="Terjadi kesalahan"
			description="Sistem mengalami kendala sementara. Silakan coba lagi dalam beberapa saat."
			iconName="alert-triangle"
			primaryAction={{
				label: "Coba lagi",
				onClick: reset,
				style: "primary",
			}}
			secondaryAction={{
				label: "Ke beranda",
				href: "/",
				style: "secondary",
			}}
		/>
	);
}

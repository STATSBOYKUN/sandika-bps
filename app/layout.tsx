import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "maplibre-gl/dist/maplibre-gl.css";
import "./globals.css";

import { TimedAlertProvider } from "@/contexts/TimedAlertContext";

const inter = Inter({
	variable: "--font-inter",
	subsets: ["latin"],
	display: "swap",
});

export const metadata: Metadata = {
	title: "SANDIKA",
	description: "Platform untuk data dan peta industri digital",
	icons: {
		icon: "/logo/bps.png",
		shortcut: "/logo/bps.png",
		apple: "/logo/bps.png",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="id" data-theme="winter">
			<body
				className={`${inter.variable} flex min-h-screen flex-col font-sans antialiased`}
			>
				<TimedAlertProvider>{children}</TimedAlertProvider>
			</body>
		</html>
	);
}

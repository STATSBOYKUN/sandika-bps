import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "maplibre-gl/dist/maplibre-gl.css";
import "./globals.css";

const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin"],
    display: "swap",
});

export const metadata: Metadata = {
    title: "SANDIKA",
    description: "Platform untuk data dan peta industri digital",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="id" data-theme="winter">
            <body
                className={`${inter.variable} font-sans antialiased min-h-screen flex flex-col`}
            >
                {children}
            </body>
        </html>
    );
}

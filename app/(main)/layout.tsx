"use client";

import ScrollNavigation from "@/components/ScrollNavigation";

export default function MainLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return <ScrollNavigation>{children}</ScrollNavigation>;
}

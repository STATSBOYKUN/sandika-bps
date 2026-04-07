import {
	ArrowRightLeft,
	BookOpenIcon,
	Database,
	HelpCircleIcon,
	HomeIcon,
	LayoutDashboardIcon,
	MapPinned,
} from "lucide-react";

interface NavigationItem {
	href?: string;
	icon?: React.ElementType;
	label: string;
}

export const navigationItems: NavigationItem[] = [
	{ href: "/", icon: HomeIcon, label: "Beranda" },
	{ href: "/dashboard", icon: LayoutDashboardIcon, label: "Dashboard" },
	{ href: "/data-industri", icon: Database, label: "Data Industri" },
	{
		href: "/data-industri/wizard",
		icon: ArrowRightLeft,
		label: "Wizard Data",
	},
	{ href: "/peta-industri", icon: MapPinned, label: "Peta Industri" },
	{ href: "/panduan", icon: BookOpenIcon, label: "Panduan" },
	{ href: "/help", icon: HelpCircleIcon, label: "Bantuan" },
];

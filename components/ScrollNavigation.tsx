"use client";

import React from "react";
import Link from "next/link";
import { UserIcon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import { AnimatedThemeToggler } from "@/components/animated-theme-toggler";
import { navigationItems } from "@/constant/menu";
import { authClient } from "@/lib/auth-client";

interface ScrollNavigationProps {
    children: React.ReactNode;
}

export default function ScrollNavigation({ children }: ScrollNavigationProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { data: session } = authClient.useSession();
    const [isMounted, setIsMounted] = React.useState(false);
    const [isAtTop, setIsAtTop] = React.useState(true);
    const sectionHeaders: Record<number, string> = {
        0: "Utama",
        2: "Modul",
        4: "Bantuan",
    };

    const isItemActive = (href?: string) => {
        if (!href) return false;
        if (href === "/") return pathname === "/";
        return pathname === href || pathname.startsWith(`${href}/`);
    };

    React.useEffect(() => {
        setIsMounted(true);
    }, []);

    React.useEffect(() => {
        if (typeof window === "undefined") return;
        const handleScroll = () => setIsAtTop(window.scrollY === 0);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const displayName = isMounted
        ? session?.user.name?.trim() || "Pengguna"
        : "Pengguna";
    const avatarInitial = isMounted
        ? displayName.charAt(0).toUpperCase() || "P"
        : "P";

    const handleLogout = async () => {
        await authClient.signOut();
        router.push("/login");
    };

    return (
        <div className="drawer lg:drawer-open">
            <input id="my-drawer" type="checkbox" className="drawer-toggle" />

            <div className="drawer-content flex flex-col">
                <nav
                    className={`navbar sticky top-0 w-full bg-base-300 shadow-sm min-h-14 h-14 ${isAtTop ? "z-50" : "z-10"}`}
                >
                    <div className="navbar-start">
                        <label
                            htmlFor="my-drawer"
                            aria-label="open sidebar"
                            className="btn btn-square btn-ghost"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                strokeLinejoin="round"
                                strokeLinecap="round"
                                strokeWidth="2"
                                fill="none"
                                stroke="currentColor"
                                className="my-1.5 inline-block size-5"
                            >
                                <path d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z" />
                                <path d="M9 4v16" />
                                <path d="M14 10l2 2l-2 2" />
                            </svg>
                        </label>
                    </div>

                    <div className="navbar-center">
                        <Link
                            href="/"
                            className="btn btn-ghost text-lg font-bold tooltip tooltip-right"
                            data-tip="Dashboard industri digital"
                        >
                            SANDIKA
                        </Link>
                    </div>

                    <div className="navbar-end gap-1">
                        <AnimatedThemeToggler />

                        <div className="dropdown dropdown-end">
                            <div
                                tabIndex={0}
                                role="button"
                                className="btn btn-sm btn-ghost btn-circle avatar"
                            >
                                <div className="w-7 rounded-full bg-primary/15 text-primary grid place-items-center text-xs font-semibold">
                                    {avatarInitial}
                                </div>
                            </div>
                            <ul
                                tabIndex={0}
                                className="menu menu-sm dropdown-content bg-base-100 rounded-box z-10 mt-3 w-52 p-2 shadow-lg"
                            >
                                <li className="font-semibold">
                                    <div>
                                        <UserIcon className="inline-block size-4 mr-2" />
                                        {displayName}
                                    </div>
                                </li>
                                <li>
                                    <Link
                                        href="/profile"
                                        className="justify-between"
                                    >
                                        Profile
                                        <span className="badge badge-sm">
                                            New
                                        </span>
                                    </Link>
                                </li>
                                <div className="divider my-0" />
                                <li>
                                    <button
                                        type="button"
                                        className="btn btn-xs btn-secondary"
                                        onClick={handleLogout}
                                    >
                                        Logout
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>
                </nav>

                <main className="flex-1">{children}</main>
            </div>

            <div className="drawer-side z-50 is-drawer-close:overflow-visible">
                <label
                    htmlFor="my-drawer"
                    aria-label="close sidebar"
                    className="drawer-overlay"
                />

                <div className="flex min-h-full flex-col items-start border-r border-base-300 bg-base-200/80 backdrop-blur-sm is-drawer-close:w-14 is-drawer-open:w-64 transition-all duration-200">
                    <div className="w-full px-3 pt-4 pb-2 is-drawer-close:hidden">
                        <p className="text-[11px] uppercase tracking-[0.14em] text-base-content/50">
                            Navigasi
                        </p>
                        <p className="text-sm font-semibold text-base-content/80">
                            SANDIKA
                        </p>
                    </div>

                    <ul className="menu w-full grow gap-1 px-2 py-1">
                        {navigationItems.map((item, index) => {
                            const Icon = item.icon;
                            const isActive = isItemActive(item.href);
                            const sectionLabel = sectionHeaders[index];

                            return (
                                <React.Fragment key={`${item.label}-${index}`}>
                                    {sectionLabel && (
                                        <li className="mt-3 mb-1 is-drawer-close:hidden">
                                            <span className="px-2 text-[10px] font-bold uppercase tracking-widest text-base-content/40">
                                                {sectionLabel}
                                            </span>
                                        </li>
                                    )}
                                    <li>
                                        <Link
                                            href={item.href || "#"}
                                            className={`group is-drawer-close:tooltip is-drawer-close:tooltip-right mx-1 flex items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/30 is-drawer-close:mx-0 is-drawer-close:w-full is-drawer-close:justify-center is-drawer-close:gap-0 is-drawer-close:px-0 is-drawer-close:pl-0 ${
                                                isActive
                                                    ? "border-l-[3px] border-primary bg-primary/10 text-primary is-drawer-close:border-l-0"
                                                    : "text-base-content/70 hover:bg-base-300/55 hover:text-base-content"
                                            } ${isActive ? "pl-[10px]" : "pl-3"}`}
                                            data-tip={item.label}
                                        >
                                            {Icon && (
                                                <span
                                                    className={`inline-flex size-8 shrink-0 items-center justify-center rounded-md transition-colors is-drawer-close:mx-auto is-drawer-close:size-7 ${
                                                        isActive
                                                            ? "bg-primary/15 text-primary"
                                                            : "text-base-content/55 group-hover:bg-base-100/70 group-hover:text-base-content/90"
                                                    }`}
                                                >
                                                    <Icon className="inline-block size-[18px]" />
                                                </span>
                                            )}
                                            <span className="is-drawer-close:hidden">
                                                {item.label}
                                            </span>
                                        </Link>
                                    </li>
                                </React.Fragment>
                            );
                        })}
                    </ul>
                </div>
            </div>
        </div>
    );
}

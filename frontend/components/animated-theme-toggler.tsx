"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";

import { cn } from "@/lib/utils";

interface AnimatedThemeTogglerProps extends React.ComponentPropsWithoutRef<"div"> {
    duration?: number;
}

const themes = [
    { name: "winter", label: "winter" },
    { name: "sunset", label: "sunset" },
    { name: "lemonade", label: "lemonade" },
    { name: "forest", label: "forest" },
    { name: "caramellatte", label: "caramellatte" },
    { name: "coffee", label: "coffee" },
];

export const AnimatedThemeToggler = ({
    className,
    duration = 400,
    ...props
}: AnimatedThemeTogglerProps) => {
    const [theme, setTheme] = useState<string>(() => {
        if (typeof document !== "undefined") {
            return document.documentElement.getAttribute("data-theme") || "winter";
        }
        return "winter";
    });
    const buttonRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const savedTheme = localStorage.getItem("theme") || "winter";
        document.documentElement.setAttribute("data-theme", savedTheme);

        const updateTheme = () => {
            const currentTheme =
                document.documentElement.getAttribute("data-theme") || savedTheme;
            setTheme(currentTheme);
        };

        const observer = new MutationObserver(updateTheme);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["data-theme"],
        });

        return () => observer.disconnect();
    }, []);

    const changeTheme = useCallback(
        async (newTheme: string) => {
            if (!buttonRef.current) return;

            if (document.startViewTransition) {
                await document.startViewTransition(() => {
                    flushSync(() => {
                        setTheme(newTheme);
                        document.documentElement.setAttribute(
                            "data-theme",
                            newTheme,
                        );
                        localStorage.setItem("theme", newTheme);
                    });
                }).ready;

                const { top, left, width, height } =
                    buttonRef.current.getBoundingClientRect();
                const x = left + width / 2;
                const y = top + height / 2;
                const maxRadius = Math.hypot(
                    Math.max(left, window.innerWidth - left),
                    Math.max(top, window.innerHeight - top),
                );

                document.documentElement.animate(
                    {
                        clipPath: [
                            `circle(0px at ${x}px ${y}px)`,
                            `circle(${maxRadius}px at ${x}px ${y}px)`,
                        ],
                    },
                    {
                        duration,
                        easing: "ease-in-out",
                        pseudoElement: "::view-transition-new(root)",
                    },
                );
            } else {
                // Fallback for browsers that don't support View Transitions
                setTheme(newTheme);
                document.documentElement.setAttribute("data-theme", newTheme);
                localStorage.setItem("theme", newTheme);
            }
        },
        [duration],
    );

    return (
        <div
            ref={buttonRef}
            className={cn("dropdown dropdown-end", className)}
            {...props}
        >
            <div
                tabIndex={0}
                role="button"
                className="btn btn-sm btn-ghost gap-1.5 px-2"
                aria-label="Change Theme"
            >
                <div className="bg-base-100 group-hover:border-base-content/20 border-base-content/10 grid shrink-0 grid-cols-2 gap-0.5 rounded-md border p-1 transition-colors">
                    <div className="bg-base-content size-1 rounded-full"></div>
                    <div className="bg-primary size-1 rounded-full"></div>
                    <div className="bg-secondary size-1 rounded-full"></div>
                    <div className="bg-accent size-1 rounded-full"></div>
                </div>
                <span className="text-xs font-medium hidden sm:inline-block">
                    Themes
                </span>
                <svg
                    width="12px"
                    height="12px"
                    className="mt-px size-2 fill-current opacity-60"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 2048 2048"
                >
                    <path d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z"></path>
                </svg>
            </div>
            <div
                tabIndex={0}
                className="dropdown-content bg-base-200 text-base-content rounded-box top-px max-h-96 w-52 overflow-y-auto border border-white/5 shadow-2xl mt-4 z-1"
            >
                <ul className="menu p-2">
                    <li className="menu-title text-xs">Theme</li>
                    {themes.map((t) => (
                        <li key={t.name}>
                            <button
                                className="gap-4 px-3"
                                onClick={() => changeTheme(t.name)}
                            >
                                <div
                                    data-theme={t.name}
                                    className="bg-base-100 grid shrink-0 grid-cols-2 gap-0.5 rounded-md p-1 shadow-sm"
                                >
                                    <div className="bg-base-content size-1 rounded-full"></div>
                                    <div className="bg-primary size-1 rounded-full"></div>
                                    <div className="bg-secondary size-1 rounded-full"></div>
                                    <div className="bg-accent size-1 rounded-full"></div>
                                </div>
                                <div className="flex-1 text-left truncate">
                                    {t.label}
                                </div>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    className={`h-3 w-3 shrink-0 ${theme === t.name ? "visible" : "invisible"}`}
                                >
                                    <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z"></path>
                                </svg>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

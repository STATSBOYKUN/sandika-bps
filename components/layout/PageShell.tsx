import type { ReactNode } from "react";

type PageShellWidth =
	| "md"
	| "lg"
	| "xl"
	| "2xl"
	| "4xl"
	| "5xl"
	| "6xl"
	| "7xl";

interface PageShellProps {
	children: ReactNode;
	width?: PageShellWidth;
	className?: string;
}

const widthClassMap: Record<PageShellWidth, string> = {
	md: "max-w-3xl",
	lg: "max-w-4xl",
	xl: "max-w-5xl",
	"2xl": "max-w-6xl",
	"4xl": "max-w-7xl",
	"5xl": "max-w-[80rem]",
	"6xl": "max-w-[88rem]",
	"7xl": "max-w-[96rem]",
};

export default function PageShell({
	children,
	width = "xl",
	className = "",
}: PageShellProps) {
	return (
		<div className="bg-base-100 min-h-full">
			<div
				className={`mx-auto w-full px-4 py-5 md:px-6 md:py-6 ${widthClassMap[width]} ${className}`.trim()}
			>
				{children}
			</div>
		</div>
	);
}

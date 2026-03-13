"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
	AlertOctagon,
	AlertTriangle,
	ArrowLeft,
	House,
	SearchX,
	ServerCrash,
	ShieldAlert,
	ShieldX,
	Wrench,
} from "lucide-react";

type ErrorAction = {
	label: string;
	href?: string;
	onClick?: () => void;
	style?: "primary" | "secondary" | "ghost";
};

interface ErrorStatePageProps {
	statusCode: string;
	title: string;
	description: string;
	iconName:
		| "search"
		| "shield-alert"
		| "shield-x"
		| "server-crash"
		| "wrench"
		| "alert-triangle"
		| "alert-octagon";
	primaryAction?: ErrorAction;
	secondaryAction?: ErrorAction;
	showBackButton?: boolean;
}

const styleClassMap: Record<NonNullable<ErrorAction["style"]>, string> = {
	primary: "btn btn-primary",
	secondary: "btn btn-outline",
	ghost: "btn btn-ghost",
};

const iconMap = {
	search: SearchX,
	"shield-alert": ShieldAlert,
	"shield-x": ShieldX,
	"server-crash": ServerCrash,
	wrench: Wrench,
	"alert-triangle": AlertTriangle,
	"alert-octagon": AlertOctagon,
};

function ActionButton({ action }: { action: ErrorAction }) {
	const style = action.style ?? "secondary";
	const className = `${styleClassMap[style]} rounded-xl`;

	if (action.href) {
		return (
			<Link href={action.href} className={className}>
				{action.label}
			</Link>
		);
	}

	return (
		<button type="button" className={className} onClick={action.onClick}>
			{action.label}
		</button>
	);
}

export default function ErrorStatePage({
	statusCode,
	title,
	description,
	iconName,
	primaryAction,
	secondaryAction,
	showBackButton = true,
}: ErrorStatePageProps) {
	const router = useRouter();
	const Icon = iconMap[iconName];

	return (
		<main className="bg-base-100 flex min-h-screen items-center justify-center px-4 py-8">
			<section className="border-base-300 bg-base-200/40 w-full max-w-2xl rounded-3xl border p-6 shadow-sm backdrop-blur-sm md:p-8">
				<div className="mb-5 flex items-center gap-3">
					<div className="bg-primary/10 text-primary rounded-xl p-3">
						<Icon className="size-6" />
					</div>
					<p className="text-base-content/55 text-sm font-semibold tracking-[0.22em] uppercase">
						Error {statusCode}
					</p>
				</div>

				<h1 className="text-base-content text-2xl leading-tight font-bold md:text-3xl">
					{title}
				</h1>
				<p className="text-base-content/70 mt-3 max-w-xl text-sm leading-relaxed md:text-base">
					{description}
				</p>

				<div className="mt-7 flex flex-wrap items-center gap-3">
					{primaryAction ? (
						<ActionButton action={primaryAction} />
					) : (
						<Link href="/" className="btn btn-primary rounded-xl">
							<House className="size-4" />
							Ke beranda
						</Link>
					)}

					{secondaryAction && (
						<ActionButton action={secondaryAction} />
					)}

					{showBackButton && (
						<button
							type="button"
							className="btn btn-ghost rounded-xl"
							onClick={() => router.back()}
						>
							<ArrowLeft className="size-4" />
							Kembali
						</button>
					)}
				</div>
			</section>
		</main>
	);
}

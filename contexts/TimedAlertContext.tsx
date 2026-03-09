"use client";

import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";
import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Info, TriangleAlert } from "lucide-react";

export type TimedAlertVariant = "info" | "success" | "warning" | "error";

export interface TimedAlertAction {
	label: string;
	onClick: () => void;
}

export interface TimedAlert {
	id: string;
	fingerprint: string;
	variant: TimedAlertVariant;
	title?: string;
	description: string;
	durationMs: number;
	action?: TimedAlertAction;
	count: number;
}

interface TimedAlertContextValue {
	showAlert: (options: {
		variant: TimedAlertVariant;
		title?: string;
		description: string;
		durationMs?: number;
		action?: TimedAlertAction;
	}) => void;
	dismissAlert: (id: string) => void;
}

const DEFAULT_DURATIONS: Record<TimedAlertVariant, number> = {
	info: 3500,
	success: 3500,
	warning: 4500,
	error: 6000,
};

const MAX_ALERTS = 3;

const TimedAlertContext = createContext<TimedAlertContextValue | undefined>(
	undefined,
);

export function TimedAlertProvider({ children }: { children: ReactNode }) {
	const [alerts, setAlerts] = useState<TimedAlert[]>([]);
	const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
		new Map(),
	);

	useEffect(() => {
		const timers = timersRef.current;
		return () => {
			timers.forEach((timer) => clearTimeout(timer));
			timers.clear();
		};
	}, []);

	const clearAlertTimer = useCallback((id: string) => {
		const timer = timersRef.current.get(id);
		if (timer) {
			clearTimeout(timer);
			timersRef.current.delete(id);
		}
	}, []);

	const dismissAlert = useCallback(
		(id: string) => {
			setAlerts((prev) => prev.filter((alert) => alert.id !== id));
			clearAlertTimer(id);
		},
		[clearAlertTimer],
	);

	const scheduleDismiss = useCallback(
		(id: string, durationMs: number) => {
			clearAlertTimer(id);
			const timer = setTimeout(() => {
				dismissAlert(id);
			}, durationMs);
			timersRef.current.set(id, timer);
		},
		[clearAlertTimer, dismissAlert],
	);

	const showAlert = useCallback(
		(options: {
			variant: TimedAlertVariant;
			title?: string;
			description: string;
			durationMs?: number;
			action?: TimedAlertAction;
		}) => {
			const id = `alert-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
			const durationMs =
				options.durationMs ?? DEFAULT_DURATIONS[options.variant];
			const fingerprint = [
				options.variant,
				(options.title ?? "").trim(),
				options.description.trim(),
			].join("::");

			const newAlert: TimedAlert = {
				id,
				fingerprint,
				variant: options.variant,
				title: options.title,
				description: options.description,
				durationMs,
				action: options.action,
				count: 1,
			};

			let targetId = id;
			setAlerts((prev) => {
				const existing = prev.find(
					(alert) => alert.fingerprint === fingerprint,
				);

				if (existing) {
					targetId = existing.id;
					return prev.map((alert) => {
						if (alert.id !== existing.id) return alert;
						return {
							...alert,
							title: options.title ?? alert.title,
							description: options.description,
							action: options.action ?? alert.action,
							durationMs,
							count: alert.count + 1,
						};
					});
				}

				if (prev.length >= MAX_ALERTS) {
					clearAlertTimer(prev[0].id);
					return [...prev.slice(1), newAlert];
				}

				return [...prev, newAlert];
			});

			scheduleDismiss(targetId, durationMs);
		},
		[clearAlertTimer, scheduleDismiss],
	);

	return (
		<TimedAlertContext.Provider value={{ showAlert, dismissAlert }}>
			{children}
			<div
				className="pointer-events-none fixed right-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-50 flex max-w-[calc(100vw-1.5rem)] flex-col items-end gap-2 sm:right-4 sm:bottom-4 sm:max-w-[420px]"
				aria-live="polite"
			>
				{alerts.map((alert) => (
					<TimedAlertItem
						key={alert.id}
						alert={alert}
						onDismiss={() => dismissAlert(alert.id)}
					/>
				))}
			</div>
		</TimedAlertContext.Provider>
	);
}

function TimedAlertItem({
	alert,
	onDismiss,
}: {
	alert: TimedAlert;
	onDismiss: () => void;
}) {
	const variantStyles: Record<TimedAlertVariant, string> = {
		info: "alert-info",
		success: "alert-success",
		warning: "alert-warning",
		error: "alert-error",
	};

	const variantIconShell: Record<TimedAlertVariant, string> = {
		info: "bg-info/15 text-info",
		success: "bg-success/15 text-success",
		warning: "bg-warning/20 text-warning-content",
		error: "bg-error/15 text-error",
	};

	const defaultTitles: Record<TimedAlertVariant, string | undefined> = {
		info: undefined,
		success: "Berhasil",
		warning: undefined,
		error: "Terjadi kesalahan",
	};

	const variantIcons: Record<
		TimedAlertVariant,
		React.ComponentType<{ className?: string }>
	> = {
		info: Info,
		success: CheckCircle2,
		warning: TriangleAlert,
		error: AlertTriangle,
	};

	const Icon = variantIcons[alert.variant];

	return (
		<div
			role="alert"
			className={`alert alert-soft ${variantStyles[alert.variant]} pointer-events-auto grid !w-fit !max-w-[min(92vw,420px)] grid-cols-[auto_1fr_auto] items-center gap-3 rounded-xl border px-3 py-2.5 shadow-lg`.trim()}
		>
			<div
				className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${variantIconShell[alert.variant]}`}
			>
				<Icon className="h-5 w-5" />
			</div>
			<div className="min-w-0 flex-1">
				{(alert.title ?? defaultTitles[alert.variant]) && (
					<div className="flex items-center gap-1.5">
						<p className="text-sm font-semibold">
							{alert.title ?? defaultTitles[alert.variant]}
						</p>
						{alert.count > 1 && (
							<span className="badge badge-sm badge-outline h-5 min-h-5 px-1.5 text-[11px]">
								{alert.count}
							</span>
						)}
					</div>
				)}
				<p className="text-base-content/85 mt-0.5 text-sm leading-5 break-words whitespace-pre-wrap">
					{alert.description}
				</p>
				{alert.action && (
					<div className="mt-2">
						<button
							type="button"
							className="btn btn-xs btn-primary"
							onClick={alert.action.onClick}
						>
							{alert.action.label}
						</button>
					</div>
				)}
			</div>
			<button
				type="button"
				className="btn btn-xs btn-ghost btn-square"
				onClick={onDismiss}
				aria-label="Tutup"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					strokeWidth={1.5}
					stroke="currentColor"
					className="h-4 w-4"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M6 18L18 6M6 6l12 12"
					/>
				</svg>
			</button>
		</div>
	);
}

export function useTimedAlert() {
	const context = useContext(TimedAlertContext);
	if (context === undefined) {
		throw new Error("useTimedAlert must be used within TimedAlertProvider");
	}
	return context;
}

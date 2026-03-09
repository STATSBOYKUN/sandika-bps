import type { ElementType, ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Info } from "lucide-react";

type SoftAlertVariant = "info" | "success" | "warning" | "error";

interface SoftAlertProps {
	variant?: SoftAlertVariant;
	title?: string;
	description: string;
	icon?: ElementType;
	action?: ReactNode;
	className?: string;
}

const variantConfig: Record<
	SoftAlertVariant,
	{ icon: ElementType; alertClass: string }
> = {
	info: {
		icon: Info,
		alertClass: "alert-info",
	},
	success: {
		icon: CheckCircle2,
		alertClass: "alert-success",
	},
	warning: {
		icon: AlertTriangle,
		alertClass: "alert-warning",
	},
	error: {
		icon: AlertTriangle,
		alertClass: "alert-error",
	},
};

export default function SoftAlert({
	variant = "info",
	title,
	description,
	icon,
	action,
	className = "",
}: SoftAlertProps) {
	const config = variantConfig[variant];
	const Icon = icon ?? config.icon;

	return (
		<div
			role="alert"
			className={`alert alert-soft ${config.alertClass} ${className}`.trim()}
		>
			<Icon className="h-5 w-5 shrink-0" />
			<div className="min-w-0 flex-1">
				{title && <p className="font-semibold">{title}</p>}
				<p className="text-base-content/80">{description}</p>
				{action && <div className="mt-3">{action}</div>}
			</div>
		</div>
	);
}

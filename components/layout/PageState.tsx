import type { ElementType, ReactNode } from "react";
import { AlertTriangle, Inbox, SearchX } from "lucide-react";

type PageStateVariant = "loading" | "error" | "empty" | "not-found";

interface PageStateProps {
  variant: PageStateVariant;
  title?: string;
  description?: string;
  icon?: ElementType;
  action?: ReactNode;
  className?: string;
}

const defaultConfig: Record<
  PageStateVariant,
  { title: string; description: string; icon: ElementType; iconClass: string }
> = {
  loading: {
    title: "Memuat data",
    description: "Tunggu sebentar",
    icon: Inbox,
    iconClass: "text-primary",
  },
  error: {
    title: "Terjadi kendala",
    description: "Data belum bisa ditampilkan saat ini.",
    icon: AlertTriangle,
    iconClass: "text-error",
  },
  empty: {
    title: "Belum ada data",
    description: "Data akan muncul setelah tersedia.",
    icon: Inbox,
    iconClass: "text-base-content/45",
  },
  "not-found": {
    title: "Halaman tidak ditemukan",
    description: "Periksa ulang alamat atau kembali ke menu sebelumnya.",
    icon: SearchX,
    iconClass: "text-base-content/45",
  },
};

export default function PageState({
  variant,
  title,
  description,
  icon,
  action,
  className = "",
}: PageStateProps) {
  const config = defaultConfig[variant];
  const Icon = icon ?? config.icon;
  const isLoading = variant === "loading";

  return (
    <div className={`rounded-xl border border-base-300 bg-base-100 px-5 py-10 text-center shadow-sm ${className}`.trim()}>
      {isLoading ? (
        <span className="loading loading-bars loading-lg mx-auto mb-3 text-primary" />
      ) : (
        <Icon className={`mx-auto mb-3 size-10 ${config.iconClass}`} />
      )}
      <h2 className="text-lg font-semibold">{title ?? config.title}</h2>
      <p className="mx-auto mt-1 max-w-md text-sm text-base-content/70">{description ?? config.description}</p>
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}

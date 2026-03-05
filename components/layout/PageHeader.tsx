import type { ElementType, ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: string;
  icon?: ElementType;
  actions?: ReactNode;
  className?: string;
  actionsClassName?: string;
}

export default function PageHeader({
  title,
  description,
  badge,
  icon: Icon,
  actions,
  className = "",
  actionsClassName = "",
}: PageHeaderProps) {
  const defaultActionsClassName = "flex flex-wrap items-center gap-3 md:mt-9 md:self-start";
  const combinedActionsClassName = [defaultActionsClassName, actionsClassName]
    .filter(Boolean)
    .join(" ");

  return (
    <header className={`rounded-xl border border-base-300 bg-base-200/70 px-5 py-5 md:px-6 md:py-6 ${className}`.trim()}>
      <div className="flex flex-col gap-4 md:flex-row md:justify-between">
        <div className="space-y-2">
          {badge && <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-base-content/50">{badge}</p>}
          <div className="flex items-start gap-3">
            {Icon && (
              <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
                <Icon className="size-[18px]" />
              </span>
            )}
            <div>
              <h1 className="text-2xl font-bold md:text-3xl">{title}</h1>
              {description && <p className="mt-2 max-w-3xl text-sm text-base-content/70 md:text-base">{description}</p>}
            </div>
          </div>
        </div>

        {actions && <div className={combinedActionsClassName}>{actions}</div>}
      </div>
    </header>
  );
}

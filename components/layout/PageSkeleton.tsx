import PageShell from "@/components/layout/PageShell";

type PageSkeletonVariant = "dashboard" | "table" | "map" | "form";

interface PageSkeletonProps {
  variant?: PageSkeletonVariant;
}

function HeaderSkeleton() {
  return (
    <div className="space-y-3">
      <div className="skeleton h-4 w-28" />
      <div className="skeleton h-9 w-64" />
      <div className="skeleton h-4 w-80 max-w-full" />
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <>
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <article key={`dash-card-${index}`} className="rounded-xl border border-base-300 bg-base-200/50 p-5">
            <div className="space-y-3">
              <div className="skeleton h-4 w-24" />
              <div className="skeleton h-8 w-20" />
              <div className="skeleton h-3 w-40 max-w-full" />
            </div>
          </article>
        ))}
      </section>
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <article className="rounded-xl border border-base-300 bg-base-200/50 p-6">
          <div className="skeleton mb-4 h-6 w-48" />
          <div className="space-y-3 rounded-lg border border-base-300 bg-base-100 p-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={`dist-${index}`} className="space-y-2">
                <div className="flex justify-between gap-2">
                  <div className="skeleton h-3 w-28" />
                  <div className="skeleton h-3 w-20" />
                </div>
                <div className="skeleton h-2 w-full" />
              </div>
            ))}
          </div>
        </article>
        <article className="rounded-xl border border-base-300 bg-base-200/50 p-6">
          <div className="skeleton mb-4 h-6 w-44" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={`activity-${index}`} className="rounded-lg border border-base-300 bg-base-100 px-4 py-3">
                <div className="space-y-2">
                  <div className="skeleton h-3 w-36" />
                  <div className="skeleton h-3 w-48 max-w-full" />
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </>
  );
}

function TableSkeleton() {
  return (
    <>
      <section className="rounded-xl border border-base-300 bg-base-100 p-4">
        <div className="flex flex-wrap gap-2">
          <div className="skeleton h-8 w-24" />
          <div className="skeleton h-8 w-24" />
          <div className="skeleton h-8 w-24" />
        </div>
      </section>
      <section className="rounded-xl border border-base-300 bg-base-100 p-4">
        <div className="skeleton h-10 w-full" />
      </section>
      <section className="rounded-xl border border-base-300 bg-base-100 p-4">
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={`table-row-${index}`} className="grid grid-cols-3 gap-3 md:grid-cols-6">
              {Array.from({ length: 6 }).map((__, cellIndex) => (
                <div key={`table-cell-${index}-${cellIndex}`} className="skeleton h-5 w-full" />
              ))}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function MapSkeleton() {
  return (
    <section className="space-y-4 rounded-xl border border-base-300 bg-base-200/50 p-4">
      <div className="rounded-xl border border-base-300 bg-base-100 p-4">
        <div className="flex flex-wrap gap-2">
          <div className="skeleton h-8 w-28" />
          <div className="skeleton h-8 w-28" />
          <div className="skeleton h-8 w-28" />
        </div>
      </div>
      <div className="rounded-xl border border-base-300 bg-base-100 p-4">
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={`badge-${index}`} className="skeleton h-6 w-full" />
          ))}
        </div>
      </div>
      <div className="skeleton h-[56dvh] min-h-[340px] w-full rounded-xl" />
    </section>
  );
}

function FormSkeleton() {
  return (
    <section className="rounded-xl border border-base-300 bg-base-100 p-6">
      <div className="space-y-4">
        <div className="skeleton h-8 w-64" />
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={`field-${index}`} className="space-y-2">
            <div className="skeleton h-3 w-28" />
            <div className="skeleton h-10 w-full" />
          </div>
        ))}
      </div>
    </section>
  );
}

export default function PageSkeleton({ variant = "dashboard" }: PageSkeletonProps) {
  return (
    <PageShell width="4xl" className="space-y-6">
      <HeaderSkeleton />
      <PageSkeletonContent variant={variant} />
    </PageShell>
  );
}

export function PageSkeletonContent({ variant = "dashboard" }: PageSkeletonProps) {
  if (variant === "table") return <TableSkeleton />;
  if (variant === "map") return <MapSkeleton />;
  if (variant === "form") return <FormSkeleton />;
  return <DashboardSkeleton />;
}

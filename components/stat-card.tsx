import { formatPercent } from "@/lib/utils";

export function StatCard({
  label,
  value,
  description,
  isPercent
}: {
  label: string;
  value: number;
  description: string;
  isPercent?: boolean;
}) {
  return (
    <article className="rounded-[24px] border border-nao-line bg-white p-5 shadow-card">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-3 text-4xl font-semibold text-nao-ink">{isPercent ? formatPercent(value) : value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
    </article>
  );
}

import Link from "next/link";
import { EmployeeTable } from "@/components/employee-table";
import { getManagerDetail } from "@/lib/data/queries";
import { formatPercent } from "@/lib/utils";

export default async function ManagerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { summary, employees } = await getManagerDetail(id);

  if (!summary) {
    return (
      <div className="rounded-[24px] border border-nao-line bg-white p-8 shadow-card">
        <h3 className="text-2xl font-semibold text-nao-ink">Manager not found</h3>
        <p className="mt-3 text-sm text-slate-600">This manager does not appear in the imported dataset yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[24px] border border-nao-line bg-white p-6 shadow-card">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-nao-teal">Manager Detail</p>
        <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h3 className="text-3xl font-semibold text-nao-ink">{summary.managerName}</h3>
            <p className="mt-2 text-sm text-slate-600">Leadership drilldown for this manager’s team completion.</p>
          </div>
          <Link href="/dashboard" className="text-sm font-semibold text-nao-teal">
            Back to dashboard
          </Link>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-4">
          <MetricCard label="Team Average" value={formatPercent(summary.averageCompletion)} />
          <MetricCard label="Team Size" value={String(summary.teamSize)} />
          <MetricCard label="Complete" value={String(summary.completeCount)} />
          <MetricCard label="Needs Attention" value={String(summary.needsAttentionCount)} />
        </div>
      </div>

      <EmployeeTable employees={employees} />
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] border border-nao-line bg-nao-soft/50 p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-nao-ink">{value}</p>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Download, FilterX } from "lucide-react";
import { EmployeeTable } from "@/components/employee-table";
import { ManagerBarChart } from "@/components/manager-bar-chart";
import { StatCard } from "@/components/stat-card";
import { StatusMixChart } from "@/components/status-mix-chart";
import { getStatusLabel } from "@/lib/status";
import { formatDate, formatPercent } from "@/lib/utils";
import type { DashboardPayload, EmployeeRow } from "@/types/dashboard";

type StatusFilter = "All" | "Complete" | "Nearly Complete" | "Needs Attention";

export function DashboardClient({ payload }: { payload: DashboardPayload }) {
  const [managerId, setManagerId] = useState("All");
  const [department, setDepartment] = useState("All");
  const [status, setStatus] = useState<StatusFilter>("All");
  const [snapshotDate, setSnapshotDate] = useState("All");

  const filteredEmployees = useMemo(() => {
    return payload.employees.filter((employee) => {
      if (managerId !== "All" && employee.managerId !== managerId) {
        return false;
      }
      if (department !== "All" && employee.department !== department) {
        return false;
      }
      if (status !== "All" && employee.status !== status) {
        return false;
      }
      if (snapshotDate !== "All" && employee.snapshotDate !== snapshotDate) {
        return false;
      }
      return true;
    });
  }, [department, managerId, payload.employees, snapshotDate, status]);

  const managerSummaries = useMemo(() => {
    const grouped = new Map<string, DashboardPayload["managerSummaries"][number]>();

    filteredEmployees.forEach((employee) => {
      if (!employee.managerId || !employee.managerName) {
        return;
      }

      const existing =
        grouped.get(employee.managerId) ??
        {
          managerId: employee.managerId,
          managerName: employee.managerName,
          averageCompletion: 0,
          completeCount: 0,
          nearlyCompleteCount: 0,
          needsAttentionCount: 0,
          teamSize: 0
        };

      existing.teamSize += 1;
      existing.averageCompletion += employee.completionPercentage;

      const currentStatus = getStatusLabel(employee.completionPercentage);
      if (currentStatus === "Complete") {
        existing.completeCount += 1;
      } else if (currentStatus === "Nearly Complete") {
        existing.nearlyCompleteCount += 1;
      } else {
        existing.needsAttentionCount += 1;
      }

      grouped.set(employee.managerId, existing);
    });

    return Array.from(grouped.values())
      .map((row) => ({
        ...row,
        averageCompletion: row.teamSize > 0 ? row.averageCompletion / row.teamSize : 0
      }))
      .sort((left, right) => right.averageCompletion - left.averageCompletion);
  }, [filteredEmployees]);

  const metrics = useMemo(() => {
    const overallCompletion =
      filteredEmployees.length > 0
        ? filteredEmployees.reduce((sum, employee) => sum + employee.completionPercentage, 0) / filteredEmployees.length
        : 0;

    const averageManagerCompletion =
      managerSummaries.length > 0
        ? managerSummaries.reduce((sum, manager) => sum + manager.averageCompletion, 0) / managerSummaries.length
        : 0;

    return {
      overallCompletion,
      totalEmployees: filteredEmployees.length,
      completeCount: filteredEmployees.filter((row) => row.status === "Complete").length,
      needsAttentionCount: filteredEmployees.filter((row) => row.status === "Needs Attention").length,
      averageManagerCompletion
    };
  }, [filteredEmployees, managerSummaries]);

  if (payload.employees.length === 0) {
    return (
      <div className="rounded-[28px] border border-dashed border-nao-line bg-white p-10 text-center shadow-card">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-nao-teal">No completion data uploaded yet</p>
        <h3 className="mt-3 text-3xl font-semibold text-nao-ink">Upload the Trainual and manager mapping files to populate this dashboard.</h3>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-600">
          The dashboard is wired to Supabase and will stay empty until an admin imports the real files.
        </p>
        <Link href="/admin/imports" className="mt-6 inline-flex rounded-full bg-nao-teal px-5 py-3 text-sm font-semibold text-white">
          Go to imports
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-5">
        <StatCard label="Overall Completion" value={metrics.overallCompletion} isPercent description="Average employee completion across the active filtered view." />
        <StatCard label="Total Employees" value={metrics.totalEmployees} description="Employees represented by the current selection." />
        <StatCard label="Complete" value={metrics.completeCount} description="Employees at exactly 100% completion." />
        <StatCard label="Needs Attention" value={metrics.needsAttentionCount} description="Employees below the 80% completion threshold." />
        <StatCard label="Avg by Manager" value={metrics.averageManagerCompletion} isPercent description="Average of each visible manager’s team completion." />
      </div>

      <div className="rounded-[24px] border border-nao-line bg-white p-5 shadow-card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-nao-teal">Filters</p>
            <h3 className="mt-1 text-2xl font-semibold text-nao-ink">Slice the dashboard by manager, status, department, and snapshot</h3>
          </div>
          <div className="text-sm text-slate-500">
            Last import: {payload.metrics.lastImportedAt ? formatDate(payload.metrics.lastImportedAt) : "Not imported yet"}
          </div>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-5">
          <FilterSelect label="Manager" value={managerId} onChange={setManagerId} options={["All", ...payload.managers.map((manager) => `${manager.id}::${manager.name}`)]} mode="manager" />
          <FilterSelect label="Department" value={department} onChange={setDepartment} options={["All", ...payload.departments]} />
          <FilterSelect label="Status" value={status} onChange={(value) => setStatus(value as StatusFilter)} options={["All", "Complete", "Nearly Complete", "Needs Attention"]} />
          <FilterSelect label="Snapshot" value={snapshotDate} onChange={setSnapshotDate} options={["All", ...payload.snapshotDates]} mode="date" />
          <div className="flex items-end gap-3">
            <button
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-nao-line px-4 py-3 text-sm font-semibold text-nao-ink"
              type="button"
              onClick={() => {
                setManagerId("All");
                setDepartment("All");
                setStatus("All");
                setSnapshotDate("All");
              }}
            >
              <FilterX size={16} />
              Clear filters
            </button>
            <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-nao-teal px-4 py-3 text-sm font-semibold text-white" type="button" onClick={() => exportRows(filteredEmployees)}>
              <Download size={16} />
              Export
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
        <section className="rounded-[24px] border border-nao-line bg-white p-5 shadow-card">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-nao-teal">Manager Summary</p>
          <div className="mb-4 mt-1 flex items-center justify-between gap-3">
            <h3 className="text-2xl font-semibold text-nao-ink">Completion rate by manager</h3>
            {managerId !== "All" ? (
              <Link className="text-sm font-medium text-nao-teal" href={`/manager/${managerId}`}>
                Open manager detail
              </Link>
            ) : null}
          </div>
          <ManagerBarChart data={managerSummaries} onSelect={setManagerId} />
        </section>

        <section className="rounded-[24px] border border-nao-line bg-white p-5 shadow-card">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-nao-teal">Team Mix</p>
          <h3 className="mb-4 mt-1 text-2xl font-semibold text-nao-ink">Status distribution by manager</h3>
          <StatusMixChart data={managerSummaries} />
        </section>
      </div>

      <EmployeeTable employees={filteredEmployees} />
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  mode
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  mode?: "manager" | "date";
}) {
  return (
    <label className="rounded-2xl border border-nao-line bg-nao-soft/60 px-4 py-3 text-sm">
      <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</span>
      <select
        className="mt-2 w-full bg-transparent font-medium text-nao-ink outline-none"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => {
          const parsed =
            mode === "manager" && option.includes("::")
              ? { value: option.split("::")[0], label: option.split("::")[1] }
              : mode === "date" && option !== "All"
                ? { value: option, label: formatDate(option) }
                : { value: option, label: option };

          return (
            <option key={parsed.value} value={parsed.value}>
              {parsed.label}
            </option>
          );
        })}
      </select>
    </label>
  );
}

function exportRows(rows: EmployeeRow[]) {
  const header = ["Employee Name", "Manager", "Department", "Completion %", "Status", "Remaining Modules", "Snapshot Date"];
  const lines = rows.map((row) =>
    [
      row.employeeName,
      row.managerName ?? "",
      row.department ?? "",
      formatPercent(row.completionPercentage),
      row.status,
      row.remainingModules ?? "",
      row.snapshotDate ?? ""
    ]
      .map((cell) => `"${String(cell).replace(/"/g, "\"\"")}"`)
      .join(",")
  );

  const blob = new Blob([[header.join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "trainual-dashboard-export.csv");
  link.click();
  URL.revokeObjectURL(url);
}

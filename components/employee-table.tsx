"use client";

import { useMemo, useState } from "react";
import { ArrowUpDown, Search } from "lucide-react";
import { getStatusTone } from "@/lib/status";
import { cn, formatDate, formatPercent } from "@/lib/utils";
import type { EmployeeRow } from "@/types/dashboard";

type SortKey = "employeeName" | "managerName" | "completionPercentage";

export function EmployeeTable({ employees }: { employees: EmployeeRow[] }) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("completionPercentage");
  const [sortDescending, setSortDescending] = useState(false);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const visible = normalizedQuery
      ? employees.filter((employee) =>
          [employee.employeeName, employee.managerName ?? "", employee.department ?? ""].join(" ").toLowerCase().includes(normalizedQuery)
        )
      : employees;

    return [...visible].sort((left, right) => {
      const a = left[sortKey] ?? "";
      const b = right[sortKey] ?? "";

      if (typeof a === "number" && typeof b === "number") {
        return sortDescending ? b - a : a - b;
      }

      return sortDescending
        ? String(b).localeCompare(String(a))
        : String(a).localeCompare(String(b));
    });
  }, [employees, query, sortDescending, sortKey]);

  function toggleSort(nextKey: SortKey) {
    if (sortKey === nextKey) {
      setSortDescending((current) => !current);
      return;
    }

    setSortKey(nextKey);
    setSortDescending(false);
  }

  return (
    <div className="rounded-[24px] border border-nao-line bg-white p-5 shadow-card">
      <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-nao-teal">Employee Drilldown</p>
          <h3 className="mt-1 text-2xl font-semibold text-nao-ink">Completion by employee</h3>
        </div>

        <label className="flex items-center gap-3 rounded-2xl border border-nao-line bg-nao-soft/60 px-4 py-3 text-sm text-slate-600">
          <Search size={16} />
          <input
            className="w-full bg-transparent outline-none placeholder:text-slate-400 lg:w-72"
            placeholder="Search employee, manager, or department"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0">
          <thead>
            <tr className="text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              <TableHeader label="Employee" onClick={() => toggleSort("employeeName")} />
              <TableHeader label="Manager" onClick={() => toggleSort("managerName")} />
              <th className="border-b border-nao-line px-4 py-3">Department</th>
              <TableHeader label="Completion" onClick={() => toggleSort("completionPercentage")} />
              <th className="border-b border-nao-line px-4 py-3">Status</th>
              <th className="border-b border-nao-line px-4 py-3">Remaining</th>
              <th className="border-b border-nao-line px-4 py-3">Snapshot</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td className="px-4 py-10 text-sm text-slate-500" colSpan={7}>
                  No employees match the current filters.
                </td>
              </tr>
            ) : (
              filtered.map((employee) => (
                <tr key={`${employee.employeeId}-${employee.snapshotDate ?? "current"}`} className="text-sm text-slate-700">
                  <td className="border-b border-nao-line px-4 py-4 font-medium text-nao-ink">{employee.employeeName}</td>
                  <td className="border-b border-nao-line px-4 py-4">{employee.managerName ?? "Unassigned"}</td>
                  <td className="border-b border-nao-line px-4 py-4">{employee.department ?? "Unspecified"}</td>
                  <td className="border-b border-nao-line px-4 py-4 font-semibold">{formatPercent(employee.completionPercentage)}</td>
                  <td className="border-b border-nao-line px-4 py-4">
                    <span className={cn("inline-flex rounded-full px-3 py-1 text-xs font-semibold", getStatusTone(employee.status))}>
                      {employee.status}
                    </span>
                  </td>
                  <td className="border-b border-nao-line px-4 py-4">{employee.remainingModules ?? "—"}</td>
                  <td className="border-b border-nao-line px-4 py-4">{formatDate(employee.snapshotDate)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TableHeader({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <th className="border-b border-nao-line px-4 py-3">
      <button className="inline-flex items-center gap-2 text-left" type="button" onClick={onClick}>
        {label}
        <ArrowUpDown size={14} />
      </button>
    </th>
  );
}

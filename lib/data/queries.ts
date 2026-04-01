import { getStatusLabel } from "@/lib/status";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { DashboardPayload, EmployeeRow, ManagerSummary } from "@/types/dashboard";

export async function getDashboardData(): Promise<DashboardPayload> {
  const supabase = await createServerSupabaseClient();

  const [{ data: completions }, { data: imports }] = await Promise.all([
    supabase
      .from("trainual_completions")
      .select(`
        completion_percentage,
        remaining_modules,
        snapshot_date,
        employees (
          id,
          employee_name,
          employee_email,
          department,
          manager_id,
          managers (
            id,
            manager_name
          )
        )
      `)
      .order("snapshot_date", { ascending: false }),
    supabase.from("imports").select("imported_at").order("imported_at", { ascending: false }).limit(1)
  ]);

  const employees: EmployeeRow[] =
    completions?.map((row: any) => {
      const employee = row.employees;
      const manager = employee?.managers;
      const completionPercentage = Number(row.completion_percentage) || 0;

      return {
        employeeId: employee?.id ?? `${employee?.employee_name ?? "unknown"}-${row.snapshot_date ?? "na"}`,
        employeeName: employee?.employee_name ?? "Unknown Employee",
        employeeEmail: employee?.employee_email ?? null,
        managerId: manager?.id ?? employee?.manager_id ?? null,
        managerName: manager?.manager_name ?? null,
        department: employee?.department ?? null,
        completionPercentage,
        remainingModules: row.remaining_modules ?? null,
        snapshotDate: row.snapshot_date ?? null,
        status: getStatusLabel(completionPercentage)
      };
    }) ?? [];

  const managerMap = new Map<string, ManagerSummary>();

  employees.forEach((employee) => {
    if (!employee.managerId || !employee.managerName) {
      return;
    }

    const existing =
      managerMap.get(employee.managerId) ??
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

    if (employee.status === "Complete") {
      existing.completeCount += 1;
    } else if (employee.status === "Nearly Complete") {
      existing.nearlyCompleteCount += 1;
    } else {
      existing.needsAttentionCount += 1;
    }

    managerMap.set(employee.managerId, existing);
  });

  const managerSummaries = Array.from(managerMap.values())
    .map((manager) => ({
      ...manager,
      averageCompletion: manager.teamSize > 0 ? manager.averageCompletion / manager.teamSize : 0
    }))
    .sort((a, b) => b.averageCompletion - a.averageCompletion);

  const metrics = {
    overallCompletion:
      employees.length > 0
        ? employees.reduce((sum, row) => sum + row.completionPercentage, 0) / employees.length
        : 0,
    totalEmployees: employees.length,
    completeCount: employees.filter((row) => row.status === "Complete").length,
    needsAttentionCount: employees.filter((row) => row.status === "Needs Attention").length,
    averageManagerCompletion:
      managerSummaries.length > 0
        ? managerSummaries.reduce((sum, row) => sum + row.averageCompletion, 0) / managerSummaries.length
        : 0,
    lastImportedAt: imports?.[0]?.imported_at ?? null
  };

  return {
    metrics,
    managerSummaries,
    employees,
    managers: managerSummaries.map((manager) => ({ id: manager.managerId, name: manager.managerName })),
    departments: Array.from(new Set(employees.map((row) => row.department).filter(Boolean) as string[])).sort(),
    snapshotDates: Array.from(new Set(employees.map((row) => row.snapshotDate).filter(Boolean) as string[])).sort().reverse()
  };
}

export async function getManagerDetail(managerId: string) {
  const payload = await getDashboardData();
  return {
    summary: payload.managerSummaries.find((manager) => manager.managerId === managerId) ?? null,
    employees: payload.employees.filter((employee) => employee.managerId === managerId)
  };
}

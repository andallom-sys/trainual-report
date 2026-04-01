export type StatusLabel = "Complete" | "Nearly Complete" | "Needs Attention";

export type EmployeeRow = {
  employeeId: string;
  employeeName: string;
  employeeEmail: string | null;
  managerId: string | null;
  managerName: string | null;
  department: string | null;
  completionPercentage: number;
  remainingModules: number | null;
  snapshotDate: string | null;
  status: StatusLabel;
};

export type ManagerSummary = {
  managerId: string;
  managerName: string;
  averageCompletion: number;
  completeCount: number;
  nearlyCompleteCount: number;
  needsAttentionCount: number;
  teamSize: number;
};

export type DashboardMetrics = {
  overallCompletion: number;
  totalEmployees: number;
  completeCount: number;
  needsAttentionCount: number;
  averageManagerCompletion: number;
  lastImportedAt: string | null;
};

export type DashboardPayload = {
  metrics: DashboardMetrics;
  managerSummaries: ManagerSummary[];
  employees: EmployeeRow[];
  managers: { id: string; name: string }[];
  departments: string[];
  snapshotDates: string[];
};

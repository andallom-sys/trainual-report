import { parseCsv } from "@/lib/parsers/csv";
import { getStatusLabel } from "@/lib/status";
import { slugifyName } from "@/lib/utils";

export type ParsedTrainualRow = {
  employeeName: string;
  employeeEmail: string | null;
  employeeExternalId: string | null;
  department: string | null;
  managerName: string | null;
  completionPercentage: number;
  completedModules: number | null;
  totalModules: number | null;
  remainingModules: number | null;
  snapshotDate: string | null;
  status: ReturnType<typeof getStatusLabel>;
  matchKey: string;
};

function parsePercent(raw: string) {
  const cleaned = raw.replace("%", "").trim();
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseNullableNumber(raw: string | undefined) {
  if (!raw) {
    return null;
  }

  const parsed = Number(raw.replace(/[^0-9.-]/g, "").trim());
  return Number.isFinite(parsed) ? parsed : null;
}

function parseDate(raw: string | undefined) {
  if (!raw?.trim()) {
    return null;
  }

  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

export function parseTrainualCompletionCsv(text: string) {
  const result = parseCsv<Record<string, string>>(text);

  if (result.errors.length) {
    throw new Error(result.errors[0]?.message ?? "Unable to parse Trainual CSV.");
  }

  return result.data
    .map((row) => {
      const employeeName = row["Name"]?.trim();
      if (!employeeName) {
        return null;
      }

      const completionPercentage = parsePercent(row["Completion score"] ?? "0");
      const completedModules = parseNullableNumber(row["Completed modules"]);
      const totalModules = parseNullableNumber(row["Total modules"]);
      const remainingModules =
        parseNullableNumber(row["Remaining modules"]) ??
        (completedModules !== null && totalModules !== null ? totalModules - completedModules : null);

      return {
        employeeName,
        employeeEmail: row["Email"]?.trim() || null,
        employeeExternalId: row["User ID"]?.trim() || null,
        department: row["Job title"]?.trim() || null,
        managerName: row["Reports to"]?.trim() || null,
        completionPercentage,
        completedModules,
        totalModules,
        remainingModules,
        snapshotDate: parseDate(row["Last active"]) ?? new Date().toISOString(),
        status: getStatusLabel(completionPercentage),
        matchKey: row["User ID"]?.trim() || row["Email"]?.trim() || slugifyName(employeeName)
      };
    })
    .filter((row): row is ParsedTrainualRow => Boolean(row));
}

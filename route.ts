import { NextResponse } from "next/server";
import { parseManagerMappingCsv } from "@/lib/parsers/manager-mapping";
import { parseTrainualCompletionCsv } from "@/lib/parsers/trainual";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { slugifyName } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const authClient = await createServerSupabaseClient();
    const {
      data: { user }
    } = await authClient.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { data: rawProfile } = await authClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    const profile = rawProfile as { role?: string } | null;
    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Admin access required." }, { status: 403 });
    }

    const { trainualText, mappingText } = await request.json();

    if (!trainualText || !mappingText) {
      return NextResponse.json({ error: "Both CSV files are required." }, { status: 400 });
    }

    const supabase = createAdminClient();
    const trainualRows = parseTrainualCompletionCsv(trainualText);
    const mappingRows = parseManagerMappingCsv(mappingText);

    const managersByName = new Map<string, { manager_name: string; department: string | null }>();
    mappingRows.forEach((row) => {
      if (!row.managerName) {
        return;
      }

      const key = slugifyName(row.managerName);
      if (!managersByName.has(key)) {
        managersByName.set(key, {
          manager_name: row.managerName,
          department: row.department
        });
      }
    });

    const { data: managerRecords, error: managerError } = await supabase
      .from("managers")
      .upsert(Array.from(managersByName.values()), { onConflict: "manager_name" })
      .select("id, manager_name");

    if (managerError) {
      throw managerError;
    }

    const managerIdByName = new Map(
      (managerRecords ?? []).map((manager) => [slugifyName(manager.manager_name), manager.id] as const)
    );
    const mappingByMatchKey = new Map(mappingRows.map((row) => [row.matchKey, row]));

    const employeeUpserts = trainualRows.map((row) => {
      const mapping = mappingByMatchKey.get(row.matchKey);
      const managerId =
        (mapping?.managerName ? managerIdByName.get(slugifyName(mapping.managerName)) : null) ??
        (row.managerName ? managerIdByName.get(slugifyName(row.managerName)) : null) ??
        null;

      return {
        employee_name: row.employeeName,
        employee_email: row.employeeEmail,
        employee_external_id: row.employeeExternalId,
        department: mapping?.department ?? row.department,
        manager_id: managerId,
        active: true
      };
    });

    const { data: employeeRecords, error: employeeError } = await supabase
      .from("employees")
      .upsert(employeeUpserts, { onConflict: "employee_email" })
      .select("id, employee_name, employee_email, employee_external_id");

    if (employeeError) {
      throw employeeError;
    }

    const employeeIdByKey = new Map<string, string>();
    (employeeRecords ?? []).forEach((employee) => {
      if (employee.employee_external_id) {
        employeeIdByKey.set(employee.employee_external_id, employee.id);
      }
      if (employee.employee_email) {
        employeeIdByKey.set(employee.employee_email, employee.id);
      }
      employeeIdByKey.set(slugifyName(employee.employee_name), employee.id);
    });

    const completionInserts = trainualRows.flatMap((row) => {
      const matchKey = row.employeeExternalId || row.employeeEmail || slugifyName(row.employeeName);
      const employeeId = employeeIdByKey.get(matchKey);
      if (!employeeId) {
        return [];
      }

      return [
        {
          employee_id: employeeId,
          completion_percentage: row.completionPercentage,
          total_modules: row.totalModules,
          completed_modules: row.completedModules,
          remaining_modules: row.remainingModules,
          snapshot_date: row.snapshotDate
        }
      ];
    });

    const { error: completionError } = await supabase.from("trainual_completions").insert(completionInserts);
    if (completionError) {
      throw completionError;
    }

    const { error: importError } = await supabase.from("imports").insert([
      {
        source_name: "Trainual + Employee Manager Mapping",
        import_type: "manual_csv_upload",
        row_count: completionInserts.length,
        status: "success",
        notes: "Imported from admin upload page."
      }
    ]);

    if (importError) {
      throw importError;
    }

    return NextResponse.json({ success: true, imported: completionInserts.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown import error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

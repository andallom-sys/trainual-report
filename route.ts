import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { parseManagerMappingCsv } from "@/lib/parsers/manager-mapping";
import { parseTrainualCompletionCsv } from "@/lib/parsers/trainual";

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { trainualText, mappingText } = await request.json();

    if (!trainualText || !mappingText) {
      return NextResponse.json({ error: "Both CSV files are required." }, { status: 400 });
    }

    const trainualRows = parseTrainualCompletionCsv(trainualText);
    const mappingRows = parseManagerMappingCsv(mappingText);

    const preview = trainualRows.slice(0, 8).map((row) => ({
      employeeName: row.employeeName,
      managerName: row.managerName,
      completionPercentage: row.completionPercentage,
      status: row.status,
      remainingModules: row.remainingModules
    }));

    return NextResponse.json({
      preview,
      summary: {
        completions: trainualRows.length,
        mappings: mappingRows.length
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown import preview error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

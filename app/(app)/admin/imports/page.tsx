import { ImportWorkbench } from "@/components/import-workbench";
import { requireAdmin } from "@/lib/data/auth";

export default async function ImportsPage() {
  await requireAdmin();
  return <ImportWorkbench />;
}

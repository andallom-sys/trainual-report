import { AppShell } from "@/components/app-shell";
import { requireUser } from "@/lib/data/auth";

export default async function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  await requireUser();

  return (
    <AppShell
      heading="Trainual Completion Dashboard"
      subheading="Track completion by manager and by employee, using uploaded Trainual and manager-mapping files stored in Supabase."
    >
      {children}
    </AppShell>
  );
}

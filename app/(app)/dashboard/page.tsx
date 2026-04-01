import { DashboardClient } from "@/components/dashboard-client";
import { getDashboardData } from "@/lib/data/queries";

export default async function DashboardPage() {
  const payload = await getDashboardData();
  return <DashboardClient payload={payload} />;
}

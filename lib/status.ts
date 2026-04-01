import type { StatusLabel } from "@/types/dashboard";

export function getStatusLabel(completionPercentage: number): StatusLabel {
  if (completionPercentage >= 100) {
    return "Complete";
  }

  if (completionPercentage >= 80) {
    return "Nearly Complete";
  }

  return "Needs Attention";
}

export function getStatusTone(status: StatusLabel) {
  switch (status) {
    case "Complete":
      return "bg-emerald-100 text-emerald-700";
    case "Nearly Complete":
      return "bg-amber-100 text-amber-700";
    case "Needs Attention":
      return "bg-rose-100 text-rose-700";
  }
}

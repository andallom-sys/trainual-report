import clsx from "clsx";

export function cn(...values: Array<string | false | null | undefined>) {
  return clsx(values);
}

export function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}

export function formatDate(value: string | null) {
  if (!value) {
    return "No snapshot";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}

export function slugifyName(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

import Link from "next/link";
import { BarChart3, Upload, Users } from "lucide-react";

export function AppShell({
  children,
  heading,
  subheading
}: {
  children: React.ReactNode;
  heading: string;
  subheading: string;
}) {
  return (
    <div className="min-h-screen">
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 lg:px-6">
        <aside className="hidden w-72 shrink-0 rounded-[28px] bg-nao-navy p-6 text-white shadow-card lg:block">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-200">Nao Medical</p>
            <h1 className="mt-3 text-3xl font-semibold">Trainual Dashboard</h1>
            <p className="mt-3 text-sm leading-6 text-slate-200">
              Completion visibility for leadership, managers, and operational follow-up.
            </p>
          </div>

          <nav className="grid gap-3">
            <Link className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white" href="/dashboard">
              <span className="flex items-center gap-3"><BarChart3 size={18} /> Dashboard</span>
            </Link>
            <Link className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-medium text-slate-100" href="/admin/imports">
              <span className="flex items-center gap-3"><Upload size={18} /> Imports</span>
            </Link>
            <Link className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-medium text-slate-100" href="/dashboard">
              <span className="flex items-center gap-3"><Users size={18} /> Employee View</span>
            </Link>
          </nav>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="mb-6 rounded-[28px] border border-nao-line bg-white p-6 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-nao-teal">Leadership Reporting</p>
            <div className="mt-2 flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-3xl font-semibold text-nao-ink">{heading}</h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{subheading}</p>
              </div>
            </div>
          </header>
          {children}
        </main>
      </div>
    </div>
  );
}

"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ManagerSummary } from "@/types/dashboard";

export function StatusMixChart({ data }: { data: ManagerSummary[] }) {
  return (
    <div className="h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#e5eef0" strokeDasharray="4 4" vertical={false} />
          <XAxis dataKey="managerName" tick={{ fill: "#526570", fontSize: 12 }} angle={-18} textAnchor="end" height={60} />
          <YAxis tick={{ fill: "#526570", fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="completeCount" stackId="a" fill="#2d8a5f" name="Complete" radius={[6, 6, 0, 0]} />
          <Bar dataKey="nearlyCompleteCount" stackId="a" fill="#d3a11f" name="Nearly Complete" />
          <Bar dataKey="needsAttentionCount" stackId="a" fill="#c75b50" name="Needs Attention" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

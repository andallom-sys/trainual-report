"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ManagerSummary } from "@/types/dashboard";

export function ManagerBarChart({ data, onSelect }: { data: ManagerSummary[]; onSelect: (managerId: string) => void }) {
  return (
    <div className="h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 8, right: 8, left: 20, bottom: 0 }}>
          <CartesianGrid stroke="#e5eef0" strokeDasharray="4 4" horizontal={false} />
          <XAxis type="number" domain={[0, 100]} tick={{ fill: "#526570", fontSize: 12 }} />
          <YAxis dataKey="managerName" type="category" tick={{ fill: "#16303d", fontSize: 12 }} width={130} />
          <Tooltip formatter={(value: number) => `${Math.round(value)}%`} />
          <Bar dataKey="averageCompletion" fill="#0a7b83" radius={[0, 10, 10, 0]} onClick={(entry) => onSelect(entry.managerId)} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

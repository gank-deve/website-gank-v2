"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const ACCENT = "var(--color-accent)";

export function PerformanceChart({
  data,
}: {
  data: Array<{ date: string; masuk: number; selesai: number }>;
}) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id="gradSelesai" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={ACCENT} stopOpacity={0.35} />
              <stop offset="100%" stopColor={ACCENT} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
            tickLine={false}
            axisLine={{ stroke: "var(--color-border-subtle)" }}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border-subtle)",
              borderRadius: 12,
              fontSize: 12,
              color: "var(--color-foreground)",
            }}
            labelStyle={{ color: "var(--color-muted-foreground)" }}
          />
          <Area
            type="monotone"
            dataKey="masuk"
            name="Order Masuk"
            stroke="var(--color-muted-foreground)"
            strokeWidth={1.5}
            strokeDasharray="4 3"
            fill="transparent"
          />
          <Area
            type="monotone"
            dataKey="selesai"
            name="Servis Selesai"
            stroke={ACCENT}
            strokeWidth={2.5}
            fill="url(#gradSelesai)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

const DONUT_COLORS = [
  "#2563eb",
  "#38bdf8",
  "#a78bfa",
  "#f472b6",
  "#fb923c",
  "#94a3b8",
];

export function DamageDonut({
  data,
}: {
  data: Array<{ name: string; value: number }>;
}) {
  if (data.length === 0) {
    return (
      <p className="flex h-72 items-center justify-center text-sm text-muted-foreground">
        Belum ada data kerusakan.
      </p>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius="55%"
            outerRadius="80%"
            paddingAngle={2}
            strokeWidth={0}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border-subtle)",
              borderRadius: 12,
              fontSize: 12,
              color: "var(--color-foreground)",
            }}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 12, color: "var(--color-muted-foreground)" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

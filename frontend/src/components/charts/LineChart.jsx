"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";

export default function LineChartComponent({ data }) {
  if (!data) return null;

  return (
    <div className="dashboard-card">
      <h2 className="dashboard-card-title">Events Over Time</h2>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
          <XAxis dataKey="time" tick={{ fill: '#A1A1AA', fontSize: 12 }} />
          <YAxis tick={{ fill: '#A1A1AA', fontSize: 12 }} />
          <Tooltip
            contentStyle={{ backgroundColor: "#111", border: "none", borderRadius: "6px", color: "#fff" }}
            labelStyle={{ color: "#ddd" }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="count"
            stroke="var(--chart-2, #3b82f6)"
            strokeWidth={2}
            dot
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}


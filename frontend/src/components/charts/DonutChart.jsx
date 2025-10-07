"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function DonutChartComponent({ data }) {
  if (!data || data.length === 0) return null;

  const COLORS = ["#f55359", "#e3df62", "#3b82f6"]; 

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const entry = payload[0];
      return (
        <div
          style={{
            backgroundColor: "#111",
            color: "#fff",
            padding: "8px 12px",
            borderRadius: "6px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
            fontSize: "14px",
            lineHeight: "1.4",
          }}
        >
          <div style={{ fontWeight: "600", marginBottom: "4px" }}>{entry.name}</div>
          <div>{entry.value} logs</div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="dashboard-card">
      <h2 className="dashboard-card-title">Severity Breakdown</h2>
      <ResponsiveContainer width="100%" height={300} className="mb-6">
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="label"
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={105}
            paddingAngle={4}
            label={({ name, percent }) =>
                `${name}: ${(percent * 100).toFixed(0)}%`
            }
            isAnimationActive={true}
          > 

            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: "12px" }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}


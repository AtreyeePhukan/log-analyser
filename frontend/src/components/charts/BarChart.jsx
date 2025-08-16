import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export default function BarChartComponent({ data }) {
  if (!data) return null;

  return (
    <div className="w-full min-h-[300px] bg-zinc-900 rounded-lg shadow p-4">
      <h2 className="text-white text-lg font-semibold mb-4">Event Types by IP</h2>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
          <XAxis dataKey="ip" tick={{ fill: '#A1A1AA', fontSize: 12 }} />
          <YAxis tick={{ fill: '#A1A1AA', fontSize: 12 }} />
          <Tooltip
            contentStyle={{ backgroundColor: "#111", border: "none", borderRadius: "6px", color: "#fff" }}
            labelStyle={{ color: "#ddd" }}
          />
          <Legend />
          <Bar dataKey="success" stackId="a" fill="#3b82f6" name="Success" />
          <Bar dataKey="anomaly" stackId="a" fill="#f87171" name="Anomaly" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}





// "use client"

// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   Legend,
//   CartesianGrid,
//   ResponsiveContainer
// } from "recharts";

// export default function BarChartComponent({ data }) {
//   if (!data) return null;

//   return (
//     <div className="w-full min-h-[250px]">
//       <ResponsiveContainer width="100%" height={250}>
//         <BarChart data={data}>
//           <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
//           <XAxis dataKey="ip" tick={{ fill: '#cbd5e1', fontSize: 12 }} />
//           <YAxis tick={{ fill: '#cbd5e1', fontSize: 12 }} />
//           <Tooltip
//             contentStyle={{ backgroundColor: "#0f172a", border: "none", borderRadius: "8px", color: "#fff" }}
//             labelStyle={{ color: "#cbd5e1" }}
//           />
//           <Legend />
//           <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
//         </BarChart>
//       </ResponsiveContainer>
//     </div>
//   );
// }


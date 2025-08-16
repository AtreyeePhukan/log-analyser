import React, { useEffect, useState } from "react";

const UserActivity = () => {
  const [logs, setLogs] = useState([]);
  const anomalyThreshold = 5; // change if needed

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8000/ws/logs");

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      // normalize boolean in case backend sends "true"/"false" strings
      data.is_anomaly = data.is_anomaly === true || data.is_anomaly === "true";
      setLogs((prev) => [data, ...prev].slice(0, 20));
    };

    return () => ws.close();
  }, []);

  const totalEvents = logs.length;
  const uniqueIPs = [...new Set(logs.map((a) => a.ip_address))].length;
  const anomalyCount = logs.filter(
    (l) => l.error_count_last_10min >= anomalyThreshold
  ).length;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="dashboard-header">
        <h1 className="dashboard-title">SUSPICIOUS ACTIVITY ANALYSIS</h1>
      </header>

      <main className="max-w-6xl mx-auto px-4 pt-8 pb-12 space-y-10">
        <div className="dashboard-grid rounded-xl">
          <div className="dashboard-card">
            <p className="text-xs text-gray-400 uppercase">Total Events</p>
            <p className="text-3xl font-bold">{totalEvents}</p>
          </div>
          <div className="dashboard-card">
            <p className="text-xs text-gray-400 uppercase">Unique IPs</p>
            <p className="text-3xl font-bold">{uniqueIPs}</p>
          </div>
          <div className="dashboard-card">
            <p className="text-xs text-gray-400 uppercase">Anomalies Detected</p>
            <p className="text-lg text-red-400">{anomalyCount}</p>
          </div>
        </div>

        <div className="dashboard-card chart-span">
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-separate border-spacing-0 border border-gray-700 text-sm text-white">
              <thead>
                <tr className="bg-gray-800">
                  <th className="px-4 py-3 border border-gray-700 text-left">IP Address</th>
                  <th className="px-4 py-3 border border-gray-700 text-left">Log Message</th>
                  <th className="px-4 py-3 border border-gray-700 text-center">Event</th>
                  <th className="px-4 py-3 border border-gray-700 text-center">Errors (10 min)</th>
                  <th className="px-4 py-3 border border-gray-700 text-left">Timestamp</th>
                  <th className="px-4 py-3 border border-gray-700 text-center">Anomaly</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, index) => (
                  <tr key={index} className="hover:bg-zinc-800">
                    <td className="px-4 py-2 border border-gray-700 break-words">{log.ip_address}</td>
                    <td className="px-4 py-2 border border-gray-700 break-words">{log.log_message}</td>
                    <td className="px-4 py-2 border border-gray-700 text-center">
                      {log.log_message?.toLowerCase().includes("failed") ? "Failed" : "Success"}
                    </td>
                    <td className="px-4 py-2 border border-gray-700 text-center">{log.error_count_last_10min}</td>
                    <td className="px-4 py-2 border border-gray-700 break-words">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-2 border border-gray-700 text-center">
                      {log.error_count_last_10min >= anomalyThreshold ? "⚠️" : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {logs.length === 0 && (
              <p className="text-gray-400 mt-4 text-center">
                Waiting for suspicious activity...
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserActivity;

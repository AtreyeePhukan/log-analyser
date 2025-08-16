import { useEffect, useState } from "react";
import "../index.css";
import PopupModal from "../components/PopupModal";
import Toast from "../components/Toast";

export default function Insights() {
  const [logs, setLogs] = useState([]);
  const [modalData, setModalData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8000/ws/insights");

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "log") {
        setLogs((prev) => [data.log, ...prev].slice(0, 21));
      }
    };

    return () => ws.close();
  }, []);

  const handleBlockIP = async (ip) => {
    await fetch(`http://localhost:8000/block_ip/${ip}`, { method: "POST" });
    // alert(`IP ${ip} blocked.`);
    setToast(`IP ${ip} blocked.`);
  };

  const handleAnalyse = async (log) => {
    const response = await fetch("http://localhost:8000/explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ log_message: log.log_message }),
    });
    const explanationData = await response.json();

    let action = "Monitor the log.";

    switch (explanationData.detection) {
      case "Unauthorized Access":
        action = "Block IP immediately and investigate credentials.";
        break;
      case "Malware Detected":
        action = "Isolate affected system and scan for malware.";
        break;
      case "Brute Force Attempt":
        action = "Implement login rate limiting and check access logs.";
        break;
      case "Password Attack":
        action = "Force password reset and monitor user activity.";
        break;
      case "Normal":
      default:
        action = "Monitor the log.";
    }

    setModalData({
    log: log.log_message,
    explanation: explanationData.explanation,
    severity: explanationData.detection,
    action,
    });
    setIsModalOpen(true);
    console.log("Received:", explanationData);
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <header className="dashboard-header">
        <div className="mb-4 text-center font-semibold bg-blue-600 text-white">
          <h1 className="dashboard-title">INSIGHTS</h1>
        </div>
      </header>

      <div className="dashboard-grid rounded-xl">
        {logs.length === 0 ? (
          <div className="dashboard-card">Waiting for logs...</div>
        ) : (
          logs.map((log, index) => (
            <div key={index} className="dashboard-card mb-4">
              <div className="flex items-center justify-between">
                <span
                  className={`px-2 py-1 rounded text-xs font-bold ${
                    log.detection !== "Normal"
                      ? "bg-red-700 text-white"
                      : "bg-green-600 text-black"
                  }`}
                >
                  {log.detection}
                </span>
                <span className="text-sm text-gray-400">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p className="mt-2">
                {log.log_message} from IP {log.ip_address}
              </p>
              <button
                onClick={() => handleBlockIP(log.ip_address)}
                tabIndex="-1"
                className="btn mt-2 inline-block px-3 py-1 rounded-full bg-gradient-to-r from-red-600 to-red-800 text-white text-xs font-semibold shadow hover:from-red-700 hover:to-red-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition"
              >
                Block IP
              </button>
              <button
                className="btn ml-2"
                onClick={() => handleAnalyse(log)}
              >
                Analyse
              </button>
            </div>
          ))
        )}
      </div>
    {isModalOpen && modalData && (
    <PopupModal
    open={isModalOpen}
    onClose={() => setIsModalOpen(false)}
    analysis={modalData}
    />
  )}

  {toast && (
    <Toast
      message={toast}
      onClose={() => setToast(null)}
    />
  )}
    </div>
  );
}





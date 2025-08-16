// import { useEffect, useState } from "react";

// export const useDashboardSocket = () => {
//   const [data, setData] = useState(null);
//   const [connected, setConnected] = useState(false);

//   useEffect(() => {
//     const dashboardSocket = new WebSocket("ws://localhost:8000/ws/dashboard");

//     dashboardSocket.onopen = () => {
//       console.log("WebSocket connected: dashboard");
//       setConnected(true);
//     };

//     dashboardSocket.onmessage = (event) => {
//       try {
//         const message = JSON.parse(event.data);
//         console.log("Dashboard message from server:", message);
//         setData(message);
//       } catch (e) {
//         console.error("Failed to parse dashboard WebSocket message:", e);
//       }
//     };

//     dashboardSocket.onerror = (err) => {
//       console.error("Dashboard WebSocket error:", err);
//     };

//     dashboardSocket.onclose = (event) => {
//       console.warn("Dashboard WebSocket closed:", event.reason || "No reason");
//       setConnected(false);
//     };

//     // User Activity WebSocket
//     const activitySocket = new WebSocket("ws://localhost:8000/ws/activity");

//     activitySocket.onopen = () => {
//       console.log("WebSocket connected: activity");
//       activitySocket.send("ping");

//       const pingInterval = setInterval(() => {
//         activitySocket.send("ping");
//       }, 30000);

//       activitySocket.onclose = () => {
//         console.warn("User Activity WebSocket closed");
//         clearInterval(pingInterval);
//       };
//     };

//     activitySocket.onerror = (err) => {
//       console.error("User Activity WebSocket error:", err);
//     };

//     return () => {
//       console.log("Closing both WebSockets");
//       dashboardSocket.close();
//       activitySocket.close();
//     };
//   }, []);

//   return { data, connected };
// };





import { useEffect, useState } from "react";

export const useDashboardSocket = () => {
  const [data, setData] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8000/ws/dashboard");

    socket.onopen = () => {
      console.log("WebSocket connected from React");
      setConnected(true);
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log("📨 Message from server:", message);
        setData(message);
      } catch (e) {
        console.error("Failed to parse WebSocket message:", e);
      }
    };

    socket.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    socket.onclose = (event) => {
      console.warn("WebSocket closed:", event.reason || "No reason");
      setConnected(false);
    };

    return () => {
      console.log("🔌 Closing WebSocket");
      socket.close();
    };
  }, []);

  return { data, connected };
};


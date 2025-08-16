import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import UserActivity from "./pages/UserActivity";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import Insights from "./pages/Insights";
import { useEffect } from "react";

function App() {
  useEffect(() => {

    if (!sessionStorage.getItem("appSessionStarted")) {
      localStorage.removeItem("hasUploadedOnce");
      localStorage.removeItem("logs");
      localStorage.removeItem("lineData");
      localStorage.removeItem("barData");
      localStorage.removeItem("donutData");

      sessionStorage.setItem("appSessionStarted", "true");
    }
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/sign-up" element={<SignUp />} />

          <Route
            path="/"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/user-activity"
            element={
              <PrivateRoute>
                <UserActivity />
              </PrivateRoute>
            }
          />
          <Route path="/insights" element={<Insights />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;





// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import Dashboard from "./pages/Dashboard";
// import UserActivity from "./pages/UserActivity"; 

// function App() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/" element={<Dashboard />} />
//         <Route path="/user-activity" element={<UserActivity />} /> 
//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App;



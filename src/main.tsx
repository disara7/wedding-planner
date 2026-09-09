import React from "react";
import ReactDOM from "react-dom/client";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import LoginScreen from "./auth/LoginScreen";
import Planner from "./pages/Planner";
import "./index.css";

function Gate() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="app-splash">
        <span className="app-splash__mark">💍</span>
        <span className="app-splash__text">Wedding Planner</span>
      </div>
    );
  }

  return user ? <Planner /> : <LoginScreen />;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <Gate />
    </AuthProvider>
  </React.StrictMode>
);

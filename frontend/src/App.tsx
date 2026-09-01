import { Navigate, Route, Routes } from "react-router-dom";
import { useAppSelector } from "./store";
import EligibilityDashboard from "./pages/EligibilityDashboard";
import LoginPage from "./pages/LoginPage";

export default function App() {
  const token = useAppSelector((s) => s.auth.token);

  return (
    <Routes>
      <Route path="/login" element={token ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/" element={token ? <EligibilityDashboard /> : <Navigate to="/login" replace />} />
    </Routes>
  );
}

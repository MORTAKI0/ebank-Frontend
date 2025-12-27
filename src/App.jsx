import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import ChangePasswordPage from "./pages/ChangePasswordPage.jsx";
import NewCustomerPage from "./pages/NewCustomerPage.jsx";
import NewAccountPage from "./pages/NewAccountPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import { AuthProvider } from "./auth/AuthContext.jsx";
import ProtectedRoute from "./auth/ProtectedRoute.jsx";

function App() {
  return (
    <AuthProvider>
      <Layout>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={["CLIENT", "AGENT_GUICHET"]}>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/change-password"
            element={
              <ProtectedRoute allowedRoles={["CLIENT", "AGENT_GUICHET"]}>
                <ChangePasswordPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers/new"
            element={
              <ProtectedRoute allowedRoles={["AGENT_GUICHET"]}>
                <NewCustomerPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/accounts/new"
            element={
              <ProtectedRoute allowedRoles={["AGENT_GUICHET"]}>
                <NewAccountPage />
              </ProtectedRoute>
            }
          />
          {/* Future routes:
            /clients/new
            /accounts/new
            /transfers/new
        */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Layout>
    </AuthProvider>
  );
}

export default App;

import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Layout from "./components/Layout";
import LoginPage from "./pages/Login";
import PrivateRoute from "./components/PrivateRoute";
import SignupPage from "./pages/Signup";
import { useAuth } from "./context/AuthContext";
import BAPBList from "./pages/bapb/BAPBList";
import BAPBCreate from "./pages/bapb/BAPBCreate";
import BAPBDetail from "./pages/bapb/BAPBDetail";
import BAPPList from "./pages/bapp/BAPPList";
import BAPPCreate from "./pages/bapp/BAPPCreate";
import BAPPDetail from "./pages/bapp/BAPPDetail";
import { getAllBAPB } from "./services/bapbService";
import { getAllBAPP } from "./services/bappService";

const Dashboard: React.FC = () => {
  const { userProfile } = useAuth();
  const [stats, setStats] = useState({
    totalBAPB: 0,
    totalBAPP: 0,
    pendingBAPB: 0,
    pendingBAPP: 0,
    approvedBAPB: 0,
    approvedBAPP: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const bapbResult = await getAllBAPB();
        const bappResult = await getAllBAPP();

        if (bapbResult.success && bapbResult.data) {
          const bapbData = bapbResult.data;
          setStats((prev) => ({
            ...prev,
            totalBAPB: bapbData.length,
            pendingBAPB: bapbData.filter((item) => item.status === "pending")
              .length,
            approvedBAPB: bapbData.filter((item) => item.status === "approved")
              .length,
          }));
        }

        if (bappResult.success && bappResult.data) {
          const bappData = bappResult.data;
          setStats((prev) => ({
            ...prev,
            totalBAPP: bappData.length,
            pendingBAPP: bappData.filter((item) => item.status === "pending")
              .length,
            approvedBAPP: bappData.filter((item) => item.status === "approved")
              .length,
          }));
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div
      className="page-bg-glass dashboard-container"
      style={{
        backgroundImage: `linear-gradient(135deg, rgba(102, 126, 234, 0.8) 0%, rgba(118, 75, 162, 0.8) 100%), url('/bg.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="dashboard">
        <div className="card">
          <h3>
            Selamat Datang{userProfile?.name ? `, ${userProfile.name}` : ""}!
          </h3>
          <p>
            Role: {userProfile?.role || "—"}
          </p>
        </div>
        <div className="card">
          <h3>Total BAPB</h3>
          <p className="stat-number">{stats.totalBAPB}</p>
        </div>
        <div className="card">
          <h3>Total BAPP</h3>
          <p className="stat-number">{stats.totalBAPP}</p>
        </div>
        <div className="card">
          <h3>Pending BAPB</h3>
          <p className="stat-number">{stats.pendingBAPB}</p>
        </div>
        <div className="card">
          <h3>Pending BAPP</h3>
          <p className="stat-number">{stats.pendingBAPP}</p>
        </div>
      </div>
    </div>
  );
};

const StatusBerkas: React.FC = () => {
  return (
    <div className="status-berkas-container">
      <h1>Status Berkas</h1>
      <p>
        Halaman untuk melihat status berkas BAPB dan BAPP.
      </p>
      {/* TODO: Implement status berkas content */}
    </div>
  );
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </PrivateRoute>
        }
      />

      {/* BAPB routes */}
      <Route
        path="/bapb"
        element={
          <PrivateRoute>
            <Layout>
              <BAPBList />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/bapb/new"
        element={
          <PrivateRoute>
            <Layout>
              <BAPBCreate />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/bapb/:id"
        element={
          <PrivateRoute>
            <Layout>
              <BAPBDetail />
            </Layout>
          </PrivateRoute>
        }
      />

      {/* BAPP routes */}
      <Route
        path="/bapp"
        element={
          <PrivateRoute>
            <Layout>
              <BAPPList />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/bapp/new"
        element={
          <PrivateRoute>
            <Layout>
              <BAPPCreate />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/bapp/:id"
        element={
          <PrivateRoute>
            <Layout>
              <BAPPDetail />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/status-berkas"
        element={
          <PrivateRoute>
            <Layout>
              <StatusBerkas />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;

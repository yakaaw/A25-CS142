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
import TambahLaporan from "./pages/TambahLaporan";
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
    <div className="dashboard-page">
      {/* Welcome Card */}
      <div className="welcome-card">
        <div className="welcome-avatar">
          <svg viewBox="0 0 24 24" fill="currentColor" className="welcome-avatar-icon">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        </div>
        <div className="welcome-info">
          <h2 className="welcome-title">
            Selamat Datang, {userProfile?.name || "User"}!
          </h2>
          <p className="welcome-role">
            Role: {userProfile?.role || "—"}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon stat-icon-blue">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 2l5 5h-5V4zM6 20V4h5v7h7v9H6z"/>
            </svg>
          </div>
          <div className="stat-info">
            <p className="stat-label">Total BAPB</p>
            <p className="stat-value">{stats.totalBAPB}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-blue">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 2l5 5h-5V4zM6 20V4h5v7h7v9H6z"/>
            </svg>
          </div>
          <div className="stat-info">
            <p className="stat-label">Total BAPP</p>
            <p className="stat-value">{stats.totalBAPP}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-purple">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
            </svg>
          </div>
          <div className="stat-info">
            <p className="stat-label">Pending BAPB</p>
            <p className="stat-value">{stats.pendingBAPB}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-purple">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
            </svg>
          </div>
          <div className="stat-info">
            <p className="stat-label">Pending BAPP</p>
            <p className="stat-value">{stats.pendingBAPP}</p>
          </div>
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

      <Route
        path="/tambah-laporan"
        element={
          <PrivateRoute>
            <Layout>
              <TambahLaporan />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;

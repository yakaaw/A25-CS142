import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Layout from "./components/Layout";
import LoginPage from "./pages/Login";
import PrivateRoute from "./components/PrivateRoute";
import SignupPage from "./pages/Signup";
import BAPBList from "./pages/bapb/BAPBList";
import BAPBCreate from "./pages/bapb/BAPBCreate";
import BAPBDetail from "./pages/bapb/BAPBDetail";
import BAPPList from "./pages/bapp/BAPPList";
import BAPPCreate from "./pages/bapp/BAPPCreate";
import BAPPDetail from "./pages/bapp/BAPPDetail";
import { ToastProvider } from "./context/ToastContext";
import MemberList from "./pages/admin/MemberList";
import RoleManager from "./pages/admin/RoleManager";
import SeedRoles from "./pages/admin/SeedRoles";

import Dashboard from "./pages/Dashboard";
import ProfileSettings from "./pages/settings/ProfileSettings";
import { useEffect, useState } from "react";
import { getAllBAPB } from "./services/bapbService";
import { getAllBAPP } from "./services/bappService";

const StatusBerkas: React.FC = () => {
  const [stats, setStats] = useState({
    totalBAPB: 0,
    totalBAPP: 0,
    pendingApproval: 0,
    completed: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [bapbResult, bappResult] = await Promise.all([
          getAllBAPB(),
          getAllBAPP()
        ]);

        const bapbData = bapbResult.success && bapbResult.data ? bapbResult.data : [];
        const bappData = bappResult.success && bappResult.data ? bappResult.data : [];

        const allDocs = [...bapbData, ...bappData];

        const pendingApproval = allDocs.filter(doc =>
          doc.status === 'pending' || doc.currentStage === 'waiting_pic' || doc.currentStage === 'waiting_direksi'
        ).length;

        const completed = allDocs.filter(doc => doc.status === 'approved').length;

        setStats({
          totalBAPB: bapbData.length,
          totalBAPP: bappData.length,
          pendingApproval,
          completed
        });
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="text-sm text-gray-500 mb-1">Dashboard / Status Berkas</div>
          <h1 className="text-2xl font-bold text-gray-900">Status Berkas</h1>
          <p className="text-gray-600">Monitoring status semua Berita Acara</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total BAPB</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalBAPB}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 text-xl">📄</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total BAPP</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalBAPP}</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-green-600 text-xl">📋</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Menunggu Approval</p>
              <p className="text-2xl font-bold text-orange-600">{stats.pendingApproval}</p>
            </div>
            <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <span className="text-orange-600 text-xl">⏳</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Selesai</p>
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-green-600 text-xl">✅</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Aktivitas Terbaru</h3>
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-4">📊</div>
          <p>Belum ada aktivitas Berita Acara</p>
          <p className="text-sm mt-2">Aktivitas akan muncul di sini setelah ada BA yang dibuat</p>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <ToastProvider>
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
        <Route
          path="/settings/profile"
          element={
            <PrivateRoute>
              <Layout>
                <ProfileSettings />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/settings/profile"
          element={
            <PrivateRoute>
              <Layout>
                <ProfileSettings />
              </Layout>
            </PrivateRoute>
          }
        />


        {/* BAPB routes */}
        <Route
          path="/bapb"
          element={
            <PrivateRoute requiredPermission="bapb.view">
              <Layout>
                <BAPBList />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/bapb/new"
          element={
            <PrivateRoute requiredPermission="bapb.create">
              <Layout>
                <BAPBCreate />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/bapb/:id"
          element={
            <PrivateRoute requiredPermission="bapb.view">
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
            <PrivateRoute requiredPermission="bapp.view">
              <Layout>
                <BAPPList />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/bapp/new"
          element={
            <PrivateRoute requiredPermission="bapp.create">
              <Layout>
                <BAPPCreate />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/bapp/:id"
          element={
            <PrivateRoute requiredPermission="bapp.view">
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


        {/* Admin Routes */}
        <Route
          path="/admin/members"
          element={
            <PrivateRoute requiredPermission="manage_users">
              <Layout>
                <MemberList />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/roles"
          element={
            <PrivateRoute requiredPermission="manage_roles">
              <Layout>
                <RoleManager />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/seed-roles"
          element={
            <Layout>
              <SeedRoles />
            </Layout>
          }
        />

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </ToastProvider>
  );
}

export default App;

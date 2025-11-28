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
import TambahLaporan from "./pages/TambahLaporan";
import { ToastProvider } from "./context/ToastContext";
import MemberList from "./pages/admin/MemberList";
import RoleManager from "./pages/admin/RoleManager";
import SeedRoles from "./pages/admin/SeedRoles";

import Dashboard from "./pages/Dashboard";
import ProfileSettings from "./pages/settings/ProfileSettings";

const StatusBerkas: React.FC = () => {
  return (
    <div className="status-berkas-container">
      <h1>Status Berkas</h1>
      <p>
        Halaman untuk melihat status berkas BAPB dan BAPP.
      </p>
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
            <PrivateRoute allowedRoles={['vendor']}>
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
            <PrivateRoute allowedRoles={['vendor']}>
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

        {/* Admin Routes */}
        <Route
          path="/admin/members"
          element={
            <PrivateRoute>
              <Layout>
                <MemberList />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/roles"
          element={
            <PrivateRoute>
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

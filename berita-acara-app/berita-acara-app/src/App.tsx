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
import StatusBerkas from "./pages/StatusBerkas";

import Dashboard from "./pages/Dashboard";
import ProfileSettings from "./pages/settings/ProfileSettings";
import ArchivePage from "./pages/ArchivePage";

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

        {/* Archive Route - Admin Only */}
        <Route
          path="/archive"
          element={
            <PrivateRoute requiredPermission="manage_users">
              <Layout>
                <ArchivePage />
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

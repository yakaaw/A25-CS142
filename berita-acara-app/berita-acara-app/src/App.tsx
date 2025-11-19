import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import './App.css';
import Layout from './components/Layout';
import LoginPage from './pages/Login';
import PrivateRoute from './components/PrivateRoute';
import SignupPage from './pages/Signup';
import { useAuth } from './context/AuthContext';
import BAPBList from './pages/bapb/BAPBList';
import BAPBCreate from './pages/bapb/BAPBCreate';
import BAPBDetail from './pages/bapb/BAPBDetail';
import BAPPList from './pages/bapp/BAPPList';
import BAPPCreate from './pages/bapp/BAPPCreate';
import BAPPDetail from './pages/bapp/BAPPDetail';

const Dashboard: React.FC = () => {
  const { userProfile, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout error', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Dashboard</h1>
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <h2 className="text-lg font-semibold text-blue-900">
              Selamat datang{userProfile?.name ? `, ${userProfile.name}` : ''}!
            </h2>
            <p className="text-blue-700 mt-1">
              Role: <span className="font-medium">{userProfile?.role || '—'}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Menu Utama</h3>
            <div className="space-y-3">
              <Link
                to="/bapb"
                className="block w-full bg-indigo-600 text-white text-center py-2 px-4 rounded hover:bg-indigo-700 transition-colors"
              >
                Kelola BAPB
              </Link>
              <Link
                to="/bapp"
                className="block w-full bg-green-600 text-white text-center py-2 px-4 rounded hover:bg-green-700 transition-colors"
              >
                Kelola BAPP
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Akun</h3>
            <button
              onClick={handleLogout}
              className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
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

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;

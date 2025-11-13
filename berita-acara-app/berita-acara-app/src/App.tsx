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
    <div style={{ padding: 20 }}>
      <h2>Dashboard</h2>
      <p>Selamat datang{userProfile?.name ? `, ${userProfile.name}` : ''}.</p>
      <p>Role: {userProfile?.role || '—'}</p>
      <div style={{ marginTop: 12 }}>
        <button onClick={handleLogout}>Logout</button>
      </div>
      <div style={{ marginTop: 16 }}>
        <Link to="/bapb">BAPB</Link> | <Link to="/bapp">BAPP</Link>
      </div>
      <div style={{ marginTop: 16 }}>
        <Link to="/">Kembali ke home</Link>
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

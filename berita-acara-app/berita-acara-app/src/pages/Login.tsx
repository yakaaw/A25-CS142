import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error', err);
      setError('Login gagal. Periksa email dan password.');
    }
    setLoading(false);
  };

  return (
    <div
      className="page-bg-glass auth-page p-4"
      style={{
        backgroundImage: `linear-gradient(135deg, rgba(102, 126, 234, 0.8) 0%, rgba(118, 75, 162, 0.8) 100%), url('/bg.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="glass-container">
        <form className="glass-form" onSubmit={handleSubmit}>
          <h2>Login - Berita Acara</h2>
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          <div className="input-group">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
            />
          </div>
          <div className="input-group">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Loading...' : 'Log In'}
          </button>
          <div className="form-footer">
            <p className="text-white text-opacity-80 text-sm">
              Belum punya akun?{' '}
              <Link to="/signup" className="text-green-400 hover:text-green-300 font-semibold">
                Daftar di sini
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;

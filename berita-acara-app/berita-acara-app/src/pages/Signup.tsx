import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const SignupPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('vendor');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signup(email.trim(), password, { name: name.trim(), role });
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Signup error', err);
      setError(err?.message || 'Gagal mendaftar');
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
          <h2>Daftar - Berita Acara</h2>
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          <div className="input-group">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama Lengkap"
              required
            />
          </div>
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
          <div className="input-group">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="vendor">Vendor</option>
              <option value="pic_gudang">PIC Gudang</option>
              <option value="pemesan">Pemesan</option>
              <option value="direksi">Direksi</option>
            </select>
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Mendaftar...' : 'Daftar'}
          </button>
          <div className="form-footer">
            <p className="text-white text-opacity-80 text-sm">
              Sudah punya akun?{' '}
              <Link to="/login" className="text-blue-400 hover:text-blue-300 font-semibold">
                Login di sini
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;

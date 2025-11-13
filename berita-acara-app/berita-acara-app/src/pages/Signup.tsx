import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
      await signup(email, password, { name, role });
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Signup error', err);
      setError(err?.message || 'Gagal mendaftar');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded shadow p-6">
        <h2 className="text-xl font-semibold text-center mb-4">Daftar - Berita Acara</h2>
        {error && <div className="text-red-600 bg-red-50 p-2 rounded mb-3">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nama</label>
            <input
              className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Nama lengkap"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="password"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <select
              className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="vendor">Vendor</option>
              <option value="pic_gudang">PIC Gudang</option>
              <option value="pemesan">Pemesan</option>
              <option value="direksi">Direksi</option>
            </select>
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex justify-center px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-60"
            >
              {loading ? 'Mendaftar...' : 'Daftar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;

import React from 'react';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const { userProfile, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold">Berita Acara</h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-sm text-gray-700">{userProfile?.name || userProfile?.email || 'Guest'}</div>
        <button
          onClick={handleLogout}
          className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Navbar;

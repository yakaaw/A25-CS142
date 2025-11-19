import React from 'react';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const { userProfile } = useAuth();

  return (
    <header className="glass px-6 py-4 flex items-center justify-between relative overflow-hidden">
      <div className="flex items-center gap-4 relative z-10">
        <h1 className="text-xl font-bold text-gradient">
          Berita Acara
        </h1>
      </div>
      <div className="flex items-center gap-4 relative z-10">
        <span className="text-sm font-medium text-white">{userProfile?.name || userProfile?.email || 'Guest'}</span>
      </div>
    </header>
  );
};

export default Navbar;


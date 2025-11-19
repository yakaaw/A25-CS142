import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar: React.FC = () => {
  const { logout } = useAuth();


  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  return (
    <aside className="w-64 glass p-6 flex flex-col h-full relative overflow-hidden">

      <div className="relative z-10 mb-8">
        <h2 className="text-lg font-bold text-gradient mb-6">
          Menu
        </h2>
      </div>

      <nav className="space-y-3 flex-1 relative z-10">
        <NavLink to="/dashboard" className="sidebar-link block px-4 py-3 rounded-xl text-white hover:bg-white hover:bg-opacity-20 transition-all duration-300" end>
          Dashboard
        </NavLink>

        <NavLink to="/bapb" className="sidebar-link block px-4 py-3 rounded-xl text-white hover:bg-white hover:bg-opacity-20 transition-all duration-300">
          BAPB
        </NavLink>

        <NavLink to="/bapp" className="sidebar-link block px-4 py-3 rounded-xl text-white hover:bg-white hover:bg-opacity-20 transition-all duration-300">
          BAPP
        </NavLink>

        <NavLink to="/status-berkas" className="sidebar-link block px-4 py-3 rounded-xl text-white hover:bg-white hover:bg-opacity-20 transition-all duration-300">
          Status Berkas
        </NavLink>
      </nav>

      <div className="mt-auto relative z-10">
        <button
          onClick={handleLogout}
          className="sidebar-link block px-4 py-3 rounded-xl text-white hover:bg-white hover:bg-opacity-20 transition-all duration-300 w-full text-left"
        >
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

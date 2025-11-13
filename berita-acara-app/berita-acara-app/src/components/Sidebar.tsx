import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar: React.FC = () => {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `block px-3 py-2 rounded ${isActive ? 'bg-indigo-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`;

  return (
    <aside className="w-56 bg-white border-r border-gray-200 p-4">
      <nav className="space-y-1">
        <NavLink to="/dashboard" className={linkClass} end>Dashboard</NavLink>
        <NavLink to="/bapb" className={linkClass}>BAPB</NavLink>
        <NavLink to="/bapp" className={linkClass}>BAPP</NavLink>
        <NavLink to="/bapb/new" className={linkClass}>Buat BAPB</NavLink>
        <NavLink to="/bapp/new" className={linkClass}>Buat BAPP</NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;

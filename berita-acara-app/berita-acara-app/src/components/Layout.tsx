import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen page-bg-glass">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 bg-transparent">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;

import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto bg-white rounded shadow-sm p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;

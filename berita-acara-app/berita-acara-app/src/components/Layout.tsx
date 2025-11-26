import React from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen page-bg-glass">
      <Navbar />
      <Sidebar />
      <main className="bg-transparent pt-36 px-6 pb-6">{children}</main>
    </div>
  );
};

export default Layout;

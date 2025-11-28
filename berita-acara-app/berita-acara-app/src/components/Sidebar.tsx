import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, FileText, File, FilePlus, LogOut, Shield, Users } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, permissions } = useAuth();

  const menuItems = [
    { to: "/dashboard", label: "Dashboard", icon: Home },
    { to: "/bapb", label: "BAPB", icon: FileText },
    { to: "/bapp", label: "BAPP", icon: FileText },
    { to: "/status-berkas", label: "Status Berkas", icon: File },
    { to: "/tambah-laporan", label: "Tambah Laporan", icon: FilePlus },
  ];

  const adminItems = [
    { to: "/admin/members", label: "Anggota", icon: Users },
    { to: "/admin/roles", label: "Akses Role", icon: Shield },
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <aside className="sidebar-vertical">
      <nav className="sidebar-nav-vertical">
        {menuItems.map((item) => {
          const isActive =
            location.pathname === item.to ||
            (item.to === "/dashboard" && location.pathname === "/");
          return (
            <button
              key={item.to}
              onClick={() => navigate(item.to)}
              className={`sidebar-item ${isActive ? "active" : ""}`}
            >
              <item.icon className="sidebar-item-icon" />
              <span className="sidebar-item-label">{item.label}</span>
            </button>
          );
        })}

        {/* Admin menu */}
        {(permissions.includes('manage_users') || permissions.includes('manage_roles')) && (
          <>
            <div className="sidebar-divider">Admin</div>
            {adminItems.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <button
                  key={item.to}
                  onClick={() => navigate(item.to)}
                  className={`sidebar-item ${isActive ? "active" : ""}`}
                >
                  <item.icon className="sidebar-item-icon" />
                  <span className="sidebar-item-label">{item.label}</span>
                </button>
              );
            })}
          </>
        )}

        <button onClick={handleLogout} className="sidebar-item sidebar-logout">
          <LogOut className="sidebar-item-icon" />
          <span className="sidebar-item-label">Logout</span>
        </button>
      </nav>
    </aside>
  );
};

export default Sidebar;

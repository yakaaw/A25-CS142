import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FileText, Home, File, CheckCircle } from "lucide-react";

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { to: "/dashboard", label: "Dashboard", icon: Home },
    { to: "/bapb", label: "BAPB", icon: File },
    { to: "/bapp", label: "BAPP", icon: File },
    { to: "/status-berkas", label: "Status Berkas", icon: CheckCircle },
  ];

  return (
    <aside className="sidebar glass">
      <div className="sidebar-header">
        <h2 className="sidebar-title">
          <FileText />
          Menu
        </h2>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const isActive =
            location.pathname === item.to ||
            (item.to === "/dashboard" && location.pathname === "/");
          return (
            <button
              key={item.to}
              onClick={() => navigate(item.to)}
              className={`sidebar-menu-item ${isActive ? "active" : ""}`}
            >
              <item.icon className={`sidebar-icon ${isActive ? "active" : ""}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;

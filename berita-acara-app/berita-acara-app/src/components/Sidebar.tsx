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
    <aside className="w-full glass px-6 py-4 flex items-center gap-6 fixed left-0 top-16 z-30 shadow-lg border-b border-white border-opacity-10">
      <div className="relative z-10">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
          <FileText className="text-white w-4 h-4" />
          Menu
        </h2>
      </div>

      <nav className="flex flex-row gap-3 items-center">
        {menuItems.map((item) => {
          const isActive =
            location.pathname === item.to ||
            (item.to === "/dashboard" && location.pathname === "/");
          return (
            <button
              key={item.to}
              onClick={() => navigate(item.to)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white hover:bg-white hover:bg-opacity-20 transition-all duration-300 group border border-white border-opacity-20 ${
                isActive
                  ? "bg-white bg-opacity-25 shadow-md"
                  : "bg-white bg-opacity-10"
              }`}
            >
              <item.icon
                className={`w-4 h-4 transition-colors duration-300 ${
                  isActive
                    ? "text-blue-300"
                    : "text-white group-hover:text-blue-200"
                }`}
              />
              <span className="font-medium text-sm whitespace-nowrap">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;

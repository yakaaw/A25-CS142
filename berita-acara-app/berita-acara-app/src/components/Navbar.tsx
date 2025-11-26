import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { FileText, LogOut, ChevronDown } from "lucide-react";

const Navbar: React.FC = () => {
  const { userProfile, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);


  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return 'G';
  };

  return (
    <header className="navbar-header glass">
      <div className="navbar-left">
        <div className="navbar-brand">
          <div className="navbar-icon">
            <FileText />
          </div>
          <h1 className="navbar-title text-gradient">Berita Acara</h1>
        </div>
      </div>

      <div className="navbar-right">
        <div className="navbar-user-menu">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="navbar-user-button glass-button"
          >
            <div className="navbar-avatar">
              {getInitials(userProfile?.name, userProfile?.email)}
            </div>
            <span className="navbar-username">
              {userProfile?.name || userProfile?.email || "Guest"}
            </span>
            <ChevronDown className={`navbar-chevron ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDropdownOpen && (
            <div className="navbar-dropdown glass-card">
              <div className="navbar-dropdown-header">
                <p className="navbar-dropdown-name">{userProfile?.name || "Guest"}</p>
                <p className="navbar-dropdown-email">{userProfile?.email}</p>
                <p className="navbar-dropdown-role">Role: {userProfile?.role || "—"}</p>
              </div>
              <button
                onClick={handleLogout}
                className="navbar-logout-btn"
              >
                <LogOut />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Overlay to close dropdown */}
      {isDropdownOpen && (
        <div
          className="navbar-overlay"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </header>
  );
};

export default Navbar;

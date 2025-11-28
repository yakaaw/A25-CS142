import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { Bell, User, ChevronDown, LogOut, Settings } from "lucide-react";

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

  return (
    <header className="navbar-new">
      <div className="navbar-brand-new">
        <h1 className="navbar-title-new">Berita Acara System</h1>
      </div>

      <div className="navbar-actions">
        <button className="navbar-icon-btn">
          <Bell className="navbar-icon-svg" />
        </button>
        <button className="navbar-icon-btn">
          <User className="navbar-icon-svg" />
        </button>

        <div className="navbar-user-section">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="navbar-user-btn"
          >
            <span className="navbar-user-name">
              {userProfile?.name || userProfile?.email || "Guest"}
            </span>
            <ChevronDown className={`navbar-chevron-icon ${isDropdownOpen ? 'rotated' : ''}`} />
          </button>

          {isDropdownOpen && (
            <div className="navbar-dropdown-new">
              <div className="navbar-dropdown-info">
                <p className="dropdown-name">{userProfile?.name || "Guest"}</p>
                <p className="dropdown-email">{userProfile?.email}</p>
                <p className="dropdown-role">Role: {userProfile?.role || "—"}</p>
              </div>

              <Link to="/settings/profile" className="dropdown-item-btn" onClick={() => setIsDropdownOpen(false)}>
                <Settings className="dropdown-icon" size={16} />
                Pengaturan Profil
              </Link>

              <button onClick={handleLogout} className="dropdown-logout-btn">
                <LogOut className="dropdown-logout-icon" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {isDropdownOpen && (
        <div className="navbar-overlay-new" onClick={() => setIsDropdownOpen(false)} />
      )}
    </header>
  );
};

export default Navbar;

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
    <header className="glass px-6 py-4 flex items-center justify-between relative overflow-hidden shadow-lg">
      <div className="flex items-center gap-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white bg-opacity-20 rounded-lg">
            <FileText className="text-white text-xl" />
          </div>
          <h1 className="text-xl font-bold text-gradient hidden sm:block">Berita Acara</h1>
        </div>

      </div>

      <div className="flex items-center gap-4 relative z-10">
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 glass-button px-4 py-2 rounded-lg hover:bg-opacity-30 transition-all duration-300"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {getInitials(userProfile?.name, userProfile?.email)}
            </div>
            <span className="text-sm font-medium text-white hidden md:block">
              {userProfile?.name || userProfile?.email || "Guest"}
            </span>
            <ChevronDown className={`text-white transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 glass-card py-2 shadow-xl z-50">
              <div className="px-4 py-2 border-b border-white border-opacity-20">
                <p className="text-sm font-medium text-white">{userProfile?.name || "Guest"}</p>
                <p className="text-xs text-white text-opacity-70">{userProfile?.email}</p>
                <p className="text-xs text-white text-opacity-70 capitalize">Role: {userProfile?.role || "—"}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-white hover:bg-opacity-20 transition-all duration-300 text-left"
              >
                <LogOut className="text-lg" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Overlay to close dropdown */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </header>
  );
};

export default Navbar;

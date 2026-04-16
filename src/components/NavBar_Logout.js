import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "./logo_new.png";
import { useAuth } from "./AuthContext";

const NavBar_Logout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, userType, userId, isAuthenticated } = useAuth();

  const handleDashboardNavigation = () => {
    if (!userType || !userId) return;
    navigate(`/${userType}/${userId}`);
  };

   const handleProfileNavigation = () => {
    if (!userType || !userId) return;
    navigate(`/${userType}/${userId}/view${userType}profile`);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const showLogoTitle = !(
    location.pathname === "/" ||
    (location.pathname === "/login" && isAuthenticated)
  );

  return (
    <nav className="bg-white text-gray-800 shadow-sm border-b border-gray-200">
      <div className="mx-auto px-6 md:px-20">
        <div className="flex items-center justify-between h-24">
          
          {/* Logo */}
          {showLogoTitle && (
            <div className="w-1/3">
              <img
                className="h-14 w-auto cursor-pointer"
                src={logo}
                alt="Logo"
                onClick={() => navigate("/")}
              />
            </div>
          )}

          {/* Title */}
          {showLogoTitle && (
            <div className="w-1/3 text-center">
              <span
                className="text-3xl md:text-5xl font-bold cursor-pointer"
                onClick={() => navigate("/")}
              >
                <span className="text-[#FF6D4D]">MEDI</span>
                <span className="text-[#0B8FAC]">TIMELINE</span>
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="w-1/3 flex justify-end space-x-6">
            {userType && userId && (
              <button
                onClick={handleDashboardNavigation}
                className="text-lg font-medium hover:text-[#FF6D4D] transition-colors"
              >
                Dashboard
              </button>
            )}
            {userType && userId && (
              <button
                onClick={handleProfileNavigation}
                className="text-lg font-medium hover:text-[#FF6D4D] transition-colors"
              >
                Profile
              </button>
            )}
            <button
              onClick={handleLogout}
              className="text-lg font-medium text-gray-700 bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Logout
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
};

export default NavBar_Logout;

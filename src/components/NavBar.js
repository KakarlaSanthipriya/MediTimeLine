import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "./logo_new.png";
import { useAuth } from "./AuthContext";

const NavBar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout, userType, userId, loading } = useAuth();

  if (loading) return null;

  return (
    <nav className="bg-white text-gray-800 shadow-sm border-b border-gray-200">
      <div className="mx-auto px-20">
        <div className="flex items-center justify-between h-24">
          
          {/* Logo */}
          <div className="w-1/3">
            <img
              className="h-16 w-auto cursor-pointer"
              src={logo}
              alt="Logo"
              onClick={() => navigate("/")}
            />
          </div>

          {/* Title */}
          <div className="w-1/3 text-center">
            <span
              className="text-5xl font-bold cursor-pointer"
              onClick={() => navigate("/")}
            >
              <span className="text-[#FF6D4D]">MEDI</span>
              <span className="text-[#0B8FAC]">TIMELINE</span>
            </span>
          </div>

          {/* Right Menu */}
          <div className="w-1/3 hidden md:flex justify-end space-x-8">
            {!isAuthenticated ? (
              <>
                <button className="text-lg font-medium hover:text-[#FF6D4D] transition-colors" onClick={() => navigate("/")}>Home</button>
                <button className="text-lg font-medium hover:text-[#FF6D4D] transition-colors" onClick={() => navigate("/AboutPage")}>About Us</button>
                <button
                  className="text-[#FF6D4D] text-lg font-medium"
                  onClick={() => navigate("/register")}
                >
                  Register
                </button>
                <button className="text-lg font-medium hover:text-[#FF6D4D] transition-colors" onClick={() => navigate("/login")}>Login</button>
              </>
            ) : (
              <>
                <button className="text-lg font-medium hover:text-[#FF6D4D] transition-colors" onClick={() => navigate(`/${userType}/${userId}`)}>
                  Dashboard
                </button>
                <button
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                  className="px-4 py-2 bg-gray-100 rounded-lg"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;

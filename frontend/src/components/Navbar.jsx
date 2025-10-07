import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { FaDatabase, FaPowerOff } from "react-icons/fa";
import companyLogo from "../Assets/logo1.jpg";
import DatabaseLoginModal from "./DatabaseLoginModal";
import { toast } from "react-toastify";

export default function Navbar({ user }) {
  const navigate = useNavigate();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate("/"); // Redirect to homepage or login screen after sign out
    } catch (error) {
      toast.error("Sign-out error");
    }
  };

  const handleDatabaseClick = () => {
    setIsLoginModalOpen(true);
  };

  return (
    <>
      <nav className="bg-white text-gray-800 px-6 py-3 flex justify-between items-center shadow-lg">
        {/* Left - Logo */}
        <div className="flex items-center">
          <Link to="/">
            <img
              src={companyLogo}
              alt="Company Logo"
              className="h-20 w-auto object-contain"
              style={{ maxWidth: "200px" }}
            />
          </Link>
        </div>

        {/* Center - Company Name */}
        <div className="absolute left-1/2 transform -translate-x-1/2 text-3xl font-bold">
          Bestway Real Estate Ltd., Brokerage
        </div>

        {/* Right - Database Icon and Sign Out Button */}
        <div className="flex items-center space-x-4">
          <button
            onClick={handleDatabaseClick}
            className="text-3xl hover:text-blue-900 transition-colors"
            title="Database"
          >
            <FaDatabase />
          </button>
          <button
            onClick={handleSignOut}
            className="bg-gray-600 hover:bg-blue-900 text-white px-4 py-2 rounded-md transition-colors duration-200 flex items-center space-x-2"
            title="Sign Out"
          >
            <FaPowerOff className="text-lg" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </nav>

      <DatabaseLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </>
  );
}

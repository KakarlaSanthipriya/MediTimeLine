import React, { useState } from "react";
import Web3 from "web3";
import DoctorRegistration from "../build/contracts/DoctorRegistration.json";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext"; // use correct path
import NavBar from "./NavBar";
import "../CSS/DoctorLoginPage.css";

const DoctorLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); 
  const [hhNumber, sethhNumber] = useState("");
  const [password, setPassword] = useState("");
  const [hhNumberError, sethhNumberError] = useState("");

  const handlehhNumberChange = (e) => {
    const input = e.target.value;
    const regex = /^\d{6}$/; 
    if (regex.test(input)) {
      sethhNumber(input);
      sethhNumberError("");
    } else {
      sethhNumber(input);
      sethhNumberError("Please enter a 6-digit HH Number.");
    }
  };

  const handleLogin = async () => {
    try {
      const web3 = new Web3(window.ethereum);
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = DoctorRegistration.networks[networkId];
      const contract = new web3.eth.Contract(
        DoctorRegistration.abi,
        deployedNetwork && deployedNetwork.address
      );

      // Check if doctor is registered
      const isRegistered = await contract.methods.isRegisteredDoctor(hhNumber).call();
      if (!isRegistered) {
        alert("Doctor not registered");
        return;
      }

      // Validate password
      const isValidPassword = await contract.methods.validatePassword(hhNumber, password).call();
      if (!isValidPassword) {
        alert("Incorrect password");
        return;
      }

      // Get doctor details
      const doctorDetails = await contract.methods.getDoctorDetails(hhNumber).call();

      // Update context & localStorage
      login("doctor", hhNumber, window.ethereum.selectedAddress);

      // Redirect to doctor dashboard
      navigate("/doctor/" + hhNumber);
    } catch (error) {
      console.error("Login error:", error);
      alert("An error occurred while logging in.");
    }
    
  };
  const cancelOperation = () => {
    navigate("/");
  };

  return (
    <div>
          <NavBar />
          <div className="bg-white font-sans min-h-screen flex flex-col">
          <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8">
              <div className="text-center">
                <h2 className="text-4xl font-extrabold text-gray-900">
                  Doctor Login
                </h2>
                <p className="mt-2 text-lg text-gray-600">
                  Sign in to manage reports and requests.
                </p>
              </div>
    
              {/* --- STYLING CHANGE: Form container is now a light-themed card --- */}
              <div className="mt-8 bg-gray-50 p-8 rounded-2xl shadow-lg space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700" htmlFor="hhNumber">
                    Doctor ID
                  </label>
                  <input
                    id="hhNumber"
                    name="hhNumber"
                    type="text"
                    required
                    className={`block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#0B8FAC] sm:text-sm ${hhNumberError ? "border-red-500" : "border-gray-300"}`}
                    placeholder="Enter center's 6-digit Number"
                    value={hhNumber}
                    onChange={handlehhNumberChange}
                  />
                  {hhNumberError && (
                    <p className="text-red-500 text-xs mt-1">{hhNumberError}</p>
                  )}
                </div>
    
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700" htmlFor="password">Password</label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter your Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#0B8FAC] focus:border-[#0B8FAC] sm:text-sm"
                    required
                  />
                </div>
    
                {/* --- STYLING CHANGE: Buttons styled to match the new theme --- */}
                <div className="flex flex-col space-y-4 pt-4">
                  <button onClick={handleLogin}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#FF6D4D] hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF6D4D]"
                  >
                    Login
                  </button>
                  <button
                    onClick={cancelOperation}
                    className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </main>
        </div>
        </div>
  );
};

export default DoctorLogin;

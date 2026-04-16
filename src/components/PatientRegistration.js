import React, { useState, useEffect } from "react";
import Web3 from "web3";
import PatientRegistration from "../build/contracts/PatientRegistration.json";
import { useNavigate } from "react-router-dom";
import "../CSS/PatientRegistration.css";
import NavBar from "./NavBar";

const PatientRegistry = () => {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [name, setName] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [homeAddress, setHomeAddress] = useState("");
  const [hhNumber, sethhNumber] = useState("");
  const [hhNumberError, sethhNumberError] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [gender, setGender] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [bg, setBloodGroup] = useState("");
  const [email, setEmail] = useState(""); 
  const [emailError, setEmailError] = useState("");
  const [password, setPassword] = useState(""); // Define password state variable
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        try {
          await window.ethereum.enable();
          setWeb3(web3Instance);

          const networkId = await web3Instance.eth.net.getId();
          const deployedNetwork = PatientRegistration.networks[networkId];
          const contractInstance = new web3Instance.eth.Contract(
            PatientRegistration.abi,
            deployedNetwork && deployedNetwork.address
          );

          setContract(contractInstance);
          const nextHH = await contractInstance.methods
            .getNextPatientHH()
            .call();

          sethhNumber(nextHH);
          console.log(nextHH);
        } catch (error) {
          console.error("User denied access to accounts.");
        }
      } else {
        console.log("Please install MetaMask extension");
      }
    };

    init();
  }, []);

  const handleRegister = async () => {
    if (
      !walletAddress ||
      !name ||
      !dateOfBirth ||
      !homeAddress ||
      !hhNumber ||
      !gender ||
      !bg ||
      !email ||
      !walletAddress ||
      !password ||
      !confirmPassword
    ) {
      alert(
        "You have missing input fields. Please fill in all the required fields."
      );
      return;
    }

    if (hhNumber.length !== 6) {
      alert(
        "You have entered a wrong HH Number. Please enter a 6-digit HH Number."
      );
      return;
    }

    // Password validation: minimum length
    if (password.length < 8) {
    setPassword("");
    setConfirmPassword("");
    setPasswordError("Password must be atleast 8 characters long.");
    return;
    }

    if (password !== confirmPassword) {
      setConfirmPassword("");
      setConfirmPasswordError("Passwords do not match.");
      return;
    }

    // Check if dateOfBirth is in the format dd/mm/yyyy
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    if (!datePattern.test(dateOfBirth)) {
      alert("Please enter Date of Birth in the format dd/mm/yyyy");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address.");
      return;
    } else {
      setEmailError(""); // Clear email error if valid
    }

    // Password validation: minimum length
    if (password.length < 8) {
      alert("Password must be at least 8 characters long.");
      return;
    }

      
    try {
      const web3 = new Web3(window.ethereum);

      const networkId = await web3.eth.net.getId();

      const contract = new web3.eth.Contract(
        PatientRegistration.abi,
        PatientRegistration.networks[networkId].address
      );

      const isRegPatient = await contract.methods
        .isRegisteredPatient(hhNumber)
        .call();

      if (isRegPatient) {
        alert("Patient already exists");
        return;
      }

      await contract.methods
      .registerPatient(
        walletAddress,
        name,
        dateOfBirth,
        gender,
        bg,
        homeAddress,
        email,
        password
      )
      .send({ from: walletAddress });

      alert("Patient registered successfully!");
      navigate("/");
      } catch (error) {
        console.error("Error:", error);
        alert("An error occurred while registering the doctor.");
      }
  };
  

  const handleEmailChange = (e) => {
    const inputEmail = e.target.value;
    setEmail(inputEmail);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setPasswordError("");
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    setConfirmPasswordError("");
  };

  const handlehhNumberChange = (e) => {
    const inputhhNumber = e.target.value;
    const phoneRegex = /^\d{6}$/;
    if (phoneRegex.test(inputhhNumber)) {
      sethhNumber(inputhhNumber);
      sethhNumberError("");
    } else {
      sethhNumber(inputhhNumber);
      sethhNumberError("Please enter a 6-digit HH Number.");
    }
  };

  const cancelOperation = () => {
    navigate("/");
  };

  return (
    <div>
    <NavBar></NavBar>
    <div className="bg-white font-sans min-h-screen flex flex-col">
    <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-4xl space-y-8">
                    <div className="text-center">
                        <h2 className="text-4xl font-extrabold text-gray-900">
                            Create a Secure Patient Account
                        </h2>
                        <p className="mt-2 text-lg text-gray-600">
                            Fill in the details below to register on the blockchain.
                        </p>
                    </div>

                    {/* --- STYLING CHANGE: Updated form container and field styles --- */}
                    <form className="mt-8 bg-gray-50 p-8 rounded-2xl shadow-lg grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        
                        {/* --- NO LOGIC CHANGE, ONLY STYLING --- */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700" htmlFor="walletAddress">Wallet Public Address</label>
                            <input
                                type="text"
                                id="walletAddress"
                                name="walletAddress"
                                placeholder="0x..."
                                value={walletAddress}
                                onChange={(e) => setWalletAddress(e.target.value)}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#0B8FAC] focus:border-[#0B8FAC] sm:text-sm"
                            />
                        </div>

                        {/* --- NO LOGIC CHANGE, ONLY STYLING --- */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700" htmlFor="name">Full Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                placeholder="e.g., John Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#0B8FAC] focus:border-[#0B8FAC] sm:text-sm"
                            />
                        </div>

                        {/* --- NO LOGIC CHANGE, ONLY STYLING --- */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700" htmlFor="dateOfBirth">Date of Birth</label>
                            <input
                                id="dateOfBirth"
                                name="dateOfBirth"
                                type="date"
                                required
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#0B8FAC] focus:border-[#0B8FAC] sm:text-sm"
                                value={dateOfBirth}
                                onChange={(e) => setDateOfBirth(e.target.value)}
                            />
                        </div>

                        {/* --- NO LOGIC CHANGE, ONLY STYLING --- */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700" htmlFor="gender">Gender</label>
                            <select
                                id="gender"
                                name="gender"
                                required
                                value={gender}
                                onChange={(e) => setGender(e.target.value)}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#0B8FAC] focus:border-[#0B8FAC] sm:text-sm"
                            >
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        
                        {/* --- NO LOGIC CHANGE, ONLY STYLING --- */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700" htmlFor="bg">Blood Group</label>
                            <select
                                id="bg"
                                name="bg"
                                required
                                value={bg}
                                onChange={(e) => setBloodGroup(e.target.value)}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#0B8FAC] focus:border-[#0B8FAC] sm:text-sm"
                            >
                                <option value="">Select Blood Group</option>
                                <option value="A+">A+</option> <option value="A-">A-</option>
                                <option value="B+">B+</option> <option value="B-">B-</option>
                                <option value="O+">O+</option> <option value="O-">O-</option>
                                <option value="AB+">AB+</option> <option value="AB-">AB-</option>
                            </select>
                        </div>

                        {/* --- NO LOGIC CHANGE, ONLY STYLING --- */}
                         <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700" htmlFor="homeAddress">Home Address</label>
                            <input
                                type="text"
                                id="homeAddress"
                                name="homeAddress"
                                placeholder="e.g., 123 Health St, Medville"
                                value={homeAddress}
                                onChange={(e) => setHomeAddress(e.target.value)}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#0B8FAC] focus:border-[#0B8FAC] sm:text-sm"
                            />
                        </div>

                        {/* --- NO LOGIC CHANGE, ONLY STYLING --- */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700" htmlFor="hhNumber">Patient ID</label>
                            <input
        id="hhNumber"
        name="hhNumber"
        type="text"
        value={hhNumber}
        readOnly
        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed"
      />
                        </div>

                        {/* --- NO LOGIC CHANGE, ONLY STYLING --- */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700" htmlFor="email">Email Address</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className={`block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#0B8FAC] sm:text-sm ${emailError ? "border-red-500" : "border-gray-300"}`}
                                placeholder="you@example.com"
                                value={email}
                                onChange={handleEmailChange}
                            />
                            {emailError && <p className="text-red-500 text-xs mt-1">{emailError}</p>}
                        </div>

                        {/* --- NO LOGIC CHANGE, ONLY STYLING --- */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700" htmlFor="password">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className={`block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#0B8FAC] sm:text-sm ${passwordError ? "border-red-500" : "border-gray-300"}`}
                                placeholder="Minimum 8 characters"
                                value={password}
                                onChange={handlePasswordChange}
                            />
                            {passwordError && <p className="text-red-500 text-xs mt-1">{passwordError}</p>}
                        </div>

                        {/* --- NO LOGIC CHANGE, ONLY STYLING --- */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700" htmlFor="confirmPassword">Confirm Password</label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                required
                                className={`block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#0B8FAC] sm:text-sm ${confirmPasswordError ? "border-red-500" : "border-gray-300"}`}
                                placeholder="Re-enter your password"
                                value={confirmPassword}
                                onChange={handleConfirmPasswordChange}
                            />
                            {confirmPasswordError && <p className="text-red-500 text-xs mt-1">{confirmPasswordError}</p>}
                        </div>

                        {/* --- STYLING CHANGE: Buttons now span full form width and match new theme --- */}
                        <div className="md:col-span-2 flex items-center justify-end space-x-4 pt-4">
                            <button
                                type="button"
                                onClick={cancelOperation}
                                className="px-6 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
                            >
                                Close
                            </button>
                            <button
                                type="button"
                                onClick={handleRegister}
                                disabled={!contract || isLoading}
                                className="px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#FF6D4D] hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF6D4D] disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {isLoading ? "Registering..." : "Register"}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
            </div>
      </div>
  );
};

export default PatientRegistry;

import React, { useState, useEffect } from "react";
import Web3 from "web3";
import DiagnosticRegistration from "../build/contracts/DiagnosticRegistration.json";
import { useNavigate } from "react-router-dom";
import "../CSS/DoctorRegistration.css";
import NavBar from "./NavBar";

const DiagnosticRegistry = () => {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [diagnosticAddress, setDiagnosticAddress] = useState("");
  const [diagnosticName, setDiagnosticName] = useState("");
  const [hospitalName, setHospitalName] = useState("");
  const [diagnosticLocation, setDiagnosticLocation] = useState("");
  const [hhNumber, sethhNumber] = useState("");
  const [hhNumberError, sethhNumberError] = useState("");
  const [password, setPassword] = useState(""); 
  const [passwordError, setPasswordError] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [email, setEmail] = useState(""); 
  const [emailError, setEmailError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        try {
          await window.ethereum.enable();
          setWeb3(web3Instance);

          const networkId = await web3Instance.eth.net.getId();
          const deployedNetwork = DiagnosticRegistration.networks[networkId];
          const contractInstance = new web3Instance.eth.Contract(
            DiagnosticRegistration.abi,
            deployedNetwork && deployedNetwork.address
          );

          setContract(contractInstance);
          const nextHH = await contractInstance.methods
            .getNextDiagnosticHH()
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
      !diagnosticAddress ||
      !diagnosticName ||
      !hospitalName ||
      !diagnosticLocation ||
      !email ||
      !hhNumber ||
      !password ||
      !confirmPassword
    ) {
      alert(
        "You have missing input fields. Please fill in all the required fields."
      );
      return;
    }

     if (password.length < 8) {
      setPassword("");
      setConfirmPassword("");
      setPasswordError("Password must be atleast 8 characters long.");
      return;
      }

    if (password.length < 8) {
    alert("Password must be at least 8 characters long.");
    return;
    }
    
    if (password !== confirmPassword) {
      setConfirmPassword("");
      setConfirmPasswordError("Passwords do not match.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address.");
      return;
    } else {
      setEmailError(""); 
    }
      
    try {
      const web3 = new Web3(window.ethereum);

      const networkId = await web3.eth.net.getId();

      const contract = new web3.eth.Contract(
        DiagnosticRegistration.abi,
        DiagnosticRegistration.networks[networkId].address
      );

      const isRegDoc = await contract.methods
        .isRegisteredDiagnostic(hhNumber)
        .call();

      if (isRegDoc) {
        alert("Diagnostic already exists");
        return;
      }

      await contract.methods
        .registerDiagnostic(
          diagnosticName,
          hospitalName,
          diagnosticLocation,
          email,
          password 
        )
        .send({ from: diagnosticAddress });

      alert("Diagnostic registered successfully!");
      navigate("/");
      } catch (error) {
        console.error("Error:", error);
        alert("An error occurred while registering the diagnostic.");
      }
  };
  
  const handleEmailChange = (e) => {
    const inputEmail = e.target.value;
    setEmail(inputEmail);
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
  
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setPasswordError("");
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    setConfirmPasswordError("");
  };
  
  
  const cancelOperation = () => {
    navigate("/");
  };

  return (
    <div >
    <NavBar></NavBar>
    <div className="bg-white font-sans min-h-screen flex flex-col">
    <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-4xl space-y-8">
                    <div className="text-center">
                        <h2 className="text-4xl font-extrabold text-gray-900">
                            Diagnostic Center Registration
                        </h2>
                        <p className="mt-2 text-lg text-gray-600">
                            Register your center to connect with patients and providers on the network.
                        </p>
                    </div>

                    {/* --- STYLING CHANGE: Updated form container and field styles --- */}
                    <form className="mt-8 bg-gray-50 p-8 rounded-2xl shadow-lg grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700" htmlFor="diagnosticAddress">Wallet Public Address</label>
                            <input id="diagnosticAddress" type="text" required className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#0B8FAC] focus:border-[#0B8FAC] sm:text-sm" placeholder="Crypto Wallet Public Address" value={diagnosticAddress} onChange={(e) => setDiagnosticAddress(e.target.value)} />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700" htmlFor="diagnosticName">Diagnostic Center Name</label>
                            <input id="diagnosticName" type="text" required className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#0B8FAC] focus:border-[#0B8FAC] sm:text-sm" placeholder="Enter Diagnostic's Center Full Name" value={diagnosticName} onChange={(e) => setDiagnosticName(e.target.value)} />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700" htmlFor="hospitalName">Affiliated Hospital Name</label>
                            <input id="hospitalName" type="text" required className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#0B8FAC] focus:border-[#0B8FAC] sm:text-sm" placeholder="Enter Hospital Name" value={hospitalName} onChange={(e) => setHospitalName(e.target.value)} />
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700" htmlFor="diagnosticLocation">Location</label>
                            <input id="diagnosticLocation" type="text" placeholder="Enter the location of Diagnostic center" value={diagnosticLocation} onChange={(e) => setDiagnosticLocation(e.target.value)} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#0B8FAC] focus:border-[#0B8FAC] sm:text-sm" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700" htmlFor="email">Email Address</label>
                            <input id="email" type="email" required className={`block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#0B8FAC] sm:text-sm ${emailError ? 'border-red-500' : 'border-gray-300'}`} placeholder="Enter your Email-id" value={email} onChange={handleEmailChange} />
                            {emailError && <p className="text-red-500 text-xs mt-1">{emailError}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700" htmlFor="hhNumber">Diagnostic ID</label>
                            <input
        id="hhNumber"
        name="hhNumber"
        type="text"
        value={hhNumber}
        readOnly
        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed"
      />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700" htmlFor="password">Password</label>
                            <input id="password" type="password" required className={`block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#0B8FAC] sm:text-sm ${passwordError ? 'border-red-500' : 'border-gray-300'}`} placeholder="Enter your Password" value={password} onChange={handlePasswordChange} />
                            {passwordError && <p className="text-red-500 text-xs mt-1">{passwordError}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700" htmlFor="confirmPassword">Confirm Password</label>
                            <input id="confirmPassword" type="password" required className={`block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#0B8FAC] sm:text-sm ${confirmPasswordError ? 'border-red-500' : 'border-gray-300'}`} placeholder="Confirm your Password" value={confirmPassword} onChange={handleConfirmPasswordChange} />
                            {confirmPasswordError && <p className="text-red-500 text-xs mt-1">{confirmPasswordError}</p>}
                        </div>

                        <div className="md:col-span-2 flex items-center justify-end space-x-4 pt-4">
                            <button type="button" onClick={cancelOperation} className="px-6 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400">
                                Close
                            </button>
                            <button type="button" onClick={handleRegister} className="px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#FF6D4D] hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF6D4D]">
                                Register
                            </button>
                        </div>
                    </form>
                </div>
            </main>
            </div>
      </div>
  );
};

export default DiagnosticRegistry;

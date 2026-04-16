import React, { useState, useEffect } from "react";
import Web3 from "web3";
import DoctorRegistration from "../build/contracts/DoctorRegistration.json";
import { useNavigate } from "react-router-dom";
import "../CSS/DoctorRegistration.css";
import NavBar from "./NavBar";

const DoctorRegistry = () => {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [doctorAddress, setDoctorAddress] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [hospitalName, setHospitalName] = useState("");
  const [hospitalLocation, setHospitalLocation] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [hhNumber, sethhNumber] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [department, setDepartment] = useState("");
  const [designation, setDesignation] = useState("");
  const [workExperience, setWorkExperience] = useState("");
  const [hhNumberError, sethhNumberError] = useState("");
  const [specializationError, setSpecializationError] = useState("");
  const [departmentError, setDepartmentError] = useState("");
  const [designationError, setDesignationError] = useState("");
  const [password, setPassword] = useState(""); 
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
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
          const deployedNetwork = DoctorRegistration.networks[networkId];
          const contractInstance = new web3Instance.eth.Contract(
            DoctorRegistration.abi,
            deployedNetwork && deployedNetwork.address
          );

          setContract(contractInstance);

          const nextHH = await contractInstance.methods
            .getNextDoctorHH()
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
      !doctorAddress ||
      !doctorName ||
      !hospitalName ||
      !hospitalLocation ||
      !dateOfBirth ||
      !gender ||
      !email ||
      !hhNumber ||
      !specialization ||
      !department ||
      !designation ||
      !workExperience ||
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
        DoctorRegistration.abi,
        DoctorRegistration.networks[networkId].address
      );

      const isRegDoc = await contract.methods
        .isRegisteredDoctor(hhNumber)
        .call();

      if (isRegDoc) {
        alert("Doctor already exists");
        return;
      }

      await contract.methods
        .registerDoctor(
          doctorName,
          hospitalName,
          dateOfBirth,
          gender,
          email,
          specialization,
          department,
          designation,
          workExperience,
          password 
        )
        .send({ from: doctorAddress });

      alert("Doctor registered successfully!");
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
  
    const handleSpecializationChange = (e) => {
      const value = e.target.value;
      setSpecialization(value);
      if (value === "Other") {
        setSpecializationError("");
      }
    };
  
    const handleDepartmentChange = (e) => {
      const value = e.target.value;
      setDepartment(value);
      if (value === "Other") {
        setDepartmentError("");
      }
    };
  
    const handleDesignationChange = (e) => {
      const value = e.target.value;
      setDesignation(value);
      if (value === "Other") {
        setDesignationError("");
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
                <div className="w-full max-w-5xl space-y-8">
                    <div className="text-center">
                        <h2 className="text-4xl font-extrabold text-gray-900">
                            Professional Doctor Registration
                        </h2>
                        <p className="mt-2 text-lg text-gray-600">
                            Join our network by providing your professional credentials.
                        </p>
                    </div>

                    {/* --- STYLING CHANGE: Updated form container and field styles --- */}
                    <form className="mt-8 bg-gray-50 p-8 rounded-2xl shadow-lg grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
                        
                        {/* --- The following section contains NO LOGIC CHANGES, only STYLING --- */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700" htmlFor="doctorAddress">Wallet Public Address</label>
                            <input id="doctorAddress" name="doctorAddress" type="text" required className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#0B8FAC] focus:border-[#0B8FAC] sm:text-sm" placeholder="0x..." value={doctorAddress} onChange={(e) => setDoctorAddress(e.target.value)} />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700" htmlFor="doctorName">Full Name</label>
                            <input id="doctorName" name="doctorName" type="text" required className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#0B8FAC] focus:border-[#0B8FAC] sm:text-sm" placeholder="e.g., Dr. Jane Smith" value={doctorName} onChange={(e) => setDoctorName(e.target.value)} />
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700" htmlFor="hhNumber">Doctor ID</label>
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
                            <label className="text-sm font-medium text-gray-700" htmlFor="dateOfBirth">Date of Birth</label>
                            <input id="dateOfBirth" name="dateOfBirth" type="date" required className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#0B8FAC] focus:border-[#0B8FAC] sm:text-sm" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700" htmlFor="gender">Gender</label>
                            <select id="gender" name="gender" required value={gender} onChange={(e) => setGender(e.target.value)} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#0B8FAC] focus:border-[#0B8FAC] sm:text-sm">
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700" htmlFor="email">Email Address</label>
                            <input id="email" name="email" type="email" required className={`block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#0B8FAC] sm:text-sm ${emailError ? 'border-red-500' : 'border-gray-300'}`} placeholder="you@example.com" value={email} onChange={handleEmailChange} />
                            {emailError && (<p className="text-red-500 text-sm mt-1">{emailError}</p>)}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700" htmlFor="hospitalName">Hospital Name</label>
                            <input id="hospitalName" name="hospitalName" type="text" required className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#0B8FAC] focus:border-[#0B8FAC] sm:text-sm" placeholder="e.g., City General Hospital" value={hospitalName} onChange={(e) => setHospitalName(e.target.value)} />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700" htmlFor="hospitalLocation">Hospital Location</label>
                            <input id="hospitalLocation" name="hospitalLocation" type="text" required className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#0B8FAC] focus:border-[#0B8FAC] sm:text-sm" placeholder="e.g., Medville" value={hospitalLocation} onChange={(e) => setHospitalLocation(e.target.value)} />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700" htmlFor="workExperience">Work Experience (Years)</label>
                            <input id="workExperience" name="workExperience" type="number" required className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#0B8FAC] focus:border-[#0B8FAC] sm:text-sm" placeholder="e.g., 5" min="0" value={workExperience} onChange={(e) => setWorkExperience(e.target.value)} />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700" htmlFor="specialization">Specialization</label>
                            <select id="specialization" name="specialization" required className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#0B8FAC] focus:border-[#0B8FAC] sm:text-sm" value={specialization} onChange={handleSpecializationChange}>
                                <option value="">Select Specialization</option>
                                <option value="Cardiology">Cardiology</option> <option value="Neurology">Neurology</option>
                                <option value="Oncology">Oncology</option> <option value="Gynecology">Gynecology</option>
                                <option value="Dermatology">Dermatology</option> <option value="Ophthalmology">Ophthalmology</option>
                                <option value="Psychiatry">Psychiatry</option> <option value="Radiology">Radiology</option>
                                <option value="Other">Other</option>
                            </select>
                            {specialization === "Other" && (<input type="text" placeholder="Enter Other Specialization" className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#0B8FAC] focus:border-[#0B8FAC] sm:text-sm" value={specializationError} onChange={(e) => setSpecializationError(e.target.value)} />)}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700" htmlFor="department">Department</label>
                            <select id="department" name="department" required className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#0B8FAC] focus:border-[#0B8FAC] sm:text-sm" value={department} onChange={handleDepartmentChange}>
                                <option value="">Select Department</option>
                                <option value="Casualty">Casualty</option> <option value="Surgery">Surgery</option>
                                <option value="Laboratory Services">Consultancy</option> <option value="Other">Other</option>
                            </select>
                            {department === "Other" && (<input type="text" placeholder="Enter Other Department" className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#0B8FAC] focus:border-[#0B8FAC] sm:text-sm" value={departmentError} onChange={(e) => setDepartmentError(e.target.value)} />)}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700" htmlFor="designation">Designation</label>
                            <select id="designation" name="designation" required className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#0B8FAC] focus:border-[#0B8FAC] sm:text-sm" value={designation} onChange={handleDesignationChange}>
                                <option value="">Select Designation</option>
                                <option value="Doctor">Doctor</option> <option value="Surgeon">Surgeon</option>
                                <option value="Nurse">Nurse</option> <option value="Other">Other</option>
                            </select>
                            {designation === "Other" && (<input type="text" placeholder="Enter Other Designation" className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#0B8FAC] focus:border-[#0B8FAC] sm:text-sm" value={designationError} onChange={(e) => setDesignationError(e.target.value)} />)}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700" htmlFor="password">Password</label>
                            <input id="password" name="password" type="password" required className={`block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#0B8FAC] sm:text-sm ${passwordError ? 'border-red-500' : 'border-gray-300'}`} placeholder="Minimum 8 characters" value={password} onChange={handlePasswordChange} />
                            {passwordError && (<p className="text-red-500 text-xs mt-1">{passwordError}</p>)}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700" htmlFor="confirmPassword">Confirm Password</label>
                            <input id="confirmPassword" name="confirmPassword" type="password" required className={`block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#0B8FAC] sm:text-sm ${confirmPasswordError ? 'border-red-500' : 'border-gray-300'}`} placeholder="Re-enter your password" value={confirmPassword} onChange={handleConfirmPasswordChange} />
                            {confirmPasswordError && (<p className="text-red-500 text-xs mt-1">{confirmPasswordError}</p>)}
                        </div>
                        
                        <div className="lg:col-span-3 md:col-span-2 flex items-center justify-end space-x-4 pt-4">
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

export default DoctorRegistry;

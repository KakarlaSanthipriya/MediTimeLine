import React, { useState, useEffect, useRef } from "react";
import Web3 from "web3";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { create } from "ipfs-http-client";
import DiagnosticForm from "../build/contracts/DiagnosticForm.json";
import UploadEhr from "../build/contracts/UploadEhr.json";
import NavBar_Logout from "./NavBar_Logout";
import "../big_css/CreateEHR.css";

const ipfs = create({ host: "localhost", port: "5001", protocol: "http" });

const bufferToBase64 = (buffer) =>
  btoa(String.fromCharCode(...new Uint8Array(buffer)));

const encryptFile = async (file) => {
  // Generate AES key
  const key = await window.crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );

  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const fileBuffer = await file.arrayBuffer();

  const encryptedBuffer = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    fileBuffer
  );

  const rawKey = await window.crypto.subtle.exportKey("raw", key);

  return {
    encryptedBlob: new Blob([encryptedBuffer]),
    symmetricKey: bufferToBase64(rawKey),
    iv: bufferToBase64(iv),
  };
};

const DiagnosticUpload = () => {
  const navigate = useNavigate();
  const { hhNumber } = useParams();
  const location = useLocation();
  const fileInput = useRef(null);

  // 📦 Data from previous page
  const prefilledRecord = location.state?.record;
  const prefilledDoctorName = location.state?.doctorName || "Dr. John Doe";
  const prefilledDoctorDesignation =
    location.state?.doctorDesignation || "General Physician";
  const prefilledDoctorHospital = location.state?.hospitalName;
  const prefilledDoctorDepartment = location.state?.doctorDepartment;
  const prefilledDoctorSpecialization = location.state?.doctorSpecialization;
  const [web3Instance, setWeb3Instance] = useState(null);
  const [recId, setRecId] = useState("EHR" + uuidv4());
  const [file, setFile] = useState(null);
  const [cid, setCid] = useState(null);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    patientName: "",
    doctorName: prefilledDoctorName,
    doctorDesignation: prefilledDoctorDesignation,
    doctorDepartment: prefilledDoctorDepartment,
    doctorSpecialization: prefilledDoctorSpecialization,
    hospitalName: prefilledDoctorHospital,
    patientAddress: "",
    diagnosticAddress: "", // ✅ will be auto-filled
    age: "",
    gender: "",
    bg: "",
  });

  // 🔌 Connect MetaMask & prefill diagnostic address
  useEffect(() => {
    const connectToMetaMask = async () => {
      try {
        if (!window.ethereum) {
          alert("MetaMask not detected. Please install MetaMask.");
          return;
        }

        const web3 = new Web3(window.ethereum);
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });

        setWeb3Instance(web3);

        // ✅ PREFILL DIAGNOSTIC WALLET ADDRESS
        setFormData((prev) => ({
          ...prev,
          diagnosticAddress: accounts[0],
        }));
      } catch (error) {
        console.error("MetaMask connection error:", error);
      }
    };

    connectToMetaMask();
  }, []);

  // 📄 Prefill data from doctor referral
  useEffect(() => {
    if (prefilledRecord) {
      setRecId(prefilledRecord.recordId);
      setFormData((prev) => ({
        ...prev,
        patientName: prefilledRecord.patientName,
        patientAddress: prefilledRecord.patientAddress,
        gender: prefilledRecord.gender,
      }));
    }
  }, [prefilledRecord]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const onFileChange = (event) => {
    setFile(event.target.files[0]);
    setErrors((prev) => ({ ...prev, file: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.patientName.trim()) newErrors.patientName = "Required";
    if (!formData.patientAddress.trim()) newErrors.patientAddress = "Required";
    if (!formData.diagnosticAddress.trim())
      newErrors.diagnosticAddress = "Required";
    if (!formData.age.trim()) newErrors.age = "Required";
    if (!formData.gender.trim()) newErrors.gender = "Required";
    if (!formData.bg.trim()) newErrors.bg = "Required";
    if (!file) newErrors.file = "File required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 🧾 Create EHR on DiagnosticForm
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const networkId = await web3Instance.eth.net.getId();
      const deployedNetwork = DiagnosticForm.networks[networkId];
      if (!deployedNetwork)
        throw new Error("DiagnosticForm not deployed on this network");

      const accounts = await web3Instance.eth.getAccounts();
      const contract = new web3Instance.eth.Contract(
        DiagnosticForm.abi,
        deployedNetwork.address
      );

      const report = await ipfs.add(file);
      setCid(report.path);

      await contract.methods
        .createEHR(
          recId,
          formData.doctorName,
          formData.patientName,
          parseInt(formData.age),
          formData.gender,
          formData.bg,
          formData.diagnosticAddress,
          formData.patientAddress,
          report.path
        )
        .send({ from: accounts[0] });

      alert("EHR created successfully");
      setRecId("EHR" + uuidv4());
    } catch (error) {
      console.error("EHR creation error:", error);
      alert(error.message);
    }
  };

  // 📤 Upload report for patient
    const uploadEhr = async () => {
    if (!validateForm()) return;

    try {
      // 🔐 Encrypt file
      const encrypted = await encryptFile(file);

      // 📦 Upload encrypted file to IPFS
      const ipfsResult = await ipfs.add(encrypted.encryptedBlob);
      const cid = ipfsResult.path;

      // 🗝 Store key locally (prototype)
      localStorage.setItem(cid + "_key", encrypted.symmetricKey);
      localStorage.setItem(cid + "_iv", encrypted.iv);

      // ⛓ Blockchain
      const networkId = await web3Instance.eth.net.getId();
      const deployedNetwork = UploadEhr.networks[networkId];
      if (!deployedNetwork)
        throw new Error("UploadEhr contract not deployed");

      const ehrContract = new web3Instance.eth.Contract(
        UploadEhr.abi,
        deployedNetwork.address
      );

      const accounts = await web3Instance.eth.getAccounts();
      const timestamp = new Date().toString();

      await ehrContract.methods
        .addDiagnosticRecord(
          formData.patientAddress,
          formData.doctorName,
          formData.doctorDesignation,
          formData.doctorDepartment,
          formData.doctorSpecialization,
          formData.hospitalName,
          timestamp,
          cid
        )
        .send({ from: accounts[0] });

      alert("Encrypted diagnostic report uploaded successfully");
      navigate("/diagnostic/" + hhNumber);
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }
  };

  return (
    <div>
      <NavBar_Logout />

      <div className="bg-white font-sans min-h-screen flex flex-col">

      <main className="flex-grow flex items-center justify-center py-10 px-4">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-extrabold text-gray-900">Create Lab Report</h2>
            <p className="text-gray-500 mt-2">Upload diagnostic results to the secure blockchain ledger.</p>
          </div>

          <form className="bg-gray-50 p-8 rounded-3xl shadow-xl border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit}>
            
            {/* Header Info Section */}
            <div className="md:col-span-2 flex flex-col md:flex-row justify-between bg-white p-5 rounded-2xl border border-gray-200 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Record ID</label>
                <p className="text-sm font-mono text-gray-700">{recId}</p>
              </div>
              <div className="md:text-right">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Diagnostic Center (You)</label>
                <p className="text-sm font-mono text-[#0B8FAC] truncate w-48 md:w-full">{formData.diagnosticAddress}</p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">Patient Name</label>
              <div className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-100 text-gray-600">
                {formData.patientName || "N/A"}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700" htmlFor="age">Age</label>
              <input 
                type="number" id="age" name="age" 
                value={formData.age} onChange={handleInputChange} 
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0B8FAC] outline-none transition" 
                placeholder="Enter age"
              />
              {errors.age && <p className="text-red-500 text-xs">{errors.age}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">Gender</label>
              <div className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-100 text-gray-600">
                {formData.gender || "N/A"}
              </div>
            </div>

            <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700" htmlFor="bg">Blood Group</label>
                <select 
                    id="bg" name="bg" value={formData.bg} onChange={handleInputChange} 
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0B8FAC] outline-none transition bg-white"
                >
                    <option value="">Select Group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">Doctor Name</label>
              <input 
                name="doctorName" value={formData.doctorName} onChange={handleInputChange} 
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0B8FAC] outline-none transition" 
                placeholder="Dr. Smith" 
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">Specialization</label>
              <input 
                name="doctorSpecialization" value={formData.doctorSpecialization} onChange={handleInputChange} 
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0B8FAC] outline-none transition"  
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">Department</label>
              <input 
                name="doctorDepartment" value={formData.doctorDepartment} onChange={handleInputChange} 
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0B8FAC] outline-none transition" 
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">Doctor Designation</label>
              <input 
                name="doctorDesignation" value={formData.doctorDesignation} onChange={handleInputChange} 
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0B8FAC] outline-none transition" 
                placeholder="Oncologist" 
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">Hospital</label>
              <input 
                name="hospitalName" value={formData.hospitalName} onChange={handleInputChange} 
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0B8FAC] outline-none transition" 
                placeholder="Rainbow hsopital" 
              />
            </div>
            

            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">Patient Wallet Address</label>
              <input 
                name="patientAddress" value={formData.patientAddress} onChange={handleInputChange} 
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0B8FAC] outline-none transition" 
                placeholder="0x..." 
              />
            </div>

            <div className="md:col-span-2 space-y-1 mt-2">
              <label className="text-sm font-semibold text-gray-700">Upload Final Report (PDF/Image)</label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-2xl cursor-pointer bg-white hover:bg-gray-50 transition">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <p className="mb-2 text-sm text-gray-500"><span className="font-bold">Click to upload</span> or drag and drop</p>
                    <p className="text-xs text-gray-400">{file ? file.name : "No file selected"}</p>
                  </div>
                            <input type="file" ref={fileInput} onChange={onFileChange} />

                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="md:col-span-2 flex flex-col sm:flex-row gap-4 mt-6">
                <button 
                    type="button" 
                    onClick={() => navigate("/diagnostic/" + hhNumber)} 
                    className="flex-1 px-6 py-4 border border-gray-300 text-gray-600 rounded-2xl font-bold hover:bg-gray-100 transition"
                >
                    Cancel
                </button>
                
              <button
                onClick={uploadEhr}
                className="px-5 py-2.5 bg-teal-600 text-white font-bold rounded-lg hover:bg-gray-400"
              >
                Upload Report
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
    </div>
  );
};

export default DiagnosticUpload;


import React, { useState, useEffect } from "react";
import DoctorForm from "../build/contracts/DoctorForm.json"; 
import DiagnosticRegistration from "../build/contracts/DiagnosticRegistration.json";
import Web3 from "web3"; 
import { useNavigate, useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import "../big_css/CreateEHR.css";
import NavBar_Logout from "./NavBar_Logout";
import Select from "react-select";

const DoctorConsultancy = () => {
  const navigate = useNavigate();
  const { hhNumber } = useParams(); 
  const [web3Instance, setWeb3Instance] = useState(null);
  const [recId, setRecId] = useState("EHR" + uuidv4());
  const [showDiagnosis, setShowDiagnosis] = useState(false);

  const [diagnostics, setDiagnostics] = useState([]);
  const [selectedDiagnostic, setSelectedDiagnostic] = useState(null);

  const [formData, setFormData] = useState({
    patientName: "",
    patientAddress: "",
    diagnosticAddress: "",
    gender: "",
    diagnosis: "",
    prescription: "",
    doctorAddress: "", // now manually entered
  });

  const [errors, setErrors] = useState({
    patientName: "",
    patientAddress: "",
    diagnosticAddress: "",
    gender: "",
    diagnosis: "",
    prescription: "",
    doctorAddress: "",
  });

  useEffect(() => {
    connectToMetaMask();
  }, []);

  const connectToMetaMask = async () => {
  try {
    if (window.ethereum) {
      const web3 = new Web3(window.ethereum);
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      setWeb3Instance(web3);

      // AUTO-FILL doctor wallet address
      setFormData(prev => ({
        ...prev,
        doctorAddress: accounts[0],
      }));

      // Fetch diagnostics
      const networkId = await web3.eth.net.getId();
      const deployedDiagnostic = DiagnosticRegistration.networks[networkId];

      if (deployedDiagnostic) {
        const diagnosticContract = new web3.eth.Contract(
          DiagnosticRegistration.abi,
          deployedDiagnostic.address
        );

        const allDiagnostics = await diagnosticContract.methods
          .getAllDiagnostics()
          .call();

        setDiagnostics(
          allDiagnostics.map(d => ({
            value: d.walletAddress,
            label: `${d.diagnosticName} (${d.diagnosticLocation})`,
          }))
        );
      }
    }
  } catch (err) {
    console.error("MetaMask error:", err);
  }
};


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let formValid = true;
    const newErrors = { ...errors };

    if (formData.patientName.trim() === "") {
      newErrors.patientName = "Patient Name is required";
      formValid = false;
    }
    if (formData.patientAddress.trim() === "") {
      newErrors.patientAddress = "Patient Address is required";
      formValid = false;
    }
    if (formData.gender.trim() === "") {
      newErrors.gender = "Gender is required";
      formValid = false;
    }
    if (formData.doctorAddress.trim() === "") {
      newErrors.doctorAddress = "Doctor Wallet Address is required";
      formValid = false;
    }
    if (formData.diagnosis.trim() === "") {
      if (formData.prescription.trim() === "") {
        newErrors.prescription = "Prescription is required";
        formValid = false;
      }
    } else {
      if (formData.diagnosticAddress.trim() === "") {
        newErrors.diagnosticAddress = "Diagnostic Center is required when diagnosis is given";
        formValid = false;
      }
    }

    setErrors(newErrors);

    if (!formValid) return;

    const diagnosticAddress =
      formData.diagnosis.trim() === ""
        ? "0x0000000000000000000000000000000000000000"
        : formData.diagnosticAddress;

    try {
      const networkId = await web3Instance.eth.net.getId();
      const deployedNetwork = DoctorForm.networks[networkId];
      if (!deployedNetwork) {
        throw new Error("Contract not deployed to this network");
      }

      const accounts = await web3Instance.eth.getAccounts();
      const contract = new web3Instance.eth.Contract(
        DoctorForm.abi,
        deployedNetwork.address
      );

      await contract.methods
        .createEHR(
          recId,
          formData.patientName,
          formData.patientAddress,
          diagnosticAddress,
          formData.gender,
          showDiagnosis ? formData.diagnosis : "",
          formData.prescription,
          formData.doctorAddress
        )
        .send({ from: accounts[0] });

      console.log("EHR created successfully.");
      setFormData({
        patientName: "",
        patientAddress: "",
        diagnosticAddress: "",
        gender: "",
        diagnosis: "",
        prescription: "",
        doctorAddress: "",
      });
      setRecId("EHR" + uuidv4());
      navigate(-1);
    } catch (error) {
      console.error("EHR creation failed:", error);
    }
  };

  const cancelOperation = () => {
    navigate(-1);
  };

  return (
    <div>
      <NavBar_Logout />
      <div>
        <div className="bg-white font-sans min-h-screen flex flex-col">

            <main className="flex-grow flex items-center justify-center py-10 px-4">
                <div className="w-full max-w-4xl">
                    <div className="text-center mb-10">
                        <h2 className="text-4xl font-extrabold text-gray-900">Patient Consultancy</h2>
                        <p className="text-gray-500 mt-2">Create a secure, blockchain-based health record.</p>
                    </div>

                    <form className="bg-gray-50 p-8 rounded-3xl shadow-xl border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit}>
                        
                        {/* Header Info Section */}
                        <div className="md:col-span-2 flex flex-col md:flex-row justify-between bg-white p-5 rounded-2xl border border-gray-200 gap-4">
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Record ID</label>
                                <p className="text-sm font-mono text-gray-700">{recId}</p>
                            </div>
                            <div className="md:text-right">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Doctor (You)</label>
                                <p className="text-sm font-mono text-[#0B8FAC] truncate w-48 md:w-full">{formData.doctorAddress}</p>
                            </div>
                        </div>

                        {/* Form Fields */}
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-gray-700">Patient Name</label>
                            <input name="patientName" value={formData.patientName} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0B8FAC] outline-none transition" placeholder="John Doe" />
                            {errors.patientName && <p className="text-red-500 text-xs">{errors.patientName}</p>}
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-gray-700">Patient Wallet Address</label>
                            <input name="patientAddress" value={formData.patientAddress} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0B8FAC] outline-none transition" placeholder="0x..." />
                            {errors.patientAddress && <p className="text-red-500 text-xs">{errors.patientAddress}</p>}
                        </div>

                        <div className="space-y-1 md:col-span-2">
                            <label className="text-sm font-semibold text-gray-700">Gender</label>
                            <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0B8FAC] outline-none transition bg-white">
                                <option value="">Select Gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="others">Others</option>
                            </select>
                        </div>

                        <div className="space-y-1 md:col-span-2">
                            <label className="text-sm font-semibold text-gray-700">Prescription / Medication</label>
                            <textarea name="prescription" value={formData.prescription} onChange={handleInputChange} rows="3" className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#0B8FAC] outline-none transition" placeholder="List medicines and dosage..."></textarea>
                        </div>

                        {/* Optional Diagnosis Logic */}
                        {!showDiagnosis ? (
                            <div className="md:col-span-2 flex justify-center py-2">
                                <button type="button" onClick={() => setShowDiagnosis(true)} className="text-[#0B8FAC] font-bold border-2 border-[#0B8FAC] px-6 py-2 rounded-full hover:bg-[#0B8FAC] hover:text-white transition-all">
                                    + Add Lab Test / Diagnosis
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="md:col-span-2 border-t pt-4">
                                    <label className="text-sm font-semibold text-gray-700">Diagnosis Detail</label>
                                    <textarea name="diagnosis" value={formData.diagnosis} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none" placeholder="Reason for lab referral..."></textarea>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-sm font-semibold text-gray-700">Assign Diagnostic Center</label>
                                    <Select 
                                        options={diagnostics} 
                                        onChange={(opt) => {
                                            setSelectedDiagnostic(opt);
                                            setFormData({...formData, diagnosticAddress: opt.value});
                                        }}
                                        className="mt-1"
                                        placeholder="Search by name or location..."
                                    />
                                    <button type="button" onClick={() => setShowDiagnosis(false)} className="text-red-400 text-xs mt-2 hover:underline">Remove lab request</button>
                                </div>
                            </>
                        )}

                        {/* Action Buttons */}
                        <div className="md:col-span-2 flex gap-4 mt-6">
                            <button type="button" onClick={() => navigate(-1)} className="flex-1 px-6 py-4 border border-gray-300 text-gray-600 rounded-2xl font-bold hover:bg-gray-100 transition">Cancel</button>
                            <button type="submit" className="flex-1 px-6 py-4 bg-[#FF6D4D] text-white rounded-2xl font-bold shadow-lg shadow-[#ff6d4d44] hover:bg-[#e85a3c] transition">Submit to Blockchain</button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
        </div>
    </div>
  );
};

export default DoctorConsultancy;

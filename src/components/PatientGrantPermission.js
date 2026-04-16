import React, { useState, useEffect } from "react";
import PatientRegistration from "../build/contracts/PatientRegistration.json";
import DoctorRegistration from "../build/contracts/DoctorRegistration.json";
import Web3 from "web3";
import { useNavigate, useParams } from "react-router-dom";
import "../CSS/PatientWritePermission.css";
import "../big_css/CreateEHR.css";
import NavBar_Logout from "./NavBar_Logout";

const PatientGrantPermission = () => {
  const { hhNumber } = useParams(); 
  const navigate = useNavigate();

  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState("");
  const [patientDetails, setPatientDetails] = useState(null);

  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState("");
  const [selectedDept, setSelectedDept] = useState("");

  const [grantedDoctors, setGrantedDoctors] = useState(new Set());

  const departmentOptions = [
    "Cardiology","Neurology","Oncology","Gynecology","Dermatology",
    "Ophthalmology","Psychiatry","Radiology","Other",
  ];

  useEffect(() => {
    const init = async () => {
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const accounts = await web3Instance.eth.getAccounts();
      setAccount(accounts[0]);

      const networkId = await web3Instance.eth.net.getId();
      const patientDeployed = PatientRegistration.networks[networkId];
      if (patientDeployed) {
        const patientContract = new web3Instance.eth.Contract(
          PatientRegistration.abi,
          patientDeployed.address
        );
        const pDetails = await patientContract.methods.getPatientDetails(hhNumber).call();
        setPatientDetails(pDetails);
      }
      const doctorDeployed = DoctorRegistration.networks[networkId];
      if (doctorDeployed) {
        const doctorContract = new web3Instance.eth.Contract(
          DoctorRegistration.abi,
          doctorDeployed.address
        );
        const rawList = await doctorContract.methods.getAllDoctors().call();
        const normalized = rawList.map((d) => ({
          walletAddress: d[0],
          doctorName: d[1],
          hospitalName: d[2],
          specialization: d[7],
          department: d[8],
          hhNumber: d[6],
        }));
        const grantedSet = new Set();
    for (let doc of normalized) {
      const granted = await doctorContract.methods
        .isPermissionGranted(hhNumber, doc.walletAddress)
        .call();
      if (granted) grantedSet.add(doc.walletAddress);
    }

        setDoctors(normalized);
        setFilteredDoctors(normalized);
        setGrantedDoctors(grantedSet);

        const uniqueHospitals = [...new Set(normalized.map(d => d.hospitalName).filter(Boolean))];
        setHospitals(uniqueHospitals);
      }
    };
    init();
  }, [hhNumber]);

  useEffect(() => {
    let filtered = doctors;
    if (selectedHospital) filtered = filtered.filter(d => d.hospitalName === selectedHospital);
    if (selectedDept) filtered = filtered.filter(d => d.specialization === selectedDept || d.department === selectedDept);
    setFilteredDoctors(filtered);
  }, [selectedHospital, selectedDept, doctors]);

  const handleGrantPermission = async (doctor) => {
    try {
      const networkId = await web3.eth.net.getId();
      const doctorDeployed = DoctorRegistration.networks[networkId];
      const doctorContract = new web3.eth.Contract(
        DoctorRegistration.abi,
        doctorDeployed.address
      );

      const patientName = patientDetails.name || patientDetails[1] || "";

      await doctorContract.methods
        .grantPermission(hhNumber, doctor.walletAddress, patientName)
        .send({ from: account });

      // mark this doctor as granted
      setGrantedDoctors(prev => new Set(prev).add(doctor.walletAddress));

    } catch (err) {
      console.error(err);
      alert("Failed to grant permission: " + (err.message || err));
    }
  };

  return (
    <div>
      <NavBar_Logout />
      <div className="bg-white font-sans min-h-screen flex flex-col">
      <main className="flex-grow mx-auto px-20 container w-full">
                <div className="py-16">
                    <div className="text-left pb-12">
                        <h1 className="text-4xl font-bold text-gray-800">Manage Doctor Permissions</h1>
                        <p className="mt-2 text-xl text-gray-600">Find a doctor and grant them access to view your records.</p>
                    </div>

                    {/* --- STYLING CHANGE: Filter controls are now styled consistently --- */}
                    <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-50 rounded-2xl border border-gray-200">
                        <div>
                            <label htmlFor="hospital-select" className="block text-sm font-medium text-gray-700 mb-1">Filter by Hospital</label>
                            <select id="hospital-select" value={selectedHospital} onChange={(e) => setSelectedHospital(e.target.value)} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#0B8FAC] focus:border-[#0B8FAC] sm:text-sm">
                                <option value="">All Hospitals</option>
                                {hospitals.map((h, i) => <option key={i} value={h}>{h}</option>)}
                            </select>
                        </div>
                        <div>
                             <label htmlFor="dept-select" className="block text-sm font-medium text-gray-700 mb-1">Filter by Specialization</label>
                            <select id="dept-select" value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#0B8FAC] focus:border-[#0B8FAC] sm:text-sm">
                                <option value="">All Specializations</option>
                                {departmentOptions.map((d, i) => <option key={i} value={d}>{d}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* --- STYLING CHANGE: Doctor list is now a styled table --- */}
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
                        {filteredDoctors.length === 0 ? (
                            <p className="p-8 text-center text-gray-500">No doctors match your filter criteria.</p>
                        ) : (
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor Name</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hospital</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialization</th>
                                        <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {/* --- NO LOGIC CHANGE in the map function --- */}
                                    {filteredDoctors.map((doc, i) => {
                                        const isGranted = grantedDoctors.has(doc.walletAddress);
                                        return (
                                            <tr key={i}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{doc.doctorName}</div>
                                                    <div className="text-xs text-gray-500 font-mono">{doc.walletAddress}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.hospitalName}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.specialization || doc.department}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button onClick={() => handleGrantPermission(doc)} disabled={isGranted} className={`px-4 py-2 text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${isGranted ? "bg-green-100 text-green-800 cursor-not-allowed" : "bg-[#FF6D4D] text-white hover:bg-opacity-90 focus:ring-[#FF6D4D]"}`}>
                                                        {isGranted ? "✓ Granted" : "Grant Access"}
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                     <div className="mt-8 text-left">
                        <button onClick={() => navigate("/patient/" + hhNumber)} className="text-sm font-medium text-gray-600 hover:text-gray-900">
                            &larr; Back to Dashboard
                        </button>
                    </div>
                </div>
            </main>
            </div>
    </div>
  );
};

export default PatientGrantPermission;

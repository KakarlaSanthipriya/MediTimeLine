import React, { useEffect, useState } from "react";
import Web3 from "web3";
import { useParams, useNavigate } from "react-router-dom";
import "../CSS/PatientDashBoard.css";
import NavBar_Logout from "./NavBar_Logout";
import PatientRegistration from "../build/contracts/PatientRegistration.json";
import DoctorForm from "../build/contracts/DoctorForm.json";


const PatientDashBoard = () => {
  const { hhNumber } = useParams(); 
  const [doctorFormContract, setDoctorFormContract] = useState(null);
  const [ehrRecords, setEhrRecords] = useState([]);


  const navigate = useNavigate();
  
  const viewRecord = () => {
    navigate("/patient/" + hhNumber + "/viewrecords");
  };

  const grantPermission = () => {
    navigate("/patient/" + hhNumber + "/grantpermission");
  };
  const viewprofile = () => {
    navigate("/patient/" + hhNumber + "/viewpatientprofile");
  };
  const uploadehr = () => {
    navigate("/patient/" + hhNumber + "/uploadehr");
  };
  const viewPrescriptions = () => {
    navigate("/patient/" + hhNumber + "/viewPrescription")
  }

  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [patientPhoneNo, setPatientPhoneNo] = useState(null);
  const [patientDetails, setPatientDetails] = useState(null);
  const [error, setError] = useState(null);
useEffect(() => {
  const init = async () => {
    try {
      if (!window.ethereum) {
        throw new Error("MetaMask not installed");
      }

      const web3Instance = new Web3(window.ethereum);
      const networkId = await web3Instance.eth.net.getId();

      console.log("Network ID:", networkId);

      const deployedPatient = PatientRegistration.networks[networkId];
      if (!deployedPatient) {
        throw new Error("PatientRegistration contract not deployed on this network");
      }

      const patientContract = new web3Instance.eth.Contract(
        PatientRegistration.abi,
        deployedPatient.address
      );

      const result = await patientContract.methods
        .getPatientDetails(hhNumber)
        .call();

      console.log("Patient details:", result);
      setPatientDetails(result);

      const deployedDoctorForm = DoctorForm.networks[networkId];
      if (deployedDoctorForm && result[0]) {
        const doctorFormContract = new web3Instance.eth.Contract(
          DoctorForm.abi,
          deployedDoctorForm.address
        );

        const records = await doctorFormContract.methods
          .getPatientRecords(result[0])
          .call();

        setEhrRecords(records);
      }

    } catch (err) {
      console.error("BLOCKCHAIN ERROR:", err);
      setError(err.message);
    }
  };

  init();
}, [hhNumber]);



const UserCircleIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);
const DocumentTextIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>);
const UploadIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>);
const ShieldCheckIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.417l5.5-5.5a12.025 12.025 0 013.118-1.043 12.025 12.025 0 013.118 1.043l5.5 5.5A12.02 12.02 0 0021.618 5.984c-.34.058-.68.11-.1.17z" /></svg>);
const ClipboardListIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>);

  return (
  <div>
    <NavBar_Logout />
    <div className="bg-white font-sans min-h-screen flex flex-col">
    <main className="flex-grow mx-auto px-20 container w-full">
                <div className="py-16">
                    <div className="text-left pb-12">
                        <h1 className="text-4xl font-bold text-gray-800">
                            Patient Dashboard
                        </h1>
                        {patientDetails && (
                            <p className="mt-2 text-2xl text-gray-600">
                                Welcome, <span className="font-bold text-[#0B8FAC]">Kriti</span>
                            </p>
                        )}
                         {error && ( <p className="mt-2 text-lg text-red-600">{error}</p> )}
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div onClick={viewprofile} className="bg-gray-50 p-8 rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer">
                            <div className="text-[#0B8FAC] inline-block p-4 bg-teal-100 rounded-full"><UserCircleIcon /></div>
                            <h3 className="text-xl font-bold text-gray-800 mt-6">View Your Profile</h3>
                            <p className="text-md text-gray-600 mt-2">Review your personal details registered on the blockchain.</p>
                        </div>
                        <div onClick={viewRecord} className="bg-gray-50 p-8 rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer">
                            <div className="text-[#FF6D4D] inline-block p-4 bg-orange-100 rounded-full"><DocumentTextIcon /></div>
                            <h3 className="text-xl font-bold text-gray-800 mt-6">View Full Record</h3>
                            <p className="text-md text-gray-600 mt-2">Access your complete medical history and all uploaded documents.</p>
                        </div>
                        <div onClick={uploadehr} className="bg-gray-50 p-8 rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer">
                            <div className="text-gray-600 inline-block p-4 bg-gray-200 rounded-full"><UploadIcon /></div>
                            <h3 className="text-xl font-bold text-gray-800 mt-6">Upload Past Records</h3>
                            <p className="text-md text-gray-600 mt-2">Add your past medical documents to your secure timeline.</p>
                        </div>
                        <div onClick={grantPermission} className="bg-gray-50 p-8 rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer">
                            <div className="text-green-600 inline-block p-4 bg-green-100 rounded-full"><ShieldCheckIcon /></div>
                            <h3 className="text-xl font-bold text-gray-800 mt-6">Manage Permissions</h3>
                            <p className="text-md text-gray-600 mt-2">Grant or revoke access for doctors to view your records.</p>
                        </div>
                        <div onClick={viewPrescriptions} className="bg-gray-50 p-8 rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer">
                            <div className="text-purple-600 inline-block p-4 bg-purple-100 rounded-full"><ClipboardListIcon /></div>
                            <h3 className="text-xl font-bold text-gray-800 mt-6">View Prescriptions</h3>
                            <p className="text-md text-gray-600 mt-2">See a history of all prescriptions and diagnostic referrals.</p>
                        </div>
                    </div>
                </div>
            </main>
            </div>
  </div>
);

};

export default PatientDashBoard;

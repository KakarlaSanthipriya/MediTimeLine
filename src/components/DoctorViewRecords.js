import React, { useState, useEffect } from "react";
import Web3 from "web3";
import { useParams, Link, useNavigate } from "react-router-dom";
import NavBar_Logout from "./NavBar_Logout";
import PatientRegistration from "../build/contracts/PatientRegistration.json";

const DoctorViewPatient = () => {
  const { hhNumber } = useParams(); 
  const navigate = useNavigate();

  const doctorForm = () => {
    navigate("/doctor/"+hhNumber+"/doctorform");
  };

  const viewPatientRecords = () => {
    navigate("/patient/"+hhNumber+"/viewrecords");
  };

  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [patientDetails, setPatientDetails] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);

        const networkId = await web3Instance.eth.net.getId();
        const deployedNetwork = PatientRegistration.networks[networkId];
        const contractInstance = new web3Instance.eth.Contract(
          PatientRegistration.abi,
          deployedNetwork && deployedNetwork.address,
        );
        setContract(contractInstance);
        try {
          const result = await contractInstance.methods.getPatientDetails(hhNumber).call();
          setPatientDetails(result);
        } catch (error) {
          console.error('Error retrieving patient details:', error);
          setError('Error retrieving patient details');
        }
      } else {
        console.log('Please install MetaMask extension');
        setError('Please install MetaMask extension');
      }
    };

    init();
  }, [hhNumber]);

  const cancelOperation = () => {
    navigate(-1);
  };
  const DocumentTextIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);
const PencilAltIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
);


  return (
    <div>
    <NavBar_Logout></NavBar_Logout>
    <div className="bg-white font-sans min-h-screen flex flex-col">

            {/* --- STYLING CHANGE: Main content area is centered and themed --- */}
            <main className="flex-grow mx-auto px-20 container w-full">
                <div className="py-16">
                    {patientDetails ? (
                        <>
                            {/* --- STYLING CHANGE: Header section is restyled --- */}
                            <div className="pb-8">
                                <h1 className="text-4xl font-bold text-gray-800">
                                    Patient Profile: <span className="text-[#0B8FAC]">{patientDetails.name}</span>
                                </h1>
                                <p className="mt-2 text-xl text-gray-600">
                                    Viewing details for HH Number: {hhNumber}
                                </p>
                            </div>
                            
                            {/* --- STYLING CHANGE: Patient details are now in a clean, styled card --- */}
                            <div className="bg-gray-50 p-8 rounded-2xl shadow-lg mb-12">
                                <dl className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
                                    <div className="border-b border-gray-200 pb-4">
                                        <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
                                        <dd className="mt-1 text-lg font-semibold text-gray-900">{patientDetails.dateOfBirth}</dd>
                                    </div>
                                    <div className="border-b border-gray-200 pb-4">
                                        <dt className="text-sm font-medium text-gray-500">Gender</dt>
                                        <dd className="mt-1 text-lg font-semibold text-gray-900">{patientDetails.gender}</dd>
                                    </div>
                                    <div className="border-b border-gray-200 pb-4">
                                        <dt className="text-sm font-medium text-gray-500">Blood Group</dt>
                                        <dd className="mt-1 text-lg font-semibold text-gray-900">{patientDetails.bloodGroup}</dd>
                                    </div>
                                    <div className="border-b border-gray-200 pb-4">
                                        <dt className="text-sm font-medium text-gray-500">Email Address</dt>
                                        <dd className="mt-1 text-lg font-semibold text-gray-900">{patientDetails.email}</dd>
                                    </div>
                                    <div className="border-b border-gray-200 pb-4 md:col-span-2">
                                        <dt className="text-sm font-medium text-gray-500">Home Address</dt>
                                        <dd className="mt-1 text-lg font-semibold text-gray-900">{patientDetails.homeAddress}</dd>
                                    </div>
                                </dl>
                            </div>

                            {/* --- STYLING CHANGE: Action buttons are now styled as cards --- */}
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">Actions</h2>
                            <div className="grid md:grid-cols-2 gap-10">
                                <div onClick={viewPatientRecords} className="bg-gray-50 p-8 rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer">
                                    <div className="text-[#0B8FAC] inline-block p-4 bg-teal-100 rounded-full">
                                        <DocumentTextIcon />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800 mt-6">View Records</h3>
                                    <p className="text-md text-gray-600 mt-2">
                                        Access this patient's full medical history and uploaded documents.
                                    </p>
                                </div>
                                <div onClick={doctorForm} className="bg-gray-50 p-8 rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer">
                                    <div className="text-[#FF6D4D] inline-block p-4 bg-orange-100 rounded-full">
                                        <PencilAltIcon />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800 mt-6">Create Consultancy / EHR</h3>
                                    <p className="text-md text-gray-600 mt-2">
                                        Write a new prescription or diagnostic referral for this patient.
                                    </p>
                                </div>
                            </div>
                        </>
                    ) : (
                        // --- STYLING CHANGE: Loading/error state is cleaner ---
                        <div className="text-center py-20">
                            {error ? (
                                <p className="text-red-500">{error}</p>
                            ) : (
                                <p className="text-gray-500">Loading patient details...</p>
                            )}
                        </div>
                    )}
                    
                    <div className="mt-12 text-left">
                        <button onClick={cancelOperation} className="text-sm font-medium text-gray-600 hover:text-gray-900">
                            &larr; Back to Patient List
                        </button>
                    </div>
                </div>
            </main>
        </div>
      </div>
  );
};

export default DoctorViewPatient;

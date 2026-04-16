import React, { useState, useEffect } from "react";
import Web3 from "web3";
import { useParams, useNavigate } from "react-router-dom";
import NavBar_Logout from "./NavBar_Logout";
import DiagnosticRegistration from "../build/contracts/DiagnosticRegistration.json";

const DiagnosticDashBoard = () => {
  const { hhNumber } = useParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState(null);
  const [diagnosticDetails, setDiagnosticDetails] = useState(null);
  const [error, setError] = useState(null);

  const diagnosticUpload = () => {
    navigate("/diagnostic/"+hhNumber+"/diagnosticform");
  };

  // const viewDiagnosticRecords = () => {
  //   navigate("/diagnostic/"+hhNumber+"/viewrec");
  // };

  const viewDiagnosticProfile = () => {
    navigate("/diagnostic/"+hhNumber+"/viewdiagnosticprofile");
  };

  const viewPrescriptions = () => {
    navigate("/diagnostic/" + hhNumber + "/viewdiagnosticprescriptions")
  }

const UserCircleIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);
const ClipboardListIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>);

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        try {
          const web3Instance = new Web3(window.ethereum);
          const networkId = await web3Instance.eth.net.getId();
          const deployedNetwork = DiagnosticRegistration.networks[networkId];
          const contractInstance = new web3Instance.eth.Contract(
            DiagnosticRegistration.abi,
            deployedNetwork && deployedNetwork.address
          );
          setContract(contractInstance);

          const result = await contractInstance.methods.getDiagnosticDetails(hhNumber).call();
          setDiagnosticDetails(result);
        } catch (error) {
          console.error('Error initializing Web3 or fetching diagnostic details:', error);
          setError('Error initializing Web3 or fetching diagnostic details');
        }
      } else {
        console.error('Please install MetaMask extension');
        setError('Please install MetaMask extension');
      }
    };

    init();
  }, [hhNumber]);

  return (
    <div>
      <NavBar_Logout />
      <div className="bg-white font-sans min-h-screen flex flex-col">

            {/* --- STYLING CHANGE: Main content area is centered and themed --- */}
            <main className="flex-grow mx-auto px-20 container w-full">
                <div className="py-16">
                    <div className="text-left pb-12">
                        <h1 className="text-4xl font-bold text-gray-800">
                            Diagnostic Dashboard
                        </h1>
                        {diagnosticDetails && (
                            <p className="mt-2 text-2xl text-gray-600">
                                Welcome, <span className="font-bold text-[#0B8FAC]">{diagnosticDetails[1]}</span>
                            </p>
                        )}
                        {error && (
                            <p className="mt-2 text-lg text-red-600">{error}</p>
                        )}
                    </div>

                    {/* --- STYLING CHANGE: Buttons replaced with styled action cards --- */}
                    <div className="grid md:grid-cols-2 gap-10">
                        {/* Card 1: View Profile */}
                        <div
                            // --- NO CHANGE to onClick logic, just connected to the card ---
                            onClick={viewDiagnosticProfile}
                            className="bg-gray-50 p-8 rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer"
                        >
                            <div className="text-[#0B8FAC] inline-block p-4 bg-teal-100 rounded-full">
                                <UserCircleIcon />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mt-6">View Profile</h3>
                            <p className="text-md text-gray-600 mt-2">
                                Review your center's registration details and information.
                            </p>
                        </div>

                        {/* Card 2: View Prescriptions/Requests */}
                        <div
                            // --- NO CHANGE to onClick logic, just connected to the card ---
                            onClick={viewPrescriptions}
                            className="bg-gray-50 p-8 rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer"
                        >
                            <div className="text-[#FF6D4D] inline-block p-4 bg-orange-100 rounded-full">
                                <ClipboardListIcon />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mt-6">View Diagnostic Requests</h3>
                            <p className="text-md text-gray-600 mt-2">
                                Access the list of all test referrals from doctors and upload reports.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    </div>
  );
};

export default DiagnosticDashBoard;

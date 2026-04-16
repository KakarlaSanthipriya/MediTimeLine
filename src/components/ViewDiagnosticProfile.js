import React, { useState, useEffect } from "react";
import DiagnosticRegistration from "../build/contracts/DiagnosticRegistration.json";
import Web3 from "web3";
import { useNavigate, useParams } from "react-router-dom";
import "../CSS/PatientWritePermission.css";
import "../big_css/CreateEHR.css";
import NavBar_Logout from "./NavBar_Logout";

const ViewDiagnosticProfile = () => {
  const { hhNumber } = useParams();
  const navigate = useNavigate();
  const [diagnosticDetails, setDiagnosticDetails] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDiagnosticDetails = async () => {
      try {
        if (window.ethereum) {
          const web3Instance = new Web3(window.ethereum);
          const networkId = await web3Instance.eth.net.getId();
          const deployedNetwork = DiagnosticRegistration.networks[networkId];
          const contract = new web3Instance.eth.Contract(
            DiagnosticRegistration.abi,
            deployedNetwork && deployedNetwork.address
          );

          const result = await contract.methods.getDiagnosticDetails(hhNumber).call();
          setDiagnosticDetails(result);
        } else {
          setError("Please install MetaMask extension");
        }
      } catch (error) {
        console.error('Error retrieving diagnostic details:', error);
        setError('Error retrieving diagnostic details');
      }
    };

    fetchDiagnosticDetails();
  }, [hhNumber]);

  const cancelOperation = async () => {
    try {
      navigate("/diagnostic/" + hhNumber);
    } catch (error) {
      console.error("Error checking permission:", error);
    }
  };
  
  return (
    <div>
      <NavBar_Logout></NavBar_Logout>
      <div className="bg-white font-sans min-h-screen flex flex-col">
            {/* --- REPLACEMENT: Old NavBarLogout is replaced with the new DashboardHeader --- */}

            {/* --- STYLING CHANGE: Main content area is centered and themed --- */}
            <main className="flex-grow mx-auto px-20 container w-full">
                <div className="py-16">
                    <div className="text-left pb-12">
                        <h1 className="text-4xl font-bold text-gray-800">
                            Diagnostic Center Profile
                        </h1>
                        <p className="mt-2 text-xl text-gray-600">
                            Your center's details registered on the blockchain.
                        </p>
                    </div>

                    {/* --- STYLING CHANGE: Profile details are now in a clean, styled card --- */}
                    {error && (
                        <p className="mt-4 text-lg text-red-600 bg-red-50 p-4 rounded-lg">{error}</p>
                    )}
                    
                    {diagnosticDetails ? (
                        <div className="bg-gray-50 p-8 rounded-2xl shadow-lg">
                            {/* --- STYLING CHANGE: Details are in a responsive grid for better readability --- */}
                            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                {/* --- The following section contains NO LOGIC CHANGES, only STYLING --- */}
                                <div className="border-b border-gray-200 pb-4">
                                    <dt className="text-sm font-medium text-gray-500">Diagnostic Center Name</dt>
                                    <dd className="mt-1 text-lg font-semibold text-gray-900">{diagnosticDetails[1]}</dd>
                                </div>
                                <div className="border-b border-gray-200 pb-4">
                                    <dt className="text-sm font-medium text-gray-500">HH Number</dt>
                                    <dd className="mt-1 text-lg font-semibold text-gray-900">{hhNumber}</dd>
                                </div>
                                <div className="border-b border-gray-200 pb-4">
                                    <dt className="text-sm font-medium text-gray-500">Affiliated Hospital</dt>
                                    <dd className="mt-1 text-lg font-semibold text-gray-900">{diagnosticDetails[2]}</dd>
                                </div>
                                <div className="border-b border-gray-200 pb-4">
                                    <dt className="text-sm font-medium text-gray-500">Location</dt>
                                    <dd className="mt-1 text-lg font-semibold text-gray-900">{diagnosticDetails[3]}</dd>
                                </div>
                                <div className="border-b border-gray-200 pb-4 md:col-span-2">
                                    <dt className="text-sm font-medium text-gray-500">Email Address</dt>
                                    <dd className="mt-1 text-lg font-semibold text-gray-900">{diagnosticDetails[4]}</dd>
                                </div>
                            </dl>

                            {/* --- STYLING CHANGE: Close button is styled consistently --- */}
                            <div className="mt-8 text-right">
                                <button
                                    onClick={cancelOperation}
                                    className="px-6 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    ) : (
                        // --- STYLING CHANGE: Loading state is now more informative ---
                        <div className="text-center py-10">
                            <p className="text-gray-500">Loading diagnostic center details...</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    </div>
  );
};

export default ViewDiagnosticProfile;

import React, { useState, useEffect } from "react";
import PatientRegistration from "../build/contracts/PatientRegistration.json";
import Web3 from "web3";
import { useNavigate, useParams } from "react-router-dom";
import "../CSS/PatientWritePermission.css";
import "../big_css/CreateEHR.css";
import NavBar_Logout from "./NavBar_Logout";


const ViewProfile = () => {
  const { hhNumber } = useParams(); // Retrieve the hhNumber from the URL parameter
  const navigate = useNavigate();
  const [address, setAddress] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [patientDetails, setPatientDetails] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const init = async () => {
      // Check if Web3 is injected by MetaMask or any other provider
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);

        // Get the contract instance
        const networkId = await web3Instance.eth.net.getId();
        const deployedNetwork = PatientRegistration.networks[networkId];
        const contractInstance = new web3Instance.eth.Contract(
          PatientRegistration.abi,
          deployedNetwork && deployedNetwork.address,
        );
        setContract(contractInstance);
        if (!contract) return;

        try {
          // Call the getPatientDetails function of the smart contract
          const result = await contract.methods.getPatientDetails(hhNumber).call();
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
  }, []);

  useEffect(() => {
    const fetchPatientDetails = async () => {
      if (!contract || !hhNumber) return;

      try {
        // Call the getPatientDetails function of the smart contract
        const result = await contract.methods.getPatientDetails(hhNumber).call();
        setPatientDetails(result);
      } catch (error) {
        console.error('Error retrieving patient details:', error);
      }
    };

    fetchPatientDetails();
  }, [contract, hhNumber]);


  const cancelOperation = async () => {
    try {
    navigate("/patient/"+hhNumber);
    } catch (error) {
      console.error("Error checking permission:", error);
    }
  };
  
  return (
    <div>
    <NavBar_Logout></NavBar_Logout>
    <div className="bg-white font-sans min-h-screen flex flex-col">

            <main className="flex-grow mx-auto px-20 container w-full">
                <div className="py-16">
                    <div className="text-left pb-12">
                        <h1 className="text-4xl font-bold text-gray-800">
                            Your Profile
                        </h1>
                        <p className="mt-2 text-xl text-gray-600">
                            Your personal details registered on the blockchain.
                        </p>
                    </div>

                    {error && (
                        <p className="mt-4 text-lg text-red-600 bg-red-50 p-4 rounded-lg">
                            {error}
                        </p>
                    )}
                    
                    {patientDetails ? (
                        <div className="bg-gray-50 p-8 rounded-2xl shadow-lg">
                            <dl className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
                                <div className="border-b border-gray-200 pb-4">
                                    <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                                    <dd className="mt-1 text-lg font-semibold text-gray-900">{patientDetails.name}</dd>
                                </div>
                                <div className="border-b border-gray-200 pb-4">
                                    <dt className="text-sm font-medium text-gray-500">HH Number</dt>
                                    <dd className="mt-1 text-lg font-semibold text-gray-900">{hhNumber}</dd>
                                </div>
                                <div className="border-b border-gray-200 pb-4">
                                    <dt className="text-sm font-medium text-gray-500">Email Address</dt>
                                    <dd className="mt-1 text-lg font-semibold text-gray-900">{patientDetails.email}</dd>
                                </div>
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
                                <div className="border-b border-gray-200 pb-4 md:col-span-2">
                                    <dt className="text-sm font-medium text-gray-500">Home Address</dt>
                                    <dd className="mt-1 text-lg font-semibold text-gray-900">{patientDetails.homeAddress}</dd>
                                </div>
                            </dl>

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
                        <div className="text-center py-10">
                            <p className="text-gray-500">Loading patient details...</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
      </div>
  );
};

export default ViewProfile;

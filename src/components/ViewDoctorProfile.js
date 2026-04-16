import React, { useState, useEffect } from "react";
import DoctorRegistration from "../build/contracts/DoctorRegistration.json";
import Web3 from "web3";
import { useNavigate, useParams } from "react-router-dom";
import "../CSS/PatientWritePermission.css";
import "../big_css/CreateEHR.css";
import NavBar_Logout from "./NavBar_Logout";

const ViewDoctorProfile = () => {
  const { hhNumber } = useParams();
  const navigate = useNavigate();
  const [doctorDetails, setDoctorDetails] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDoctorDetails = async () => {
      try {
        if (window.ethereum) {
          const web3Instance = new Web3(window.ethereum);
          const networkId = await web3Instance.eth.net.getId();
          const deployedNetwork = DoctorRegistration.networks[networkId];
          const contract = new web3Instance.eth.Contract(
            DoctorRegistration.abi,
            deployedNetwork && deployedNetwork.address
          );

          const result = await contract.methods.getDoctorDetails(hhNumber).call();
          setDoctorDetails(result);
        } else {
          setError("Please install MetaMask extension");
        }
      } catch (error) {
        console.error('Error retrieving doctor details:', error);
        setError('Error retrieving doctor details');
      }
    };

    fetchDoctorDetails();
  }, [hhNumber]);

  const cancelOperation = async () => {
    try {
      navigate("/doctor/" + hhNumber);
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
                            Doctor's Profile
                        </h1>
                        <p className="mt-2 text-xl text-gray-600">
                            Your professional details registered on the blockchain.
                        </p>
                    </div>

                    {error && (
                        <p className="mt-4 text-lg text-red-600 bg-red-50 p-4 rounded-lg">
                            {error}
                        </p>
                    )}
                    
                    {doctorDetails && (
                        <div className="bg-gray-50 p-8 rounded-2xl shadow-lg">
                            <dl className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
                                <div className="border-b border-gray-200 pb-4">
                                    <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                                    <dd className="mt-1 text-lg font-semibold text-gray-900">{doctorDetails[1]}</dd>
                                </div>
                                <div className="border-b border-gray-200 pb-4">
                                    <dt className="text-sm font-medium text-gray-500">HH Number</dt>
                                    <dd className="mt-1 text-lg font-semibold text-gray-900">{hhNumber}</dd>
                                </div>
                                <div className="border-b border-gray-200 pb-4">
                                    <dt className="text-sm font-medium text-gray-500">Email Address</dt>
                                    <dd className="mt-1 text-lg font-semibold text-gray-900">{doctorDetails[5]}</dd>
                                </div>
                                <div className="border-b border-gray-200 pb-4">
                                    <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
                                    <dd className="mt-1 text-lg font-semibold text-gray-900">{doctorDetails[3]}</dd>
                                </div>
                                <div className="border-b border-gray-200 pb-4">
                                    <dt className="text-sm font-medium text-gray-500">Gender</dt>
                                    <dd className="mt-1 text-lg font-semibold text-gray-900">{doctorDetails[4]}</dd>
                                </div>
                                <div className="border-b border-gray-200 pb-4">
                                    <dt className="text-sm font-medium text-gray-500">Work Experience</dt>
                                    <dd className="mt-1 text-lg font-semibold text-gray-900">{doctorDetails[9]} Years</dd>
                                </div>
                                <div className="border-b border-gray-200 pb-4">
                                    <dt className="text-sm font-medium text-gray-500">Hospital Name</dt>
                                    <dd className="mt-1 text-lg font-semibold text-gray-900">{doctorDetails[2]}</dd>
                                </div>
                                <div className="border-b border-gray-200 pb-4">
                                    <dt className="text-sm font-medium text-gray-500">Specialization</dt>
                                    <dd className="mt-1 text-lg font-semibold text-gray-900">{doctorDetails[6]}</dd>
                                </div>
                                <div className="border-b border-gray-200 pb-4">
                                    <dt className="text-sm font-medium text-gray-500">Department</dt>
                                    <dd className="mt-1 text-lg font-semibold text-gray-900">{doctorDetails[7]}</dd>
                                </div>
                                <div className="border-b border-gray-200 pb-4">
                                    <dt className="text-sm font-medium text-gray-500">Designation</dt>
                                    <dd className="mt-1 text-lg font-semibold text-gray-900">{doctorDetails[8]}</dd>
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
                    )}
                </div>
            </main>
        </div>
    </div>
  );
};

export default ViewDoctorProfile;

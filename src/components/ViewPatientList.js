import React, { useEffect, useState } from "react";
import Web3 from "web3";
import DoctorRegistration from "../build/contracts/DoctorRegistration.json";
import { useNavigate, useParams, Link } from "react-router-dom";
import "../CSS/ContractInteraction.css";
import NavBar_Logout from "./NavBar_Logout";

function ViewPatientList() {
  const navigate = useNavigate();
  const { hhNumber } = useParams(); // Doctor's HH number
  const [web3, setWeb3] = useState(null);
  const [patientList, setPatientList] = useState([]);
  const [doctorDetails, setDoctorDetails] = useState(null);

  // Initialize and fetch doctor details & patient list
  useEffect(() => {
    const init = async () => {
      try {
        if (!window.ethereum) return alert("Please install MetaMask");
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);

        const networkId = await web3Instance.eth.net.getId();
        const deployedNetwork = DoctorRegistration.networks[networkId];
        const doctorContract = new web3Instance.eth.Contract(
          DoctorRegistration.abi,
          deployedNetwork && deployedNetwork.address
        );

        // Fetch doctor details by HH number
        const doctor = await doctorContract.methods.getDoctorDetails(hhNumber).call();
        setDoctorDetails(doctor);

        // Fetch patient list using doctor's wallet address
        refreshPatientList(doctorContract, doctor[0]); // doctor[0] = walletAddress
      } catch (error) {
        console.error("Error:", error);
      }
    };
    init();
  }, [hhNumber]);

  // Function to refresh patient list
  const refreshPatientList = async (doctorContract, doctorWallet) => {
    try {
      const pList = await doctorContract.methods.getPatientList(doctorWallet).call();
      setPatientList(pList);
    } catch (err) {
      console.error("Error fetching patient list:", err);
    }
  };

  // Revoke patient permission
  const removePatient = async (patientNumber) => {
    try {
      if (!web3 || !doctorDetails) throw new Error("Web3 or doctor not initialized");

      const networkId = await web3.eth.net.getId();
      const deployedNetwork = DoctorRegistration.networks[networkId];
      const doctorContract = new web3.eth.Contract(
        DoctorRegistration.abi,
        deployedNetwork.address
      );

      // Revoke permission
      await doctorContract.methods
        .revokePermission(patientNumber, doctorDetails[0])
        .send({ from: doctorDetails[0] });

      // Refresh the list immediately
      refreshPatientList(doctorContract, doctorDetails[0]);
    } catch (err) {
      console.error("Error revoking permission:", err);
      alert("Failed to revoke permission: " + (err.message || err));
    }
  };

  const cancelOperation = () => navigate(-1);

  return (
    <div>
      <NavBar_Logout />
      <div className="bg-white font-sans min-h-screen flex flex-col">
            {/* --- STYLING CHANGE: Main content area is centered and themed --- */}
            <main className="flex-grow mx-auto px-20 container w-full">
                <div className="py-16">
                    <div className="text-left pb-12">
                        <h1 className="text-4xl font-bold text-gray-800">
                            Patient List
                        </h1>
                        <p className="mt-2 text-xl text-gray-600">
                            A list of all patients who have granted you access to their records.
                        </p>
                    </div>

                    {/* --- STYLING CHANGE: Patient list is now in a clean, styled table --- */}
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
                        {patientList.length === 0 ? (
                            <p className="p-8 text-center text-gray-500">No patients have granted access yet.</p>
                        ) : (
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Name</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient ID</th>
                                        <th scope="col" className="relative px-6 py-3">
                                            <span className="sr-only">Actions</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {/* --- NO LOGIC CHANGE in the map function --- */}
                                    {patientList.map((patient, index) => (
                                        <tr key={index}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{patient.patient_name}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">{patient.patient_number}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                                                {/* --- NO LOGIC CHANGE in Link or buttons --- */}
                                                <Link to={`/doctor/${patient.patient_number}/doctorviewpatient`} className="text-white bg-[#0B8FAC] hover:bg-opacity-90 px-4 py-2 rounded-md shadow-sm">
                                                    View
                                                </Link>
                                                <button
                                                    onClick={() => removePatient(patient.patient_number)}
                                                    className="px-4 py-2 border border-red-500 text-black-600 rounded-md shadow-sm text-sm font-medium hover:bg-red-300 hover:border-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                                                >
                                                    Remove Access
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                     {/* --- STYLING CHANGE: "Back" button is now styled consistently --- */}
                    <div className="mt-8 text-left">
                        <button onClick={cancelOperation} className="text-sm font-medium text-gray-600 hover:text-gray-900">
                            &larr; Back to Dashboard
                        </button>
                    </div>
                </div>
            </main>
        </div>
    </div>
  );
}

export default ViewPatientList;

import React, { useEffect, useState } from "react";
import Web3 from "web3";
import { useParams, useNavigate } from "react-router-dom";
import DoctorForm from "../build/contracts/DoctorForm.json";
import PatientRegistration from "../build/contracts/PatientRegistration.json";
import DoctorRegistration from "../build/contracts/DoctorRegistration.json"; // ✅ import doctor contract
import NavBar_Logout from "./NavBar_Logout";

const ViewPrescription = () => {
  const { hhNumber } = useParams();
  const [ehrRecords, setEhrRecords] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPrescriptions = async () => {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        const networkId = await web3Instance.eth.net.getId();

        try {
          //  Get patient details first
          const patientContract = new web3Instance.eth.Contract(
            PatientRegistration.abi,
            PatientRegistration.networks[networkId].address
          );
          const patientDetails = await patientContract.methods
            .getPatientDetails(hhNumber)
            .call();

          //  Fetch prescriptions from DoctorForm
          const doctorFormContract = new web3Instance.eth.Contract(
            DoctorForm.abi,
            DoctorForm.networks[networkId].address
          );

          const records = await doctorFormContract.methods
            .getPatientRecords(patientDetails.walletAddress)
            .call();
            
            console.log(records.doctorAddress)
          //  Load doctor details for each record
          const doctorContract = new web3Instance.eth.Contract(
            DoctorRegistration.abi,
            DoctorRegistration.networks[networkId].address
          );

          const enrichedRecords = await Promise.all(
            records
              .filter((record) => record.prescription && record.prescription !== "")
              .map(async (record) => {
                try {
                  const doctorDetails = await doctorContract.methods
                    .getDoctorDetailsByAddress(record.doctorAddress) 

                  return {
                    ...record,
                    doctorName: doctorDetails[1],
                    hospitalName: doctorDetails[2],
                  };
                } catch (err) {
                  console.warn("Doctor details not found:", record.doctorAddress);
                  return {
                    ...record,
                    doctorName: "Unknown",
                    hospitalName: "Unknown",
                  };
                }
              })
          );

          setEhrRecords(enrichedRecords);
        } catch (err) {
          console.error("Error fetching prescriptions:", err);
          setError("Unable to fetch prescriptions.");
        }
      } else {
        setError("Please install MetaMask.");
      }
    };

    fetchPrescriptions();
  }, [hhNumber]);

  const cancelOperation = () => {
    navigate(-1);
  };

  return (
    <div>
      <NavBar_Logout />
      <div className="bg-white font-sans min-h-screen flex flex-col">
            {/* --- STYLING CHANGE: Main content area is centered and themed --- */}
            <main className="flex-grow mx-auto px-20 container w-full">
                <div className="py-16">
                    <div className="text-left pb-12">
                        <h1 className="text-4xl font-bold text-gray-800">
                            Your Prescriptions
                        </h1>
                        <p className="mt-2 text-xl text-gray-600">
                            A history of all prescriptions and diagnostic referrals from doctors.
                        </p>
                    </div>

                    {/* --- STYLING CHANGE: Prescription list is now a clean, styled table --- */}
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
                        {error && <p className="p-8 text-center text-red-500">{error}</p>}
                        
                        {!error && ehrRecords.length === 0 ? (
                            <p className="p-8 text-center text-gray-500">No prescriptions have been recorded yet.</p>
                        ) : !error && (
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Record ID</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prescribing Doctor</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prescription</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {/* --- NO LOGIC CHANGE in the map function --- */}
                                    {ehrRecords.map((record, index) => (
                                        <tr key={index}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-xs text-gray-500 font-mono">{record.recordId}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{record.doctorName}</div>
                                                <div className="text-sm text-gray-500">{record.hospitalName}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-normal text-sm text-gray-900 max-w-md">{record.prescription}</td>
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
};

export default ViewPrescription;

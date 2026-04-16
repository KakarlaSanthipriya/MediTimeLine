import React, { useEffect, useState } from "react";
import Web3 from "web3";
import { useParams, useNavigate } from "react-router-dom";
import DoctorForm from "../build/contracts/DoctorForm.json";
import DiagnosticRegistration from "../build/contracts/DiagnosticRegistration.json";
import DoctorRegistration from "../build/contracts/DoctorRegistration.json";
import NavBar_Logout from "./NavBar_Logout";

const ViewDiagnosticPrescriptions = () => {
  const { hhNumber } = useParams();
  const [ehrRecords, setEhrRecords] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPrescriptions = async () => {
      if (!window.ethereum) {
        setError("Please install MetaMask.");
        return;
      }

      try {
        const web3Instance = new Web3(window.ethereum);
        const networkId = await web3Instance.eth.net.getId();

        // Get diagnostic wallet address using hhNumber
        const diagnosticContract = new web3Instance.eth.Contract(
          DiagnosticRegistration.abi,
          DiagnosticRegistration.networks[networkId].address
        );
        const diagnosticDetails = await diagnosticContract.methods
          .getDiagnosticDetails(hhNumber)
          .call();

        const diagnosticAddress = diagnosticDetails[0];

        //  Fetch all diagnostic records from DoctorForm
        const doctorFormContract = new web3Instance.eth.Contract(
          DoctorForm.abi,
          DoctorForm.networks[networkId].address
        );

        const records = await doctorFormContract.methods
          .getDiagnosticRecords(diagnosticAddress)
          .call();

        //  Fetch doctor details for each record
        const doctorContract = new web3Instance.eth.Contract(
          DoctorRegistration.abi,
          DoctorRegistration.networks[networkId].address
        );

        const enrichedRecords = await Promise.all(
          records
            .filter((record) => record.diagnosis && record.diagnosis !== "")
            .map(async (record) => {
              try {
                const doctorDetails = await doctorContract.methods
                  .getDoctorDetailsByAddress(record.doctorAddress)
                  .call();

                return {
  ...record,
  doctorName: doctorDetails[1],        // doctorName
  hospitalName: doctorDetails[2],      // hospitalName
  specialization: doctorDetails[7],    // specialization
  department: doctorDetails[8],        // department
  designation: doctorDetails[9],       // designation
  doctorAddress: record.doctorAddress,
};

              } catch (err) {
                console.warn("Doctor details not found:", record.doctorAddress);
                return {
                  ...record,
                  doctorName: "Unknown",
                  designation: "Unknown",
                  hospitalName: "Unknown",
                  doctorAddress: record.doctorAddress,
                };
              }
            })
        );

        setEhrRecords(enrichedRecords);
      } catch (err) {
        console.error("Error fetching prescriptions:", err);
        setError("Unable to fetch prescriptions.");
      }
    };

    fetchPrescriptions();
  }, [hhNumber]);

  const cancelOperation = () => navigate(-1);

  return (
    <div>
      <NavBar_Logout />
      <div className="bg-white font-sans min-h-screen flex flex-col">
            
            <main className="flex-grow mx-auto px-20 container w-full">
                <div className="py-16">
                    <div className="text-left pb-12">
                        <h1 className="text-4xl font-bold text-gray-800">Diagnostic Requests</h1>
                        <p className="mt-2 text-xl text-gray-600">Referrals and test prescriptions from registered doctors.</p>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
                        {error && <p className="p-8 text-center text-red-500 font-medium">{error}</p>}
                        
                        {!error && ehrRecords.length === 0 ? (
                            <p className="p-8 text-center text-gray-500">No diagnostic requests found.</p>
                        ) : !error && (
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Record ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Referring Doctor</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Test / Diagnosis</th>
                                        <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {ehrRecords.map((record, index) => (
                                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-xs font-mono text-gray-400">#{record.recordId}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-semibold text-gray-900">{record.patientName}</div>
                                                <div className="text-xs text-gray-500">{record.gender}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{record.doctorName}</div>
                                                <div className="text-xs text-[#0B8FAC] font-medium">{record.hospitalName}</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">
                                                {record.diagnosis}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <button 
                                                    onClick={() => navigate(`/diagnostics/${hhNumber}/upload/${record.recordId}`, { 
                                                        state: { 
                                                            record,
                                                            doctorName: record.doctorName,
                                                            doctorDesignation: record.designation,
                                                            doctorDepartment: record.department,
                                                            doctorSpecialization: record.specialization,
                                                            hospitalName: record.hospitalName,
                                                            doctorAddress: record.doctorAddress
                                                        } 
                                                    })} 
                                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#FF6D4D] hover:bg-[#e85a3d] focus:outline-none shadow-sm"
                                                >
                                                    Upload Report
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    <div className="mt-8 text-left">
                        <button onClick={cancelOperation} className="text-sm font-medium text-gray-500 hover:text-gray-800 flex items-center">
                            &larr; Back to Dashboard
                        </button>
                    </div>
                </div>
            </main>
        </div>
    </div>
  );
};

export default ViewDiagnosticPrescriptions;

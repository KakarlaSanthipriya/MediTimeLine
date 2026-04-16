import React, { useState, useEffect } from "react";
import Web3 from "web3";
import { useParams, useNavigate } from "react-router-dom";
import NavBar_Logout from "./NavBar_Logout";
import DoctorRegistration from "../build/contracts/DoctorRegistration.json";

const DoctorDashBoardPage = () => {
  const { hhNumber } = useParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState(null);
  const [doctorDetails, setDoctorDetails] = useState(null);
  const [error, setError] = useState(null);

  const viewPatientList = () => {
    navigate("/doctor/" + hhNumber + "/patientlist");
  };

  const viewDoctorProfile = () => {
    navigate("/doctor/" + hhNumber + "/viewdoctorprofile");
  };

  const UsersIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-12 w-12"
      fill="none"
      viewBox="0 0 24"
      stroke="currentColor"
      strokeWidth={1}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197"
      />
    </svg>
  );

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        try {
          const web3Instance = new Web3(window.ethereum);
          const networkId = await web3Instance.eth.net.getId();
          const deployedNetwork = DoctorRegistration.networks[networkId];
          const contractInstance = new web3Instance.eth.Contract(
            DoctorRegistration.abi,
            deployedNetwork && deployedNetwork.address
          );
          setContract(contractInstance);

          const result = await contractInstance.methods
            .getDoctorDetails(hhNumber)
            .call();
          setDoctorDetails(result);
        } catch (error) {
          console.error("Error fetching doctor details:", error);
          setError("Error fetching doctor details");
        }
      } else {
        setError("Please install MetaMask extension");
      }
    };

    init();
  }, [hhNumber]);

  return (
    <div>
      <NavBar_Logout />

      <div className="bg-white font-sans min-h-screen flex flex-col">
        <main className="flex-grow mx-auto px-20 container w-full">
          <div className="py-16">

            {/* Header */}
            <div className="text-left pb-6">
              <h1 className="text-4xl font-bold text-gray-800">
                Doctor Dashboard
              </h1>

              {doctorDetails && (
                <p className="mt-2 text-2xl text-gray-600">
                  Welcome back,{" "}
                  <span className="font-bold text-[#0B8FAC]">
                    {doctorDetails[1]}
                  </span>
                </p>
              )}

              {error && (
                <p className="mt-2 text-lg text-red-600">{error}</p>
              )}
            </div>

            <div className="mt-12">

              <div className="grid md:grid-cols-2 gap-10">

                {/* Profile Card */}
                <div
                  onClick={viewDoctorProfile}
                  className="bg-gray-50 p-8 rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer"
                >
                  <div className="text-[#FF6D4D] inline-block p-4 bg-orange-100 rounded-full">
                    <UsersIcon />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mt-6">
                    Doctor Profile
                  </h3>
                  <p className="text-md text-gray-600 mt-2">
                    View and manage your professional profile information.
                  </p>
                  <div className="mt-6">
                    <span className="font-semibold text-[#FF6D4D] hover:underline">
                      View Profile →
                    </span>
                  </div>
                </div>

                {/* Patient List Card */}
                <div
                  onClick={viewPatientList}
                  className="bg-gray-50 p-8 rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer"
                >
                  <div className="text-[#FF6D4D] inline-block p-4 bg-orange-100 rounded-full">
                    <UsersIcon />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mt-6">
                    Patient Records
                  </h3>
                  <p className="text-md text-gray-600 mt-2">
                    View your assigned patients and access their medical
                    histories.
                  </p>
                  <div className="mt-6">
                    <span className="font-semibold text-[#FF6D4D] hover:underline">
                      View Patient List →
                    </span>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DoctorDashBoardPage;

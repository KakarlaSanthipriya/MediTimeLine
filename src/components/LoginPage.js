import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "./NavBar";

const DoctorIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

const PatientIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

const DiagnosticIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547a2 2 0 00-.547 1.806l.477 2.387a6 6 0 00.517 3.86l.158.318a6 6 0 00.517 3.86l2.387.477a2 2 0 001.806-.547a2 2 0 00.547-1.806l-.477-2.387a6 6 0 00-.517-3.86l-.158-.318a6 6 0 00-.517-3.86l-2.387-.477a2 2 0 00-1.806.547a2 2 0 00-.547 1.806l.477 2.387a6 6 0 00.517 3.86l.158.318a6 6 0 00.517 3.86L15.428 6.572a2 2 0 001.806-.547a2 2 0 00.547-1.806l-.477-2.387a6 6 0 00-.517-3.86l-.158-.318a6 6 0 00-.517-3.86L6.572 1.572a2 2 0 00-1.806.547a2 2 0 00-.547 1.806l.477 2.387a6 6 0 00.517 3.86l.158.318a6 6 0 00.517 3.86l2.387.477a2 2 0 001.806-.547a2 2 0 00.547-1.806l-.477-2.387a6 6 0 00-.517-3.86l-.158-.318a6 6 0 00-.517-3.86z" />
    </svg>
);

const LoginPage = () => {
  const navigate = useNavigate();
  return (
    <div>
    <NavBar></NavBar>
    <div className="bg-white font-sans min-h-screen flex flex-col">
    <main className="mx-auto px-20 flex-grow container">
                <div className="text-center pt-20 pb-12">
                    <h1 className="text-5xl font-bold text-gray-900">Welcome Back</h1>
                    <p className="mt-4 text-lg text-gray-600">Please select your role to login securely.</p>
                </div>

                {/* --- STYLING CHANGE: Replaced buttons with styled cards --- */}
                <div className="grid md:grid-cols-3 gap-10 text-center pb-20">
                    
                    {/* Card 1: Doctor Login */}
                    <div
                        className="bg-gray-50 p-8 rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer"
                        // --- NO CHANGE to onClick logic ---
                        onClick={() => navigate("/doctor_login")}
                    >
                        <div className="text-[#0B8FAC] inline-block p-4 bg-teal-100 rounded-full">
                            <DoctorIcon />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mt-6">Login as a Doctor</h3>
                        <p className="text-md text-gray-600 mt-2">
                            Access your dashboard to view and manage patient records.
                        </p>
                    </div>
                    
                    {/* Card 2: Patient Login */}
                    <div
                        className="bg-gray-50 p-8 rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer"
                        // --- NO CHANGE to onClick logic ---
                        onClick={() => navigate("/patient_login")}
                    >
                        <div className="text-[#FF6D4D] inline-block p-4 bg-orange-100 rounded-full">
                            <PatientIcon />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mt-6">Login as a Patient</h3>
                        <p className="text-md text-gray-600 mt-2">
                            View your personal health timeline and manage permissions.
                        </p>
                    </div>
                    
                    {/* Card 3: Diagnostic Login */}
                    <div
                        className="bg-gray-50 p-8 rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer"
                        // --- NO CHANGE to onClick logic ---
                        onClick={() => navigate("/diagnostic_login")}
                    >
                        <div className="text-gray-600 inline-block p-4 bg-gray-200 rounded-full">
                            <DiagnosticIcon />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mt-6">Login as a Diagnostic Center</h3>
                        <p className="text-md text-gray-600 mt-2">
                            Access requests and upload reports securely to the blockchain.
                        </p>
                    </div>
                </div>
            </main>
            </div>
      </div>
  );
};

export default LoginPage;

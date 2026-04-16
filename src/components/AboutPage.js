import React from "react";
import { useNavigate } from "react-router-dom";

// Import the images you need for this page
import hospitalImage from "../images/hospital.png"; 
import logo from "./logo_new.png";

// Simple SVG icons for visual flair. You can replace these with more detailed ones if you like.
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


const AboutUs = () => {
  const navigate = useNavigate();

  return (
    // CHANGE 1: Added flex and flex-col
    <div className="bg-white font-sans min-h-screen flex flex-col">
      {/* ===== Navbar Section (Consistent with Landing Page) ===== */}
      <nav className="bg-white text-gray-800 shadow-sm">
        <div className="mx-auto px-20">
          <div className="flex items-center justify-between h-24">
            <div className="w-1/3">
              <img className="h-16 w-auto cursor-pointer" src={logo} alt="Logo" onClick={() => navigate("/")} />
            </div>
            <div className="w-1/3 text-center">
              <span className="text-5xl font-bold cursor-pointer" onClick={() => navigate("/")}>
                <span style={{ color: '#FF6D4D' }}>MEDI</span>
                <span style={{ color: '#0B8FAC' }}>TIMELINE</span>
              </span>
            </div>
            <div className="w-1/3">
              <div className="hidden md:flex items-center justify-end space-x-8">
                <button className="text-lg font-medium hover:text-[#FF6D4D] transition-colors" onClick={() => navigate("/")}>Home</button>
                <button className="text-lg font-medium text-[#FF6D4D] hover:opacity-80 transition-opacity" onClick={() => navigate("/AboutPage")}>About Us</button>
                <button className="text-lg font-medium hover:text-[#FF6D4D] transition-colors" onClick={() => navigate("/register")}>Register</button>
                <button className="text-lg font-medium hover:text-[#FF6D4D] transition-colors" onClick={() => navigate("/login")}>Login</button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* ===== Main Content Section ===== */}
      {/* CHANGE 2: Added flex-grow */}
      <main className="mx-auto px-20 flex-grow">
        {/* Top Section: Introduction with Image */}
        <div className="py-20 flex flex-col md:flex-row items-center gap-24">
          <div className="md:w-1/2 text-left">
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-800 leading-tight">Our Mission & Vision</h1>
            <p className="mt-6 text-lg text-gray-600 max-w-lg">
              We are a dedicated team of healthcare professionals and technologists committed to revolutionizing the way Electronic Health Records (EHR) are managed. Our mission is to provide a secure, efficient, and user-friendly platform that empowers patients and providers alike.
            </p>
          </div>
          <div className="md:w-1/2 mt-10 md:mt-0">
            <img src={hospitalImage} alt="Hospital" className="w-full h-auto rounded-lg shadow-2xl object-cover"/>
          </div>
        </div>

        {/* What We Do Section */}
        <div className="text-center py-20">
          <h2 className="text-4xl font-bold text-gray-900">What We Do</h2>
          <p className="mt-4 text-lg max-w-3xl mx-auto text-gray-600">
            Our EHR management system provides a comprehensive solution for Doctors, Patients, and Diagnostic Centers. We leverage the power of Ethereum blockchain for secure data storage and smart contracts for access control and data management.
          </p>
        </div>

        {/* Features Grid Section */}
        <div className="grid md:grid-cols-3 gap-10 text-center">
          {/* Card 1: For Doctors */}
          <div className="bg-gray-50 p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
            <div className="text-[#0B8FAC] inline-block p-4 bg-teal-100 rounded-full">
              <DoctorIcon />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mt-6">For Doctors</h3>
            <p className="text-md text-gray-600 mt-2">
              Doctors can access the patient list assigned to them, view patient records and medical history, and write comments and treatment plans for treating patients.
            </p>
          </div>
          {/* Card 2: For Patients */}
          <div className="bg-gray-50 p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
            <div className="text-[#FF6D4D] inline-block p-4 bg-orange-100 rounded-full">
              <PatientIcon />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mt-6">For Patients</h3>
            <p className="text-md text-gray-600 mt-2">
              Patients can view their own medical records and history, upload new medical records, test reports, and other documents, and grant access to doctors.
            </p>
          </div>
          {/* Card 3: For Diagnostic Centers */}
          <div className="bg-gray-50 p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
            <div className="text-gray-600 inline-block p-4 bg-gray-200 rounded-full">
              <DiagnosticIcon />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mt-6">For Diagnostic Centers</h3>
            <p className="text-md text-gray-600 mt-2">
              Diagnostic Centers can view comments and treatment plans from doctors and upload EHR reports to patient records.
            </p>
          </div>
        </div>

        {/* Commitment & Contact Section */}
        <div className="text-center py-20 my-10 bg-gray-50 rounded-2xl">
          {/* Shield Icon for Security/Trust */}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.417l5.5-5.5a12.025 12.025 0 013.118-1.043 12.025 12.025 0 013.118 1.043l5.5 5.5A12.02 12.02 0 0021.618 5.984c-.34.058-.68.11-.1.17z" />
          </svg>
          <h2 className="mt-6 text-4xl font-bold text-gray-900">Our Commitment</h2>
          <p className="mt-4 text-lg max-w-3xl mx-auto text-gray-600">
            We are committed to ensuring the integrity and security of patient data. Our system ensures that only authorized users have access to patient records. Patients have control over who can access their medical records and can grant or revoke access as needed.
          </p>
        </div>

      </main>
    </div>
  );
};

export default AboutUs;
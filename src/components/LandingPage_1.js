import React, { useState } from "react";
import NavBar from "./NavBar";
import { useNavigate } from "react-router-dom";






function LandingPage() {
  // const [isHovered, setIsHovered] = useState(false);
  // function onEnter() {
  //   setIsHovered(true);
  // }
  // function onLeave() {
  //   setIsHovered(false);
  // }
  const navigate = useNavigate();

  return (
    <div>
        <NavBar></NavBar>
        <div className="bg-white font-sans min-h-screen">
      <main className="mx-auto px-20 py-20"> {/* Changed from max-w-7xl */}
        <div className="flex flex-col md:flex-row items-center gap-24">

          {/* Left Column: Text Content & Buttons*/}
          <div className="text-left">
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-800 leading-tight">
              Your Health, <br />
              Your TimeLine, <br />
              <span className="text-gray-900">Secured.</span>
            </h1>
            <p className="mt-6 text-lg text-gray-600 max-w-lg">
              Experience unparalleled control over your medical history with MediTimeLine. Our platform leverages cutting-edge blockchain technology to ensure your Electronic Health Records (EHR) are secure, private, and accessible only by you. Empowering patients with transparent, immutable health data for a healthier future.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <button
                onClick={() => navigate("/register")}
                className="bg-[#FF6D4D] text-white font-semibold px-20 py-3 rounded-lg hover:bg-opacity-90 transition-all shadow-md"
              >
                Get Started
              </button>
              <button
                onClick={() => navigate("/AboutPage")}
                className="bg-white text-gray-700 font-semibold px-20 py-3 rounded-lg border border-gray-300 hover:bg-gray-100 transition-all shadow-sm"
              >
                Learn More
              </button>
            </div>
          </div>

          {/* Right Column: Image */}
          <div className="md:w-1/2 mt-10 md:mt-0">
            <img 
              src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2070&auto=format&fit=crop" 
              alt="Healthcare Professional" 
              className="w-full h-auto rounded-lg shadow-2xl object-cover"
            />
          </div>

        </div>
      </main>
      </div>
    </div>
  );
}

export default LandingPage;
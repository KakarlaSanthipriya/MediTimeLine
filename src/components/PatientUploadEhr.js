import React, { useState, useEffect, useRef } from "react";
import Web3 from "web3";
import UploadEhr from "../build/contracts/UploadEhr.json";
import PatientRegistration from "../build/contracts/PatientRegistration.json";
import { useNavigate, useParams } from "react-router-dom";
import { create } from "ipfs-http-client";
import "../CSS/PatientWritePermission.css";
import "../big_css/CreateEHR.css";
import NavBar_Logout from "./NavBar_Logout";

// Initialize IPFS client
const ipfs = create({ host: "localhost", port: "5001", protocol: "http" });


// Convert ArrayBuffer to Base64
const arrayBufferToBase64 = (buffer) => {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
};

// Encrypt file using AES-GCM
const encryptFile = async (file) => {
  // Generate AES-256 symmetric key
  const aesKey = await window.crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );

  // Read file
  const fileBuffer = await file.arrayBuffer();

  // Generate IV
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  // Encrypt file
  const encryptedBuffer = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    aesKey,
    fileBuffer
  );

  // Export AES key
  const rawKey = await window.crypto.subtle.exportKey("raw", aesKey);

  return {
    encryptedFile: new Blob([encryptedBuffer]),
    symmetricKey: arrayBufferToBase64(rawKey),
    iv: arrayBufferToBase64(iv),
  };
};


const PatientUploadEhr = () => {
  const { hhNumber } = useParams();
  const navigate = useNavigate();
  const [web3, setWeb3] = useState(null);
  const [patientDetails, setPatientDetails] = useState(null);
  const [file, setFile] = useState(null);
  const fileInput = useRef(null);

  /* ===== Load Patient Details ===== */
  useEffect(() => {
    const init = async () => {
      try {
        if (!window.ethereum) {
          alert("Please install MetaMask");
          return;
        }

        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);

        const networkId = await web3Instance.eth.net.getId();
        const deployedNetwork = PatientRegistration.networks[networkId];

        if (!deployedNetwork) {
          alert("PatientRegistration contract not deployed");
          return;
        }

        const patientContract = new web3Instance.eth.Contract(
          PatientRegistration.abi,
          deployedNetwork.address
        );

        const result = await patientContract.methods
          .getPatientDetails(hhNumber)
          .call();

        setPatientDetails(result);
      } catch (err) {
        console.error(err);
      }
    };

    init();
  }, [hhNumber]);

  const onFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  /* ===== Submit Handler ===== */
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!file || !web3 || !patientDetails) {
        alert("Missing data");
        return;
      }

      // ⏱ Start latency measurement
      const startTime = performance.now();

      /* 🔐 ENCRYPT FILE */
      const { encryptedFile, symmetricKey, iv } = await encryptFile(file);
      


      /* ☁️ Upload encrypted file to IPFS */
      const uploadedFile = await ipfs.add(encryptedFile);
      const cid = uploadedFile.cid.toString();

      localStorage.setItem(cid + "_key", symmetricKey);
      localStorage.setItem(cid + "_iv", iv);

      const timestamp = new Date().toString();

      /* ===== Blockchain Interaction ===== */
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = UploadEhr.networks[networkId];

      if (!deployedNetwork) {
        alert("UploadEhr contract not deployed");
        return;
      }

      const ehrContract = new web3.eth.Contract(
        UploadEhr.abi,
        deployedNetwork.address
      );

      const accounts = await web3.eth.getAccounts();

      await ehrContract.methods
        .addPatientRecord(timestamp, cid)
        .send({ from: accounts[0] });

      // ⏱ End latency measurement
      const endTime = performance.now();
      console.log(
        "Upload Latency:",
        ((endTime - startTime) / 1000).toFixed(2),
        "seconds"
      );

      console.log("Symmetric Key (store securely):", symmetricKey);
      console.log("IV:", iv);

      // Reset
      setFile(null);
      fileInput.current.value = "";

      navigate("/patient/" + hhNumber);
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }
  };

  const cancelOperation = () => {
    navigate("/patient/" + hhNumber);
  };

  /* ===================== UI ===================== */

  return (
  <div className="bg-white font-sans min-h-screen flex flex-col">
    <NavBar_Logout />

    <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl space-y-8">
                    <div className="text-center">
                        <h2 className="text-4xl font-extrabold text-gray-900">
                            Upload Past Medical Records
                        </h2>
                        <p className="mt-2 text-lg text-gray-600">
                            Add documents like lab reports or old prescriptions to your timeline.
                        </p>
                    </div>

      <form
        onSubmit={handleSubmit}
        className="mt-8 bg-gray-50 p-8 rounded-2xl shadow-lg space-y-6"
      >
        
     <label className="block text-sm font-medium text-gray-700">Select a file</label>

        
        {/* Drag & Drop Upload Box */}
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-10 text-center cursor-pointer hover:border-blue-400"
          onClick={() => fileInput.current.click()}
        >
          <input
            type="file"
            ref={fileInput}
            onChange={onFileChange}
            className="hidden"
          />
<svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>

          <p className="text-gray-500">
            <span className="text-blue-500 font-medium">
              Upload a file
            </span>{" "}
            or drag and drop
          </p>

          {file ? (
                                        <p className="text-sm text-gray-900 font-medium">{file.name}</p>
                                    ) : (
                                        <p className="text-xs text-gray-500">PDF, PNG, JPG up to 10MB</p>
                                    )}

        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-4 mt-6">
          <button
            type="button"
            onClick={cancelOperation}
            className="px-4 py-2 border rounded-md hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
          >
            Submit Record
          </button>

  
        </div>
      </form>
      <div className="mt-8">
            <button
              onClick={cancelOperation}
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              ← Back to Dashboard
            </button>
          </div>
      </div>
    </main>
  </div>
);
}

export default PatientUploadEhr;

import React, { useEffect, useState } from "react";
import Web3 from "web3";
import UploadEhr from "../build/contracts/UploadEhr.json";
import NavBar_Logout from "./NavBar_Logout";
import "../CSS/ContractInteraction.css";
import { create } from "ipfs-http-client";
import { useNavigate } from "react-router-dom";

// Initialize IPFS client
const ipfs = create({ host: "localhost", port: "5001", protocol: "http" });


// Base64 → ArrayBuffer
const base64ToArrayBuffer = (base64) => {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
};

// AES-GCM Decryption
const decryptFile = async (encryptedBlob, symmetricKey, iv) => {
  const rawKey = base64ToArrayBuffer(symmetricKey);
  const ivBuffer = base64ToArrayBuffer(iv);

  const aesKey = await window.crypto.subtle.importKey(
    "raw",
    rawKey,
    { name: "AES-GCM" },
    false,
    ["decrypt"]
  );

  const encryptedBuffer = await encryptedBlob.arrayBuffer();

  const decryptedBuffer = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv: ivBuffer },
    aesKey,
    encryptedBuffer
  );

  return new Blob([decryptedBuffer], { type: "image/webp" });
};



function ViewPatientRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  /* ===== Load Records from Blockchain ===== */
  useEffect(() => {
    const loadBlockchainData = async () => {
      try {
        if (!window.ethereum) {
          alert("Please install MetaMask to use this app.");
          return;
        }

        const web3 = new Web3(window.ethereum);
        await window.ethereum.request({ method: "eth_requestAccounts" });

        const networkId = await web3.eth.net.getId();
        const networkData = UploadEhr.networks[networkId];

        if (!networkData) {
          alert("UploadEhr contract not deployed to detected network.");
          return;
        }

        const ehrContract = new web3.eth.Contract(
          UploadEhr.abi,
          networkData.address
        );

        // Fetch all records (CID + metadata + keys)
        const allRecords = await ehrContract.methods.getAllRecords().call();
        setRecords(allRecords);
      } catch (error) {
        console.error("Error loading blockchain data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadBlockchainData();
  }, []);

  /* ===== View & Decrypt Record ===== */
const viewRecordWithLatency = async (record) => {
  try {
    const startTime = performance.now();

    // Fetch encrypted file from IPFS
    const chunks = [];
    for await (const chunk of ipfs.cat(record.medicalRecordHash)) {
      chunks.push(chunk);
    }
    const encryptedBlob = new Blob(chunks);

    // Get symmetric key & IV from localStorage
    const symmetricKey = localStorage.getItem(
      record.medicalRecordHash + "_key"
    );
    const iv = localStorage.getItem(
      record.medicalRecordHash + "_iv"
    );

    if (!symmetricKey || !iv) {
      alert("Decryption key not found");
      return;
    }

    // Decrypt file
    const decryptedBlob = await decryptFile(
      encryptedBlob,
      symmetricKey,
      iv
    );
console.log("decrypt", symmetricKey)
    const endTime = performance.now();
    console.log(
      "Record Retrieval Latency:",
      ((endTime - startTime) / 1000).toFixed(2),
      "seconds"
    );

    // Open decrypted file
    const url = URL.createObjectURL(decryptedBlob);
    window.open(url, "_blank");

  } catch (error) {
    console.error("Error retrieving record:", error);
    alert("Failed to retrieve record");
  }
};

  const cancelOperation = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <p>Loading all records from blockchain...</p>
      </div>
    );
  }


  return (
    <div className="bg-gradient-to-b from-black to-gray-800 min-h-screen text-white">
      <NavBar_Logout />
      <div className="bg-white min-h-screen">
        <main className="mx-auto px-20 container w-full py-16">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Your Medical Records
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            A complete history of all documents on your timeline.
          </p>

          <div className="bg-white border rounded-2xl shadow-lg overflow-hidden">
            {records.length === 0 ? (
              <p className="p-8 text-center text-gray-500">
                No medical records found.
              </p>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Date Uploaded
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Uploaded By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Hospital
                    </th>
                    <th className="px-6 py-3"></th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {records.map((record, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {record.timeStamp}
                      </td>

                      <td className="px-6 py-4">
                        {record.doctorName ? (
                          <>
                            <div className="font-semibold text-gray-900">
                              {record.doctorName}
                            </div>
                            <div className="text-xs text-gray-500">
                              {record.doctorSpecialization}
                            </div>
                            <div className="text-xs text-gray-500">
                              {record.doctorDesignation}
                            </div>
                          </>
                        ) : (
                          <div className="text-green-700 font-medium">
                            Self Uploaded
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-900">
                        {record.hospitalName || "--"}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => viewRecordWithLatency(record)}
                          className="text-white bg-[#0B8FAC] hover:bg-opacity-90 px-4 py-2 rounded-md shadow-sm"
                        >
                          View Record
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="mt-8">
            <button
              onClick={cancelOperation}
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              ← Back to Dashboard
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

export default ViewPatientRecords;


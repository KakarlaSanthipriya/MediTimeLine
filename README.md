# MediTimeLine - Secure Blockchain-Based Healthcare Record Management

MediTimeLine is a decentralized healthcare record management system that enables secure storage and sharing of Electronic Health Records (EHRs) using blockchain technology. The system leverages Ethereum smart contracts, IPFS, and AES-GCM encryption to provide patient-centric, tamper-resistant, and privacy-preserving healthcare data management.


## Features

- 👤 Patient, Doctor, and Diagnostic Center Registration
- 🔐 Secure EHR encryption using AES-256-GCM
- ⛓️ Ethereum Smart Contracts for record management
- 📁 Decentralized file storage using IPFS
- 🔑 Role-based access control
- 🤝 Patient-controlled permission management
- 🩺 Doctor prescription generation
- 🧪 Diagnostic report upload
- 📜 Immutable audit trail of medical records
- 🔄 Secure sharing of records with authorized healthcare providers


## Tech Stack

### Frontend
- React.js
- HTML
- CSS
- JavaScript

### Backend
- Node.js
- Express.js

### Blockchain
- Solidity
- Ethereum
- Ganache
- Truffle
- Web3.js
- MetaMask

### Storage
- IPFS

### Security
- AES-256-GCM Encryption
- ECIES Key Encryption (EthCrypto)

---

## Project Structure

```
MediTimeLine/
│
├── contracts/
│   ├── PatientRegistration.sol
│   ├── DoctorRegistration.sol
│   ├── DiagnosticRegistration.sol
│   ├── UploadEhr.sol
│   └── DoctorForm.sol
│
├── migrations/
│
├── src/
│   ├── components/
│   ├── build/
│   ├── CSS/
│   └── App.js
│
├── test/
│
└── README.md
```

## Workflow

1. Patient registers and receives a Healthcare ID (HH Number).
2. Doctors and Diagnostic Centers register using MetaMask.
3. Patients upload encrypted medical records.
4. Files are stored on IPFS.
5. Metadata and access permissions are stored on Ethereum.
6. Patients grant or revoke doctor access.
7. Doctors retrieve and decrypt authorized records.
8. Diagnostic centers upload encrypted reports.
9. Patients and authorized doctors can securely access reports.

---

## Security Features

- AES-256-GCM file encryption
- ECIES encryption for AES key sharing
- Role-based access control
- Blockchain-based immutable metadata
- Patient-centric permission management

---

## Installation

### Clone the repository

```bash
git clone https://github.com/KakarlaSanthipriya/MediTimeLine.git
```

### Install dependencies

```bash
npm install
```

### Start Ganache

Run Ganache and ensure it is running on the configured network.

### Deploy Smart Contracts

```bash
truffle migrate --reset
```

### Start IPFS

```bash
ipfs daemon
```

### Start React Application

```bash
npm start
```

---

## Future Enhancements

- Proxy Re-Encryption (PRE)
- Decentralized Identity (DID)
- Zero-Knowledge Proofs (ZKP)
- Mobile Application
- Cloud IPFS Deployment
- Multi-hospital Consortium Blockchain

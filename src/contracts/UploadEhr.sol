// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract UploadEhr {
    struct PatientRecord {
        address uploader;
        string uploaderRole;
        string doctorName;
        string doctorDesignation;
        string doctorDepartment;
        string doctorSpecialization;
        string hospitalName;
        string timeStamp;
        string medicalRecordHash;
        address patientAddress; // <-- Add this field
    }

    mapping(address => PatientRecord[]) private records;
    PatientRecord[] private allRecords; // <-- Store every record globally

    // For patient self-upload
    function addPatientRecord(string memory _timeStamp, string memory _medicalRecordHash) public {
        PatientRecord memory newRecord = PatientRecord(
            msg.sender,
            "Patient",
            "",
            "",
            "",
            "",
            "",
            _timeStamp,
            _medicalRecordHash,
            msg.sender
        );

        records[msg.sender].push(newRecord);
        allRecords.push(newRecord); // <-- also add globally
    }

    // For diagnostic upload (includes doctor info + patient address)
    function addDiagnosticRecord(
        address _patient,
        string memory _doctorName,
        string memory _doctorDesignation,
        string memory _doctorDepartment,
        string memory _doctorSpecialization,
        string memory _hospitalName,
        string memory _timeStamp,
        string memory _medicalRecordHash
    ) public {
        PatientRecord memory newRecord = PatientRecord(
            msg.sender,
            "Diagnostic",
            _doctorName,
            _doctorDesignation,
            _doctorDepartment,
            _doctorSpecialization,
            _hospitalName,
            _timeStamp,
            _medicalRecordHash,
            _patient
        );

        records[_patient].push(newRecord);
        allRecords.push(newRecord); // <-- also add globally
    }

    // Get all records for a specific patient
    function getRecords(address _patient) public view returns (PatientRecord[] memory) {
        return records[_patient];
    }

    // Get ALL records (anyone can call this)
    function getAllRecords() public view returns (PatientRecord[] memory) {
        return allRecords;
    }
}

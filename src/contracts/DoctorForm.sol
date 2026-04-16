// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract DoctorForm {
    struct Record {
        string recordId;
        string patientName;
        address patientAddress;
        address diagnosticAddress;
        string gender;
        string diagnosis;
        string prescription;
        address doctorAddress;
    }

    mapping(address => Record[]) private patientRecords;
    mapping(address => Record[]) private diagnosticRecords;

    function createEHR(
        string memory _recordId,
        string memory _patientName,
        address _patientAddress,
        address _diagnosticAddress,   
        string memory _gender,
        string memory _diagnosis,
        string memory _prescription,
        address _doctorAddress
    ) public {
        Record memory newRecord = Record(
            _recordId,
            _patientName,
            _patientAddress,
            _diagnosticAddress,
            _gender,
            _diagnosis,
            _prescription,
            _doctorAddress
        );

        patientRecords[_patientAddress].push(newRecord);

        if (bytes(_diagnosis).length > 0 && _diagnosticAddress != address(0)) {
            diagnosticRecords[_diagnosticAddress].push(newRecord);
        }
    }

    function getPatientRecords(address _patient) public view returns (Record[] memory) {
        return patientRecords[_patient];
    }

    function getDiagnosticRecords(address _diagnostic) public view returns (Record[] memory) {
        return diagnosticRecords[_diagnostic];
    }
}

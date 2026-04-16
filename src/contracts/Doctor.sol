// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract DoctorRegistration {
    struct Doctor {
        address walletAddress;
        string doctorName;
        string hospitalName;
        string dateOfBirth;
        string gender;
        string email;
        string hhNumber;
        string specialization;
        string department;
        string designation;
        string workExperience;
        string password;
    }

    struct PatientList {
        string patient_number;
        string patient_name;
    }

    uint256 private doctorCounter = 1;

    // original mapping by hhNumber (kept for compatibility)
    mapping(string => address) private doctorAddresses;        // hhNumber -> wallet address
    mapping(string => Doctor) private doctors;                 // hhNumber -> Doctor struct

    // NEW: mapping by wallet address for permission operations
    mapping(address => Doctor) private doctorsByAddress;       // wallet address -> Doctor struct
    mapping(address => PatientList[]) private Dpermission;     // doctorWallet -> PatientList[]
    mapping(string => mapping(address => bool)) public doctorPermissions; // patientNumber -> (doctorWallet -> bool)
    mapping(address => bool) private isDoctorAddressRegistered;

    // Lists to enumerate
    string[] private allDoctorNumbers;
    address[] private allDoctorAddresses;

    event DoctorRegistered(string hhNumber, string doctorName, address walletAddress);

    function registerDoctor(
        string memory _doctorName,
        string memory _hospitalName,
        string memory _dateOfBirth,
        string memory _gender,
        string memory _email,
        string memory _specialization,
        string memory _department,
        string memory _designation,
        string memory _workExperience,
        string memory _password
    ) external {
        
        require(!isDoctorAddressRegistered[msg.sender], "Address already registered");

        string memory hhNumber = _generateDoctorHH();
        require(doctorAddresses[hhNumber] == address(0), "HH Number already registered");

        Doctor memory newDoctor = Doctor({
            walletAddress: msg.sender,
            doctorName: _doctorName,
            hospitalName: _hospitalName,
            dateOfBirth: _dateOfBirth,
            gender: _gender,
            email: _email,
            hhNumber: hhNumber,
            specialization: _specialization,
            department: _department,
            designation: _designation,
            workExperience: _workExperience,
            password: _password
        });

        // store by hhNumber (backwards compatibility)
        doctors[hhNumber] = newDoctor;
        doctorAddresses[hhNumber] = msg.sender;
        allDoctorNumbers.push(hhNumber);

        // store by wallet address (for permission lists and easier lookups)
        doctorsByAddress[msg.sender] = newDoctor;
        isDoctorAddressRegistered[msg.sender] = true;
        allDoctorAddresses.push(msg.sender);

        emit DoctorRegistered(hhNumber, _doctorName, msg.sender);
    }

    // Backwards-compatible check by hhNumber
    function isRegisteredDoctor(string memory _hhNumber) external view returns (bool) {
        return doctorAddresses[_hhNumber] != address(0);
    }

    // Backwards-compatible getter by hhNumber
    function getDoctorDetails(string memory _hhNumber) external view returns (
        address _walletAddress,
        string memory _doctorName,
        string memory _hospitalName,
        string memory _dateOfBirth,
        string memory _gender,
        string memory _email,
        string memory _specialization,
        string memory _department,
        string memory _designation,
        string memory _workExperience
    ) {
        require(doctorAddresses[_hhNumber] != address(0), "Doctor not registered");
        Doctor memory doctor = doctors[_hhNumber];
        return (
            doctor.walletAddress,
            doctor.doctorName,
            doctor.hospitalName,
            doctor.dateOfBirth,
            doctor.gender,
            doctor.email,
            doctor.specialization,
            doctor.department,
            doctor.designation,
            doctor.workExperience
        );
    }

    // NEW: get doctor details by wallet address
    function getDoctorDetailsByAddress(address _doctorAddress) external view returns (
        address _walletAddress,
        string memory _doctorName,
        string memory _hospitalName,
        string memory _dateOfBirth,
        string memory _gender,
        string memory _email,
        string memory _hhNumber,
        string memory _specialization,
        string memory _department,
        string memory _designation,
        string memory _workExperience
    ) {
        require(isDoctorAddressRegistered[_doctorAddress], "Doctor address not registered");
        Doctor memory doctor = doctorsByAddress[_doctorAddress];
        return (
            doctor.walletAddress,
            doctor.doctorName,
            doctor.hospitalName,
            doctor.dateOfBirth,
            doctor.gender,
            doctor.email,
            doctor.hhNumber,
            doctor.specialization,
            doctor.department,
            doctor.designation,
            doctor.workExperience
        );
    }

    function validatePassword(string memory _hhNumber, string memory _password) external view returns (bool) {
        require(doctorAddresses[_hhNumber] != address(0), "Doctor not registered");
        return keccak256(abi.encodePacked(_password)) == keccak256(abi.encodePacked(doctors[_hhNumber].password));
    }

    // --- PERMISSION API (now uses doctor wallet address) ---

    /// @notice Grant permission for patient `_patientNumber` to the doctor identified by wallet address `_doctorAddress`.
    /// @dev This writes into Dpermission[doctorWallet] and doctorPermissions[patientNumber][doctorWallet] = true
    function grantPermission(
        string memory _patientNumber,
        address _doctorAddress,
        string memory _patientName
    ) external {
        require(isDoctorAddressRegistered[_doctorAddress], "Doctor not registered (address)");

        PatientList memory newRecord = PatientList({
            patient_number: _patientNumber,
            patient_name: _patientName
        });

        Dpermission[_doctorAddress].push(newRecord);
        doctorPermissions[_patientNumber][_doctorAddress] = true;
    }

    // check permission for patientNumber -> doctorWallet
    function isPermissionGranted(string memory _patientNumber, address _doctorAddress) external view returns (bool) {
        return doctorPermissions[_patientNumber][_doctorAddress];
    }

    // revoke permission (by patientNumber and doctor wallet)
    function revokePermission(string memory _patientNumber, address _doctorAddress) public {
        doctorPermissions[_patientNumber][_doctorAddress] = false;

        // Remove the patient's record from Dpermission[doctorWallet]
        PatientList[] storage list = Dpermission[_doctorAddress];
        for (uint i = 0; i < list.length; i++) {
            if (keccak256(abi.encodePacked(list[i].patient_number)) == keccak256(abi.encodePacked(_patientNumber))) {
                // shift elements left
                for (uint j = i; j < list.length - 1; j++) {
                    list[j] = list[j + 1];
                }
                list.pop();
                break;
            }
        }
    }

    // get patient list for a doctor (by wallet address)
    function getPatientList(address _doctorAddress) public view returns (PatientList[] memory) {
        return Dpermission[_doctorAddress];
    }

    // return all doctors (enumeration) — returns array of Doctor structs (includes hhNumber etc.)
    function getAllDoctors() public view returns (Doctor[] memory) {
        Doctor[] memory doctorList = new Doctor[](allDoctorAddresses.length);
        for (uint i = 0; i < allDoctorAddresses.length; i++) {
            doctorList[i] = doctorsByAddress[allDoctorAddresses[i]];
        }
        return doctorList;
    }

    function _generateDoctorHH() internal returns (string memory) {
        uint256 hh = 880000 + doctorCounter;
        doctorCounter++;
        return _uintToString(hh);
    }

    function _uintToString(uint256 value) internal pure returns (string memory) {
        if (value == 0) return "0";
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) { digits++; temp /= 10; }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits--;
            buffer[digits] = bytes1(uint8(48 + value % 10));
            value /= 10;
        }
        return string(buffer);
    }
    function getNextDoctorHH() external view returns (string memory) {
    uint256 nextHH = 880000 + doctorCounter;
    return _uintToString(nextHH);
}
}

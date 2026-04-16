// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract DiagnosticRegistration {
    struct Diagnostic {
        address walletAddress;
        string diagnosticName;
        string hospitalName;
        string diagnosticLocation;
        string email;
        string hhNumber;
        string password;
    }

    uint256 private diagnosticCounter = 1;

    mapping(string => address) private diagnosticAddresses;
    mapping(string => Diagnostic) private diagnostics;
    string[] private allDiagnostics;   // ✅ keep track of registered hhNumbers

    event DiagnosticRegistered(string hhNumber, string diagnosticName, address walletAddress);

    function registerDiagnostic(
        string memory _diagnosticName,
        string memory _hospitalName,
        string memory _diagnosticLocation,
        string memory _email,
        string memory _password
    ) external {
        string memory hhNumber = _generateDiagnosticHH();
        require(diagnosticAddresses[hhNumber] == address(0), "Diagnostic already registered");

        Diagnostic memory newDiagnostic = Diagnostic({
            walletAddress: msg.sender,
            diagnosticName: _diagnosticName,
            hospitalName: _hospitalName,
            diagnosticLocation: _diagnosticLocation,
            email: _email,
            hhNumber: hhNumber,
            password: _password
        });

        diagnostics[hhNumber] = newDiagnostic;
        diagnosticAddresses[hhNumber] = msg.sender;
        allDiagnostics.push(hhNumber);   

        emit DiagnosticRegistered(hhNumber, _diagnosticName, msg.sender);
    }

    function isRegisteredDiagnostic(string memory _hhNumber) external view returns (bool) {
        return diagnosticAddresses[_hhNumber] != address(0);
    }

    function getDiagnosticDetails(string memory _hhNumber) external view returns (
        address _walletAddress,
        string memory _diagnosticName,
        string memory _hospitalName,
        string memory _diagnosticLocation,
        string memory _email
    ) {
        require(diagnosticAddresses[_hhNumber] != address(0), "Diagnostic not registered");
        Diagnostic memory diagnostic = diagnostics[_hhNumber];
        return (
            diagnostic.walletAddress,
            diagnostic.diagnosticName,
            diagnostic.hospitalName,
            diagnostic.diagnosticLocation,
            diagnostic.email
        );
    }

    function validatePassword(string memory _hhNumber, string memory _password) external view returns (bool) {
        require(diagnosticAddresses[_hhNumber] != address(0), "Diagnostic not registered");
        return keccak256(abi.encodePacked(_password)) == keccak256(abi.encodePacked(diagnostics[_hhNumber].password));
    }

    function getAllDiagnostics() external view returns (Diagnostic[] memory) {
        Diagnostic[] memory list = new Diagnostic[](allDiagnostics.length);
        for (uint i = 0; i < allDiagnostics.length; i++) {
            list[i] = diagnostics[allDiagnostics[i]];
        }
        return list;
    }

    // fetch one diagnostic by hhNumber
    function getDiagnostic(string memory _hhNumber) external view returns (Diagnostic memory) {
        require(diagnosticAddresses[_hhNumber] != address(0), "Diagnostic not registered");
        return diagnostics[_hhNumber];
    }
    function _generateDiagnosticHH() internal returns (string memory) {
        uint256 hh = 770000 + diagnosticCounter;
        diagnosticCounter++;
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
    function getNextDiagnosticHH() external view returns (string memory) {
    uint256 nextHH = 770000 + diagnosticCounter;
    return _uintToString(nextHH);
}
}

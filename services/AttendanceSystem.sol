// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AttendanceSystem {
    struct Attendance {
        uint256 timestamp;
        string status; // "check-in", "check-out", "break-start", "break-end"
        string location;
    }

    struct Leave {
        uint256 startDate;
        uint256 endDate;
        string leaveType;
        string status; // "pending", "approved", "rejected"
        string reason;
    }

    mapping(address => Attendance[]) public attendanceRecords;
    mapping(address => Leave[]) public leaveRequests;
    mapping(address => bool) public employees;
    mapping(address => bool) public admins;

    event AttendanceMarked(address employee, string status, uint256 timestamp);
    event LeaveRequested(address employee, uint256 startDate, uint256 endDate);
    event LeaveStatusUpdated(address employee, uint256 startDate, string status);

    constructor() {
        admins[msg.sender] = true;
    }

    modifier onlyAdmin() {
        require(admins[msg.sender], "Only admin can perform this action");
        _;
    }

    modifier onlyEmployee() {
        require(employees[msg.sender], "Only employees can perform this action");
        _;
    }

    function addEmployee(address _employee) public onlyAdmin {
        employees[_employee] = true;
    }

    function markAttendance(string memory _status, string memory _location) public onlyEmployee {
        attendanceRecords[msg.sender].push(Attendance({
            timestamp: block.timestamp,
            status: _status,
            location: _location
        }));
        
        emit AttendanceMarked(msg.sender, _status, block.timestamp);
    }

    function requestLeave(
        uint256 _startDate,
        uint256 _endDate,
        string memory _leaveType,
        string memory _reason
    ) public onlyEmployee {
        leaveRequests[msg.sender].push(Leave({
            startDate: _startDate,
            endDate: _endDate,
            leaveType: _leaveType,
            status: "pending",
            reason: _reason
        }));
        
        emit LeaveRequested(msg.sender, _startDate, _endDate);
    }

    function updateLeaveStatus(
        address _employee,
        uint256 _startDate,
        string memory _status
    ) public onlyAdmin {
        for (uint i = 0; i < leaveRequests[_employee].length; i++) {
            if (leaveRequests[_employee][i].startDate == _startDate) {
                leaveRequests[_employee][i].status = _status;
                emit LeaveStatusUpdated(_employee, _startDate, _status);
                break;
            }
        }
    }
} 
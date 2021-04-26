// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;

import "./Token.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

  contract dBank is ReentrancyGuard {
    //assign Token contract to variable
    Token private token;

    //add mappings
    mapping(address => uint256) public etherBalanceOf;
    mapping(address => uint256) public depositStart;
    mapping(address => bool) public isDeposited;

    //add events
    event Deposit(address indexed user, uint256 etherAmount, uint256 timeStart);
    event Withdraw(address indexed user, uint userBalance, uint depositTime, uint interest);

    //pass as constructor argument deployed Token contract
    constructor(Token _token) public {
        //assign token deployed contract to variable
        token = _token;
    }

    function deposit() public payable {
        //check if msg.sender didn't already deposited funds
        //check if msg.value is >= than 0.01 ETH
        require(
            isDeposited[msg.sender] == false,
            "Error, deposit already active"
        );
        require(msg.value >= 1e16, "Error, deposit must be >= 0.01 ETH");

        etherBalanceOf[msg.sender] = etherBalanceOf[msg.sender] + msg.value;
        depositStart[msg.sender] = depositStart[msg.sender] + block.timestamp;

        isDeposited[msg.sender] = true;
        emit Deposit(msg.sender, msg.value, block.timestamp);
    }

    function withdraw() public nonReentrant {
        require(
            isDeposited[msg.sender] == true,
            "Error, no deposit made before"
        );
        //check user's hodl time
        uint256 depositTime = block.timestamp - depositStart[msg.sender];

        uint interestPerSecond = 31668017 * (etherBalanceOf[msg.sender]/1e16);
        uint interest = interestPerSecond * depositTime;

        uint userBalance = etherBalanceOf[msg.sender];

        etherBalanceOf[msg.sender] = 0;
        depositStart[msg.sender] = 0;
        isDeposited[msg.sender] = false;

        token.mint(msg.sender, interest);

        //(bool success, ) = msg.sender.call.value(balance)("");
        (bool success, ) = msg.sender.call{value: userBalance}("");
        
        require(success, "Transfer failed");
        emit Withdraw(msg.sender, userBalance, depositTime, interest);
    }

    function borrow() public payable {
        //check if collateral is >= than 0.01 ETH
        //check if user doesn't have active loan
        //add msg.value to ether collateral
        //calc tokens amount to mint, 50% of msg.value
        //mint&send tokens to user
        //activate borrower's loan status
        //emit event
    }

    function payOff() public {
        //check if loan is active
        //transfer tokens from user back to the contract
        //calc fee
        //send user's collateral minus fee
        //reset borrower's data
        //emit event
    }
}

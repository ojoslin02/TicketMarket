// SPDX-License-Identifier: MIT
pragma solidity >=0.8.2 <0.9.0;
import {Ticket} from "./Ticket.sol";

contract ParadiseTicket is Ticket {

    // Invokes the constructor of the superclass.
        // string name: Paradise
        // uint256 totalSupply: 20,000
    constructor() Ticket("Paradise", 20000) {
    }

    // addTickets function
    // allows contract owner to add more tickets to the contract
        // uint256 amount: amount of tickets seller wants to add
    function addTickets(uint256 amount) public {
        require(msg.sender == ticketCreator, "You do not have permission to call this function.");
        owners[msg.sender] += amount;
        totalSupply += amount;
    }
}
// SPDX-License-Identifier: MIT
pragma solidity >=0.8.2 <0.9.0;
import {Ticket} from "./Ticket.sol";

contract MovieTicket is Ticket {
    
    string nickname;

    // Invokes the constructor of the superclass.
        // string name: Movie
        // uint256 totalSupply: 100,000
    constructor() Ticket("Movie", 100000) {
        nickname = "MoiveNight";
    }
}

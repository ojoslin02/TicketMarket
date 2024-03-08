// SPDX-License-Identifier: MIT
pragma solidity >=0.8.2 <0.9.0;
import {Ticket} from "./Ticket.sol";

contract TicketSale {

    // error alerting that the buyer doesn't have enough funds
    error BuyerNotEnoughFunds(string messgae, uint256 currentAmount, uint256 requiredAmount);
    // error alerting that the seller doesn't have enough tickets to sell
    error TicketSaleNotEnoughTickets(string messgae, uint256 requestedTickets, uint256 availableTickets);

    // RegisteredTicket Structure
    struct RegisteredTicket {
        address ticketOwner;
        address ticketAddress;
        uint256 price;
        uint256 amount;
    }

    // mapping of string name => RegisteredTicket ticket
    mapping (string => RegisteredTicket) public RegisteredTickets;
    // mapping of string name => bool isRegistered
    mapping (string => bool) public isRegistered;

    // register function
    // Enables ticket creators to register their tickets on the marketplace with a desired price and a number of tickets to sell.
        // address ticket: address of ticket contract
        // uint256 price: seller ticket price 
        // uint amount: amount of tickets to sell 
    function register(address ticket, uint256 price, uint amount) public {
        string memory name = Ticket(ticket).name();
        
        require(msg.sender == Ticket(ticket).ticketCreator(), "You are not the owner of this ticket contract.");
        require(isRegistered[name] == false, "This ticket is already registered.");
        
        RegisteredTickets[name] = RegisteredTicket({
            ticketOwner: msg.sender,
            ticketAddress: ticket,
            price: price,
            amount: amount
        });
        isRegistered[name] = true;
    }

    // fund function
    // Allows buyers to purchase a specified number of tickets of their choice. If a buyer provides a ticket name that does not exist, 
    // the function must revert with an appropriate message.
        // string ticketName: name of ticket to buy
        // uint256 amount: number of tickets buyer wants to purchase
    function fund(string memory ticketName, uint256 amount) public payable {
        RegisteredTicket storage ticket = RegisteredTickets[ticketName];
        
        require(isRegistered[ticketName], "This ticket is not registered.");
        if ((ticket.price * amount) != msg.value) {    // check if the seller has sufficient funds to stake against the order
            revert BuyerNotEnoughFunds("Please pay the exact value for this TX", (ticket.price * amount), msg.value);
        } else if (ticket.amount < amount) {
            revert TicketSaleNotEnoughTickets("This contract doesn't have enough tickets for this TX", amount, ticket.amount);
        }

        Ticket(ticket.ticketAddress).moveFrom(ticket.ticketOwner, msg.sender, amount);
        ticket.amount -= amount;
    }
}


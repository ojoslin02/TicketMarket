// SPDX-License-Identifier: MIT
pragma solidity >=0.8.2 <0.9.0;

contract Ticket {

    // Events 'Moved' and 'Allowed'. Emitted whenever a ticket is moved to a different owner or when a ticket owner 
    // allows to another account move their tickets.
    event Moved(address currentOwner, address newOwner, address delegate, uint256 numberMoved);
    event Allowed(address currentOwner, address delegate, uint256 numberAllowed);

    // mapping for address ticketOwner => uint256 numOfTickets
    mapping(address => uint256) public owners;
    // mapping for address ticketOwner => (mapping address ticketSeller => uint256 numberOfTickets)
    mapping(address owner => mapping(address mover => uint256 amount)) public movers;
    // tickets for what? (event name)
    string public name;
    // total supply of tickets
    uint public totalSupply;
    // ticket creator / contract deployer
    address public ticketCreator;
    
    // Ticket constructor
        // string _name: eventName
        // uint256 _totalSupply: total supply of tickets
    constructor(string memory _name, uint256 _totalSupply) {
        name = _name;
        totalSupply = _totalSupply;
        owners[msg.sender] = _totalSupply;
        ticketCreator = msg.sender;
    }

    // move function
    // allows ticketOwners to send a number of tickets to a new address
        // address to: reciever address
        // uint245 amount: numnber of tickets 
    function move(address to, uint256 amount) public {
        require(owners[msg.sender] >= amount, "Not enough tickets!");
        owners[msg.sender] -= amount;
        owners[to] += amount;
        emit Moved(msg.sender, to, msg.sender, amount);
    }

    // allow function
    // allows ticketOwners to allow other addresses (movers) to send ticketOwners tickets to a new address
        // address mover: address of mover
        // uint256 amount: amount of tickets allowed to sell
    function allow(address mover, uint256 amount) public {
        movers[msg.sender][mover] += amount;
        emit Allowed(msg.sender, mover, amount);
    }

    // moveFrom function
    // allows movers to send ticketOwners to a new address
        // address from: ticketOwners address
        // address to: reciever address
        // uint245 amount: numnber of tickets 
    function moveFrom(address from, address to, uint256 amount) public {
        require(owners[from] >= amount, "Not enough tickets!");
        require(movers[from][msg.sender] >= amount, "Not enough allowance");
        movers[from][msg.sender] -= amount;
        owners[from] -= amount;
        owners[to] += amount;
        emit Moved(msg.sender, to, from, amount);
    }
}

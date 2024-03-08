import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("ParadiseTicket and MovieTicket", function () {
  async function initialize() {
    const [alice, bob, charlie] = await ethers.getSigners();
    const CHARLIE_ALLOWANCE_PARADISE = 10000;
    const CHARLIE_ALLOWANCE_MOVIE = 50000;

    // Alice deploys ParadiseTicket
    const paradiseTicket = await ethers.deployContract("ParadiseTicket");
    // Alice authorizes Charlie to move 10,000 Paradise tickets on her behalf.
    await paradiseTicket.allow(charlie.address, CHARLIE_ALLOWANCE_PARADISE);

    // Bob deploys MovieTicket
    const movieTicketFactory = await ethers.getContractFactory("MovieTicket");
    const movieTicket = await movieTicketFactory.connect(bob).deploy();
    // Bob authorizes Charlie to move 50,000 Movie tickets on his behalf.
    await movieTicket.connect(bob).allow(charlie.address, CHARLIE_ALLOWANCE_MOVIE);

    return { alice, bob, charlie, paradiseTicket, movieTicket };
  }

  it("Should be initialized correctly", async function () {
    const { alice, bob, charlie, paradiseTicket, movieTicket } = await loadFixture(initialize);
    const TOTAL_SUPPLY_PARADISE = 20000;
    const TOTAL_SUPPLY_MOVIE = 100000;

    expect(await paradiseTicket.owners(alice.address)).to.equal(TOTAL_SUPPLY_PARADISE);
    expect(await movieTicket.owners(bob.address)).to.equal(TOTAL_SUPPLY_MOVIE);
    expect(await paradiseTicket.movers(alice.address, charlie.address)).to.equal(10000);
    expect(await movieTicket.movers(bob.address, charlie.address)).to.equal(50000);
  });

  // Test the new function you created in step 7 (b). The creator should own the sum of the initial supply 
  // and the new supply.
  it("The creator should own the sum of the initial supply and the new supply.", async function () {
    const { paradiseTicket, alice } = await loadFixture(initialize);
    const INITIAL_SUPPLY_PARADISE = 20000;
    const ADDED_SUPPLY_PARADISE = 10000;

    await paradiseTicket.addTickets(ADDED_SUPPLY_PARADISE);
   
    expect(await paradiseTicket.totalSupply()).to.equal(INITIAL_SUPPLY_PARADISE + ADDED_SUPPLY_PARADISE);
    expect(await paradiseTicket.owners(alice)).to.equal(INITIAL_SUPPLY_PARADISE + ADDED_SUPPLY_PARADISE);
  });

  // Test the moveFrom function to ensure that it reverts with a proper error message when an unauthorized 
  // account attempts to move ParadiseTicket from the creator to his own account.
  it("moveFrom reverts with error message when unauthorized account attempts to move ParadiseTicket from the creator to his own account.", async function () {
    const { alice, bob, paradiseTicket } = await loadFixture(initialize);
    const ERROR_MESSAGE = "Not enough allowance";

    await expect(paradiseTicket.connect(bob).moveFrom(alice.address, bob.address, 200)).to.be.revertedWith(ERROR_MESSAGE);
  });

  // Test the allow function to ensure that that delegate is given tickets.
  it("Ensure allow gives the delegate tickets.", async function () {
    const { bob, paradiseTicket } = await loadFixture(initialize);
    const DELEGATED_AMOUNT = 1000;
    const MOVER = bob.address;

    await paradiseTicket.allow(MOVER, DELEGATED_AMOUNT);
    await paradiseTicket.movers(paradiseTicket.ticketCreator(), MOVER);
    
    expect(await paradiseTicket.movers(paradiseTicket.ticketCreator(), MOVER)).to.be.equal(DELEGATED_AMOUNT);
  });
});

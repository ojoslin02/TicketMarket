import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("TicketSale", function () {
  async function initialize() {
    const [alice, bob, charlie, dave ] = await ethers.getSigners();
    const ticketSale = await ethers.deployContract("TicketSale");

    // Alice deploys ParadiseTicket
    const paradiseTicket = await ethers.deployContract("ParadiseTicket");
    const PARADISETICKETS = 20000;
    const PARADISEPRICE = 2 * 10 ** 9;
    const PARADISENAME = "Paradise";
    // Alice registers her ticket with the price of 2 gwei per ticket.  
    await ticketSale.register(paradiseTicket, PARADISEPRICE, PARADISETICKETS);
    // Alice allows TicketSale to move all of her tickets.
    await paradiseTicket.allow(ticketSale, PARADISETICKETS);
    // Charlie (funder 1) buys 1,000 Paradise tickets.
    await ticketSale.connect(charlie).fund(PARADISENAME, 1000, { value: (1000 * PARADISEPRICE) });

    // Bob deploys MovieTicket
    const movieTicketFactory = await ethers.getContractFactory("MovieTicket");
    const movieTicket = await movieTicketFactory.connect(bob).deploy();
    const MOVIETICKETS = 100000;
    const MOVIEPRICE = 1 * 10 ** 9;
    const MOVIENAME = "Movie";
    // Bob registers his ticket with the price of 1 gwei per ticket
    await ticketSale.connect(bob).register(movieTicket, MOVIEPRICE, MOVIETICKETS);
    // Bob allows TicketSale to move all of his tickets.
    await movieTicket.connect(bob).allow(ticketSale, MOVIETICKETS);
    // Dave (funder 2) buys 3,000 Movie tickets.
    await ticketSale.connect(dave).fund(MOVIENAME, 3000, { value: (3000 * MOVIEPRICE) });

    return { alice, bob, charlie, dave, paradiseTicket, movieTicket, ticketSale};
  }

  // Charlie owns 1,000 Paradise tickets
  it("Charlie owns 1,000 Paradise tickets", async function () {
    const { alice, bob, charlie, dave, paradiseTicket, movieTicket, ticketSale } = await loadFixture(initialize);
    expect(await paradiseTicket.owners(charlie.address)).to.equal(1000);
  });

  // Alice owns 20,000 – 1,000 Paradise tickets.
  it("Alice owns 20,000 – 1,000 Paradise tickets", async function () {
    const { alice, bob, charlie, dave, paradiseTicket, movieTicket, ticketSale } = await loadFixture(initialize);
    expect(await paradiseTicket.owners(alice.address)).to.equal(20000 - 1000);
  });

  // Dave owns 3,000 Movie tickets
  it("Dave owns 3,000 Movie tickets", async function () {
    const { alice, bob, charlie, dave, paradiseTicket, movieTicket, ticketSale } = await loadFixture(initialize);
    expect(await movieTicket.owners(dave.address)).to.equal(3000);
  });

  // Bob owns 100,000 – 3,000 Movie tickets.
  it("Bob owns 100,000 – 3,000 Movie tickets", async function () {
    const { alice, bob, charlie, dave, paradiseTicket, movieTicket, ticketSale } = await loadFixture(initialize);
    expect(await movieTicket.owners(bob.address)).to.equal(100000 - 3000);
  });

  // If Bob (or any user other than Alice) attempts to register ParadiseTicket, the register function should revert with a proper message.
  it("If Bob (or any user other than Alice) attempts to register ParadiseTicket, the register function should revert with a proper message", async function () {
    const { alice, bob, charlie, dave, paradiseTicket, movieTicket, ticketSale } = await loadFixture(initialize);
    const ERROR_MESSAGE = "You are not the owner of this ticket contract.";

    await expect(ticketSale.connect(bob).register(paradiseTicket, 1, 200)).to.be.revertedWith(ERROR_MESSAGE);
    await expect(ticketSale.connect(charlie).register(paradiseTicket, 1, 200)).to.be.revertedWith(ERROR_MESSAGE);
    await expect(ticketSale.connect(dave).register(paradiseTicket, 1, 200)).to.be.revertedWith(ERROR_MESSAGE);
  });
});

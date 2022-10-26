const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

describe("CrowdFund", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  let owner, addr1, addr2;
  let usd, crowdFund;
  beforeEach(async function ()  {
    // Contracts are deployed using the first signer/account by default
    [owner, addr1, addr2] = await ethers.getSigners();
    const USDT = await ethers.getContractFactory("USDTTEST");
    usd = await USDT.deploy();
    await usd.transfer(addr1.address, '1000000000000');
    const CrowdFund = await ethers.getContractFactory("CrowdFund");
    crowdFund = await CrowdFund.deploy(usd.address);
  });

  it("Deployment", async function () {
    expect(await usd.balanceOf(addr1.address)).to.equal('1000000000000');
  });

  it("Deposit token from addr1 to addr2", async function () {
    await usd.connect(addr1).approve(crowdFund.address, '10000000');
    await crowdFund.connect(addr1).deposit('10000000', addr2.address);
    expect(await usd.balanceOf(crowdFund.address)).to.equal('10000000');
  });

  it("Deposit and Withdraw token from addr1 to addr2", async function () {
    // deposit
    await usd.connect(addr1).approve(crowdFund.address, '20000000');
    await crowdFund.connect(addr1).deposit('20000000', addr2.address);
    expect(await usd.balanceOf(crowdFund.address)).to.equal('20000000');
    // withdraw
    await crowdFund.connect(addr2).withdraw();
    expect(await usd.balanceOf(crowdFund.address)).to.equal('0');
    expect(await usd.balanceOf(addr2.address)).to.equal('20000000');
  });

  it("Deposit and Withdraw token many time from addr1 to addr2", async function () {
    // deposit
    await usd.connect(addr1).approve(crowdFund.address, '90000000');
    await crowdFund.connect(addr1).deposit('20000000', addr2.address);
    await crowdFund.connect(addr1).deposit('10000000', addr2.address);

    expect(await usd.balanceOf(crowdFund.address)).to.equal('30000000');
    // withdraw
    await crowdFund.connect(addr2).withdraw();
    expect(await usd.balanceOf(crowdFund.address)).to.equal('0');
    expect(await usd.balanceOf(addr2.address)).to.equal('30000000');
  });

  it("User in blacklist cannot withdraw", async function () {
    // deposit
    await usd.connect(addr1).approve(crowdFund.address, '90000000');
    await crowdFund.connect(addr1).deposit('20000000', addr2.address);
    await crowdFund.connect(addr1).deposit('10000000', addr2.address);

    expect(await usd.balanceOf(crowdFund.address)).to.equal('30000000');
    // withdraw
    await crowdFund.connect(addr2).withdraw();
    expect(await usd.balanceOf(crowdFund.address)).to.equal('0');
    expect(await usd.balanceOf(addr2.address)).to.equal('30000000');
  });

});

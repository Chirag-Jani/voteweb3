const { expect } = require("chai");
const { ethers } = require("hardhat");
const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");

describe("VoteWeb3 Contract Testing", () => {
  async function deploy() {
    const [owner, otherAccount] = await ethers.getSigners();

    const VoteWeb3 = await ethers.getContractFactory("VoteWeb3");
    const deployedContract = await VoteWeb3.deploy();

    return { owner, otherAccount, deployedContract };
  }

  describe("Deployment", () => {
    it("Should set the right Manager", async () => {
      const { deployedContract, owner, otherAccount } = await loadFixture(
        deploy
      );

      expect(await deployedContract.getManager()).to.equal(owner.address);
    });
  });

  describe("Errors in Starting Election", () => {
    it("Should create the election", async () => {
      const { deployedContract, owner } = await loadFixture(deploy);
      await deployedContract.createElection(1, 3);
    });

    it("Should Request a candidate successfully", async () => {
      const { deployedContract } = await loadFixture(deploy);
      await deployedContract.createElection(1, 3);

      await deployedContract.requestCandidate(
        0,
        "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2",
        "Jani",
        1
      );
    });

    it("Should not let request candidate twice", async () => {
      const { deployedContract } = await loadFixture(deploy);
      await deployedContract.createElection(1, 3);

      //   requesting two candidates
      await deployedContract.requestCandidate(
        0,
        "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2",
        "Jani",
        1
      );
      await deployedContract.requestCandidate(
        0,
        "0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db",
        "Chirag",
        2
      );

      await expect(
        deployedContract.requestCandidate(
          0,
          "0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db",
          "Chirag",
          2
        )
      ).to.revertedWith("You have Already Requested");
    });

    it("Shoud let approve Candidate", async () => {
      const { deployedContract } = await loadFixture(deploy);
      await deployedContract.createElection(1, 3);

      //   approving candidates
      await deployedContract.approveCandidate(
        0,
        "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2"
      );
    });

    it("Should not let add candidate twice", async () => {
      const { deployedContract } = await loadFixture(deploy);
      await deployedContract.createElection(1, 3);

      //   approving candidates
      await deployedContract.approveCandidate(
        0,
        "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2"
      );
      await expect(
        deployedContract.approveCandidate(
          0,
          "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2"
        )
      ).to.be.revertedWith("You are already a Candidate in this Election");

      deployedContract.approveCandidate(
        0,
        "0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db"
      );
    });

    it("Should not start with reason 'Not enough Candidates'", async () => {
      const { deployedContract } = await loadFixture(deploy);
      await deployedContract.createElection(1, 3);

      await expect(deployedContract.start(0)).to.revertedWith(
        "Not enough Candidates"
      );
    });
  });

  //   start smoothly now
  describe("Start Smoothly Now", () => {
    it("Create election", async () => {
      const { deployedContract, owner } = await loadFixture(deploy);
      await deployedContract.createElection(1, 3);
    });

    it("Should Start Election with 2 Candidates", async () => {
      const { deployedContract, owner } = await loadFixture(deploy);
      await deployedContract.createElection(1, 3);

      await deployedContract.requestCandidate(
        0,
        "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2",
        "Jani",
        1
      );
      await deployedContract.requestCandidate(
        0,
        "0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db",
        "Chirag",
        2
      );

      deployedContract.approveCandidate(
        0,
        "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2"
      );

      deployedContract.approveCandidate(
        0,
        "0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db"
      );

      deployedContract.start(0);
      // ! something suspicious is happening here
    });
  });

  describe("Voting Test", () => {
    it("Should not let vote before starting", async () => {
      const { deployedContract, owner } = await loadFixture(deploy);
      await deployedContract.createElection(1, 3);

      await deployedContract.requestCandidate(
        0,
        "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2",
        "Jani",
        1
      );
      await deployedContract.requestCandidate(
        0,
        "0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db",
        "Chirag",
        2
      );

      deployedContract.approveCandidate(
        0,
        "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2"
      );

      deployedContract.approveCandidate(
        0,
        "0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db"
      );

      await expect(
        deployedContract.vote(0, "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2")
      ).to.revertedWith("Election state must be Ongoing");
    });
  });
});

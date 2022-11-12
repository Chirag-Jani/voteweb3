const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("VoteWeb3 Contract Testing", () => {
  async function deploy() {
    const [owner, otherAccount] = await ethers.getSigners();

    const VoteWeb3 = await ethers.getContractFactory("VoteWeb3");
    const deployedContract = await VoteWeb3.deploy();

    return { owner, otherAccount, deployedContract };
  }

  describe("Deployment", () => {
    it("Should set the right Manager", async () => {
      const { deployedContract, owner } = await loadFixture(deploy);

      expect(await deployedContract.getManager()).to.equal(owner.address);
    });
  });

  describe("Testing Different scenarios while Starting", () => {
    it("Should create the election", async () => {
      const { deployedContract } = await loadFixture(deploy);
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

      await deployedContract.approveCandidate(
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

      // writing once that it should emit event (if its working others are working too)
      await expect(
        deployedContract.requestCandidate(
          0,
          "0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db",
          "Chirag",
          2
        )
      ).to.emit(deployedContract, "CandidateRequested");

      await deployedContract.approveCandidate(
        0,
        "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2"
      );

      // writing once that it should emit event (if its working others are working too)
      await expect(
        deployedContract.approveCandidate(
          0,
          "0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db"
        )
      ).to.emit(deployedContract, "CandidateAdded");

      await expect(deployedContract.start(0)).to.emit(
        deployedContract,
        "ElectionStarted"
      );
    });

    it("Should not let Request after election started", async () => {
      const { deployedContract, owner } = await loadFixture(deploy);
      await deployedContract.createElection(1, 3);

      await deployedContract.requestCandidate(
        0,
        "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2",
        "Jani",
        1
      );

      // writing once that it should emit event (if its working others are working too)
      await expect(
        deployedContract.requestCandidate(
          0,
          "0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db",
          "Chirag",
          2
        )
      ).to.emit(deployedContract, "CandidateRequested");

      await deployedContract.approveCandidate(
        0,
        "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2"
      );

      // writing once that it should emit event (if its working others are working too)
      await expect(
        deployedContract.approveCandidate(
          0,
          "0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db"
        )
      ).to.emit(deployedContract, "CandidateAdded");

      await expect(deployedContract.start(0)).to.emit(
        deployedContract,
        "ElectionStarted"
      );

      await expect(
        deployedContract.requestCandidate(
          0,
          "0x78731D3Ca6b7E34aC0F824c42a7cC18A495cabaB",
          "new user",
          2
        )
      ).to.revertedWith("Election state must be Created");
    });
  });

  describe("Voting and Ending Election Properly", () => {
    it("Should not let vote before starting", async () => {
      const { deployedContract } = await loadFixture(deploy);
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

      await deployedContract.approveCandidate(
        0,
        "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2"
      );

      await deployedContract.approveCandidate(
        0,
        "0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db"
      );

      await expect(
        deployedContract.vote(0, "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2")
      ).to.revertedWith("Election state must be Ongoing");
    });

    it("Should Vote if Election Started", async () => {
      const { deployedContract } = await loadFixture(deploy);
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

      await deployedContract.approveCandidate(
        0,
        "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2"
      );

      await deployedContract.approveCandidate(
        0,
        "0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db"
      );

      await expect(deployedContract.start(0)).to.emit(
        deployedContract,
        "ElectionStarted"
      );

      await deployedContract.vote(
        0,
        "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2"
      );
    });

    it("Should not let vote twice the same user", async () => {
      const { deployedContract } = await loadFixture(deploy);
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

      await deployedContract.approveCandidate(
        0,
        "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2"
      );

      await deployedContract.approveCandidate(
        0,
        "0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db"
      );

      await expect(deployedContract.start(0)).to.emit(
        deployedContract,
        "ElectionStarted"
      );

      await deployedContract.vote(
        0,
        "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2"
      );
      await expect(
        deployedContract.vote(0, "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2")
      ).to.revertedWith("You have already voted");
    });

    it("Should return Proper winner", async () => {
      const { deployedContract } = await loadFixture(deploy);
      await deployedContract.createElection(1, 3);

      const [addr1, addr2, addr3] = await ethers.getSigners();

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

      await deployedContract.approveCandidate(
        0,
        "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2"
      );

      await deployedContract.approveCandidate(
        0,
        "0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db"
      );

      await expect(deployedContract.start(0)).to.emit(
        deployedContract,
        "ElectionStarted"
      );

      // vote 1 from addr1 or owner
      await deployedContract
        .connect(addr1)
        .vote(0, "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2");

      // vote 2 from addr2
      await deployedContract
        .connect(addr2)
        .vote(0, "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2");

      // vote 1 for another address from addr3
      await deployedContract
        .connect(addr3)
        .vote(0, "0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db");

      // ending election properly
      await expect(deployedContract.end(0))
        .to.emit(deployedContract, "ElectionEnded")
        .withArgs(Array);

      const election = await deployedContract.getAllElection();

      expect(election[0].winner).to.equal(
        "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2"
      );

      expect(election[0].electionState).to.equal(2);
    });
  });
});

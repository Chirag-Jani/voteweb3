// 0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2
// 0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db
// 0x78731D3Ca6b7E34aC0F824c42a7cC18A495cabaB

// Tasks:
// start and end time - convert block.timestamp into readable timeform
// end election based on timestamp

// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.8;

contract VoteWeb3 {
    // MANAGER SHIT - BOX STARTS
    address private manager;

    constructor() {
        // WHOEVER DEPLOYS CONTRACT - IS THE MANAGER OF THE DAPP
        manager = msg.sender;
    }

    // function to get manager
    function getManager() public view returns (address) {
        return manager;
    }

    // STAY OUT OF THE ABOVE BOX

    // Election Struct
    struct Election {
        uint256 electionIndex;
        Candidate[] approvedcandidates;
        Candidate[] requestedCandidates;
        uint256 startDateAndTime;
        uint256 endDateAndTime;
        uint256 totalVotes;
        uint256 winnerVotes;
        address winner;
        ElectionState electionState;
    }

    // candidateVotes[0][0x5B38Da6a701c568545dCfcB03FcB875f56beddC4] => will return the votes of given address in the given indexed election
    mapping(uint256 => mapping(address => uint256)) candidateVotes;

    // to know if candidate already exist in a given election
    mapping(uint256 => mapping(address => bool)) candidateExist;

    // to know if candidate already requested for a given election
    mapping(uint256 => mapping(address => bool)) candidateRequested;

    // to get candidate to add after request - values will be set while requesting
    mapping(uint256 => mapping(address => Candidate)) getCandidateInfo;

    // to know if user has already voted or not
    mapping(uint256 => mapping(address => bool)) userVoted;

    // Candidate Struct
    struct Candidate {
        address candidateAddress;
        string candidateName;
        Symbol candidateSymbol;
    }

    // Symbols to choose from - passed as uint
    enum Symbol {
        BJP,
        AAP,
        CON
    }

    // States of Election to perform functionalities
    enum ElectionState {
        Created,
        Ongoing,
        Finished,
        Discarded
    }

    // winner votes - this will keep getting updated as people votes
    uint256 highestVotes = 0;

    // winner address - this will keep getting updated as people votes
    address currentWinningCandidate;

    // to store all the elections
    Election[] allElections;

    // utility to add elections
    Election electioInstance;

    // to manage election indexes - to retrive elections - IMP variable
    uint256 currentElectionIndex = 0;

    // Events to emit on function calls

    event ElectionCreated(Election);

    event GetElection(Election);

    event ElectionStarted(Election);

    event ElectionEnded(Election);

    event CandidateRequested(Candidate);

    event CandidateAdded(Candidate);

    // creating new election
    function createElection(uint256 startTime, uint256 endTime) public {
        // msg.sender should be manager
        require(msg.sender == manager, "You are not Authorized");

        // setting index
        electioInstance.electionIndex = currentElectionIndex;

        // setting state
        electioInstance.electionState = ElectionState.Created;

        // pushing to array
        allElections.push(electioInstance);

        // setting start time
        setStartTime(currentElectionIndex, startTime);

        // setting end time
        setEndTime(currentElectionIndex, endTime);

        // incrementing index for next
        currentElectionIndex++;

        emit ElectionCreated(allElections[currentElectionIndex - 1]);
    }

    // setting start time
    function setStartTime(uint256 _electionIndex, uint256 amount) internal {
        allElections[_electionIndex].startDateAndTime =
            block.timestamp +
            amount;
        // allElections[_electionIndex].startDateAndTime = block.number + amount;
    }

    // setting end time
    function setEndTime(uint256 _electionIndex, uint256 amount) internal {
        allElections[_electionIndex].endDateAndTime = block.timestamp + amount;
        // allElections[_electionIndex].endDateAndTime = block.number + amount;
    }

    // Requesting Candidate
    function requestCandidate(
        uint256 _electionIndex,
        address _candidateAddress,
        string memory _candidateName,
        Symbol _candidateSymbol
    ) public {
        // election should be 'Created' to add candidate (Ongoing, Finished, Discarded - should not be)
        require(
            allElections[_electionIndex].electionState == ElectionState.Created,
            "Election state must be Created"
        );

        // candidate should not be a part of election already
        require(
            candidateExist[_electionIndex][_candidateAddress] == false,
            "You are already a Candidate in this Election"
        );

        // candidate should not have requested already
        require(
            candidateRequested[_electionIndex][_candidateAddress] == false,
            "You have Already Requested"
        );

        // updating
        candidateRequested[_electionIndex][_candidateAddress] = true;

        Candidate memory candiadteStructInstance;
        candiadteStructInstance.candidateAddress = _candidateAddress;
        candiadteStructInstance.candidateName = _candidateName;
        candiadteStructInstance.candidateSymbol = _candidateSymbol;
        allElections[_electionIndex].requestedCandidates.push(
            candiadteStructInstance
        );

        // setting to retrive later
        getCandidateInfo[_electionIndex][
            _candidateAddress
        ] = candiadteStructInstance;

        emit CandidateRequested(candiadteStructInstance);
    }

    // Approving Candidate
    function approveCandidate(uint256 _electionIndex, address _candidateAddress)
        public
    {
        // msg.sender should be manager
        require(msg.sender == manager, "You are not Authorized");

        // election should be 'Created' to add candidate (Ongoing, Finished, Discarded - should not be)
        require(
            allElections[_electionIndex].electionState == ElectionState.Created,
            "Election state must be Created"
        );

        // candidate should not be a part of election already
        require(
            candidateExist[_electionIndex][_candidateAddress] == false,
            "You are already a Candidate in this Election"
        );

        // updating
        candidateExist[_electionIndex][_candidateAddress] = true;

        // Getting candidate
        Candidate memory getCandidate = getCandidateInfo[_electionIndex][
            _candidateAddress
        ];

        // Adding candidate
        allElections[_electionIndex].approvedcandidates.push(getCandidate);

        emit CandidateAdded(getCandidate);
    }

    // starting election
    function start(uint256 _electionIndex) public {
        // election should be 'Created' to start it (Ongoing, Finished, Discarded - should not be)
        require(
            allElections[_electionIndex].electionState == ElectionState.Created,
            "Election state must be Created"
        );

        // minimum 2 candidates required
        require(
            allElections[_electionIndex].approvedcandidates.length >= 2,
            "Not enough Candidates"
        );

        // updating election state
        allElections[_electionIndex].electionState = ElectionState.Ongoing;

        emit ElectionStarted(allElections[_electionIndex]);
    }

    // ending election
    function end(uint256 _electionIndex) public {
        // election should be 'Ongoing' to end it (Created, Finished, Discarded - should not be)
        require(
            allElections[_electionIndex].electionState == ElectionState.Ongoing,
            "Election state must be Ongoing"
        );

        // updating election state
        allElections[_electionIndex].electionState = ElectionState.Finished;

        // setting winner address
        allElections[_electionIndex].winner = currentWinningCandidate;

        // setting winner votes
        allElections[_electionIndex].winnerVotes = highestVotes;

        emit ElectionEnded(allElections[_electionIndex]);
    }

    // discarding election
    function discard(uint256 _electionIndex) public {
        // updating election state
        allElections[_electionIndex].electionState = ElectionState.Discarded;
    }

    // vote function
    function vote(uint256 _electionIndex, address _candidateAddress) public {
        // election should be 'Ongoing' to vote (Created, Finished, Discarded - should not be)
        require(
            allElections[_electionIndex].electionState == ElectionState.Ongoing,
            "Election state must be Ongoing"
        );

        // candidate can not vote
        require(
            candidateExist[_electionIndex][msg.sender] == false,
            "Candidate can not vote"
        );

        // user must not have voted already
        require(
            userVoted[_electionIndex][msg.sender] == false,
            "You have already voted"
        );

        // marking it true
        userVoted[_electionIndex][msg.sender] = true;

        // total votes in an election
        allElections[_electionIndex].totalVotes++;

        // increasing vote of the candidate
        candidateVotes[_electionIndex][_candidateAddress] += 1;

        // not working - needs some library import
        // highestVotes = max(highestVotes, candidateVotes[_electionIndex][_candidateAddress]);

        // updating highest votes and potential winner as people vote
        if (highestVotes < candidateVotes[_electionIndex][_candidateAddress]) {
            highestVotes = candidateVotes[_electionIndex][_candidateAddress];
            currentWinningCandidate = _candidateAddress;
        }
    }

    // get recieved votes of a candidate
    function getVotes(uint256 _electionIndex, address _candidateAddress)
        public
        returns (uint256)
    {
        emit GetElection(allElections[_electionIndex]);
        return candidateVotes[_electionIndex][_candidateAddress];
    }

    // get single election info
    function getElection(uint256 _electionIndex)
        public
        returns (Election memory)
    {
        emit GetElection(allElections[_electionIndex]);
        return allElections[_electionIndex];
    }

    // get single election info
    function getAllElection() public view returns (Election[] memory) {
        return allElections;
    }
}

// request candidate func
// while rendering on frontend use State enum to list Created, Ongoing, Finished, and Discarded elections (different arrays won't be needed)
// can't add candidate w/o request
// candidate can directly apply or create account

// tests to be done:
//* - manager check
//* - create election
//* - add candidate
//* - check candidate array
//* - add same candidate again
//* - min 2 candidates needed
// - vote before starting
// - start election and then add candidate
// - vote after starting
// - vote from same account to the same election
//     - to same candidate
//     - to different candidate
// - create another election
// - add same 2 candidates
// - check candidate array
// - vote to candidates from different accounts
//     - 2 votes to one candidate
//     - 1 vote to the other candidate
// - end first election
//     - check winner
// - check first election state
// - end 2nd election
//     - check winner
// - check 2nd election state
// - create another election
// - add 2 candidates
// - same process
//     - one with 2 votes
//     - one with 1 vote
// - wait till the timer expires (end time limit reached)
// - check election state
// - check winner

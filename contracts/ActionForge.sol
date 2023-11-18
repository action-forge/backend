// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@aave/core-v3/contracts/interfaces/IAaveOracle.sol";
import "@aave/core-v3/contracts/interfaces/IPool.sol";

import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";

import "./interfaces/IWrappedTokenGatewayV3.sol";
import "./interfaces/ISDAI.sol";
import "./Scheduler.sol";
import {RegistrationParams} from "./Scheduler.sol";

import "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";
import {FunctionsClient} from "@chainlink/contracts/src/v0.8/functions/dev/v1_0_0/FunctionsClient.sol";
import {FunctionsRequest} from "@chainlink/contracts/src/v0.8/functions/dev/v1_0_0/libraries/FunctionsRequest.sol";

contract ActionForge is AutomationCompatibleInterface, FunctionsClient, Ownable {
    using FunctionsRequest for FunctionsRequest.Request;
    
    // functions
    Scheduler public scheduler;
    address public upkeepContract; //
    string public source; // js code to be executed by Functions
    uint64 public subscriptionId;
    uint32 public gasLimit; // 300000
    bytes32 public donID;  // sepolia: 0x66756e2d657468657265756d2d7365706f6c69612d3100000000000000000000;


    enum ActionType {
        ERC20_TRANSFER,
        BORROW_GHO, // aave
        BUY_SDAI, // spark
        NO_ACTION // dont do anything
    }

    mapping(address => bytes32[]) public proposalMap; // mapping of each user to their proposal/actions combos (actionForgeId)
    mapping(bytes32 => Proposal) public proposals; // mapping of actionForgeId to proposal

    // aave
    mapping(address => uint256) public ethDeposited; // mapping of user to their eth deposits

    // mapping(bytes32 => uint8) public snapshotStatus; // mapping of proposalId to snapshot status  // @later

    struct Proposal{
        bytes32 snapshotId;
        bytes32 actionForgeId;
        uint endTime;  // frontend will populate this from snapshot APIs
        Action[] actions;
        bool executed;
        uint256 winnerOption;
    }

    struct Action {
        ActionType actionType;
        bytes txData;
    }

    uint256 public nonce; // nonce for txs made by this contract
    address public chainLinkAddress;  // wallet which can execute actions on behalf of this contract

    mapping(bytes32 => Action) actionMap; // actionId to Action mapping
    // mapping(address => uint256) public nonces;
    mapping(bytes32 => bytes32) public requestMap; // requestId to proposalId mapping
    // mapping(address => mapping(uint256 => bytes)) public storedSignatures;

    IUniswapV2Router02 public uniswapRouter; // 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D

    // aave
    address public aaveWrappedTokenGatewayV3;
    address public aavePoolProxy;
    address public ghoToken;  // 0x5d00fab5f2F97C4D682C1053cDCAA59c2c37900D
    address public aaveOracle;
    address public aaveEthAsset; //WETH-TestnetMintableERC20   // 0x84ced17d95F3EC7230bAf4a369F1e624Ae60090d

    // spark
    address public sdaiContract; //  = "0xD8134205b0328F5676aaeFb3B2a0DC15f4029d8C";
    address public daiContract;  // = "0x11fE4B6AE13d2a6055C8D9cF65c55bac32B5d844";

    event ActionExecuted(bytes32 indexed proposalId, uint256 option, ActionType actionType);
    // event ActionRegistered(bytes32 indexed actionId, address indexed registeredBy, bytes32 snapshotID);
    // event ProposalEnded(bytes32 indexed proposalId, uint8 status, uint256 endTime);
    event ActionForgeRegistered(bytes32 indexed proposalId, bytes32 indexed actionForgeId, uint256 upkeepId, address createdBy, Proposal proposal);

    event ETHReceived(address user, uint256 amount);
    // receive() external payable {}

    error NotAllowedCaller(
        address caller,
        address owner,
        address automationRegistry
    );
    error UnexpectedRequestID(bytes32 requestId);

    event Response(bytes32 indexed requestId, bytes response, bytes err);

    constructor(
        address router,
        uint64 _subscriptionId,
        string memory _source,
        uint32 _gasLimit,
        bytes32 _donID
    ) FunctionsClient(router) Ownable(msg.sender) {
        subscriptionId = _subscriptionId;
        source = _source;
        gasLimit = _gasLimit;
        donID = _donID;
    }

    function setScheduler(address _scheduler) external onlyOwner {
        scheduler = Scheduler(_scheduler);
    }

    function setAaveParams(address _aaveWrappedTokenGatewayV3, address _aavePoolProxy, address _ghoToken, address _aaveOracle, address _aaveEthAsset) external onlyOwner {
        aaveWrappedTokenGatewayV3 = _aaveWrappedTokenGatewayV3;
        aavePoolProxy = _aavePoolProxy;
        ghoToken = _ghoToken;
        aaveOracle = _aaveOracle;
        aaveEthAsset = _aaveEthAsset;
    }

    function setSparkParams(address _sdaiContract, address _daiContract) external onlyOwner {
        sdaiContract = _sdaiContract;
        daiContract = _daiContract;
    }

    function setUniswapParams(address _uniswapRouter) external onlyOwner {
        uniswapRouter = IUniswapV2Router02(_uniswapRouter);
    }

    receive() external payable {
        ethDeposited[msg.sender] += msg.value;
        emit ETHReceived(msg.sender, msg.value);
    }

    function registerProposal(Proposal calldata proposalData) external {
        // @todo: check action specific validations - check that token is approved before accepting
        // @todo: validate action struct fields

        bytes32 actionForgeId = keccak256(abi.encodePacked(proposalData.snapshotId, msg.sender));
        require(proposals[actionForgeId].snapshotId == bytes32(0), "Proposal already registered");

        proposals[actionForgeId] = proposalData;
        Proposal storage proposal = proposals[actionForgeId];
        proposal.actionForgeId = actionForgeId;

        for (uint i = 0; i < proposalData.actions.length; i++) {
            Action memory action = proposal.actions[i];
            proposal.actions[i] = action;
        }

        uint256 upkeepId = scheduler.registerAndPredictID(
            RegistrationParams({
                name: "ActionForge",
                encryptedEmail: "",
                upkeepContract: address(this),
                gasLimit: 300000,
                adminAddress: msg.sender,
                triggerType: 0,
                checkData: bytes32ToBytes(proposal.actionForgeId),
                triggerConfig: "",
                offchainConfig: "",
                amount: 1e17  // 0.1 LINK
            })
        );
        emit ActionForgeRegistered(proposal.snapshotId, proposal.actionForgeId, upkeepId, msg.sender, proposal);
    }

    // ERC20 transfer
    function transferERC20(bytes calldata dataBytes) external {
        (address destination, address tokenAddress, uint256 amount) = abi.decode(dataBytes, (address, address, uint256));
        require(IERC20(tokenAddress).allowance(msg.sender, address(this)) > amount, "Amount not aproved");
        IERC20(tokenAddress).transferFrom(msg.sender, destination, amount);
    }

    // AAVE
    function borrowGHO(bytes calldata dataBytes) external {
        (address destination, uint256 ethAmount) = abi.decode(dataBytes, (address, uint256));
        require(ethDeposited[destination] >= ethAmount, "Insufficient ETH deposited");

        IWrappedTokenGatewayV3(aaveWrappedTokenGatewayV3).depositETH{value: ethAmount}(aavePoolProxy, address(this), 0);

        ethDeposited[destination] -= ethAmount;

        // address[] memory addresses = new address[](1);
        // addresses[0] = aaveEthAsset;
        // uint256[] memory ethPrices = IAaveOracle(aaveOracle).getAssetsPrices(addresses);
        // uint256 borrowCap = (ethAmount * ethPrices[0] / 1e9 * 8) / 10; // 80% of the value of the ETH deposited
        uint256 borrowCap = 10000000000000000;

        IPool(aavePoolProxy).borrow(ghoToken, borrowCap, 2, 0, destination);
    }

    // spark
    function buySDAI(bytes calldata dataBytes) external {
        (address destination, uint256 ethAmount) = abi.decode(dataBytes, (address, uint256));
        require(ethDeposited[destination] >= ethAmount, "Insufficient ETH deposited");

        uint256 daiAmount = swapEthForToken(ethAmount, daiContract, 0, block.timestamp + 1 minutes);

        ethDeposited[destination] -= ethAmount;

        IERC20(daiContract).approve(sdaiContract, daiAmount);
        ISDAI(sdaiContract).deposit(daiAmount, destination);
    }

    function swapEthForToken(uint256 ethAmount, address tokenAddress, uint tokenAmountOutMin, uint deadline) public payable returns (uint256){
        address[] memory path = new address[](2);
        path[0] = uniswapRouter.WETH();
        path[1] = tokenAddress;

        uint[] memory swappedAmounts = uniswapRouter.swapExactETHForTokens{value: ethAmount}(
            tokenAmountOutMin,
            path,
            address(this),
            deadline
        );

        return swappedAmounts[0];
    }

    // Chainlink
    // **Automation**
    function checkUpkeep(
        bytes calldata checkData
    )
        external
        view
        override
        returns (bool upkeepNeeded, bytes memory performData )
    {
        // TODO: grab the proposalId from checkData as well, so we can check for the isExecuted bool for this specific proposalId. Swap that  with `isExecuted` on next line
        bytes32 actionForgeid = abi.decode(checkData, (bytes32));
        Proposal memory proposal = proposals[actionForgeid];
        upkeepNeeded = (block.timestamp >= proposal.endTime) && (proposal.executed == false);
        performData = checkData;
    }

    function performUpkeep(bytes calldata performData) external override {
        // TODO: same as above
        bytes32 actionForgeid = abi.decode(performData, (bytes32));
        Proposal storage proposal = proposals[actionForgeid];
        if ((block.timestamp >= proposal.endTime) && (proposal.executed == false)) {
            proposal.executed = true;
            // TODO: grab proposal snapshot id from the struct we fetched earlier
            sendRequestF(proposal.snapshotId);
        }
    }

    // **Functions**

    function sendRequestF(
        bytes32 snapshotId
    ) internal {
        FunctionsRequest.Request memory req;
        req.initializeRequest(FunctionsRequest.Location.Inline, FunctionsRequest.CodeLanguage.JavaScript, source);
        string[] memory args = new string[](1);
        args[0] = bytes32ToString(snapshotId); // bytes32 to string
        req.setArgs(args);

        bytes32 s_lastRequestId = _sendRequest(req.encodeCBOR(), subscriptionId, gasLimit, donID);
        requestMap[s_lastRequestId] = snapshotId;
    }

    /**
     * @notice Store latest result/error
     * @param requestId The request ID, returned by sendRequest()
     * @param response Aggregated response from the user code
     * @param err Aggregated error from the user code or from the execution pipeline
     * Either response or error parameter will be set, but never both
     */
    function fulfillRequest(
        bytes32 requestId,
        bytes memory response,
        bytes memory err
    ) internal override {
        bytes32 actionforgeId = requestMap[requestId];
        Proposal storage proposal = proposals[actionforgeId];
        (uint256 winnerOption) = abi.decode(response, (uint256));

        Action memory action = proposal.actions[winnerOption];

        if (action.actionType == ActionType.ERC20_TRANSFER) {
            this.transferERC20(action.txData);
        } else if (action.actionType == ActionType.BORROW_GHO) {
            this.borrowGHO(action.txData);
        } else if (action.actionType == ActionType.BUY_SDAI) {
            this.buySDAI(action.txData);
        } else if (action.actionType == ActionType.NO_ACTION) {
            // do nothing
        }

        proposal.executed = true;
        proposal.winnerOption = winnerOption;
        emit Response(requestId, response, err);

        emit ActionExecuted(proposal.snapshotId, winnerOption, action.actionType);
    }

    // helpers
    function convertBytesToUint(bytes calldata checkData) external pure returns(uint timestamp){
        timestamp = abi.decode(checkData, (uint));
    }

    function convertUintToBytes(uint timestamp) external pure returns(bytes memory checkData){
        checkData = abi.encodePacked(uint(timestamp));
    }

    function bytes32ToBytes(bytes32 data) public pure returns (bytes memory) {
        bytes memory byteArray = new bytes(32);
        for (uint i = 0; i < 32; i++) {
            byteArray[i] = data[i];
        }
        return byteArray;
    }

    function bytes32ToString(bytes32 _bytes32) public pure returns (string memory) {
        uint8 i = 0;
        while(i < 32 && _bytes32[i] != 0) {
            i++;
        }
        bytes memory bytesArray = new bytes(i);
        for (i = 0; i < 32 && _bytes32[i] != 0; i++) {
            bytesArray[i] = _bytes32[i];
        }
        return string(bytesArray);
    }
}

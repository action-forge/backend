// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@aave/core-v3/contracts/interfaces/IAaveOracle.sol";
import "@aave/core-v3/contracts/interfaces/IPool.sol";

import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";

import "./interfaces/IWrappedTokenGatewayV3.sol";
import "./interfaces/ISDAI.sol";

contract ActionForge is Ownable {
    enum ActionType {
        ERC20_TRANSFER,
        BORROW_GHO, // aave
        BUY_SDAI // spark
    }

    mapping(address => Proposal[]) public proposalMap; // mapping of user to their proposals
    mapping(bytes32 => Proposal) public proposals; // mapping of proposalId to proposal

    // aave
    mapping(address => uint256) public ethDeposited; // mapping of user to their eth deposits

    // mapping(bytes32 => uint8) public snapshotStatus; // mapping of proposalId to snapshot status  // @later

    struct Proposal{
        bytes32 snapshotId;
        uint256 nonce;  // nonce for this contract specifically to prevent replay txs
        uint endTime;  // frontend will populate this from snapshot APIs
        Action[] actions;
    }
    struct Action {
        ActionType actionType;
        // bytes32 snapshotId;
        address from;
        address to;
        uint256 amount;
        bytes txData;
        bytes signature;
    }

    uint256 public nonce; // nonce for txs made by this contract
    address public chainLinkAddress;  // wallet which can execute actions on behalf of this contract

    mapping(bytes32 => Action) actionMap; // actionId to Action mapping
    mapping(address => uint256) public nonces;
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

    event ActionExecuted(bytes32 indexed proposalId, uint8 option);
    // event ActionRegistered(bytes32 indexed actionId, address indexed registeredBy, bytes32 snapshotID);
    event ProposalEnded(bytes32 indexed proposalId, uint8 status, uint256 endTime);
    event ProposalRegistered(bytes32 indexed proposalId, address createdBy, Proposal proposal);

    event ETHReceived(address user, uint256 amount);
    // receive() external payable {}

    constructor() Ownable(msg.sender) {

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

    function registerProposal(Proposal calldata proposal) external {
        // @todo: check action specific validations - check that token is approved before accepting
        // @todo: validate action struct fields

        require(nonces[msg.sender] == proposal.nonce, "Incorrect nonce");

        for (uint i = 0; i < proposal.actions.length; i++) {
            Action memory action = proposal.actions[i];
            // require(recoverSigner(action, action.signature) == msg.sender, "Invalid signature"); // ensures that the signature is valid and from the sender

            require(IERC20(action.to).allowance(action.from, action.to) > action.amount, "Transfer failed"); // @todo: how to decode erc20 amount?

            nonces[action.from]++;

            bytes32 actionId = keccak256(abi.encodePacked(
                block.timestamp,
                msg.sender,
                action.actionType,
                // action.snapshotId,
                action.from,
                action.to,
                action.amount
                // action.nonce
            ));

            actionMap[actionId] = action;
            // emit ActionRegistered(actionId, msg.sender, action.snapshotId);
        }

        emit ProposalRegistered(proposal.snapshotId, msg.sender, proposal);
        // register an upkeep
    }

    function executeAction(bytes32 proposalId, uint8 option) external payable returns (bytes memory result) {
        require(proposals[proposalId].actions.length > option, "Invalid option");
        Action memory action = proposals[proposalId].actions[option];
        // require(bytes(proposals[proposalId].snapshotId).length != 0, "Invalid actionId");

        // Action memory action = actionMap[actionId];
        require(msg.sender == chainLinkAddress || msg.sender == action.from, "access denied");
        bytes memory signature = action.signature;
        require(signature.length != 0, "No registered transaction");

        ++nonce;

        bool success;
        (success, result) = action.to.call{value: action.amount}(action.txData);

        if (!success) {
            assembly {
                revert(add(result, 32), mload(result))
            }
        }
        emit ActionExecuted(proposalId, option);


        // if (actiontype == ERC20_TRANSFER) {
        // abi.decode(dataBytes, ['address', 'uint256'])

        // }
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

    // function prepareExecution(){}

    function recoverSigner(bytes32 message, bytes memory signature)
        public
        pure
        returns (address)
    {
        // Ensure that the message is in the correct format
        bytes32 ethSignedMessageHash = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", message)
        );

        // Recover the signer's address
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(signature);
        return ecrecover(ethSignedMessageHash, v, r, s);
    }

    // Helper function to split a signature into its components
    function splitSignature(bytes memory sig)
        internal
        pure
        returns (bytes32 r, bytes32 s, uint8 v)
    {
        require(sig.length == 65, "Invalid signature length");

        assembly {
            // first 32 bytes, after the length prefix
            r := mload(add(sig, 32))
            // second 32 bytes
            s := mload(add(sig, 64))
            // final byte (first byte of the next 32 bytes)
            v := byte(0, mload(add(sig, 96)))
        }

        // Adjust for Ethereum's v value
        if (v < 27) {
            v += 27;
        }
    }
}

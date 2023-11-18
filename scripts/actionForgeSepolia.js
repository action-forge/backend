// const ethers = require('ethers')
const  { ethers: ethers } = require("hardhat");
const fs = require('fs');

const blankBytes32 = '0x' + '0'.repeat(64);

// const _1e18 = BigNumber.from(10).pow(18)
// const CHAIN_ID = hardhat.network.config.chainId

let tx

async function main() {
    const [admin, user1, user2, user3] = await ethers.getSigners()

    // const actionForgeContract = await ethers.getContractFactory("ActionForge")
    // const source =  fs.readFileSync('./chainlink_function.js', 'utf8')
    // const router = "0xb83E47C2bC239B3bf370bc41e1459A34b41238D0"
    // const subscriptionId = 1606
    // const gasLimit = 300000
    // const donID = "0x66756e2d657468657265756d2d7365706f6c69612d3100000000000000000000"

    // const actionForge = await actionForgeContract.deploy(router, subscriptionId, source, gasLimit, donID)
    // await actionForge.waitForDeployment()
    // actionForgeAddress = await actionForge.getAddress()
    // console.log("actionForge address = ", actionForgeAddress)

    // const i_link = "0x779877A7B0D9E8603169DdbD7836e478b4624789"
    // const i_registrar = "0xb0E49c5D0d05cbc241d68c05BC5BA1d1B7B72976"
    // const schedulerContract = await ethers.getContractFactory("Scheduler")
    // const scheduler = await schedulerContract.deploy(i_link, i_registrar)
    // schedulerAddress = await scheduler.getAddress()
    // console.log("scheduler address = ", schedulerAddress)

    const actionForge = await ethers.getContractAt("ActionForge", "0x11F69681A309F3753321097De2968211cdc7aF85")
    actionForgeAddress = await actionForge.getAddress()

    const scheduler = await ethers.getContractAt("Scheduler", "0xd62dbE3cFAD9ACEA783E2dC671bAe9ffA157Fa3E")
    schedulerAddress = await scheduler.getAddress()

    await actionForge.setScheduler(schedulerAddress)

    const ethAmount = BigInt(100000000000000)
    const actions = [
        {
            actionType: 0,
            txData: ethers.getBytes(ethers.AbiCoder.defaultAbiCoder().encode(["address", "address", "uint256"], [user1.address, "0x779877a7b0d9e8603169ddbd7836e478b4624789", ethAmount]))
        },
        // {
        //     actionType: 3,
        //     txData: blankBytes32
        // },
        // {
        //     actionType: 3,
        //     txData: blankBytes32
        // },
    ]

    const proposal = {
        snapshotId: "0xcbe45e9c737c5d0cce6a60489473fa1f74d78fb7ea960b7462de99a1f420d6ef",
        actionForgeId: blankBytes32,
        endTime: 1700334945,
        actions: actions,
        executed: false,
        winnerOption: 0
    }

    tx = await actionForge.registerProposal(proposal)
    console.log("tx = ", tx.hash)

    // tx = await user1.sendTransaction({to: actionForgeAddress, value: ethAmount})
    // console.log("tx = ", tx.hash)
    // tx = await actionForge.setSparkParams("0xD8134205b0328F5676aaeFb3B2a0DC15f4029d8C", "0x11fE4B6AE13d2a6055C8D9cF65c55bac32B5d844")
    // console.log("tx = ", tx.hash)
    // tx = await actionForge.setUniswapParams("0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D")
    // console.log("tx = ", tx.hash)

    // nowInEpoch = Math.round(new Date().getTime() / 1000)
    // deposited = await actionForge.ethDeposited(user1.address)
    // console.log("deposited = ", deposited.toString())
    // tx = await actionForge.connect(user1).buySDAI(user1.address, ethAmount, {gasLimit: 5e5})
    // // tx = await actionForge.connect(user1).swapEthForToken(ethAmount, "0x11fE4B6AE13d2a6055C8D9cF65c55bac32B5d844", 0, nowInEpoch + 100)
    // console.log("tx = ", tx.hash)



    // tx = await user1.sendTransaction({to: actionForgeAddress, value: ethAmount})
    // console.log("tx = ", tx.hash)
    // // address _aaveWrappedTokenGatewayV3, address _aavePoolProxy, address _ghoToken, address _aaveOracle, address _aaveEthAsset
    // tx = await actionForge.setAaveParams("0x9c402E3b0D123323F0FCed781b8184Ec7E02Dd31", "0x617Cf26407193E32a771264fB5e9b8f09715CdfB", "0xcbE9771eD31e761b744D3cB9eF78A1f32DD99211", "0xcb601629B36891c43943e3CDa2eB18FAc38B5c4e", "0x84ced17d95F3EC7230bAf4a369F1e624Ae60090d")
    // console.log("tx = ", tx.hash)
    // tx = await actionForge.connect(user1).borrowGHO(user1.address, ethAmount)
    // console.log("tx = ", tx.hash)

    // const message = ethers.id("some other message");
    // const messageBytes = ethers.getBytes(message);

    // // Sign the message
    // const signature = await admin.signMessage(messageBytes);

    // // Call the recoverSigner function from your contract
    // const recoveredAddress = await actionForge.recoverSigner(message, signature);

    // console.log(`Original Address: ${admin.address}`);
    // console.log(`Recovered Address: ${recoveredAddress}`);

    // data = ethers.AbiCoder.defaultAbiCoder().encode(["address", "uint256"], ["0x7E04c9d2a324d94292CF3C96ebf597a57c528d6d", 1234])
    // dataBytes = ethers.getBytes(data)
    // resp = await actionForge.decodeData(dataBytes)
    // console.log("resp = ", resp)
}

main()
.then(() => process.exit(0))



// actionForge address =  0x11F69681A309F3753321097De2968211cdc7aF85
// scheduler address =  0xd62dbE3cFAD9ACEA783E2dC671bAe9ffA157Fa3E
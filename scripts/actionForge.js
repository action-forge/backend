// const ethers = require('ethers')
const  { ethers: ethers } = require("hardhat");

// const _1e18 = BigNumber.from(10).pow(18)
// const CHAIN_ID = hardhat.network.config.chainId

let tx

async function main() {
    const [admin, user1, user2, user3] = await ethers.getSigners()
    const actionForgeContract = await ethers.getContractFactory("ActionForge")

    // const actionForge = await actionForgeContract.deploy()
    // await actionForge.waitForDeployment()
    // actionForgeAddress = await actionForge.getAddress()
    // // console.log("actionForge address = ", actionForgeAddress)
    // console.log({actionForgeAddress})

    const ethAmount = BigInt(100000000000000)
    // actionForge
    const actionForge = await ethers.getContractAt("ActionForge", "0xcb78b522fe8dE756e2bE39A448c589a372FBE7B7")
    actionForgeAddress = await actionForge.getAddress()

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

    data = ethers.AbiCoder.defaultAbiCoder().encode(["address", "uint256"], ["0x7E04c9d2a324d94292CF3C96ebf597a57c528d6d", 1234])
    dataBytes = ethers.getBytes(data)
    resp = await actionForge.decodeData(dataBytes)
    console.log("resp = ", resp)
}

main()
.then(() => process.exit(0))



// contract = 0x90AE8d4Bb610DD96D2DF212f701940A58D1F1738
// 
const hre = require("hardhat");
// const ethers = require("ethers");

const { BigNumber } = require('ethers')

// const _1e18 = BigNumber.from(10).pow(18)




async function main() {
    // WrappedTokenGatewayV3 -> depositETH(Pool-Proxy, user-address, 0)
    // Pool-Proxy -> borrow(GhoToken, 1000000000000000000, 2, 0, user-address)
    
    const [admin, user1] = await hre.ethers.getSigners()

    
    
    // conf = await poolProxy.getConfiguration("0xcbE9771eD31e761b744D3cB9eF78A1f32DD99211")
    // const BORROW_CAP_MASK = BigInt("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF000000000FFFFFFFFFFFFFFFFFFFF");
    // const BORROW_CAP_START_BIT_POSITION = BigInt(80);

    // console.log("conf", conf)
    // console.log("conf", conf[0])
    // const bitshit = BigInt(conf[0])
    // const cap = (bitshit & ~BORROW_CAP_MASK) >> BORROW_CAP_START_BIT_POSITION;
    // console.log("cap ", cap)
    // wrappedTokenGatewayV3

    const actionForge = await hre.ethers.getContractAt("ActionForge", "0x11F69681A309F3753321097De2968211cdc7aF85")
    actionForgeAddress = await actionForge.getAddress()
    res = await actionForge.proposals("0x7891057955b14440ae383cd9cb17acbefe1a1512fde96165d1157b8a34bc0b8c")
    console.log("res", res)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

// const ethers = require('ethers')
const  { ethers: ethers } = require("hardhat");
const fs = require('fs');

const blankBytes32 = '0x' + '0'.repeat(64);

// const _1e18 = BigNumber.from(10).pow(18)
// const CHAIN_ID = hardhat.network.config.chainId

let tx


async function main() {
    const actionForge = await ethers.getContractAt("ActionForge", "0x11F69681A309F3753321097De2968211cdc7aF85")
    actionForgeAddress = await actionForge.getAddress()

    const events = await actionForge.queryFilter(actionForge.filters.ActionForgeRegistered())
    console.log(events[0].args)
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
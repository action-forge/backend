require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */

const pk = process.env.PRIVATE_KEY || ''

module.exports = {
  solidity: "0.8.20",
  networks: {
    local: {
      url: 'http://127.0.0.1:8545',
      chainId: 321123,
    },
    goerli: {
      url: "https://goerli.infura.io/v3/06800f8293644a29b29acbc1148042f1",
      accounts: [
        pk, // admin
        "27d9c0120019a8cccd9b0af6b186dd21401e8c5c906422f78de325840ae1a255", // user 1 0xA0066f1949636FB62f6cEC693Eec4A5C3531d791
        "24b3c0322118e9682484c516bf1ce14587292a6658b60fa8cf575983cc9e976b", // user 2 0x75BE87691E2F11de7d29C33926e35eb2b4CEcb5C
        "eb7132468c409a143a984b326370afa43fc5efe9488aaebd8ae898d94fad1243", // user 3 0x0a22Ca95Bc9f40b6DE9d9bCF980C60F1957f0c3A
      ],
      chainId: 5,
      // gasPrice: 20000000000,
    },
    sepolia: {
      url: "https://sepolia.infura.io/v3/06800f8293644a29b29acbc1148042f1",
      accounts: [
        pk, // admin
        "27d9c0120019a8cccd9b0af6b186dd21401e8c5c906422f78de325840ae1a255", // user 1 0xA0066f1949636FB62f6cEC693Eec4A5C3531d791
        "24b3c0322118e9682484c516bf1ce14587292a6658b60fa8cf575983cc9e976b", // user 2 0x75BE87691E2F11de7d29C33926e35eb2b4CEcb5C
        "eb7132468c409a143a984b326370afa43fc5efe9488aaebd8ae898d94fad1243", // user 3 0x0a22Ca95Bc9f40b6DE9d9bCF980C60F1957f0c3A
      ],
      chainId: 11155111,
    },
    mumbai: {
      url: "https://polygon-mumbai.infura.io/v3/06800f8293644a29b29acbc1148042f1",
      accounts: [
        pk, // admin
        "27d9c0120019a8cccd9b0af6b186dd21401e8c5c906422f78de325840ae1a255", // user 1 0xA0066f1949636FB62f6cEC693Eec4A5C3531d791
        "24b3c0322118e9682484c516bf1ce14587292a6658b60fa8cf575983cc9e976b", // user 2 0x75BE87691E2F11de7d29C33926e35eb2b4CEcb5C
        "eb7132468c409a143a984b326370afa43fc5efe9488aaebd8ae898d94fad1243", // user 3 0x0a22Ca95Bc9f40b6DE9d9bCF980C60F1957f0c3A
      ],
      chainId: 80001,
    },
    scroll: {
      url: "https://sepolia-rpc.scroll.io",
      accounts: [
        pk, // admin
        "27d9c0120019a8cccd9b0af6b186dd21401e8c5c906422f78de325840ae1a255", // user 1 0xA0066f1949636FB62f6cEC693Eec4A5C3531d791
        "24b3c0322118e9682484c516bf1ce14587292a6658b60fa8cf575983cc9e976b", // user 2 0x75BE87691E2F11de7d29C33926e35eb2b4CEcb5C
        "eb7132468c409a143a984b326370afa43fc5efe9488aaebd8ae898d94fad1243", // user 3 0x0a22Ca95Bc9f40b6DE9d9bCF980C60F1957f0c3A
      ],
      chainId: 534351,
    },
    mantle: {
      url: "https://rpc.testnet.mantle.xyz",
      accounts: [
        pk, // admin
        "27d9c0120019a8cccd9b0af6b186dd21401e8c5c906422f78de325840ae1a255", // nft #1 holder 0xA0066f1949636FB62f6cEC693Eec4A5C3531d791
        "24b3c0322118e9682484c516bf1ce14587292a6658b60fa8cf575983cc9e976b", // apecoin 0x75BE87691E2F11de7d29C33926e35eb2b4CEcb5C
        "eb7132468c409a143a984b326370afa43fc5efe9488aaebd8ae898d94fad1243", // tacobell 0x0a22Ca95Bc9f40b6DE9d9bCF980C60F1957f0c3A
      ],
      chainId: 5001,
    },
  },
};

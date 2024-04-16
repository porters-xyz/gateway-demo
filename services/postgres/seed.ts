import { PrismaClient } from "../../web-portal/backend/.generated/client";

const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.ruleType.createMany({
      data: [
        {
          id: "secret-key",
          name: "secret-key",
          description:
            "Allows you to add extra layer of security to avoid misusage by others",
          validationType: "function",
          isEditable: false,
          validationValue: "X",
          isMultiple: false,
        },
        {
          id: "allowed-origins",
          name: "allowed-origins",
          description: "Allows you to limit app urls that can make requests",
          isEditable: true,
          validationType: "regex",
          validationValue:
            "https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()!@:%_\\+.~#?&\\/\\/=]*)",
          isMultiple: true,
        },
        {
          id: "approved-chains",
          name: "approved-chains",
          description:
            "Allows you to limit chains that can be access via this App",
          isEditable: true,
          validationType: "regex",
          validationValue: ".*-.*",
          isMultiple: true,
        },
        {
          id: "allowed-user-agents",
          name: "allowed-user-agents",
          description:
            "Allows you to limit type of clients that can use this app",
          isEditable: true,
          validationType: "regex",
          validationValue:
            "(?=.{21,})(Mozilla\\/\\d+\\.\\d+|Chrome\\/\\d+\\.\\d+|Safari\\/\\d+\\.\\d+|Opera\\/\\d+\\.\\d+|Firefox\\/\\d+\\.\\d+)",
          isMultiple: true,
        },
      ],
    });

    await prisma.products.createMany({
      data: [
        { id: "66", name: "arbitrum-one", weight: 1, params: "" },
        { id: "3", name: "avax-mainnet", weight: 1, params: "" },
        { id: "00A3", name: "avax-archival", weight: 1, params: "" },
        { id: "48", name: "boba-mainnet", weight: 1, params: "" },
        { id: "4", name: "bsc-mainnet", weight: 1, params: "" },
        { id: "10", name: "bsc-archival", weight: 1, params: "" },
        { id: "65", name: "celo-mainnet", weight: 1, params: "" },
        { id: "03DF", name: "avax-dfk", weight: 1, params: "" },
        { id: "59", name: "dogechain-mainnet", weight: 1, params: "" },
        { id: "21", name: "eth-mainnet", weight: 1, params: "" },
        { id: "22", name: "eth-archival", weight: 1, params: "" },
        { id: "28", name: "eth-trace", weight: 1, params: "" },
        { id: "62", name: "ethereum-mainnet-high-gas", weight: 1, params: "" },
        { id: "46", name: "evmos-mainnet", weight: 1, params: "" },
        { id: "49", name: "fantom-mainnet", weight: 1, params: "" },
        { id: "5", name: "fuse-mainnet", weight: 1, params: "" },
        { id: "000A", name: "fuse-archival", weight: 1, params: "" },
        { id: "27", name: "gnosischain-mainnet", weight: 1, params: "" },
        { id: "000C", name: "gnosischain-archival", weight: 1, params: "" },
        { id: "26", name: "eth-goerli", weight: 1, params: "" },
        { id: "63", name: "goerli-archival", weight: 1, params: "" },
        { id: "40", name: "harmony-0", weight: 1, params: "" },
        { id: "44", name: "iotex-mainnet", weight: 1, params: "" },
        { id: "71", name: "kava-mainnet", weight: 1, params: "" },
        { id: "72", name: "kava-mainnet-archival", weight: 1, params: "" },
        { id: "56", name: "klaytn-mainnet", weight: 1, params: "" },
        { id: "24", name: "poa-kovan", weight: 1, params: "" },
        { id: "57", name: "meter-mainnet", weight: 1, params: "" },
        { id: "58", name: "metis-mainnet", weight: 1, params: "" },
        { id: "50", name: "moonbeam-mainnet", weight: 1, params: "" },
        { id: "51", name: "moonriver-mainnet", weight: 1, params: "" },
        { id: "52", name: "near-mainnet", weight: 1, params: "" },
        { id: "47", name: "oKc-mainnet", weight: 1, params: "" },
        { id: "70", name: "oasys-mainnet", weight: 1, params: "" },
        { id: "69", name: "oasys-mainnet-archival", weight: 1, params: "" },
        { id: "53", name: "optimism-mainnet", weight: 1, params: "" },
        { id: "54", name: "osmosis-mainnet", weight: 1, params: "" },
        { id: "1", name: "mainnet", weight: 1, params: "" },
        { id: "9", name: "poly-mainnet", weight: 1, params: "" },
        { id: "000B", name: "poly-archival", weight: 1, params: "" },
        { id: "000F", name: "polygon-mumbai", weight: 1, params: "" },
        { id: "74", name: "polygon-zkevm-mainnet", weight: 1, params: "" },
        { id: "23", name: "eth-ropsten", weight: 1, params: "" },
        { id: "75", name: "scroll-testnet", weight: 1, params: "" },
        { id: "6", name: "solana-mainnet", weight: 1, params: "" },
        { id: "60", name: "starknet-mainnet", weight: 1, params: "" },
        { id: "61", name: "starknet-testnet", weight: 1, params: "" },
        { id: "76", name: "sui-mainnet", weight: 1, params: "" },
        { id: "03CB", name: "avax-cra", weight: 1, params: "" },
        { id: "67", name: "velas-mainnet", weight: 1, params: "" },
        { id: "68", name: "velas-mainnet-archival", weight: 1, params: "" },
      ],
    });
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

import { Address } from "viem";
import { IToken } from "./types";

export const portrAddress = "0x54d5f8a0e0f06991e63e46420bcee1af7d9fe944";

export const apiUrl = process.env.NEXT_PUBLIC_API_ENDPOINT!;
export const APP_NAME = "Porters Frontend";
export const metadata = {
  title: "Gateway Demo Portal",
  description: "Welcome",
};

export const portrTokenData: IToken = {
  chainId: 10,
  address: portrAddress,
  name: "PORTER Gateway",
  symbol: "PORTR",
  decimals: 18,
  logoURI: "/favicon.ico",
};

export const supportedChains = [
  {
    id: "10",
    name: "optimism",
    exchangeProxy: `0xdef1abe32c034e558cdd535791643c58a13acc10` as Address,
    portrAddress: "0x54d5f8a0e0f06991e63e46420bcee1af7d9fe944" as Address,
  },
  {
    id: "8543",
    name: "base",
    exchangeProxy: `0xdef1c0ded9bec7f1a1670819833240f027b25eff` as Address,
    portrAddress: "to-be-deployed",
  },
];

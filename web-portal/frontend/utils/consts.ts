import { IToken } from "./types";

export const portrOPAddress = "0x54d5f8a0e0f06991e63e46420bcee1af7d9fe944";
export const portrBaseAddress = "0x54d5f8a0e0f06991e63e46420bcee1af7d9fe944";
export const apiUrl = process.env.NEXT_PUBLIC_API_ENDPOINT!;
export const APP_NAME = "Porters Frontend";
export const metadata = {
  title: "Gateway Demo Portal",
  description: "Welcome",
};

export const portrTokenData: IToken = {
  chainId: 10,
  address: portrOPAddress,
  name: "PORTER Gateway",
  symbol: "PORTR",
  decimals: 6,
  logoURI: "/favicon.ico",
};

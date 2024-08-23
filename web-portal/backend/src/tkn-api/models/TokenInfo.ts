import { AddressInfo } from "./AddressInfo";

export interface TokenInfo {
  contractAddress: string;
  name: string;
  url: string;
  avatar: string;
  description: string;
  notice: string;
  version: string;
  decimals: string;
  twitter: string;
  github: string;
  dweb: string; // Assuming this is a string representation of the bytes
  addresses: AddressInfo;
}

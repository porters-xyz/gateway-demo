import { SiweMessage } from "siwe";
import Cookies from "js-cookie";
import { createSIWEConfig } from "@web3modal/siwe";
import { queryClient, config } from "./Web3Provider";
import { disconnect } from "@wagmi/core";

export const getNonce = async () => {
  const res = await fetch("/api/siwe", { method: "PUT" });
  if (!res.ok) throw new Error("Failed to fetch SIWE nonce");

  return res.text();
};

export const createMessage = ({
  nonce,
  address,
  chainId,
}: {
  nonce: string;
  address: string;
  chainId: number;
}) => {
  return new SiweMessage({
    nonce,
    chainId,
    address,
    version: "1",
    uri: window.location.origin,
    domain: window.location.host,
    statement: "Sign In With Ethereum to prove you control this wallet.",
  }).prepareMessage();
};

export const verifyMessage = async ({
  message,
  signature,
}: {
  message: string;
  signature: string;
}) => {
  return fetch("/api/siwe", {
    method: "POST",
    body: JSON.stringify({ message, signature }),
    headers: { "Content-Type": "application/json" },
  }).then((res) => res.ok);
};

export const getSession = async () => {
  const res = await fetch("/api/siwe");
  if (!res.ok) console.log("Failed to fetch SIWE session");
  const userSession = await res.json();
  if (userSession?.address && window.location.pathname === "/login") {
    setTimeout(() => (window.location.href = "/dashboard"), 250);
  }
  return userSession;
};

export const signOut = async () => {
  const result = await disconnect(config);
  Cookies.set("session", "");
  queryClient.setQueryData(["session"], null);
  console.log({ session: Cookies.get("session"), result });

  setTimeout(() => (window.location.href = "/login"), 1500);

  return Boolean(result)
};

// @ts-ignore
export const siweConfig = createSIWEConfig({
  createMessage,
  getNonce,
  getSession,
  verifyMessage,
  signOut,
  signOutOnNetworkChange: false,
  signOutOnDisconnect: true,
});

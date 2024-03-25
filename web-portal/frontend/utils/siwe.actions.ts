"use client";
import { SiweMessage } from "siwe";
import Cookies from "js-cookie";
import { createSIWEConfig } from "@web3modal/siwe";
import type {
  SIWECreateMessageArgs,
  SIWEVerifyMessageArgs,
} from "@web3modal/siwe";

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

  return userSession;
};

export const signOut = async () => {
  Cookies.remove("session");
  const res = await fetch("/api/siwe", {
    method: "DELETE",
  });

  if (res.ok) return true;
  return false;
};

export const siweConfig = createSIWEConfig({
  createMessage,
  getNonce,
  getSession,
  verifyMessage,
  signOut,
});

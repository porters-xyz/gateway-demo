import { SiweMessage } from "siwe";

export const getNonce = async () => {
  const res = await fetch("/siwe", { method: "PUT" });
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
  return fetch("/siwe", {
    method: "POST",
    body: JSON.stringify({ message, signature }),
    headers: { "Content-Type": "application/json" },
  }).then((res) => res.ok);
};
export const getSession = async () => {
  const res = await fetch("/siwe");
  if (!res.ok) throw new Error("Failed to fetch SIWE session");

  const { address, chainId } = await res.json();
  return address && chainId ? { address, chainId } : null;
};

import { Address } from "viem";
import { IToken } from "./types";
import abt from "@frontend/public/chains/abt.png";
import avax from "@frontend/public/chains/avax.png";
import boba from "@frontend/public/chains/boba.png";
import celo from "@frontend/public/chains/celo.png";
import dog from "@frontend/public/chains/dog.png";
import eth from "@frontend/public/chains/eth.png";
import evmos from "@frontend/public/chains/evmos.png";
import frax from "@frontend/public/chains/frax.png";
import ftm from "@frontend/public/chains/ftm.png";
import fuse from "@frontend/public/chains/fuse.png";
import glmr from "@frontend/public/chains/glmr.png";
import gno from "@frontend/public/chains/gno.png";
import kava from "@frontend/public/chains/kava.png";
import klay from "@frontend/public/chains/klay.png";
import matic from "@frontend/public/chains/matic.png";
import metis from "@frontend/public/chains/metis.png";
import movr from "@frontend/public/chains/movr.png";
import mtrg from "@frontend/public/chains/mtrg.png";
import near from "@frontend/public/chains/near.png";
import oas from "@frontend/public/chains/oas.png";
import one from "@frontend/public/chains/one.png";
import op from "@frontend/public/chains/op.png";
import osmo from "@frontend/public/chains/osmo.png";
import pokt from "@frontend/public/chains/pokt.png";
import sol from "@frontend/public/chains/sol.png";
import sui from "@frontend/public/chains/sui.png";
import tia from "@frontend/public/chains/tia.png";
import vlx from "@frontend/public/chains/vlx.png";
import xrd from "@frontend/public/chains/xrd.png";

export const portrAddress = "0x54d5f8a0e0f06991e63e46420bcee1af7d9fe944";

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

export const chainLogos = [
    abt,
    avax,
    boba,
    celo,
    dog,
    eth,
    evmos,
    frax,
    ftm,
    fuse,
    glmr,
    gno,
    kava,
    klay,
    matic,
    metis,
    movr,
    mtrg,
    near,
    oas,
    one,
    op,
    osmo,
    pokt,
    sol,
    sui,
    tia,
    vlx,
    xrd,
];


export const timeOptions = [
    {
        option: "1h",
        format: "HH:mm",
    },
    {
        option: "24h",
        format: "HH:mm",
    },
    {
        option: "7d",
        format: "MM/dd",
    },
    {
        option: "30d",
        format: "MM/dd",
    },
];
import React from "react";
import { Address } from "viem";

export interface INotification {
  title: string;
  content: string;
  icon?: React.ReactNode;
}

export interface IApp {
    id: string;
    name: string;
    description: string;
    appId: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
}

export interface IOrg {
    id: string;
    active: boolean;
    deletedAt?: string;
    createdAt: string;
    updatedAt: string;
    enterpriseId: string;
}

export interface ISession {
    chainId?: number;
    address?: Address;
    id?: string;
    active?: boolean;
    createdAt?: string;
    deletedAt?: string;
    orgs?: IOrg[] | null;
    tenantId: string;
    netBalance?: any;
}

export interface IEndpoint {
    id: string;
    name: string;
    weight?: number;
    params?: string;
    active?: boolean;
    deletedAt?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface IRuleType {
    id?: string;
    name?: string;
    description?: string;
    isEditable?: boolean;
    isMultiple?: boolean;
    validationType?: string;
    validationValue?: string;
}

export interface IAppRule {
    id?: string;
    appId?: string;
    ruleId?: string;
    value?: string;
    active?: boolean;
    deletedAt?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface IRuleUpdate {
    ruleId: string;
    data: string[];
}

export interface IBill {
    id?: string;
    amount?: number;
    referenceId?: string;
    tenantId?: string;
    createdAt?: string;
    transactionType?: string;
    productId?: string;
}

export interface IToken {
    chainId: number;
    address: Address;
    name: string;
    symbol: string;
    decimals: number;
    logoURI: string;
    extensions?: any;
}

export interface IQuote {
    chainId: number;
    price: string;
    guaranteedPrice: string;
    estimatedPriceImpact: string;
    to: Address;
    from: string;
    data: Address;
    value: bigint;
    gas: bigint;
    estimatedGas: string;
    gasPrice: bigint;
    grossBuyAmount: string;
    protocolFee: string;
    minimumProtocolFee: string;
    buyTokenAddress: string;
    sellTokenAddress: string;
    buyAmount: string;
    sellAmount: string;
    sources: any[];
    orders: any[];
    allowanceTarget: string;
    decodedUniqueId: string;
    sellTokenToEthRate: string;
    buyTokenToEthRate: string;
    expectedSlippage: string | null;
}

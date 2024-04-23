import { Address } from "viem";

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
  tenantId?: string;
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
  chainId?: number;
  price?: string;
  grossPrice?: string;
  estimatedPriceImpact?: string;
  value?: string;
  gasPrice?: string;
  gas?: string;
  estimatedGas?: string;
  protocolFee?: string;
  minimumProtocolFee?: string;
  buyTokenAddress?: string;
  buyAmount?: string;
  grossBuyAmount?: string;
  sellTokenAddress?: string;
  sellAmount?: string;
  grossSellAmount?: string;
  sources?: {
    name?: string;
    proportion?: string;
  }[];
  allowanceTarget?: string;
  sellTokenToEthRate?: string;
  buyTokenToEthRate?: string;
  fees?: {
    zeroExFee?: string | null;
  };
  auxiliaryChainData?: {
    l1GasEstimate?: number;
  };
}

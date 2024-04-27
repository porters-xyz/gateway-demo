import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { CustomPrismaService } from 'nestjs-prisma';
import { PrismaClient } from '@/.generated/client';


export const portrAddress = "0x54d5f8a0e0f06991e63e46420bcee1af7d9fe944";

@Injectable()
export class UtilsService {
  constructor(
    @Inject('Postgres')
    private prisma: CustomPrismaService<PrismaClient>, // <-- Inject the PrismaClient
  ) { }

  async getChains() {
    const chains = this.prisma.client.products.findMany({
      where: {
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (!chains)
      throw new HttpException(
        'No Chains/Services Found',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    return chains;
  }

  async getRuleTypes() {
    const ruleTypes = await this.prisma.client.ruleType.findMany({
      where: {
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        description: true,
        validationType: true,
        validationValue: true,
        isMultiple: true,
      },
    });

    if (!ruleTypes)
      throw new HttpException(
        'Failed to find rules',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

    return ruleTypes;
  }
  async getTokenList(chainId: string) {
    const res = await fetch(`https://tokens.1inch.io/v1.2/${chainId}`);
    if (!res.ok) {
      throw new HttpException(
        `Could not fetch token list`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    const data = await res.json();
    return data;
  }

  async getTokenPrice(chainId: string, tokenAddress: string) {
    const res = await fetch(
      `https://api.1inch.dev/price/v1.1/${chainId}/${tokenAddress}?currency=usd`,
      {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${process.env.ONEINCH_API_KEY!}`,
        },
      },
    );
    if (!res.ok) {
      throw new HttpException(
        `Could not fetch token prices`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    const data = await res.json();
    return data;
  }

  async get0xQuote(chainName: string, sellToken: string, sellAmount: number) {
    const res = await fetch(
      `https://${chainName}.api.0x.org/swap/v1/quote?sellToken=${sellToken}&buyToken=${portrAddress}&sellAmount=${sellAmount}`,
      {
        headers: {
          Accept: "application/json",
          "0x-api-key": process.env.OX_API_KEY!,
        },
      },
    );
    if (!res.ok) {
      throw new HttpException(
        `Could not fetch quote`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    const data = await res.json();
    return data;
  };

  async get0xPrice(chainName: string, sellToken: string, sellAmount: number) {
    const res = await fetch(
      `https://${chainName}.api.0x.org/swap/v1/price?sellToken=${sellToken}&buyToken=${portrAddress}&sellAmount=${sellAmount}`,
      {
        headers: {
          Accept: "application/json",
          "0x-api-key": process.env.OX_API_KEY!,
        },
      },
    );
    if (!res.ok) {
      throw new HttpException(
        `Could not fetch quote`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    const data = await res.json();
    return data;
  };

}

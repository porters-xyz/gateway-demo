import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { CustomPrismaService } from 'nestjs-prisma';
import { PrismaClient } from '@/.generated/client';

@Injectable()
export class UtilsService {
  constructor(
    @Inject('Postgres')
    private prisma: CustomPrismaService<PrismaClient>, // <-- Inject the PrismaClient
  ) {}

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
          Authorization: `Bearer ${process.env.ONEINCH_API_KEY}`,
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
}

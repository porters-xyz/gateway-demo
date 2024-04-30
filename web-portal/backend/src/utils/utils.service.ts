import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { CustomPrismaService } from 'nestjs-prisma';
import { PrismaClient, TransactionType } from '@/.generated/client';
import { Cron, CronExpression } from '@nestjs/schedule';
import { parseAbiItem } from 'viem';
import { viemOPClient, viemSepoliaClient } from './viemClient';
import web3 from 'web3';

interface IParsedLog {
  tenantId: string;
  amount: number;
  referenceId: string;
  transactionType: TransactionType;
  chain?: string;
}

const portrAddress = '0x54d5f8a0e0f06991e63e46420bcee1af7d9fe944';
const portrSepoliaAddress = '0xe5c07323eb5f7a3ef205a262b0375136ab1e610c';

const event = parseAbiItem(
  'event Applied(bytes32 indexed _identifier, uint256 _amount)',
);

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
          Accept: 'application/json',
          '0x-api-key': process.env.OX_API_KEY!,
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
  }

  async get0xPrice(chainName: string, sellToken: string, sellAmount: number) {
    const res = await fetch(
      `https://${chainName}.api.0x.org/swap/v1/price?sellToken=${sellToken}&buyToken=${portrAddress}&sellAmount=${sellAmount}`,
      {
        headers: {
          Accept: 'application/json',
          '0x-api-key': process.env.OX_API_KEY!,
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
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async watchEvent() {
    console.log('Getting Event Logs');
    const blockNumberOP = await viemOPClient.getBlockNumber();
    const blockNumberSepolia = await viemSepoliaClient.getBlockNumber();

    const logsOptimism = await viemOPClient.getLogs({
      event,
      address: portrAddress,
      fromBlock: blockNumberOP - BigInt(1000),
      toBlock: blockNumberOP,
    });

    const logsSepolia = await viemSepoliaClient.getLogs({
      event,
      address: portrSepoliaAddress,
      fromBlock: blockNumberSepolia - BigInt(1000),
      toBlock: blockNumberSepolia,
    });

    const logsSepoliaX =
        logsSepolia.map((log:any) => ({
      ...log,
      chain: 'sep:',
    }));

    const logsOptimismX = logsOptimism.map((log:any) => ({
      ...log,
      chain: 'op:',
    }));

    const logs = [...logsSepoliaX, logsOptimismX];

    const parsedLogs: IParsedLog[] = logs.map((log: any) => ({
      tenantId: web3.utils
        .toAscii(log?.args?._identifier)
        .replaceAll(`\x00`, ''),
      amount: Number(log?.args?._amount),
      referenceId: log.chain + log.transactionHash!,
      transactionType: TransactionType.CREDIT!,
    }));

    console.log({ parsedLogs });

    if (!parsedLogs) console.log('No New Redemptions');

    // Create records for unique logs
    const appliedLogs = await this.prisma.client.paymentLedger.createMany({
      skipDuplicates: true,
      data: parsedLogs,
    });

    console.log({ appliedLogs });

    if (!appliedLogs) console.log('Error Applying logs');

    console.log('Applied New logs');
  }
}

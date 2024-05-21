import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { CustomPrismaService } from 'nestjs-prisma';
import { PrismaClient, TransactionType } from '@/.generated/client';
import { Cron, CronExpression } from '@nestjs/schedule';
import { parseAbiItem, fromHex, isAddress } from 'viem';
import { opClient, baseClient, gnosisClient } from './viemClient';

interface IParsedLog {
  tenantId: string;
  amount: number;
  referenceId: string;
  transactionType: TransactionType;
}

const portrAddress = '0x54d5f8a0e0f06991e63e46420bcee1af7d9fe944';
const event = parseAbiItem(
  'event Applied(bytes32 indexed _identifier, uint256 _amount)',
);

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
    if (Number(chainId) !== 8453 && Number(chainId) !== 10) {
      throw new HttpException(
        `Could not fetch token price`,
        HttpStatus.BAD_REQUEST,
      );
    }
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
    if (
      (Number(chainId) !== 8453 && Number(chainId) !== 10) ||
      !isAddress(tokenAddress)
    ) {
      throw new HttpException(
        `Could not fetch token price`,
        HttpStatus.BAD_REQUEST,
      );
    }
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
    if (
      (chainName !== 'base' && chainName !== 'optimism') ||
      !isAddress(sellToken)
    ) {
      throw new HttpException(`Could not fetch quote`, HttpStatus.BAD_REQUEST);
    }
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
    if (
      (chainName !== 'base' && chainName !== 'optimism') ||
      !isAddress(sellToken)
    ) {
      throw new HttpException(`Could not fetch price`, HttpStatus.BAD_REQUEST);
    }

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
    console.log('Getting Event Logs from all clients');

    // Define clients and their respective names
    const clients = [
      { client: opClient, name: 'optimism' },
      { client: gnosisClient, name: 'gnosis' },
      { client: baseClient, name: 'base' }
    ];

    // Fetch and parse logs for all clients
    const allParsedLogs = await Promise.all(
      clients.map(async ({ client, name }) => {
        console.log(`Getting Event Logs from ${name}`);
        const blockNumber = await client.getBlockNumber();
        const logs = await client.getLogs({
          event,
          address: portrAddress,
          fromBlock: blockNumber - BigInt(1000),
          toBlock: blockNumber,
        });

        return this.parseLogs(logs, name);
      })
    );

    const [parsedLogsOP, parsedLogsGnosis, parsedLogsBase] = allParsedLogs;

    console.log({ parsedLogsOP, parsedLogsGnosis, parsedLogsBase });

    if (!parsedLogsOP.length && !parsedLogsGnosis.length && !parsedLogsBase.length) {
      console.log('No New Redemptions');
      return;
    }

    // Create records for unique logs
    const appliedLogs = await this.prisma.client.paymentLedger.createMany({
      skipDuplicates: true,
      data: [...parsedLogsOP, ...parsedLogsGnosis, ...parsedLogsBase],
    });

    console.log({ appliedLogs });

    if (!appliedLogs) {
      console.log('Error Applying logs');
    } else {
      console.log('Applied New logs');
    }
  }

  // Helper function to parse logs
  parseLogs(logs: any[], network: string): IParsedLog[] {
    return logs.map((log: any) => ({
      tenantId: fromHex(log?.args?._identifier, 'string').replaceAll(`\x00`, ''),
      amount: Number(log?.args?._amount * 10 ** -12),
      // 10 ** -18 (to parse to human readable) * 10 ** 3 (for 1000 relay per token) * 10 ** 3 for chain weight = 10 ** -12
      referenceId: network + `:` + log.transactionHash!,
      transactionType: TransactionType.CREDIT!,
    }));
  }

}

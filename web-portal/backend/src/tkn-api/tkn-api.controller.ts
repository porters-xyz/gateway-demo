import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Query } from '@nestjs/common';
import { Public } from '../decorator/public.decorator';
import { getCoderByCoinName } from "@ensdomains/address-encoder";
import { ethers } from 'ethers';
import { Token } from '@uniswap/sdk-core';
import { Pool } from '@uniswap/v3-sdk';
import { PortersJsonRpcProvider } from '../providers/rpc/PortersJsonRpcProvider';
import { TokenInfo } from './models/TokenInfo';
const contentHash = require('content-hash')

const interface_abi = [{ "inputs": [], "stateMutability": "nonpayable", "type": "constructor" }, { "inputs": [{ "internalType": "string", "name": "_name", "type": "string" }], "name": "addressFor", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "string", "name": "_name", "type": "string" }], "name": "addressesFor", "outputs": [{ "components": [{ "internalType": "address payable", "name": "arb1_address", "type": "address" }, { "internalType": "address payable", "name": "avaxc_address", "type": "address" }, { "internalType": "address payable", "name": "base_address", "type": "address" }, { "internalType": "address payable", "name": "bsc_address", "type": "address" }, { "internalType": "address payable", "name": "cro_address", "type": "address" }, { "internalType": "address payable", "name": "ftm_address", "type": "address" }, { "internalType": "address payable", "name": "gno_address", "type": "address" }, { "internalType": "address payable", "name": "matic_address", "type": "address" }, { "internalType": "bytes", "name": "near_address", "type": "bytes" }, { "internalType": "address payable", "name": "op_address", "type": "address" }, { "internalType": "bytes", "name": "sol_address", "type": "bytes" }, { "internalType": "bytes", "name": "trx_address", "type": "bytes" }, { "internalType": "bytes", "name": "zil_address", "type": "bytes" }, { "internalType": "address payable", "name": "goerli_address", "type": "address" }, { "internalType": "address payable", "name": "sepolia_address", "type": "address" }], "internalType": "struct TNS.TokenAddresses", "name": "", "type": "tuple" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "user", "type": "address" }, { "internalType": "string", "name": "tickerSymbol", "type": "string" }], "name": "balanceWithTicker", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "string", "name": "_name", "type": "string" }], "name": "dataFor", "outputs": [{ "components": [{ "internalType": "address", "name": "contractAddress", "type": "address" }, { "internalType": "string", "name": "name", "type": "string" }, { "internalType": "string", "name": "url", "type": "string" }, { "internalType": "string", "name": "avatar", "type": "string" }, { "internalType": "string", "name": "description", "type": "string" }, { "internalType": "string", "name": "notice", "type": "string" }, { "internalType": "string", "name": "version", "type": "string" }, { "internalType": "string", "name": "decimals", "type": "string" }, { "internalType": "string", "name": "twitter", "type": "string" }, { "internalType": "string", "name": "github", "type": "string" }, { "internalType": "bytes", "name": "dweb", "type": "bytes" }, { "internalType": "address payable", "name": "arb1_address", "type": "address" }, { "internalType": "address payable", "name": "avaxc_address", "type": "address" }, { "internalType": "address payable", "name": "base_address", "type": "address" }, { "internalType": "address payable", "name": "bsc_address", "type": "address" }, { "internalType": "address payable", "name": "cro_address", "type": "address" }, { "internalType": "address payable", "name": "ftm_address", "type": "address" }, { "internalType": "address payable", "name": "gno_address", "type": "address" }, { "internalType": "address payable", "name": "matic_address", "type": "address" }, { "internalType": "bytes", "name": "near_address", "type": "bytes" }, { "internalType": "address payable", "name": "op_address", "type": "address" }, { "internalType": "bytes", "name": "sol_address", "type": "bytes" }, { "internalType": "bytes", "name": "trx_address", "type": "bytes" }, { "internalType": "bytes", "name": "zil_address", "type": "bytes" }, { "internalType": "address payable", "name": "goerli_address", "type": "address" }, { "internalType": "address payable", "name": "sepolia_address", "type": "address" }], "internalType": "struct TNS.Metadata", "name": "", "type": "tuple" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "bytes32", "name": "namehash", "type": "bytes32" }], "name": "gasEfficientFetch", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_chainId", "type": "uint256" }, { "internalType": "string", "name": "_name", "type": "string" }], "name": "getContractForChain", "outputs": [{ "internalType": "bytes", "name": "", "type": "bytes" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "string", "name": "_name", "type": "string" }], "name": "infoFor", "outputs": [{ "components": [{ "internalType": "address", "name": "contractAddress", "type": "address" }, { "internalType": "string", "name": "name", "type": "string" }, { "internalType": "string", "name": "url", "type": "string" }, { "internalType": "string", "name": "avatar", "type": "string" }, { "internalType": "string", "name": "description", "type": "string" }, { "internalType": "string", "name": "notice", "type": "string" }, { "internalType": "string", "name": "version", "type": "string" }, { "internalType": "string", "name": "decimals", "type": "string" }, { "internalType": "string", "name": "twitter", "type": "string" }, { "internalType": "string", "name": "github", "type": "string" }, { "internalType": "bytes", "name": "dweb", "type": "bytes" }], "internalType": "struct TNS.TokenInfo", "name": "", "type": "tuple" }], "stateMutability": "view", "type": "function" }];

const IUniswapV3FactoryABI = [
  "function getPool(address tokenA, address tokenB, uint24 fee) external view returns (address pool)"
];

const IUniswapV3PoolABI = [
  "function slot0() external view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)",
  "function liquidity() external view returns (uint128)"
];

@Controller('tkn/v1')
@Public()
export class TknApiController {
  @Get('ping')
  getPing() {
    return { message: 'pong' };
  }

  @Post('test')
  async testCustomEndpoint(@Body() body: { blockchainUri: string }) {
    const { blockchainUri } = body;

    if (!blockchainUri) {
      throw new HttpException(
        { error: 'blockchainUri is required in the request body' },
        HttpStatus.BAD_REQUEST
      );
    }

    try {
      const provider = new PortersJsonRpcProvider(blockchainUri);

      const blockNumber = await provider.getBlockNumber();
      return { blockNumber };
    } catch (error) {
      console.error(`Failed to reach endpoint ${blockchainUri}:`, error.message);
      throw new HttpException(
        { error: 'Failed to reach endpoint', details: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  //Get token contract address
  @Get(':portersAppId/contract-address/:ticker')
  async getTokenContractAddress(@Param('portersAppId') appId: string, @Param('ticker') ticker: string) {
    try {
      console.log('calling getTokenContractAddress');
      const provider = new PortersJsonRpcProvider(`https://eth-mainnet.rpc.porters.xyz/${appId}`);
      
      console.log(`set provider to https://eth-mainnet.rpc.porters.xyz/${appId}`);
      console.log(`attempting to resolve ${ticker}.tkn.eth`);

      const contractAddress = await provider.resolveName(`${ticker}.tkn.eth`);
      console.log('contractAddress resolved', contractAddress)
      if (!contractAddress) {
        console.error('ENS name resolution failed. Contract address not found.');
        throw new HttpException(
          {
            status: HttpStatus.NOT_FOUND,
            error: 'ENS name resolution failed. Contract address not found.',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      console.log('finished calling getTokenContractAddress');
      return { response: { address: contractAddress }, status: 'success' };
    } catch (err) {
      console.error('Unexpected error:', err.message, err.stack);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'An unexpected error occurred. Please try again later.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  //Get token info
  @Get(':portersAppId/:ticker/metadata')
  async getSingleDataPoint(@Param('portersAppId') appId: string, @Param('ticker') ticker: string) {
    try {
      const provider = new PortersJsonRpcProvider(`https://eth-mainnet.rpc.porters.xyz/${appId}`);

      const contractAddress = await provider.resolveName("tkn.eth");
      if (!contractAddress) {
        throw new HttpException(
          {
            status: HttpStatus.NOT_FOUND,
            error: 'ENS name resolution failed. Contract address not found.',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      const contract = new ethers.Contract(contractAddress, interface_abi, provider);

      let result;
      try {
        result = await contract.dataFor(ticker);
      } catch (contractError) {
        throw new HttpException(
          {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            error: 'Failed to fetch contract data.',
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      // Map the result to the TokenInfo structure
      const info: TokenInfo = {
        contractAddress: result.contractAddress,
        name: result.name,
        url: result.url,
        avatar: result.avatar,
        description: result.description,
        notice: result.notice,
        version: result.version,
        decimals: result.decimals,
        twitter: result.twitter,
        github: result.github,
        dweb: result.dweb !== '0x' ? contentHash.decode(result.dweb) : '0x',
        addresses: {
          eth: result.contractAddress,
          arbitrum: result.arb1_address,
          avax: result.avaxc_address,
          base: result.base_address,
          bsc: result.bsc_address,
          cronos: result.cro_address,
          fantom: result.ftm_address,
          gnosis: result.gno_address,
          goerli_testnet: result.goerli_address,
          near: this.decodeNonEvmAddress('near', result.near_address),
          optimism: result.op_address,
          polygon: result.matic_address,
          sepolia_testnet: result.sepolia_address,
          solana: this.decodeNonEvmAddress('sol', result.sol_address),
          tron: this.decodeNonEvmAddress('trx', result.trx_address),
          ziliqa: this.decodeNonEvmAddress('zil', result.zil_address)
        }
      };

      return { response: { info: info }, status: 'success' };
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      } else {
        console.error('Unexpected error:', err);
        throw new HttpException(
          {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            error: 'An unexpected error occurred. Please try again later.',
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  //Get balance for token held by account on a specific network
  //Note that while the TKN contract implements `Get tokens owned by an address` this appears to be limited to ETH mainnet tokens, so we have to do this manually.
  @Get(':portersAppId/:ticker/balance')
  async getTokenBalance(@Param('portersAppId') appId: string, @Param('ticker') ticker: string, @Query('network') network: string, @Query('address') accountAddress: string) {
    try {
      const provider = new PortersJsonRpcProvider(`https://eth-mainnet.rpc.porters.xyz/${appId}`);

      const contractAddress = await provider.resolveName("tkn.eth");
      if (!contractAddress) {
        throw new HttpException(
          {
            status: HttpStatus.NOT_FOUND,
            error: 'ENS name resolution failed. Contract address not found.',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      const contract = new ethers.Contract(contractAddress, interface_abi, provider);

      const tokenData = await contract.dataFor(ticker);

      let tokenAddress = '0x';
      let portersUri = '';

      switch (network.toLocaleLowerCase()) {
        case 'eth':
          tokenAddress = tokenData.address;
          portersUri = `https://eth-mainnet.rpc.porters.xyz/${appId}`;
          break;
        case 'arbitrum':
          tokenAddress = tokenData.arb1_address;
          portersUri = `https://arbitrum-one.rpc.porters.xyz/${appId}`;
          break;
        case 'avax':
          tokenAddress = tokenData.avaxc_address;
          portersUri = `https://avax-mainnet.rpc.porters.xyz/${appId}`;
          break;
        case 'base':
          tokenAddress = tokenData.base_address;
          portersUri = `https://base-fullnode-mainnet.rpc.porters.xyz/${appId}`;
          break;
        case 'bsc':
          tokenAddress = tokenData.bsc_address;
          portersUri = `https://bsc-mainnet.rpc.porters.xyz/${appId}`;
          break;
        case 'gnosis':
          tokenAddress = tokenData.gno_address;
          portersUri = `https://gnosischain-mainnet.rpc.porters.xyz/${appId}`;
          break;
        case 'optimism':
          tokenAddress = tokenData.op_address;
          portersUri = `https://optimism-mainnet.rpc.porters.xyz/${appId}`;
          break;
        case 'polygon':
          tokenAddress = tokenData.polygon;
          portersUri = `https://poly-mainnet.rpc.porters.xyz/${appId}`;
          break;
        case 'sepolia-testnet':
          tokenAddress = tokenData.sepolia_testnet;
          portersUri = `https://sepolia-testnet.rpc.porters.xyz/${appId}`;
          break;
        default:
          throw new HttpException(
            {
              status: HttpStatus.BAD_REQUEST,
              error: `Network '${network}' is not supported for ${ticker}.`,
            },
            HttpStatus.BAD_REQUEST,
          );
      }

      const balance = await this.getERC20Balance(accountAddress, tokenAddress, portersUri);
      return {
        response: {
          token: {
            token: ticker,
            network: network,
            address: tokenAddress,
          },
          account: {
            address: accountAddress,
            balance: balance,
          },
        },
        status: 'success',
      };
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      } else {
        console.error('Unexpected error:', err);
        throw new HttpException(
          {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            error: 'An unexpected error occurred. Please try again later.',
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @Get(':portersAppId/:ticker/price')
  async getPriceData(@Param('portersAppId') appId: string, @Param('ticker') ticker: string) {
    try {
      const provider = new PortersJsonRpcProvider(`https://eth-mainnet.rpc.porters.xyz/${appId}`);

      const contractAddress = await provider.resolveName("tkn.eth");
      if (!contractAddress) {
        throw new HttpException(
          {
            status: HttpStatus.NOT_FOUND,
            error: 'ENS name resolution failed. Contract address not found.',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      const contract = new ethers.Contract(contractAddress, interface_abi, provider);

      const tickerData = await contract.dataFor(ticker);

      // Define the tokens
      const token0 = new Token(1, tickerData.contractAddress, Number(tickerData.decimals), ticker.toLocaleUpperCase(), tickerData.name);
      const token1 = new Token(1, '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', 18, 'WETH', 'Wrapped Ether');

      // Fetch the pool address from the factory
      const factoryContract = new ethers.Contract('0x1F98431c8aD98523631AE4a59f267346ea31F984', IUniswapV3FactoryABI, provider);
      const poolAddress = await factoryContract.getPool(token0.address, token1.address, 3000);  // 0.3% fee tier

      if (!poolAddress || poolAddress === ethers.ZeroAddress) {
        throw new HttpException(
          {
            status: HttpStatus.NOT_FOUND,
            error: 'Pool does not exist for the provided token pair and fee tier.',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      // Initialize the pool contract
      const poolContract = new ethers.Contract(poolAddress, IUniswapV3PoolABI, provider);
      const slot0 = await poolContract.slot0();
      const liquidity = await poolContract.liquidity();

      const tick = Number(slot0.tick);

      if (isNaN(tick)) {
        throw new HttpException(
          {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            error: 'Invalid tick value received. Could not convert to Number.',
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const pool = new Pool(
        token0,
        token1,
        3000, // fee tier
        slot0.sqrtPriceX96.toString(),
        liquidity.toString(),
        tick
      );

      return {
        response: {
          message: `The price of ${ticker.toUpperCase()} is ${pool.token0Price.toSignificant(6)} WETH on Uniswap.`,
          token0: token0,
          token1: token1,
          price: pool.token0Price.toSignificant(6),
        },
        status: 'success',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        console.error('Unexpected error:', error);
        throw new HttpException(
          {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            error: 'An unexpected error occurred. Please try again later.',
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  private decodeNonEvmAddress(coinName: string, hexAddress: string): string {
    if (hexAddress == '0x') {
      return hexAddress;
    }

    const encoder = getCoderByCoinName(coinName);
    const processedAddress = Buffer.from(hexAddress.substring(2), 'hex');
    return encoder.encode(processedAddress)
  }

  private async getERC20Balance(account: string, tokenAddress: string, providerUrl: string) {
    try {
      // Initialize a provider
      const provider = new PortersJsonRpcProvider(providerUrl);

      // Define the ERC-20 contract ABI (minimum required ABI)
      const erc20Abi = [
        "function balanceOf(address owner) view returns (uint256)",
        "function decimals() view returns (uint8)"
      ];

      // Create a contract instance
      const tokenContract = new ethers.Contract(tokenAddress, erc20Abi, provider);

      // Query the balance of the account
      const balance = await tokenContract.balanceOf(account);

      // Get the token decimals
      const decimals = await tokenContract.decimals();

      // Convert balance to a human-readable format using the decimals
      const adjustedBalance = ethers.formatUnits(balance, decimals);

      return adjustedBalance;
    } catch (err) {
      console.error("Error fetching ERC-20 balance:", err);
      throw err;
    }
  }
}

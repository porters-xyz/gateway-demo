const express = require('express');
const router = express.Router();
const { ethers } = require('ethers');
const { Token } = require('@uniswap/sdk-core');
const { Pool } = require('@uniswap/v3-sdk');
const https = require('https');
const contentHash = require('content-hash');
const { getCoderByCoinName } = require('@ensdomains/address-encoder');

const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const interface_abi = require('./abis/tknInterfaceAbi.json');
const IUniswapV3FactoryABI = require('./abis/uniswapV3FactoryAbi.json');
const IUniswapV3PoolABI = require('./abis/uniswapV3PoolAbi.json');

/**
 * @swagger
 * /tkn/v1/ping:
 *   get:
 *     summary: Check API status
 *     responses:
 *       200:
 *         description: Pong
 */
router.get('/ping', (req, res) => {
    res.json({ message: 'pong' });
});

//API for testing only. May be removed at any time.
router.post('/pingEndpoint', (req, res) => {
    const { blockchainUri } = req.body;

    if (!blockchainUri) {
        return res.status(400).json({ error: 'blockchainUri is required in the request body' });
    }

    try {
        const url = new URL(blockchainUri);
        const options = {
            hostname: url.hostname,
            port: url.port || 443,
            path: url.pathname,
            method: 'POST',
        };

        const req = https.request(options, (resp) => {
            const { statusCode } = resp;

            if (statusCode && statusCode >= 200 && statusCode < 300) {
                res.json({ message: 'Endpoint is reachable', statusCode });
            } else {
                res.status(500).json({ error: `Failed to reach endpoint, status code: ${statusCode}` });
            }
        });

        req.on('error', (err) => {
            console.error(`Failed to ping ${blockchainUri}:`, err.message);
            res.status(500).json({ error: 'Failed to reach endpoint', details: err.message });
        });

        req.end();
    } catch (error) {
        console.error(`Error processing URL ${blockchainUri}:`, error.message);
        res.status(400).json({ error: 'Invalid URL provided', details: error.message });
    }
});

//API for testing only. May be removed at any time.
router.post('/testRpcProvider', async (req, res) => {
    const { blockchainUri } = req.body;

    if (!blockchainUri) {
        return res.status(400).json({ error: 'blockchainUri is required in the request body' });
    }

    try {
        const provider = new ethers.JsonRpcProvider(blockchainUri);
        const blockNumber = await provider.getBlockNumber();
        res.json({ blockNumber });
    } catch (error) {
        console.error(`Failed to reach endpoint ${blockchainUri}:`, error.message);
        res.status(500).json({ error: 'Failed to reach endpoint', details: error.message });
    }
});

/**
 * @swagger
 * /tkn/v1/{portersAppId}/contract-address/{ticker}:
 *   get:
 *     summary: Get the contract address for a token
 *     parameters:
 *       - in: path
 *         name: portersAppId
 *         required: true
 *         schema:
 *           type: string
 *           example: "your-porters-app-id"
 *         description: "The Porters App ID"
 *       - in: path
 *         name: ticker
 *         required: true
 *         schema:
 *           type: string
 *           example: "matic"
 *         description: "The ticker symbol for the token"
 *     responses:
 *       200:
 *         description: Successfully retrieved contract address
 *       404:
 *         description: Contract address not found
 *       500:
 *         description: Internal server error
 */
router.get('/:portersAppId/contract-address/:ticker', async (req, res) => {
    const { portersAppId, ticker } = req.params;

    try {
        const provider = new ethers.JsonRpcProvider(`https://eth-mainnet.rpc.porters.xyz/${portersAppId}`);
        const contractAddress = await provider.resolveName(`${ticker}.tkn.eth`);

        if (!contractAddress) {
            return res.status(404).json({ error: 'ENS name resolution failed. Contract address not found.' });
        }

        res.json({ response: { address: contractAddress }, status: 'success' });
    } catch (err) {
        console.error('Unexpected error:', err.message, err.stack);
        res.status(500).json({ error: 'An unexpected error occurred. Please try again later.' });
    }
});

/**
 * @swagger
 * /tkn/v1/{portersAppId}/{ticker}/metadata:
 *   get:
 *     summary: Get metadata for a token
 *     parameters:
 *       - in: path
 *         name: portersAppId
 *         required: true
 *         schema:
 *           type: string
 *           example: "your-porters-app-id"
 *         description: "The Porters App ID"
 *       - in: path
 *         name: ticker
 *         required: true
 *         schema:
 *           type: string
 *           example: "matic"
 *         description: "The ticker symbol for the token"
 *     responses:
 *       200:
 *         description: Successfully retrieved token metadata
 *       404:
 *         description: Metadata not found
 *       500:
 *         description: Internal server error
 */
router.get('/:portersAppId/:ticker/metadata', async (req, res) => {
    const { portersAppId, ticker } = req.params;

    try {
        const provider = new ethers.JsonRpcProvider(`https://eth-mainnet.rpc.porters.xyz/${portersAppId}`);
        const contractAddress = await provider.resolveName("tkn.eth");

        if (!contractAddress) {
            return res.status(404).json({ error: 'ENS name resolution failed. Contract address not found.' });
        }

        const contract = new ethers.Contract(contractAddress, interface_abi, provider);
        const result = await contract.dataFor(ticker);

        const info = {
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
                near: decodeNonEvmAddress('near', result.near_address),
                optimism: result.op_address,
                polygon: result.matic_address,
                sepolia_testnet: result.sepolia_address,
                solana: decodeNonEvmAddress('sol', result.sol_address),
                tron: decodeNonEvmAddress('trx', result.trx_address),
                ziliqa: decodeNonEvmAddress('zil', result.zil_address)
            }
        };

        res.json({ response: { info: info }, status: 'success' });
    } catch (err) {
        console.error('Unexpected error:', err.message, err.stack);
        res.status(500).json({ error: 'An unexpected error occurred. Please try again later.' });
    }
});

/**
 * @swagger
 * /tkn/v1/{portersAppId}/{ticker}/balance:
 *   get:
 *     summary: Get token balance for an account on a specific network
 *     parameters:
 *       - in: path
 *         name: portersAppId
 *         required: true
 *         schema:
 *           type: string
 *           example: "your-porters-app-id"
 *         description: "The Porters App ID"
 *       - in: path
 *         name: ticker
 *         required: true
 *         schema:
 *           type: string
 *           example: "usdc"
 *         description: "The ticker symbol for the token"
 *       - in: query
 *         name: network
 *         required: true
 *         schema:
 *           type: string
 *           example: "arbitrum"
 *         description: "The network to query the balance on"
 *       - in: query
 *         name: address
 *         required: true
 *         schema:
 *           type: string
 *           example: "0x1234567890abcdef1234567890abcdef12345678"
 *         description: "The address to query the balance of"
 *     responses:
 *       200:
 *         description: Successfully retrieved token balance
 *       400:
 *         description: Invalid request
 *       404:
 *         description: Contract address not found
 *       500:
 *         description: Internal server error
 */
router.get('/:portersAppId/:ticker/balance', async (req, res) => {
    const { portersAppId, ticker } = req.params;
    const { network, address: accountAddress } = req.query;

    try {
        const provider = new ethers.JsonRpcProvider(`https://eth-mainnet.rpc.porters.xyz/${portersAppId}`);
        const contractAddress = await provider.resolveName("tkn.eth");

        if (!contractAddress) {
            return res.status(404).json({ error: 'ENS name resolution failed. Contract address not found.' });
        }

        const contract = new ethers.Contract(contractAddress, interface_abi, provider);
        const tokenData = await contract.dataFor(ticker);

        let tokenAddress = '0x';
        let portersUri = '';

        switch (network.toLowerCase()) {
            case 'eth':
                tokenAddress = tokenData.address;
                portersUri = `https://eth-mainnet.rpc.porters.xyz/${portersAppId}`;
                break;
            case 'arbitrum':
                tokenAddress = tokenData.arb1_address;
                portersUri = `https://arbitrum-one.rpc.porters.xyz/${portersAppId}`;
                break;
            case 'avax':
                tokenAddress = tokenData.avaxc_address;
                portersUri = `https://avax-mainnet.rpc.porters.xyz/${portersAppId}`;
                break;
            case 'base':
                tokenAddress = tokenData.base_address;
                portersUri = `https://base-fullnode-mainnet.rpc.porters.xyz/${portersAppId}`;
                break;
            case 'bsc':
                tokenAddress = tokenData.bsc_address;
                portersUri = `https://bsc-mainnet.rpc.porters.xyz/${portersAppId}`;
                break;
            case 'gnosis':
                tokenAddress = tokenData.gno_address;
                portersUri = `https://gnosischain-mainnet.rpc.porters.xyz/${portersAppId}`;
                break;
            case 'optimism':
                tokenAddress = tokenData.op_address;
                portersUri = `https://optimism-mainnet.rpc.porters.xyz/${portersAppId}`;
                break;
            case 'polygon':
                tokenAddress = tokenData.polygon;
                portersUri = `https://poly-mainnet.rpc.porters.xyz/${portersAppId}`;
                break;
            case 'sepolia-testnet':
                tokenAddress = tokenData.sepolia_testnet;
                portersUri = `https://sepolia-testnet.rpc.porters.xyz/${portersAppId}`;
                break;
            default:
                return res.status(400).json({ error: `Network '${network}' is not supported for ${ticker}.` });
        }

        const balance = await getERC20Balance(accountAddress, tokenAddress, portersUri);
        res.json({
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
        });
    } catch (err) {
        console.error('Unexpected error:', err.message, err.stack);
        res.status(500).json({ error: 'An unexpected error occurred. Please try again later.' });
    }
});

/**
 * @swagger
 * /tkn/v1/{portersAppId}/{ticker}/price:
 *   get:
 *     summary: Get the price of a token in WETH
 *     parameters:
 *       - in: path
 *         name: portersAppId
 *         required: true
 *         schema:
 *           type: string
 *           example: "your-porters-app-id"
 *         description: "The Porters App ID"
 *       - in: path
 *         name: ticker
 *         required: true
 *         schema:
 *           type: string
 *           example: "usdc"
 *         description: "The ticker symbol for the token"
 *     responses:
 *       200:
 *         description: Successfully retrieved token price
 *       404:
 *         description: Pool does not exist for the provided token pair and fee tier
 *       500:
 *         description: Internal server error
 */
router.get('/:portersAppId/:ticker/price', async (req, res) => {
    const { portersAppId, ticker } = req.params;

    try {
        const provider = new ethers.JsonRpcProvider(`https://eth-mainnet.rpc.porters.xyz/${portersAppId}`);
        const contractAddress = await provider.resolveName("tkn.eth");

        if (!contractAddress) {
            return res.status(404).json({ error: 'ENS name resolution failed. Contract address not found.' });
        }

        const contract = new ethers.Contract(contractAddress, interface_abi, provider);
        const tickerData = await contract.dataFor(ticker);

        const token0 = new Token(1, tickerData.contractAddress, Number(tickerData.decimals), ticker.toUpperCase(), tickerData.name);
        const token1 = new Token(1, '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', 18, 'WETH', 'Wrapped Ether');

        const factoryContract = new ethers.Contract('0x1F98431c8aD98523631AE4a59f267346ea31F984', IUniswapV3FactoryABI, provider);
        const poolAddress = await factoryContract.getPool(token0.address, token1.address, 3000);

        if (!poolAddress || poolAddress === ethers.ZeroAddress) {
            return res.status(404).json({ error: 'Pool does not exist for the provided token pair and fee tier.' });
        }

        const poolContract = new ethers.Contract(poolAddress, IUniswapV3PoolABI, provider);
        const slot0 = await poolContract.slot0();
        const liquidity = await poolContract.liquidity();

        const tick = Number(slot0.tick);

        if (isNaN(tick)) {
            return res.status(500).json({ error: 'Invalid tick value received. Could not convert to Number.' });
        }

        const pool = new Pool(
            token0,
            token1,
            3000, // fee tier
            slot0.sqrtPriceX96.toString(),
            liquidity.toString(),
            tick
        );

        res.json({
            response: {
                message: `The price of ${ticker.toUpperCase()} is ${pool.token0Price.toSignificant(6)} WETH on Uniswap.`,
                token0: token0,
                token1: token1,
                price: pool.token0Price.toSignificant(6),
            },
            status: 'success',
        });
    } catch (error) {
        console.error('Unexpected error:', error.message);
        res.status(500).json({ error: 'An unexpected error occurred. Please try again later.' });
    }
});

function decodeNonEvmAddress(coinName, hexAddress) {
    if (hexAddress == '0x') {
        return hexAddress;
    }

    const encoder = getCoderByCoinName(coinName);
    const processedAddress = Buffer.from(hexAddress.substring(2), 'hex');
    return encoder.encode(processedAddress);
}

async function getERC20Balance(account, tokenAddress, providerUrl) {
    try {
        const provider = new ethers.JsonRpcProvider(providerUrl);
        const erc20Abi = [
            "function balanceOf(address owner) view returns (uint256)",
            "function decimals() view returns (uint8)"
        ];

        const tokenContract = new ethers.Contract(tokenAddress, erc20Abi, provider);
        const balance = await tokenContract.balanceOf(account);
        const decimals = await tokenContract.decimals();

        return ethers.formatUnits(balance, decimals);
    } catch (err) {
        console.error("Error fetching ERC-20 balance:", err);
        throw err;
    }
}

module.exports = router;

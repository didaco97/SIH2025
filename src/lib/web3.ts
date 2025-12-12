/**
 * Web3 Blockchain Integration for PMFBY
 * Uses MetaMask + Polygon Mumbai Testnet for real on-chain hash verification
 */

import { BrowserProvider, JsonRpcSigner, formatEther, parseEther, toUtf8Bytes, hexlify } from 'ethers';

// Polygon Mumbai Testnet configuration
const POLYGON_MUMBAI = {
    chainId: '0x13882', // 80002 in hex (Polygon Amoy testnet - Mumbai deprecated)
    chainName: 'Polygon Amoy Testnet',
    nativeCurrency: {
        name: 'MATIC',
        symbol: 'MATIC',
        decimals: 18
    },
    rpcUrls: ['https://rpc-amoy.polygon.technology'],
    blockExplorerUrls: ['https://amoy.polygonscan.com']
};

// For demo/testing, use Sepolia (Ethereum testnet) as fallback
const SEPOLIA = {
    chainId: '0xaa36a7', // 11155111 in hex
    chainName: 'Sepolia Testnet',
    nativeCurrency: {
        name: 'SepoliaETH',
        symbol: 'ETH',
        decimals: 18
    },
    rpcUrls: ['https://rpc.sepolia.org'],
    blockExplorerUrls: ['https://sepolia.etherscan.io']
};

declare global {
    interface Window {
        ethereum?: any;
    }
}

export interface WalletConnection {
    address: string;
    balance: string;
    chainId: string;
    chainName: string;
}

export interface TransactionResult {
    success: boolean;
    txHash?: string;
    blockExplorerUrl?: string;
    error?: string;
}

/**
 * Check if MetaMask is installed
 */
export function isMetaMaskInstalled(): boolean {
    return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
}

/**
 * Connect to MetaMask wallet
 */
export async function connectWallet(): Promise<WalletConnection | null> {
    if (!isMetaMaskInstalled()) {
        alert('Please install MetaMask to use blockchain verification!\n\nDownload: https://metamask.io/download/');
        return null;
    }

    try {
        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

        if (!accounts || accounts.length === 0) {
            throw new Error('No accounts found');
        }

        const provider = new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        const balance = await provider.getBalance(address);
        const network = await provider.getNetwork();

        return {
            address,
            balance: formatEther(balance),
            chainId: network.chainId.toString(),
            chainName: network.name
        };
    } catch (error: any) {
        console.error('Failed to connect wallet:', error);
        throw error;
    }
}

/**
 * Switch to Polygon Amoy testnet (or add it if not present)
 */
export async function switchToPolygon(): Promise<boolean> {
    if (!isMetaMaskInstalled()) return false;

    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: POLYGON_MUMBAI.chainId }]
        });
        return true;
    } catch (switchError: any) {
        // Chain not added, try to add it
        if (switchError.code === 4902) {
            try {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [POLYGON_MUMBAI]
                });
                return true;
            } catch (addError) {
                console.error('Failed to add Polygon network:', addError);
                return false;
            }
        }
        console.error('Failed to switch network:', switchError);
        return false;
    }
}

/**
 * Store hash on blockchain by sending a transaction with hash in data field
 * This is the simplest form of on-chain verification - no smart contract needed
 */
export async function storeHashOnChain(hash: string, claimId: string): Promise<TransactionResult> {
    if (!isMetaMaskInstalled()) {
        return { success: false, error: 'MetaMask not installed' };
    }

    try {
        const provider = new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        const network = await provider.getNetwork();

        // Prepare data payload (claim ID + hash)
        const dataPayload = JSON.stringify({
            type: 'PMFBY_CLAIM_VERIFICATION',
            claimId,
            hash,
            timestamp: new Date().toISOString()
        });

        // Convert to hex bytes
        const dataBytes = hexlify(toUtf8Bytes(dataPayload));

        // Send transaction to self with data (minimal cost, just to store on-chain)
        const tx = await signer.sendTransaction({
            to: address, // Send to self
            value: parseEther('0'), // Zero value transfer
            data: dataBytes // Hash stored in transaction data
        });

        console.log('Transaction sent:', tx.hash);

        // Wait for confirmation
        const receipt = await tx.wait();

        if (!receipt) {
            throw new Error('Transaction failed - no receipt');
        }

        // Determine block explorer URL based on network
        let explorerUrl = '';
        const chainId = Number(network.chainId);

        if (chainId === 80002) {
            explorerUrl = `https://amoy.polygonscan.com/tx/${tx.hash}`;
        } else if (chainId === 11155111) {
            explorerUrl = `https://sepolia.etherscan.io/tx/${tx.hash}`;
        } else if (chainId === 137) {
            explorerUrl = `https://polygonscan.com/tx/${tx.hash}`;
        } else if (chainId === 1) {
            explorerUrl = `https://etherscan.io/tx/${tx.hash}`;
        } else {
            explorerUrl = `Transaction: ${tx.hash}`;
        }

        return {
            success: true,
            txHash: tx.hash,
            blockExplorerUrl: explorerUrl
        };

    } catch (error: any) {
        console.error('Blockchain transaction failed:', error);

        let errorMessage = error.message || 'Unknown error';

        if (error.code === 4001) {
            errorMessage = 'Transaction rejected by user';
        } else if (error.code === -32603) {
            errorMessage = 'Insufficient funds for gas. Get testnet MATIC from faucet.';
        }

        return {
            success: false,
            error: errorMessage
        };
    }
}

/**
 * Get current wallet address (if connected)
 */
export async function getCurrentAddress(): Promise<string | null> {
    if (!isMetaMaskInstalled()) return null;

    try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        return accounts && accounts.length > 0 ? accounts[0] : null;
    } catch {
        return null;
    }
}

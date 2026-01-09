
import { Token, PortfolioToken, SystemLog, Alert } from './types';

export const mockTokens: Token[] = [
  { 
    id: '1', name: 'Pepe 2.0', symbol: '$PEPE2', address: '0x123...456', score: 98, status: 'VERIFIED', 
    mktCap: '$12.4M', liquidity: '$840k', volume24h: '$1.2M', holders: '12,402', network: 'SOL', price: 0.00000123,
    security: { isRenounced: true, isLiquidityLocked: true }
  },
  { 
    id: '2', name: 'Shiba Neo', symbol: '$NEOSHIB', address: '0x234...567', score: 64, status: 'WARNING', 
    mktCap: '$452k', liquidity: '$45k', volume24h: '$210k', holders: '842', network: 'SOL', price: 0.000045,
    security: { isRenounced: false, isLiquidityLocked: true }
  },
  { 
    id: '3', name: 'Moon Doge', symbol: '$MDOGE', address: '0x345...678', score: 12, status: 'HIGH RISK', 
    mktCap: '$12k', liquidity: '$1.2k', volume24h: '$800', holders: '45', network: 'SOL', price: 0.00000005,
    security: { isRenounced: false, isLiquidityLocked: false }
  },
  { 
    id: '4', name: 'Froge AI', symbol: '$FRAI', address: '0x456...789', score: 85, status: 'TRENDING', 
    mktCap: '$2.8M', liquidity: '$320k', volume24h: '$950k', holders: '4,200', network: 'SOL', price: 0.0023,
    security: { isRenounced: true, isLiquidityLocked: true }
  },
  { 
    id: '5', name: 'Based Chad', symbol: '$CHAD', address: '0x789...012', score: 91, status: 'VERIFIED', 
    mktCap: '$5.1M', liquidity: '$600k', volume24h: '$2.2M', holders: '8,100', network: 'BASE', price: 0.15,
    security: { isRenounced: true, isLiquidityLocked: true }
  },
  { 
    id: '6', name: 'Ether Rock', symbol: '$ROCK', address: '0x890...123', score: 45, status: 'WARNING', 
    mktCap: '$150k', liquidity: '$12k', volume24h: '$50k', holders: '320', network: 'ETH', price: 0.0008,
    security: { isRenounced: true, isLiquidityLocked: false }
  },
  { 
    id: '7', name: 'SafeElon', symbol: '$SAFEM', address: '0x901...234', score: 88, status: 'TRENDING', 
    mktCap: '$1.2M', liquidity: '$250k', volume24h: '$800k', holders: '2,500', network: 'BSC', price: 0.000009,
    security: { isRenounced: true, isLiquidityLocked: true }
  },
];

export const mockPortfolio: PortfolioToken[] = [
  { ...mockTokens[0], initialInvest: '1,000 USD', entryPrice: '$0.000001', livePrice: '$0.000008', changePercent: 700 },
  { id: 'p2', name: 'WIF', symbol: 'dogwifhat', address: 'wif...123', score: 92, status: 'TRENDING', mktCap: '$3.4B', liquidity: '$45M', volume24h: '$120M', holders: '85k', network: 'SOL', security: { isRenounced: true, isLiquidityLocked: true }, initialInvest: '2,500 USD', entryPrice: '$0.1500', livePrice: '$3.4000', changePercent: 2166, price: 3.40 },
  { id: 'p3', name: 'BONK', symbol: 'Bonk', address: 'bonk...456', score: 78, status: 'VERIFIED', mktCap: '$1.2B', liquidity: '$22M', volume24h: '$80M', holders: '650k', network: 'SOL', security: { isRenounced: true, isLiquidityLocked: true }, initialInvest: '5,000 USD', entryPrice: '$0.00002', livePrice: '$0.00001', changePercent: -50, price: 0.00001 },
];

export const mockLogs: SystemLog[] = [
  { id: 'l1', timestamp: '2023-11-24 14:23:45 UTC', tokenName: 'PEPE', tokenAddress: '0x28...4f1e', eventType: 'Price Surge > 20%', status: 'Executed' },
  { id: 'l2', timestamp: '2023-11-24 14:21:12 UTC', tokenName: 'WOJAK', tokenAddress: '0x71...a93b', eventType: 'Liquidity Drain', status: 'Alerted' },
  { id: 'l3', timestamp: '2023-11-24 14:15:00 UTC', tokenName: 'DOGE', tokenAddress: '0x14...55cc', eventType: 'New Whale Wallet', status: 'Logged' },
];

export const mockAlerts: Alert[] = [
  { 
    id: 'a1', 
    tokenId: '1', 
    tokenName: 'PEPE', 
    tokenSymbol: '$PEPE2', 
    tokenAddress: '0x123...456', 
    chain: 'SOL', 
    type: 'Volume (24h)', 
    frequency: '5m', 
    threshold: 500000, 
    operator: '>', 
    isEnabled: true, 
    createdAtIso: '2023-11-24T12:00:00Z' 
  },
  { 
    id: 'a2', 
    tokenId: 'p2', 
    tokenName: 'WIF', 
    tokenSymbol: 'dogwifhat', 
    tokenAddress: 'wif...123', 
    chain: 'SOL', 
    type: 'Price Move', 
    frequency: '15m', 
    threshold: 10, 
    operator: '>', 
    isEnabled: true, 
    createdAtIso: '2023-11-24T12:00:00Z' 
  },
];


export type TokenStatus = 'VERIFIED' | 'WARNING' | 'HIGH RISK' | 'TRENDING';

export interface Token {
  id: string;
  name: string;
  symbol: string;
  address: string;
  score: number;
  status: TokenStatus;
  mktCap: string;
  liquidity: string;
  volume24h: string;
  holders: string;
  network: string;
  price?: number; // Added for portfolio calculations
  security: {
    isRenounced: boolean;
    isLiquidityLocked: boolean;
  };
}

export interface PortfolioToken extends Token {
  initialInvest: string;
  entryPrice: string;
  livePrice: string;
  changePercent: number;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  tokenName: string;
  tokenAddress: string;
  eventType: string;
  status: 'Executed' | 'Alerted' | 'Logged';
}

export interface Alert {
  id: string;
  tokenId: string;
  tokenName: string;
  tokenSymbol: string;
  tokenAddress: string; 
  chain: string;
  type: string;
  operator: string; 
  threshold: number; 
  frequency: string;
  isEnabled: boolean; 
  createdAtIso: string;
}

export type ExitStrategyId = 'conservative' | 'standard' | 'moonshot';

export interface ExitStrategyRule {
  targetMultiple: number;
  sellPct: number;
}

export type PositionActionType = 'OPEN' | 'ADD' | 'REDUCE' | 'ADJUST' | 'CLOSE';

export interface PositionHistoryItem {
  id: string;
  dateIso: string;
  type: PositionActionType;
  priceUsd: number;
  quantity: number;
  valueUsd: number; // Total value of the transaction (buy amount or sell amount)
}

export interface Position {
  id: string;
  tokenId: string;
  tokenName: string;
  tokenSymbol: string;
  chain: string;
  entryType: 'investment_and_entryPrice' | 'investment_and_quantity';
  investmentUsd: number; // Remaining cost basis
  entryPriceUsd: number; // Average entry price
  quantity: number;
  entryDateIso: string;
  currentPriceUsd: number;
  pnlUsd: number;
  pnlPct: number;
  exitStrategyId: ExitStrategyId;
  history: PositionHistoryItem[];
}


export enum PricingModel {
  GBM = 'GBM', // Geometric Brownian Motion
  OU = 'OU',   // Ornstein-Uhlenbeck (Mean Reversion)
  JD = 'JD'    // Jump Diffusion (Merton)
}

export interface MarketParams {
  startPrice: number;
  steps: number; // Number of ticks
  model: PricingModel;
  
  // Common / GBM Parameters
  drift: number; // Trend bias (-0.1 to 0.1)
  volatility: number; // Randomness (0.001 to 0.05)

  // Ornstein-Uhlenbeck Specific
  meanReversionSpeed: number; // Strength of pull to mean (0 to 1)
  longTermMean: number; // Price target

  // Jump Diffusion Specific
  jumpIntensity: number; // Probability of jump per step (Lambda)
  jumpMean: number; // Avg size of jump (percentage)
  jumpStd: number; // Volatility of jump size
}

export enum GridType {
  Arithmetic = 'Arithmetic',
  Geometric = 'Geometric',
}

export enum StrategyDirection {
  LongOnly = 'Long Only',
  ShortOnly = 'Short Only',
  Neutral = 'Neutral (Long & Short)'
}

export enum EntryFilter {
  None = 'None',
  Trend = 'Trend (SMA 50)', // Only trade with trend
  RSI = 'RSI Reversal (14)', // Buy Oversold, Sell Overbought
}

export interface GridParams {
  lowerPrice: number;
  upperPrice: number;
  grids: number;
  initialCapital: number;
  amountPerGrid: number;
  gridType: GridType;
  stopLoss: number; // 0 for none
  
  // Triggers
  maxBuyPrice: number; 
  minSellPrice: number; 
  
  // Strategy Control
  strategyDirection: StrategyDirection;
  entryFilter: EntryFilter;
}

export interface Tick {
  step: number;
  price: number;
}

export enum TradeType {
  Buy = 'BUY',
  Sell = 'SELL',
}

export enum PositionSide {
  Long = 'LONG',
  Short = 'SHORT'
}

export interface Trade {
  id: string;
  step: number;
  price: number;
  type: TradeType;
  amount: number;
  realizedPnL: number; // 0 for Open, actual profit for Close
  relatedOrderId?: string; 
  side: PositionSide;
}

export interface Position {
  id: string;
  entryPrice: number;
  amount: number;
  stepOpened: number;
  side: PositionSide;
}

export interface SimulationStep {
  step: number;
  price: number;
  equity: number; // Balance + Unrealized
  balance: number; // Cash
  inventory: number; // Held assets count
  unrealizedPnL: number;
}

export interface SimulationResult {
  pricePath: Tick[];
  equityCurve: SimulationStep[];
  trades: Trade[];
  activePositions: Position[];
  gridLevels: number[];
  metrics: {
    totalReturn: number;
    totalReturnPercent: number;
    maxDrawdown: number;
    maxDrawdownPercent: number;
    totalTrades: number;
    winningTrades: number;
    finalBalance: number;
    finalEquity: number;
    profitFactor: number;
    
    // Grid specific
    gridProfit: number; // Realized
    floatingPnL: number; // Unrealized
    activePositionCount: number;
    avgBuyPrice: number;
  };
}

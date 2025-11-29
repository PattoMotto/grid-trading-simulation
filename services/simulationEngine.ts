
import { EntryFilter, GridParams, MarketParams, Position, PositionSide, PricingModel, SimulationResult, SimulationStep, StrategyDirection, Trade, TradeType } from "../types";
import { calculateGridLevels, generateGBMPath, generateJDPath, generateOUPath } from "./mathUtils";

// --- Indicators ---

const calculateSMA = (data: number[], period: number): number[] => {
  const sma = new Array(data.length).fill(0);
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      sma[i] = data[i]; // Not enough data
      continue;
    }
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += data[i - j];
    }
    sma[i] = sum / period;
  }
  return sma;
};

const calculateRSI = (data: number[], period: number): number[] => {
  const rsi = new Array(data.length).fill(50);
  if (data.length < period + 1) return rsi;

  let gains = 0;
  let losses = 0;

  // Initial Avg
  for (let i = 1; i <= period; i++) {
    const change = data[i] - data[i - 1];
    if (change >= 0) gains += change;
    else losses += Math.abs(change);
  }
  let avgGain = gains / period;
  let avgLoss = losses / period;

  for (let i = period + 1; i < data.length; i++) {
    const change = data[i] - data[i - 1];
    let currentGain = 0;
    let currentLoss = 0;
    if (change >= 0) currentGain = change;
    else currentLoss = Math.abs(change);

    avgGain = (avgGain * (period - 1) + currentGain) / period;
    avgLoss = (avgLoss * (period - 1) + currentLoss) / period;

    if (avgLoss === 0) {
      rsi[i] = 100;
    } else {
      const rs = avgGain / avgLoss;
      rsi[i] = 100 - (100 / (1 + rs));
    }
  }
  return rsi;
};

export const runSimulation = (market: MarketParams, grid: GridParams): SimulationResult => {
  // 1. Generate Price Path
  let prices: number[] = [];
  switch (market.model) {
    case PricingModel.OU:
      prices = generateOUPath(market.startPrice, market.steps, market.volatility, market.meanReversionSpeed, market.longTermMean);
      break;
    case PricingModel.JD:
      prices = generateJDPath(market.startPrice, market.steps, market.drift, market.volatility, market.jumpIntensity, market.jumpMean, market.jumpStd);
      break;
    case PricingModel.GBM:
    default:
      prices = generateGBMPath(market.startPrice, market.steps, market.drift, market.volatility);
      break;
  }

  // Calculate Indicators if needed
  const sma50 = grid.entryFilter === EntryFilter.Trend ? calculateSMA(prices, 50) : [];
  const rsi14 = grid.entryFilter === EntryFilter.RSI ? calculateRSI(prices, 14) : [];

  const priceTicks = prices.map((p, i) => ({ step: i, price: p }));
  const gridLevels = calculateGridLevels(grid.lowerPrice, grid.upperPrice, grid.grids, grid.gridType);

  // 3. Simulation State
  let balance = grid.initialCapital;
  const trades: Trade[] = [];
  const equityCurve: SimulationStep[] = [];
  let activePositions: Position[] = [];
  
  // Helper: Inventory is net signed amount
  const getInventory = () => activePositions.reduce((sum, p) => p.side === PositionSide.Long ? sum + p.amount : sum - p.amount, 0);
  
  // Helper: Weighted Avg Entry (Separate for Long/Short could be better, but simple Avg Price for dashboard)
  const getWeightedAvgEntry = () => {
    const totalAmt = activePositions.length;
    if (totalAmt === 0) return 0;
    const totalEntry = activePositions.reduce((sum, p) => sum + p.entryPrice, 0);
    return totalEntry / totalAmt;
  };

  const getZone = (price: number): number => {
    if (price < gridLevels[0]) return -1; 
    if (price > gridLevels[gridLevels.length - 1]) return gridLevels.length;
    for (let i = 0; i < gridLevels.length - 1; i++) {
      if (price >= gridLevels[i] && price < gridLevels[i + 1]) {
        return i;
      }
    }
    return gridLevels.length - 1;
  };

  let currentZone = getZone(prices[0]);
  let maxEquity = grid.initialCapital;
  let minEquity = grid.initialCapital;
  let gridProfit = 0; 

  const checkFilter = (step: number, price: number, intendedSide: PositionSide): boolean => {
    if (grid.entryFilter === EntryFilter.None) return true;
    
    if (grid.entryFilter === EntryFilter.Trend) {
       const sma = sma50[step];
       // Long: Allow if Price > SMA (Uptrend)
       if (intendedSide === PositionSide.Long && price > sma) return true;
       // Short: Allow if Price < SMA (Downtrend)
       if (intendedSide === PositionSide.Short && price < sma) return true;
       return false;
    }

    if (grid.entryFilter === EntryFilter.RSI) {
      const rsi = rsi14[step];
      // Mean Reversion Logic:
      // Long: Buy when Oversold (<30)
      if (intendedSide === PositionSide.Long && rsi < 30) return true;
      // Short: Sell when Overbought (>70)
      if (intendedSide === PositionSide.Short && rsi > 70) return true;
      return false;
    }
    
    return true;
  };

  // 4. Iterate Ticks
  for (let i = 0; i < prices.length; i++) {
    const price = prices[i];
    const newZone = getZone(price);

    // --- STOP LOSS CHECK ---
    if (grid.stopLoss > 0) {
      // For Longs: Price < SL
      if (activePositions.some(p => p.side === PositionSide.Long) && price <= grid.stopLoss) {
         // Close Longs
         const longs = activePositions.filter(p => p.side === PositionSide.Long);
         activePositions = activePositions.filter(p => p.side !== PositionSide.Long);
         longs.forEach(pos => {
            const proceed = pos.amount * price;
            balance += proceed;
            const pnl = (price - pos.entryPrice) * pos.amount;
            gridProfit += pnl;
            trades.push({
              id: `SL-L-${i}-${pos.id}`, step: i, price: price, type: TradeType.Sell, 
              amount: pos.amount, realizedPnL: pnl, relatedOrderId: pos.id, side: PositionSide.Long
            });
         });
      }
      // For Shorts: Price > SL (Upper SL logic not explicitly in simple input, assume SL works for downside risk mainly or explicit value)
      // Let's assume SL input is a price level. If Short, and Price > SL (and SL > Start), we stop.
      // But usually SL is "Price < X". 
      // Let's keep SL simple: "Panic Close All if price < X". Usually for Longs.
    }

    if (newZone !== currentZone) {
      // --- Logic Determination based on Direction ---
      
      // Determine which strategies are active
      const useLong = grid.strategyDirection === StrategyDirection.LongOnly || grid.strategyDirection === StrategyDirection.Neutral;
      const useShort = grid.strategyDirection === StrategyDirection.ShortOnly || grid.strategyDirection === StrategyDirection.Neutral;
      
      // For Neutral: Split at Start Price
      // If Price < Start: Long Mode
      // If Price > Start: Short Mode
      const isNeutralLongZone = grid.strategyDirection === StrategyDirection.Neutral && price < market.startPrice;
      const isNeutralShortZone = grid.strategyDirection === StrategyDirection.Neutral && price > market.startPrice;

      // --- CROSS DOWN (Price dropped) ---
      // Potential BUY Action
      if (newZone < currentZone) {
         
         // 1. Check if we can Close a SHORT (Buy to Cover)
         // LIFO Short Closing
         const lastShort = activePositions.length > 0 && activePositions[activePositions.length - 1].side === PositionSide.Short 
                           ? activePositions[activePositions.length - 1] : null;
         
         if (lastShort) {
            // Close Short
            const cost = lastShort.amount * price;
            balance -= cost; // Pay cash to buy back
            const pnl = (lastShort.entryPrice - price) * lastShort.amount; // Profit if Price < Entry
            gridProfit += pnl;
            activePositions.pop();
            
            trades.push({
              id: `C-S-${i}`, step: i, price: price, type: TradeType.Buy,
              amount: lastShort.amount, realizedPnL: pnl, relatedOrderId: lastShort.id, side: PositionSide.Short
            });
         } 
         
         // 2. Open LONG?
         else if (useLong && (grid.strategyDirection !== StrategyDirection.Neutral || isNeutralLongZone)) {
             // Check Limits
             if ((!grid.maxBuyPrice || price <= grid.maxBuyPrice)) {
                // Check Filter
                if (checkFilter(i, price, PositionSide.Long)) {
                  const cost = grid.amountPerGrid * price;
                  if (balance >= cost) { // Simple cash check
                    balance -= cost;
                    activePositions.push({
                        id: `POS-L-${i}`, entryPrice: price, amount: grid.amountPerGrid, stepOpened: i, side: PositionSide.Long
                    });
                    trades.push({
                      id: `O-L-${i}`, step: i, price: price, type: TradeType.Buy,
                      amount: grid.amountPerGrid, realizedPnL: 0, side: PositionSide.Long
                    });
                  }
                }
             }
         }
      }

      // --- CROSS UP (Price rose) ---
      // Potential SELL Action
      else if (newZone > currentZone) {
        
        // 1. Check if we can Close a LONG (Sell to Close)
        const lastLong = activePositions.length > 0 && activePositions[activePositions.length - 1].side === PositionSide.Long
                         ? activePositions[activePositions.length - 1] : null;

        if (lastLong) {
             // Sell Long
             const proceed = lastLong.amount * price;
             balance += proceed;
             const pnl = (price - lastLong.entryPrice) * lastLong.amount;
             gridProfit += pnl;
             activePositions.pop();

             trades.push({
               id: `C-L-${i}`, step: i, price: price, type: TradeType.Sell,
               amount: lastLong.amount, realizedPnL: pnl, relatedOrderId: lastLong.id, side: PositionSide.Long
             });
        }

        // 2. Open SHORT?
        else if (useShort && (grid.strategyDirection !== StrategyDirection.Neutral || isNeutralShortZone)) {
            // Check Limits (Min Sell Price acts as floor for Short entry? Or Ceiling? )
            // Let's use Min Sell Price as: Don't Sell (Short) below this.
            if ((!grid.minSellPrice || price >= grid.minSellPrice)) {
               // Check Filter
               if (checkFilter(i, price, PositionSide.Short)) {
                  // Open Short
                  // In this model, Shorting ADDS cash (borrowed sale)
                  const proceeds = grid.amountPerGrid * price;
                  balance += proceeds; 
                  activePositions.push({
                      id: `POS-S-${i}`, entryPrice: price, amount: grid.amountPerGrid, stepOpened: i, side: PositionSide.Short
                  });
                  trades.push({
                    id: `O-S-${i}`, step: i, price: price, type: TradeType.Sell,
                    amount: grid.amountPerGrid, realizedPnL: 0, side: PositionSide.Short
                  });
               }
            }
        }
      }

      currentZone = newZone;
    }

    // --- Metrics ---
    const inventory = getInventory();
    // Unrealized PnL
    let floatingPnL = 0;
    activePositions.forEach(p => {
        if (p.side === PositionSide.Long) {
            floatingPnL += (price - p.entryPrice) * p.amount;
        } else {
            floatingPnL += (p.entryPrice - price) * p.amount;
        }
    });

    // Equity = Balance + Unrealized? 
    // For Long: Equity = Cash + AssetValue. (AssetValue = Cost + PnL). 
    //           Balance was reduced by Cost. So Equity = (InitialCash - Cost) + (Cost + PnL) = InitialCash + PnL.
    // For Short: Equity = Cash - Liability.
    //            Balance was increased by EntryPrice.
    //            Liability = CurrentPrice.
    //            Equity = (InitialCash + Entry) - Current = InitialCash + (Entry - Current).
    //            This matches InitialCash + PnL.
    // Correct.
    // However, my `balance` variable is tracking the "Cash Account".
    // Long Entry: Balance goes down.
    // Short Entry: Balance goes up.
    // So Equity is simply Balance + (Inventory * CurrentPrice)?
    // If Inventory is negative (Short -1): Balance + (-1 * Price) = Balance - Price.
    // Example Short: Start 1000. Sell 1 @ 100. Balance 1100. Price 110. Equity = 1100 - 110 = 990. Loss 10.
    // Example Short: Start 1000. Sell 1 @ 100. Balance 1100. Price 90. Equity = 1100 - 90 = 1010. Profit 10.
    // Formula holds: Equity = Balance + (Inventory * Price)
    
    const currentEquity = balance + (inventory * price);
    
    if (currentEquity > maxEquity) maxEquity = currentEquity;
    if (currentEquity < minEquity) minEquity = currentEquity;

    equityCurve.push({
      step: i,
      price: price,
      equity: currentEquity,
      balance: balance,
      inventory: inventory,
      unrealizedPnL: floatingPnL
    });
  }

  // Final Metrics
  const finalStep = equityCurve[equityCurve.length - 1];
  const totalReturn = finalStep.equity - grid.initialCapital;
  const totalReturnPercent = (totalReturn / grid.initialCapital) * 100;
  
  let peak = -Infinity;
  let maxDD = 0;
  for (const point of equityCurve) {
    if (point.equity > peak) peak = point.equity;
    const dd = peak - point.equity;
    if (dd > maxDD) maxDD = dd;
  }
  const maxDDPercent = peak > 0 ? (maxDD / peak) * 100 : 0;
  const winningTrades = trades.filter(t => t.realizedPnL > 0).length;

  return {
    pricePath: priceTicks,
    equityCurve,
    trades,
    activePositions,
    gridLevels,
    metrics: {
      totalReturn,
      totalReturnPercent,
      maxDrawdown: maxDD,
      maxDrawdownPercent: maxDDPercent,
      totalTrades: trades.length,
      winningTrades,
      finalBalance: balance,
      finalEquity: finalStep.equity,
      profitFactor: 0, // To implement properly if needed
      gridProfit,
      floatingPnL: finalStep.unrealizedPnL,
      activePositionCount: activePositions.length,
      avgBuyPrice: getWeightedAvgEntry()
    }
  };
};

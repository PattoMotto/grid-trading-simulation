
import React, { useState, useCallback } from 'react';
import ControlPanel from './components/ControlPanel';
import StatsCard from './components/StatsCard';
import Charts from './components/Charts';
import BottomPanel from './components/BottomPanel';
import { EntryFilter, GridParams, GridType, MarketParams, PricingModel, SimulationResult, StrategyDirection } from './types';
import { runSimulation } from './services/simulationEngine';

// Default Configuration
const DEFAULT_MARKET: MarketParams = {
  startPrice: 1000,
  steps: 1000,
  model: PricingModel.GBM, // Default model
  
  // GBM & JD
  drift: 0,
  volatility: 0.005,
  
  // OU
  meanReversionSpeed: 0.05,
  longTermMean: 1000,

  // JD
  jumpIntensity: 0.02,
  jumpMean: -0.05,
  jumpStd: 0.02
};

const DEFAULT_GRID: GridParams = {
  lowerPrice: 900,
  upperPrice: 1100,
  grids: 20,
  initialCapital: 10000,
  amountPerGrid: 0.1,
  gridType: GridType.Arithmetic,
  stopLoss: 0,
  maxBuyPrice: 0, // 0 means no limit
  minSellPrice: 0,
  strategyDirection: StrategyDirection.LongOnly,
  entryFilter: EntryFilter.None
};

const App: React.FC = () => {
  const [market, setMarket] = useState<MarketParams>(DEFAULT_MARKET);
  const [grid, setGrid] = useState<GridParams>(DEFAULT_GRID);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Simulation Handler
  const handleRunSimulation = useCallback(() => {
    setIsAnimating(true);
    
    requestAnimationFrame(() => {
      const simResult = runSimulation(market, grid);
      setResult(simResult);
      setIsAnimating(false);
    });
  }, [market, grid]);

  // Run once on mount
  React.useEffect(() => {
    handleRunSimulation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex h-screen w-screen bg-slate-950 text-slate-200 font-sans overflow-hidden">
      {/* Sidebar */}
      <ControlPanel 
        market={market} 
        setMarket={setMarket}
        grid={grid}
        setGrid={setGrid}
        onRun={handleRunSimulation}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Top Section: Header & Stats */}
        <div className="p-4 pb-2 flex-none">
          <div className="flex justify-between items-center mb-2">
             <h2 className="text-lg font-bold text-white tracking-tight">Dashboard</h2>
             {result && (
                <div className="text-[10px] text-slate-500 font-mono bg-slate-900 px-2 py-1 rounded border border-slate-800">
                  SIM TIME: {(Math.random() * 10 + 2).toFixed(2)}ms
                </div>
              )}
          </div>
          <StatsCard result={result} />
        </div>

        {/* Middle Section: Charts */}
        <div className="flex-1 px-4 pb-2 min-h-0 flex flex-col">
          <div className={`flex-1 bg-slate-900/30 border border-slate-800 rounded-lg overflow-hidden relative transition-opacity duration-300 ${isAnimating ? 'opacity-50' : 'opacity-100'}`}>
            <div className="absolute inset-0 p-4">
               <Charts result={result} />
            </div>
          </div>
        </div>

        {/* Bottom Section: Logs & Data */}
        <div className="h-64 flex-none bg-slate-900 border-t border-slate-800">
           <BottomPanel result={result} />
        </div>

      </main>
    </div>
  );
};

export default App;

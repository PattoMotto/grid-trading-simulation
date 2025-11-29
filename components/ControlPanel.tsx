
import React from 'react';
import { EntryFilter, GridParams, GridType, MarketParams, PricingModel, StrategyDirection } from '../types';
import { Play, Activity, TrendingUp, TrendingDown, Layers, GitBranch, Sliders, Compass, Filter, Zap, Minus } from 'lucide-react';

interface Props {
  market: MarketParams;
  setMarket: React.Dispatch<React.SetStateAction<MarketParams>>;
  grid: GridParams;
  setGrid: React.Dispatch<React.SetStateAction<GridParams>>;
  onRun: () => void;
}

const ControlPanel: React.FC<Props> = ({ market, setMarket, grid, setGrid, onRun }) => {
  
  const handleMarketChange = (field: keyof MarketParams, value: number | string) => {
    setMarket(prev => ({ ...prev, [field]: value }));
  };

  const handleGridChange = (field: keyof GridParams, value: any) => {
    setGrid(prev => ({ ...prev, [field]: value }));
  };

  const applyPreset = (type: 'UP' | 'DOWN' | 'SIDEWAYS' | 'VOLATILE') => {
    // Switch to GBM for standard trend/volatility simulation as it handles drift natively
    const baseParams = { ...market, model: PricingModel.GBM };
    
    switch(type) {
      case 'UP':
        setMarket({ ...baseParams, drift: 0.0008, volatility: 0.008 });
        break;
      case 'DOWN':
        setMarket({ ...baseParams, drift: -0.0008, volatility: 0.008 });
        break;
      case 'SIDEWAYS':
        setMarket({ ...baseParams, drift: 0, volatility: 0.005 });
        break;
      case 'VOLATILE':
        // High volatility, no trend
        setMarket({ ...baseParams, drift: 0, volatility: 0.02 });
        break;
    }
  };

  return (
    <div className="w-full lg:w-80 flex-shrink-0 bg-slate-900 border-r border-slate-800 h-full overflow-y-auto p-4 custom-scrollbar">
      <div className="flex items-center space-x-2 mb-6 text-emerald-400">
        <Activity size={24} />
        <h1 className="text-xl font-bold tracking-tight">GRID Sim</h1>
      </div>

      {/* Market Config */}
      <div className="mb-6 border-b border-slate-800 pb-6">
        <div className="flex items-center justify-between mb-3 text-slate-300">
          <div className="flex items-center space-x-2">
            <TrendingUp size={18} />
            <h2 className="font-semibold">Market Generator</h2>
          </div>
        </div>

        {/* Quick Scenarios */}
        <div className="mb-4">
           <label className="block text-[10px] text-slate-400 mb-2 uppercase tracking-wider">Quick Scenarios</label>
           <div className="grid grid-cols-2 gap-2">
             <button 
               onClick={() => applyPreset('UP')}
               className="flex items-center justify-center space-x-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded py-2 text-xs text-emerald-400 transition-colors"
             >
               <TrendingUp size={12} />
               <span>Uptrend</span>
             </button>
             <button 
               onClick={() => applyPreset('DOWN')}
               className="flex items-center justify-center space-x-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded py-2 text-xs text-rose-400 transition-colors"
             >
               <TrendingDown size={12} />
               <span>Downtrend</span>
             </button>
             <button 
               onClick={() => applyPreset('SIDEWAYS')}
               className="flex items-center justify-center space-x-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded py-2 text-xs text-blue-400 transition-colors"
             >
               <Minus size={12} />
               <span>Sideways</span>
             </button>
             <button 
               onClick={() => applyPreset('VOLATILE')}
               className="flex items-center justify-center space-x-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded py-2 text-xs text-amber-400 transition-colors"
             >
               <Zap size={12} />
               <span>Volatile</span>
             </button>
           </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] text-slate-400 mb-1 uppercase tracking-wider">Pricing Model</label>
            <select 
              value={market.model}
              onChange={(e) => handleMarketChange('model', e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value={PricingModel.GBM}>Geometric Brownian Motion</option>
              <option value={PricingModel.OU}>Ornstein-Uhlenbeck (Mean Rev)</option>
              <option value={PricingModel.JD}>Jump Diffusion</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] text-slate-400 mb-1 uppercase tracking-wider">Start Price</label>
            <input 
              type="number" 
              value={market.startPrice}
              onChange={(e) => handleMarketChange('startPrice', parseFloat(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {(market.model === PricingModel.GBM || market.model === PricingModel.JD) && (
            <div>
              <label className="block text-[10px] text-slate-400 mb-1 uppercase tracking-wider">
                Trend (Drift)
              </label>
              <input 
                type="range" 
                min="-0.002" 
                max="0.002" 
                step="0.0001"
                value={market.drift}
                onChange={(e) => handleMarketChange('drift', parseFloat(e.target.value))}
                className="w-full accent-emerald-500"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>Bearish</span>
                <span className="text-slate-300 font-mono">{market.drift.toFixed(4)}</span>
                <span>Bullish</span>
              </div>
            </div>
          )}

          {market.model === PricingModel.OU && (
            <>
              <div>
                <label className="block text-[10px] text-slate-400 mb-1 uppercase tracking-wider">Long Term Mean</label>
                <input 
                  type="number" 
                  value={market.longTermMean}
                  onChange={(e) => handleMarketChange('longTermMean', parseFloat(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 mb-1 uppercase tracking-wider">Reversion Speed</label>
                <input 
                  type="range" 
                  min="0.001" 
                  max="0.1" 
                  step="0.001"
                  value={market.meanReversionSpeed}
                  onChange={(e) => handleMarketChange('meanReversionSpeed', parseFloat(e.target.value))}
                  className="w-full accent-emerald-500"
                />
                <div className="text-right text-xs text-slate-500">{market.meanReversionSpeed.toFixed(3)}</div>
              </div>
            </>
          )}

          <div>
            <label className="block text-[10px] text-slate-400 mb-1 uppercase tracking-wider">
              Volatility (Noise)
            </label>
            <input 
              type="range" 
              min="0.0001" 
              max="0.02" 
              step="0.0001"
              value={market.volatility}
              onChange={(e) => handleMarketChange('volatility', parseFloat(e.target.value))}
              className="w-full accent-emerald-500"
            />
            <div className="text-right text-xs text-slate-500">{(market.volatility * 100).toFixed(2)}% / step</div>
          </div>

          {market.model === PricingModel.JD && (
            <div className="p-3 bg-slate-800/50 rounded border border-slate-700 space-y-3">
               <div className="flex items-center space-x-1 text-amber-400 mb-1">
                 <GitBranch size={14} />
                 <span className="text-[10px] font-semibold uppercase tracking-wider">Jump Settings</span>
               </div>
               <div>
                <label className="block text-[10px] text-slate-400 mb-1">Jump Intensity (Prob)</label>
                <input 
                  type="range" min="0" max="0.1" step="0.001"
                  value={market.jumpIntensity}
                  onChange={(e) => handleMarketChange('jumpIntensity', parseFloat(e.target.value))}
                  className="w-full accent-amber-500 h-1"
                />
                 <div className="text-right text-[10px] text-slate-500">{(market.jumpIntensity*100).toFixed(1)}%</div>
               </div>
               <div>
                <label className="block text-[10px] text-slate-400 mb-1">Jump Mean Size (%)</label>
                <input 
                  type="range" min="-0.1" max="0.1" step="0.005"
                  value={market.jumpMean}
                  onChange={(e) => handleMarketChange('jumpMean', parseFloat(e.target.value))}
                  className="w-full accent-amber-500 h-1"
                />
                 <div className="text-right text-[10px] text-slate-500">{(market.jumpMean*100).toFixed(1)}%</div>
               </div>
            </div>
          )}

          <div>
            <label className="block text-[10px] text-slate-400 mb-1 uppercase tracking-wider">Steps (Ticks)</label>
            <select 
              value={market.steps}
              onChange={(e) => handleMarketChange('steps', parseInt(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value={500}>500 (Short)</option>
              <option value={1000}>1000 (Medium)</option>
              <option value={5000}>5000 (Long)</option>
              <option value={10000}>10000 (Ultra)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Strategy Controls */}
      <div className="mb-6 border-b border-slate-800 pb-6">
        <div className="flex items-center space-x-2 mb-3 text-slate-300">
          <Compass size={18} />
          <h2 className="font-semibold">Strategy Controls</h2>
        </div>
        <div className="space-y-3">
            
            {/* Direction */}
            <div>
                <label className="block text-[10px] text-slate-400 mb-1 uppercase tracking-wider">Trading Mode</label>
                <select 
                  value={grid.strategyDirection}
                  onChange={(e) => handleGridChange('strategyDirection', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-emerald-400 focus:outline-none focus:border-emerald-500"
                >
                  <option value={StrategyDirection.LongOnly}>Long Only (Classic)</option>
                  <option value={StrategyDirection.ShortOnly}>Short Only</option>
                  <option value={StrategyDirection.Neutral}>Neutral (Both)</option>
                </select>
            </div>

            {/* Filters */}
            <div>
                <label className="flex items-center space-x-1 text-[10px] text-slate-400 mb-1 uppercase tracking-wider">
                   <Filter size={10} />
                   <span>Smart Filter</span>
                </label>
                <select 
                  value={grid.entryFilter}
                  onChange={(e) => handleGridChange('entryFilter', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-amber-400 focus:outline-none focus:border-amber-500"
                >
                  <option value={EntryFilter.None}>No Filter</option>
                  <option value={EntryFilter.Trend}>Trend Following (SMA)</option>
                  <option value={EntryFilter.RSI}>Mean Reversion (RSI)</option>
                </select>
                <div className="text-[10px] text-slate-500 mt-1 px-1">
                   {grid.entryFilter === EntryFilter.None && "All signals executed."}
                   {grid.entryFilter === EntryFilter.Trend && "Only trades aligned with SMA50 trend."}
                   {grid.entryFilter === EntryFilter.RSI && "Only buys oversold / sells overbought."}
                </div>
            </div>

        </div>
      </div>

      {/* Strategy Triggers */}
      <div className="mb-6 border-b border-slate-800 pb-6">
        <div className="flex items-center space-x-2 mb-3 text-slate-300">
          <Sliders size={18} />
          <h2 className="font-semibold">Triggers</h2>
        </div>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between mb-1">
              <label className="text-[10px] text-emerald-400 uppercase tracking-wider">Max Buy Price</label>
              <span className="text-[10px] text-emerald-400">{grid.maxBuyPrice || '∞'}</span>
            </div>
            <input 
              type="number" 
              placeholder="No Limit"
              value={grid.maxBuyPrice || ''}
              onChange={(e) => handleGridChange('maxBuyPrice', parseFloat(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm text-emerald-400 placeholder-slate-600"
            />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <label className="text-[10px] text-rose-400 uppercase tracking-wider">Min Sell Price</label>
              <span className="text-[10px] text-rose-400">{grid.minSellPrice || '0'}</span>
            </div>
            <input 
              type="number" 
              placeholder="No Limit"
              value={grid.minSellPrice || ''}
              onChange={(e) => handleGridChange('minSellPrice', parseFloat(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm text-rose-400 placeholder-slate-600"
            />
          </div>
        </div>
      </div>

      {/* Grid Config */}
      <div className="mb-8">
        <div className="flex items-center space-x-2 mb-3 text-slate-300">
          <Layers size={18} />
          <h2 className="font-semibold">Grid Structure</h2>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] text-slate-400 mb-1 uppercase tracking-wider">Lower</label>
              <input 
                type="number" 
                value={grid.lowerPrice}
                onChange={(e) => handleGridChange('lowerPrice', parseFloat(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 mb-1 uppercase tracking-wider">Upper</label>
              <input 
                type="number" 
                value={grid.upperPrice}
                onChange={(e) => handleGridChange('upperPrice', parseFloat(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-slate-400 mb-1 uppercase tracking-wider">Grid Levels</label>
            <input 
              type="number"
              min="2"
              max="200"
              step="1"
              value={grid.grids}
              onChange={(e) => handleGridChange('grids', parseInt(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200"
            />
          </div>

           <div>
            <label className="block text-[10px] text-slate-400 mb-1 uppercase tracking-wider">Grid Type</label>
            <div className="flex space-x-2 bg-slate-800 p-1 rounded border border-slate-700">
              <button 
                onClick={() => handleGridChange('gridType', GridType.Arithmetic)}
                className={`flex-1 py-1 text-[10px] rounded uppercase font-bold tracking-wider ${grid.gridType === GridType.Arithmetic ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Arith
              </button>
              <button 
                onClick={() => handleGridChange('gridType', GridType.Geometric)}
                className={`flex-1 py-1 text-[10px] rounded uppercase font-bold tracking-wider ${grid.gridType === GridType.Geometric ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Geom
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
             <div>
              <label className="block text-[10px] text-slate-400 mb-1 uppercase tracking-wider">Capital ($)</label>
              <input 
                type="number" 
                value={grid.initialCapital}
                onChange={(e) => handleGridChange('initialCapital', parseFloat(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 mb-1 uppercase tracking-wider">Lot Size</label>
              <input 
                type="number" 
                value={grid.amountPerGrid}
                onChange={(e) => handleGridChange('amountPerGrid', parseFloat(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-slate-400 mb-1 uppercase tracking-wider">Stop Loss</label>
            <input 
              type="number" 
              value={grid.stopLoss}
              onChange={(e) => handleGridChange('stopLoss', parseFloat(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200 border-l-4 border-l-rose-500"
            />
          </div>
        </div>
      </div>

      <button 
        onClick={onRun}
        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded flex items-center justify-center space-x-2 transition-colors shadow-lg shadow-emerald-900/20"
      >
        <Play size={18} />
        <span>RUN SIMULATION</span>
      </button>
    </div>
  );
};

export default ControlPanel;

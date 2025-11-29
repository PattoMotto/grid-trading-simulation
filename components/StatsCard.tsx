
import React from 'react';
import { SimulationResult } from '../types';
import { TrendingUp, TrendingDown, DollarSign, Activity, AlertTriangle, Briefcase, Layers } from 'lucide-react';

interface Props {
  result: SimulationResult | null;
}

const StatsCard: React.FC<Props> = ({ result }) => {
  if (!result) return null;

  const { metrics } = result;
  const isProfit = metrics.totalReturn >= 0;

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-4">
      
      {/* Left: Portfolio Overview */}
      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-lg p-4 flex justify-between items-center shadow-sm">
        <div className="space-y-1">
           <div className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Balance</div>
           <div className="text-2xl font-bold text-white">${metrics.finalBalance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
        </div>
        
        <div className="space-y-1 text-right">
           <div className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Total P&L</div>
           <div className={`text-2xl font-bold ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isProfit ? '+' : ''}{metrics.totalReturn.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
           </div>
        </div>

        <div className="hidden md:block border-l border-slate-800 h-10 mx-4"></div>

        <div className="hidden md:block space-y-1 text-center">
           <div className="text-xs text-slate-400 uppercase font-semibold tracking-wider">ROI</div>
           <div className={`text-lg font-bold ${isProfit ? 'text-emerald-500' : 'text-rose-500'}`}>
              {metrics.totalReturnPercent.toFixed(2)}%
           </div>
        </div>

        <div className="hidden md:block space-y-1 text-center">
           <div className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Max DD</div>
           <div className="text-lg font-bold text-rose-400">
              {metrics.maxDrawdownPercent.toFixed(2)}%
           </div>
        </div>
      </div>

      {/* Right: Grid Specifics */}
      <div className="flex-none md:w-auto bg-slate-900 border border-slate-800 rounded-lg p-2 md:p-4 flex gap-6 items-center shadow-sm overflow-x-auto">
        
        {/* Grid Profit (Realized) */}
        <div className="min-w-[100px]">
          <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Grid Profit</div>
          <div className="text-xl font-bold text-emerald-400">+{metrics.gridProfit.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
        </div>

        {/* Floating PnL (Unrealized) */}
        <div className="min-w-[100px]">
          <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Floating P&L</div>
          <div className={`text-xl font-bold ${metrics.floatingPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {metrics.floatingPnL.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
          </div>
        </div>

        {/* Positions */}
        <div className="min-w-[80px] bg-slate-800/50 p-2 rounded border border-slate-700 text-center">
          <div className="text-[10px] text-emerald-500 uppercase font-bold mb-0.5">Positions</div>
          <div className="text-lg font-bold text-white">{metrics.activePositionCount}</div>
          <div className="text-[9px] text-slate-500 uppercase">Active</div>
        </div>

        {/* Trades */}
        <div className="min-w-[80px] bg-slate-800/50 p-2 rounded border border-slate-700 text-center">
          <div className="text-[10px] text-rose-500 uppercase font-bold mb-0.5">Filled Exits</div>
          <div className="text-lg font-bold text-white">{metrics.winningTrades}</div>
          <div className="text-[9px] text-slate-500 uppercase">Orders</div>
        </div>

      </div>
    </div>
  );
};

export default StatsCard;

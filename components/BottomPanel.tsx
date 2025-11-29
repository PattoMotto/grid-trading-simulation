
import React, { useState } from 'react';
import { SimulationResult } from '../types';
import { Clock, List, Archive, ArrowDown, ArrowUp } from 'lucide-react';

interface Props {
  result: SimulationResult | null;
}

type Tab = 'LOG' | 'PENDING' | 'POSITIONS';

const BottomPanel: React.FC<Props> = ({ result }) => {
  const [activeTab, setActiveTab] = useState<Tab>('LOG');

  if (!result) return <div className="h-full bg-slate-900 border-t border-slate-800 flex items-center justify-center text-slate-600 text-sm">No simulation data</div>;

  return (
    <div className="h-full flex flex-col bg-slate-900 border-t border-slate-800 text-xs">
      {/* Tabs */}
      <div className="flex border-b border-slate-800">
        <button 
          onClick={() => setActiveTab('LOG')}
          className={`px-4 py-2 flex items-center space-x-2 font-semibold ${activeTab === 'LOG' ? 'text-emerald-400 border-b-2 border-emerald-500 bg-slate-800' : 'text-slate-400 hover:bg-slate-800/50'}`}
        >
          <Clock size={14} />
          <span>TRADE HISTORY</span>
        </button>
        <button 
          onClick={() => setActiveTab('PENDING')}
          className={`px-4 py-2 flex items-center space-x-2 font-semibold ${activeTab === 'PENDING' ? 'text-emerald-400 border-b-2 border-emerald-500 bg-slate-800' : 'text-slate-400 hover:bg-slate-800/50'}`}
        >
          <List size={14} />
          <span>GRID LEVELS (PENDING)</span>
        </button>
        <button 
          onClick={() => setActiveTab('POSITIONS')}
          className={`px-4 py-2 flex items-center space-x-2 font-semibold ${activeTab === 'POSITIONS' ? 'text-emerald-400 border-b-2 border-emerald-500 bg-slate-800' : 'text-slate-400 hover:bg-slate-800/50'}`}
        >
          <Archive size={14} />
          <span>POSITIONS HOLD ({result.activePositions.length})</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-0 bg-slate-950">
        
        {/* Trade Log */}
        {activeTab === 'LOG' && (
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-900 text-slate-500 sticky top-0">
              <tr>
                <th className="p-2 font-medium">Step</th>
                <th className="p-2 font-medium">ID</th>
                <th className="p-2 font-medium">Type</th>
                <th className="p-2 font-medium text-right">Price</th>
                <th className="p-2 font-medium text-right">Amount</th>
                <th className="p-2 font-medium text-right">Realized PnL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {[...result.trades].reverse().map((t) => (
                <tr key={t.id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="p-2 text-slate-400">#{t.step}</td>
                  <td className="p-2 text-slate-500 font-mono">{t.id}</td>
                  <td className="p-2">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${t.type === 'BUY' ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-900' : 'bg-rose-900/30 text-rose-400 border border-rose-900'}`}>
                      {t.type}
                    </span>
                  </td>
                  <td className="p-2 text-right text-slate-200">{t.price.toFixed(2)}</td>
                  <td className="p-2 text-right text-slate-400">{t.amount.toFixed(4)}</td>
                  <td className={`p-2 text-right font-bold ${t.realizedPnL > 0 ? 'text-emerald-400' : t.realizedPnL < 0 ? 'text-rose-400' : 'text-slate-600'}`}>
                    {t.realizedPnL !== 0 ? t.realizedPnL.toFixed(2) : '-'}
                  </td>
                </tr>
              ))}
              {result.trades.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-slate-600">No trades executed yet</td></tr>
              )}
            </tbody>
          </table>
        )}

        {/* Grid Levels (Virtual Pending Orders) */}
        {activeTab === 'PENDING' && (
          <div className="grid grid-cols-4 gap-2 p-4">
             {result.gridLevels.map((level, idx) => (
               <div key={idx} className="bg-slate-900 border border-slate-800 p-2 rounded flex justify-between items-center">
                 <span className="text-slate-500 font-mono">LVL {idx}</span>
                 <span className="text-emerald-400 font-bold">{level.toFixed(2)}</span>
               </div>
             ))}
          </div>
        )}

        {/* Active Positions */}
        {activeTab === 'POSITIONS' && (
           <table className="w-full text-left border-collapse">
           <thead className="bg-slate-900 text-slate-500 sticky top-0">
             <tr>
               <th className="p-2 font-medium">ID</th>
               <th className="p-2 font-medium">Step Opened</th>
               <th className="p-2 font-medium text-right">Entry Price</th>
               <th className="p-2 font-medium text-right">Current Price</th>
               <th className="p-2 font-medium text-right">Amount</th>
               <th className="p-2 font-medium text-right">Floating PnL</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-slate-800">
             {/* Show last 100 positions if too many */}
             {[...result.activePositions].reverse().map((p) => {
               const currentPrice = result.pricePath[result.pricePath.length - 1].price;
               const pnl = (currentPrice - p.entryPrice) * p.amount;
               return (
               <tr key={p.id} className="hover:bg-slate-900/50 transition-colors">
                 <td className="p-2 text-slate-500 font-mono">{p.id}</td>
                 <td className="p-2 text-slate-400">#{p.stepOpened}</td>
                 <td className="p-2 text-right text-slate-200">{p.entryPrice.toFixed(2)}</td>
                 <td className="p-2 text-right text-slate-400">{currentPrice.toFixed(2)}</td>
                 <td className="p-2 text-right text-slate-400">{p.amount.toFixed(4)}</td>
                 <td className={`p-2 text-right font-bold ${pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                   {pnl.toFixed(2)}
                 </td>
               </tr>
             )})}
             {result.activePositions.length === 0 && (
               <tr><td colSpan={6} className="p-8 text-center text-slate-600">No active positions</td></tr>
             )}
           </tbody>
         </table>
        )}

      </div>
    </div>
  );
};

export default BottomPanel;

import React from 'react';
import { SimulationResult } from '../types';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  AreaChart,
  Area,
  Scatter
} from 'recharts';

interface Props {
  result: SimulationResult | null;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-700 p-3 rounded shadow-xl text-xs z-50">
        <p className="text-slate-300 mb-1 font-bold">Step: {label}</p>
        {payload.map((p: any, index: number) => {
          // Skip rendering null values for scatter points in tooltip
          if (p.value === null || p.value === undefined) return null;
          return (
            <p key={index} style={{ color: p.color }}>
              {p.name}: {Number(p.value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          );
        })}
      </div>
    );
  }
  return null;
};

const Charts: React.FC<Props> = ({ result }) => {
  if (!result) {
    return (
      <div className="flex items-center justify-center h-full text-slate-600">
        Run simulation to view data
      </div>
    );
  }

  // Merge Trades into the main data array for robust alignment in ComposedChart
  const chartData = result.pricePath.map((p, i) => {
    const buyTrade = result.trades.find(t => t.step === p.step && t.type === 'BUY');
    const sellTrade = result.trades.find(t => t.step === p.step && t.type === 'SELL');

    return {
      step: p.step,
      price: p.price,
      equity: result.equityCurve[i]?.equity || 0,
      // Scatter points: use null if no trade exists so Recharts skips it
      buyPrice: buyTrade ? buyTrade.price : null,
      sellPrice: sellTrade ? sellTrade.price : null
    };
  });

  // Calculate Price Domain with padding
  const prices = result.pricePath.map(p => p.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  // Add 5% padding
  const padding = (maxPrice - minPrice) * 0.05;
  const yDomain = [minPrice - padding, maxPrice + padding];
  
  // Safety for flat lines
  if (yDomain[0] === yDomain[1]) {
      yDomain[0] -= 10;
      yDomain[1] += 10;
  }

  // Formatters
  const formatYAxis = (val: number) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `${(val / 1000).toFixed(1)}k`;
    return val.toFixed(2);
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      
      {/* Price Chart */}
      <div className="flex-1 bg-slate-800/50 border border-slate-700 rounded-lg p-4 flex flex-col">
        <h3 className="text-sm font-semibold text-slate-300 mb-4">Price Action & Executions</h3>
        <div className="flex-1 min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData}>
              <XAxis 
                dataKey="step" 
                stroke="#475569" 
                tick={{fill: '#64748b', fontSize: 10}}
                tickLine={false}
                minTickGap={30}
              />
              <YAxis 
                domain={yDomain} 
                stroke="#475569"
                tick={{fill: '#64748b', fontSize: 10}}
                tickLine={false}
                width={60}
                tickFormatter={formatYAxis}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Grid Levels */}
              {result.gridLevels.map((level, idx) => (
                <ReferenceLine 
                  key={`grid-${idx}`} 
                  y={level} 
                  stroke="#334155" 
                  strokeDasharray="3 3" 
                  strokeWidth={1}
                  ifOverflow="extendDomain" 
                />
              ))}

              {/* Price Line */}
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke="#f8fafc" 
                strokeWidth={2} 
                dot={false} 
                activeDot={{ r: 4 }}
                name="Price"
                isAnimationActive={false}
              />

              {/* Buy/Sell Markers mapped via dataKey ensures alignment */}
              <Scatter 
                dataKey="buyPrice" 
                name="Buy" 
                fill="#10b981" 
                shape="triangle" 
                legendType="triangle"
                isAnimationActive={false}
              />
              <Scatter 
                dataKey="sellPrice" 
                name="Sell" 
                fill="#f43f5e" 
                shape="triangle" 
                transform="rotate(180) translate(0,0)" 
                legendType="triangle"
                isAnimationActive={false}
              />

            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Equity Chart */}
      <div className="h-48 bg-slate-800/50 border border-slate-700 rounded-lg p-4 flex flex-col">
        <h3 className="text-sm font-semibold text-slate-300 mb-2">Equity Curve</h3>
        <div className="flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="step" hide />
              <YAxis 
                domain={['auto', 'auto']} 
                stroke="#475569"
                tick={{fill: '#64748b', fontSize: 10}}
                width={60}
                tickFormatter={formatYAxis}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="equity" 
                stroke="#3b82f6" 
                fillOpacity={1} 
                fill="url(#colorEquity)" 
                strokeWidth={2}
                name="Equity"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};

export default Charts;
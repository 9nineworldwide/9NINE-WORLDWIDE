import React, { useState } from 'react';
import { FinancialProfile, AssetCategory } from '../types';
import { Card, Badge, ProgressBar } from './shared';
import { CURRENCY_SYMBOL } from '../constants';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { Lock, TrendingUp, ShieldCheck } from 'lucide-react';

interface AnalyticsProps {
  profile: FinancialProfile;
  isPremium: boolean;
}

const Analytics: React.FC<AnalyticsProps> = ({ profile, isPremium }) => {
  const [growthRate, setGrowthRate] = useState(0.08); // 8% default
  
  const totalAssets = profile.assets.reduce((sum, a) => sum + a.value, 0);
  const totalLiabilities = profile.liabilities.reduce((sum, l) => sum + l.outstandingAmount, 0);
  const currentNetWorth = totalAssets - totalLiabilities;
  const liquidAssets = profile.assets.filter(a => a.category === AssetCategory.CASH || a.category === AssetCategory.MUTUAL_FUNDS).reduce((s, a) => s + a.value, 0);
  
  // Projection Logic
  const generateProjections = (years: number) => {
    const data = [];
    const annualContribution = (profile.monthlyIncome - profile.monthlyExpenses) * 12;
    
    for (let i = 0; i <= years; i++) {
      const year = new Date().getFullYear() + i;
      const base = currentNetWorth * Math.pow(1 + 0.08, i) + (annualContribution * ((Math.pow(1 + 0.08, i) - 1) / 0.08));
      const optimistic = currentNetWorth * Math.pow(1 + 0.12, i) + (annualContribution * ((Math.pow(1 + 0.12, i) - 1) / 0.12));
      const conservative = currentNetWorth * Math.pow(1 + 0.05, i) + (annualContribution * ((Math.pow(1 + 0.05, i) - 1) / 0.05));
      
      data.push({
        year,
        Base: Math.round(base),
        Optimistic: Math.round(optimistic),
        Conservative: Math.round(conservative),
      });
    }
    return data;
  };

  const projectionData = generateProjections(10);
  const emergencyFundMonths = liquidAssets / (profile.monthlyExpenses || 1);

  const BlurOverlay = () => (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-10 border border-border rounded-xl">
      <div className="bg-surfaceHighlight p-4 rounded-full mb-3">
        <Lock className="text-yellow-500" size={24} />
      </div>
      <p className="text-white font-medium text-lg">Premium Feature</p>
      <p className="text-textMuted text-sm mt-1">Unlock 20-year deep scenario modelling.</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
       <header>
          <h2 className="text-2xl font-light text-white">Future Intelligence</h2>
          <p className="text-textMuted text-sm mt-1">Projection models based on current trajectory.</p>
       </header>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           
           {/* Emergency Fund Analysis */}
           <Card className="lg:col-span-1">
               <div className="flex items-center gap-2 mb-4">
                   <ShieldCheck className="text-emerald-500" size={20} />
                   <h3 className="text-white font-medium">Safety Net Analysis</h3>
               </div>
               
               <div className="text-center py-6">
                   <div className="text-4xl font-light text-white mb-1">{emergencyFundMonths.toFixed(1)}</div>
                   <div className="text-xs text-textMuted uppercase tracking-wider">Months of Runway</div>
               </div>

               <div className="space-y-4">
                   <div>
                       <div className="flex justify-between text-xs mb-1">
                           <span className="text-textMuted">Liquid Assets</span>
                           <span className="text-white">{CURRENCY_SYMBOL}{liquidAssets.toLocaleString()}</span>
                       </div>
                       <ProgressBar value={emergencyFundMonths} max={12} color={emergencyFundMonths < 6 ? 'bg-orange-500' : 'bg-emerald-500'} />
                       <div className="flex justify-between text-[10px] text-textMuted mt-1">
                           <span>0m</span>
                           <span>Target: 6m</span>
                           <span>12m+</span>
                       </div>
                   </div>
                   <p className="text-xs text-textMuted bg-surfaceHighlight/30 p-3 rounded-lg leading-relaxed">
                       {emergencyFundMonths < 6 
                         ? "⚠️ Warning: Your emergency fund is below the recommended 6 months. Prioritize liquidity." 
                         : "✅ Healthy: You have sufficient liquidity to weather short-term financial shocks."}
                   </p>
               </div>
           </Card>

           {/* Net Worth Projection Chart */}
           <div className="lg:col-span-2 relative">
               {!isPremium && <BlurOverlay />}
               <Card className="h-full flex flex-col">
                   <div className="flex justify-between items-center mb-6">
                       <h3 className="text-white font-medium flex items-center gap-2">
                           <TrendingUp size={20} className="text-white"/> Net Worth Projection (10 Years)
                       </h3>
                       <Badge color="bg-surfaceHighlight">Scenario Modelling</Badge>
                   </div>
                   
                   <div className="flex-1 w-full min-h-[300px]">
                       <ResponsiveContainer width="100%" height="100%">
                           <AreaChart data={projectionData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                               <defs>
                                   <linearGradient id="colorBase" x1="0" y1="0" x2="0" y2="1">
                                       <stop offset="5%" stopColor="#fafafa" stopOpacity={0.2}/>
                                       <stop offset="95%" stopColor="#fafafa" stopOpacity={0}/>
                                   </linearGradient>
                               </defs>
                               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                               <XAxis dataKey="year" stroke="#52525b" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                               <YAxis stroke="#52525b" tick={{fontSize: 12}} tickLine={false} axisLine={false} tickFormatter={(val) => `${(val/10000000).toFixed(1)}Cr`} />
                               <Tooltip 
                                   contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fafafa' }}
                                   formatter={(val: number) => CURRENCY_SYMBOL + val.toLocaleString()}
                               />
                               <Legend verticalAlign="top" height={36} iconType="circle" />
                               
                               <Area type="monotone" dataKey="Optimistic" stroke="#10b981" strokeDasharray="3 3" fill="none" strokeWidth={2} />
                               <Area type="monotone" dataKey="Base" stroke="#fafafa" fill="url(#colorBase)" strokeWidth={2} />
                               <Area type="monotone" dataKey="Conservative" stroke="#ef4444" strokeDasharray="3 3" fill="none" strokeWidth={2} />
                           </AreaChart>
                       </ResponsiveContainer>
                   </div>
                   <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                        <div className="bg-surfaceHighlight/20 p-2 rounded">
                            <div className="text-[10px] text-textMuted uppercase">Conservative (5%)</div>
                            <div className="text-sm font-medium text-white">{CURRENCY_SYMBOL}{(projectionData[10].Conservative / 10000000).toFixed(2)}Cr</div>
                        </div>
                        <div className="bg-surfaceHighlight/50 p-2 rounded border border-white/10">
                            <div className="text-[10px] text-textMuted uppercase">Base (8%)</div>
                            <div className="text-sm font-medium text-white">{CURRENCY_SYMBOL}{(projectionData[10].Base / 10000000).toFixed(2)}Cr</div>
                        </div>
                        <div className="bg-surfaceHighlight/20 p-2 rounded">
                            <div className="text-[10px] text-textMuted uppercase">Optimistic (12%)</div>
                            <div className="text-sm font-medium text-white">{CURRENCY_SYMBOL}{(projectionData[10].Optimistic / 10000000).toFixed(2)}Cr</div>
                        </div>
                   </div>
               </Card>
           </div>
       </div>

       {/* Placeholders for Future Features */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-60">
           <Card className="border-dashed border-zinc-700 bg-transparent flex items-center justify-center h-32">
               <p className="text-textMuted text-sm uppercase tracking-widest">Portfolio Rebalancing — Coming Soon</p>
           </Card>
           <Card className="border-dashed border-zinc-700 bg-transparent flex items-center justify-center h-32">
               <p className="text-textMuted text-sm uppercase tracking-widest">RIA Advisory Connect — Coming Soon</p>
           </Card>
       </div>
    </div>
  );
};

export default Analytics;

import React, { useEffect, useState } from 'react';
import { FinancialProfile, AIInsight, AssetCategory } from '../types';
import { Card, Badge, TrendIndicator, ProgressBar } from './shared';
import { CURRENCY_SYMBOL } from '../constants';
import { generateWealthInsights } from '../services/geminiService';
import { Sparkles, ArrowRight, TrendingUp, AlertTriangle, Layers, Lock, Award, CheckCircle, Crown, ShieldCheck, Target, Users } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, RadialBarChart, RadialBar, BarChart, Bar } from 'recharts';

interface DashboardProps {
  profile: FinancialProfile;
  isPremium: boolean;
  setActiveTab: (t: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ profile, isPremium, setActiveTab }) => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(false);

  // --- Calculations ---
  const totalAssets = profile.assets.reduce((sum, a) => sum + a.value, 0);
  const totalLiabilities = profile.liabilities.reduce((sum, l) => sum + l.outstandingAmount, 0);
  const netWorth = totalAssets - totalLiabilities;
  const previousNetWorth = profile.netWorthHistory[profile.netWorthHistory.length - 2]?.value || netWorth * 0.98;
  const netWorthChange = netWorth - previousNetWorth;
  const netWorthChangePercent = previousNetWorth !== 0 ? (netWorthChange / previousNetWorth) * 100 : 0;
  
  // Emergency Fund
  const liquidAssets = profile.assets.filter(a => a.category === AssetCategory.CASH || a.category === AssetCategory.MUTUAL_FUNDS).reduce((s, a) => s + a.value, 0);
  const emergencyFundMonths = liquidAssets / (profile.monthlyExpenses || 1);

  // Wealth Score Logic (0-100)
  const calculateWealthScore = () => {
    let score = 50;
    if (emergencyFundMonths > 6) score += 15;
    const debtRatio = totalLiabilities / totalAssets;
    if (debtRatio < 0.3) score += 20;
    else if (debtRatio > 0.6) score -= 15;
    if ((profile.monthlyIncome - profile.monthlyExpenses) / profile.monthlyIncome > 0.3) score += 15;
    return Math.min(100, Math.max(0, Math.round(score)));
  };
  const wealthScore = calculateWealthScore();

  // Chart Data Preparation
  const assetDistribution = profile.assets.reduce((acc, asset) => {
    const existing = acc.find(x => x.name === asset.category);
    if (existing) existing.value += asset.value;
    else acc.push({ name: asset.category, value: asset.value });
    return acc;
  }, [] as { name: string; value: number }[]);

  const liabilityDistribution = profile.liabilities.reduce((acc, liab) => {
    const existing = acc.find(x => x.name === liab.category);
    if (existing) existing.value += liab.outstandingAmount;
    else acc.push({ name: liab.category, value: liab.outstandingAmount });
    return acc;
  }, [] as { name: string; value: number }[]);

  const COLORS = ['#fafafa', '#a1a1aa', '#71717a', '#3f3f46', '#27272a'];
  const SCORE_COLOR = wealthScore > 75 ? '#10b981' : wealthScore > 50 ? '#f59e0b' : '#ef4444';

  useEffect(() => {
    const fetchAI = async () => {
      setLoadingInsights(true);
      const aiData = await generateWealthInsights(profile, 'dashboard');
      setInsights(aiData);
      setLoadingInsights(false);
    };
    fetchAI();
  }, [profile]);

  // Peer Comparison Data (Mock logic based on age)
  const userAge = profile.userAge || 25;
  const peerAvg = (userAge * 200000) * (Math.random() * 0.5 + 0.8); // Rough calc for demo
  const peerPercentage = (netWorth / peerAvg) * 100;

  // Gamification / Milestones
  const milestones = [
    { label: '₹25L Club', value: 2500000, icon: Award, sub: "Foundation" },
    { label: '₹50L Club', value: 5000000, icon: Layers, sub: "Builder" },
    { label: '₹1 Cr Club', value: 10000000, icon: Crown, sub: "High Net Worth" },
    { label: '₹5 Cr Club', value: 50000000, icon: Sparkles, sub: "Ultra HNI" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* --- TOP ROW: NET WORTH & SCORE --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Net Worth & Trend */}
        <Card onClick={() => setActiveTab('analytics')} className="lg:col-span-2 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4 z-10 relative">
            <div>
              <p className="text-textMuted text-xs font-semibold uppercase tracking-widest">Net Worth</p>
              <h1 className="text-4xl text-white font-light tracking-tight mt-1">
                {CURRENCY_SYMBOL}{netWorth.toLocaleString()}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                 <TrendIndicator value={netWorthChange} />
                 <span className={`text-xs ${netWorthChange >= 0 ? 'text-emerald-500' : 'text-risk'}`}>
                    ({netWorthChangePercent.toFixed(2)}%)
                 </span>
                 <span className="text-textMuted text-xs">vs last month</span>
              </div>
            </div>
            <div className="bg-surfaceHighlight/50 p-2 rounded-lg group-hover:bg-surfaceHighlight transition-colors">
               <TrendingUp size={20} className="text-white" />
            </div>
          </div>
          
          <div className="h-48 w-full -ml-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={profile.netWorthHistory}>
                <defs>
                  <linearGradient id="colorNetWorth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#fafafa" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#fafafa" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                <XAxis dataKey="date" hide />
                <YAxis hide domain={['dataMin', 'dataMax']} />
                <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fafafa', borderRadius: '8px' }}
                    itemStyle={{ color: '#fafafa' }}
                    formatter={(value: number) => [CURRENCY_SYMBOL + value.toLocaleString(), "Net Worth"]}
                />
                <Area type="monotone" dataKey="value" stroke="#fafafa" strokeWidth={2} fillOpacity={1} fill="url(#colorNetWorth)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Wealth Score Gauge */}
        <Card onClick={() => setActiveTab('analytics')} className="flex flex-col justify-center items-center relative">
          <div className="absolute top-5 left-5">
             <p className="text-textMuted text-xs font-semibold uppercase tracking-widest">Wealth Score</p>
          </div>
          <div className="relative w-full h-48 flex items-center justify-center mt-4">
             <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart 
                    innerRadius="80%" 
                    outerRadius="100%" 
                    barSize={10} 
                    data={[{ name: 'Score', value: wealthScore, fill: SCORE_COLOR }]} 
                    startAngle={180} 
                    endAngle={0}
                >
                    <RadialBar background dataKey="value" cornerRadius={30} />
                </RadialBarChart>
             </ResponsiveContainer>
             <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
                 <span className="text-5xl font-light text-white" style={{ color: SCORE_COLOR }}>{wealthScore}</span>
                 <span className="text-xs text-textMuted mt-1">out of 100</span>
             </div>
          </div>
          <div className="w-full px-6 pb-2">
             <div className="flex justify-between text-[10px] text-textMuted uppercase tracking-wider mb-1">
                <span>Risk</span>
                <span>Stability</span>
                <span>Wealth</span>
             </div>
             <div className="w-full h-1 bg-surfaceHighlight rounded-full overflow-hidden flex">
                <div className="w-1/3 bg-risk/40"></div>
                <div className="w-1/3 bg-orange-500/40"></div>
                <div className="w-1/3 bg-emerald-500/40"></div>
             </div>
          </div>
        </Card>
      </div>

      {/* --- MIDDLE ROW: EMERGENCY FUND & GAMIFICATION & PEER COMPARE --- */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Emergency Fund Widget */}
          <Card onClick={() => setActiveTab('analytics')} className="group lg:col-span-1">
             <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className={emergencyFundMonths < 6 ? "text-orange-500" : "text-emerald-500"} size={20} />
                <h3 className="text-white font-medium">Emergency Fund</h3>
             </div>
             <div className="mb-4">
                 <div className="flex justify-between items-end mb-1">
                     <span className="text-2xl font-light text-white">{emergencyFundMonths.toFixed(1)} <span className="text-sm text-textMuted">Months</span></span>
                     <span className="text-xs text-textMuted">Target: 6 Months</span>
                 </div>
                 <ProgressBar value={emergencyFundMonths} max={6} color={emergencyFundMonths < 6 ? 'bg-orange-500' : 'bg-emerald-500'} />
             </div>
             <p className="text-xs text-textMuted leading-relaxed">
                 {emergencyFundMonths < 6 
                     ? "Your safety net is below recommended levels. Focus on liquidity." 
                     : "Great job! Your financial foundation is secure."}
             </p>
          </Card>

           {/* Peer Comparison Widget */}
           <Card className="lg:col-span-1">
               <div className="flex items-center gap-2 mb-4">
                   <Users className="text-white" size={20} />
                   <h3 className="text-white font-medium">Peer Benchmark</h3>
               </div>
               <div className="space-y-4">
                   <p className="text-xs text-textMuted">Comparing to others aged {userAge} in your region.</p>
                   
                   <div>
                       <div className="flex justify-between items-end mb-1">
                           <span className="text-sm font-medium text-white">You</span>
                           <span className="text-xs text-white">{CURRENCY_SYMBOL}{(netWorth/100000).toFixed(1)}L</span>
                       </div>
                       <ProgressBar value={netWorth} max={Math.max(netWorth, peerAvg)} color="bg-white" />
                   </div>

                   <div>
                       <div className="flex justify-between items-end mb-1">
                           <span className="text-sm font-medium text-textMuted">Peer Avg</span>
                           <span className="text-xs text-textMuted">{CURRENCY_SYMBOL}{(peerAvg/100000).toFixed(1)}L</span>
                       </div>
                       <ProgressBar value={peerAvg} max={Math.max(netWorth, peerAvg)} color="bg-zinc-600" />
                   </div>
                   
                   <Badge color={netWorth > peerAvg ? 'bg-emerald-900/20 text-emerald-500' : 'bg-orange-900/20 text-orange-500'}>
                       {netWorth > peerAvg ? 'Top 10% in City' : 'Below Average'}
                   </Badge>
               </div>
           </Card>

           {/* Wealth Status / Gamification */}
           <div className="lg:col-span-2">
               <div className="flex items-center gap-2 mb-3 px-1">
                   <Award size={14} className="text-textMuted" />
                   <span className="text-xs font-semibold text-textMuted uppercase tracking-widest">Wealth Milestones</span>
               </div>
               <div className="overflow-x-auto pb-2 scrollbar-thin">
                   <div className="flex gap-4 min-w-max">
                   {milestones.map((milestone, idx) => {
                       const isUnlocked = netWorth >= milestone.value;
                       const Icon = milestone.icon;
                       return (
                       <div 
                           key={idx}
                           className={`relative overflow-hidden group flex flex-col justify-between p-4 rounded-xl border min-w-[180px] h-[100px] transition-all duration-300
                           ${isUnlocked 
                               ? 'bg-gradient-to-br from-surfaceHighlight to-surface border-white/10 shadow-lg' 
                               : 'bg-surface/30 border-border/50 opacity-60 grayscale'}`}
                       >
                           {isUnlocked && <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />}
                           <div className="flex justify-between items-start">
                               <div className={`p-2 rounded-lg ${isUnlocked ? 'bg-white/10 text-white' : 'bg-surfaceHighlight text-textMuted'}`}>
                                   {isUnlocked ? <Icon size={18} /> : <Lock size={18} />}
                               </div>
                               {isUnlocked && <CheckCircle size={16} className="text-emerald-500" />}
                           </div>
                           <div>
                               <p className={`text-sm font-bold tracking-wide ${isUnlocked ? 'text-white' : 'text-textMuted'}`}>
                                   {milestone.label}
                               </p>
                           </div>
                       </div>
                       )
                   })}
                   </div>
               </div>
           </div>
      </div>
      
      {/* --- ASSETS & LIABILITIES BREAKDOWN --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         
         {/* Assets Breakdown */}
         <Card onClick={() => setActiveTab('assets')} className="group min-h-[300px]">
            <div className="flex justify-between items-center mb-6">
                <div>
                   <p className="text-textMuted text-xs font-semibold uppercase tracking-widest">Assets Structure</p>
                   <p className="text-xl text-white mt-1">{CURRENCY_SYMBOL}{totalAssets.toLocaleString()}</p>
                </div>
                <ArrowRight size={16} className="text-textMuted group-hover:text-white transition-colors" />
            </div>
            <div className="flex items-center">
                <div className="h-40 w-40 flex-shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={assetDistribution} innerRadius={50} outerRadius={70} paddingAngle={2} dataKey="value">
                                {assetDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="ml-6 space-y-2 flex-1">
                    {assetDistribution.slice(0, 4).map((item, index) => (
                        <div key={item.name} className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                <span className="text-textMuted truncate max-w-[100px]">{item.name}</span>
                            </div>
                            <span className="text-white font-medium">{((item.value / totalAssets) * 100).toFixed(0)}%</span>
                        </div>
                    ))}
                    {assetDistribution.length > 4 && <p className="text-xs text-textMuted pl-4">+ {assetDistribution.length - 4} more</p>}
                </div>
            </div>
         </Card>

         {/* Liabilities Breakdown */}
         <Card onClick={() => setActiveTab('liabilities')} className="group min-h-[300px]">
            <div className="flex justify-between items-center mb-6">
                <div>
                   <p className="text-textMuted text-xs font-semibold uppercase tracking-widest">Liabilities & Debt</p>
                   <p className="text-xl text-white mt-1">{CURRENCY_SYMBOL}{totalLiabilities.toLocaleString()}</p>
                </div>
                <ArrowRight size={16} className="text-textMuted group-hover:text-white transition-colors" />
            </div>
            
            <div className="h-40 w-full mb-4">
               <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={liabilityDistribution} layout="vertical" margin={{ left: 0, right: 20 }}>
                       <XAxis type="number" hide />
                       <YAxis type="category" dataKey="name" width={100} tick={{fill: '#a1a1aa', fontSize: 10}} tickLine={false} axisLine={false} />
                       <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fafafa' }} formatter={(val:number) => CURRENCY_SYMBOL + val.toLocaleString()} />
                       <Bar dataKey="value" fill="#3f3f46" radius={[0, 4, 4, 0]} barSize={20} />
                   </BarChart>
               </ResponsiveContainer>
            </div>
            
            <div className="border-t border-border pt-4 mt-2">
               <div className="flex justify-between items-center">
                  <div className="text-xs text-textMuted">Monthly Obligation (EMI)</div>
                  <div className="text-sm text-white font-medium">{CURRENCY_SYMBOL}{profile.liabilities.reduce((s, l) => s + l.monthlyPayment, 0).toLocaleString()}</div>
               </div>
               <div className="flex justify-between items-center mt-2">
                  <div className="text-xs text-textMuted">Debt-to-Asset Ratio</div>
                  <div className={`text-sm font-medium ${totalLiabilities/totalAssets > 0.5 ? 'text-risk' : 'text-emerald-500'}`}>
                      {totalAssets > 0 ? ((totalLiabilities/totalAssets)*100).toFixed(1) : 0}%
                  </div>
               </div>
            </div>
         </Card>
      </div>

      {/* --- BOTTOM ROW: AI INTELLIGENCE --- */}
      <div className="relative">
         {!isPremium && (
             <div className="absolute inset-0 z-20 bg-background/60 backdrop-blur-md flex flex-col items-center justify-center border border-white/5 rounded-xl">
                 <div className="p-4 bg-surfaceHighlight rounded-full mb-4 shadow-xl">
                    <Lock className="text-yellow-500" size={28} />
                 </div>
                 <h3 className="text-xl font-medium text-white mb-2">Premium Intelligence</h3>
                 <p className="text-textMuted text-sm text-center max-w-sm mb-4">
                    Unlock AI-driven wealth strategies, debt avalanche recommendations, and deep anomaly detection.
                 </p>
                 <Badge color="bg-yellow-900/20 text-yellow-500" size="md">Premium Only</Badge>
             </div>
         )}
         
         <div className="flex items-center gap-2 mb-4">
            <Sparkles size={16} className="text-white" />
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Algorithmic Strategies</h2>
         </div>
         <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${!isPremium ? 'opacity-30 pointer-events-none' : ''}`}>
             {loadingInsights ? (
                 [1,2,3].map(i => <Card key={i} className="h-32 animate-pulse bg-surfaceHighlight/20" />)
             ) : (
                insights.length > 0 ? insights.map((insight, idx) => (
                    <Card key={idx} className="bg-gradient-to-br from-surface to-surfaceHighlight/30 border-t-2 border-t-surfaceHighlight hover:border-t-white transition-colors flex flex-col justify-between">
                        <div>
                            <div className="flex items-start justify-between mb-3">
                                <Badge color={insight.severity === 'high' ? 'bg-risk/20 text-risk' : 'bg-surfaceHighlight'}>{insight.type}</Badge>
                                {insight.severity === 'high' && <AlertTriangle size={16} className="text-risk" />}
                            </div>
                            <h4 className="text-white font-medium text-sm mb-2">{insight.title}</h4>
                            <p className="text-xs text-textMuted leading-relaxed mb-4">{insight.content}</p>
                        </div>
                        {/* Actionable Strategy */}
                        <div className="bg-black/40 p-3 rounded border-l-2 border-purple-500">
                             <div className="flex items-center gap-1.5 mb-1">
                                 <Target className="text-purple-400" size={12}/>
                                 <span className="text-[10px] uppercase font-bold text-purple-400">Strategy</span>
                             </div>
                             <p className="text-xs text-white italic">"{insight.suggestion}"</p>
                        </div>
                    </Card>
                )) : <div className="col-span-3 text-center text-textMuted text-sm py-8">System analyzing data points...</div>
             )}
         </div>
      </div>

    </div>
  );
};

export default Dashboard;

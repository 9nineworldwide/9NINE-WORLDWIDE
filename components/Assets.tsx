import React, { useState, useEffect } from 'react';
import { Asset, AssetCategory, FinancialProfile, AIInsight } from '../types';
import { Card, Button, Modal, Badge, TrendIndicator } from './shared';
import { Plus, Trash2, RefreshCcw, PieChart as PieIcon, List, Sparkles, Target, Lock, Loader2 } from 'lucide-react';
import { CURRENCY_SYMBOL } from '../constants';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { generateWealthInsights } from '../services/geminiService';
import { fetchRealMarketPrice } from '../services/marketData';

interface AssetsProps {
  profile: FinancialProfile;
  updateProfile: (p: FinancialProfile) => void;
  isPremium: boolean;
}

const Assets: React.FC<AssetsProps> = ({ profile, updateProfile, isPremium }) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'visual' | 'list'>('list');
  const [newAsset, setNewAsset] = useState<Partial<Asset>>({ category: AssetCategory.CASH });
  const [assetInsights, setAssetInsights] = useState<AIInsight[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const totalAssets = profile.assets.reduce((sum, a) => sum + a.value, 0);

  useEffect(() => {
     // Fetch Asset specific insights
     const fetchAI = async () => {
         setLoadingInsights(true);
         const data = await generateWealthInsights(profile, 'assets');
         setAssetInsights(data);
         setLoadingInsights(false);
     };
     fetchAI();
  }, [profile.assets]); // Re-run if assets change

  // --- Handlers ---
  const handleAddAsset = () => {
    if (!newAsset.name || !newAsset.value) return;
    const asset: Asset = {
      id: Math.random().toString(36).substr(2, 9),
      name: newAsset.name,
      category: newAsset.category as AssetCategory,
      value: Number(newAsset.value),
      costBasis: Number(newAsset.value), // Default to current value if not specified
      quantity: newAsset.quantity ? Number(newAsset.quantity) : undefined,
      ticker: newAsset.ticker,
      lastUpdated: new Date().toISOString(),
      priceSource: 'manual'
    };
    updateProfile({ ...profile, assets: [...profile.assets, asset] });
    setModalOpen(false);
    setNewAsset({ category: AssetCategory.CASH });
  };

  const handleDelete = (id: string) => {
    updateProfile({ ...profile, assets: profile.assets.filter(a => a.id !== id) });
  };

  const refreshPrices = async () => {
    setIsRefreshing(true);
    const updatedAssets = await Promise.all(profile.assets.map(async (asset) => {
        // Only refresh if we have a ticker and it's a market-linked asset
        if (asset.ticker && [AssetCategory.EQUITY, AssetCategory.MUTUAL_FUNDS, AssetCategory.CRYPTO, AssetCategory.FIXED_INCOME].includes(asset.category)) {
             // We use the ticker (which contains SchemeCode for MFs)
             const marketData = await fetchRealMarketPrice(asset.ticker, asset.category);
             
             if (marketData) {
                 return {
                     ...asset,
                     value: marketData.price * (asset.quantity || 1),
                     lastUpdated: new Date().toISOString(),
                     navDate: marketData.date,
                     priceSource: 'api' as const
                 };
             }
        }
        return asset;
    }));
    
    updateProfile({ ...profile, assets: updatedAssets });
    setIsRefreshing(false);
  };

  // --- Chart Data ---
  const data = profile.assets.reduce((acc, asset) => {
    const existing = acc.find(x => x.name === asset.category);
    if (existing) existing.value += asset.value;
    else acc.push({ name: asset.category, value: asset.value });
    return acc;
  }, [] as { name: string; value: number }[]);
  const COLORS = ['#fafafa', '#a1a1aa', '#71717a', '#52525b', '#3f3f46', '#27272a'];

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-light text-white">Assets Portfolio</h2>
          <div className="flex items-center gap-2 mt-1">
             <span className="text-textMuted text-sm">Total Value:</span>
             <span className="text-xl font-medium text-white">{CURRENCY_SYMBOL}{totalAssets.toLocaleString()}</span>
          </div>
        </div>
        <div className="flex gap-2">
            <div className="bg-surface border border-border rounded-lg p-1 flex">
                <button onClick={() => setViewMode('list')} className={`p-2 rounded ${viewMode === 'list' ? 'bg-surfaceHighlight text-white' : 'text-textMuted hover:text-white'}`}><List size={18}/></button>
                <button onClick={() => setViewMode('visual')} className={`p-2 rounded ${viewMode === 'visual' ? 'bg-surfaceHighlight text-white' : 'text-textMuted hover:text-white'}`}><PieIcon size={18}/></button>
            </div>
            <Button variant="outline" onClick={refreshPrices} disabled={isRefreshing} title="Fetch Live Prices">
                {isRefreshing ? <Loader2 className="animate-spin" size={16}/> : <RefreshCcw size={16} />}
            </Button>
            <Button onClick={() => setModalOpen(true)}><Plus size={16} /> Add Asset</Button>
        </div>
      </div>

      {/* Asset Intelligence Section */}
      <div className="relative">
          {!isPremium && (
             <div className="absolute inset-0 z-20 bg-background/60 backdrop-blur-sm flex items-center justify-center border border-white/5 rounded-xl">
                 <div className="flex flex-col items-center">
                    <Lock className="text-yellow-500 mb-2" size={20} />
                    <span className="text-xs font-semibold text-white uppercase tracking-wider">Premium Insight</span>
                 </div>
             </div>
          )}
          <div className={`grid grid-cols-1 gap-4 ${!isPremium ? 'opacity-30' : ''}`}>
               {loadingInsights ? (
                   <Card className="h-20 animate-pulse bg-surfaceHighlight/20 flex items-center justify-center">
                       <span className="text-xs text-textMuted">Analyzing Portfolio Composition...</span>
                   </Card>
               ) : (
                   assetInsights.map((insight, idx) => (
                       <Card key={idx} className="bg-surfaceHighlight/10 border-purple-500/20">
                           <div className="flex items-center gap-2 mb-2">
                               <Sparkles size={14} className="text-purple-400" />
                               <h4 className="text-sm font-medium text-white">{insight.title}</h4>
                           </div>
                           <div className="flex flex-col md:flex-row gap-4 justify-between items-start">
                               <p className="text-xs text-textMuted leading-relaxed max-w-xl">{insight.content}</p>
                               <div className="bg-black/40 p-2 rounded border border-white/10 flex gap-2 items-center min-w-[250px]">
                                   <Target size={14} className="text-purple-400 shrink-0" />
                                   <span className="text-xs text-white italic">"{insight.suggestion}"</span>
                               </div>
                           </div>
                       </Card>
                   ))
               )}
          </div>
      </div>

      {/* Visual Mode */}
      {viewMode === 'visual' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="h-80 flex flex-col justify-center items-center">
                  <h3 className="text-sm text-textMuted uppercase tracking-wider mb-4">Allocation by Category</h3>
                  <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                          <Pie data={data} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                              {data.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />)}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fafafa' }} 
                            formatter={(val: number) => CURRENCY_SYMBOL + val.toLocaleString()}
                          />
                      </PieChart>
                  </ResponsiveContainer>
              </Card>
              <Card className="h-80 overflow-y-auto">
                 <h3 className="text-sm text-textMuted uppercase tracking-wider mb-4">Category Performance</h3>
                 <div className="space-y-4">
                    {data.map((cat, idx) => (
                        <div key={idx}>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-white">{cat.name}</span>
                                <span className="text-textMuted">{((cat.value / totalAssets) * 100).toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-surfaceHighlight h-2 rounded-full overflow-hidden">
                                <div className="h-full bg-white/80" style={{ width: `${(cat.value / totalAssets) * 100}%` }}></div>
                            </div>
                            <div className="text-right mt-1 text-xs text-textMuted">{CURRENCY_SYMBOL}{cat.value.toLocaleString()}</div>
                        </div>
                    ))}
                 </div>
              </Card>
          </div>
      )}

      {/* List Mode (Table) */}
      {viewMode === 'list' && (
          <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
             <div className="overflow-x-auto">
                 <table className="w-full text-left text-sm">
                     <thead>
                         <tr className="bg-surfaceHighlight text-textMuted text-xs uppercase tracking-wider">
                             <th className="p-4 font-medium">Asset Name</th>
                             <th className="p-4 font-medium">Category</th>
                             <th className="p-4 font-medium text-right">Quantity</th>
                             <th className="p-4 font-medium text-right">Cost Basis</th>
                             <th className="p-4 font-medium text-right">Current Value</th>
                             <th className="p-4 font-medium text-right">Gain/Loss</th>
                             <th className="p-4 font-medium text-center">Actions</th>
                         </tr>
                     </thead>
                     <tbody className="divide-y divide-border">
                         {profile.assets.map((asset) => {
                             const gain = asset.value - (asset.costBasis || asset.value);
                             const gainPercent = asset.costBasis ? (gain / asset.costBasis) * 100 : 0;
                             const isMF = asset.category === AssetCategory.MUTUAL_FUNDS;
                             return (
                                 <tr key={asset.id} className="hover:bg-surfaceHighlight/30 transition-colors group">
                                     <td className="p-4">
                                         <div className="font-medium text-white">{asset.name}</div>
                                         <div className="flex flex-col">
                                            {asset.ticker && <span className="text-xs text-textMuted font-mono mt-0.5">{asset.ticker}</span>}
                                            {isMF && asset.navDate && (
                                                <span className="text-[10px] text-emerald-500/80 mt-1">NAV Date: {asset.navDate}</span>
                                            )}
                                         </div>
                                     </td>
                                     <td className="p-4"><Badge>{asset.category}</Badge></td>
                                     <td className="p-4 text-right text-textMuted">{asset.quantity?.toLocaleString() || '-'}</td>
                                     <td className="p-4 text-right text-textMuted">{CURRENCY_SYMBOL}{(asset.costBasis || asset.value).toLocaleString()}</td>
                                     <td className="p-4 text-right font-medium text-white">{CURRENCY_SYMBOL}{asset.value.toLocaleString()}</td>
                                     <td className="p-4 text-right">
                                         <div className={`flex flex-col items-end ${gain >= 0 ? 'text-emerald-500' : 'text-risk'}`}>
                                             <span>{gain >= 0 ? '+' : ''}{CURRENCY_SYMBOL}{Math.abs(gain).toLocaleString()}</span>
                                             <span className="text-xs">{gainPercent.toFixed(2)}%</span>
                                         </div>
                                     </td>
                                     <td className="p-4 text-center">
                                         <button onClick={() => handleDelete(asset.id)} className="text-textMuted hover:text-risk transition-colors p-2">
                                             <Trash2 size={16} />
                                         </button>
                                     </td>
                                 </tr>
                             );
                         })}
                     </tbody>
                 </table>
             </div>
          </div>
      )}

      {/* Add Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title="Add Asset">
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-textMuted mb-1">Asset Name</label>
            <input 
              className="w-full bg-surfaceHighlight border border-border rounded-lg p-3 text-white focus:outline-none focus:border-white transition-colors"
              value={newAsset.name || ''}
              onChange={e => setNewAsset({ ...newAsset, name: e.target.value })}
              placeholder="e.g., Apple Stock"
            />
          </div>
          
          <div>
            <label className="block text-xs text-textMuted mb-1">Category</label>
            <select 
              className="w-full bg-surfaceHighlight border border-border rounded-lg p-3 text-white focus:outline-none"
              value={newAsset.category}
              onChange={e => setNewAsset({ ...newAsset, category: e.target.value as AssetCategory })}
            >
              {Object.values(AssetCategory).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs text-textMuted mb-1">Current Value</label>
                    <input 
                      type="number"
                      className="w-full bg-surfaceHighlight border border-border rounded-lg p-3 text-white focus:outline-none focus:border-white"
                      value={newAsset.value || ''}
                      onChange={e => setNewAsset({ ...newAsset, value: Number(e.target.value) })}
                    />
                </div>
                <div>
                    <label className="block text-xs text-textMuted mb-1">Cost Basis (Optional)</label>
                    <input 
                      type="number"
                      className="w-full bg-surfaceHighlight border border-border rounded-lg p-3 text-white focus:outline-none focus:border-white"
                      value={newAsset.costBasis || ''}
                      onChange={e => setNewAsset({ ...newAsset, costBasis: Number(e.target.value) })}
                    />
                </div>
          </div>

          {(newAsset.category === AssetCategory.EQUITY || newAsset.category === AssetCategory.MUTUAL_FUNDS) && (
             <div className="grid grid-cols-2 gap-4 p-4 bg-surfaceHighlight/30 rounded-lg border border-border">
                <div>
                    <label className="block text-xs text-textMuted mb-1">Ticker / Scheme Code</label>
                    <input 
                    className="w-full bg-surfaceHighlight border border-border rounded-lg p-2 text-white text-sm focus:outline-none focus:border-white font-mono uppercase"
                    value={newAsset.ticker || ''}
                    onChange={e => setNewAsset({ ...newAsset, ticker: e.target.value.toUpperCase() })}
                    placeholder="AAPL or 123456"
                    />
                </div>
                <div>
                    <label className="block text-xs text-textMuted mb-1">Quantity</label>
                    <input 
                    type="number"
                    className="w-full bg-surfaceHighlight border border-border rounded-lg p-2 text-white text-sm focus:outline-none focus:border-white"
                    value={newAsset.quantity || ''}
                    onChange={e => setNewAsset({ ...newAsset, quantity: Number(e.target.value) })}
                    />
                </div>
             </div>
          )}

          <Button onClick={handleAddAsset} className="w-full mt-2">Add Asset to Portfolio</Button>
        </div>
      </Modal>
    </div>
  );
};

export default Assets;
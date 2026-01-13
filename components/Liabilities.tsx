
import React, { useState, useEffect } from 'react';
import { Liability, LiabilityCategory, FinancialProfile, AIInsight } from '../types';
import { Card, Button, Modal, Badge, ProgressBar } from './shared';
import { Plus, Trash2, AlertCircle, Clock, Percent, Sparkles, Target, Lock } from 'lucide-react';
import { CURRENCY_SYMBOL } from '../constants';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { generateWealthInsights } from '../services/geminiService';

interface LiabilitiesProps {
  profile: FinancialProfile;
  updateProfile: (p: FinancialProfile) => void;
  isPremium: boolean;
}

const Liabilities: React.FC<LiabilitiesProps> = ({ profile, updateProfile, isPremium }) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [newLiability, setNewLiability] = useState<Partial<Liability>>({ category: LiabilityCategory.HOME_LOAN });
  const [liabilityInsights, setLiabilityInsights] = useState<AIInsight[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(false);

  const totalLiabilities = profile.liabilities.reduce((sum, l) => sum + l.outstandingAmount, 0);
  const totalAssets = profile.assets.reduce((sum, a) => sum + a.value, 0);
  const totalMonthlyEmi = profile.liabilities.reduce((sum, l) => sum + l.monthlyPayment, 0);
  
  // Ratios
  const debtToAsset = (totalLiabilities / totalAssets) * 100;
  const debtToIncome = (totalMonthlyEmi / profile.monthlyIncome) * 100;

  useEffect(() => {
     // Fetch Liability specific insights
     const fetchAI = async () => {
         setLoadingInsights(true);
         const data = await generateWealthInsights(profile, 'liabilities');
         setLiabilityInsights(data);
         setLoadingInsights(false);
     };
     fetchAI();
  }, [profile.liabilities]);

  const handleAddLiability = () => {
    if (!newLiability.name || !newLiability.outstandingAmount) return;
    const liability: Liability = {
      id: Math.random().toString(36).substr(2, 9),
      name: newLiability.name,
      category: newLiability.category as LiabilityCategory,
      outstandingAmount: Number(newLiability.outstandingAmount),
      interestRate: Number(newLiability.interestRate || 0),
      monthlyPayment: Number(newLiability.monthlyPayment || 0),
      tenureMonthsRemaining: Number(newLiability.tenureMonthsRemaining || 0),
    };
    updateProfile({ ...profile, liabilities: [...profile.liabilities, liability] });
    setModalOpen(false);
    setNewLiability({ category: LiabilityCategory.HOME_LOAN });
  };

  const handleDelete = (id: string) => {
    updateProfile({ ...profile, liabilities: profile.liabilities.filter(l => l.id !== id) });
  };

  const chartData = profile.liabilities.map(l => ({ name: l.name, value: l.outstandingAmount }));

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-light text-white">Liabilities & Debt</h2>
          <p className="text-textMuted text-sm mt-1">Total Outstanding: {CURRENCY_SYMBOL}{totalLiabilities.toLocaleString()}</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus size={16} /> Add Liability
        </Button>
      </header>

      {/* Liability Strategy Section */}
      <div className="relative">
           {!isPremium && (
             <div className="absolute inset-0 z-20 bg-background/60 backdrop-blur-sm flex items-center justify-center border border-white/5 rounded-xl">
                 <div className="flex flex-col items-center">
                    <Lock className="text-yellow-500 mb-2" size={20} />
                    <span className="text-xs font-semibold text-white uppercase tracking-wider">Premium Strategy</span>
                 </div>
             </div>
           )}
           <div className={`grid grid-cols-1 gap-4 ${!isPremium ? 'opacity-30' : ''}`}>
               {loadingInsights ? (
                   <Card className="h-20 animate-pulse bg-surfaceHighlight/20 flex items-center justify-center">
                       <span className="text-xs text-textMuted">Analyzing Debt Structure...</span>
                   </Card>
               ) : (
                   liabilityInsights.map((insight, idx) => (
                       <Card key={idx} className="bg-risk/5 border-risk/20">
                           <div className="flex items-center gap-2 mb-2">
                               <AlertCircle size={14} className="text-risk" />
                               <h4 className="text-sm font-medium text-white">{insight.title}</h4>
                           </div>
                           <div className="flex flex-col md:flex-row gap-4 justify-between items-start">
                               <p className="text-xs text-textMuted leading-relaxed max-w-xl">{insight.content}</p>
                               <div className="bg-black/40 p-2 rounded border border-risk/20 flex gap-2 items-center min-w-[250px]">
                                   <Target size={14} className="text-risk shrink-0" />
                                   <span className="text-xs text-white italic">"{insight.suggestion}"</span>
                               </div>
                           </div>
                       </Card>
                   ))
               )}
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main List */}
          <div className="lg:col-span-2 space-y-4">
              {profile.liabilities.length === 0 && (
                  <div className="text-center py-12 border border-dashed border-border rounded-xl text-textMuted">
                      No liabilities tracked. Good job!
                  </div>
              )}
              {profile.liabilities.map((liability) => (
                  <Card key={liability.id} className="flex flex-col gap-4">
                      <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                                <Badge color="bg-zinc-800">{liability.category}</Badge>
                                <h3 className="text-lg font-medium text-white">{liability.name}</h3>
                          </div>
                          <div className="text-right">
                                <div className="text-2xl font-light text-white">{CURRENCY_SYMBOL}{liability.outstandingAmount.toLocaleString()}</div>
                                <div className="text-xs text-textMuted">Outstanding</div>
                          </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 border-t border-border pt-4">
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase text-textMuted tracking-wider mb-1">Interest Rate</span>
                                <div className="flex items-center gap-1.5 text-sm text-white">
                                    <Percent size={14} className="text-textMuted"/> {liability.interestRate}%
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase text-textMuted tracking-wider mb-1">Monthly EMI</span>
                                <div className="text-sm text-white font-medium">{CURRENCY_SYMBOL}{liability.monthlyPayment.toLocaleString()}</div>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] uppercase text-textMuted tracking-wider mb-1">Action</span>
                                <button onClick={() => handleDelete(liability.id)} className="text-textMuted hover:text-risk transition-colors text-sm flex items-center gap-1">
                                    <Trash2 size={14} /> Remove
                                </button>
                            </div>
                      </div>
                  </Card>
              ))}
          </div>

          {/* Analytics Sidebar */}
          <div className="space-y-6">
              <Card>
                  <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                      <AlertCircle size={16} className="text-white"/> Debt Pressure
                  </h3>
                  
                  <div className="space-y-6">
                      <div>
                          <div className="flex justify-between text-xs mb-1">
                              <span className="text-textMuted">Debt-to-Asset Ratio</span>
                              <span className={debtToAsset > 50 ? 'text-risk' : 'text-emerald-500'}>{debtToAsset.toFixed(1)}%</span>
                          </div>
                          <ProgressBar value={debtToAsset} color={debtToAsset > 50 ? 'bg-risk' : 'bg-emerald-500'} />
                      </div>

                      <div>
                          <div className="flex justify-between text-xs mb-1">
                              <span className="text-textMuted">EMI-to-Income Ratio</span>
                              <span className={debtToIncome > 40 ? 'text-risk' : 'text-emerald-500'}>{debtToIncome.toFixed(1)}%</span>
                          </div>
                          <ProgressBar value={debtToIncome} max={100} color={debtToIncome > 40 ? 'bg-risk' : 'bg-emerald-500'} />
                          <p className="text-[10px] text-textMuted mt-1">Recommended: &lt; 40%</p>
                      </div>
                  </div>
              </Card>

              <Card className="h-64 flex flex-col">
                   <h3 className="text-sm font-medium text-white mb-2">Liability Distribution</h3>
                   <div className="flex-1 w-full min-h-0">
                       <ResponsiveContainer width="100%" height="100%">
                           <BarChart data={chartData} layout="vertical" margin={{left:0, right:20, bottom:0}}>
                               <XAxis type="number" hide />
                               <YAxis type="category" dataKey="name" width={80} tick={{fontSize: 10, fill: '#71717a'}} tickLine={false} axisLine={false} />
                               <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fafafa' }} formatter={(val:number) => CURRENCY_SYMBOL + val.toLocaleString()} />
                               <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.value > 1000000 ? '#7f1d1d' : '#3f3f46'} />
                                    ))}
                               </Bar>
                           </BarChart>
                       </ResponsiveContainer>
                   </div>
              </Card>
          </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title="Add Liability">
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-textMuted mb-1">Liability Name</label>
            <input 
              className="w-full bg-surfaceHighlight border border-border rounded-lg p-3 text-white focus:outline-none focus:border-white"
              value={newLiability.name || ''}
              onChange={e => setNewLiability({ ...newLiability, name: e.target.value })}
              placeholder="e.g., Home Loan"
            />
          </div>
          
          <div>
            <label className="block text-xs text-textMuted mb-1">Category</label>
            <select 
              className="w-full bg-surfaceHighlight border border-border rounded-lg p-3 text-white focus:outline-none"
              value={newLiability.category}
              onChange={e => setNewLiability({ ...newLiability, category: e.target.value as LiabilityCategory })}
            >
              {Object.values(LiabilityCategory).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-xs text-textMuted mb-1">Interest Rate (%)</label>
                <input 
                  type="number"
                  className="w-full bg-surfaceHighlight border border-border rounded-lg p-3 text-white focus:outline-none focus:border-white"
                  value={newLiability.interestRate || ''}
                  onChange={e => setNewLiability({ ...newLiability, interestRate: Number(e.target.value) })}
                />
             </div>
             <div>
                <label className="block text-xs text-textMuted mb-1">Monthly EMI</label>
                <input 
                  type="number"
                  className="w-full bg-surfaceHighlight border border-border rounded-lg p-3 text-white focus:outline-none focus:border-white"
                  value={newLiability.monthlyPayment || ''}
                  onChange={e => setNewLiability({ ...newLiability, monthlyPayment: Number(e.target.value) })}
                />
             </div>
          </div>

          <div>
            <label className="block text-xs text-textMuted mb-1">Total Outstanding ({CURRENCY_SYMBOL})</label>
            <input 
              type="number"
              className="w-full bg-surfaceHighlight border border-border rounded-lg p-3 text-white focus:outline-none focus:border-white"
              value={newLiability.outstandingAmount || ''}
              onChange={e => setNewLiability({ ...newLiability, outstandingAmount: Number(e.target.value) })}
            />
          </div>

          <Button onClick={handleAddLiability} className="w-full mt-4">Add Liability</Button>
        </div>
      </Modal>
    </div>
  );
};

export default Liabilities;

import React, { useState } from 'react';
import { Card, Button, Badge } from './shared';
import { Asset, AssetCategory, Liability, LiabilityCategory, FinancialProfile } from '../types';
import { Plus, Search, Sparkles, Trash2, ArrowRight, Loader2, Landmark, TrendingUp, PieChart, Home, Car, Bitcoin, Coins, CreditCard, Banknote, ShieldAlert, Check, RefreshCcw, Edit2 } from 'lucide-react';
import { identifyAsset } from '../services/geminiService';
import { fetchRealMarketPrice } from '../services/marketData';
import { CURRENCY_SYMBOL } from '../constants';

interface OnboardingProps {
  initialProfile: FinancialProfile;
  onComplete: (profile: FinancialProfile) => void;
}

const ASSET_CLASSES = [
    { id: 'equity', label: 'Stocks', icon: TrendingUp, category: AssetCategory.EQUITY, placeholder: 'Ticker (e.g. RELIANCE)' },
    { id: 'mf', label: 'Mutual Funds', icon: PieChart, category: AssetCategory.MUTUAL_FUNDS, placeholder: 'Fund Name (e.g. SBI Small Cap)' },
    { id: 'crypto', label: 'Crypto', icon: Bitcoin, category: AssetCategory.CRYPTO, placeholder: 'Coin (e.g. BTC, ETH)' },
    { id: 'real_estate', label: 'Real Estate', icon: Home, category: AssetCategory.REAL_ESTATE, placeholder: 'Property Name/Loc' },
    { id: 'gold', label: 'Gold/SGB', icon: Coins, category: AssetCategory.FIXED_INCOME, placeholder: 'Asset Name' },
    { id: 'vehicle', label: 'Vehicles', icon: Car, category: AssetCategory.VEHICLES, placeholder: 'Model Name' },
    { id: 'cash', label: 'Cash/Bank', icon: Banknote, category: AssetCategory.CASH, placeholder: 'Bank Name' },
    { id: 'other', label: 'Other', icon: Sparkles, category: AssetCategory.OTHER, placeholder: 'Description' },
];

const LIABILITY_CLASSES = [
    { id: 'home_loan', label: 'Home Loan', icon: Home, category: LiabilityCategory.HOME_LOAN },
    { id: 'car_loan', label: 'Car Loan', icon: Car, category: LiabilityCategory.CAR_LOAN },
    { id: 'personal', label: 'Personal Loan', icon: Banknote, category: LiabilityCategory.PERSONAL_LOAN },
    { id: 'credit', label: 'Credit Card', icon: CreditCard, category: LiabilityCategory.CREDIT_CARD },
    { id: 'edu', label: 'Education', icon: Landmark, category: LiabilityCategory.EDUCATION_LOAN },
    { id: 'other_liab', label: 'Other Debt', icon: ShieldAlert, category: LiabilityCategory.OTHER },
];

const Onboarding: React.FC<OnboardingProps> = ({ initialProfile, onComplete }) => {
  const [step, setStep] = useState(1);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  
  // Financial Baseline
  const [income, setIncome] = useState<string>('');
  const [expenses, setExpenses] = useState<string>('');
  
  // Asset Adding State
  const [activeAssetClass, setActiveAssetClass] = useState<any>(null);
  const [assetInput, setAssetInput] = useState('');
  const [assetQty, setAssetQty] = useState('1');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Staging for Confirmation
  const [stagedAsset, setStagedAsset] = useState<{
      name: string;
      ticker: string;
      exchange?: string;
      category: AssetCategory;
      unitPrice: number | null;
      quantity: number;
      priceSource: 'api' | 'manual';
      navDate?: string;
  } | null>(null);

  // Liability Adding State
  const [activeLiabClass, setActiveLiabClass] = useState<any>(null);
  const [liabName, setLiabName] = useState('');
  const [liabAmount, setLiabAmount] = useState('');

  // --- Logic ---

  const handleIdentifyAndFetch = async () => {
      if (!assetInput || !activeAssetClass) return;
      setIsProcessing(true);
      setStagedAsset(null);

      // 1. Identify Asset Metadata (Name, Ticker, Category, Exchange) via AI
      const identity = await identifyAsset(assetInput, activeAssetClass.label);
      
      // 2. Fetch Real Market Price (External API)
      const marketData = await fetchRealMarketPrice(identity.ticker, identity.category, identity.exchange);

      setStagedAsset({
          name: identity.name,
          ticker: marketData?.ticker || identity.ticker, // Use returned ticker (SchemeCode) if available
          exchange: identity.exchange,
          category: identity.category as AssetCategory,
          unitPrice: marketData?.price ?? null, // Null implies manual input needed
          quantity: parseFloat(assetQty) || 1,
          priceSource: marketData ? 'api' : 'manual',
          navDate: marketData?.date
      });
      setIsProcessing(false);
  };

  const confirmAddAsset = () => {
      if (!stagedAsset || stagedAsset.unitPrice === null) return;
      
      const totalValue = stagedAsset.unitPrice * stagedAsset.quantity;

      const newAsset: Asset = {
          id: Math.random().toString(36).substr(2, 9),
          name: stagedAsset.name,
          category: stagedAsset.category,
          value: totalValue,
          quantity: stagedAsset.quantity,
          ticker: stagedAsset.ticker,
          lastUpdated: new Date().toISOString(),
          costBasis: totalValue, // Defaulting cost basis
          priceSource: stagedAsset.priceSource,
          navDate: stagedAsset.navDate
      };

      setAssets([...assets, newAsset]);
      // Reset
      setActiveAssetClass(null);
      setAssetInput('');
      setAssetQty('1');
      setStagedAsset(null);
  };

  const confirmAddLiability = () => {
      if (!liabName || !liabAmount || !activeLiabClass) return;
      const newLiab: Liability = {
          id: Math.random().toString(36).substr(2, 9),
          name: liabName,
          category: activeLiabClass.category,
          outstandingAmount: parseFloat(liabAmount),
          interestRate: 10, 
          monthlyPayment: parseFloat(liabAmount) * 0.01 
      };
      setLiabilities([...liabilities, newLiab]);
      setActiveLiabClass(null);
      setLiabName('');
      setLiabAmount('');
  };

  const handleFinish = () => {
      onComplete({
          ...initialProfile,
          assets,
          liabilities,
          monthlyIncome: Number(income),
          monthlyExpenses: Number(expenses),
          netWorthHistory: [] 
      });
  };

  const isMarketLinked = (cat: AssetCategory) => {
      return [AssetCategory.EQUITY, AssetCategory.MUTUAL_FUNDS, AssetCategory.CRYPTO, AssetCategory.FIXED_INCOME].includes(cat);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 selection:bg-white selection:text-black">
       <div className="w-full max-w-5xl">
           
           {/* Progress Header */}
           <div className="flex justify-between items-end mb-8 border-b border-zinc-800 pb-4">
               <div>
                   <h1 className="text-3xl font-light text-white tracking-tight">System Initialization</h1>
                   <p className="text-xs text-zinc-500 mt-1 uppercase tracking-widest">
                       {step === 1 ? 'Step 1: Baseline Metrics' : step === 2 ? 'Step 2: Asset Allocation' : 'Step 3: Liability Structure'}
                   </p>
               </div>
               <div className="flex gap-2">
                   {[1, 2, 3].map(i => (
                       <div key={i} className={`h-1 w-8 rounded-full transition-all duration-300 ${step >= i ? 'bg-white' : 'bg-zinc-800'}`} />
                   ))}
               </div>
           </div>

           {/* STEP 1: INCOME & EXPENSES */}
           {step === 1 && (
               <div className="animate-in slide-in-from-right duration-500">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <Card className="p-8 border-zinc-800 bg-zinc-900/20">
                           <h2 className="text-xl font-medium text-white mb-6">Cash Flow Analysis</h2>
                           <div className="space-y-6">
                               <div className="space-y-2">
                                   <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">Monthly Income</label>
                                   <div className="relative">
                                        <span className="absolute left-4 top-4 text-zinc-500">{CURRENCY_SYMBOL}</span>
                                        <input 
                                            type="number"
                                            className="w-full bg-black border border-zinc-800 rounded-xl p-4 pl-10 text-white text-xl focus:outline-none focus:border-white transition-colors placeholder-zinc-700"
                                            placeholder="0.00"
                                            value={income}
                                            onChange={(e) => setIncome(e.target.value)}
                                        />
                                   </div>
                               </div>
                               <div className="space-y-2">
                                   <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">Monthly Expenses</label>
                                   <div className="relative">
                                        <span className="absolute left-4 top-4 text-zinc-500">{CURRENCY_SYMBOL}</span>
                                        <input 
                                            type="number"
                                            className="w-full bg-black border border-zinc-800 rounded-xl p-4 pl-10 text-white text-xl focus:outline-none focus:border-white transition-colors placeholder-zinc-700"
                                            placeholder="0.00"
                                            value={expenses}
                                            onChange={(e) => setExpenses(e.target.value)}
                                        />
                                   </div>
                               </div>
                           </div>
                       </Card>

                       <div className="flex flex-col justify-center items-start text-zinc-400 text-sm space-y-4">
                            <p>To generate accurate wealth projections, 9NINE needs to understand your monthly surplus velocity.</p>
                            <p>This data remains local and encrypted.</p>
                            <Button 
                                onClick={() => setStep(2)} 
                                className="mt-4 px-8 py-4 text-base w-full md:w-auto bg-white text-black hover:bg-zinc-200"
                                disabled={!income || !expenses}
                            >
                                Proceed to Assets <ArrowRight size={18}/>
                            </Button>
                       </div>
                   </div>
               </div>
           )}

           {/* STEP 2: ASSETS (Category Grid + Identify + Fetch + Fallback) */}
           {step === 2 && (
               <div className="animate-in slide-in-from-right duration-500">
                   <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                       
                       {/* Left: Asset Classes Grid */}
                       <div className="lg:col-span-2 space-y-6">
                           <h2 className="text-xl font-medium text-white">Select Asset Class</h2>
                           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                               {ASSET_CLASSES.map((cls) => (
                                   <button
                                       key={cls.id}
                                       onClick={() => { setActiveAssetClass(cls); setStagedAsset(null); setAssetInput(''); setAssetQty('1'); }}
                                       className={`flex flex-col items-center justify-center gap-3 p-6 rounded-xl border transition-all duration-300 group
                                       ${activeAssetClass?.id === cls.id 
                                           ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)]' 
                                           : 'bg-zinc-900/30 border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-white hover:bg-zinc-800'}`}
                                   >
                                       <cls.icon size={24} className={activeAssetClass?.id === cls.id ? 'text-black' : 'text-zinc-500 group-hover:text-white'} />
                                       <span className="text-xs font-medium uppercase tracking-wider">{cls.label}</span>
                                   </button>
                               ))}
                           </div>

                           {/* Active Asset Input Area */}
                           {activeAssetClass && (
                               <div className="mt-6 p-6 bg-zinc-900/50 border border-zinc-700 rounded-2xl animate-in fade-in slide-in-from-top-4">
                                   <div className="flex justify-between items-center mb-4">
                                       <h3 className="text-lg text-white font-medium flex items-center gap-2">
                                           <activeAssetClass.icon size={20} /> Add {activeAssetClass.label}
                                       </h3>
                                       <button onClick={() => setActiveAssetClass(null)} className="text-xs text-zinc-500 hover:text-white">Cancel</button>
                                   </div>

                                   {!stagedAsset ? (
                                       <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                                            <div className="md:col-span-6 space-y-2">
                                                <label className="text-[10px] text-zinc-400 uppercase tracking-wider">Asset Identity</label>
                                                <input 
                                                        autoFocus
                                                        className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white focus:outline-none focus:border-white"
                                                        placeholder={activeAssetClass.placeholder}
                                                        value={assetInput}
                                                        onChange={(e) => setAssetInput(e.target.value)}
                                                        onKeyDown={(e) => e.key === 'Enter' && handleIdentifyAndFetch()}
                                                />
                                            </div>
                                            
                                            <div className="md:col-span-3 space-y-2">
                                                <label className="text-[10px] text-zinc-400 uppercase tracking-wider">
                                                    {isMarketLinked(activeAssetClass.category) ? 'Quantity' : 'Count'}
                                                </label>
                                                <input 
                                                        type="number"
                                                        className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white focus:outline-none focus:border-white"
                                                        value={assetQty}
                                                        onChange={(e) => setAssetQty(e.target.value)}
                                                        onKeyDown={(e) => e.key === 'Enter' && handleIdentifyAndFetch()}
                                                />
                                            </div>

                                            <div className="md:col-span-3">
                                                <Button 
                                                        onClick={handleIdentifyAndFetch} 
                                                        disabled={isProcessing || !assetInput}
                                                        className="w-full h-[46px]"
                                                    >
                                                        {isProcessing ? <Loader2 className="animate-spin" size={16}/> : 'Fetch Details'}
                                                </Button>
                                            </div>
                                       </div>
                                   ) : (
                                       // Confirmation / Manual Entry Stage
                                       <div className="animate-in fade-in slide-in-from-bottom-2">
                                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                                               <div>
                                                   <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Asset Identified</p>
                                                   <p className="text-lg font-medium text-white">{stagedAsset.name}</p>
                                                   <div className="flex flex-col gap-1">
                                                       <div className="flex gap-2 items-center">
                                                           <p className="text-xs text-zinc-400 font-mono">{stagedAsset.ticker}</p>
                                                           {stagedAsset.exchange && <Badge size="sm" color="bg-zinc-800">{stagedAsset.exchange}</Badge>}
                                                       </div>
                                                       {stagedAsset.navDate && (
                                                           <p className="text-[10px] text-emerald-500">NAV Date: {stagedAsset.navDate}</p>
                                                       )}
                                                   </div>
                                               </div>
                                               <div>
                                                   <div className="flex items-center gap-2 mb-1">
                                                       <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Unit Price / NAV</p>
                                                       {stagedAsset.priceSource === 'api' ? (
                                                           <Badge color="bg-emerald-900/30 text-emerald-500">Live API</Badge>
                                                       ) : (
                                                           <Badge color="bg-orange-900/30 text-orange-500">Manual Input</Badge>
                                                       )}
                                                   </div>
                                                   
                                                   <div className="relative">
                                                       <span className="absolute left-3 top-3.5 text-zinc-500">{CURRENCY_SYMBOL}</span>
                                                       <input 
                                                            type="number"
                                                            autoFocus={stagedAsset.unitPrice === null}
                                                            className={`w-full bg-black border rounded-lg p-3 pl-8 text-white focus:outline-none focus:border-white ${stagedAsset.unitPrice === null ? 'border-orange-500/50' : 'border-zinc-700'}`}
                                                            value={stagedAsset.unitPrice || ''}
                                                            placeholder={stagedAsset.unitPrice === null ? "Enter price manually" : ""}
                                                            onChange={(e) => setStagedAsset({...stagedAsset, unitPrice: parseFloat(e.target.value)})}
                                                       />
                                                   </div>
                                                   {stagedAsset.unitPrice === null && (
                                                       <p className="text-[10px] text-orange-500 mt-1 flex items-center gap-1">
                                                           <ShieldAlert size={10} /> Price temporarily unavailable.
                                                       </p>
                                                   )}
                                               </div>
                                           </div>
                                           
                                           <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl flex justify-between items-center">
                                                <div>
                                                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Total Value</p>
                                                    <p className="text-xl font-bold text-white">
                                                        {CURRENCY_SYMBOL}{((stagedAsset.unitPrice || 0) * stagedAsset.quantity).toLocaleString()}
                                                    </p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button variant="outline" onClick={() => setStagedAsset(null)}>Back</Button>
                                                    <Button onClick={confirmAddAsset} disabled={!stagedAsset.unitPrice} className="bg-white text-black hover:bg-zinc-200">
                                                        Confirm & Add
                                                    </Button>
                                                </div>
                                           </div>
                                       </div>
                                   )}
                               </div>
                           )}
                       </div>

                       {/* Right: Portfolio Preview */}
                       <div className="lg:col-span-1">
                           <div className="bg-zinc-900/20 border border-zinc-800 rounded-xl h-full flex flex-col p-4">
                               <h3 className="text-sm text-zinc-400 uppercase tracking-wider mb-4 font-medium">Your Portfolio</h3>
                               <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[400px]">
                                   {assets.length === 0 ? (
                                       <div className="h-full flex flex-col items-center justify-center text-zinc-600 opacity-50">
                                           <PieChart size={32} strokeWidth={1} />
                                           <p className="text-xs mt-2">No assets added yet</p>
                                       </div>
                                   ) : (
                                       assets.map((asset, idx) => (
                                           <div key={idx} className="bg-black border border-zinc-800 p-3 rounded-lg group hover:border-zinc-600 transition-colors">
                                               <div className="flex justify-between items-start">
                                                   <div>
                                                       <p className="text-sm text-white font-medium truncate w-[120px]">{asset.name}</p>
                                                       <div className="flex items-center gap-2 mt-0.5">
                                                           <Badge size="sm" color="bg-zinc-800">{asset.category}</Badge>
                                                           {asset.priceSource === 'manual' && <span className="text-[8px] text-orange-500">MANUAL</span>}
                                                       </div>
                                                   </div>
                                                   <div className="text-right">
                                                       <p className="text-sm text-white">{CURRENCY_SYMBOL}{asset.value.toLocaleString()}</p>
                                                       <button onClick={() => setAssets(assets.filter((_, i) => i !== idx))} className="text-zinc-600 hover:text-red-500 mt-1">
                                                           <Trash2 size={14} />
                                                       </button>
                                                   </div>
                                               </div>
                                           </div>
                                       ))
                                   )}
                               </div>
                               <div className="mt-4 pt-4 border-t border-zinc-800">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-zinc-400 text-sm">Total Assets</span>
                                        <span className="text-white font-bold">{CURRENCY_SYMBOL}{assets.reduce((s, a) => s + a.value, 0).toLocaleString()}</span>
                                    </div>
                                    <Button onClick={() => setStep(3)} className="w-full">Next: Liabilities <ArrowRight size={16}/></Button>
                               </div>
                           </div>
                       </div>
                   </div>
               </div>
           )}

           {/* STEP 3: LIABILITIES (Category Grid) */}
           {step === 3 && (
               <div className="animate-in slide-in-from-right duration-500">
                   <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                       
                       {/* Left: Liability Classes Grid */}
                       <div className="lg:col-span-2 space-y-6">
                           <h2 className="text-xl font-medium text-white">Select Liability Type</h2>
                           <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                               {LIABILITY_CLASSES.map((cls) => (
                                   <button
                                       key={cls.id}
                                       onClick={() => { setActiveLiabClass(cls); setLiabName(''); setLiabAmount(''); }}
                                       className={`flex flex-col items-center justify-center gap-3 p-6 rounded-xl border transition-all duration-300 group
                                       ${activeLiabClass?.id === cls.id 
                                           ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)]' 
                                           : 'bg-zinc-900/30 border-zinc-800 text-zinc-400 hover:border-red-900/50 hover:text-white hover:bg-zinc-800'}`}
                                   >
                                       <cls.icon size={24} className={activeLiabClass?.id === cls.id ? 'text-black' : 'text-zinc-500 group-hover:text-red-400'} />
                                       <span className="text-xs font-medium uppercase tracking-wider">{cls.label}</span>
                                   </button>
                               ))}
                           </div>

                            {/* Active Liability Input */}
                           {activeLiabClass && (
                               <div className="mt-6 p-6 bg-zinc-900/50 border border-zinc-700 rounded-2xl animate-in fade-in slide-in-from-top-4">
                                   <div className="flex justify-between items-center mb-4">
                                       <h3 className="text-lg text-white font-medium flex items-center gap-2">
                                           <activeLiabClass.icon size={20} className="text-red-400"/> Add {activeLiabClass.label}
                                       </h3>
                                       <button onClick={() => setActiveLiabClass(null)} className="text-xs text-zinc-500 hover:text-white">Cancel</button>
                                   </div>

                                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                       <div className="space-y-2">
                                           <label className="text-[10px] text-zinc-400 uppercase tracking-wider">Description</label>
                                           <input 
                                                autoFocus
                                                className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white focus:outline-none focus:border-white"
                                                placeholder={`e.g. ${activeLiabClass.label} Provider`}
                                                value={liabName}
                                                onChange={(e) => setLiabName(e.target.value)}
                                           />
                                       </div>
                                       <div className="space-y-2">
                                           <label className="text-[10px] text-zinc-400 uppercase tracking-wider">Outstanding Amount</label>
                                           <div className="relative">
                                                <span className="absolute left-3 top-3 text-zinc-500">{CURRENCY_SYMBOL}</span>
                                                <input 
                                                    type="number"
                                                    className="w-full bg-black border border-zinc-700 rounded-lg p-3 pl-8 text-white focus:outline-none focus:border-white"
                                                    value={liabAmount}
                                                    onChange={(e) => setLiabAmount(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && confirmAddLiability()}
                                                />
                                           </div>
                                       </div>
                                   </div>
                                   <Button onClick={confirmAddLiability} className="w-full mt-4 bg-white text-black hover:bg-zinc-200">
                                       Add Liability
                                   </Button>
                               </div>
                           )}
                       </div>

                       {/* Right: Liability Preview */}
                       <div className="lg:col-span-1">
                           <div className="bg-zinc-900/20 border border-zinc-800 rounded-xl h-full flex flex-col p-4">
                               <h3 className="text-sm text-zinc-400 uppercase tracking-wider mb-4 font-medium">Debt Obligations</h3>
                               <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[400px]">
                                   {liabilities.length === 0 ? (
                                       <div className="h-full flex flex-col items-center justify-center text-zinc-600 opacity-50">
                                           <ShieldAlert size={32} strokeWidth={1} />
                                           <p className="text-xs mt-2">Debt free? Nice.</p>
                                       </div>
                                   ) : (
                                       liabilities.map((liab, idx) => (
                                           <div key={idx} className="bg-black border border-red-900/20 p-3 rounded-lg">
                                               <div className="flex justify-between items-start">
                                                   <div>
                                                       <p className="text-sm text-white font-medium">{liab.name}</p>
                                                       <Badge size="sm" color="bg-red-900/20 text-red-500">{liab.category}</Badge>
                                                   </div>
                                                   <div className="text-right">
                                                       <p className="text-sm text-red-400">-{CURRENCY_SYMBOL}{liab.outstandingAmount.toLocaleString()}</p>
                                                       <button onClick={() => setLiabilities(liabilities.filter((_, i) => i !== idx))} className="text-zinc-600 hover:text-red-500 mt-1">
                                                           <Trash2 size={14} />
                                                       </button>
                                                   </div>
                                               </div>
                                           </div>
                                       ))
                                   )}
                               </div>
                               <div className="mt-4 pt-4 border-t border-zinc-800">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-zinc-400 text-sm">Total Liabilities</span>
                                        <span className="text-red-400 font-bold">-{CURRENCY_SYMBOL}{liabilities.reduce((s, l) => s + l.outstandingAmount, 0).toLocaleString()}</span>
                                    </div>
                                    <Button onClick={handleFinish} className="w-full h-12 text-base bg-white text-black hover:bg-zinc-200 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                                        Initialize 9NINE OS
                                    </Button>
                               </div>
                           </div>
                       </div>
                   </div>
               </div>
           )}
       </div>
    </div>
  );
};

export default Onboarding;
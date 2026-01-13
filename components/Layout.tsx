import React from 'react';
import { LayoutDashboard, PieChart, Wallet, TrendingUp, Lock, ShieldAlert, User } from 'lucide-react';
import { DISCLAIMER_TEXT } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isPremium: boolean;
  setIsPremium: (val: boolean) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, isPremium, setIsPremium }) => {
  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Overview' },
    { id: 'assets', icon: Wallet, label: 'Assets' },
    { id: 'liabilities', icon: TrendingUp, label: 'Liabilities' },
    { id: 'analytics', icon: PieChart, label: 'Intelligence' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="min-h-screen bg-background text-textMain flex flex-col md:flex-row">
      
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-surface border-b border-border sticky top-0 z-30">
         <div className="flex items-center gap-2">
            <div>
                <h1 className="text-xl font-black tracking-tighter text-white leading-none">9NINE</h1>
            </div>
         </div>
         <button 
            onClick={() => setIsPremium(!isPremium)} 
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${isPremium ? 'border-yellow-900 bg-yellow-900/20 text-yellow-500' : 'border-border bg-surfaceHighlight text-textMuted'}`}
         >
            {isPremium ? 'PREMIUM' : 'FREE'}
         </button>
      </div>

      {/* Sidebar (Desktop Only) */}
      <nav className="hidden md:flex w-64 bg-surface border-r border-border flex-col justify-between h-screen sticky top-0 z-20">
        <div className="p-8">
            <div className="flex items-center gap-3 mb-1">
                <h1 className="text-4xl font-black tracking-tighter text-white italic">9NINE</h1>
            </div>
            <p className="text-xs text-textMuted pl-1 tracking-[0.3em] uppercase">Wealth OS</p>
        </div>
        
        <div className="flex-1 px-4 py-4 flex flex-col gap-2">
            {navItems.map((item) => (
            <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id 
                    ? 'bg-surfaceHighlight text-white font-medium shadow-inner shadow-black/20' 
                    : 'text-textMuted hover:text-white hover:bg-surfaceHighlight/50'
                }`}
            >
                <item.icon size={20} />
                <span>{item.label}</span>
            </button>
            ))}
        </div>

        <div className="p-4">
            <div 
                onClick={() => setIsPremium(!isPremium)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${isPremium ? 'border-yellow-900/30 bg-yellow-900/10' : 'border-border bg-surfaceHighlight/50'}`}
            >
                <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-bold uppercase tracking-wider ${isPremium ? 'text-yellow-500' : 'text-textMuted'}`}>
                        {isPremium ? 'Premium Active' : 'Free Plan'}
                    </span>
                    {!isPremium && <Lock size={14} className="text-textMuted" />}
                </div>
                {!isPremium && <p className="text-xs text-textMuted mb-2">Unlock deep intelligence & projections.</p>}
                <p className="text-[10px] text-textMuted/50">Tap to toggle (Dev)</p>
            </div>
            
            <div className="mt-4 flex items-start gap-2 p-2 rounded bg-risk/10 border border-risk/20">
            <ShieldAlert size={16} className="text-risk shrink-0 mt-0.5" />
            <p className="text-[10px] text-textMuted leading-tight">{DISCLAIMER_TEXT}</p>
            </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto pb-24 md:pb-8">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
        
        {/* Mobile Disclaimer */}
        <div className="md:hidden mt-8 px-4 text-center">
             <p className="text-[10px] text-textMuted/60 leading-tight">{DISCLAIMER_TEXT}</p>
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface/95 backdrop-blur-md border-t border-border z-40 px-2 py-2 flex justify-around items-center pb-4">
         {navItems.map((item) => (
            <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all min-w-[64px] ${
                activeTab === item.id 
                    ? 'text-white' 
                    : 'text-textMuted hover:text-white'
                }`}
            >
                <item.icon size={20} strokeWidth={activeTab === item.id ? 2.5 : 2} />
                <span className="text-[10px] font-medium">{item.label}</span>
            </button>
            ))}
      </nav>
    </div>
  );
};

export default Layout;
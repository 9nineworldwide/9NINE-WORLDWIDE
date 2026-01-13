import React, { useState } from 'react';
import { FinancialProfile } from '../types';
import { Card, Button, Badge } from './shared';
import { User, Mail, CreditCard, Save, Check, Shield } from 'lucide-react';
import { CURRENCY_SYMBOL } from '../constants';

interface ProfileProps {
  profile: FinancialProfile;
  updateProfile: (p: FinancialProfile) => void;
  isPremium: boolean;
  setIsPremium: (v: boolean) => void;
}

const Profile: React.FC<ProfileProps> = ({ profile, updateProfile, isPremium, setIsPremium }) => {
  const [formData, setFormData] = useState({
    userName: profile.userName || '',
    userAge: profile.userAge || 0,
    userEmail: profile.userEmail || '',
    monthlyIncome: profile.monthlyIncome || 0,
    monthlyExpenses: profile.monthlyExpenses || 0
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateProfile({
      ...profile,
      ...formData
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <header>
        <h2 className="text-2xl font-light text-white">User Profile</h2>
        <p className="text-textMuted text-sm mt-1">Manage your personal and subscription details.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal Details Form */}
        <div className="lg:col-span-2">
          <Card className="space-y-6">
            <div className="flex items-center gap-3 border-b border-border pb-4 mb-4">
              <div className="bg-surfaceHighlight p-3 rounded-full">
                <User size={24} className="text-white" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-white">Personal Information</h3>
                <p className="text-xs text-textMuted">Update your identity and financial baseline.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs text-textMuted uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.userName}
                    onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                    className="w-full bg-surfaceHighlight border border-border rounded-lg p-3 pl-10 text-white focus:outline-none focus:border-white transition-colors"
                  />
                  <User size={16} className="absolute left-3 top-3.5 text-textMuted" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-textMuted uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    value={formData.userEmail}
                    onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
                    className="w-full bg-surfaceHighlight border border-border rounded-lg p-3 pl-10 text-white focus:outline-none focus:border-white transition-colors"
                  />
                  <Mail size={16} className="absolute left-3 top-3.5 text-textMuted" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-textMuted uppercase tracking-wider">Age</label>
                <input
                  type="number"
                  value={formData.userAge}
                  onChange={(e) => setFormData({ ...formData, userAge: Number(e.target.value) })}
                  className="w-full bg-surfaceHighlight border border-border rounded-lg p-3 text-white focus:outline-none focus:border-white transition-colors"
                />
              </div>
            </div>

            <div className="border-t border-border pt-6 mt-2">
              <h4 className="text-sm font-medium text-white mb-4">Financial Baseline</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs text-textMuted uppercase tracking-wider">Monthly Income ({CURRENCY_SYMBOL})</label>
                  <input
                    type="number"
                    value={formData.monthlyIncome}
                    onChange={(e) => setFormData({ ...formData, monthlyIncome: Number(e.target.value) })}
                    className="w-full bg-surfaceHighlight border border-border rounded-lg p-3 text-white focus:outline-none focus:border-white transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-textMuted uppercase tracking-wider">Monthly Expenses ({CURRENCY_SYMBOL})</label>
                  <input
                    type="number"
                    value={formData.monthlyExpenses}
                    onChange={(e) => setFormData({ ...formData, monthlyExpenses: Number(e.target.value) })}
                    className="w-full bg-surfaceHighlight border border-border rounded-lg p-3 text-white focus:outline-none focus:border-white transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <Button onClick={handleSave} className="w-full md:w-auto min-w-[120px]">
                {saved ? <><Check size={16} /> Saved</> : <><Save size={16} /> Save Changes</>}
              </Button>
            </div>
          </Card>
        </div>

        {/* Subscription Card */}
        <div className="lg:col-span-1">
          <Card className={`h-full flex flex-col ${isPremium ? 'border-yellow-500/20 bg-yellow-900/5' : ''}`}>
            <div className="flex items-center justify-between mb-4">
               <div className="bg-surfaceHighlight p-2 rounded-lg">
                  <CreditCard size={20} className={isPremium ? 'text-yellow-500' : 'text-textMuted'} />
               </div>
               {isPremium && <Badge color="bg-yellow-900/20 text-yellow-500">Premium Active</Badge>}
            </div>
            
            <h3 className="text-xl font-light text-white mb-2">
              {isPremium ? '9NINE Premium' : 'Upgrade to Premium'}
            </h3>
            
            <p className="text-sm text-textMuted flex-1">
              {isPremium 
                ? 'You have full access to wealth projections, deep analytics, and AI-powered report generation.'
                : 'Unlock the full potential of your Wealth OS. Get deep insights, future projections, and unlimited asset tracking.'}
            </p>

            <div className="my-6 space-y-3">
              <div className="flex items-center gap-2 text-sm text-white">
                <Check size={16} className="text-emerald-500" />
                <span>Wealth Health Score</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-white">
                <Check size={16} className="text-emerald-500" />
                <span>10-Year Net Worth Projection</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-white">
                <Check size={16} className="text-emerald-500" />
                <span>Deep Asset Analytics</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-white">
                 <Check size={16} className="text-emerald-500" />
                 <span>Priority AI Analysis</span>
              </div>
            </div>

            <div className="mt-auto">
               {!isPremium ? (
                 <div className="space-y-3">
                    <div className="text-center">
                       <span className="text-2xl font-bold text-white">₹699</span>
                       <span className="text-textMuted text-sm"> / month</span>
                    </div>
                    <Button onClick={() => setIsPremium(true)} className="w-full bg-white text-black hover:bg-zinc-200">
                      Upgrade Now
                    </Button>
                 </div>
               ) : (
                 <div className="space-y-3">
                    <div className="p-3 bg-surfaceHighlight/50 rounded-lg text-center border border-border">
                        <p className="text-xs text-textMuted uppercase">Next Billing Date</p>
                        <p className="text-white font-medium">Oct 24, 2025</p>
                    </div>
                    <Button onClick={() => setIsPremium(false)} variant="outline" className="w-full">
                      Cancel Subscription
                    </Button>
                 </div>
               )}
            </div>
          </Card>
          
          <div className="mt-4 p-4 rounded-xl bg-surface border border-border flex items-start gap-3">
             <Shield size={20} className="text-emerald-500 mt-0.5 shrink-0" />
             <div className="space-y-1">
                <p className="text-xs font-medium text-white">Bank-Grade Security</p>
                <p className="text-[10px] text-textMuted leading-relaxed">
                   Your data is encrypted locally and never shared with third parties. We are a read-only wealth tracker.
                </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
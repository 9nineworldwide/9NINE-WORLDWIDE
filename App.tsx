import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Assets from './components/Assets';
import Liabilities from './components/Liabilities';
import Analytics from './components/Analytics';
import Profile from './components/Profile';
import Auth from './components/Auth';
import Onboarding from './components/Onboarding';
import { FinancialProfile } from './types';
import { MOCK_INITIAL_DATA } from './constants';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [profile, setProfile] = useState<FinancialProfile>(MOCK_INITIAL_DATA);
  const [isPremium, setIsPremium] = useState(false);
  const [authStep, setAuthStep] = useState<'auth' | 'onboarding' | 'app'>('auth');

  const handleAuthComplete = (userPartial: Partial<FinancialProfile>, mode: 'login' | 'signup') => {
      if (mode === 'signup') {
          // New User: Reset data and go to onboarding
          setProfile(prev => ({
              ...prev,
              ...userPartial,
              assets: [], 
              liabilities: [],
              netWorthHistory: [],
              monthlyIncome: 0,
              monthlyExpenses: 0
          }));
          setAuthStep('onboarding');
      } else {
          // Login: Assume returning user, keep mock data for demo purposes, but update name if provided
          setProfile(prev => ({
              ...prev,
              // If phone number matched a real backend, we'd load their data here.
              // For demo, we just keep the MOCK_INITIAL_DATA as "their" data.
          }));
          setAuthStep('app');
      }
  };

  const handleOnboardingComplete = (finalProfile: FinancialProfile) => {
      // Generate some mock history based on the new current net worth for the chart to look nice
      const netWorth = finalProfile.assets.reduce((a,b)=>a+b.value,0) - finalProfile.liabilities.reduce((a,b)=>a+b.outstandingAmount,0);
      const data = [];
      let val = netWorth * 0.82;
      for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const growthFactor = 1 + (Math.random() * 0.03); 
        val = val * growthFactor;
        if (i === 0) val = netWorth;
        data.push({
          date: date.toLocaleString('default', { month: 'short' }),
          value: Math.round(val)
        });
      }
      
      setProfile({
          ...finalProfile,
          netWorthHistory: data
      });
      setAuthStep('app');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard profile={profile} isPremium={isPremium} setActiveTab={setActiveTab} />;
      case 'assets':
        return <Assets profile={profile} updateProfile={setProfile} isPremium={isPremium} />;
      case 'liabilities':
        return <Liabilities profile={profile} updateProfile={setProfile} isPremium={isPremium} />;
      case 'analytics':
        return <Analytics profile={profile} isPremium={isPremium} />;
      case 'profile':
        return <Profile profile={profile} updateProfile={setProfile} isPremium={isPremium} setIsPremium={setIsPremium} />;
      default:
        return <Dashboard profile={profile} isPremium={isPremium} setActiveTab={setActiveTab} />;
    }
  };

  if (authStep === 'auth') {
      return <Auth onComplete={handleAuthComplete} />;
  }

  if (authStep === 'onboarding') {
      return <Onboarding initialProfile={profile} onComplete={handleOnboardingComplete} />;
  }

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      isPremium={isPremium}
      setIsPremium={setIsPremium}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;
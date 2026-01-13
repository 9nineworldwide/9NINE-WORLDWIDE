import React, { useState, useEffect } from 'react';
import { ShieldCheck, ArrowRight, Loader2, ChevronRight, Lock } from 'lucide-react';
import { FinancialProfile } from '../types';

interface AuthProps {
  onComplete: (user: Partial<FinancialProfile>, mode: 'login' | 'signup') => void;
}

const Auth: React.FC<AuthProps> = ({ onComplete }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [isLoading, setIsLoading] = useState(false);
  
  // Form State
  const [details, setDetails] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    city: ''
  });
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [demoOtpCode, setDemoOtpCode] = useState<string | null>(null);

  // Validation
  const isFormValid = () => {
      if (mode === 'signup') {
          return details.name.length > 0 && details.email.length > 0 && details.phone.length > 0;
      } else {
          return details.phone.length > 0;
      }
  };

  const handleSendOtp = () => {
    if (!isFormValid()) {
        setError("Please complete all fields to proceed.");
        return;
    }
    setIsLoading(true);
    
    // Simulate Network Request with a premium delay
    setTimeout(() => {
        setIsLoading(false);
        setError(null);
        setStep('otp');
        setDemoOtpCode('1234');
    }, 1200);
  };

  const handleVerify = () => {
    if (otp !== '1234') {
        setError("Identity Verification Failed. Invalid Code.");
        return;
    }
    setIsLoading(true);
    setTimeout(() => {
        onComplete({
            userName: details.name || 'User',
            userEmail: details.email,
            userAge: Number(details.age) || 25,
        }, mode);
    }, 1000);
  };

  const switchMode = (newMode: 'login' | 'signup') => {
      setMode(newMode);
      setStep('details');
      setError(null);
      setOtp('');
      setDemoOtpCode(null);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans selection:bg-zinc-800 selection:text-white">
      
      {/* Premium Background Effects */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-zinc-900/20 to-transparent pointer-events-none" />

      <div className="w-full max-w-sm z-10 flex flex-col relative">
        
        {/* Logo Section */}
        <div className="mb-12 text-center animate-in fade-in slide-in-from-top-4 duration-700">
          <h1 className="text-7xl font-semibold tracking-tighter mb-2 text-transparent bg-clip-text bg-gradient-to-br from-white via-zinc-200 to-zinc-500 drop-shadow-lg">
            9NINE
          </h1>
          <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-500 font-medium border-t border-zinc-900 pt-4 inline-block px-4">
            Wealth Intelligence OS
          </p>
        </div>

        {/* Notifications */}
        <div className="h-10 mb-2 flex items-center justify-center">
             {error && (
                <span className="text-red-500/90 text-[10px] tracking-widest uppercase font-semibold animate-in fade-in bg-red-950/30 px-3 py-1 rounded border border-red-900/50">{error}</span>
             )}
             {demoOtpCode && !error && (
                 <span className="text-emerald-500/90 text-[10px] tracking-widest uppercase font-semibold animate-in fade-in bg-emerald-950/30 px-3 py-1 rounded border border-emerald-900/50">Code: {demoOtpCode}</span>
             )}
        </div>

        {/* Main Interface */}
        <div className="relative backdrop-blur-sm bg-black/40 border border-zinc-800/50 p-8 rounded-3xl shadow-2xl shadow-black ring-1 ring-white/5">
            {step === 'details' ? (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    
                    {/* Header Toggle */}
                    <div className="flex justify-center mb-6">
                        <div className="inline-flex bg-zinc-900/50 p-1 rounded-full border border-zinc-800">
                            <button 
                                onClick={() => switchMode('signup')}
                                className={`px-6 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-semibold transition-all duration-300 ${mode === 'signup' ? 'bg-zinc-100 text-black shadow-lg shadow-white/10' : 'text-zinc-500 hover:text-white'}`}
                            >
                                Join
                            </button>
                            <button 
                                onClick={() => switchMode('login')}
                                className={`px-6 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-semibold transition-all duration-300 ${mode === 'login' ? 'bg-zinc-100 text-black shadow-lg shadow-white/10' : 'text-zinc-500 hover:text-white'}`}
                            >
                                Access
                            </button>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {mode === 'signup' && (
                            <>
                                <div className="group relative">
                                    <input 
                                        className="peer w-full bg-transparent border-b border-zinc-800 py-2.5 text-base text-white placeholder-transparent focus:outline-none focus:border-zinc-400 transition-all duration-300"
                                        placeholder="Name"
                                        id="name"
                                        value={details.name}
                                        onChange={(e) => setDetails({...details, name: e.target.value})}
                                    />
                                    <label htmlFor="name" className="absolute left-0 -top-2.5 text-[10px] text-zinc-500 uppercase tracking-widest transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-zinc-600 peer-placeholder-shown:top-2.5 peer-focus:-top-2.5 peer-focus:text-[10px] peer-focus:text-zinc-300">
                                        Full Legal Name
                                    </label>
                                </div>
                                <div className="group relative">
                                    <input 
                                        className="peer w-full bg-transparent border-b border-zinc-800 py-2.5 text-base text-white placeholder-transparent focus:outline-none focus:border-zinc-400 transition-all duration-300"
                                        placeholder="Email"
                                        id="email"
                                        type="email"
                                        value={details.email}
                                        onChange={(e) => setDetails({...details, email: e.target.value})}
                                    />
                                    <label htmlFor="email" className="absolute left-0 -top-2.5 text-[10px] text-zinc-500 uppercase tracking-widest transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-zinc-600 peer-placeholder-shown:top-2.5 peer-focus:-top-2.5 peer-focus:text-[10px] peer-focus:text-zinc-300">
                                        Email Address
                                    </label>
                                </div>
                            </>
                        )}
                        
                        <div className="group relative">
                            <input 
                                className="peer w-full bg-transparent border-b border-zinc-800 py-2.5 text-base text-white placeholder-transparent focus:outline-none focus:border-zinc-400 transition-all duration-300"
                                placeholder="Phone"
                                id="phone"
                                type="tel"
                                value={details.phone}
                                onChange={(e) => setDetails({...details, phone: e.target.value})}
                            />
                            <label htmlFor="phone" className="absolute left-0 -top-2.5 text-[10px] text-zinc-500 uppercase tracking-widest transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-zinc-600 peer-placeholder-shown:top-2.5 peer-focus:-top-2.5 peer-focus:text-[10px] peer-focus:text-zinc-300">
                                Mobile Number
                            </label>
                        </div>
                    </div>

                    <div className="pt-2">
                        <button 
                            onClick={handleSendOtp}
                            disabled={!isFormValid() || isLoading}
                            className={`group w-full h-12 rounded-lg flex items-center justify-center gap-3 text-xs font-semibold tracking-widest uppercase transition-all duration-500 
                            ${isFormValid() ? 'bg-gradient-to-r from-zinc-200 to-white text-black hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transform hover:-translate-y-0.5' : 'bg-zinc-900 border border-zinc-800 text-zinc-600 cursor-not-allowed'}`}
                        >
                            {isLoading ? <Loader2 className="animate-spin" size={16}/> : (
                                <>{mode === 'signup' ? 'Initiate' : 'Authenticate'} <ArrowRight size={16} className={`transition-transform duration-300 ${isFormValid() ? 'group-hover:translate-x-1' : ''}`} /></>
                            )}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-zinc-900 mb-4 border border-zinc-800 shadow-inner">
                            <Lock size={16} className="text-zinc-400" />
                        </div>
                        <h2 className="text-lg font-light text-white tracking-wide">Security Verification</h2>
                        <p className="text-[10px] text-zinc-500 mt-2 uppercase tracking-wider">Enter the 4-digit key sent to {details.phone}</p>
                    </div>

                    <div className="relative w-full max-w-[240px] mx-auto mb-10">
                        {/* The visible boxes */}
                        <div className="flex justify-between relative z-0">
                            {[0, 1, 2, 3].map((idx) => (
                                <div 
                                    key={idx} 
                                    className={`w-12 h-16 flex items-center justify-center text-3xl font-light text-white border-b-2 transition-all duration-300 
                                    ${otp.length === idx ? 'border-white scale-110 shadow-[0_4px_12px_rgba(255,255,255,0.1)]' : otp.length > idx ? 'border-zinc-600' : 'border-zinc-800 text-zinc-700'}`}
                                >
                                    {otp[idx] || ''}
                                </div>
                            ))}
                        </div>
                        
                        {/* Hidden Input Overlay - Ensures functionality on all devices */}
                        <input 
                            autoFocus
                            className="absolute inset-0 opacity-0 cursor-text w-full h-full z-10"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
                            inputMode="numeric"
                            type="tel"
                            autoComplete="one-time-code"
                        />
                    </div>

                    <button 
                        onClick={handleVerify}
                        disabled={otp.length !== 4 || isLoading}
                        className={`group w-full h-12 rounded-lg flex items-center justify-center gap-3 text-xs font-semibold tracking-widest uppercase transition-all duration-500 
                        ${otp.length === 4 ? 'bg-gradient-to-r from-zinc-200 to-white text-black hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transform hover:-translate-y-0.5' : 'bg-zinc-900 border border-zinc-800 text-zinc-600 cursor-not-allowed'}`}
                    >
                         {isLoading ? <Loader2 className="animate-spin" size={16}/> : 'Verify Access'}
                    </button>
                    
                    <div className="mt-8 text-center">
                         <button 
                            onClick={() => setStep('details')}
                            className="text-[10px] text-zinc-600 hover:text-white transition-colors uppercase tracking-widest border-b border-transparent hover:border-zinc-600 pb-0.5"
                         >
                             Change Number
                         </button>
                    </div>
                </div>
            )}
        </div>

      </div>

      <div className="absolute bottom-6 left-0 right-0 text-center flex flex-col items-center gap-2">
          <ShieldCheck size={14} className="text-zinc-600" />
          <p className="text-[9px] text-zinc-600 uppercase tracking-widest font-medium">
              Secured by 9NINE Intelligence Protocol
          </p>
      </div>
    </div>
  );
};

export default Auth;
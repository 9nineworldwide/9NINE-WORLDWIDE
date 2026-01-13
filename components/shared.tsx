import React from 'react';

interface CardProps {
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick, noPadding = false }) => (
  <div 
    onClick={onClick}
    className={`bg-surface border border-border rounded-xl shadow-sm transition-all duration-200 
    ${onClick ? 'cursor-pointer hover:border-textMuted/50 hover:bg-surfaceHighlight/50 active:scale-[0.99]' : ''} 
    ${noPadding ? '' : 'p-5'} 
    ${className}`}
  >
    {children}
  </div>
);

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' | 'danger' }> = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyles = "px-4 py-2 rounded-lg font-medium transition-colors text-sm flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-white text-black hover:bg-zinc-200 shadow-md shadow-white/10",
    secondary: "bg-surfaceHighlight text-white hover:bg-zinc-700",
    outline: "border border-border text-textMuted hover:text-white hover:border-white bg-transparent",
    danger: "bg-risk/10 text-risk border border-risk/20 hover:bg-risk/20"
  };
  
  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export const Badge: React.FC<{ children: React.ReactNode; color?: string; size?: 'sm' | 'md' }> = ({ children, color = 'bg-surfaceHighlight', size = 'sm' }) => (
  <span className={`inline-flex items-center justify-center ${size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'} rounded font-semibold uppercase tracking-wider ${color} text-textMuted`}>
    {children}
  </span>
);

export const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-surface border border-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl shadow-black">
        <div className="flex justify-between items-center p-6 border-b border-border sticky top-0 bg-surface z-10">
          <h2 className="text-xl font-light text-white">{title}</h2>
          <button onClick={onClose} className="text-textMuted hover:text-white transition-colors">✕</button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export const ProgressBar: React.FC<{ value: number; max?: number; color?: string; height?: string }> = ({ value, max = 100, color = 'bg-white', height = 'h-1.5' }) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));
    return (
        <div className={`w-full ${height} bg-surfaceHighlight rounded-full overflow-hidden`}>
            <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${percentage}%` }}></div>
        </div>
    )
}

export const TrendIndicator: React.FC<{ value: number; isPercentage?: boolean }> = ({ value, isPercentage = false }) => {
    const isPositive = value >= 0;
    const color = isPositive ? 'text-emerald-500' : 'text-risk';
    return (
        <span className={`${color} text-xs font-medium flex items-center gap-1`}>
            {isPositive ? '↑' : '↓'} {Math.abs(value).toLocaleString()}{isPercentage ? '%' : ''}
        </span>
    );
};
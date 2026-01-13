
export enum AssetCategory {
  CASH = 'Cash & Bank',
  EQUITY = 'Equity (Stocks)',
  MUTUAL_FUNDS = 'Mutual Funds',
  FIXED_INCOME = 'Fixed Income',
  REAL_ESTATE = 'Real Estate',
  VEHICLES = 'Vehicles',
  CRYPTO = 'Crypto',
  OTHER = 'Other Assets'
}

export enum LiabilityCategory {
  HOME_LOAN = 'Home Loan',
  PERSONAL_LOAN = 'Personal Loan',
  CREDIT_CARD = 'Credit Card',
  CAR_LOAN = 'Car Loan',
  EDUCATION_LOAN = 'Education Loan',
  OTHER = 'Other Liabilities'
}

export interface HistoricalDataPoint {
  date: string;
  value: number;
}

export interface Asset {
  id: string;
  name: string;
  category: AssetCategory;
  value: number;
  quantity?: number;
  ticker?: string;
  navDate?: string; // For Mutual Funds mainly
  costBasis?: number; // Total purchase cost
  purchaseDate?: string;
  lastUpdated: string;
  priceSource?: 'manual' | 'api' | 'ai';
}

export interface Liability {
  id: string;
  name: string;
  category: LiabilityCategory;
  outstandingAmount: number;
  interestRate: number; // Percentage
  monthlyPayment: number;
  tenureMonthsRemaining?: number;
}

export interface FinancialProfile {
  userName?: string;
  userAge?: number;
  userEmail?: string;
  assets: Asset[];
  liabilities: Liability[];
  currency: string;
  monthlyIncome: number;
  monthlyExpenses: number;
  netWorthHistory: HistoricalDataPoint[]; // For trend lines
}

export interface AIInsight {
  title: string;
  content: string;
  suggestion: string; // Actionable advice
  severity: 'low' | 'medium' | 'high';
  type: 'risk' | 'opportunity' | 'observation';
}
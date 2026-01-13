import { AssetCategory, LiabilityCategory, FinancialProfile } from './types';

export const APP_NAME = "9NINE";
export const CURRENCY_SYMBOL = "₹";

export const DISCLAIMER_TEXT = "9NINE IS A WEALTH INTELLIGENCE PLATFORM, NOT AN INVESTMENT ADVISOR. ALL INSIGHTS ARE ALGORITHMICALLY GENERATED FOR EDUCATIONAL PURPOSES. PAST PERFORMANCE IS NOT INDICATIVE OF FUTURE RESULTS.";

const generateHistory = (currentNw: number) => {
  const data = [];
  // Generate a realistic growth curve ending at currentNw
  let val = currentNw * 0.82; // Started lower a year ago
  for (let i = 11; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    // Add some randomness and trend
    const growthFactor = 1 + (Math.random() * 0.03); 
    val = val * growthFactor;
    
    // Smooth adjustment to ensure the final point matches current NW reasonably well in chart
    if (i === 0) val = currentNw;
    
    data.push({
      date: date.toLocaleString('default', { month: 'short' }),
      value: Math.round(val)
    });
  }
  return data;
};

// Target Net Worth: 9,500,000
// Liabilities: 3,985,000 (3.8M Loan + 185k CC)
// Required Total Assets: 13,485,000

export const MOCK_INITIAL_DATA: FinancialProfile = {
  userName: "Dnyaneshwari Soham Pawar",
  userAge: 24,
  userEmail: "dnyaneshwari.p@example.com",
  currency: 'INR',
  monthlyIncome: 350000,
  monthlyExpenses: 120000,
  assets: [
    {
      id: '1',
      name: 'HDFC Imperia Savings',
      category: AssetCategory.CASH,
      value: 455000, 
      costBasis: 455000,
      lastUpdated: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Nifty 50 Index Fund',
      category: AssetCategory.MUTUAL_FUNDS,
      value: 2450000,
      costBasis: 1800000,
      quantity: 8900,
      ticker: 'NIFTYBEES',
      lastUpdated: new Date().toISOString(),
    },
    {
      id: '3',
      name: 'Reliance Industries',
      category: AssetCategory.EQUITY,
      value: 1250000,
      costBasis: 950000,
      quantity: 420,
      ticker: 'RELIANCE',
      lastUpdated: new Date().toISOString(),
    },
    {
      id: '4',
      name: 'TCS (Tata Consultancy)',
      category: AssetCategory.EQUITY,
      value: 980000,
      costBasis: 1100000,
      quantity: 240,
      ticker: 'TCS',
      lastUpdated: new Date().toISOString(),
    },
    {
      id: '5',
      name: 'Sovereign Gold Bonds',
      category: AssetCategory.FIXED_INCOME,
      value: 650000,
      costBasis: 400000,
      quantity: 100,
      ticker: 'GOLDBEES',
      lastUpdated: new Date().toISOString(),
    },
    {
      id: '6',
      name: 'Residential Plot - Pune',
      category: AssetCategory.REAL_ESTATE,
      value: 4500000, 
      costBasis: 3500000,
      lastUpdated: new Date().toISOString(),
    },
    {
      id: '7',
      name: 'Tesla Model 3',
      category: AssetCategory.VEHICLES,
      value: 3200000, 
      costBasis: 4500000, 
      lastUpdated: new Date().toISOString(),
    }
  ],
  liabilities: [
    {
      id: 'l1',
      name: 'Home Loan (SBI)',
      category: LiabilityCategory.HOME_LOAN,
      outstandingAmount: 3800000,
      interestRate: 8.5,
      monthlyPayment: 42000,
      tenureMonthsRemaining: 180
    },
    {
      id: 'l2',
      name: 'Amex Platinum Charge',
      category: LiabilityCategory.CREDIT_CARD,
      outstandingAmount: 185000,
      interestRate: 42,
      monthlyPayment: 185000, // Full payment
      tenureMonthsRemaining: 1
    }
  ],
  netWorthHistory: [] // Will be populated dynamically based on asset calcs
};

// Populate history based on the mock data
const totalA = MOCK_INITIAL_DATA.assets.reduce((s, a) => s + a.value, 0);
const totalL = MOCK_INITIAL_DATA.liabilities.reduce((s, l) => s + l.outstandingAmount, 0);
MOCK_INITIAL_DATA.netWorthHistory = generateHistory(totalA - totalL);

export const MOCK_STOCK_PRICES: Record<string, number> = {
  'RELIANCE': 2980.50,
  'TCS': 4100.20,
  'INFY': 1650.10,
  'HDFCBANK': 1450.00,
  'NIFTYBEES': 275.40,
  'GOLDBEES': 65.20
};
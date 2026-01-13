import { GoogleGenAI } from "@google/genai";
import { FinancialProfile, AIInsight, AssetCategory } from "../types";
import { CURRENCY_SYMBOL } from "../constants";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const SYSTEM_INSTRUCTION = `
You are the Wealth Intelligence Engine for '9NINE'. 
ROLE: Senior Quantitative Analyst & Wealth Strategist.
TONE: Clinical, Mathematical, Direct, Institutional.
STRICT PROHIBITIONS:
- NO specific stock tickers (e.g. "Buy Tesla").
- NO guarantees of returns.
`;

export const generateWealthInsights = async (profile: FinancialProfile, context: 'dashboard' | 'assets' | 'liabilities' = 'dashboard'): Promise<AIInsight[]> => {
  if (!apiKey) return [];

  const netWorth = profile.assets.reduce((acc, a) => acc + a.value, 0) - profile.liabilities.reduce((acc, l) => acc + l.outstandingAmount, 0);
  
  let taskPrompt = "";
  if (context === 'assets') {
      taskPrompt = "Analyze only the Assets portfolio. Focus on diversification, concentration risk, and underperforming asset classes.";
  } else if (context === 'liabilities') {
      taskPrompt = "Analyze only the Liabilities. Focus on interest leakage, debt-to-income ratio, and payoff strategies.";
  } else {
      taskPrompt = "Generate high-level wealth insights including Net Worth trends, Liquidity (Emergency Fund) analysis, and overall financial health.";
  }

  const prompt = `
    DATA:
    Net Worth: ${CURRENCY_SYMBOL}${netWorth}
    Monthly Surplus: ${CURRENCY_SYMBOL}${profile.monthlyIncome - profile.monthlyExpenses}
    Assets: ${JSON.stringify(profile.assets.map(a => ({ cat: a.category, val: a.value, name: a.name })))}
    Liabilities: ${JSON.stringify(profile.liabilities)}

    TASK:
    ${taskPrompt}
    Generate 2-3 specific, high-value analytical insights.

    JSON SCHEMA:
    [
      { 
        "title": "Headline (Max 5 words)", 
        "content": "Analytical observation (Max 20 words)", 
        "suggestion": "Specific strategy (e.g. 'Pay off 18% credit card debt first').",
        "severity": "low"|"medium"|"high", 
        "type": "risk"|"opportunity"|"observation" 
      }
    ]
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json'
      }
    });

    return JSON.parse(response.text || '[]') as AIInsight[];
  } catch (error) {
    console.error("Gemini API Error:", error);
    return [];
  }
};

// UPDATED: Identification now includes EXCHANGE for Twelve Data compatibility
export const identifyAsset = async (query: string, typeHint?: string): Promise<{ name: string, category: string, ticker: string, exchange: string }> => {
  if (!apiKey) return { name: query, category: 'Other Assets', ticker: '', exchange: '' };

  const prompt = `
    Identify the financial asset from this query: "${query}" (Context: ${typeHint || 'General'}).
    
    TASK:
    1. Identify the official full company/asset name.
    2. Identify the Ticker Symbol.
    3. Identify the Stock Exchange Code (e.g. NSE, BSE, NYSE, NASDAQ). Default to NSE for Indian context if ambiguous.
    4. Categorize strictly into: 'Cash & Bank', 'Equity (Stocks)', 'Mutual Funds', 'Fixed Income', 'Real Estate', 'Vehicles', 'Crypto', 'Other Assets'.
    5. DO NOT ESTIMATE PRICE.

    Return JSON ONLY:
    {
      "name": string,
      "category": string,
      "ticker": string (e.g. RELIANCE),
      "exchange": string (e.g. NSE)
    }
  `;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
    });
    return JSON.parse(response.text || '{}');
  } catch (e) {
      console.error(e);
      return { name: query, category: 'Other Assets', ticker: '', exchange: '' };
  }
};
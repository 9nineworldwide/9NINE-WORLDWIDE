import { AssetCategory } from "../types";

// Cache structure: Key -> { price, timestamp, date? }
const PRICE_CACHE = new Map<string, { price: number, timestamp: number, date?: string }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 Minutes

// Mutual Fund List Cache
let MF_LIST_CACHE: Array<{ schemeCode: string, schemeName: string }> = [];

// API Key for Twelve Data (Assumed to be in environment variables)
const TWELVE_DATA_KEY = process.env.TWELVE_DATA_API_KEY || '';

// Helper to check cache
const getCachedPrice = (key: string) => {
    const cached = PRICE_CACHE.get(key);
    if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
        return cached;
    }
    return null;
};

// Helper to set cache
const setCachedPrice = (key: string, price: number, date?: string) => {
    PRICE_CACHE.set(key, { price, timestamp: Date.now(), date });
};

// --- MUTUAL FUND HELPERS ---

const fetchMFList = async () => {
    if (MF_LIST_CACHE.length > 0) return MF_LIST_CACHE;
    try {
        const response = await fetch('https://api.mfapi.in/mf');
        if (response.ok) {
            MF_LIST_CACHE = await response.json();
            return MF_LIST_CACHE;
        }
    } catch (e) {
        console.warn("Failed to fetch MF List", e);
    }
    return [];
};

const findMFScheme = async (query: string) => {
    const list = await fetchMFList();
    if (list.length === 0) return null;
    
    const lowerQuery = query.toLowerCase();
    // Simple logic: find scheme where name includes the query
    // If query is "SBI Small Cap", match schemes containing "sbi", "small", "cap"
    const terms = lowerQuery.split(' ').filter(t => t.length > 2);
    
    const match = list.find(scheme => {
        const name = scheme.schemeName.toLowerCase();
        // Check if all significant terms are in the name
        return terms.every(term => name.includes(term));
    });

    // Fallback: direct includes
    if (!match) {
        return list.find(s => s.schemeName.toLowerCase().includes(lowerQuery));
    }

    return match;
};

const fetchMFNav = async (schemeCode: string) => {
    try {
        const response = await fetch(`https://api.mfapi.in/mf/${schemeCode}`);
        if (response.ok) {
            const data = await response.json();
            // meta: { fund_house, scheme_type, scheme_category, scheme_code, scheme_name }
            // data: [ { date, nav } ... ]
            if (data.data && data.data.length > 0) {
                return {
                    price: parseFloat(data.data[0].nav),
                    date: data.data[0].date, // "dd-mm-yyyy"
                    name: data.meta.scheme_name
                };
            }
        }
    } catch (e) {
        console.warn(`Failed to fetch NAV for ${schemeCode}`, e);
    }
    return null;
};

// --- MAIN EXPORT ---

export const fetchRealMarketPrice = async (
    ticker: string, 
    category: string, 
    exchange?: string
): Promise<{ price: number, date?: string, ticker?: string } | null> => {
    if (!ticker) return null;
    
    const cleanTicker = ticker.trim().toUpperCase();
    const cleanExchange = exchange ? exchange.trim().toUpperCase() : '';
    const cacheKey = `${category}:${cleanTicker}:${cleanExchange}`;
    
    // 1. Check Cache
    const cached = getCachedPrice(cacheKey);
    if (cached) return { price: cached.price, date: cached.date };

    try {
        // --- MUTUAL FUNDS (AMFI) ---
        if (category === AssetCategory.MUTUAL_FUNDS) {
             let schemeCode = cleanTicker;
             let navData = null;

             // If ticker is NOT numeric, assume it's a name and search
             if (isNaN(Number(schemeCode))) {
                 const scheme = await findMFScheme(ticker); // Use original ticker string for search
                 if (scheme) {
                     schemeCode = scheme.schemeCode;
                 } else {
                     return null; // Not found
                 }
             }

             // Fetch NAV using scheme code
             navData = await fetchMFNav(schemeCode);
             
             if (navData) {
                 setCachedPrice(cacheKey, navData.price, navData.date);
                 return { 
                     price: navData.price, 
                     date: navData.date,
                     ticker: schemeCode // Return the scheme code to verify/update asset
                 };
             }
        }

        // --- CRYPTO (CoinGecko) ---
        if (category === AssetCategory.CRYPTO) {
            const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${cleanTicker.toLowerCase()}&vs_currencies=inr`);
            if (response.ok) {
                const data = await response.json();
                const price = data[cleanTicker.toLowerCase()]?.inr;
                if (price) {
                    setCachedPrice(cacheKey, price);
                    return { price };
                }
            }
        }

        // --- STOCKS (Twelve Data) ---
        if (category === AssetCategory.EQUITY || category === AssetCategory.FIXED_INCOME) {
            if (!TWELVE_DATA_KEY) {
                console.warn("Twelve Data API Key missing");
                return null;
            }

            let url = `https://api.twelvedata.com/price?symbol=${cleanTicker}&apikey=${TWELVE_DATA_KEY}`;
            if (cleanExchange) {
                url += `&exchange=${cleanExchange}`;
            } else if (category === AssetCategory.EQUITY) {
                 url += `&country=India`; 
            }

            const response = await fetch(url);
            
            if (!response.ok) return null;

            const data = await response.json();

            if (data.price) {
                const price = parseFloat(data.price);
                if (!isNaN(price)) {
                    setCachedPrice(cacheKey, price);
                    return { price };
                }
            }
        }

        return null; 

    } catch (error) {
        console.warn("Market Data Fetch Failed:", error);
        return null;
    }
};
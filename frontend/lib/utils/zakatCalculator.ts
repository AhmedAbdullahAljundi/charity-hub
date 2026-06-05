// Nisab constants (update periodically)
// Based on gold nisab: 85 grams of gold × approximate EGP price
export const NISAB_GOLD_GRAMS = 85;
export const GOLD_PRICE_PER_GRAM_EGP = 4800; // approximate EGP
export const NISAB_EGP = NISAB_GOLD_GRAMS * GOLD_PRICE_PER_GRAM_EGP; // ~408,000 EGP
export const SILVER_PRICE_PER_GRAM_EGP = 55; // approximate EGP
export const ZAKAT_RATE = 0.025; // 2.5%

export interface ZakatInput {
  cash: number;
  gold: number;         // grams
  silver: number;       // grams
  stocks: number;
  businessAssets: number;
  receivables: number;
  debts: number;
  goldPricePerGram?: number; // optional override
}

export interface ZakatResult {
  totalAssets: number;
  totalDebts: number;
  netAssets: number;
  nisab: number;
  isAboveNisab: boolean;
  zakatAmount: number;
  progressPercent: number; // 0-100, how close to nisab
  breakdown: {
    cash: number;
    gold: number;
    silver: number;
    stocks: number;
    business: number;
    receivables: number;
  };
  message: string;
}

export function calculateZakat(input: ZakatInput): ZakatResult {
  const goldPrice = input.goldPricePerGram ?? GOLD_PRICE_PER_GRAM_EGP;
  const goldValue     = input.gold * goldPrice;
  const silverValue   = input.silver * SILVER_PRICE_PER_GRAM_EGP;
  const totalAssets   = input.cash + goldValue + silverValue
                      + input.stocks + input.businessAssets + input.receivables;
  const netAssets     = Math.max(0, totalAssets - input.debts);
  const nisab         = NISAB_GOLD_GRAMS * goldPrice;
  const isAboveNisab  = netAssets >= nisab;
  const zakatAmount   = isAboveNisab ? netAssets * ZAKAT_RATE : 0;
  const progressPercent = nisab > 0 ? Math.min(100, (netAssets / nisab) * 100) : 0;

  return {
    totalAssets,
    totalDebts: input.debts,
    netAssets,
    nisab,
    isAboveNisab,
    zakatAmount,
    progressPercent,
    breakdown: {
      cash:        input.cash * ZAKAT_RATE,
      gold:        goldValue  * ZAKAT_RATE,
      silver:      silverValue * ZAKAT_RATE,
      stocks:      input.stocks * ZAKAT_RATE,
      business:    input.businessAssets * ZAKAT_RATE,
      receivables: input.receivables * ZAKAT_RATE,
    },
    message: isAboveNisab
      ? `زكاة المال الواجبة: ${zakatAmount.toLocaleString('ar-EG')} جنيه`
      : `مالك لم يبلغ النصاب (${nisab.toLocaleString('ar-EG')} جنيه)`,
  };
}

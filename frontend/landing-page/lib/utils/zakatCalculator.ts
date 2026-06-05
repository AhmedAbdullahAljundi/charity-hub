// Zakat Calculator Utility
// Islamic Zakat calculation based on gold nisab

// Nisab constants (based on 85 grams of gold)
export const NISAB_GOLD_GRAMS = 85
export const GOLD_PRICE_PER_GRAM_EGP = 4800 // approximate current price
export const NISAB_EGP = NISAB_GOLD_GRAMS * GOLD_PRICE_PER_GRAM_EGP // ~408,000 EGP

export const ZAKAT_RATE = 0.025 // 2.5%
export const SILVER_PRICE_PER_GRAM_EGP = 55 // approximate

export interface ZakatInput {
  cash: number // النقد والرصيد البنكي
  gold: number // الذهب (بالجرام)
  silver: number // الفضة (بالجرام)
  stocks: number // الأسهم والأوراق المالية
  businessAssets: number // الأصول التجارية
  receivables: number // ديون لك عند الغير
  debts: number // ديون عليك (تُطرح)
  goldPricePerGram?: number // اختياري — override السعر
}

export interface ZakatResult {
  totalAssets: number
  totalDebts: number
  netAssets: number
  nisab: number
  isAboveNisab: boolean
  zakatAmount: number
  breakdown: {
    cash: number
    gold: number
    silver: number
    stocks: number
    business: number
    receivables: number
  }
  message: string // AR message
}

export function calculateZakat(input: ZakatInput): ZakatResult {
  const goldPrice = input.goldPricePerGram || GOLD_PRICE_PER_GRAM_EGP

  // Calculate asset values
  const goldValue = input.gold * goldPrice
  const silverValue = input.silver * SILVER_PRICE_PER_GRAM_EGP

  // Total assets
  const totalAssets =
    input.cash + goldValue + silverValue + input.stocks + input.businessAssets + input.receivables

  // Net assets (after debts)
  const totalDebts = input.debts
  const netAssets = Math.max(0, totalAssets - totalDebts)

  // Nisab based on current gold price
  const nisab = NISAB_GOLD_GRAMS * goldPrice

  // Check if above nisab
  const isAboveNisab = netAssets >= nisab

  // Calculate zakat amount
  const zakatAmount = isAboveNisab ? netAssets * ZAKAT_RATE : 0

  return {
    totalAssets,
    totalDebts,
    netAssets,
    nisab,
    isAboveNisab,
    zakatAmount,
    breakdown: {
      cash: input.cash * ZAKAT_RATE,
      gold: goldValue * ZAKAT_RATE,
      silver: silverValue * ZAKAT_RATE,
      stocks: input.stocks * ZAKAT_RATE,
      business: input.businessAssets * ZAKAT_RATE,
      receivables: input.receivables * ZAKAT_RATE,
    },
    message: isAboveNisab
      ? `زكاة المال الواجبة: ${zakatAmount.toLocaleString('ar-EG')} جنيه`
      : `مالك لم يبلغ النصاب (${nisab.toLocaleString('ar-EG')} جنيه)`,
  }
}

export function formatCurrency(value: number): string {
  return value.toLocaleString('ar-EG', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

export type PaymentCurrency = 'USD' | 'GBP' | 'CAD';

export type BankDetailRow = { label: string; value: string };

export const SHIPPING_FLAT_USD = 25;
export const FREE_SHIPPING_THRESHOLD_USD = 500;

export type CurrencyConfig = {
  code: PaymentCurrency;
  symbol: string;
  name: string;
  locale: string;
  /** Multiplier applied to the USD total. Update as needed. */
  rateFromUSD: number;
  hint: string;
  bank: BankDetailRow[];
};

export const PAYMENT_REFERENCE_PREFIX = 'OG';

// Replace placeholder values later; no component edits needed.
export const PAYMENT_CURRENCIES: Record<PaymentCurrency, CurrencyConfig> = {
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    locale: 'en-US',
    rateFromUSD: 1,
    hint: 'Recommended for customers in the USA.',
    bank: [
      { label: 'Beneficiary name', value: 'Arham Ahmed' },
      { label: 'Bank name', value: 'Citibank' },
      { label: 'Account type', value: 'CHECKING' },
      { label: 'Account number', value: '70585660002557112' },
      { label: 'Routing number', value: '031100209' },
      { label: 'SWIFT/BIC', value: 'CITIUS33' },
      { label: 'Bank address', value: '111 Wall Street New York, NY 10043 USA' },
    ],
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    locale: 'en-GB',
    rateFromUSD: 0.79,
    hint: 'Recommended for customers in the UK.',
    bank: [
      { label: 'Beneficiary name', value: 'Arham Ahmed' },
      { label: 'Bank name', value: 'Citibank' },
      { label: 'Account number', value: '56250459' },
      { label: 'Sort code', value: '185008' },
      { label: 'IBAN', value: 'GB30CITI18500856250459' },
      { label: 'SWIFT/BIC', value: 'CITIGB2L' },
      { label: 'Bank address', value: 'Canada Square, Canary Wharf London, E14 5LB United Kingdom' },
    ],
  },
  CAD: {
    code: 'CAD',
    symbol: '$',
    name: 'Canadian Dollar',
    locale: 'en-CA',
    rateFromUSD: 1.36,
    hint: 'Recommended for customers in Canada.',
    bank: [
      { label: 'Beneficiary name', value: 'Arham Ahmed' },
      { label: 'Bank name', value: 'Digital Commerce Bank' },
      { label: 'Bank address', value: '736 Meridian Road NE Calgary, Alberta T2A 2N7, Canada' },
      { label: 'Institution number', value: '0352' },
      { label: 'Transit number', value: '10009' },
      { label: 'Account type', value: 'CHECKING' },
      { label: 'Account number', value: '964757546' },
    ],
  },
};

export function convertFromUSD(amountUSD: number, currency: PaymentCurrency): number {
  return +(amountUSD * PAYMENT_CURRENCIES[currency].rateFromUSD).toFixed(2);
}

export function formatCurrency(amount: number, currency: PaymentCurrency): string {
  const cfg = PAYMENT_CURRENCIES[currency];
  return new Intl.NumberFormat(cfg.locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

/** Mock reference for the front-end build. Replace with the server-issued order number later. */
export function generateMockReference(): string {
  return `${PAYMENT_REFERENCE_PREFIX}-${Math.floor(10000 + Math.random() * 90000)}`;
}

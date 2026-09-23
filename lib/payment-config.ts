export type PaymentCurrency = 'USD' | 'GBP' | 'CAD';

export type BankDetails = {
  accountHolder: string;
  bankName: string;
  accountNumber: string;
  routingLabel: string; // "Routing number" / "Sort code" / "Transit / Institution no."
  routingValue: string;
  swift: string;
  bankAddress: string;
};

export type CurrencyConfig = {
  code: PaymentCurrency;
  symbol: string;
  name: string;
  locale: string;
  /** Multiplier applied to the USD total. Update as needed. */
  rateFromUSD: number;
  hint: string;
  bank: BankDetails;
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
    bank: {
      accountHolder: 'Wear The Originals',
      bankName: 'Payoneer-provided bank name',
      accountNumber: '0000000000',
      routingLabel: 'Routing number',
      routingValue: '000000000',
      swift: 'XXXXUS00XXX',
      bankAddress: 'Placeholder Address, City, State, USA',
    },
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    locale: 'en-GB',
    rateFromUSD: 0.79,
    hint: 'Recommended for customers in the UK.',
    bank: {
      accountHolder: 'Wear The Originals',
      bankName: 'Payoneer-provided bank name',
      accountNumber: '00000000',
      routingLabel: 'Sort code',
      routingValue: '00-00-00',
      swift: 'XXXXGB00XXX',
      bankAddress: 'Placeholder Address, London, UK',
    },
  },
  CAD: {
    code: 'CAD',
    symbol: '$',
    name: 'Canadian Dollar',
    locale: 'en-CA',
    rateFromUSD: 1.36,
    hint: 'Recommended for customers in Canada.',
    bank: {
      accountHolder: 'Wear The Originals',
      bankName: 'Payoneer-provided bank name',
      accountNumber: '0000000',
      routingLabel: 'Institution / transit no.',
      routingValue: '000 / 00000',
      swift: 'XXXXCA00XXX',
      bankAddress: 'Placeholder Address, Toronto, Canada',
    },
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

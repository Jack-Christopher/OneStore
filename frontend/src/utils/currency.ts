import { useSettingsStore } from "@/store/settingsStore";

const CURRENCY_SYMBOLS: Record<string, string> = {
  PEN: 'S/.',
  USD: '$',
  EUR: '€',
  JPY: '¥',
  GBP: '£',
  BRL: 'R$',
};

export const formatCurrency = (value: number | undefined | null, currency?: string): string => {
  const settings = useSettingsStore.getState().settings;
  const selectedCurrency = currency || settings.currency || 'PEN';
  const symbol = CURRENCY_SYMBOLS[selectedCurrency] || selectedCurrency;
  const amount = value || 0;

  // Format with 2 decimal places
  const formatted = Math.abs(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  // Add negative sign if needed
  const sign = amount < 0 ? '-' : '';

  return `${sign}${symbol}${formatted}`;
};


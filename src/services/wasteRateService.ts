import { StorageManager } from './storageService';
import { WasteRateItem, WasteCategory } from '../types';

export const WasteRateService = {
  getAllRates: (): WasteRateItem[] => {
    return StorageManager.getRates();
  },

  getRatesByCategory: (category: WasteCategory): WasteRateItem[] => {
    return StorageManager.getRates().filter((r) => r.category === category);
  },

  getPopularRates: (): WasteRateItem[] => {
    return StorageManager.getRates().filter((r) => r.popular);
  },

  searchRates: (query: string): WasteRateItem[] => {
    const q = query.toLowerCase().trim();
    if (!q) return StorageManager.getRates();
    return StorageManager.getRates().filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q)
    );
  },

  updateRate: (rateId: string, newRatePerKg: number, trend: 'up' | 'down' | 'stable'): WasteRateItem => {
    const rates = StorageManager.getRates();
    const index = rates.findIndex((r) => r.id === rateId);
    if (index === -1) throw new Error('Rate item not found');
    rates[index] = {
      ...rates[index],
      ratePerKg: newRatePerKg,
      marketTrend: trend,
    };
    StorageManager.saveRates(rates);
    return rates[index];
  },

  calculateEstimate: (items: { rateId: string; weightKg: number }[]): { totalEstimatedValue: number; co2SavedKg: number } => {
    const ratesMap = new Map(StorageManager.getRates().map((r) => [r.id, r]));
    let totalEstimatedValue = 0;
    let co2SavedKg = 0;

    items.forEach((item) => {
      const rate = ratesMap.get(item.rateId);
      if (rate) {
        totalEstimatedValue += rate.ratePerKg * item.weightKg;
        co2SavedKg += (rate.co2OffsetFactor || 2.0) * item.weightKg;
      }
    });

    return { totalEstimatedValue, co2SavedKg };
  }
};

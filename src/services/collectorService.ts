import { StorageManager } from './storageService';
import { CollectorProfile, WasteCategory } from '../types';

export interface CollectorDutyConfig {
  isOnline: boolean;
  acceptedCategories: WasteCategory[];
  maxServiceRadiusKm: number;
}

const COLLECTOR_CONFIG_KEY = 'kc_collector_duty_config';

const DEFAULT_CONFIG: CollectorDutyConfig = {
  isOnline: true,
  acceptedCategories: [
    'e_waste',
    'metals',
    'paper',
    'cardboard',
    'plastics',
    'glass',
    'batteries',
    'appliances',
    'cables',
    'motors',
    'other',
  ],
  maxServiceRadiusKm: 10,
};

export const CollectorService = {
  getProfile: (user?: { id: string; name: string; phone: string; role: string } | null): CollectorProfile => {
    const pickups = StorageManager.getPickups().filter((p) => p.status === 'completed');

    if (user) {
      const userCompleted = pickups.filter((p) => p.collectorId === user.id);
      const userTotalEarnings = userCompleted.reduce((sum, p) => sum + (p.totalFinalValue || p.totalEstimatedValue || 0), 0);
      return {
        id: user.id,
        name: user.name,
        phone: user.phone,
        avatar: '',
        vehicleType: 'EV Auto Loader',
        vehicleNumber: 'KA-01-RE-2026',
        isOnline: true,
        rating: userCompleted.length > 0 ? 4.9 : 0,
        completedPickups: userCompleted.length,
        totalEarnings: userTotalEarnings,
        currentLocation: { lat: 12.9716, lng: 77.5946 },
      };
    }

    return {
      id: 'col-guest',
      name: 'Guest Collector',
      phone: '',
      avatar: '',
      vehicleType: 'EV Auto Loader',
      vehicleNumber: 'KA-01-RE-2026',
      isOnline: true,
      rating: 0,
      completedPickups: 0,
      totalEarnings: 0,
      currentLocation: { lat: 12.9716, lng: 77.5946 },
    };
  },

  getDutyConfig: (): CollectorDutyConfig => {
    return StorageManager.getStored(COLLECTOR_CONFIG_KEY, DEFAULT_CONFIG);
  },

  updateDutyConfig: (config: Partial<CollectorDutyConfig>): CollectorDutyConfig => {
    const current = CollectorService.getDutyConfig();
    const updated = { ...current, ...config };
    StorageManager.setStored(COLLECTOR_CONFIG_KEY, updated);

    // Also update profile isOnline
    if (config.isOnline !== undefined) {
      const collectors = StorageManager.getCollectors();
      if (collectors[0]) {
        collectors[0].isOnline = config.isOnline;
        StorageManager.saveCollectors(collectors);
      }
    }

    return updated;
  },

  getEarningsBreakdown: (collectorId?: string): {
    today: number;
    thisWeek: number;
    thisMonth: number;
    transactions: { id: string; date: string; pickupNumber: string; amount: number; category: string; paymentMode: string }[];
  } => {
    let pickups = StorageManager.getPickups().filter((p) => p.status === 'completed');
    if (collectorId) {
      pickups = pickups.filter((p) => p.collectorId === collectorId);
    }

    const today = pickups
      .filter((p) => new Date(p.updatedAt).toDateString() === new Date().toDateString())
      .reduce((acc, p) => acc + (p.totalFinalValue || p.totalEstimatedValue), 0);

    const thisWeek = pickups.reduce((acc, p) => acc + (p.totalFinalValue || p.totalEstimatedValue), 0);
    const thisMonth = thisWeek;

    const transactions = pickups.map((p) => ({
      id: p.id,
      date: new Date(p.updatedAt).toLocaleDateString(),
      pickupNumber: p.requestNumber,
      amount: p.totalFinalValue || p.totalEstimatedValue,
      category: p.wasteItems[0]?.categoryName || 'Recyclable Scrap',
      paymentMode: p.paymentMethod.toUpperCase(),
    }));

    return {
      today,
      thisWeek,
      thisMonth,
      transactions,
    };
  }
};

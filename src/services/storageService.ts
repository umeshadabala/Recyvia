import { INITIAL_WASTE_RATES, INITIAL_PICKUPS, INITIAL_COLLECTORS, INITIAL_RECYCLER_BATCHES, INITIAL_IMPACT_METRICS } from '../data/initialData';
import { WasteRateItem, PickupRequest, CollectorProfile, RecyclerBatch, ImpactMetrics, RecoveryItem } from '../types';

const STORAGE_KEYS = {
  RATES: 'kc_rates',
  PICKUPS: 'kc_pickups',
  COLLECTORS: 'kc_collectors',
  BATCHES: 'kc_batches',
  METRICS: 'kc_metrics',
  RECOVERY: 'kc_recovery',
};

// Auto-purge legacy mock items if present in localStorage
const purgeLegacyMockData = () => {
  try {
    if (typeof localStorage === 'undefined') return;
    const rawPickups = localStorage.getItem(STORAGE_KEYS.PICKUPS);
    if (rawPickups && (rawPickups.includes('pickup-8841') || rawPickups.includes('pickup-8842') || rawPickups.includes('col-101'))) {
      localStorage.removeItem(STORAGE_KEYS.PICKUPS);
    }
    const rawCollectors = localStorage.getItem(STORAGE_KEYS.COLLECTORS);
    if (rawCollectors && (rawCollectors.includes('Ramesh Kumar') || rawCollectors.includes('col-101'))) {
      localStorage.removeItem(STORAGE_KEYS.COLLECTORS);
    }
    // Clean any old certificate cache
    localStorage.removeItem('kc_certificates');
    const rawBatches = localStorage.getItem(STORAGE_KEYS.BATCHES);
    if (rawBatches && rawBatches.includes('batch-rec-501')) {
      localStorage.removeItem(STORAGE_KEYS.BATCHES);
    }
  } catch {
    // ignore in non-browser env
  }
};
purgeLegacyMockData();

type Listener = () => void;
const listeners = new Set<Listener>();

export const notifyListeners = () => {
  listeners.forEach((l) => l());
};

export const subscribeToStorage = (listener: Listener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

// Generic LocalStorage helper with fallback to initial seed data
export const getStored = <T>(key: string, defaultData: T): T => {
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      localStorage.setItem(key, JSON.stringify(defaultData));
      return defaultData;
    }
    return JSON.parse(item);
  } catch {
    return defaultData;
  }
};

export const setStored = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    notifyListeners();
  } catch (e) {
    console.error('LocalStorage error:', e);
  }
};

export const StorageManager = {
  getStored,
  setStored,

  getRates: (): WasteRateItem[] => getStored(STORAGE_KEYS.RATES, INITIAL_WASTE_RATES),
  saveRates: (rates: WasteRateItem[]) => setStored(STORAGE_KEYS.RATES, rates),

  getPickups: (): PickupRequest[] => getStored(STORAGE_KEYS.PICKUPS, INITIAL_PICKUPS),
  savePickups: (pickups: PickupRequest[]) => setStored(STORAGE_KEYS.PICKUPS, pickups),

  getCollectors: (): CollectorProfile[] => getStored(STORAGE_KEYS.COLLECTORS, INITIAL_COLLECTORS),
  saveCollectors: (collectors: CollectorProfile[]) => setStored(STORAGE_KEYS.COLLECTORS, collectors),

  getBatches: (): RecyclerBatch[] => getStored(STORAGE_KEYS.BATCHES, INITIAL_RECYCLER_BATCHES),
  saveBatches: (batches: RecyclerBatch[]) => setStored(STORAGE_KEYS.BATCHES, batches),

  getMetrics: (): ImpactMetrics => getStored(STORAGE_KEYS.METRICS, INITIAL_IMPACT_METRICS),
  saveMetrics: (metrics: ImpactMetrics) => setStored(STORAGE_KEYS.METRICS, metrics),

  getRecoveryItems: (): RecoveryItem[] => getStored<RecoveryItem[]>(STORAGE_KEYS.RECOVERY, []),
  saveRecoveryItems: (items: RecoveryItem[]) => setStored(STORAGE_KEYS.RECOVERY, items),

  resetToDefaults: () => {
    localStorage.setItem(STORAGE_KEYS.RATES, JSON.stringify(INITIAL_WASTE_RATES));
    localStorage.setItem(STORAGE_KEYS.PICKUPS, JSON.stringify(INITIAL_PICKUPS));
    localStorage.setItem(STORAGE_KEYS.COLLECTORS, JSON.stringify(INITIAL_COLLECTORS));
    localStorage.removeItem('kc_certificates');
    localStorage.setItem(STORAGE_KEYS.BATCHES, JSON.stringify(INITIAL_RECYCLER_BATCHES));
    localStorage.setItem(STORAGE_KEYS.METRICS, JSON.stringify(INITIAL_IMPACT_METRICS));
    localStorage.setItem(STORAGE_KEYS.RECOVERY, JSON.stringify([]));
    notifyListeners();
  }
};

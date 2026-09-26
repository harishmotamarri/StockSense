import {
  Product,
  Warehouse,
  WarehouseLocation,
  Receipt,
  Delivery,
  Transfer,
  Adjustment,
  StockMovement,
  User,
} from '../types';
import {
  INITIAL_ADJUSTMENTS,
  INITIAL_DELIVERIES,
  INITIAL_LOCATIONS,
  INITIAL_MOVEMENTS,
  INITIAL_PRODUCTS,
  INITIAL_RECEIPTS,
  INITIAL_TRANSFERS,
  INITIAL_USERS,
  INITIAL_WAREHOUSES,
} from './mockData';

const STORAGE_KEYS = {
  PRODUCTS: 'stocksense_products_v1',
  WAREHOUSES: 'stocksense_warehouses_v1',
  LOCATIONS: 'stocksense_locations_v1',
  RECEIPTS: 'stocksense_receipts_v1',
  DELIVERIES: 'stocksense_deliveries_v1',
  TRANSFERS: 'stocksense_transfers_v1',
  ADJUSTMENTS: 'stocksense_adjustments_v1',
  MOVEMENTS: 'stocksense_movements_v1',
  CURRENT_USER: 'stocksense_current_user_v1',
  SETTINGS: 'stocksense_settings_v1',
};

function safeGet<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Error reading ${key} from localStorage`, e);
    return defaultValue;
  }
}

function safeSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error writing ${key} to localStorage`, e);
  }
}

export interface AppSettings {
  defaultUnit: string;
  defaultLowStockThreshold: number;
  allowNegativeStock: boolean;
  autoSKU: boolean;
  emailAlerts: boolean;
  notifyLowStock: boolean;
  notifyPendingOverdue: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  defaultUnit: 'PCS',
  defaultLowStockThreshold: 50,
  allowNegativeStock: false,
  autoSKU: true,
  emailAlerts: true,
  notifyLowStock: true,
  notifyPendingOverdue: true,
};

class StorageService {
  getProducts(): Product[] {
    return safeGet<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  }

  setProducts(products: Product[]): void {
    safeSet(STORAGE_KEYS.PRODUCTS, products);
  }

  getWarehouses(): Warehouse[] {
    return safeGet<Warehouse[]>(STORAGE_KEYS.WAREHOUSES, INITIAL_WAREHOUSES);
  }

  setWarehouses(warehouses: Warehouse[]): void {
    safeSet(STORAGE_KEYS.WAREHOUSES, warehouses);
  }

  getLocations(): WarehouseLocation[] {
    return safeGet<WarehouseLocation[]>(STORAGE_KEYS.LOCATIONS, INITIAL_LOCATIONS);
  }

  setLocations(locations: WarehouseLocation[]): void {
    safeSet(STORAGE_KEYS.LOCATIONS, locations);
  }

  getReceipts(): Receipt[] {
    return safeGet<Receipt[]>(STORAGE_KEYS.RECEIPTS, INITIAL_RECEIPTS);
  }

  setReceipts(receipts: Receipt[]): void {
    safeSet(STORAGE_KEYS.RECEIPTS, receipts);
  }

  getDeliveries(): Delivery[] {
    return safeGet<Delivery[]>(STORAGE_KEYS.DELIVERIES, INITIAL_DELIVERIES);
  }

  setDeliveries(deliveries: Delivery[]): void {
    safeSet(STORAGE_KEYS.DELIVERIES, deliveries);
  }

  getTransfers(): Transfer[] {
    return safeGet<Transfer[]>(STORAGE_KEYS.TRANSFERS, INITIAL_TRANSFERS);
  }

  setTransfers(transfers: Transfer[]): void {
    safeSet(STORAGE_KEYS.TRANSFERS, transfers);
  }

  getAdjustments(): Adjustment[] {
    return safeGet<Adjustment[]>(STORAGE_KEYS.ADJUSTMENTS, INITIAL_ADJUSTMENTS);
  }

  setAdjustments(adjustments: Adjustment[]): void {
    safeSet(STORAGE_KEYS.ADJUSTMENTS, adjustments);
  }

  getMovements(): StockMovement[] {
    return safeGet<StockMovement[]>(STORAGE_KEYS.MOVEMENTS, INITIAL_MOVEMENTS);
  }

  setMovements(movements: StockMovement[]): void {
    safeSet(STORAGE_KEYS.MOVEMENTS, movements);
  }

  getCurrentUser(): User {
    return safeGet<User>(STORAGE_KEYS.CURRENT_USER, INITIAL_USERS[0]);
  }

  setCurrentUser(user: User): void {
    safeSet(STORAGE_KEYS.CURRENT_USER, user);
  }

  getSettings(): AppSettings {
    return safeGet<AppSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  }

  setSettings(settings: AppSettings): void {
    safeSet(STORAGE_KEYS.SETTINGS, settings);
  }

  resetAllData(): void {
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.WAREHOUSES);
    localStorage.removeItem(STORAGE_KEYS.LOCATIONS);
    localStorage.removeItem(STORAGE_KEYS.RECEIPTS);
    localStorage.removeItem(STORAGE_KEYS.DELIVERIES);
    localStorage.removeItem(STORAGE_KEYS.TRANSFERS);
    localStorage.removeItem(STORAGE_KEYS.ADJUSTMENTS);
    localStorage.removeItem(STORAGE_KEYS.MOVEMENTS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  }
}

export const storage = new StorageService();

export type UserRole = 'INVENTORY_MANAGER' | 'WAREHOUSE_STAFF';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  warehouseId?: string;
  warehouseName?: string;
  createdAt: string;
}

export type UnitOfMeasure = 'PCS' | 'KG' | 'G' | 'L' | 'ML' | 'BOX' | 'M' | 'SET';

export interface ProductLocationStock {
  warehouseId: string;
  warehouseName: string;
  locationId: string;
  locationCode: string;
  quantity: number;
}

export type ProductStatus = 'In Stock' | 'Low Stock' | 'Out of Stock';

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  unit: UnitOfMeasure;
  reorderLevel: number;
  description?: string;
  totalStock: number;
  availableStock: number;
  reservedStock: number;
  status: ProductStatus;
  locations: ProductLocationStock[];
  unitCost?: number;
  createdAt: string;
  updatedAt: string;
}

export interface WarehouseLocation {
  id: string;
  warehouseId: string;
  warehouseName: string;
  name: string;
  code: string;
  zone: string;
  capacity: number;
  productCount: number;
  currentQuantity: number;
}

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  address: string;
  status: 'Active' | 'Inactive';
  manager: string;
  locationsCount: number;
  productCount: number;
  totalUnits: number;
}

export type DocumentStatus = 'Draft' | 'Waiting' | 'Ready' | 'Done' | 'Canceled';

export interface ReceiptItem {
  productId: string;
  productName: string;
  sku: string;
  unit: UnitOfMeasure;
  expectedQuantity: number;
  receivedQuantity: number;
}

export interface Receipt {
  id: string;
  receiptNumber: string;
  supplier: string;
  warehouseId: string;
  warehouseName: string;
  destinationLocationId: string;
  destinationLocationCode: string;
  items: ReceiptItem[];
  expectedDate: string;
  createdBy: string;
  createdAt: string;
  status: DocumentStatus;
  notes?: string;
}

export type DeliveryStage = 'draft' | 'picking' | 'packing' | 'validated';

export interface DeliveryItem {
  productId: string;
  productName: string;
  sku: string;
  unit: UnitOfMeasure;
  requestedQuantity: number;
  pickedQuantity: number;
  packedQuantity: number;
  availableStock: number;
}

export interface Delivery {
  id: string;
  deliveryNumber: string;
  customer: string;
  warehouseId: string;
  warehouseName: string;
  sourceLocationId: string;
  sourceLocationCode: string;
  items: DeliveryItem[];
  deliveryDate: string;
  createdBy: string;
  createdAt: string;
  status: DocumentStatus;
  stage: DeliveryStage;
  notes?: string;
}

export interface TransferItem {
  productId: string;
  productName: string;
  sku: string;
  unit: UnitOfMeasure;
  availableQuantity: number;
  transferQuantity: number;
}

export interface Transfer {
  id: string;
  transferNumber: string;
  sourceWarehouseId: string;
  sourceWarehouseName: string;
  sourceLocationId: string;
  sourceLocationCode: string;
  destWarehouseId: string;
  destWarehouseName: string;
  destLocationId: string;
  destLocationCode: string;
  items: TransferItem[];
  status: DocumentStatus;
  createdBy: string;
  createdAt: string;
  notes?: string;
}

export type AdjustmentReason = 'Damaged' | 'Lost' | 'Found' | 'Counting Error' | 'Expired' | 'Other';

export interface Adjustment {
  id: string;
  adjustmentNumber: string;
  warehouseId: string;
  warehouseName: string;
  locationId: string;
  locationCode: string;
  productId: string;
  productName: string;
  sku: string;
  unit: UnitOfMeasure;
  systemQuantity: number;
  physicalCount: number;
  difference: number;
  reason: AdjustmentReason;
  notes?: string;
  status: 'Draft' | 'Applied' | 'Canceled';
  createdBy: string;
  createdAt: string;
}

export type MovementType = 'Receipt' | 'Delivery' | 'Transfer In' | 'Transfer Out' | 'Adjustment' | 'Opening Balance';

export interface StockMovement {
  id: string;
  timestamp: string;
  reference: string;
  referenceType: MovementType;
  productId: string;
  productName: string;
  sku: string;
  unit: UnitOfMeasure;
  fromWarehouse?: string;
  fromLocation?: string;
  toWarehouse?: string;
  toLocation?: string;
  quantity: number; // positive for additions, negative for reductions
  beforeQuantity: number;
  afterQuantity: number;
  reason?: string;
  user: string;
}

export interface DashboardKPIs {
  totalProductsInStock: number;
  lowStockItemsCount: number;
  outOfStockItemsCount: number;
  pendingReceiptsCount: number;
  pendingDeliveriesCount: number;
  internalTransfersCount: number;
}

export interface InventoryCategoryStat {
  category: string;
  count: number;
  totalQuantity: number;
  percentage: number;
}

export interface InventoryTrendPoint {
  date: string;
  inbound: number;
  outbound: number;
  totalStock: number;
}

export interface PendingOperation {
  id: string;
  documentNumber: string;
  type: 'Receipt' | 'Delivery' | 'Transfer';
  warehouse: string;
  date: string;
  status: DocumentStatus;
  itemCount: number;
}

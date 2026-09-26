import {
  Product,
  Warehouse,
  WarehouseLocation,
  Receipt,
  Delivery,
  Transfer,
  Adjustment,
  StockMovement,
  DashboardKPIs,
  InventoryCategoryStat,
  InventoryTrendPoint,
  PendingOperation,
  UnitOfMeasure,
  ProductStatus,
} from '../../types';
import { storage } from '../storage';

const delay = (ms = 80) => new Promise((resolve) => setTimeout(resolve, ms));

function computeProductStatus(totalStock: number, reorderLevel: number): ProductStatus {
  if (totalStock <= 0) return 'Out of Stock';
  if (totalStock <= reorderLevel) return 'Low Stock';
  return 'In Stock';
}

// ---------------- PRODUCTS API ----------------
export async function getProducts(options?: {
  search?: string;
  category?: string;
  status?: string;
  warehouseId?: string;
}): Promise<Product[]> {
  await delay();
  let products = storage.getProducts();

  if (options?.search) {
    const q = options.search.toLowerCase();
    products = products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
    );
  }

  if (options?.category && options.category !== 'all') {
    products = products.filter((p) => p.category === options.category);
  }

  if (options?.status && options.status !== 'all') {
    products = products.filter((p) => p.status === options.status);
  }

  if (options?.warehouseId && options.warehouseId !== 'all') {
    products = products.filter((p) =>
      p.locations.some((loc) => loc.warehouseId === options.warehouseId && loc.quantity > 0)
    );
  }

  return products;
}

export async function getProductById(id: string): Promise<Product | null> {
  await delay();
  const products = storage.getProducts();
  return products.find((p) => p.id === id) || null;
}

export async function createProduct(input: {
  name: string;
  sku: string;
  category: string;
  unit: UnitOfMeasure;
  reorderLevel: number;
  description?: string;
  initialStock?: number;
  initialWarehouseId?: string;
  initialLocationId?: string;
}): Promise<Product> {
  await delay();
  const products = storage.getProducts();

  if (products.some((p) => p.sku.toLowerCase() === input.sku.toLowerCase())) {
    throw new Error(`SKU '${input.sku}' already exists in inventory.`);
  }

  const initialStock = input.initialStock || 0;
  const status = computeProductStatus(initialStock, input.reorderLevel);

  let initialLocations = [];
  if (initialStock > 0 && input.initialWarehouseId && input.initialLocationId) {
    const warehouses = storage.getWarehouses();
    const locations = storage.getLocations();
    const wh = warehouses.find((w) => w.id === input.initialWarehouseId);
    const loc = locations.find((l) => l.id === input.initialLocationId);

    initialLocations.push({
      warehouseId: input.initialWarehouseId,
      warehouseName: wh ? wh.name : 'Main Warehouse',
      locationId: input.initialLocationId,
      locationCode: loc ? loc.code : 'LOC-DEF',
      quantity: initialStock,
    });
  }

  const newProduct: Product = {
    id: `PRD-${String(products.length + 1).padStart(3, '0')}`,
    name: input.name,
    sku: input.sku.toUpperCase(),
    category: input.category,
    unit: input.unit,
    reorderLevel: input.reorderLevel,
    description: input.description,
    totalStock: initialStock,
    availableStock: initialStock,
    reservedStock: 0,
    status,
    locations: initialLocations,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  storage.setProducts([newProduct, ...products]);

  // Log movement if initial stock provided
  if (initialStock > 0 && initialLocations.length > 0) {
    const user = storage.getCurrentUser();
    const movement: StockMovement = {
      id: `MOV-${Date.now()}`,
      timestamp: new Date().toISOString(),
      reference: `INIT-${newProduct.sku}`,
      referenceType: 'Opening Balance',
      productId: newProduct.id,
      productName: newProduct.name,
      sku: newProduct.sku,
      unit: newProduct.unit,
      toWarehouse: initialLocations[0].warehouseName,
      toLocation: initialLocations[0].locationCode,
      quantity: initialStock,
      beforeQuantity: 0,
      afterQuantity: initialStock,
      reason: 'Initial stock intake on product creation',
      user: user.name,
    };
    storage.setMovements([movement, ...storage.getMovements()]);
  }

  return newProduct;
}

export async function updateProduct(
  id: string,
  updates: Partial<Omit<Product, 'id' | 'locations' | 'totalStock' | 'availableStock' | 'reservedStock'>>
): Promise<Product> {
  await delay();
  const products = storage.getProducts();
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) throw new Error('Product not found');

  const existing = products[index];
  const updated: Product = {
    ...existing,
    ...updates,
    status: computeProductStatus(existing.totalStock, updates.reorderLevel ?? existing.reorderLevel),
    updatedAt: new Date().toISOString(),
  };

  products[index] = updated;
  storage.setProducts(products);
  return updated;
}

export async function deleteProduct(id: string): Promise<void> {
  await delay();
  const products = storage.getProducts();
  const product = products.find((p) => p.id === id);
  if (!product) throw new Error('Product not found');

  if (product.totalStock > 0) {
    throw new Error('Cannot delete product with existing stock. Please adjust or transfer stock to zero first.');
  }

  storage.setProducts(products.filter((p) => p.id !== id));
}

// ---------------- RECEIPTS API ----------------
export async function getReceipts(options?: {
  search?: string;
  status?: string;
  warehouseId?: string;
  supplier?: string;
}): Promise<Receipt[]> {
  await delay();
  let receipts = storage.getReceipts();

  if (options?.search) {
    const q = options.search.toLowerCase();
    receipts = receipts.filter(
      (r) =>
        r.receiptNumber.toLowerCase().includes(q) ||
        r.supplier.toLowerCase().includes(q) ||
        r.items.some((i) => i.productName.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q))
    );
  }

  if (options?.status && options.status !== 'all') {
    receipts = receipts.filter((r) => r.status === options.status);
  }

  if (options?.warehouseId && options.warehouseId !== 'all') {
    receipts = receipts.filter((r) => r.warehouseId === options.warehouseId);
  }

  if (options?.supplier && options.supplier !== 'all') {
    receipts = receipts.filter((r) => r.supplier === options.supplier);
  }

  return receipts;
}

export async function getReceiptById(id: string): Promise<Receipt | null> {
  await delay();
  const receipts = storage.getReceipts();
  return receipts.find((r) => r.id === id) || null;
}

export async function createReceipt(data: Omit<Receipt, 'id' | 'receiptNumber' | 'createdAt' | 'createdBy' | 'status'> & { status?: Receipt['status'] }): Promise<Receipt> {
  await delay();
  const receipts = storage.getReceipts();
  const currentUser = storage.getCurrentUser();
  const year = new Date().getFullYear();
  const seq = String(receipts.length + 90).padStart(3, '0');

  const newReceipt: Receipt = {
    id: `REC-${Date.now()}`,
    receiptNumber: `REC-${year}-${seq}`,
    supplier: data.supplier,
    warehouseId: data.warehouseId,
    warehouseName: data.warehouseName,
    destinationLocationId: data.destinationLocationId,
    destinationLocationCode: data.destinationLocationCode,
    items: data.items,
    expectedDate: data.expectedDate,
    createdBy: currentUser.name,
    createdAt: new Date().toISOString(),
    status: data.status || 'Draft',
    notes: data.notes,
  };

  storage.setReceipts([newReceipt, ...receipts]);
  return newReceipt;
}

export async function advanceReceiptStatus(id: string): Promise<Receipt> {
  await delay();
  const receipts = storage.getReceipts();
  const receipt = receipts.find((r) => r.id === id);
  if (!receipt) throw new Error('Receipt not found');

  if (receipt.status === 'Draft') receipt.status = 'Waiting';
  else if (receipt.status === 'Waiting') receipt.status = 'Ready';
  else throw new Error(`Cannot advance receipt from status ${receipt.status}`);

  storage.setReceipts([...receipts]);
  return receipt;
}

export async function validateReceipt(id: string): Promise<Receipt> {
  await delay();
  const receipts = storage.getReceipts();
  const receipt = receipts.find((r) => r.id === id);
  if (!receipt) throw new Error('Receipt not found');
  if (receipt.status === 'Done') {
    throw new Error('Unable to validate receipt. The receipt is already marked as Done.');
  }
  if (receipt.status === 'Canceled') {
    throw new Error('Unable to validate a canceled receipt.');
  }

  // Update product inventory stock
  const products = storage.getProducts();
  const movements = storage.getMovements();
  const user = storage.getCurrentUser();

  for (const item of receipt.items) {
    const qtyToAdd = item.expectedQuantity;
    item.receivedQuantity = qtyToAdd;

    const product = products.find((p) => p.id === item.productId);
    if (product) {
      const beforeQty = product.totalStock;
      product.totalStock += qtyToAdd;
      product.availableStock += qtyToAdd;
      product.status = computeProductStatus(product.totalStock, product.reorderLevel);

      // update or add location stock
      const locIndex = product.locations.findIndex(
        (l) => l.warehouseId === receipt.warehouseId && l.locationId === receipt.destinationLocationId
      );
      if (locIndex >= 0) {
        product.locations[locIndex].quantity += qtyToAdd;
      } else {
        product.locations.push({
          warehouseId: receipt.warehouseId,
          warehouseName: receipt.warehouseName,
          locationId: receipt.destinationLocationId,
          locationCode: receipt.destinationLocationCode,
          quantity: qtyToAdd,
        });
      }

      // Record movement
      movements.unshift({
        id: `MOV-${Date.now()}-${item.productId}`,
        timestamp: new Date().toISOString(),
        reference: receipt.receiptNumber,
        referenceType: 'Receipt',
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        unit: product.unit,
        toWarehouse: receipt.warehouseName,
        toLocation: receipt.destinationLocationCode,
        quantity: qtyToAdd,
        beforeQuantity: beforeQty,
        afterQuantity: product.totalStock,
        reason: `Goods receipt from ${receipt.supplier}`,
        user: user.name,
      });
    }
  }

  receipt.status = 'Done';
  storage.setProducts(products);
  storage.setMovements(movements);
  storage.setReceipts([...receipts]);
  return receipt;
}

export async function cancelReceipt(id: string): Promise<Receipt> {
  await delay();
  const receipts = storage.getReceipts();
  const receipt = receipts.find((r) => r.id === id);
  if (!receipt) throw new Error('Receipt not found');
  if (receipt.status === 'Done') throw new Error('Cannot cancel a validated receipt.');

  receipt.status = 'Canceled';
  storage.setReceipts([...receipts]);
  return receipt;
}

// ---------------- DELIVERIES API ----------------
export async function getDeliveries(options?: {
  search?: string;
  status?: string;
  warehouseId?: string;
}): Promise<Delivery[]> {
  await delay();
  let deliveries = storage.getDeliveries();

  if (options?.search) {
    const q = options.search.toLowerCase();
    deliveries = deliveries.filter(
      (d) =>
        d.deliveryNumber.toLowerCase().includes(q) ||
        d.customer.toLowerCase().includes(q) ||
        d.items.some((i) => i.productName.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q))
    );
  }

  if (options?.status && options.status !== 'all') {
    deliveries = deliveries.filter((d) => d.status === options.status);
  }

  if (options?.warehouseId && options.warehouseId !== 'all') {
    deliveries = deliveries.filter((d) => d.warehouseId === options.warehouseId);
  }

  return deliveries;
}

export async function getDeliveryById(id: string): Promise<Delivery | null> {
  await delay();
  const deliveries = storage.getDeliveries();
  return deliveries.find((d) => d.id === id) || null;
}

export async function createDelivery(data: Omit<Delivery, 'id' | 'deliveryNumber' | 'createdAt' | 'createdBy' | 'status' | 'stage'>): Promise<Delivery> {
  await delay();
  const deliveries = storage.getDeliveries();
  const currentUser = storage.getCurrentUser();
  const products = storage.getProducts();
  const year = new Date().getFullYear();
  const seq = String(deliveries.length + 56).padStart(3, '0');

  // Verify stock sufficiency
  for (const item of data.items) {
    const p = products.find((prod) => prod.id === item.productId);
    const available = p ? p.availableStock : 0;
    if (available < item.requestedQuantity) {
      throw new Error(
        `Insufficient stock for ${item.productName}. Requested: ${item.requestedQuantity} ${item.unit}. Available: ${available} ${item.unit}.`
      );
    }
  }

  // Reserve stock
  for (const item of data.items) {
    const p = products.find((prod) => prod.id === item.productId);
    if (p) {
      p.availableStock -= item.requestedQuantity;
      p.reservedStock += item.requestedQuantity;
    }
  }
  storage.setProducts(products);

  const newDelivery: Delivery = {
    id: `DEL-${Date.now()}`,
    deliveryNumber: `DO-${year}-${seq}`,
    customer: data.customer,
    warehouseId: data.warehouseId,
    warehouseName: data.warehouseName,
    sourceLocationId: data.sourceLocationId,
    sourceLocationCode: data.sourceLocationCode,
    items: data.items.map((i) => ({
      ...i,
      pickedQuantity: 0,
      packedQuantity: 0,
    })),
    deliveryDate: data.deliveryDate,
    createdBy: currentUser.name,
    createdAt: new Date().toISOString(),
    status: 'Waiting',
    stage: 'draft',
    notes: data.notes,
  };

  storage.setDeliveries([newDelivery, ...deliveries]);
  return newDelivery;
}

export async function startPickingDelivery(id: string): Promise<Delivery> {
  await delay();
  const deliveries = storage.getDeliveries();
  const delivery = deliveries.find((d) => d.id === id);
  if (!delivery) throw new Error('Delivery not found');
  if (delivery.status === 'Done' || delivery.status === 'Canceled') {
    throw new Error(`Cannot pick delivery with status ${delivery.status}`);
  }

  delivery.stage = 'picking';
  delivery.status = 'Ready';
  delivery.items.forEach((item) => {
    item.pickedQuantity = item.requestedQuantity;
  });

  storage.setDeliveries([...deliveries]);
  return delivery;
}

export async function markDeliveryPacked(id: string): Promise<Delivery> {
  await delay();
  const deliveries = storage.getDeliveries();
  const delivery = deliveries.find((d) => d.id === id);
  if (!delivery) throw new Error('Delivery not found');

  delivery.stage = 'packing';
  delivery.status = 'Ready';
  delivery.items.forEach((item) => {
    item.packedQuantity = item.requestedQuantity;
  });

  storage.setDeliveries([...deliveries]);
  return delivery;
}

export async function validateDelivery(id: string): Promise<Delivery> {
  await delay();
  const deliveries = storage.getDeliveries();
  const delivery = deliveries.find((d) => d.id === id);
  if (!delivery) throw new Error('Delivery not found');
  if (delivery.status === 'Done') {
    throw new Error('Unable to validate delivery. The delivery order is already marked as Done.');
  }

  const products = storage.getProducts();
  const movements = storage.getMovements();
  const user = storage.getCurrentUser();

  // Deduct actual inventory stock
  for (const item of delivery.items) {
    const product = products.find((p) => p.id === item.productId);
    if (product) {
      if (product.totalStock < item.requestedQuantity) {
        throw new Error(
          `Insufficient stock. Requested: ${item.requestedQuantity} ${item.unit}. Available: ${product.totalStock} ${item.unit}.`
        );
      }

      const beforeQty = product.totalStock;
      product.totalStock -= item.requestedQuantity;
      product.reservedStock = Math.max(0, product.reservedStock - item.requestedQuantity);
      product.status = computeProductStatus(product.totalStock, product.reorderLevel);

      // Deduct from location
      const loc = product.locations.find(
        (l) => l.warehouseId === delivery.warehouseId && l.locationId === delivery.sourceLocationId
      );
      if (loc) {
        loc.quantity = Math.max(0, loc.quantity - item.requestedQuantity);
      }

      // Record movement
      movements.unshift({
        id: `MOV-${Date.now()}-${item.productId}`,
        timestamp: new Date().toISOString(),
        reference: delivery.deliveryNumber,
        referenceType: 'Delivery',
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        unit: product.unit,
        fromWarehouse: delivery.warehouseName,
        fromLocation: delivery.sourceLocationCode,
        quantity: -item.requestedQuantity,
        beforeQuantity: beforeQty,
        afterQuantity: product.totalStock,
        reason: `Customer delivery to ${delivery.customer}`,
        user: user.name,
      });
    }
  }

  delivery.status = 'Done';
  delivery.stage = 'validated';
  storage.setProducts(products);
  storage.setMovements(movements);
  storage.setDeliveries([...deliveries]);
  return delivery;
}

export async function cancelDelivery(id: string): Promise<Delivery> {
  await delay();
  const deliveries = storage.getDeliveries();
  const delivery = deliveries.find((d) => d.id === id);
  if (!delivery) throw new Error('Delivery not found');
  if (delivery.status === 'Done') throw new Error('Cannot cancel a validated delivery.');

  // Release reserved stock
  const products = storage.getProducts();
  for (const item of delivery.items) {
    const p = products.find((prod) => prod.id === item.productId);
    if (p) {
      p.reservedStock = Math.max(0, p.reservedStock - item.requestedQuantity);
      p.availableStock += item.requestedQuantity;
    }
  }
  storage.setProducts(products);

  delivery.status = 'Canceled';
  storage.setDeliveries([...deliveries]);
  return delivery;
}

// ---------------- INTERNAL TRANSFERS API ----------------
export async function getTransfers(options?: {
  search?: string;
  status?: string;
}): Promise<Transfer[]> {
  await delay();
  let transfers = storage.getTransfers();

  if (options?.search) {
    const q = options.search.toLowerCase();
    transfers = transfers.filter(
      (t) =>
        t.transferNumber.toLowerCase().includes(q) ||
        t.sourceWarehouseName.toLowerCase().includes(q) ||
        t.destWarehouseName.toLowerCase().includes(q) ||
        t.items.some((i) => i.productName.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q))
    );
  }

  if (options?.status && options.status !== 'all') {
    transfers = transfers.filter((t) => t.status === options.status);
  }

  return transfers;
}

export async function getTransferById(id: string): Promise<Transfer | null> {
  await delay();
  const transfers = storage.getTransfers();
  return transfers.find((t) => t.id === id) || null;
}

export async function createTransfer(data: Omit<Transfer, 'id' | 'transferNumber' | 'createdAt' | 'createdBy' | 'status'>): Promise<Transfer> {
  await delay();
  const transfers = storage.getTransfers();
  const currentUser = storage.getCurrentUser();
  const year = new Date().getFullYear();
  const seq = String(transfers.length + 19).padStart(3, '0');

  const newTransfer: Transfer = {
    id: `TRF-${Date.now()}`,
    transferNumber: `TRF-${year}-${seq}`,
    sourceWarehouseId: data.sourceWarehouseId,
    sourceWarehouseName: data.sourceWarehouseName,
    sourceLocationId: data.sourceLocationId,
    sourceLocationCode: data.sourceLocationCode,
    destWarehouseId: data.destWarehouseId,
    destWarehouseName: data.destWarehouseName,
    destLocationId: data.destLocationId,
    destLocationCode: data.destLocationCode,
    items: data.items,
    status: 'Waiting',
    createdBy: currentUser.name,
    createdAt: new Date().toISOString(),
    notes: data.notes,
  };

  storage.setTransfers([newTransfer, ...transfers]);
  return newTransfer;
}

export async function advanceTransferStatus(id: string): Promise<Transfer> {
  await delay();
  const transfers = storage.getTransfers();
  const transfer = transfers.find((t) => t.id === id);
  if (!transfer) throw new Error('Transfer not found');

  if (transfer.status === 'Draft') transfer.status = 'Waiting';
  else if (transfer.status === 'Waiting') transfer.status = 'Ready';
  else throw new Error(`Cannot advance transfer from status ${transfer.status}`);

  storage.setTransfers([...transfers]);
  return transfer;
}

export async function validateTransfer(id: string): Promise<Transfer> {
  await delay();
  const transfers = storage.getTransfers();
  const transfer = transfers.find((t) => t.id === id);
  if (!transfer) throw new Error('Transfer not found');
  if (transfer.status === 'Done') throw new Error('Transfer is already validated.');

  const products = storage.getProducts();
  const movements = storage.getMovements();
  const user = storage.getCurrentUser();

  for (const item of transfer.items) {
    const product = products.find((p) => p.id === item.productId);
    if (product) {
      // Find source location
      const srcLoc = product.locations.find(
        (l) => l.warehouseId === transfer.sourceWarehouseId && l.locationId === transfer.sourceLocationId
      );
      if (!srcLoc || srcLoc.quantity < item.transferQuantity) {
        throw new Error(
          `Insufficient stock at ${transfer.sourceLocationCode}. Available: ${srcLoc ? srcLoc.quantity : 0}, requested: ${item.transferQuantity}`
        );
      }

      // Decrement source location
      srcLoc.quantity -= item.transferQuantity;

      // Increment dest location
      const dstLoc = product.locations.find(
        (l) => l.warehouseId === transfer.destWarehouseId && l.locationId === transfer.destLocationId
      );
      if (dstLoc) {
        dstLoc.quantity += item.transferQuantity;
      } else {
        product.locations.push({
          warehouseId: transfer.destWarehouseId,
          warehouseName: transfer.destWarehouseName,
          locationId: transfer.destLocationId,
          locationCode: transfer.destLocationCode,
          quantity: item.transferQuantity,
        });
      }

      // Log two movements: Transfer Out and Transfer In
      movements.unshift({
        id: `MOV-${Date.now()}-out`,
        timestamp: new Date().toISOString(),
        reference: transfer.transferNumber,
        referenceType: 'Transfer Out',
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        unit: product.unit,
        fromWarehouse: transfer.sourceWarehouseName,
        fromLocation: transfer.sourceLocationCode,
        toWarehouse: transfer.destWarehouseName,
        toLocation: transfer.destLocationCode,
        quantity: -item.transferQuantity,
        beforeQuantity: srcLoc.quantity + item.transferQuantity,
        afterQuantity: srcLoc.quantity,
        reason: 'Internal transfer dispatch',
        user: user.name,
      });

      movements.unshift({
        id: `MOV-${Date.now()}-in`,
        timestamp: new Date().toISOString(),
        reference: transfer.transferNumber,
        referenceType: 'Transfer In',
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        unit: product.unit,
        fromWarehouse: transfer.sourceWarehouseName,
        fromLocation: transfer.sourceLocationCode,
        toWarehouse: transfer.destWarehouseName,
        toLocation: transfer.destLocationCode,
        quantity: item.transferQuantity,
        beforeQuantity: (dstLoc?.quantity ?? 0) - item.transferQuantity,
        afterQuantity: dstLoc ? dstLoc.quantity : item.transferQuantity,
        reason: 'Internal transfer reception',
        user: user.name,
      });
    }
  }

  transfer.status = 'Done';
  storage.setProducts(products);
  storage.setMovements(movements);
  storage.setTransfers([...transfers]);
  return transfer;
}

export async function cancelTransfer(id: string): Promise<Transfer> {
  await delay();
  const transfers = storage.getTransfers();
  const transfer = transfers.find((t) => t.id === id);
  if (!transfer) throw new Error('Transfer not found');
  if (transfer.status === 'Done') throw new Error('Cannot cancel a completed transfer.');

  transfer.status = 'Canceled';
  storage.setTransfers([...transfers]);
  return transfer;
}

// ---------------- ADJUSTMENTS API ----------------
export async function getAdjustments(options?: {
  search?: string;
  status?: string;
  reason?: string;
}): Promise<Adjustment[]> {
  await delay();
  let adjustments = storage.getAdjustments();

  if (options?.search) {
    const q = options.search.toLowerCase();
    adjustments = adjustments.filter(
      (a) =>
        a.adjustmentNumber.toLowerCase().includes(q) ||
        a.productName.toLowerCase().includes(q) ||
        a.sku.toLowerCase().includes(q) ||
        a.locationCode.toLowerCase().includes(q)
    );
  }

  if (options?.status && options.status !== 'all') {
    adjustments = adjustments.filter((a) => a.status === options.status);
  }

  if (options?.reason && options.reason !== 'all') {
    adjustments = adjustments.filter((a) => a.reason === options.reason);
  }

  return adjustments;
}

export async function getAdjustmentById(id: string): Promise<Adjustment | null> {
  await delay();
  const adjustments = storage.getAdjustments();
  return adjustments.find((a) => a.id === id) || null;
}

export async function createAdjustment(data: Omit<Adjustment, 'id' | 'adjustmentNumber' | 'createdAt' | 'createdBy' | 'difference' | 'status'> & { status?: Adjustment['status']; autoApply?: boolean }): Promise<Adjustment> {
  await delay();
  const adjustments = storage.getAdjustments();
  const user = storage.getCurrentUser();
  const year = new Date().getFullYear();
  const seq = String(adjustments.length + 14).padStart(3, '0');
  const difference = data.physicalCount - data.systemQuantity;

  const newAdjustment: Adjustment = {
    id: `ADJ-${Date.now()}`,
    adjustmentNumber: `ADJ-${year}-${seq}`,
    warehouseId: data.warehouseId,
    warehouseName: data.warehouseName,
    locationId: data.locationId,
    locationCode: data.locationCode,
    productId: data.productId,
    productName: data.productName,
    sku: data.sku,
    unit: data.unit,
    systemQuantity: data.systemQuantity,
    physicalCount: data.physicalCount,
    difference,
    reason: data.reason,
    notes: data.notes,
    status: data.autoApply ? 'Applied' : 'Draft',
    createdBy: user.name,
    createdAt: new Date().toISOString(),
  };

  storage.setAdjustments([newAdjustment, ...adjustments]);

  if (data.autoApply) {
    await applyAdjustment(newAdjustment.id);
  }

  return newAdjustment;
}

export async function applyAdjustment(id: string): Promise<Adjustment> {
  await delay();
  const adjustments = storage.getAdjustments();
  const adj = adjustments.find((a) => a.id === id);
  if (!adj) throw new Error('Adjustment not found');
  if (adj.status === 'Applied') throw new Error('Adjustment has already been applied.');

  const products = storage.getProducts();
  const movements = storage.getMovements();
  const user = storage.getCurrentUser();

  const product = products.find((p) => p.id === adj.productId);
  if (product) {
    const beforeStock = product.totalStock;
    product.totalStock += adj.difference;
    product.availableStock = Math.max(0, product.availableStock + adj.difference);
    product.status = computeProductStatus(product.totalStock, product.reorderLevel);

    const loc = product.locations.find(
      (l) => l.warehouseId === adj.warehouseId && l.locationId === adj.locationId
    );
    if (loc) {
      loc.quantity = adj.physicalCount;
    } else {
      product.locations.push({
        warehouseId: adj.warehouseId,
        warehouseName: adj.warehouseName,
        locationId: adj.locationId,
        locationCode: adj.locationCode,
        quantity: adj.physicalCount,
      });
    }

    // Ledger record
    movements.unshift({
      id: `MOV-${Date.now()}`,
      timestamp: new Date().toISOString(),
      reference: adj.adjustmentNumber,
      referenceType: 'Adjustment',
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      unit: product.unit,
      fromWarehouse: adj.difference < 0 ? adj.warehouseName : undefined,
      fromLocation: adj.difference < 0 ? adj.locationCode : undefined,
      toWarehouse: adj.difference > 0 ? adj.warehouseName : undefined,
      toLocation: adj.difference > 0 ? adj.locationCode : undefined,
      quantity: adj.difference,
      beforeQuantity: beforeStock,
      afterQuantity: product.totalStock,
      reason: `${adj.reason}: ${adj.notes || 'Cycle count discrepancy'}`,
      user: user.name,
    });
  }

  adj.status = 'Applied';
  storage.setProducts(products);
  storage.setMovements(movements);
  storage.setAdjustments([...adjustments]);
  return adj;
}

export async function cancelAdjustment(id: string): Promise<Adjustment> {
  await delay();
  const adjustments = storage.getAdjustments();
  const adj = adjustments.find((a) => a.id === id);
  if (!adj) throw new Error('Adjustment not found');
  if (adj.status === 'Applied') throw new Error('Cannot cancel an applied adjustment.');

  adj.status = 'Canceled';
  storage.setAdjustments([...adjustments]);
  return adj;
}

// ---------------- MOVEMENTS / STOCK LEDGER API ----------------
export async function getMovements(options?: {
  search?: string;
  type?: string;
  warehouseId?: string;
  startDate?: string;
  endDate?: string;
}): Promise<StockMovement[]> {
  await delay();
  let movements = storage.getMovements();

  if (options?.search) {
    const q = options.search.toLowerCase();
    movements = movements.filter(
      (m) =>
        m.reference.toLowerCase().includes(q) ||
        m.productName.toLowerCase().includes(q) ||
        m.sku.toLowerCase().includes(q) ||
        m.user.toLowerCase().includes(q)
    );
  }

  if (options?.type && options.type !== 'all') {
    movements = movements.filter((m) => m.referenceType === options.type);
  }

  return movements;
}

// ---------------- WAREHOUSES & LOCATIONS API ----------------
export async function getWarehouses(): Promise<Warehouse[]> {
  await delay();
  return storage.getWarehouses();
}

export async function getWarehouseById(id: string): Promise<Warehouse | null> {
  await delay();
  const warehouses = storage.getWarehouses();
  return warehouses.find((w) => w.id === id) || null;
}

export async function createWarehouse(data: Omit<Warehouse, 'id' | 'locationsCount' | 'productCount' | 'totalUnits'>): Promise<Warehouse> {
  await delay();
  const warehouses = storage.getWarehouses();
  const newWH: Warehouse = {
    id: `WH-${String(warehouses.length + 1).padStart(2, '0')}`,
    ...data,
    locationsCount: 0,
    productCount: 0,
    totalUnits: 0,
  };
  storage.setWarehouses([...warehouses, newWH]);
  return newWH;
}

export async function getLocations(warehouseId?: string): Promise<WarehouseLocation[]> {
  await delay();
  const locations = storage.getLocations();
  if (warehouseId && warehouseId !== 'all') {
    return locations.filter((l) => l.warehouseId === warehouseId);
  }
  return locations;
}

export async function createLocation(data: Omit<WarehouseLocation, 'id' | 'productCount' | 'currentQuantity'>): Promise<WarehouseLocation> {
  await delay();
  const locations = storage.getLocations();
  const warehouses = storage.getWarehouses();

  const newLoc: WarehouseLocation = {
    id: `LOC-${String(locations.length + 1).padStart(2, '0')}`,
    ...data,
    productCount: 0,
    currentQuantity: 0,
  };

  storage.setLocations([...locations, newLoc]);

  // Update warehouse count
  const wh = warehouses.find((w) => w.id === data.warehouseId);
  if (wh) {
    wh.locationsCount += 1;
    storage.setWarehouses([...warehouses]);
  }

  return newLoc;
}

// ---------------- DASHBOARD API ----------------
export async function getDashboardData(): Promise<{
  kpis: DashboardKPIs;
  trend: InventoryTrendPoint[];
  categoryStats: InventoryCategoryStat[];
  lowStockItems: Product[];
  pendingOperations: PendingOperation[];
  recentMovements: StockMovement[];
}> {
  await delay(100);
  const products = storage.getProducts();
  const receipts = storage.getReceipts();
  const deliveries = storage.getDeliveries();
  const transfers = storage.getTransfers();
  const movements = storage.getMovements();

  const totalProductsInStock = products.filter((p) => p.totalStock > 0).length;
  const lowStockItemsCount = products.filter((p) => p.status === 'Low Stock').length;
  const outOfStockItemsCount = products.filter((p) => p.status === 'Out of Stock').length;
  const pendingReceiptsCount = receipts.filter((r) => r.status === 'Waiting' || r.status === 'Ready').length;
  const pendingDeliveriesCount = deliveries.filter((d) => d.status === 'Waiting' || d.status === 'Ready').length;
  const internalTransfersCount = transfers.filter((t) => t.status === 'Waiting' || t.status === 'Ready').length;

  const kpis: DashboardKPIs = {
    totalProductsInStock,
    lowStockItemsCount,
    outOfStockItemsCount,
    pendingReceiptsCount,
    pendingDeliveriesCount,
    internalTransfersCount,
  };

  // Category distribution
  const catMap: Record<string, { count: number; qty: number }> = {};
  let totalUnitsAll = 0;
  products.forEach((p) => {
    if (!catMap[p.category]) catMap[p.category] = { count: 0, qty: 0 };
    catMap[p.category].count += 1;
    catMap[p.category].qty += p.totalStock;
    totalUnitsAll += p.totalStock;
  });

  const categoryStats: InventoryCategoryStat[] = Object.entries(catMap).map(([cat, val]) => ({
    category: cat,
    count: val.count,
    totalQuantity: val.qty,
    percentage: totalUnitsAll > 0 ? Math.round((val.qty / totalUnitsAll) * 100) : 0,
  }));

  // Low stock products table
  const lowStockItems = products.filter((p) => p.status === 'Low Stock' || p.status === 'Out of Stock');

  // Pending operations list
  const pendingOperations: PendingOperation[] = [
    ...receipts
      .filter((r) => r.status === 'Waiting' || r.status === 'Ready')
      .map((r) => ({
        id: r.id,
        documentNumber: r.receiptNumber,
        type: 'Receipt' as const,
        warehouse: r.warehouseName,
        date: r.expectedDate,
        status: r.status,
        itemCount: r.items.length,
      })),
    ...deliveries
      .filter((d) => d.status === 'Waiting' || d.status === 'Ready')
      .map((d) => ({
        id: d.id,
        documentNumber: d.deliveryNumber,
        type: 'Delivery' as const,
        warehouse: d.warehouseName,
        date: d.deliveryDate,
        status: d.status,
        itemCount: d.items.length,
      })),
    ...transfers
      .filter((t) => t.status === 'Waiting' || t.status === 'Ready')
      .map((t) => ({
        id: t.id,
        documentNumber: t.transferNumber,
        type: 'Transfer' as const,
        warehouse: `${t.sourceWarehouseName} → ${t.destWarehouseName}`,
        date: t.createdAt.split('T')[0],
        status: t.status,
        itemCount: t.items.length,
      })),
  ];

  // 7-day movement trend
  const trend: InventoryTrendPoint[] = [
    { date: 'Sep 19', inbound: 450, outbound: 210, totalStock: 3400 },
    { date: 'Sep 20', inbound: 120, outbound: 380, totalStock: 3140 },
    { date: 'Sep 21', inbound: 680, outbound: 150, totalStock: 3670 },
    { date: 'Sep 22', inbound: 1000, outbound: 420, totalStock: 4250 },
    { date: 'Sep 23', inbound: 200, outbound: 310, totalStock: 4140 },
    { date: 'Sep 24', inbound: 80, outbound: 560, totalStock: 3660 },
    { date: 'Sep 25', inbound: 320, outbound: 190, totalStock: 3790 },
  ];

  const recentMovements = movements.slice(0, 7);

  return {
    kpis,
    trend,
    categoryStats,
    lowStockItems,
    pendingOperations,
    recentMovements,
  };
}

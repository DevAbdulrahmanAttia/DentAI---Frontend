export type InventoryCategory = 'consumable' | 'equipment' | 'medication' | 'ppe' | 'other';

/**
 * Note: quantityInStock/unitCost/lowStockThreshold are numeric columns —
 * dentai-api serializes these as strings, not numbers (same gotcha as
 * ProcedureType's basePrice).
 */
export interface InventoryItem {
  id: string;
  name: string;
  category: InventoryCategory;
  quantityInStock: string;
  unitCost: string;
  lowStockThreshold: string;
  expiryDate: string | null;
  unit: string;
}

export interface CreateInventoryItemPayload {
  name: string;
  category: InventoryCategory;
  quantityInStock: number;
  unitCost: number;
  lowStockThreshold: number;
  expiryDate?: string;
  unit: string;
}

export interface MaterialUsageEntry {
  id: string;
  inventoryItem: {
    id: string;
    name: string;
    unit: string;
  };
  quantityUsed: string;
  unitCostAtTime: string;
  loggedAt: string;
}

export interface LogMaterialUsagePayload {
  appointmentId: string;
  inventoryItemId: string;
  quantityUsed: number;
}

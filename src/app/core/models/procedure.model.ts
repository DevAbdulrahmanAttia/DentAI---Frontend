/**
 * Note: dentai-api's numeric/decimal columns (basePrice, overheadCost,
 * finalPrice, etc.) are serialized as strings by TypeORM/pg, not numbers —
 * parse with Number(...) before doing arithmetic or formatting.
 */
export interface ProcedureType {
  id: string;
  name: string;
  basePrice: string;
  estDurationMin: number;
  overheadCost: string;
}

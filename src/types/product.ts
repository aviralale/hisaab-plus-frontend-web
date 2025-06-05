export interface StockBatch {
  batch_id: number;
  entry_date: string;
  cost_per_unit: string;
  selling_price: string;
  quantity_remaining: number;
  total_batch_value: number;
  profit_per_unit: number;
  entry_type: string;
  invoice_number: string;
  notes: string;
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  description: string;
  image: string | null;
  category: number;
  category_name: string;
  supplier: number;
  supplier_name: string;
  unit: string;
  stock: number;
  reorder_level: number;
  barcode: string | null;
  is_active: boolean;
  total_stock_value: number;
  average_cost_price: number;
  suggested_selling_price: number;
  selling_price: number;
  stock_batches: StockBatch[];
  needs_reorder: boolean;
  created_at: string;
  updated_at: string;
  business: number;
  created_by: number | null;
  batch_count?: number;
}

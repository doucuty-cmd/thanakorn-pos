export interface Product {
  id: string;
  name: string;
  sku: string | null;
  cost_price: number;
  selling_price: number;
  stock_qty: number;
  unit: string;
  image_url: string | null;
  category: string | null;
  is_active: boolean;
}
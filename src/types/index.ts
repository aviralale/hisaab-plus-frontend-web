export interface Business {
  id: number;
  name: string;
  address: string;
  created_at: string;
  users_count?: number;
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  phone: string;
  business: number | null;
  business_details?: Business;
  role: string;
  role_display: string;
  is_active: boolean;
  date_joined: string;
  last_login: string;
}

export interface Category {
  id: number;
  name: string;
  description: string;
}

export interface Supplier {
  id: number;
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  image: string | null;
  description: string;
  category: number;
  category_name: string;
  supplier: number;
  supplier_name: string;
  stock: number;
  reorder_level: number;
  cost_price: number;
  selling_price: number;
  profit_margin: number;
  stock_value: number;
  needs_reorder: boolean;
  is_active: boolean;
}

export interface StockEntry {
  id: number;
  product: number;
  product_name: string;
  quantity: number;
  unit_cost: number;
  date_added: string;
  created_by: number;
  notes?: string;
}

export interface SaleItem {
  id: number;
  product: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface Sale {
  id: number;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  sale_date: string;
  total_amount: number;
  amount_paid: number;
  invoice_number: string;
  payment_status: string;
  balance: number;
  payment_method: string;
  created_by: number;
  items: SaleItem[];
  note?: string;
}

export interface RegisterUser {
  full_name: string;
  email: string;
  phone: string;
  business?: string;
  role?: string;
  password: string;
  re_password: string;
}

export interface LoginUser {
  email: string;
  password: string;
}

export interface RegisterBusiness {
  name: string;
  address: string;
}

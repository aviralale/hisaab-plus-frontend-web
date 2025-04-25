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
  profile_picture: string;
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
  profit_margin?: number;
  stock_value?: number;
  needs_reorder?: boolean;
  is_active: boolean;
  created_at: string;
}

export interface SaleItem {
  id: number;
  product: number;
  product_name: string;
  quantity: number;
  unit_price: string;
  subtotal: number;
  sale_date: string;
  customer_name: string;
}

export interface Sale {
  id: number;
  items: SaleItem[];
  balance: number;
  invoice_number: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  sale_date: string;
  total_amount: string;
  paid_amount: string;
  notes: string;
  created_at: string;
  business: number;
  business_details: {
    id: number;
    name: string;
    address: string;
    email: string;
    phone: string;
  };
  payment_method: string;
  created_by: number;
}

export type SalesData = Sale[];

export interface StockEntry {
  id: number;
  date_added: string;
  entry_type: string;
  entry_type_display: string;
  quantity: number;
  unit_price: number;
  notes: string | null;
  created_by: string;
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
  legalName?: string;
  businessType: string;
  industry: string;
  contactInfo: {
    email: string;
    phone: string;
  };
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  taxInfo: {
    taxId?: string;
    fiscalYearEnd?: string;
  };
  settings: {
    currencyCode: string;
    timezone: string;
    isActive: boolean;
  };
}

export interface RecentSale {
  id: number;
  customer: string;
  amount: number;
  status: string;
  sale_date: string;
}

export interface MonthlySaleData {
  name: string;
  amount: number;
}

export interface LowStockProducts {
  id: number;
  name: string;
  sku: string;
  stock: number;
  reorder_level: number;
}

export interface DashboardTypes {
  business_name: string;
  total_products: number;
  low_stock_count: number;
  low_stock_products: LowStockProducts[]; // it's an array
  out_of_stock_products: number;
  total_suppliers: number;
  total_categories: number;
  sales_today: number;
  sales_this_month: number;
  inventory_value: number;
  recent_sales: RecentSale[];
  monthly_sales_data: MonthlySaleData[];
  percentage_increase_from_yesterday: number;
  percentage_increase_from_30_days_ago: number;
}

export interface Distrito {
  id: number;
  name: string;
  province: string;
}

export interface Admin {
  id: number;
  full_name: string;
  email: string;
  auth_id: string;
}

export interface User {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  address: string | null;
  distrito_id: number | null;
}

export interface Product {
  id: number;
  sku: string;
  name: string;
  description: string | null;
  photo_url: string | null;
  price: number;
  stock: number;
  category: string | null;
  created_by: number | null;
}

export type OrderStatus = 'pending' | 'preparing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: number;
  order_number: string;
  user_id: string;
  delivery_address: string;
  distrito_id: number;
  status: OrderStatus;
  total_amount: number;
  created_at: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  subtotal: number;
  product?: {
    name: string;
    photo_url: string | null;
  };
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type UserRole = 'cliente' | 'admin';
export interface Distrito {
  id: number;
  nombre: string;
  provincia: string;
}

export interface Usuario {
  id: string;
  nombre_completo: string | null;
  telefono: string | null;
  rol: 'cliente' | 'admin';
}

export interface Direccion {
  id: number;
  usuario_id: string;
  distrito_id: number | null;
  direccion: string;
}

export interface Pedido {
  id: number;
  usuario_id: string;
  direccion_id: number | null;
  total: number;
  estado: 'pendiente' | 'preparando' | 'enviado' | 'entregado' | 'cancelado';
  creado_en: string;
}

export interface DetallePedido {
  id: number;
  pedido_id: number;
  producto_id: number;
  nombre_producto: string;
  precio: number;
  cantidad: number;
  subtotal: number;
}

// Producto del sistema de inventario externo
export interface Product {
  id: number;
  nombre: string;
  precio: number;
  descripcion?: string;
  foto_url?: string;
  sku?: string;
  categoria?: string;
  stock?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type UserRole = 'cliente' | 'admin';
import { useState } from 'react';

/**
 * Mapeo de idProducto → nombre de archivo de imagen.
 * Las imágenes deben colocarse en: cliente/public/assets/
 * 
 * Productos actuales:
 *   1 → Panadol Forte 500mg
 *   2 → Redoxon Vitamina C 1g
 *   3 → Listerine Cool Mint 500ml
 *   4 → Ensure Nutricional 400g
 *   5 → Cetaphil Crema Hidratante 250ml
 *   6 → Gingisona SPRAY
 *   7 → Gingisona PASTILLA MASTICABLE
 *   8 → Paracetamol 500g
 */

/**
 * Retorna la URL de la imagen para un producto dado su ID.
 * La imagen debe existir en /assets/producto_{id}.webp
 */
export function getProductImageUrl(productId: number): string {
  return `/assets/producto_${productId}.webp`;
}

/**
 * Componente reutilizable para mostrar la imagen de un producto.
 * Si la imagen no se encuentra, muestra un placeholder con icono de medicamento.
 */
interface ProductImageProps {
  productId: number;
  productName: string;
  /** Tamaño del componente: 'sm' para carrito, 'md' para catálogo, 'lg' para detalle */
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ProductImage({ productId, productName, size = 'md', className = '' }: ProductImageProps) {
  const [hasError, setHasError] = useState(false);
  const imageUrl = getProductImageUrl(productId);

  const sizeClasses = {
    sm: 'w-20 h-20',
    md: 'h-40 w-full',
    lg: 'h-80 w-full',
  };

  const iconSizes = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-24 w-24',
  };

  const containerClass = `${sizeClasses[size]} bg-slate-100 rounded-md flex items-center justify-center overflow-hidden ${className}`;

  if (hasError) {
    return (
      <div className={containerClass}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`${iconSizes[size]} text-slate-400`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className={containerClass}>
      <img
        src={imageUrl}
        alt={productName}
        className="w-full h-full object-contain"
        onError={() => setHasError(true)}
      />
    </div>
  );
}

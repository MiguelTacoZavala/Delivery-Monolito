import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('id', Number(id))
        .limit(1);
      
      if (data && data.length > 0) {
        setProduct(data[0]);
      }
      setLoading(false);
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500">Cargando...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <p className="text-slate-600 mb-4">Producto no encontrado</p>
        <Link to="/catalogo" className="text-primary-600 hover:text-primary-700">
          Volver al catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-xl font-bold text-primary-600">
              FarmalinkDelivery
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/catalogo" className="text-sm text-primary-600 hover:text-primary-700">
                Catálogo
              </Link>
              <Link to="/carrito" className="p-2 text-slate-600 hover:text-primary-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 8a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <Link to="/catalogo" className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver al catálogo
        </Link>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="aspect-square bg-slate-100">
              {product.photo_url ? (
                <img src={product.photo_url} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>

            <div className="p-6">
              {product.category && (
                <span className="text-sm text-slate-500">{product.category}</span>
              )}
              <h1 className="text-2xl font-bold text-slate-800 mt-1">{product.name}</h1>
              {product.sku && (
                <p className="text-sm text-slate-500 mt-1">SKU: {product.sku}</p>
              )}

              {product.description && (
                <p className="text-slate-600 mt-4">{product.description}</p>
              )}

              <div className="mt-6">
                <p className="text-3xl font-bold text-primary-600">
                  S/ {product.price.toFixed(2)}
                </p>
                <p className={`text-sm mt-1 ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  Stock: {product.stock > 0 ? product.stock : 'Agotado'}
                </p>
              </div>

              {product.stock > 0 && (
                <div className="mt-6">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-slate-300 rounded-md">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-3 py-2 text-slate-600 hover:bg-slate-100"
                      >
                        -
                      </button>
                      <span className="px-3 py-2 text-slate-800">{quantity}</span>
                      <button
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                        className="px-3 py-2 text-slate-600 hover:bg-slate-100"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={handleAddToCart}
                      className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                        added
                          ? 'bg-green-600 text-white'
                          : 'bg-primary-600 hover:bg-primary-700 text-white'
                      }`}
                    >
                      {added ? 'Agregado' : 'Agregar al carrito'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-slate-800 text-slate-300 py-4 mt-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-sm">© 2026 Farmalink Delivery — Proyecto académico</p>
        </div>
      </footer>
    </div>
  );
}
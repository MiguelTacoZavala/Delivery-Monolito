import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Product } from '../types';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const CATEGORIES = [
  'Todos',
  'Analgésicos',
  'Antibióticos',
  'Vitaminas',
  'Cuidado Personal',
  'Bebés',
  'Dermatológicos',
];

export default function Catalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('Todos');
  const [showOnlyStock, setShowOnlyStock] = useState(false);
  const [search, setSearch] = useState('');
  const [addedId, setAddedId] = useState<number | null>(null);
  const { user } = useAuth();
  const location = useLocation();
  const { addToCart, itemCount } = useCart();

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('dynamic-task');
        if (error) {
          console.error('Error al obtener productos:', error);
          setProducts([]);
        } else if (data) {
          const normalized: Product[] = data.map((p: any) => ({
            id: p.idProducto,
            nombre: p.nombre_producto || p.nombre,
            precio: Number(p.Precio) || Number(p.precio) || 0,
            descripcion: p.descripcion || p.Descripcion || '',
            sku: p.sku || '',
            categoria: p.categoria || p.Categoria || '',
          }));
          setProducts(normalized);
        }
      } catch (err) {
        console.error('Error en fetchProducts:', err);
        setProducts([]);
      }
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(p => {
    if (category !== 'Todos' && p.categoria !== category) return false;
    if (search) {
      const searchLower = search.toLowerCase();
      if (!p.nombre?.toLowerCase().includes(searchLower)) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to={user ? '/catalogo' : '/'} className="text-xl font-bold text-primary-600">
              FarmalinkDelivery
            </Link>
            <nav className="flex items-center gap-4">
              <Link to="/catalogo" className={`text-sm ${location.pathname === '/catalogo' ? 'text-primary-600 font-medium' : 'text-slate-600 hover:text-primary-600'}`}>
                Catálogo
              </Link>
              {user && (
                <Link to="/perfil" className={`text-sm ${location.pathname === '/perfil' ? 'text-primary-600 font-medium' : 'text-slate-600 hover:text-primary-600'}`}>
                  Mi cuenta
                </Link>
              )}
            </nav>
            <div className="flex items-center gap-4">
              {user ? (
                <Link to="/logout" className="text-sm text-primary-600 hover:text-primary-700">
                  Cerrar sesión
                </Link>
              ) : (
                <Link to="/login?role=cliente" className="text-sm text-primary-600 hover:text-primary-700">
                  Ingresar
                </Link>
              )}
              <Link to="/carrito" className="relative p-2 text-slate-600 hover:text-primary-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 8a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-4">Catálogo</h1>
          <input
            type="text"
            placeholder="Buscar producto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="flex flex-wrap gap-4 mb-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showOnlyStock}
              onChange={(e) => setShowOnlyStock(e.target.checked)}
              className="rounded border-slate-300"
            />
            <span className="text-sm text-slate-600">Solo con stock</span>
          </label>

          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  category === cat
                    ? 'bg-primary-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-500">Cargando productos...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500">No hay productos disponibles</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <div key={product.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="h-40 bg-slate-100 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-slate-800 mb-1 line-clamp-2">
                    {product.nombre}
                  </h3>
                  <p className="text-lg font-bold text-primary-600">
                    S/ {product.precio.toFixed(2)}
                  </p>
                  <button
                    onClick={() => handleAddToCart(product)}
                    className={`w-full mt-3 text-white font-semibold py-2 px-4 rounded-md transition-colors ${
                      addedId === product.id
                        ? 'bg-green-500'
                        : 'bg-primary-600 hover:bg-primary-700'
                    }`}
                  >
                    {addedId === product.id ? '¡Agregado! ✓' : 'Agregar al carrito'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="bg-slate-800 text-slate-300 py-8 mt-16 text-center">
        <p className="text-sm">© 2026 Farmalink Delivery</p>
      </footer>
    </div>
  );
}
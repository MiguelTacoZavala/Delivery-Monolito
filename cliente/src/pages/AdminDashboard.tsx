import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Product } from '../types';

interface ProductFormData {
  sku: string;
  name: string;
  description: string;
  photo_url: string;
  price: number;
  stock: number;
  category: string;
}

const emptyForm: ProductFormData = {
  sku: '',
  name: '',
  description: '',
  photo_url: '',
  price: 0,
  stock: 0,
  category: '',
};

export default function AdminDashboard() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || role !== 'admin') {
      navigate('/login?role=admin');
      return;
    }
    fetchProducts();
  }, [user, role, navigate]);

  const fetchProducts = async () => {
    setLoading(true);
    const { data } = await supabase.from('products').select('*').order('name');
    if (data) setProducts(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      if (editingId) {
        const { error: updateError } = await supabase
          .from('products')
          .update({
            sku: formData.sku || null,
            name: formData.name,
            description: formData.description || null,
            photo_url: formData.photo_url || null,
            price: formData.price,
            stock: formData.stock,
            category: formData.category || null,
          })
          .eq('id', editingId);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('products')
          .insert({
            sku: formData.sku || null,
            name: formData.name,
            description: formData.description || null,
            photo_url: formData.photo_url || null,
            price: formData.price,
            stock: formData.stock,
            category: formData.category || null,
            created_by: user?.id,
          });

        if (insertError) throw insertError;
      }

      setShowForm(false);
      setEditingId(null);
      setFormData(emptyForm);
      fetchProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData({
      sku: product.sku || '',
      name: product.name,
      description: product.description || '',
      photo_url: product.photo_url || '',
      price: product.price,
      stock: product.stock,
      category: product.category || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar producto?')) return;
    
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) fetchProducts();
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const activeProducts = products.length;
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
  const lowStock = products.filter(p => p.stock > 0 && p.stock <= 10).length;
  const outOfStock = products.filter(p => p.stock === 0).length;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-xl font-bold text-secondary-600">
              FarmalinkDelivery
            </Link>
            <button onClick={handleLogout} className="text-sm text-slate-600 hover:text-red-600">
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Panel admin</h1>
          <p className="text-slate-600">Gestiona el catálogo y controla el stock virtual</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          <button
            onClick={() => {
              setShowForm(true);
              setEditingId(null);
              setFormData(emptyForm);
            }}
            className="bg-secondary-600 hover:bg-secondary-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors text-left flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo producto
          </button>
          
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-slate-600">Productos activos</p>
            <p className="text-2xl font-bold text-slate-800">{activeProducts}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-slate-600">Stock virtual total</p>
            <p className="text-2xl font-bold text-slate-800">{totalStock}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-slate-600">Stock bajo / sin stock</p>
            <p className="text-2xl font-bold text-slate-800">
              {lowStock} / {outOfStock}
            </p>
          </div>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              {editingId ? 'Editar producto' : 'Nuevo producto'}
            </h2>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">SKU (código)</label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  placeholder="Ej: MED-PARA-500"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Categoría</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary-500"
                >
                  <option value="">Seleccionar</option>
                  <option value="Analgésicos">Analgésicos</option>
                  <option value="Antibióticos">Antibióticos</option>
                  <option value="Vitaminas">Vitaminas</option>
                  <option value="Cuidado Personal">Cuidado Personal</option>
                  <option value="Bebés">Bebés</option>
                  <option value="Dermatológicos">Dermatológicos</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Precio (S/) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Stock virtual *</label>
                <input
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">URL de imagen</label>
                <input
                  type="url"
                  value={formData.photo_url}
                  onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary-500"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary-500"
                />
              </div>
              
              <div className="md:col-span-2 flex gap-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-secondary-600 hover:bg-secondary-700 disabled:bg-slate-400 text-white font-semibold py-2 px-4 rounded-md transition-colors"
                >
                  {saving ? 'Guardando...' : 'Guardar producto'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData(emptyForm);
                  }}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold py-2 px-4 rounded-md transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-800">
              {products.length} resultados
            </h2>
          </div>
          
          {loading ? (
            <div className="p-8 text-center text-slate-500">Cargando...</div>
          ) : products.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No hay productos. Crea el primero.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Producto</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">SKU</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Categoría</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Precio</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Stock</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-slate-600">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {products.map(product => (
                    <tr key={product.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-100 rounded-md overflow-hidden flex-shrink-0">
                            {product.photo_url ? (
                              <img src={product.photo_url} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">{product.name}</p>
                            {product.description && (
                              <p className="text-sm text-slate-500 truncate max-w-xs">
                                {product.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {product.sku || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {product.category || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-slate-800">
                        S/ {product.price.toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-sm ${product.stock === 0 ? 'text-red-600' : product.stock <= 10 ? 'text-yellow-600' : 'text-green-600'}`}>
                          {product.stock === 0 ? 'Agotado' : product.stock <= 10 ? `${product.stock} bajo` : product.stock}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-primary-600 hover:text-primary-700 text-sm mr-3"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <footer className="bg-slate-800 text-slate-300 py-4 mt-8 text-center">
        <p className="text-sm">© 2026 Farmalink Delivery — Proyecto académico</p>
      </footer>
    </div>
  );
}
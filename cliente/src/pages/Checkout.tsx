import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Distrito } from '../types';

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [distritos, setDistritos] = useState<Distrito[]>([]);
  const [selectedDistrito, setSelectedDistrito] = useState<Distrito | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login?role=cliente');
      return;
    }
    
    const fetchDistritos = async () => {
      const { data } = await supabase.from('distritos').select('*').order('name');
      if (data) {
        setDistritos(data);
        if (user.distrito_id) {
          const userDistrito = data.find(d => d.id === user.distrito_id);
          if (userDistrito) setSelectedDistrito(userDistrito);
        }
      }
    };
    fetchDistritos();
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!selectedDistrito) {
      setError('Selecciona un distrito');
      return;
    }
    
    if (!user?.address) {
      setError('No tienes dirección registrada');
      return;
    }

    setLoading(true);
    try {
      const orderNumber = `PED-${String(Date.now()).slice(-6)}`;
      
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          user_id: user.id,
          delivery_address: user.address,
          distrito_id: selectedDistrito.id,
          status: 'pending',
          total_amount: total,
        })
        .select()
        .limit(1);

      if (orderError) throw orderError;

      for (const item of items) {
        const { error: itemError } = await supabase
          .from('order_items')
          .insert({
            order_id: order[0].id,
            product_id: item.product.id,
            quantity: item.quantity,
            unit_price: item.product.price,
            subtotal: item.product.price * item.quantity,
          });

        if (itemError) throw itemError;

        await supabase
          .from('products')
          .update({ stock: item.product.stock - item.quantity })
          .eq('id', item.product.id);
      }

      clearCart();
      navigate('/perfil');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar pedido');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <Link to="/" className="text-xl font-bold text-primary-600">
              FarmalinkDelivery
            </Link>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-4">Tu carrito está vacío</h1>
          <Link to="/catalogo" className="text-primary-600 hover:text-primary-700">
            Ir al catálogo
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link to="/" className="text-xl font-bold text-primary-600">
            FarmalinkDelivery
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Checkout</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Dirección de entrega</h2>
            
            {user?.address ? (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
                <p className="text-slate-800">{user.address}</p>
                {selectedDistrito && (
                  <p className="text-sm text-green-700 mt-1">
                    {selectedDistrito.name} · {selectedDistrito.province}
                  </p>
                )}
                <span className="inline-block mt-2 text-xs bg-green-600 text-white px-2 py-1 rounded">
                  Cobertura confirmada
                </span>
              </div>
            ) : (
              <p className="text-red-600 mb-4">No tienes dirección registrada</p>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Cambiar distrito de entrega
              </label>
              <select
                value={selectedDistrito?.id || ''}
                onChange={(e) => {
                  const d = distritos.find(d => d.id === Number(e.target.value));
                  setSelectedDistrito(d || null);
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Seleccionar</option>
                {distritos.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name} - {d.province}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Resumen del pedido</h2>
            
            <div className="space-y-3 mb-4">
              {items.map(item => (
                <div key={item.product.id} className="flex justify-between text-sm">
                  <span className="text-slate-600">
                    {item.quantity}x {item.product.name}
                  </span>
                  <span className="font-medium">
                    S/ {(item.product.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            
            <hr className="my-4" />
            
            <div className="flex justify-between mb-4">
              <span className="font-semibold text-slate-800">Total</span>
              <span className="text-2xl font-bold text-primary-600">
                S/ {total.toFixed(2)}
              </span>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading || !selectedDistrito || !user?.address}
              className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-slate-400 text-white font-semibold py-3 px-4 rounded-md transition-colors"
            >
              {loading ? 'Procesando...' : 'Confirmar pedido'}
            </button>
          </div>
        </div>
      </main>

      <footer className="bg-slate-800 text-slate-300 py-4 mt-8 text-center">
        <p className="text-sm">© 2026 Farmalink Delivery — Proyecto académico</p>
      </footer>
    </div>
  );
}
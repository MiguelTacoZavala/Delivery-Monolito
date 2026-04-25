import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Distrito, Direccion } from '../types';

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const { user, direcciones, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [distritos, setDistritos] = useState<Distrito[]>([]);
  const [selectedDireccion, setSelectedDireccion] = useState<Direccion | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      navigate('/login?role=cliente');
      return;
    }
    
    const fetchDistritos = async () => {
      const { data } = await supabase.from('distritos').select('*').order('nombre');
      if (data) setDistritos(data);
    };
    fetchDistritos();
  }, [user, navigate, authLoading]);

  useEffect(() => {
    // Auto-seleccionar primera dirección o la que ya tiene el usuario
    if (direcciones.length > 0 && !selectedDireccion) {
      setSelectedDireccion(direcciones[0]);
    }
  }, [direcciones, selectedDireccion]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!selectedDireccion) {
      setError('Selecciona una dirección');
      return;
    }

    setLoading(true);
    try {
      const { data: pedido, error: pedidoError } = await supabase
        .from('pedidos')
        .insert({
          usuario_id: user!.id,
          direccion_id: selectedDireccion.id,
          total: total,
          estado: 'pendiente',
        })
        .select()
        .limit(1);

      if (pedidoError) throw pedidoError;

      for (const item of items) {
        const { error: itemError } = await supabase
          .from('detalle_pedidos')
          .insert({
            pedido_id: pedido[0].id,
            producto_id: item.product.id,
            nombre_producto: item.product.nombre,
            precio: item.product.precio,
            cantidad: item.quantity,
            subtotal: item.product.precio * item.quantity,
          });

        if (itemError) throw itemError;
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

  // Obtener nombre del distrito para mostrar
  const getDistritoNombre = (distritoId: number) => {
    const d = distritos.find(d => d.id === distritoId);
    return d ? `${d.nombre} - ${d.provincia}` : '';
  };

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
            
            {direcciones.length > 0 ? (
              <div className="mb-4 space-y-2">
                {direcciones.map(dir => (
                  <label
                    key={dir.id}
                    className={`block p-4 rounded-md cursor-pointer border-2 transition-colors ${
                      selectedDireccion?.id === dir.id
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="direccion"
                      checked={selectedDireccion?.id === dir.id}
                      onChange={() => setSelectedDireccion(dir)}
                      className="sr-only"
                    />
                    <p className="text-slate-800">{dir.direccion}</p>
                    <p className="text-sm text-slate-600">
                      {getDistritoNombre(dir.distrito_id!)}
                    </p>
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-red-600 mb-4">No tienes dirección registrada</p>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Resumen del pedido</h2>
            
            <div className="space-y-3 mb-4">
              {items.map(item => (
                <div key={item.product.id} className="flex justify-between text-sm">
                  <span className="text-slate-600">
                    {item.quantity}x {item.product.nombre}
                  </span>
                  <span className="font-medium">
                    S/ {(item.product.precio * item.quantity).toFixed(2)}
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
              disabled={loading || !selectedDireccion}
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
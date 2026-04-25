import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Pedido } from '../types';

export default function AdminDashboard() {
  const { user, role, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Esperar a que termine de cargar la autenticación
    if (authLoading) return;
    
    if (!user || (role !== 'admin')) {
      navigate('/login?role=admin');
      return;
    }

    const fetchPedidos = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('pedidos')
        .select('*')
        .order('creado_en', { ascending: false });
      
      if (data) setPedidos(data);
      setLoading(false);
    };

    fetchPedidos();
  }, [user, role, navigate, authLoading]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const updateStatus = async (pedidoId: number, newStatus: string) => {
    const { error } = await supabase
      .from('pedidos')
      .update({ estado: newStatus })
      .eq('id', pedidoId);

    if (!error) {
      setPedidos(pedidos.map(p => 
        p.id === pedidoId ? { ...p, estado: newStatus as any } : p
      ));
    }
  };

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'preparando': return 'bg-blue-100 text-blue-800';
      case 'enviado': return 'bg-purple-100 text-purple-800';
      case 'entregado': return 'bg-green-100 text-green-800';
      case 'cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500">Cargando...</p>
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
            <nav className="flex items-center gap-4">
              <Link to="/admin" className={`text-sm ${location.pathname === '/admin' ? 'text-primary-600 font-medium' : 'text-slate-600 hover:text-primary-600'}`}>
                Admin
              </Link>
            </nav>
            <button onClick={handleLogout} className="text-sm text-red-600 hover:text-red-700">
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Panel de administración</h1>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Pedidos recientes</h2>
          
          {pedidos.length === 0 ? (
            <p className="text-slate-500">No hay pedidos aún</p>
          ) : (
            <div className="space-y-4">
              {pedidos.map(pedido => (
                <div key={pedido.id} className="p-4 border border-slate-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">PED-{String(pedido.id).padStart(6, '0')}</span>
                    <select
                      value={pedido.estado}
                      onChange={(e) => updateStatus(pedido.id, e.target.value)}
                      className={`text-xs px-2 py-1 rounded-full border-0 cursor-pointer ${getStatusColor(pedido.estado)}`}
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="preparando">Preparando</option>
                      <option value="enviado">En camino</option>
                      <option value="entregado">Entregado</option>
                      <option value="cancelado">Cancelado</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">
                      {new Date(pedido.creado_en).toLocaleDateString('es-PE')}
                    </span>
                    <span className="font-semibold text-primary-600">S/ {pedido.total.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="bg-slate-800 text-slate-300 py-4 mt-8 text-center">
        <p className="text-sm">© 2026 Farmalink Delivery</p>
      </footer>
    </div>
  );
}
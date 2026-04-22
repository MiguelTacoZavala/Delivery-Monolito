import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Order, OrderItem, Distrito } from '../types';

interface OrderWithItems extends Order {
  items?: OrderItem[];
}

export default function Profile() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [distrito, setDistrito] = useState<Distrito | null>(null);
  const [activeTab, setActiveTab] = useState<'pedidos' | 'direccion'>('pedidos');

  useEffect(() => {
    if (!user) {
      navigate('/login?role=cliente');
      return;
    }
    
    const fetchData = async () => {
      setLoading(true);
      
      if (user.distrito_id) {
        const { data: d } = await supabase
          .from('distritos')
          .select('*')
          .eq('id', user.distrito_id)
          .limit(1);
        if (d && d.length > 0) setDistrito(d[0]);
      }
      
      const { data: o } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (o) {
        const ordersWithItems = await Promise.all(o.map(async (order) => {
          const { data: items } = await supabase
            .from('order_items')
            .select('*, product:products(name, photo_url)')
            .eq('order_id', order.id);
          return { ...order, items: items || [] };
        }));
        setOrders(ordersWithItems);
      }
      setLoading(false);
    };
    
    fetchData();
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'preparing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'preparing':
        return 'Preparando';
      case 'shipped':
        return 'En camino';
      case 'delivered':
        return 'Entregado';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-PE', {
      day: 'numeric',
      month: 'short',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500">Cargando...</p>
      </div>
    );
  }

  const initials = user?.full_name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-xl font-bold text-primary-600">
              FarmalinkDelivery
            </Link>
            <nav className="flex items-center gap-4">
              <Link to="/catalogo" className={`text-sm ${location.pathname === '/catalogo' ? 'text-primary-600 font-medium' : 'text-slate-600 hover:text-primary-600'}`}>
                Catálogo
              </Link>
              <Link to="/perfil" className={`text-sm ${location.pathname === '/perfil' ? 'text-primary-600 font-medium' : 'text-slate-600 hover:text-primary-600'}`}>
                Mi cuenta
              </Link>
              {role === 'admin' && (
                <Link to="/admin" className={`text-sm ${location.pathname === '/admin' ? 'text-primary-600 font-medium' : 'text-slate-600 hover:text-primary-600'}`}>
                  Admin
                </Link>
              )}
            </nav>
            <div className="flex items-center gap-4">
              <Link to="/carrito" className="p-2 text-slate-600 hover:text-primary-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 8a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </Link>
              <button onClick={handleLogout} className="text-sm text-red-600 hover:text-red-700">
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
              {initials}
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-slate-800">{user?.full_name}</h1>
              <p className="text-slate-600">{user?.email}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setActiveTab('pedidos')}
              className={`flex-1 py-3 text-center font-medium transition-colors ${
                activeTab === 'pedidos'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Mis pedidos
            </button>
            <button
              onClick={() => setActiveTab('direccion')}
              className={`flex-1 py-3 text-center font-medium transition-colors ${
                activeTab === 'direccion'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Dirección
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'pedidos' ? (
              orders.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-600 mb-4">No tienes pedidos aún</p>
                  <Link to="/catalogo" className="text-primary-600 hover:text-primary-700 font-medium">
                    Pedir de nuevo →
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map(order => (
                    <div key={order.id} className="p-4 border border-slate-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-slate-800">{order.order_number}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                      </div>
                      {order.items && order.items.length > 0 && (
                        <div className="mb-2">
                          {order.items.map(item => (
                            <div key={item.id} className="text-sm text-slate-600">
                              {item.quantity}x {item.product?.name || 'Producto'}
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">{formatDate(order.created_at)}</span>
                        <span className="font-semibold text-primary-600">S/ {order.total_amount.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              <div>
                {user?.address ? (
                  <div className="p-4 bg-slate-50 rounded-md">
                    <p className="text-slate-800">{user.address}</p>
                    {distrito && (
                      <p className="text-sm text-slate-600 mt-1">
                        {distrito.name} · {distrito.province}
                      </p>
                    )}
                    <span className="inline-block mt-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      Cobertura confirmada
                    </span>
                  </div>
                ) : (
                  <p className="text-slate-600">No tienes dirección registrada</p>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="bg-slate-800 text-slate-300 py-8 mt-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm">© 2026 Farmalink Delivery</p>
            <p className="text-sm">soporte@farmalink.pe</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Pedido, DetallePedido, Distrito } from '../types';

interface PedidoWithDetails extends Pedido {
  detalles?: DetallePedido[];
}

export default function Profile() {
  const { user, role, logout, direcciones, setDirecciones, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [pedidos, setPedidos] = useState<PedidoWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [distritos, setDistritos] = useState<Distrito[]>([]);
  const [activeTab, setActiveTab] = useState<'pedidos' | 'direcciones'>('pedidos');

  // Nueva dirección
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [newDireccion, setNewDireccion] = useState('');
  const [newDistritoId, setNewDistritoId] = useState<number | ''>('');
  const [savingAddress, setSavingAddress] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      navigate('/login?role=cliente');
      return;
    }
    
    const fetchData = async () => {
      setLoading(true);
      
      const { data: d } = await supabase.from('distritos').select('*').order('nombre');
      if (d) setDistritos(d);
      
      const { data: p } = await supabase
        .from('pedidos')
        .select('*')
        .eq('usuario_id', user.id)
        .order('creado_en', { ascending: false });
      
      if (p) {
        const pedidosWithDetails = await Promise.all(p.map(async (pedido) => {
          const { data: detalles } = await supabase
            .from('detalle_pedidos')
            .select('*')
            .eq('pedido_id', pedido.id);
          return { ...pedido, detalles: detalles || [] };
        }));
        setPedidos(pedidosWithDetails);
      }
      setLoading(false);
    };
    
    fetchData();
  }, [user, navigate, authLoading]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleAddAddress = async () => {
    if (!newDireccion || !newDistritoId) return;
    setSavingAddress(true);
    
    const { error } = await supabase
      .from('direcciones')
      .insert({
        usuario_id: user!.id,
        direccion: newDireccion,
        distrito_id: newDistritoId,
      });
    
    if (!error) {
      const { data } = await supabase
        .from('direcciones')
        .select('*')
        .eq('usuario_id', user!.id);
      if (data) setDirecciones(data);
      setShowNewAddress(false);
      setNewDireccion('');
      setNewDistritoId('');
    }
    setSavingAddress(false);
  };

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'preparando':
        return 'bg-blue-100 text-blue-800';
      case 'enviado':
        return 'bg-purple-100 text-purple-800';
      case 'entregado':
        return 'bg-green-100 text-green-800';
      case 'cancelado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const getStatusLabel = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return 'Pendiente';
      case 'preparando':
        return 'Preparando';
      case 'enviado':
        return 'En camino';
      case 'entregado':
        return 'Entregado';
      case 'cancelado':
        return 'Cancelado';
      default:
        return estado;
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

  const initials = user?.nombre_completo
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
              <h1 className="text-xl font-bold text-slate-800">{user?.nombre_completo || 'Usuario'}</h1>
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
              onClick={() => setActiveTab('direcciones')}
              className={`flex-1 py-3 text-center font-medium transition-colors ${
                activeTab === 'direcciones'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Direcciones
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'pedidos' ? (
              pedidos.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-600 mb-4">No tienes pedidos aún</p>
                  <Link to="/catalogo" className="text-primary-600 hover:text-primary-700 font-medium">
                    Hacer un pedido →
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {pedidos.map(pedido => (
                    <div key={pedido.id} className="p-4 border border-slate-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-slate-800">PED-{String(pedido.id).padStart(6, '0')}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(pedido.estado)}`}>
                          {getStatusLabel(pedido.estado)}
                        </span>
                      </div>
                      {pedido.detalles && pedido.detalles.length > 0 && (
                        <div className="mb-2">
                          {pedido.detalles.map(det => (
                            <div key={det.id} className="text-sm text-slate-600">
                              {det.cantidad}x {det.nombre_producto}
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">{formatDate(pedido.creado_en)}</span>
                        <span className="font-semibold text-primary-600">S/ {pedido.total.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-slate-800">Mis direcciones</h3>
                  <button
                    onClick={() => setShowNewAddress(!showNewAddress)}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    + Añadir dirección
                  </button>
                </div>

                {showNewAddress && (
                  <div className="mb-4 p-4 bg-slate-50 rounded-md">
                    <input
                      type="text"
                      placeholder="Dirección"
                      value={newDireccion}
                      onChange={(e) => setNewDireccion(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md mb-2"
                    />
                    <select
                      value={newDistritoId}
                      onChange={(e) => setNewDistritoId(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md mb-2"
                    >
                      <option value="">Seleccionar distrito</option>
                      {distritos.map(d => (
                        <option key={d.id} value={d.id}>{d.nombre} - {d.provincia}</option>
                      ))}
                    </select>
                    <button
                      onClick={handleAddAddress}
                      disabled={savingAddress || !newDireccion || !newDistritoId}
                      className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-slate-400 text-white font-semibold py-2 px-4 rounded-md"
                    >
                      {savingAddress ? 'Guardando...' : 'Guardar dirección'}
                    </button>
                  </div>
                )}

                {direcciones.length === 0 ? (
                  <p className="text-slate-600">No tienes direcciones registradas</p>
                ) : (
                  <div className="space-y-2">
                    {direcciones.map(dir => {
                      const d = distritos.find(x => x.id === dir.distrito_id);
                      return (
                        <div key={dir.id} className="p-4 bg-slate-50 rounded-md">
                          <p className="text-slate-800">{dir.direccion}</p>
                          <p className="text-sm text-slate-600">
                            {d ? `${d.nombre} - ${d.provincia}` : ''}
                          </p>
                        </div>
                      );
                    })}
                  </div>
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
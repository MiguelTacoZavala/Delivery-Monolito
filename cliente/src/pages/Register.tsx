import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Distrito } from '../types';

export default function Register() {
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [provincia, setProvincia] = useState('');
  const [distritoId, setDistritoId] = useState<number | ''>('');
  const [direccion, setDireccion] = useState('');
  
  const [distritos, setDistritos] = useState<Distrito[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDistritos = async () => {
      const { data } = await supabase.from('distritos').select('*').order('nombre');
      if (data) setDistritos(data);
    };
    fetchDistritos();
  }, []);

  const distritosFiltrados = provincia 
    ? distritos.filter(d => d.provincia === provincia)
    : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    
    if (!distritoId) {
      setError('Selecciona un distrito');
      return;
    }

    setLoading(true);
    try {
      await register({
        nombre_completo: nombreCompleto,
        email,
        telefono,
        password,
        direccion,
        distrito_id: Number(distritoId),
      });
      navigate('/catalogo');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link to="/" className="text-xl font-bold text-primary-600">
            FarmalinkDelivery
          </Link>
        </div>
      </header>

      <main className="flex-1 py-8 px-4">
        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h1 className="text-2xl font-bold text-slate-800 mb-2">
              Crea tu cuenta Farmalink
            </h1>
            <p className="text-slate-600 mb-6">
              Solo te pediremos los datos esenciales para entregarte tu pedido.
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nombre completo
                </label>
                <input
                  type="text"
                  value={nombreCompleto}
                  onChange={(e) => setNombreCompleto(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Correo
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Celular
                </label>
                <input
                  type="tel"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Confirmar contraseña
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <hr className="my-6" />

              <h2 className="text-lg font-semibold text-slate-800 mb-4">
                Dirección de entrega
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Provincia
                  </label>
                  <select
                    value={provincia}
                    onChange={(e) => {
                      setProvincia(e.target.value);
                      setDistritoId('');
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Seleccionar</option>
                    {[...new Set(distritos.map(d => d.provincia))].map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Distrito
                  </label>
                  <select
                    value={distritoId}
                    onChange={(e) => setDistritoId(Number(e.target.value))}
                    disabled={!provincia}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-slate-100"
                  >
                    <option value="">Seleccionar</option>
                    {distritosFiltrados.map(d => (
                      <option key={d.id} value={d.id}>{d.nombre}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Dirección
                  </label>
                  <input
                    type="text"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    placeholder=" calle, número, edificio..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-semibold py-2 px-4 rounded-md transition-colors mt-6"
              >
                {loading ? 'Creando cuenta...' : 'Crear mi cuenta'}
              </button>
            </form>

            <p className="mt-4 text-center text-sm text-slate-600">
              ¿Ya tienes cuenta?{' '}
              <Link to="/" className="text-primary-600 hover:text-primary-700 font-medium">
                Ingresar
              </Link>
            </p>
          </div>
        </div>
      </main>

      <footer className="bg-slate-800 text-slate-300 py-4 text-center">
        <p className="text-sm">© 2026 Farmalink Delivery — Proyecto académico</p>
      </footer>
    </div>
  );
}
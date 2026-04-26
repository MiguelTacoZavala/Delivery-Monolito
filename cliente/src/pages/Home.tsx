import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

export default function Home() {
  const [searchParams] = useSearchParams();
  const initialRole = (searchParams.get('role') as UserRole) || 'cliente';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(initialRole);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await login(email, password, role);
      if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/catalogo');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left side - Image */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 to-primary-800 relative overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1576602976047-174e57a47881?w=1200&h=1600&fit=crop"
            alt="Farmacia"
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>
        <div className="relative z-10 flex flex-col justify-end p-12 text-white">
          <h1 className="text-5xl font-bold mb-4">FarmaLink Delivery</h1>
          <p className="text-xl text-white/90">Tu farmacia de confianza, a un clic de tu puerta.</p>
        </div>
      </div>

      {/* Right side - Auth form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 lg:p-12">
        <Link to="/" className="lg:hidden text-2xl font-bold text-primary-600 mb-8">
          FarmalinkDelivery
        </Link>

        <div className="max-w-md mx-auto w-full">
          {/* Mobile header image */}
          <div className="lg:hidden mb-8 rounded-lg overflow-hidden h-48">
            <img 
              src="https://images.unsplash.com/photo-1576602976047-174e57a47881?w=800&h=400&fit=crop"
              alt="Farmacia"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="w-full">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Iniciar sesión</h2>
            <p className="text-slate-600 mb-6">Ingresa tus datos para continuar</p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setRole('cliente')}
                    className={`flex-1 py-2 px-4 rounded-md border-2 font-medium transition-colors ${
                      role === 'cliente'
                        ? 'border-primary-600 bg-primary-50 text-primary-600'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    Cliente
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('admin')}
                    className={`flex-1 py-2 px-4 rounded-md border-2 font-medium transition-colors ${
                      role === 'admin'
                        ? 'border-primary-600 bg-primary-50 text-primary-600'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    Administrador
                  </button>
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

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-semibold py-2 px-4 rounded-md transition-colors"
              >
                {loading ? 'Ingresando...' : 'Ingresar'}
              </button>
            </form>
          </div>

          {/* Link to registro - only for cliente, with smooth animation */}
          <div className={`mt-6 text-center transition-all duration-300 ${role === 'cliente' ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
            <p className="text-slate-600">
              ¿No tienes cuenta?{' '}
              <Link 
                to="/registro"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Regístrate
              </Link>
            </p>
          </div>

          {/* Header for desktop */}
          <div className="hidden lg:block mt-12">
            <Link to="/" className="text-xl font-bold text-primary-600">
              FarmalinkDelivery
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
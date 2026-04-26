import { ReactNode } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

interface LayoutProps {
  children: ReactNode;
  hideNav?: boolean;
}

export default function Layout({ children, hideNav = false }: LayoutProps) {
  const { user, role, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (hideNav) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to={user ? '/catalogo' : '/'} className="text-xl font-bold text-primary-600">
              FarmalinkDelivery
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link
                to="/catalogo"
                className={`text-sm font-medium transition-colors ${
                  location.pathname === '/catalogo'
                    ? 'text-primary-600'
                    : 'text-slate-600 hover:text-primary-600'
                }`}
              >
                Catálogo
              </Link>
              {user && role === 'cliente' && (
                <Link
                  to="/perfil"
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === '/perfil'
                      ? 'text-primary-600'
                      : 'text-slate-600 hover:text-primary-600'
                  }`}
                >
                  Mi cuenta
                </Link>
              )}
              {user && role === 'admin' && (
                <Link
                  to="/admin"
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === '/admin'
                      ? 'text-primary-600'
                      : 'text-slate-600 hover:text-primary-600'
                  }`}
                >
                  Admin
                </Link>
              )}
            </nav>

            <div className="flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-3">
                  <Link
                    to="/carrito"
                    className="relative p-2 text-slate-600 hover:text-primary-600 transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 8a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    {itemCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                        {itemCount}
                      </span>
                    )}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-sm text-slate-600 hover:text-primary-600 transition-colors"
                  >
                    Cerrar sesión
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="text-sm font-medium text-primary-600 hover:text-primary-700"
                >
                  Ingresar
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <main>{children}</main>

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
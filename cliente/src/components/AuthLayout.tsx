import { ReactNode } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

interface AuthLayoutProps {
  children: ReactNode;
  showAuthForm?: boolean;
}

export default function AuthLayout({ children, showAuthForm = true }: AuthLayoutProps) {
  const { user } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  if (user) {
    navigate('/catalogo');
    return null;
  }

  const isLoginRoute = location.pathname === '/login';
  const isRegistroRoute = location.pathname === '/registro';

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left side - Image */}
      <div className="hidden lg:flex lg:w-3/5 bg-gradient-to-br from-primary-600 to-primary-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20">
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

      {/* Right side - Auth form or children */}
      <div className="w-full lg:w-2/5 flex flex-col justify-center p-8 lg:p-12">
        {/* Logo for mobile */}
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

          {showAuthForm ? children : (
            <div className="w-full">
              {children}
            </div>
          )}

          {/* Toggle between login and registro - only show on main / route */}
          {location.pathname === '/' && (
            <div className="mt-6 text-center">
              {isLoginRoute || (!isLoginRoute && !isRegistroRoute) ? (
                <p className="text-slate-600">
                  ¿No tienes cuenta?{' '}
                  <Link to="/registro" className="text-primary-600 hover:text-primary-700 font-medium">
                    Regístrate
                  </Link>
                </p>
              ) : (
                <p className="text-slate-600">
                  ¿Ya tienes cuenta?{' '}
                  <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                    Ingresar
                  </Link>
                </p>
              )}
            </div>
          )}
        </div>

        {/* Header navigation for desktop */}
        <div className="hidden lg:flex items-center justify-between mt-12">
          <Link to="/" className="text-xl font-bold text-primary-600">
            FarmalinkDelivery
          </Link>
          <Link to="/carrito" className="p-2 text-slate-600 hover:text-primary-600 relative">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 8a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </div>
  );
}
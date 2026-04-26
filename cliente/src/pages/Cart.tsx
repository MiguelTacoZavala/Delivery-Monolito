import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Cart() {
  const { user } = useAuth();
  const { items, removeFromCart, updateQuantity, total } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <Link to={user ? '/catalogo' : '/'} className="text-xl font-bold text-primary-600">
              FarmalinkDelivery
            </Link>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-16 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-slate-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 8a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Tu carrito está vacío</h1>
          <p className="text-slate-600 mb-6">Agrega productos del catálogo para empezar.</p>
          <Link to="/catalogo" className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-6 rounded-md transition-colors">
            Ir al catálogo
          </Link>
        </main>

        <footer className="bg-slate-800 text-slate-300 py-4 mt-8 text-center">
          <p className="text-sm">© 2026 Farmalink Delivery — Proyecto académico</p>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to={user ? '/catalogo' : '/'} className="text-xl font-bold text-primary-600">
              FarmalinkDelivery
            </Link>
            <Link to="/catalogo" className="text-sm text-primary-600 hover:text-primary-700">
              Seguir comprando
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Carrito de compras</h1>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-200">
            {items.map(item => (
              <div key={item.product.id} className="p-4 flex gap-4">
                <div className="w-20 h-20 bg-slate-100 rounded-md flex-shrink-0 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-800">{item.product.nombre}</h3>
                      <p className="text-sm text-slate-500">S/ {item.product.precio.toFixed(2)} c/u</p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-slate-400 hover:text-red-600"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center border border-slate-300 rounded-md">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="px-2 py-1 text-slate-600 hover:bg-slate-100"
                      >
                        -
                      </button>
                      <span className="px-2 py-1 text-slate-800">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="px-2 py-1 text-slate-600 hover:bg-slate-100"
                      >
                        +
                      </button>
                    </div>
                    <span className="font-semibold text-slate-800">
                      S/ {(item.product.precio * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-slate-50">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold text-slate-800">Total</span>
              <span className="text-2xl font-bold text-primary-600">S/ {total.toFixed(2)}</span>
            </div>
            <Link
              to="/checkout"
              className="block w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-4 rounded-md text-center transition-colors"
            >
              Proceder al checkout
            </Link>
          </div>
        </div>
      </main>

      <footer className="bg-slate-800 text-slate-300 py-4 mt-8 text-center">
        <p className="text-sm">© 2026 Farmalink Delivery — Proyecto académico</p>
      </footer>
    </div>
  );
}
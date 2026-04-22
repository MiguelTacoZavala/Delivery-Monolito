import { Link } from 'react-router-dom';

export default function RoleSelection() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link to="/" className="text-xl font-bold text-primary-600">
            FarmalinkDelivery
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Bienvenido a Farmalink
          </h1>
          <p className="text-slate-600 mb-8">
            Selecciona tu rol para continuar
          </p>

          <div className="space-y-4">
            <Link
              to="/login?role=cliente"
              className="block bg-primary-600 hover:bg-primary-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors"
            >
              <div className="flex items-center justify-center gap-3">
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
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <span>Soy Cliente</span>
              </div>
              <p className="text-sm text-primary-100 mt-1">
                Explora el catálogo y realiza pedidos
              </p>
            </Link>

            <Link
              to="/login?role=admin"
              className="block bg-secondary-600 hover:bg-secondary-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors"
            >
              <div className="flex items-center justify-center gap-3">
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
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span>Soy Administrador</span>
              </div>
              <p className="text-sm text-secondary-100 mt-1">
                Gestiona el catálogo y pedidos
              </p>
            </Link>
          </div>
        </div>
      </main>

      <footer className="bg-slate-800 text-slate-300 py-4 text-center">
        <p className="text-sm">© 2026 Farmalink Delivery — Proyecto académico</p>
      </footer>
    </div>
  );
}
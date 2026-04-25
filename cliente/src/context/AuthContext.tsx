import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Usuario, Direccion, UserRole } from '../types';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: Usuario | null;
  session: Session | null;
  role: UserRole | null;
  loading: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
}

interface RegisterData {
  nombre_completo: string;
  email: string;
  telefono: string;
  password: string;
  direccion?: string;
  distrito_id?: number;
}

interface AuthContextValue extends AuthContextType {
  direcciones: Direccion[];
  setDirecciones: (dirs: Direccion[]) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [direcciones, setDirecciones] = useState<Direccion[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setUser(null);
        setRole(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    setLoading(true);
    
    try {
      const { data: usuario } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', userId)
        .limit(1);

      if (usuario && usuario.length > 0) {
        setUser(usuario[0]);
        const rolFromDb = usuario[0].rol as UserRole;
        const savedRole = localStorage.getItem('userRole') as UserRole;
        const finalRole = savedRole || rolFromDb;
        setRole(finalRole);
        
        // Fetch direcciones
        const { data: dirs } = await supabase
          .from('direcciones')
          .select('*')
          .eq('usuario_id', userId);
        if (dirs) setDirecciones(dirs);
      } else {
        // Si no encuentra en usuarios pero hay sesión, verificar localStorage
        const savedRole = localStorage.getItem('userRole') as UserRole;
        if (savedRole) {
          // Usuario existe en auth pero no en tabla usuarios (posible caso edge)
          // Crear usuario básico temporal
          setRole(savedRole);
          const tempUser: Usuario = {
            id: userId,
            nombre_completo: null,
            telefono: null,
            rol: savedRole
          };
          setUser(tempUser);
        } else {
          setUser(null);
          setRole(null);
        }
      }
    } catch (error) {
      // En caso de error, intentar recuperar de localStorage
      const savedRole = localStorage.getItem('userRole') as UserRole;
      if (savedRole) {
        setRole(savedRole);
      }
    }
    
    setLoading(false);
  };

  const login = async (email: string, password: string, userRole: UserRole) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data?.session) {
        setSession(data.session);
        
        const { data: usuario } = await supabase
          .from('usuarios')
          .select('*')
          .eq('id', data.session.user.id)
          .limit(1);

        if (usuario && usuario.length > 0) {
          const u = usuario[0];
          
          if (userRole === 'admin' && u.rol !== 'admin') {
            await supabase.auth.signOut();
            throw new Error('No tienes acceso de administrador');
          }

          setUser(u);
          setRole(u.rol as UserRole);
          localStorage.setItem('userRole', u.rol);

          // Fetch direcciones
          const { data: dirs } = await supabase
            .from('direcciones')
            .select('*')
            .eq('usuario_id', data.session.user.id);
          if (dirs) setDirecciones(dirs);
        } else {
          throw new Error('Perfil no encontrado');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setRole(null);
    setDirecciones([]);
    localStorage.removeItem('userRole');
  };

  const register = async (data: RegisterData) => {
    setLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error('Error al crear usuario');
      }

      // El trigger ya crea el registro en usuarios automáticamente
      // Actualizar datos del usuario
      const { error: updateError } = await supabase
        .from('usuarios')
        .update({
          nombre_completo: data.nombre_completo,
          telefono: data.telefono,
        })
        .eq('id', authData.user.id);

      if (updateError) throw updateError;

      // Crear dirección inicial si se proporcionó
      if (data.direccion && data.distrito_id) {
        const { error: dirError } = await supabase
          .from('direcciones')
          .insert({
            usuario_id: authData.user.id,
            direccion: data.direccion,
            distrito_id: data.distrito_id,
          });

        if (dirError) throw dirError;
      }

      // Fetch user completo
      const { data: nuevoUsuario } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', authData.user.id)
        .limit(1);

      if (nuevoUsuario && nuevoUsuario.length > 0) {
        setUser(nuevoUsuario[0]);
        setRole('cliente');
        localStorage.setItem('userRole', 'cliente');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, role, loading, login, logout, register, direcciones, setDirecciones }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
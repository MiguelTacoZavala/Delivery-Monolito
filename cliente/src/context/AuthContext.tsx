import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: UserRole | null;
  loading: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
}

interface RegisterData {
  full_name: string;
  email: string;
  phone: string;
  password: string;
  address: string;
  distrito_id: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

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
    
    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .limit(1);

    const { data: adminData } = await supabase
      .from('admins')
      .select('*')
      .eq('auth_id', userId)
      .limit(1);

    if (userData && userData.length > 0) {
      setUser(userData[0]);
      const savedRole = localStorage.getItem('userRole');
      setRole(savedRole as UserRole || 'cliente');
    } else if (adminData && adminData.length > 0) {
      const admin = adminData[0];
      const adminUser: User = {
        id: String(admin.id),
        full_name: admin.full_name,
        email: admin.email,
        phone: '',
        address: null,
        distrito_id: null,
      };
      setUser(adminUser);
      setRole('admin');
    } else {
      setUser(null);
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
        
        if (userRole === 'admin') {
          const { data: adminData } = await supabase
            .from('admins')
            .select('*')
            .eq('auth_id', data.session.user.id)
            .limit(1);

          if (adminData && adminData.length > 0) {
            const admin = adminData[0];
            const adminUser: User = {
              id: String(admin.id),
              full_name: admin.full_name,
              email: admin.email,
              phone: '',
              address: null,
              distrito_id: null,
            };
            setUser(adminUser);
            setRole('admin');
            localStorage.setItem('userRole', 'admin');
          } else {
            await supabase.auth.signOut();
            throw new Error('No tienes acceso de administrador');
          }
        } else {
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.session.user.id)
            .limit(1);

          if (profile && profile.length > 0) {
            setUser(profile[0]);
            setRole('cliente');
            localStorage.setItem('userRole', 'cliente');
          } else {
            throw new Error('Perfil no encontrado');
          }
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
    localStorage.removeItem('userRole');
  };

  const register = async (data: RegisterData) => {
    setLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.full_name,
          }
        }
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error('Error al crear usuario');
      }

      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          full_name: data.full_name,
          email: data.email,
          phone: data.phone,
          address: data.address,
          distrito_id: data.distrito_id,
        });

      if (profileError) throw profileError;

      const { data: newUser } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .limit(1);

      if (newUser && newUser.length > 0) {
        setUser(newUser[0]);
        setRole('cliente');
        localStorage.setItem('userRole', 'cliente');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, role, loading, login, logout, register }}>
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
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, Client } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  client: Client | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await fetchClientData(session.user);
      }
      
      setLoading(false);
    };

    getSession();

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await fetchClientData(session.user);
      } else {
        setClient(null);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchClientData = async (authUser: User) => {
    // Try to find client by phone number (or email if phone is not available)
    const phone = authUser.phone || authUser.user_metadata?.phone;
    const email = authUser.email;

    let query = supabase.from('clients').select('*');
    
    if (phone) {
      query = query.eq('whatsapp_number', phone);
    } else if (email) {
      query = query.eq('email', email);
    } else {
      return;
    }

    const { data, error } = await query.single();

    if (!error && data) {
      setClient(data as Client);
    } else {
      console.error('Erro ao procurar cliente:', error);
      // If user is authenticated but no client record exists, we might want to handle this
      // For now, we just leave client as null
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, client, loading, signOut }}>
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

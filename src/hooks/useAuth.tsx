import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, Client } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | { id: string; email?: string; phone?: string } | null;
  client: Client | null;
  loading: boolean;
  signOut: () => Promise<void>;
  checkSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | { id: string; email?: string; phone?: string } | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);

  const checkSession = async () => {
    try {
      // 1. Check Supabase Auth first
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUser(session.user);
        await fetchClientData(session.user);
        setLoading(false);
        return;
      }

      // 2. Check Custom Session (WhatsApp)
      const response = await fetch('/api/auth/session', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        if (data.ok && data.session) {
          const customUser = {
            id: `custom-${data.session.client_id}`,
            phone: data.session.phone_e164
          };
          setUser(customUser as any);
          await fetchClientByPhone(data.session.phone_e164);
          setLoading(false);
          return;
        }
      }
      
      // If no session found, clear state
      setUser(null);
      setClient(null);
    } catch (error) {
      console.error('Session check error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSession();

    // Listen for changes on Supabase auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user);
        await fetchClientData(session.user);
      } else {
        // Only clear if we don't have a custom session
        // For simplicity, we re-check everything
        checkSession();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchClientData = async (authUser: User) => {
    const phone = authUser.phone || authUser.user_metadata?.phone;
    const email = authUser.email;

    let query = supabase.from('clients').select('*');
    
    if (phone) {
      query = query.or(`whatsapp_number.eq.${phone},phone_e164.eq.${phone}`);
    } else if (email) {
      query = query.eq('email', email);
    } else {
      return;
    }

    const { data, error } = await query.single();

    if (!error && data) {
      setClient(data as Client);
    }
  };

  const fetchClientByPhone = async (phone: string) => {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('phone_e164', phone)
      .single();

    if (!error && data) {
      setClient(data as Client);
    }
  };

  const signOut = async () => {
    // Sign out from Supabase
    await supabase.auth.signOut();
    
    // Sign out from custom session
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    
    setUser(null);
    setClient(null);
  };

  return (
    <AuthContext.Provider value={{ user, client, loading, signOut, checkSession }}>
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

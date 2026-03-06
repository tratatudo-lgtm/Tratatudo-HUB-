import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.error('Supabase environment variables are missing. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in the Secrets panel.');
}

export const supabase = createClient(supabaseUrl || 'https://placeholder-url.supabase.co', supabaseAnonKey || 'placeholder-key');

export type Client = {
  id: number;
  name: string;
  phone: string;
  email: string;
  whatsapp_number: string;
  phone_e164?: string;
  status: string;
};

export type Subscription = {
  id: string;
  client_id: number;
  status: 'active' | 'inactive' | 'pending';
  plan: string;
};

export type Ticket = {
  id: string;
  client_id: number;
  tracking_code: string;
  type: 'pedido' | 'reclamação';
  category: string;
  status: 'aberto' | 'em_progresso' | 'resolvido' | 'fechado';
  urgency: 'baixa' | 'média' | 'alta' | 'urgente';
  created_at: string;
  description: string;
  location?: string;
};

export type TicketMessage = {
  id: string;
  ticket_id: string;
  message: string;
  sender: 'bot' | 'cliente' | 'admin';
  created_at: string;
};

export type WAMessage = {
  id: string;
  client_id: number;
  direction: 'inbound' | 'outbound';
  message: string;
  created_at: string;
};

export type MagicLink = {
  id: string;
  client_id: number;
  token: string;
  expires_at: string;
  used_at: string | null;
  created_at: string;
};

export type ClientInstance = {
  id: string;
  client_id: number;
  name: string;
  phone: string;
  status: 'connected' | 'disconnected' | 'connecting';
  type: string;
  last_activity: string;
  created_at: string;
};

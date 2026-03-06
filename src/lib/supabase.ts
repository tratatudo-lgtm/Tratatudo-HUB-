import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Client = {
  id: string;
  name: string;
  phone: string;
  email: string;
  whatsapp_number: string;
  status: string;
};

export type Subscription = {
  id: string;
  client_id: string;
  status: 'active' | 'inactive' | 'pending';
  plan: string;
};

export type Ticket = {
  id: string;
  client_id: string;
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
  client_id: string;
  direction: 'inbound' | 'outbound';
  message: string;
  created_at: string;
};

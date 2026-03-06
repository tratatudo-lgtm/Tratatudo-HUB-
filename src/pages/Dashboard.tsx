import React, { useEffect, useState } from 'react';
import { StatCard } from '../components/StatCard';
import { TicketTable } from '../components/TicketTable';
import { 
  MessageSquare, 
  Ticket as TicketIcon, 
  AlertTriangle, 
  CheckCircle,
  Smartphone,
  Zap,
  Loader2
} from 'lucide-react';
import { supabase, Ticket } from '../lib/supabase';
import { motion } from 'motion/react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { client } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!client?.id) return;

    const fetchTickets = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('client_id', client.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (!error && data) {
        setTickets(data as Ticket[]);
      }
      setLoading(false);
    };

    fetchTickets();
  }, [client?.id]);

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  const openTickets = tickets.filter(t => t.status === 'aberto').length;
  const inProgressTickets = tickets.filter(t => t.status === 'em_progresso').length;
  const resolvedTickets = tickets.filter(t => t.status === 'resolvido').length;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 tracking-tight">Dashboard</h1>
        <p className="text-sm md:text-base text-zinc-500 mt-1">Bem-vindo de volta, {client?.name}. Aqui está o resumo da sua atividade.</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-10">
        <StatCard 
          label="WhatsApp Associado" 
          value={client?.whatsapp_number || 'N/A'} 
          icon={Smartphone} 
        />
        <StatCard 
          label="Estado da Subscrição" 
          value={client?.status || 'Premium'} 
          icon={Zap}
          className="bg-emerald-50/50 border-emerald-100"
        />
        <StatCard 
          label="Total Mensagens" 
          value="--" 
          icon={MessageSquare}
        />
        <StatCard 
          label="Pedidos em Aberto" 
          value={openTickets} 
          icon={AlertTriangle}
          className={openTickets > 0 ? "bg-amber-50/50 border-amber-100" : ""}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6 order-2 lg:order-1">
          <div className="flex items-center justify-between">
            <h2 className="text-lg md:text-xl font-semibold text-zinc-900">Pedidos Recentes</h2>
            <button 
              onClick={() => navigate('/pedidos')}
              className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
            >
              Ver todos
            </button>
          </div>
          {tickets.length > 0 ? (
            <TicketTable tickets={tickets} />
          ) : (
            <div className="bg-white border border-zinc-200 rounded-xl p-12 text-center">
              <TicketIcon className="w-12 h-12 text-zinc-200 mx-auto mb-4" />
              <p className="text-zinc-500">Ainda não tem pedidos registados.</p>
            </div>
          )}
        </div>

        <div className="space-y-6 order-1 lg:order-2">
          <h2 className="text-lg md:text-xl font-semibold text-zinc-900">Resumo por Estado</h2>
          <div className="bg-white border border-zinc-200 rounded-xl p-4 md:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Abertos</span>
              </div>
              <span className="text-lg font-bold text-blue-900">{openTickets}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-amber-600" />
                <span className="text-sm font-medium text-amber-900">Em Progresso</span>
              </div>
              <span className="text-lg font-bold text-amber-900">{inProgressTickets}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-900">Resolvidos</span>
              </div>
              <span className="text-lg font-bold text-emerald-900">{resolvedTickets}</span>
            </div>
          </div>

          <div className="bg-zinc-900 rounded-xl p-6 text-white shadow-lg overflow-hidden relative group">
            <div className="relative z-10">
              <h3 className="text-lg font-semibold mb-2">Precisa de ajuda?</h3>
              <p className="text-zinc-400 text-sm mb-4">O nosso assistente IA está disponível 24/7 para responder às suas questões.</p>
              <button 
                onClick={() => navigate('/assistente')}
                className="bg-white text-zinc-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-100 transition-colors w-full sm:w-auto"
              >
                Falar com Assistente
              </button>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
              <BotIcon className="w-32 h-32" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BotIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 8V4H8" />
      <rect width="16" height="12" x="4" y="8" rx="2" />
      <path d="M2 14h2" />
      <path d="M20 14h2" />
      <path d="M15 13v2" />
      <path d="M9 13v2" />
    </svg>
  );
}

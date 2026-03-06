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
  Loader2,
  Activity,
  ArrowRight
} from 'lucide-react';
import { supabase, Ticket as TicketType, WAMessage } from '../lib/supabase';
import { motion } from 'motion/react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface DashboardStats {
  totalMessages: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  instanceStatus: string;
  instanceName: string;
}

export default function Dashboard() {
  const { client } = useAuth();
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [recentMessages, setRecentMessages] = useState<WAMessage[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalMessages: 0,
    openTickets: 0,
    inProgressTickets: 0,
    resolvedTickets: 0,
    instanceStatus: 'Desconectado',
    instanceName: 'N/A'
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!client?.id) return;

    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // 1. Fetch Tickets
        const { data: ticketsData } = await supabase
          .from('tickets')
          .select('*')
          .eq('client_id', client.id)
          .order('created_at', { ascending: false });

        if (ticketsData) {
          setTickets(ticketsData.slice(0, 5) as TicketType[]);
          
          const open = ticketsData.filter(t => t.status === 'aberto').length;
          const progress = ticketsData.filter(t => t.status === 'em_progresso').length;
          const resolved = ticketsData.filter(t => t.status === 'resolvido').length;
          
          setStats(prev => ({
            ...prev,
            openTickets: open,
            inProgressTickets: progress,
            resolvedTickets: resolved
          }));
        }

        // 2. Fetch Instance Info
        const { data: instanceData } = await supabase
          .from('client_instances')
          .select('name, status')
          .eq('client_id', client.id)
          .single();

        if (instanceData) {
          setStats(prev => ({
            ...prev,
            instanceName: instanceData.name,
            instanceStatus: instanceData.status === 'connected' ? 'Ligado' : 'Desconectado'
          }));
        }

        // 3. Fetch Message Stats
        const { count: msgCount } = await supabase
          .from('wa_messages')
          .select('*', { count: 'exact', head: true })
          .eq('client_id', client.id);

        if (msgCount !== null) {
          setStats(prev => ({ ...prev, totalMessages: msgCount }));
        }

        // 4. Fetch Recent Messages
        const { data: msgsData } = await supabase
          .from('wa_messages')
          .select('*')
          .eq('client_id', client.id)
          .order('created_at', { ascending: false })
          .limit(3);

        if (msgsData) {
          setRecentMessages(msgsData as WAMessage[]);
        }

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [client?.id]);

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 tracking-tight">Dashboard</h1>
        <p className="text-sm md:text-base text-zinc-500 mt-1">Bem-vindo ao teu Hub, {client?.name}.</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-10">
        <StatCard 
          label="Instância" 
          value={stats.instanceName} 
          icon={Smartphone} 
          className={stats.instanceStatus === 'Ligado' ? "border-emerald-100" : "border-red-100"}
        />
        <StatCard 
          label="Estado da Subscrição" 
          value={client?.status || 'Premium'} 
          icon={Zap}
          className="bg-emerald-50/50 border-emerald-100"
        />
        <StatCard 
          label="Total Mensagens" 
          value={stats.totalMessages} 
          icon={MessageSquare}
        />
        <StatCard 
          label="Pedidos em Aberto" 
          value={stats.openTickets} 
          icon={AlertTriangle}
          className={stats.openTickets > 0 ? "bg-amber-50/50 border-amber-100" : ""}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8 order-2 lg:order-1">
          {/* Recent Tickets */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg md:text-xl font-semibold text-zinc-900">Pedidos Recentes</h2>
              <button 
                onClick={() => navigate('/pedidos')}
                className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                Ver todos <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            {tickets.length > 0 ? (
              <TicketTable tickets={tickets} />
            ) : (
              <div className="bg-white border border-zinc-200 rounded-xl p-12 text-center">
                <TicketIcon className="w-12 h-12 text-zinc-200 mx-auto mb-4" />
                <p className="text-zinc-500">Ainda não tens pedidos registados.</p>
              </div>
            )}
          </section>

          {/* Recent Activity (Messages) */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg md:text-xl font-semibold text-zinc-900">Atividade Recente do Bot</h2>
              <button 
                onClick={() => navigate('/mensagens')}
                className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                Ver histórico <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
              {recentMessages.length > 0 ? (
                <div className="divide-y divide-zinc-100">
                  {recentMessages.map((msg) => (
                    <div key={msg.id} className="p-4 flex items-start gap-4 hover:bg-zinc-50 transition-colors">
                      <div className={`p-2 rounded-lg ${msg.direction === 'inbound' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                            {msg.direction === 'inbound' ? 'Utilizador' : 'Bot'}
                          </span>
                          <span className="text-[10px] text-zinc-400">
                            {new Date(msg.created_at).toLocaleString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-sm text-zinc-600 line-clamp-1">{msg.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Activity className="w-8 h-8 text-zinc-200 mx-auto mb-2" />
                  <p className="text-sm text-zinc-500">Sem atividade recente.</p>
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="space-y-6 order-1 lg:order-2">
          <h2 className="text-lg md:text-xl font-semibold text-zinc-900">Resumo de Pedidos</h2>
          <div className="bg-white border border-zinc-200 rounded-xl p-4 md:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Abertos</span>
              </div>
              <span className="text-lg font-bold text-blue-900">{stats.openTickets}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-amber-600" />
                <span className="text-sm font-medium text-amber-900">Em Progresso</span>
              </div>
              <span className="text-lg font-bold text-amber-900">{stats.inProgressTickets}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-900">Resolvidos</span>
              </div>
              <span className="text-lg font-bold text-emerald-900">{stats.resolvedTickets}</span>
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

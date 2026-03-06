import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  MessageSquare,
  History,
  Info,
  Loader2
} from 'lucide-react';
import { formatDate, cn } from '../lib/utils';
import { supabase, Ticket } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

const statusMap = {
  aberto: { label: 'Aberto', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: AlertCircle },
  em_progresso: { label: 'Em Progresso', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock },
  resolvido: { label: 'Resolvido', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  fechado: { label: 'Fechado', color: 'bg-zinc-50 text-zinc-700 border-zinc-200', icon: CheckCircle2 },
};

export default function TicketDetail() {
  const { code } = useParams();
  const navigate = useNavigate();
  const { client } = useAuth();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!code || !client?.id) return;

    const fetchTicket = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('tracking_code', code)
        .eq('client_id', client.id)
        .single();

      if (!error && data) {
        setTicket(data as Ticket);
      }
      setLoading(false);
    };

    fetchTicket();
  }, [code, client?.id]);

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-zinc-900">Pedido não encontrado</h2>
        <p className="text-zinc-500 mt-2">O pedido #{code} não existe ou não tem permissão para o ver.</p>
        <button 
          onClick={() => navigate('/pedidos')}
          className="mt-6 text-emerald-600 font-bold hover:underline"
        >
          Voltar aos pedidos
        </button>
      </div>
    );
  }

  const status = statusMap[ticket.status as keyof typeof statusMap];
  const StatusIcon = status.icon;

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 mb-6 md:mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar aos pedidos
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 space-y-6 md:space-y-8">
          <header>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Pedido #{ticket.tracking_code}</span>
              <span className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider",
                status.color
              )}>
                <StatusIcon className="w-3 h-3" />
                {status.label}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 tracking-tight">{ticket.category}</h1>
          </header>

          <section className="bg-white border border-zinc-200 rounded-2xl p-5 md:p-6 shadow-sm">
            <h2 className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Info className="w-4 h-4 text-zinc-400" />
              Descrição Detalhada
            </h2>
            <p className="text-sm md:text-base text-zinc-600 leading-relaxed">
              {ticket.description}
            </p>
          </section>

          <section className="bg-white border border-zinc-200 rounded-2xl p-5 md:p-6 shadow-sm">
            <h2 className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-zinc-400" />
              Localização
            </h2>
            <div className="flex flex-col sm:flex-row items-start gap-4 p-4 bg-zinc-50 rounded-xl border border-zinc-100">
              <div className="p-2 bg-white rounded-lg border border-zinc-200 shadow-sm flex-shrink-0">
                <MapPin className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-900">{ticket.location}</p>
                <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-wider font-bold">Coordenadas: 38.7223° N, 9.1393° W</p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
              <History className="w-4 h-4 text-zinc-400" />
              Histórico do Processo
            </h2>
            <div className="space-y-4 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-100">
              <div className="relative pl-10">
                <div className="absolute left-0 top-1.5 w-9 h-9 bg-white border-2 border-zinc-100 rounded-full flex items-center justify-center z-10">
                  <div className="w-2 h-2 bg-zinc-400 rounded-full" />
                </div>
                <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                    <span className="text-xs font-bold text-zinc-900">Estado: {statusMap[ticket.status as keyof typeof statusMap].label}</span>
                    <span className="text-[10px] text-zinc-400 font-medium">{formatDate(ticket.created_at)}</span>
                  </div>
                  <p className="text-sm text-zinc-600">Pedido registado no sistema.</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-5 md:p-6">
            <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-4">Detalhes Rápidos</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-zinc-200/50">
                <span className="text-xs text-zinc-500">Tipo</span>
                <span className="text-xs font-bold text-zinc-900 capitalize">{ticket.type}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-zinc-200/50">
                <span className="text-xs text-zinc-500">Urgência</span>
                <span className={cn(
                  "text-xs font-bold capitalize",
                  ticket.urgency === 'alta' ? 'text-red-600' : 'text-zinc-900'
                )}>{ticket.urgency}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-zinc-200/50">
                <span className="text-xs text-zinc-500">Criado em</span>
                <span className="text-xs font-bold text-zinc-900">{formatDate(ticket.created_at).split(' ')[0]}</span>
              </div>
            </div>
          </div>

          <div className="bg-emerald-600 rounded-2xl p-6 text-white shadow-lg shadow-emerald-200">
            <MessageSquare className="w-8 h-8 mb-4 opacity-80" />
            <h3 className="text-lg font-bold mb-2">Alguma dúvida?</h3>
            <p className="text-emerald-50 text-sm mb-6 leading-relaxed">Pode falar diretamente com o nosso assistente IA sobre este pedido específico.</p>
            <button 
              onClick={() => navigate('/assistente')}
              className="w-full bg-white text-emerald-600 py-3 rounded-xl font-bold text-sm hover:bg-emerald-50 transition-colors"
            >
              Falar com Assistente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

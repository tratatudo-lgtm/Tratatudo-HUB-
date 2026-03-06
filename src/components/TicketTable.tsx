import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Ticket } from '../lib/supabase';
import { formatDate, cn } from '../lib/utils';
import { ChevronRight, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';

const statusMap = {
  aberto: { label: 'Aberto', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: AlertCircle },
  em_progresso: { label: 'Em Progresso', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock },
  resolvido: { label: 'Resolvido', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  fechado: { label: 'Fechado', color: 'bg-zinc-50 text-zinc-700 border-zinc-200', icon: CheckCircle2 },
};

const urgencyMap = {
  baixa: 'text-zinc-500',
  média: 'text-amber-600',
  alta: 'text-orange-600',
  urgente: 'text-red-600 font-bold',
};

export function TicketTable({ tickets }: { tickets: Ticket[] }) {
  const navigate = useNavigate();

  return (
    <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-bottom border-zinc-200 bg-zinc-50/50">
              <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Código</th>
              <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Tipo / Categoria</th>
              <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Urgência</th>
              <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Data</th>
              <th className="px-6 py-4 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {tickets.map((ticket) => {
              const status = statusMap[ticket.status];
              const StatusIcon = status.icon;

              return (
                <tr 
                  key={ticket.id} 
                  className="hover:bg-zinc-50 transition-colors cursor-pointer group"
                  onClick={() => navigate(`/pedidos/${ticket.tracking_code}`)}
                >
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm font-medium text-zinc-900">#{ticket.tracking_code}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-zinc-900 capitalize">{ticket.type}</span>
                      <span className="text-xs text-zinc-500">{ticket.category}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
                      status.color
                    )}>
                      <StatusIcon className="w-3 h-3" />
                      {status.label}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn("text-xs capitalize", urgencyMap[ticket.urgency])}>
                      {ticket.urgency}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-500">
                    {formatDate(ticket.created_at)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-600 transition-colors inline" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-zinc-100">
        {tickets.map((ticket) => {
          const status = statusMap[ticket.status];
          const StatusIcon = status.icon;

          return (
            <div 
              key={ticket.id}
              onClick={() => navigate(`/pedidos/${ticket.tracking_code}`)}
              className="p-4 active:bg-zinc-50 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-sm font-bold text-zinc-900">#{ticket.tracking_code}</span>
                <span className={cn(
                  "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider",
                  status.color
                )}>
                  <StatusIcon className="w-2.5 h-2.5" />
                  {status.label}
                </span>
              </div>
              
              <div className="flex flex-col gap-1 mb-3">
                <h4 className="text-sm font-bold text-zinc-900 capitalize">{ticket.type}: {ticket.category}</h4>
                <p className="text-xs text-zinc-500 line-clamp-1">{ticket.description}</p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={cn("text-[10px] font-bold uppercase tracking-widest", urgencyMap[ticket.urgency])}>
                    {ticket.urgency}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-medium">
                    {formatDate(ticket.created_at).split(' ')[0]}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-300" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

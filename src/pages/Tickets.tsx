import React, { useState, useEffect } from 'react';
import { TicketTable } from '../components/TicketTable';
import { supabase, Ticket } from '../lib/supabase';
import { Search, Filter, Plus, Download, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function Tickets() {
  const { client } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!client?.id) return;

    const fetchTickets = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('client_id', client.id)
        .order('created_at', { ascending: false });

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

  const filteredTickets = tickets.filter(t => 
    t.tracking_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 tracking-tight">Pedidos e Reclamações</h1>
          <p className="text-sm md:text-base text-zinc-500 mt-1">Gira e acompanhe todos os seus processos ativos e históricos.</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-zinc-200 rounded-lg text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition-colors">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Exportar</span>
          </button>
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors">
            <Plus className="w-4 h-4" />
            Novo Pedido
          </button>
        </div>
      </header>

      <div className="bg-white border border-zinc-200 rounded-xl shadow-sm mb-6">
        <div className="p-4 border-b border-zinc-100 flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Procurar por código, categoria ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-zinc-900 outline-none transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-3 py-2 border border-zinc-200 rounded-lg text-sm font-medium text-zinc-600 hover:bg-zinc-50">
              <Filter className="w-4 h-4" />
              Filtros
            </button>
            <select className="flex-1 lg:flex-none px-3 py-2 border border-zinc-200 rounded-lg text-sm font-medium text-zinc-600 bg-white outline-none focus:ring-2 focus:ring-zinc-900">
              <option>Todos os Estados</option>
              <option>Aberto</option>
              <option>Em Progresso</option>
              <option>Resolvido</option>
            </select>
          </div>
        </div>
        <TicketTable tickets={filteredTickets} />
      </div>
      
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-zinc-500">
        <p className="text-center sm:text-left">A mostrar {filteredTickets.length} de {tickets.length} pedidos</p>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none px-3 py-1.5 border border-zinc-200 rounded-md hover:bg-zinc-50 disabled:opacity-50" disabled>Anterior</button>
          <button className="flex-1 sm:flex-none px-3 py-1.5 border border-zinc-200 rounded-md hover:bg-zinc-50">Próximo</button>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { TicketTable } from '../components/TicketTable';
import { Ticket } from '../lib/supabase';
import { Search, Filter, Plus, Download } from 'lucide-react';

const mockTickets: Ticket[] = [
  {
    id: '1',
    client_id: 'c1',
    tracking_code: 'TT-2024-001',
    type: 'reclamação',
    category: 'Iluminação Pública',
    status: 'aberto',
    urgency: 'alta',
    created_at: new Date().toISOString(),
    description: 'Poste de luz fundido na Rua das Flores, dificultando a visibilidade noturna.',
    location: 'Lisboa, Portugal'
  },
  {
    id: '2',
    client_id: 'c1',
    tracking_code: 'TT-2024-002',
    type: 'pedido',
    category: 'Limpeza Urbana',
    status: 'em_progresso',
    urgency: 'média',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    description: 'Acumulação de resíduos junto aos ecopontos da Praça Central.',
    location: 'Porto, Portugal'
  },
  {
    id: '3',
    client_id: 'c1',
    tracking_code: 'TT-2024-003',
    type: 'pedido',
    category: 'Manutenção de Vias',
    status: 'resolvido',
    urgency: 'baixa',
    created_at: new Date(Date.now() - 172800000).toISOString(),
    description: 'Pintura de passadeira apagada junto à escola primária.',
    location: 'Coimbra, Portugal'
  },
  {
    id: '4',
    client_id: 'c1',
    tracking_code: 'TT-2024-004',
    type: 'reclamação',
    category: 'Espaços Verdes',
    status: 'aberto',
    urgency: 'baixa',
    created_at: new Date(Date.now() - 259200000).toISOString(),
    description: 'Necessidade de poda de árvores no Parque Infantil.',
    location: 'Braga, Portugal'
  }
];

export default function Tickets() {
  const [tickets] = useState<Ticket[]>(mockTickets);
  const [searchTerm, setSearchTerm] = useState('');

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

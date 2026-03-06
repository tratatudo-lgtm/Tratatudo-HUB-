import React, { useEffect, useState } from 'react';
import { StatCard } from '../components/StatCard';
import { TicketTable } from '../components/TicketTable';
import { 
  MessageSquare, 
  Ticket as TicketIcon, 
  AlertTriangle, 
  CheckCircle,
  Smartphone,
  Zap
} from 'lucide-react';
import { Ticket } from '../lib/supabase';
import { motion } from 'motion/react';

// Mock data for initial development
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
  }
];

export default function Dashboard() {
  const [tickets, setTickets] = useState<Ticket[]>(mockTickets);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Dashboard</h1>
        <p className="text-zinc-500 mt-1">Bem-vindo de volta. Aqui está o resumo da sua atividade.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard 
          label="WhatsApp Associado" 
          value="+351 912 345 678" 
          icon={Smartphone} 
        />
        <StatCard 
          label="Estado da Subscrição" 
          value="Premium" 
          icon={Zap}
          className="bg-emerald-50/50 border-emerald-100"
        />
        <StatCard 
          label="Total Mensagens" 
          value="1,284" 
          icon={MessageSquare}
          trend={{ value: '12%', positive: true }}
        />
        <StatCard 
          label="Pedidos em Aberto" 
          value={tickets.filter(t => t.status === 'aberto').length} 
          icon={AlertTriangle}
          trend={{ value: '2', positive: false }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-zinc-900">Pedidos Recentes</h2>
            <button className="text-sm font-medium text-emerald-600 hover:text-emerald-700">Ver todos</button>
          </div>
          <TicketTable tickets={tickets} />
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-zinc-900">Resumo por Estado</h2>
          <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Abertos</span>
              </div>
              <span className="text-lg font-bold text-blue-900">12</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-amber-600" />
                <span className="text-sm font-medium text-amber-900">Em Progresso</span>
              </div>
              <span className="text-lg font-bold text-amber-900">8</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-900">Resolvidos</span>
              </div>
              <span className="text-lg font-bold text-emerald-900">145</span>
            </div>
          </div>

          <div className="bg-zinc-900 rounded-xl p-6 text-white shadow-lg overflow-hidden relative group">
            <div className="relative z-10">
              <h3 className="text-lg font-semibold mb-2">Precisa de ajuda?</h3>
              <p className="text-zinc-400 text-sm mb-4">O nosso assistente IA está disponível 24/7 para responder às suas questões.</p>
              <button className="bg-white text-zinc-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-100 transition-colors">
                Falar com Assistente
              </button>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
              <Bot className="w-32 h-32" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Bot(props: any) {
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

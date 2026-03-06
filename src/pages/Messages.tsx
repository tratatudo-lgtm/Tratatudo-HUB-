import React, { useState } from 'react';
import { WAMessage } from '../lib/supabase';
import { formatDate, cn } from '../lib/utils';
import { Smartphone, Search, Filter, MoreVertical, CheckCheck } from 'lucide-react';

const mockMessages: WAMessage[] = [
  {
    id: '1',
    client_id: 'c1',
    direction: 'inbound',
    message: 'Olá, gostaria de reportar um problema com a iluminação na minha rua.',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: '2',
    client_id: 'c1',
    direction: 'outbound',
    message: 'Olá! Sou o assistente TrataTudo. Lamento ouvir isso. Pode indicar-me a rua e uma breve descrição do problema?',
    created_at: new Date(Date.now() - 3600000 * 1.9).toISOString(),
  },
  {
    id: '3',
    client_id: 'c1',
    direction: 'inbound',
    message: 'É na Rua das Flores, o poste em frente ao número 42 está apagado.',
    created_at: new Date(Date.now() - 3600000 * 1.8).toISOString(),
  },
  {
    id: '4',
    client_id: 'c1',
    direction: 'outbound',
    message: 'Obrigado. Registado com o código TT-2024-001. Pode acompanhar o estado no seu Hub do Cliente.',
    created_at: new Date(Date.now() - 3600000 * 1.7).toISOString(),
  }
];

export default function Messages() {
  const [messages] = useState<WAMessage[]>(mockMessages);

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] m-4 bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="flex h-full">
        {/* Sidebar de Chats */}
        <div className="w-80 border-r border-zinc-100 flex flex-col bg-zinc-50/30">
          <div className="p-4 border-b border-zinc-100">
            <h1 className="text-xl font-bold text-zinc-900 mb-4">Mensagens</h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input 
                type="text" 
                placeholder="Procurar conversas..."
                className="w-full pl-9 pr-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-zinc-900 outline-none transition-all"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="p-2">
              <div className="flex items-center gap-3 p-3 bg-white border border-zinc-200 rounded-xl shadow-sm cursor-pointer">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Smartphone className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-sm font-bold text-zinc-900">WhatsApp Bot</span>
                    <span className="text-[10px] text-zinc-400 font-medium">14:20</span>
                  </div>
                  <p className="text-xs text-zinc-500 truncate">Registado com o código TT-2024-001...</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Área de Chat */}
        <div className="flex-1 flex flex-col bg-white">
          <header className="p-4 border-b border-zinc-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-zinc-900">WhatsApp Bot</h2>
                <p className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  Ativo agora
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-zinc-100 rounded-lg transition-colors">
                <Filter className="w-4 h-4 text-zinc-500" />
              </button>
              <button className="p-2 hover:bg-zinc-100 rounded-lg transition-colors">
                <MoreVertical className="w-4 h-4 text-zinc-500" />
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-zinc-50/30">
            <div className="flex justify-center mb-8">
              <span className="px-3 py-1 bg-white border border-zinc-200 rounded-full text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                Ontem
              </span>
            </div>
            
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={cn(
                  "flex flex-col max-w-[70%]",
                  msg.direction === 'outbound' ? "ml-auto items-end" : "items-start"
                )}
              >
                <div className={cn(
                  "p-3 rounded-2xl text-sm shadow-sm",
                  msg.direction === 'outbound' 
                    ? "bg-zinc-900 text-white rounded-tr-none" 
                    : "bg-white text-zinc-800 border border-zinc-100 rounded-tl-none"
                )}>
                  {msg.message}
                </div>
                <div className="flex items-center gap-1 mt-1 px-1">
                  <span className="text-[10px] text-zinc-400">
                    {formatDate(msg.created_at).split(' ')[1]}
                  </span>
                  {msg.direction === 'outbound' && (
                    <CheckCheck className="w-3 h-3 text-emerald-500" />
                  )}
                </div>
              </div>
            ))}
          </div>

          <footer className="p-4 border-t border-zinc-100">
            <div className="max-w-3xl mx-auto flex items-center gap-3">
              <div className="flex-1 p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-zinc-400 italic">
                O histórico de mensagens é apenas para consulta. Utilize o WhatsApp para novas comunicações.
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

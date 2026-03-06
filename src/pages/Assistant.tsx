import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { askAssistant } from '../lib/ai';
import { useAuth } from '../hooks/useAuth';
import { supabase, Ticket } from '../lib/supabase';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

export default function Assistant() {
  const { client } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Olá, ${client?.name || 'Cliente'}! Sou o seu Assistente IA TrataTudo. Como posso ajudar hoje? Posso dar informações sobre os seus pedidos, ajudar a interpretar reclamações ou sugerir os próximos passos.`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!client?.id) return;

    const fetchTickets = async () => {
      const { data } = await supabase
        .from('tickets')
        .select('*')
        .eq('client_id', client.id);
      
      if (data) setTickets(data as Ticket[]);
    };

    fetchTickets();
  }, [client?.id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Contexto real do cliente
    const context = {
      client_name: client?.name || "Cliente TrataTudo",
      client_phone: client?.whatsapp_number,
      active_tickets_count: tickets.filter(t => t.status !== 'resolvido' && t.status !== 'fechado').length,
      tickets: tickets.map(t => ({
        code: t.tracking_code,
        status: t.status,
        category: t.category,
        urgency: t.urgency,
        description: t.description,
        created_at: t.created_at
      }))
    };

    const response = await askAssistant(input, context);

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response || 'Desculpe, não consegui processar a sua mensagem.',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, assistantMessage]);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] lg:h-[calc(100vh-2rem)] m-2 md:m-4 bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
      <header className="p-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center shadow-lg shadow-zinc-200 flex-shrink-0">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base md:text-lg font-bold text-zinc-900 leading-tight truncate">Assistente IA</h1>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">Online</span>
            </div>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold border border-emerald-100 uppercase tracking-wider">
          <Sparkles className="w-3 h-3" />
          Powered by Gemini
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-zinc-50/10">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex gap-3 md:gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${
                msg.role === 'assistant' ? 'bg-zinc-100 text-zinc-600' : 'bg-zinc-900 text-white'
              }`}>
                {msg.role === 'assistant' ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
              </div>
              <div className={`max-w-[85%] sm:max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'assistant' 
                  ? 'bg-white text-zinc-800 border border-zinc-100 rounded-tl-none shadow-sm' 
                  : 'bg-zinc-900 text-white rounded-tr-none shadow-md'
              }`}>
                <div className="prose prose-sm max-w-none prose-zinc dark:prose-invert">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
                <div className={`text-[10px] mt-2 opacity-50 ${msg.role === 'user' ? 'text-right' : ''}`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-4"
          >
            <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center">
              <Bot className="w-5 h-5 text-zinc-400" />
            </div>
            <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-zinc-100 shadow-sm">
              <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <footer className="p-4 border-t border-zinc-100 bg-white">
        <form onSubmit={handleSend} className="relative max-w-4xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pergunte algo sobre os seus pedidos..."
            className="w-full pl-4 pr-12 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 outline-none transition-all text-sm"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 disabled:opacity-50 disabled:hover:bg-zinc-900 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="text-[10px] text-center text-zinc-400 mt-3 uppercase tracking-wider font-bold">
          O assistente pode cometer erros. Verifique sempre informações críticas.
        </p>
      </footer>
    </div>
  );
}

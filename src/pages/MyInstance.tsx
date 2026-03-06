import React, { useEffect, useState } from 'react';
import { 
  Smartphone, 
  Zap, 
  Activity, 
  Shield, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  RefreshCw
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'motion/react';

interface InstanceData {
  id: string;
  name: string;
  phone: string;
  status: string;
  type: string;
  last_activity: string;
  created_at: string;
}

export default function MyInstance() {
  const { client } = useAuth();
  const [instance, setInstance] = useState<InstanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchInstance = async () => {
    if (!client?.id) return;
    
    setRefreshing(true);
    const { data, error } = await supabase
      .from('client_instances')
      .select('*')
      .eq('client_id', client.id)
      .single();

    if (!error && data) {
      setInstance(data as InstanceData);
    }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchInstance();
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
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 tracking-tight">A Minha Instância</h1>
          <p className="text-sm md:text-base text-zinc-500 mt-1">Gira a ligação do teu bot ao WhatsApp.</p>
        </div>
        <button 
          onClick={fetchInstance}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Atualizar Estado
        </button>
      </header>

      {!instance ? (
        <div className="bg-white border border-zinc-200 rounded-3xl p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-zinc-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Smartphone className="w-8 h-8 text-zinc-400" />
          </div>
          <h2 className="text-xl font-bold text-zinc-900 mb-2">Nenhuma instância encontrada</h2>
          <p className="text-zinc-500 max-w-md mx-auto mb-8">
            Ainda não tens uma instância de WhatsApp configurada. Por favor, contacta o suporte para ativar o teu bot.
          </p>
          <button className="bg-zinc-900 text-white px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-zinc-800 transition-all">
            Solicitar Instância
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Status Card */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white border border-zinc-200 rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden">
              <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${instance.status === 'connected' ? 'bg-emerald-600 shadow-emerald-100' : 'bg-zinc-400 shadow-zinc-100'}`}>
                    <Smartphone className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-zinc-900">{instance.name}</h2>
                    <p className="text-zinc-500 font-mono text-sm">{instance.phone}</p>
                  </div>
                </div>
                <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${instance.status === 'connected' ? 'bg-emerald-50 text-emerald-600' : 'bg-zinc-50 text-zinc-500'}`}>
                  {instance.status === 'connected' ? (
                    <>
                      <CheckCircle2 className="w-3 h-3" />
                      Ligado
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3 h-3" />
                      Desligado
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                  <div className="flex items-center gap-2 text-zinc-400 mb-2">
                    <Zap className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Tipo de Instância</span>
                  </div>
                  <p className="text-sm font-bold text-zinc-900 capitalize">{instance.type || 'Partilhada'}</p>
                </div>
                <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                  <div className="flex items-center gap-2 text-zinc-400 mb-2">
                    <Clock className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Última Atividade</span>
                  </div>
                  <p className="text-sm font-bold text-zinc-900">
                    {instance.last_activity ? new Date(instance.last_activity).toLocaleString('pt-PT') : 'Sem atividade recente'}
                  </p>
                </div>
              </div>

              {instance.status !== 'connected' && (
                <div className="mt-8 p-6 bg-amber-50 border border-amber-100 rounded-2xl">
                  <h3 className="text-amber-900 font-bold text-sm mb-2">Reconectar Instância</h3>
                  <p className="text-amber-700 text-xs mb-4">A tua instância está desligada. Para voltar a receber mensagens, precisas de ler o código QR no WhatsApp.</p>
                  <button className="bg-amber-600 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-amber-700 transition-colors">
                    Gerar Novo QR Code
                  </button>
                </div>
              )}
            </div>

            {/* Security & Config */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                  <Shield className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-sm font-bold text-zinc-900 mb-1">Segurança</h3>
                <p className="text-xs text-zinc-500 mb-4">A tua ligação é encriptada de ponta a ponta via Evolution API.</p>
                <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                  <CheckCircle2 className="w-3 h-3" />
                  SSL Ativo
                </div>
              </div>
              <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
                <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center mb-4">
                  <Activity className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-sm font-bold text-zinc-900 mb-1">Performance</h3>
                <p className="text-xs text-zinc-500 mb-4">Tempo médio de resposta do bot: 1.2s nas últimas 24h.</p>
                <div className="w-full bg-zinc-100 h-1 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full w-[98%]" />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <div className="bg-zinc-900 rounded-3xl p-6 text-white shadow-xl">
              <h3 className="text-lg font-bold mb-4">Detalhes da Conta</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-xs text-zinc-400">ID da Instância</span>
                  <span className="text-xs font-mono">{instance.id.slice(0, 8)}...</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-xs text-zinc-400">Criada em</span>
                  <span className="text-xs">{new Date(instance.created_at).toLocaleDateString('pt-PT')}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-xs text-zinc-400">Servidor</span>
                  <span className="text-xs">Evolution-EU-01</span>
                </div>
              </div>
            </div>

            <div className="bg-emerald-600 rounded-3xl p-6 text-white shadow-xl shadow-emerald-100">
              <h3 className="text-lg font-bold mb-2">Suporte Prioritário</h3>
              <p className="text-emerald-100 text-xs mb-4">Como cliente Premium, tens acesso a suporte técnico direto para a tua instância.</p>
              <button className="w-full bg-white text-emerald-600 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-emerald-50 transition-colors">
                Falar com Técnico
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

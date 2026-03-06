import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export default function MagicAccess() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'error' | 'success'>('loading');
  const [message, setMessage] = useState('A validar o seu acesso...');
  const navigate = useNavigate();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Link de acesso inválido ou em falta.');
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await fetch('/api/magic-link/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Erro ao validar token');
        }

        // Use Supabase to complete the sign-in
        const { error: authError } = await supabase.auth.verifyOtp({
          email: data.email,
          token_hash: data.hashedToken,
          type: 'magiclink',
        });

        if (authError) throw authError;

        setStatus('success');
        setMessage('Acesso validado com sucesso!');
        toast.success('Sessão iniciada com sucesso');
        
        // Brief delay for visual feedback
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);

      } catch (error: any) {
        console.error('Magic access error:', error);
        setStatus('error');
        setMessage(error.message || 'O link de acesso expirou ou é inválido.');
      }
    };

    verifyToken();
  }, [token, navigate]);

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-zinc-200 p-8 text-center"
      >
        <div className="flex items-center gap-3 mb-12 justify-center">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-100">
            <span className="text-white font-bold text-xl">T</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900">TrataTudo Hub</h1>
        </div>

        <div className="space-y-6">
          {status === 'loading' && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
              </div>
              <p className="text-zinc-600 font-medium">{message}</p>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-lg font-bold text-zinc-900">Acesso Falhou</h2>
              <p className="text-sm text-zinc-500 leading-relaxed">{message}</p>
              <button 
                onClick={() => navigate('/login')}
                className="mt-4 w-full bg-zinc-900 text-white py-3.5 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-zinc-800 transition-all flex items-center justify-center gap-2"
              >
                Ir para o Login
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-lg font-bold text-zinc-900">Bem-vindo!</h2>
              <p className="text-sm text-zinc-500">{message}</p>
              <div className="w-full h-1 bg-zinc-100 rounded-full overflow-hidden mt-4">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1.5 }}
                  className="h-full bg-emerald-600"
                />
              </div>
            </div>
          )}
        </div>

        <div className="mt-12 pt-8 border-t border-zinc-100">
          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
            Acesso Seguro TrataTudo
          </p>
        </div>
      </motion.div>
    </div>
  );
}

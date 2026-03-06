import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function Login() {
  const [method, setMethod] = useState<'email' | 'phone'>('email');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulating login for demo
    setTimeout(() => {
      setLoading(false);
      navigate('/dashboard');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-zinc-200 overflow-hidden"
      >
        <div className="p-8">
          <div className="flex items-center gap-2 mb-8 justify-center">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-2xl">T</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">TrataTudo</h1>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold text-zinc-900">Bem-vindo ao Hub do Cliente</h2>
            <p className="text-zinc-500 mt-2">Aceda à sua área privada para gerir os seus pedidos.</p>
          </div>

          <div className="flex p-1 bg-zinc-100 rounded-lg mb-8">
            <button 
              onClick={() => setMethod('email')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${method === 'email' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
            >
              <Mail className="w-4 h-4" />
              Email
            </button>
            <button 
              onClick={() => setMethod('phone')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${method === 'phone' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
            >
              <Phone className="w-4 h-4" />
              Telemóvel
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                {method === 'email' ? 'Endereço de Email' : 'Número de Telemóvel'}
              </label>
              <input 
                type={method === 'email' ? 'email' : 'tel'}
                placeholder={method === 'email' ? 'exemplo@email.com' : '+351 912 345 678'}
                className="w-full px-4 py-2.5 bg-white border border-zinc-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Palavra-passe</label>
              <input 
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-white border border-zinc-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                required
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-zinc-900 text-white py-3 rounded-lg font-medium hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Entrar na Conta
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-zinc-100 text-center">
            <p className="text-sm text-zinc-500">
              Não tem conta? <a href="#" className="text-emerald-600 font-medium hover:underline">Contacte o suporte</a>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

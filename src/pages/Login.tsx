import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, ArrowRight, Loader2, Smartphone, Key, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import PhoneInput from 'react-phone-number-input';
import { normalizeToE164 } from '../lib/phone';
import 'react-phone-number-input/style.css';

export default function Login() {
  const [method, setMethod] = useState<'email' | 'phone'>('phone');
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'identifier' | 'otp'>('identifier');
  const [loading, setLoading] = useState(false);
  const [country, setCountry] = useState<any>('PT');
  const navigate = useNavigate();

  useEffect(() => {
    // Try to detect country from browser locale
    const locale = window.navigator.language;
    if (locale && locale.includes('-')) {
      const detectedCountry = locale.split('-')[1].toUpperCase();
      if (detectedCountry.length === 2) {
        setCountry(detectedCountry);
      }
    }
  }, []);

  const validateClient = async (id: string, type: 'email' | 'phone') => {
    const normalizedId = type === 'phone' ? normalizeToE164(id, country) : id;
    const { data, error } = await supabase
      .from('clients')
      .select('id')
      .eq(type === 'email' ? 'email' : 'phone_e164', normalizedId)
      .single();

    if (error || !data) {
      return false;
    }
    return true;
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const normalizedIdentifier = method === 'phone' ? normalizeToE164(identifier, country) : identifier;
      // 1. Validate if client exists
      const exists = await validateClient(identifier, method);
      if (!exists) {
        toast.error('Número não encontrado', {
          description: 'Este número não está associado a nenhum cliente TrataTudo.'
        });
        setLoading(false);
        return;
      }

      // 2. Send OTP
      const { error } = await supabase.auth.signInWithOtp(
        method === 'phone' 
          ? { phone: normalizedIdentifier, options: { shouldCreateUser: true } }
          : { email: identifier, options: { shouldCreateUser: true } }
      );

      if (error) throw error;

      toast.success('Enviámos um código de acesso', {
        description: `Verifica o teu ${method === 'email' ? 'email' : 'WhatsApp/SMS'}.`
      });
      setStep('otp');
    } catch (error: any) {
      toast.error('Erro ao enviar código', {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const normalizedIdentifier = method === 'phone' ? normalizeToE164(identifier, country) : identifier;
      
      const { error } = await supabase.auth.verifyOtp(
        method === 'phone'
          ? { phone: normalizedIdentifier, token: otp, type: 'sms' }
          : { email: identifier, token: otp, type: 'magiclink' }
      );

      if (error) throw error;

      toast.success('Sessão iniciada com sucesso');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error('Código inválido', {
        description: 'O código introduzido está incorreto ou expirou.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-4 md:p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-zinc-200 overflow-hidden"
      >
        <div className="p-6 md:p-8">
          <div className="flex items-center gap-3 mb-8 justify-center">
            <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-100">
              <span className="text-white font-bold text-2xl">T</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">TrataTudo</h1>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-zinc-900">Bem-vindo ao Hub</h2>
            <p className="text-zinc-500 mt-2 text-sm">Aceda à sua área privada para gerir os seus pedidos.</p>
          </div>

          <AnimatePresence mode="wait">
            {step === 'identifier' ? (
              <motion.div
                key="identifier"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <div className="flex p-1 bg-zinc-100 rounded-xl mb-8">
                  <button 
                    onClick={() => setMethod('phone')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${method === 'phone' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
                  >
                    <Smartphone className="w-4 h-4" />
                    WhatsApp
                  </button>
                  <button 
                    onClick={() => setMethod('email')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${method === 'email' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
                  >
                    <Mail className="w-4 h-4" />
                    Email
                  </button>
                </div>

                <form onSubmit={handleSendOtp} className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">
                      {method === 'email' ? 'Endereço de Email' : 'Número de WhatsApp'}
                    </label>
                    <div className="relative">
                      {method === 'email' ? (
                        <>
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 z-10">
                            <Mail className="w-5 h-5" />
                          </div>
                          <input 
                            type="email"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            placeholder="exemplo@email.com"
                            className="w-full pl-12 pr-4 py-3.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-sm"
                            required
                          />
                        </>
                      ) : (
                        <div className="phone-input-container">
                          <PhoneInput
                            international
                            defaultCountry={country}
                            value={identifier}
                            onChange={(val) => setIdentifier(val || '')}
                            onCountryChange={setCountry}
                            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500 outline-none transition-all text-sm overflow-hidden"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={loading || !identifier}
                    className="w-full bg-zinc-900 text-white py-4 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-zinc-200"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        Receber Código
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 mb-8 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-emerald-900">Código Enviado!</p>
                    <p className="text-[10px] text-emerald-700 mt-1">Introduz o código que enviámos para {identifier}</p>
                  </div>
                </div>

                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">
                      Código de Verificação
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
                        <Key className="w-5 h-5" />
                      </div>
                      <input 
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="000000"
                        className="w-full pl-12 pr-4 py-3.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-sm font-mono tracking-[0.5em] text-center"
                        required
                        maxLength={6}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button 
                      type="submit"
                      disabled={loading || otp.length < 6}
                      className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-emerald-100"
                    >
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          Confirmar Código
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                    <button 
                      type="button"
                      onClick={() => setStep('identifier')}
                      className="w-full text-[10px] font-bold text-zinc-400 uppercase tracking-widest hover:text-zinc-600 py-2"
                    >
                      Alterar {method === 'email' ? 'Email' : 'Número'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-8 pt-8 border-t border-zinc-100 text-center">
            <div className="flex items-center justify-center gap-2 text-zinc-400 mb-4">
              <AlertCircle className="w-4 h-4" />
              <p className="text-[10px] font-medium uppercase tracking-wider">Acesso Seguro</p>
            </div>
            <p className="text-xs text-zinc-500">
              Não tem conta? <a href="#" className="text-emerald-600 font-bold hover:underline">Contacte o suporte</a>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

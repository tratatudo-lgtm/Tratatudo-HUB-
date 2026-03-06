import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Menu, X, Bell, User, Loader2, Settings, ExternalLink } from 'lucide-react';
import { Toaster } from 'sonner';
import { NotificationCenter } from './components/NotificationCenter';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { isSupabaseConfigured } from './lib/supabase';
import Login from './pages/Login';
import MagicAccess from './pages/MagicAccess';
import Dashboard from './pages/Dashboard';
import Tickets from './pages/Tickets';
import TicketDetail from './pages/TicketDetail';
import Messages from './pages/Messages';
import Assistant from './pages/Assistant';
import MyInstance from './pages/MyInstance';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, client, loading, signOut } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!client) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 p-6 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <X className="w-8 h-8 text-red-600" />
        </div>
        <h1 className="text-xl font-bold text-zinc-900 mb-2">Acesso Restrito</h1>
        <p className="text-zinc-500 max-w-md">
          A tua conta não está associada a nenhum cliente no nosso sistema. 
          Por favor, contacta o suporte para regularizar a tua situação.
        </p>
        <div className="flex flex-col gap-4 mt-8">
          <button 
            onClick={() => window.location.href = 'https://wa.me/351912345678'}
            className="px-6 py-3 bg-zinc-900 text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-200"
          >
            Contactar Suporte
          </button>
          <button 
            onClick={() => signOut()}
            className="text-sm font-bold text-zinc-400 uppercase tracking-widest hover:text-zinc-600"
          >
            Sair e tentar outro número
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login' || location.pathname === '/magic-access';
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { client } = useAuth();

  // Close sidebar on route change
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  if (isLoginPage) {
    return (
      <>
        <Toaster position="top-right" richColors closeButton />
        {children}
      </>
    );
  }

  return (
    <div className="flex min-h-screen bg-zinc-50 font-sans text-zinc-900 antialiased">
      <Toaster position="top-right" richColors closeButton />
      
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header (Mobile & Desktop) */}
        <header className="flex items-center justify-between p-4 bg-white border-b border-zinc-200 sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-zinc-500 hover:text-zinc-900 transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">T</span>
            </div>
            <h1 className="text-lg font-bold tracking-tight text-zinc-900 hidden sm:block">TrataTudo</h1>
            <h1 className="text-lg font-bold tracking-tight text-zinc-900 sm:hidden">Hub</h1>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            <NotificationCenter />
            <div className="h-8 w-[1px] bg-zinc-200 hidden sm:block" />
            <div className="flex items-center gap-2 px-2 py-1 hover:bg-zinc-50 rounded-lg transition-colors cursor-pointer group">
              <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center border border-zinc-200 group-hover:border-zinc-300 transition-colors">
                <User className="w-4 h-4 text-zinc-500" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-zinc-900 leading-none">{client?.name || 'Cliente TrataTudo'}</p>
                <p className="text-[10px] text-zinc-400 font-medium mt-0.5 capitalize">{client?.status || 'Sócio Premium'}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-amber-100 rounded-3xl flex items-center justify-center mb-6 shadow-lg shadow-amber-100">
          <Settings className="w-10 h-10 text-amber-600 animate-spin-slow" />
        </div>
        <h1 className="text-2xl font-bold text-zinc-900 mb-3">Configuração Necessária</h1>
        <p className="text-zinc-500 max-w-md mb-8 leading-relaxed">
          Para que o Hub do Cliente funcione, precisas de configurar a ligação ao teu projeto Supabase no painel de <strong>Secrets</strong>.
        </p>
        
        <div className="w-full max-w-md bg-white border border-zinc-200 rounded-2xl p-6 text-left shadow-sm space-y-4">
          <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Passos para configurar:</h2>
          <ol className="space-y-3">
            <li className="flex gap-3 text-sm text-zinc-600">
              <span className="flex-shrink-0 w-5 h-5 bg-zinc-100 rounded-full flex items-center justify-center text-[10px] font-bold">1</span>
              <span>Cria um projeto em <a href="https://supabase.com" target="_blank" className="text-emerald-600 font-bold hover:underline inline-flex items-center gap-1">supabase.com <ExternalLink className="w-3 h-3" /></a></span>
            </li>
            <li className="flex gap-3 text-sm text-zinc-600">
              <span className="flex-shrink-0 w-5 h-5 bg-zinc-100 rounded-full flex items-center justify-center text-[10px] font-bold">2</span>
              <span>Vai a <strong>Project Settings &gt; API</strong> e copia o URL e a Anon Key.</span>
            </li>
            <li className="flex gap-3 text-sm text-zinc-600">
              <span className="flex-shrink-0 w-5 h-5 bg-zinc-100 rounded-full flex items-center justify-center text-[10px] font-bold">3</span>
              <span>No painel lateral do AI Studio, clica em <strong>Secrets</strong> e adiciona:</span>
            </li>
          </ol>
          
          <div className="bg-zinc-50 rounded-xl p-4 font-mono text-[11px] space-y-2 border border-zinc-100">
            <div className="flex justify-between">
              <span className="text-zinc-400">VITE_SUPABASE_URL</span>
              <span className="text-emerald-600 font-bold">o-teu-url</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">VITE_SUPABASE_ANON_KEY</span>
              <span className="text-emerald-600 font-bold">a-tua-chave</span>
            </div>
          </div>
        </div>
        
        <p className="mt-8 text-[10px] text-zinc-400 uppercase tracking-widest font-bold">
          A aplicação irá recarregar automaticamente após guardares os segredos.
        </p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <AuthProvider>
        <AppLayout>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/magic-access" element={<MagicAccess />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/pedidos" element={<ProtectedRoute><Tickets /></ProtectedRoute>} />
            <Route path="/pedidos/:code" element={<ProtectedRoute><TicketDetail /></ProtectedRoute>} />
            <Route path="/instancia" element={<ProtectedRoute><MyInstance /></ProtectedRoute>} />
            <Route path="/mensagens" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
            <Route path="/assistente" element={<ProtectedRoute><Assistant /></ProtectedRoute>} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AppLayout>
      </AuthProvider>
    </BrowserRouter>
  );
}

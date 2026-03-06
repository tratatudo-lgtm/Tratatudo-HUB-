import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Menu, X, Bell, User } from 'lucide-react';
import { Toaster } from 'sonner';
import { NotificationCenter } from './components/NotificationCenter';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Tickets from './pages/Tickets';
import TicketDetail from './pages/TicketDetail';
import Messages from './pages/Messages';
import Assistant from './pages/Assistant';

function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
                <p className="text-xs font-bold text-zinc-900 leading-none">Cliente TrataTudo</p>
                <p className="text-[10px] text-zinc-400 font-medium mt-0.5">Sócio Premium</p>
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
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/pedidos" element={<Tickets />} />
          <Route path="/pedidos/:code" element={<TicketDetail />} />
          <Route path="/mensagens" element={<Messages />} />
          <Route path="/assistente" element={<Assistant />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}

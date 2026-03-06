import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Ticket, 
  MessageSquare, 
  Bot, 
  LogOut,
  Settings,
  User
} from 'lucide-react';
import { cn } from '../lib/utils';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Ticket, label: 'Pedidos', href: '/pedidos' },
  { icon: MessageSquare, label: 'Mensagens', href: '/mensagens' },
  { icon: Bot, label: 'Assistente IA', href: '/assistente' },
];

export function Sidebar() {
  return (
    <aside className="w-64 border-r border-zinc-200 bg-white flex flex-col h-screen sticky top-0">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">T</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900">TrataTudo</h1>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive 
                  ? "bg-zinc-100 text-zinc-900" 
                  : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-zinc-100">
        <div className="flex items-center gap-3 mb-6 px-3">
          <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center">
            <User className="w-4 h-4 text-zinc-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-zinc-900 truncate">Cliente TrataTudo</p>
            <p className="text-xs text-zinc-500 truncate">Sócio Premium</p>
          </div>
        </div>
        
        <button className="flex items-center gap-3 px-3 py-2 w-full text-sm font-medium text-zinc-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
          <LogOut className="w-4 h-4" />
          Sair
        </button>
      </div>
    </aside>
  );
}

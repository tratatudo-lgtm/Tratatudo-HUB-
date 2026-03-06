import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, ExternalLink, X, Clock, AlertCircle, MessageSquare, Ticket as TicketIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNotifications, AppNotification } from '../hooks/useNotifications';
import { cn, formatDate } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

const typeIcons = {
  ticket_new: { icon: TicketIcon, color: 'text-blue-600', bg: 'bg-blue-50' },
  ticket_status: { icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
  message_new: { icon: MessageSquare, color: 'text-emerald-600', bg: 'bg-emerald-50' },
};

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (n: AppNotification) => {
    markAsRead(n.id);
    if (n.link) {
      navigate(n.link);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-all"
      >
        <Bell className="w-5 h-5 md:w-6 md:h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-zinc-200 rounded-2xl shadow-xl z-50 overflow-hidden"
          >
            <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
              <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">Notificações</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllAsRead}
                    className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 uppercase tracking-wider flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" />
                    Marcar tudo como lido
                  </button>
                )}
                <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-zinc-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="max-h-[400px] overflow-y-auto divide-y divide-zinc-50">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Bell className="w-6 h-6 text-zinc-400" />
                  </div>
                  <p className="text-sm text-zinc-500">Não tem notificações novas.</p>
                </div>
              ) : (
                notifications.map((n) => {
                  const { icon: Icon, color, bg } = typeIcons[n.type];
                  return (
                    <div 
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className={cn(
                        "p-4 hover:bg-zinc-50 transition-colors cursor-pointer group relative",
                        !n.read && "bg-zinc-50/30"
                      )}
                    >
                      {!n.read && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-600" />
                      )}
                      <div className="flex gap-3">
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", bg)}>
                          <Icon className={cn("w-5 h-5", color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className={cn("text-sm font-bold truncate", n.read ? "text-zinc-600" : "text-zinc-900")}>
                              {n.title}
                            </h4>
                            <span className="text-[10px] text-zinc-400 font-medium whitespace-nowrap ml-2 flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5" />
                              {formatDate(n.timestamp).split(' ')[1]}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-500 line-clamp-2 mb-2">
                            {n.description}
                          </p>
                          {n.link && (
                            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-1 group-hover:underline">
                              Ver Detalhe
                              <ExternalLink className="w-2.5 h-2.5" />
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {notifications.length > 0 && (
              <div className="p-3 bg-zinc-50 border-t border-zinc-100 text-center">
                <button 
                  onClick={() => setIsOpen(false)}
                  className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest hover:text-zinc-600"
                >
                  Fechar Painel
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

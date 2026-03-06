import { useState, useEffect, useCallback } from 'react';
import { supabase, Ticket, WAMessage } from '../lib/supabase';
import { toast } from 'sonner';
import { useAuth } from './useAuth';

export type NotificationType = 'ticket_new' | 'ticket_status' | 'message_new';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  timestamp: Date;
  read: boolean;
  link?: string;
  metadata?: any;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const { client } = useAuth();
  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotification = useCallback((notification: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: AppNotification = {
      ...notification,
      id: Math.random().toString(36).substring(7),
      timestamp: new Date(),
      read: false,
    };
    
    setNotifications(prev => [newNotif, ...prev].slice(0, 20)); // Keep last 20
    
    // Show toast
    toast(newNotif.title, {
      description: newNotif.description,
      action: newNotif.link ? {
        label: 'Ver',
        onClick: () => window.location.href = newNotif.link!
      } : undefined,
    });
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  useEffect(() => {
    if (!client?.id) return;

    // 1. Listen for Ticket changes
    const ticketChannel = supabase
      .channel('ticket-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tickets',
          filter: `client_id=eq.${client.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const ticket = payload.new as Ticket;
            addNotification({
              type: 'ticket_new',
              title: 'Novo Pedido Criado',
              description: `O pedido #${ticket.tracking_code} foi registado com sucesso.`,
              link: `/pedidos/${ticket.tracking_code}`,
            });
          } else if (payload.eventType === 'UPDATE') {
            const oldTicket = payload.old as Ticket;
            const newTicket = payload.new as Ticket;
            if (oldTicket.status !== newTicket.status) {
              addNotification({
                type: 'ticket_status',
                title: 'Atualização de Estado',
                description: `O pedido #${newTicket.tracking_code} mudou para "${newTicket.status}".`,
                link: `/pedidos/${newTicket.tracking_code}`,
              });
            }
          }
        }
      )
      .subscribe();

    // 2. Listen for WhatsApp Messages
    const messageChannel = supabase
      .channel('message-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'wa_messages',
          filter: `client_id=eq.${client.id}`,
        },
        (payload) => {
          const msg = payload.new as WAMessage;
          if (msg.direction === 'outbound') { // Message from bot/admin to client
            addNotification({
              type: 'message_new',
              title: 'Nova Mensagem Recebida',
              description: msg.message.length > 50 ? msg.message.substring(0, 50) + '...' : msg.message,
              link: '/mensagens',
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ticketChannel);
      supabase.removeChannel(messageChannel);
    };
  }, [addNotification, client?.id]);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  };
}

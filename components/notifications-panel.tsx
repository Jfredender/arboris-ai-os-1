'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  X,
  Info,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  BellOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { materialColors, elevation, shape, motion as motionTokens } from '@/lib/material-colors';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  link: string | null;
  createdAt: string;
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'success':
      return <CheckCircle className="w-5 h-5" style={{ color: materialColors.success }} />;
    case 'warning':
      return <AlertTriangle className="w-5 h-5" style={{ color: materialColors.warning }} />;
    case 'error':
      return <AlertCircle className="w-5 h-5" style={{ color: materialColors.error }} />;
    default:
      return <Info className="w-5 h-5" style={{ color: materialColors.info }} />;
  }
};

export default function NotificationsPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: 'PATCH'
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(notif =>
            notif.id === id ? { ...notif, isRead: true } : notif
          )
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/read-all', {
        method: 'PATCH'
      });

      if (response.ok) {
        setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <>
      {/* Notification Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <motion.button
          className={`relative w-14 h-14 ${shape.full} ${elevation.level3} flex items-center justify-center`}
          style={{ backgroundColor: materialColors.primary.main }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
        >
          <Bell className="w-6 h-6" style={{ color: '#121212' }} />
          {unreadCount > 0 && (
            <motion.div
              className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ backgroundColor: materialColors.error, color: '#121212' }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.div>
          )}
        </motion.button>
      </div>

      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-50"
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Panel */}
            <motion.div
              className={`fixed right-0 top-0 bottom-0 w-full max-w-md z-50 ${elevation.level5}`}
              style={{ backgroundColor: materialColors.surface.base }}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            >
              {/* Header */}
              <div 
                className="p-6 border-b"
                style={{ borderColor: materialColors.divider }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold" style={{ color: materialColors.text.primary }}>
                      Notificações
                    </h2>
                    <p className="text-sm mt-1" style={{ color: materialColors.text.secondary }}>
                      {unreadCount} não lida{unreadCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    style={{ color: materialColors.text.secondary }}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="mt-4 w-full"
                    style={{ color: materialColors.primary.main }}
                  >
                    Marcar todas como lidas
                  </Button>
                )}
              </div>

              {/* Content */}
              <div className="overflow-y-auto h-[calc(100vh-140px)]">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <Bell className="w-8 h-8" style={{ color: materialColors.primary.main }} />
                    </motion.div>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                    <BellOff className="w-12 h-12 mb-4" style={{ color: materialColors.text.disabled }} />
                    <h3 className="text-lg font-medium mb-2" style={{ color: materialColors.text.primary }}>
                      Nenhuma notificação
                    </h3>
                    <p className="text-sm" style={{ color: materialColors.text.secondary }}>
                      Você está em dia! Não há notificações no momento.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y" style={{ borderColor: materialColors.divider }}>
                    {notifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        className={`p-4 cursor-pointer transition-colors`}
                        style={{
                          backgroundColor: notification.isRead
                            ? 'transparent'
                            : materialColors.glass.light,
                        }}
                        whileHover={{ backgroundColor: materialColors.glass.medium }}
                        onClick={() => {
                          if (!notification.isRead) {
                            markAsRead(notification.id);
                          }
                          if (notification.link) {
                            window.location.href = notification.link;
                          }
                        }}
                      >
                        <div className="flex gap-3">
                          <div className="flex-shrink-0 mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 
                              className="text-sm font-medium mb-1"
                              style={{ color: materialColors.text.primary }}
                            >
                              {notification.title}
                            </h4>
                            <p 
                              className="text-sm line-clamp-2"
                              style={{ color: materialColors.text.secondary }}
                            >
                              {notification.message}
                            </p>
                            <p 
                              className="text-xs mt-2"
                              style={{ color: materialColors.text.disabled }}
                            >
                              {new Date(notification.createdAt).toLocaleString('pt-BR')}
                            </p>
                          </div>
                          {!notification.isRead && (
                            <div
                              className="w-2 h-2 rounded-full flex-shrink-0 mt-2"
                              style={{ backgroundColor: materialColors.primary.main }}
                            />
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
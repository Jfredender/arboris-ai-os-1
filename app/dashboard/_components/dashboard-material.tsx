
'use client';

import { useState, useEffect } from 'react';
import { Session } from 'next-auth';
import { motion } from 'framer-motion';
import { 
  Leaf, 
  MessageCircle, 
  Scan, 
  BookOpen, 
  TrendingUp, 
  Clock,
  Camera,
  Brain
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { materialColors, elevation, shape, motion as motionTokens } from '@/lib/material-colors';
import { Button } from '@/components/ui/button';

interface DashboardMaterialProps {
  session: Session;
}

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  icon: React.ReactNode;
}

function StatCard({ title, value, change, icon }: StatCardProps) {
  return (
    <motion.div
      className={`p-6 ${shape.medium} ${elevation.level2}`}
      style={{ backgroundColor: materialColors.surface.elevated1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: motionTokens.duration.short4 / 1000 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium" style={{ color: materialColors.text.secondary }}>
            {title}
          </p>
          <h3 className="text-2xl font-semibold mt-2" style={{ color: materialColors.text.primary }}>
            {value}
          </h3>
          {change && (
            <p className="text-xs mt-2 flex items-center gap-1" style={{ color: materialColors.success }}>
              <TrendingUp className="w-3 h-3" />
              {change}
            </p>
          )}
        </div>
        <div 
          className={`w-12 h-12 ${shape.medium} flex items-center justify-center`}
          style={{ backgroundColor: materialColors.primary.container }}
        >
          {icon}
        </div>
      </div>
    </motion.div>
  );
}

interface ActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  color?: string;
}

function ActionCard({ title, description, icon, onClick, color }: ActionCardProps) {
  return (
    <motion.button
      className={`w-full text-left p-6 ${shape.medium} ${elevation.level2}`}
      style={{ backgroundColor: materialColors.surface.elevated1 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        <div 
          className={`w-12 h-12 ${shape.medium} flex items-center justify-center flex-shrink-0`}
          style={{ backgroundColor: color || materialColors.primary.container }}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold" style={{ color: materialColors.text.primary }}>
            {title}
          </h3>
          <p className="text-sm mt-1" style={{ color: materialColors.text.secondary }}>
            {description}
          </p>
        </div>
      </div>
    </motion.button>
  );
}

export default function DashboardMaterial({ session }: DashboardMaterialProps) {
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [stats, setStats] = useState({
    totalScans: 0,
    todayScans: 0,
    chatMessages: 0,
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Fetch stats from API
    fetch('/api/probe/history')
      .then(res => res.json())
      .then(data => {
        const today = new Date().toDateString();
        const todayScans = data?.analyses?.filter((a: any) => 
          new Date(a.createdAt).toDateString() === today
        ).length || 0;
        
        setStats({
          totalScans: data?.analyses?.length || 0,
          todayScans,
          chatMessages: 0,
        });
      })
      .catch(err => console.error('Failed to fetch stats:', err));
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Bom Dia';
    if (hour < 18) return 'Boa Tarde';
    return 'Boa Noite';
  };

  const formatTime = () => {
    return currentTime.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: materialColors.surface.base }}>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: motionTokens.duration.medium2 / 1000 }}
        >
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-semibold" style={{ color: materialColors.text.primary }}>
              {getGreeting()}, {session.user?.name?.split(' ')[0] || 'Explorador'}
            </h1>
            <div className="flex items-center gap-2 text-sm" style={{ color: materialColors.text.secondary }}>
              <Clock className="w-4 h-4" />
              {formatTime()}
            </div>
          </div>
          <p className="text-sm" style={{ color: materialColors.text.secondary }}>
            Bem-vindo ao ARBORIS AI OS 1 - Sistema Inteligente de Análise Botânica
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          className="grid md:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: motionTokens.duration.medium2 / 1000 }}
        >
          <StatCard
            title="Total de Análises"
            value={stats.totalScans.toString()}
            change="+12% este mês"
            icon={<Leaf className="w-6 h-6" style={{ color: materialColors.primary.main }} />}
          />
          <StatCard
            title="Análises Hoje"
            value={stats.todayScans.toString()}
            icon={<TrendingUp className="w-6 h-6" style={{ color: materialColors.success }} />}
          />
          <StatCard
            title="Consultas AI"
            value={stats.chatMessages.toString()}
            icon={<Brain className="w-6 h-6" style={{ color: materialColors.info }} />}
          />
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: motionTokens.duration.medium2 / 1000 }}
        >
          <h2 className="text-xl font-semibold mb-4" style={{ color: materialColors.text.primary }}>
            Ações Rápidas
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <ActionCard
              title="Scanner"
              description="Análise de plantas via câmera ou upload"
              icon={<Scan className="w-6 h-6" style={{ color: materialColors.primary.main }} />}
              onClick={() => router.push('/explorator')}
              color={materialColors.primary.container}
            />
            <ActionCard
              title="Chat IA"
              description="Consulte nossa inteligência artificial"
              icon={<MessageCircle className="w-6 h-6" style={{ color: materialColors.secondary.main }} />}
              onClick={() => router.push('/dashboard#chat')}
              color={materialColors.secondary.container}
            />
            <ActionCard
              title="Histórico"
              description="Veja suas análises anteriores"
              icon={<Clock className="w-6 h-6" style={{ color: materialColors.info }} />}
              onClick={() => router.push('/history')}
              color={materialColors.primary.container}
            />
            <ActionCard
              title="Codex"
              description="Base de conhecimento botânico"
              icon={<BookOpen className="w-6 h-6" style={{ color: materialColors.warning }} />}
              onClick={() => router.push('/codex')}
              color={materialColors.primary.container}
            />
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: motionTokens.duration.medium2 / 1000 }}
          className={`p-6 ${shape.medium} ${elevation.level2}`}
          style={{ backgroundColor: materialColors.surface.elevated1 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold" style={{ color: materialColors.text.primary }}>
              Atividade Recente
            </h2>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => router.push('/history')}
              style={{ color: materialColors.primary.main }}
            >
              Ver Tudo
            </Button>
          </div>
          {stats.totalScans === 0 ? (
            <div className="text-center py-12">
              <Camera className="w-12 h-12 mx-auto mb-3" style={{ color: materialColors.text.disabled }} />
              <p className="text-sm" style={{ color: materialColors.text.secondary }}>
                Nenhuma análise realizada ainda
              </p>
              <Button
                size="sm"
                className="mt-4"
                onClick={() => router.push('/explorator')}
                style={{ backgroundColor: materialColors.primary.main, color: '#121212' }}
              >
                Iniciar Primeira Análise
              </Button>
            </div>
          ) : (
            <p className="text-sm" style={{ color: materialColors.text.secondary }}>
              Você realizou {stats.totalScans} análise{stats.totalScans !== 1 ? 's' : ''} até agora.
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}


'use client';

import { useState, useEffect } from 'react';
import { Session } from 'next-auth';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Trophy,
  Share2,
  Heart,
  MessageCircle,
  Award,
  TrendingUp,
  Star,
  Medal,
  Crown,
  Zap,
  Target,
  Sparkles,
  Search,
} from 'lucide-react';
import { materialColors, typography, shape } from '@/lib/material-colors';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';

interface CommunityClientProps {
  session: Session;
}

interface User {
  id: string;
  name: string;
  image?: string;
  profile: string;
  discoveries: number;
  rank: number;
  badges: string[];
}

interface Discovery {
  id: string;
  userId: string;
  userName: string;
  userImage?: string;
  plantName: string;
  imageUrl: string;
  location?: string;
  likes: number;
  comments: number;
  timestamp: string;
}

export default function CommunityClient({ session }: CommunityClientProps) {
  const [view, setView] = useState<'feed' | 'rankings' | 'profile'>('feed');
  const [discoveries, setDiscoveries] = useState<Discovery[]>([]);
  const [topUsers, setTopUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCommunityData();
  }, []);

  const loadCommunityData = async () => {
    // Simulate community data - In production, this would be fetched from API
    setDiscoveries([
      {
        id: '1',
        userId: '1',
        userName: 'Dr. Silva',
        plantName: 'Orchidaceae raríssima',
        imageUrl: '/placeholder.jpg',
        location: 'Amazônia, Brasil',
        likes: 234,
        comments: 45,
        timestamp: '2 horas atrás',
      },
      {
        id: '2',
        userId: '2',
        userName: 'Maria Santos',
        plantName: 'Bromélia gigante',
        imageUrl: '/placeholder.jpg',
        location: 'Mata Atlântica',
        likes: 189,
        comments: 32,
        timestamp: '5 horas atrás',
      },
    ]);

    setTopUsers([
      {
        id: '1',
        name: 'Dr. Silva',
        profile: 'Botânico Profissional',
        discoveries: 342,
        rank: 1,
        badges: ['expert', 'pioneer', 'contributor'],
      },
      {
        id: '2',
        name: 'Maria Santos',
        profile: 'Educadora Ambiental',
        discoveries: 289,
        rank: 2,
        badges: ['educator', 'contributor'],
      },
      {
        id: '3',
        name: session.user?.name || 'Você',
        profile: 'Explorador',
        discoveries: 45,
        rank: 12,
        badges: ['beginner'],
      },
    ]);

    setLoading(false);
  };

  const getBadgeIcon = (badge: string) => {
    switch (badge) {
      case 'expert':
        return <Crown className="w-5 h-5 text-yellow-400" />;
      case 'pioneer':
        return <Sparkles className="w-5 h-5 text-purple-400" />;
      case 'contributor':
        return <Star className="w-5 h-5 text-blue-400" />;
      case 'educator':
        return <Award className="w-5 h-5 text-green-400" />;
      default:
        return <Medal className="w-5 h-5 text-gray-400" />;
    }
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-400';
    if (rank === 2) return 'text-gray-300';
    if (rank === 3) return 'text-orange-400';
    return 'text-[var(--md-text-secondary)]';
  };

  return (
    <div className="w-full h-full p-6 bg-[var(--md-surface-base)] overflow-y-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className={`${typography.headlineLarge} mb-2`}>Comunidade ARBORIS</h1>
        <p className={`${typography.bodyLarge} text-[var(--md-text-secondary)]`}>
          Conecte-se com {topUsers.length.toLocaleString()} exploradores ativos
        </p>
      </div>

      {/* View Selector */}
      <div className="flex gap-2 mb-6">
        <Button
          onClick={() => setView('feed')}
          variant={view === 'feed' ? 'default' : 'outline'}
          className="flex-1"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Descobertas
        </Button>
        <Button
          onClick={() => setView('rankings')}
          variant={view === 'rankings' ? 'default' : 'outline'}
          className="flex-1"
        >
          <Trophy className="w-4 h-4 mr-2" />
          Rankings
        </Button>
        <Button
          onClick={() => setView('profile')}
          variant={view === 'profile' ? 'default' : 'outline'}
          className="flex-1"
        >
          <Users className="w-4 h-4 mr-2" />
          Meu Perfil
        </Button>
      </div>

      {/* Search Bar */}
      <div className="mb-6 relative">
        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--md-text-disabled)]" />
        <Input
          placeholder="Buscar exploradores ou descobertas..."
          className="w-full pl-10"
        />
      </div>

      <AnimatePresence mode="wait">
        {/* Feed View */}
        {view === 'feed' && (
          <motion.div
            key="feed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {discoveries.map((discovery, index) => (
              <motion.div
                key={discovery.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-xl bg-[var(--md-surface-elevated1)] hover:bg-[var(--md-surface-elevated2)] transition-colors"
              >
                {/* User Header */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--md-primary-container)] flex items-center justify-center">
                    <Users className="w-5 h-5 text-[var(--md-primary-main)]" />
                  </div>
                  <div className="flex-1">
                    <h4 className={`${typography.titleSmall}`}>{discovery.userName}</h4>
                    <p className={`${typography.bodySmall} text-[var(--md-text-secondary)]`}>
                      {discovery.timestamp}
                    </p>
                  </div>
                  <Button size="sm" variant="ghost">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>

                {/* Discovery Content */}
                <div className="mb-3">
                  <h3 className={`${typography.titleMedium} mb-2`}>{discovery.plantName}</h3>
                  {discovery.location && (
                    <p className={`${typography.bodySmall} text-[var(--md-text-secondary)] mb-3`}>
                      📍 {discovery.location}
                    </p>
                  )}
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-[var(--md-surface-base)]">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Sparkles className="w-12 h-12 text-[var(--md-text-disabled)]" />
                    </div>
                  </div>
                </div>

                {/* Interaction Bar */}
                <div className="flex items-center gap-4">
                  <Button size="sm" variant="ghost" className="flex items-center gap-2">
                    <Heart className="w-4 h-4" />
                    <span>{discovery.likes}</span>
                  </Button>
                  <Button size="sm" variant="ghost" className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    <span>{discovery.comments}</span>
                  </Button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Rankings View */}
        {view === 'rankings' && (
          <motion.div
            key="rankings"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* Podium */}
            <div className="p-6 rounded-xl bg-gradient-to-br from-[var(--md-primary-container)] to-[var(--md-secondary-container)] border border-[var(--md-primary-main)] mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-6 h-6 text-yellow-400" />
                <h3 className={`${typography.titleLarge}`}>Top 3 Exploradores</h3>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {topUsers.slice(0, 3).map((user) => (
                  <div key={user.id} className="text-center">
                    <div className={`${typography.headlineLarge} ${getRankColor(user.rank)} mb-1`}>
                      #{user.rank}
                    </div>
                    <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-[var(--md-surface-elevated2)] flex items-center justify-center">
                      <Users className="w-8 h-8 text-[var(--md-primary-main)]" />
                    </div>
                    <div className={`${typography.titleSmall} mb-1`}>{user.name}</div>
                    <div className={`${typography.bodySmall} text-[var(--md-text-secondary)]`}>
                      {user.discoveries} descobertas
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Full Rankings */}
            {topUsers.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-4 rounded-xl ${
                  user.name === session.user?.name
                    ? 'bg-[var(--md-primary-container)] border border-[var(--md-primary-main)]'
                    : 'bg-[var(--md-surface-elevated1)]'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`${typography.headlineMedium} ${getRankColor(user.rank)} w-12 text-center`}>
                    #{user.rank}
                  </div>
                  <div className="w-12 h-12 rounded-full bg-[var(--md-surface-elevated2)] flex items-center justify-center">
                    <Users className="w-6 h-6 text-[var(--md-primary-main)]" />
                  </div>
                  <div className="flex-1">
                    <h4 className={`${typography.titleMedium} mb-1`}>{user.name}</h4>
                    <p className={`${typography.bodySmall} text-[var(--md-text-secondary)]`}>
                      {user.profile}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`${typography.titleLarge} text-[var(--md-primary-main)]`}>
                      {user.discoveries}
                    </div>
                    <div className={`${typography.bodySmall} text-[var(--md-text-secondary)]`}>
                      descobertas
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {user.badges.map((badge) => (
                      <div key={badge} className="w-8 h-8 rounded-full bg-[var(--md-surface-base)] flex items-center justify-center">
                        {getBadgeIcon(badge)}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Profile View */}
        {view === 'profile' && (
          <motion.div
            key="profile"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Profile Header */}
            <div className="p-6 rounded-xl bg-gradient-to-br from-[var(--md-primary-container)] to-[var(--md-secondary-container)]">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-20 h-20 rounded-full bg-[var(--md-surface-elevated2)] flex items-center justify-center">
                  <Users className="w-10 h-10 text-[var(--md-primary-main)]" />
                </div>
                <div className="flex-1">
                  <h2 className={`${typography.headlineMedium} mb-1`}>{session.user?.name}</h2>
                  <p className={`${typography.bodyLarge} text-[var(--md-text-secondary)]`}>
                    {topUsers.find((u) => u.name === session.user?.name)?.profile}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className={`${typography.headlineMedium} text-[var(--md-primary-main)]`}>
                    {topUsers.find((u) => u.name === session.user?.name)?.rank}
                  </div>
                  <div className={`${typography.bodySmall} text-[var(--md-text-secondary)]`}>
                    Posição
                  </div>
                </div>
                <div className="text-center">
                  <div className={`${typography.headlineMedium} text-[var(--md-primary-main)]`}>
                    {topUsers.find((u) => u.name === session.user?.name)?.discoveries}
                  </div>
                  <div className={`${typography.bodySmall} text-[var(--md-text-secondary)]`}>
                    Descobertas
                  </div>
                </div>
                <div className="text-center">
                  <div className={`${typography.headlineMedium} text-[var(--md-primary-main)]`}>
                    {topUsers.find((u) => u.name === session.user?.name)?.badges.length}
                  </div>
                  <div className={`${typography.bodySmall} text-[var(--md-text-secondary)]`}>
                    Badges
                  </div>
                </div>
              </div>
            </div>

            {/* Badges Collection */}
            <div className="p-6 rounded-xl bg-[var(--md-surface-elevated1)]">
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-6 h-6 text-[var(--md-secondary-main)]" />
                <h3 className={`${typography.titleLarge}`}>Suas Conquistas</h3>
              </div>
              <div className="grid grid-cols-4 gap-4">
                {['beginner', 'contributor', 'expert', 'pioneer'].map((badge) => {
                  const hasBadge = topUsers
                    .find((u) => u.name === session.user?.name)
                    ?.badges.includes(badge);
                  return (
                    <div
                      key={badge}
                      className={`p-4 rounded-lg text-center ${
                        hasBadge
                          ? 'bg-[var(--md-primary-container)]'
                          : 'bg-[var(--md-surface-base)] opacity-30'
                      }`}
                    >
                      <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-[var(--md-surface-elevated2)] flex items-center justify-center">
                        {getBadgeIcon(badge)}
                      </div>
                      <div className={`${typography.labelSmall} capitalize`}>{badge}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Share Profile Button */}
            <Button className="w-full bg-[var(--md-primary-main)] hover:bg-[var(--md-primary-dark)] text-[var(--md-surface-base)]">
              <Share2 className="w-4 h-4 mr-2" />
              Compartilhar Perfil
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

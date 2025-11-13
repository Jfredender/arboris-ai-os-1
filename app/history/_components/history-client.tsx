'use client';

import { useState, useEffect } from 'react';
import { Session } from 'next-auth';
import { Loader2 } from 'lucide-react';
import HistoryIntelligent from './history-intelligent';

interface HistoryClientProps {
  session: Session;
}

export default function HistoryClient({ session }: HistoryClientProps) {
  const [userProfile, setUserProfile] = useState('Explorador');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const response = await fetch('/api/preferences');
      if (response.ok) {
        const data = await response.json();
        if (data.preferences?.detectedProfile) {
          setUserProfile(data.preferences.detectedProfile);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[var(--md-surface-base)]">
        <Loader2 className="w-12 h-12 animate-spin text-[var(--md-primary-main)]" />
      </div>
    );
  }

  return <HistoryIntelligent userProfile={userProfile} />;
}


'use client';

import { useState, useEffect } from 'react';
import { Session } from 'next-auth';
import { Loader2 } from 'lucide-react';
import ExploratorWelcome from './explorator-welcome';
import ExploratorMain from './explorator-main';

interface ExploratorClientProps {
  session: Session;
}

interface UserPreferences {
  explorationGoal: string;
  primaryObjective: string;
  detectedProfile: string;
  activeTools: string[];
  customPrompt?: string;
}

export default function ExploratorClient({ session }: ExploratorClientProps) {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const response = await fetch('/api/preferences');
      if (response.ok) {
        const data = await response.json();
        if (data.preferences) {
          setPreferences(data.preferences);
        } else {
          setShowWelcome(true);
        }
      } else {
        setShowWelcome(true);
      }
    } catch (error) {
      console.error('Erro ao carregar preferências:', error);
      setShowWelcome(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWelcomeComplete = (prefs: UserPreferences) => {
    setPreferences(prefs);
    setShowWelcome(false);
  };

  const handleSkipWelcome = () => {
    const defaultPrefs: UserPreferences = {
      explorationGoal: 'complete',
      primaryObjective: 'research',
      detectedProfile: 'Explorador',
      activeTools: ['camera', 'scanner', 'history'],
    };
    setPreferences(defaultPrefs);
    setShowWelcome(false);
  };

  const handleConfigureTools = () => {
    setShowWelcome(true);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[var(--md-surface-base)]">
        <Loader2 className="w-12 h-12 animate-spin text-[var(--md-primary-main)]" />
      </div>
    );
  }

  return (
    <>
      {showWelcome || !preferences ? (
        <ExploratorWelcome
          onComplete={handleWelcomeComplete}
          onSkip={handleSkipWelcome}
          userEmail={session.user?.email || ''}
        />
      ) : (
        <ExploratorMain
          userProfile={preferences.detectedProfile}
          activeTools={preferences.activeTools}
          onConfigureTools={handleConfigureTools}
        />
      )}
    </>
  );
}

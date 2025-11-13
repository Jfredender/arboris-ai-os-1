
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Zap, Settings, ChevronRight, Leaf, FlaskConical, GraduationCap, Briefcase, Check, Heart } from 'lucide-react';
import { materialColors, elevation, motion as motionTokens, typography, shape } from '@/lib/material-colors';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

interface ExploratorWelcomeProps {
  onComplete: (preferences: UserPreferences) => void;
  onSkip: () => void;
  userEmail: string;
}

interface UserPreferences {
  explorationGoal: string;
  primaryObjective: string;
  detectedProfile: string;
  activeTools: string[];
  customPrompt?: string;
}

export default function ExploratorWelcome({ onComplete, onSkip, userEmail }: ExploratorWelcomeProps) {
  const [step, setStep] = useState(0);
  const [preferences, setPreferences] = useState<Partial<UserPreferences>>({
    activeTools: [],
  });
  const [showProfileDetection, setShowProfileDetection] = useState(false);
  const [detectedProfile, setDetectedProfile] = useState('');
  const [showCustomPrompt, setShowCustomPrompt] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');

  // Questão 1: O que deseja explorar?
  const explorationOptions = [
    { id: 'plants', label: 'Plantas', icon: Leaf, description: 'Identificação e análise botânica' },
    { id: 'soil', label: 'Solo', icon: FlaskConical, description: 'Análise de composição e saúde' },
    { id: 'health', label: 'Saúde', icon: Heart, description: 'Diagnóstico e assistência médica' },
    { id: 'complete', label: 'Completo', icon: Sparkles, description: 'Todos os recursos disponíveis' },
  ];

  // Questão 2: Objetivo principal
  const objectiveOptions = [
    { id: 'research', label: 'Pesquisa Científica', icon: FlaskConical, description: 'Análises detalhadas e dados técnicos' },
    { id: 'cultivation', label: 'Cultivo e Jardinagem', icon: Leaf, description: 'Cuidados práticos com plantas' },
    { id: 'education', label: 'Educação e Ensino', icon: GraduationCap, description: 'Material didático e aprendizado' },
    { id: 'professional', label: 'Uso Profissional', icon: Briefcase, description: 'Ferramentas avançadas e relatórios' },
  ];

  // Detectar perfil baseado nas respostas
  useEffect(() => {
    if (preferences.explorationGoal && preferences.primaryObjective) {
      const profile = detectUserProfile();
      setDetectedProfile(profile);
      setShowProfileDetection(true);
    }
  }, [preferences]);

  const detectUserProfile = (): string => {
    const { explorationGoal, primaryObjective } = preferences;

    // Priorizar Saúde se selecionado
    if (explorationGoal === 'health') {
      if (primaryObjective === 'professional') {
        return 'Profissional de Saúde';
      } else if (primaryObjective === 'research') {
        return 'Pesquisador Médico';
      } else {
        return 'Assistente de Saúde';
      }
    }

    if (primaryObjective === 'research') {
      return 'Pesquisador Científico';
    } else if (primaryObjective === 'cultivation') {
      return 'Especialista em Cultivo';
    } else if (primaryObjective === 'education') {
      return 'Educador Ambiental';
    } else if (primaryObjective === 'professional') {
      return 'Profissional Especializado';
    } else if (explorationGoal === 'complete') {
      return 'Explorador Completo';
    } else if (explorationGoal === 'plants') {
      return 'Botânico Entusiasta';
    } else if (explorationGoal === 'soil') {
      return 'Analista de Solo';
    } else {
      return 'Explorador da Natureza';
    }
  };

  const handleOptionSelect = (field: keyof UserPreferences, value: string) => {
    setPreferences((prev) => ({ ...prev, [field]: value }));
    
    // Auto-avançar para próxima pergunta (apenas 2 perguntas agora)
    setTimeout(() => {
      if (step < 1) {
        setStep(step + 1);
      }
    }, 400);
  };

  const handleProfileAccept = () => {
    const activeTools = activateToolsBasedOnProfile(detectedProfile, preferences);
    const finalPreferences: UserPreferences = {
      explorationGoal: preferences.explorationGoal || '',
      primaryObjective: preferences.primaryObjective || '',
      detectedProfile,
      activeTools,
      customPrompt,
    };
    
    // Salvar preferências no banco
    savePreferences(finalPreferences);
    onComplete(finalPreferences);
  };

  const activateToolsBasedOnProfile = (profile: string, prefs: Partial<UserPreferences>): string[] => {
    const baseTools = ['camera', 'scanner', 'history'];
    
    // Ferramentas específicas de Saúde
    if (prefs.explorationGoal === 'health') {
      if (profile.includes('Profissional')) {
        return [...baseTools, 'health-diagnostics', 'prescription-system', 'professionals-database', 'medical-export', 'specialist-ai'];
      } else {
        return [...baseTools, 'health-diagnostics', 'prescription-system', 'professionals-database', 'specialist-ai'];
      }
    }
    
    if (profile.includes('Profissional') || profile.includes('Especializado')) {
      return [...baseTools, 'advanced-analysis', 'lab-tools', 'export-data', 'api-integration'];
    } else if (profile.includes('Educador')) {
      return [...baseTools, 'annotations', 'share', 'reports'];
    } else if (prefs.explorationGoal === 'complete') {
      return [...baseTools, 'all-tools'];
    } else {
      return baseTools;
    }
  };

  const savePreferences = async (prefs: UserPreferences) => {
    try {
      await fetch('/api/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences: prefs }),
      });
      
      toast({
        title: "Preferências Salvas",
        description: `Perfil ${prefs.detectedProfile} ativado com sucesso!`,
      });
    } catch (error) {
      console.error('Erro ao salvar preferências:', error);
    }
  };

  const handleCustomPrompt = () => {
    if (customPrompt.trim()) {
      const activeTools = ['camera', 'scanner', 'history', 'custom-tools'];
      const finalPreferences: UserPreferences = {
        explorationGoal: 'custom',
        primaryObjective: 'custom',
        detectedProfile: 'Usuário Personalizado',
        activeTools,
        customPrompt,
      };
      
      savePreferences(finalPreferences);
      onComplete(finalPreferences);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--md-surface-base)] overflow-y-auto py-8">
      <div className="w-full max-w-4xl px-6 my-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-10 h-10 text-[var(--md-primary-main)]" />
            <h1 className={`${typography.displaySmall} text-[var(--md-text-primary)]`}>
              EXPLORATOR
            </h1>
          </div>
          <p className={`${typography.bodyLarge} text-[var(--md-text-secondary)]`}>
            Configure sua experiência em apenas 2 perguntas
          </p>
        </motion.div>

        {/* Progress Indicator */}
        {step < 2 && (
          <div className="flex justify-center gap-2 mb-8">
            {[0, 1].map((i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all duration-300 ${
                  i === step ? 'w-16 bg-[var(--md-primary-main)]' : 'w-12 bg-[var(--md-divider)]'
                }`}
              />
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* Questão 1 */}
          {step === 0 && (
            <motion.div
              key="question-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className={`${typography.headlineMedium} text-center mb-8`}>
                O que você deseja explorar hoje?
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {explorationOptions.map((option) => (
                  <Button
                    key={option.id}
                    onClick={() => handleOptionSelect('explorationGoal', option.id)}
                    className={`h-auto p-6 flex flex-col items-center gap-3 ${shape.large} transition-all duration-200 ${
                      preferences.explorationGoal === option.id
                        ? 'bg-[var(--md-primary-container)] border-2 border-[var(--md-primary-main)]'
                        : 'bg-[var(--md-surface-elevated1)] hover:bg-[var(--md-surface-elevated2)]'
                    }`}
                    variant="ghost"
                  >
                    <option.icon className="w-8 h-8 text-[var(--md-primary-main)]" />
                    <div className="text-center">
                      <div className={`${typography.titleMedium} mb-1`}>{option.label}</div>
                      <div className={`${typography.bodySmall} text-[var(--md-text-secondary)]`}>
                        {option.description}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Questão 2 */}
          {step === 1 && (
            <motion.div
              key="question-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className={`${typography.headlineMedium} text-center mb-8`}>
                Qual seu objetivo principal?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {objectiveOptions.map((option) => (
                  <Button
                    key={option.id}
                    onClick={() => handleOptionSelect('primaryObjective', option.id)}
                    className={`h-auto p-6 flex items-start gap-4 ${shape.large} transition-all duration-200 ${
                      preferences.primaryObjective === option.id
                        ? 'bg-[var(--md-primary-container)] border-2 border-[var(--md-primary-main)]'
                        : 'bg-[var(--md-surface-elevated1)] hover:bg-[var(--md-surface-elevated2)]'
                    }`}
                    variant="ghost"
                  >
                    <option.icon className="w-8 h-8 text-[var(--md-primary-main)] flex-shrink-0" />
                    <div className="text-left">
                      <div className={`${typography.titleMedium} mb-1`}>{option.label}</div>
                      <div className={`${typography.bodySmall} text-[var(--md-text-secondary)]`}>
                        {option.description}
                      </div>
                    </div>
                    {preferences.primaryObjective === option.id && (
                      <Check className="w-6 h-6 text-[var(--md-primary-main)] ml-auto" />
                    )}
                  </Button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Detecção de Perfil */}
          {showProfileDetection && step === 1 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-8 p-6 rounded-xl bg-gradient-to-br from-[var(--md-primary-container)] to-[var(--md-secondary-container)] border border-[var(--md-primary-main)]"
            >
              <div className="flex items-center gap-3 mb-4">
                <Zap className="w-6 h-6 text-[var(--md-primary-main)]" />
                <h3 className={`${typography.titleLarge}`}>Percepção do EXPLORATOR</h3>
              </div>
              <p className={`${typography.bodyLarge} mb-4`}>
                Detectei que você é um <strong className="text-[var(--md-primary-main)]">{detectedProfile}</strong>
              </p>
              <p className={`${typography.bodySmall} text-[var(--md-text-secondary)] mb-6`}>
                Recursos especializados serão ativados automaticamente para otimizar sua experiência.
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={handleProfileAccept}
                  className="flex-1 bg-[var(--md-primary-main)] hover:bg-[var(--md-primary-dark)] text-[var(--md-surface-base)]"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Aceitar e Continuar
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  variant="outline"
                  className="border-[var(--md-divider)]"
                >
                  Personalizar
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Opções Adicionais */}
        {!showProfileDetection && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-12 flex flex-col items-center gap-4"
          >
            <Button
              onClick={() => setShowCustomPrompt(true)}
              variant="ghost"
              className="text-[var(--md-text-secondary)] hover:text-[var(--md-text-primary)]"
            >
              <Settings className="w-4 h-4 mr-2" />
              Configuração personalizada
            </Button>
            <Button
              onClick={onSkip}
              variant="ghost"
              className="text-[var(--md-text-disabled)] text-sm"
            >
              Pular e começar
            </Button>
          </motion.div>
        )}

        {/* Custom Prompt Modal */}
        <AnimatePresence>
          {showCustomPrompt && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md"
              onClick={() => setShowCustomPrompt(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-2xl mx-6 p-8 rounded-2xl bg-[var(--md-surface-elevated2)] border border-[var(--md-divider)]"
                style={{
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 1px rgba(138,180,248,0.3)',
                }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <Sparkles className="w-6 h-6 text-[var(--md-primary-main)]" />
                  <h3 className={`${typography.headlineSmall}`}>
                    Configuração Personalizada
                  </h3>
                </div>
                <p className={`${typography.bodyMedium} text-[var(--md-text-secondary)] mb-4`}>
                  Descreva em detalhes o que você deseja explorar e analisar. O EXPLORATOR será configurado especialmente para suas necessidades.
                </p>
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Ex: Preciso identificar doenças em plantas de café com análise visual detalhada e recomendações de tratamento..."
                  className="w-full h-40 p-4 rounded-xl bg-[var(--md-surface-base)] border border-[var(--md-divider)] text-[var(--md-text-primary)] placeholder:text-[var(--md-text-disabled)] resize-none focus:outline-none focus:border-[var(--md-primary-main)] focus:ring-2 focus:ring-[var(--md-primary-main)]/20 transition-all"
                  autoFocus
                />
                <div className="flex gap-3 mt-6">
                  <Button
                    onClick={handleCustomPrompt}
                    disabled={!customPrompt.trim()}
                    className="flex-1 bg-[var(--md-primary-main)] hover:bg-[var(--md-primary-dark)] text-[var(--md-surface-base)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Ativar Configuração
                  </Button>
                  <Button
                    onClick={() => setShowCustomPrompt(false)}
                    variant="outline"
                    className="border-[var(--md-divider)] hover:bg-[var(--md-surface-elevated1)]"
                  >
                    Voltar
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

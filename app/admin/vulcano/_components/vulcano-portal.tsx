
'use client';

import { useState } from 'react';
import { Session } from 'next-auth';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderTree,
  Puzzle,
  Zap,
  Palette,
  Settings,
  Rocket,
  Network,
  FileCode,
  Download,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Search,
  Home,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { typography } from '@/lib/material-colors';
import { useRouter } from 'next/navigation';
import {
  StructureTab,
  ComponentsTab,
  APIsTab,
  ResourcesTab,
  DesignSystemTab,
  ConfigTab,
  DeploymentTab,
} from './portal-tabs';

interface VulcanoPortalProps {
  session: Session;
}

type TabType = 
  | 'overview'
  | 'structure'
  | 'components'
  | 'apis'
  | 'resources'
  | 'design'
  | 'config'
  | 'deployment';

export default function VulcanoPortal({ session }: VulcanoPortalProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['app']));

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: Home },
    { id: 'structure' as TabType, label: 'Estrutura', icon: FolderTree },
    { id: 'components' as TabType, label: 'Componentes', icon: Puzzle },
    { id: 'apis' as TabType, label: 'APIs', icon: Zap },
    { id: 'resources' as TabType, label: 'Recursos', icon: Network },
    { id: 'design' as TabType, label: 'Design System', icon: Palette },
    { id: 'config' as TabType, label: 'Configurações', icon: Settings },
    { id: 'deployment' as TabType, label: 'Deployment', icon: Rocket },
  ];

  const toggleFolder = (folder: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folder)) {
      newExpanded.delete(folder);
    } else {
      newExpanded.add(folder);
    }
    setExpandedFolders(newExpanded);
  };

  const exportToPDF = () => {
    // Implementar exportação futura
    alert('Funcionalidade de export será implementada em breve');
  };

  return (
    <div className="min-h-screen bg-[var(--md-surface-base)] text-[var(--md-text-primary)]">
      {/* Header */}
      <div className="bg-[var(--md-surface-elevated1)] border-b border-[var(--md-divider)] px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`${typography.displaySmall} text-[var(--md-primary-main)] mb-2`}>
                🏗️ VULCANO ARCHITECT PORTAL
              </h1>
              <p className={`${typography.bodyLarge} text-[var(--md-text-secondary)]`}>
                Sistema completo de documentação e overview do ARBORIS AI OS 1
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                onClick={() => router.push('/dashboard')}
                variant="outline"
                className="border-[var(--md-divider)]"
              >
                <Home className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              <Button
                onClick={exportToPDF}
                className="bg-[var(--md-primary-main)] hover:bg-[var(--md-primary-dark)]"
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar PDF
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="mt-6 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--md-text-secondary)]" />
            <Input
              type="text"
              placeholder="Buscar componentes, APIs, arquivos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-[var(--md-surface-elevated2)] border-[var(--md-divider)]"
            />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-[var(--md-surface-elevated1)] border-b border-[var(--md-divider)] px-8">
        <div className="max-w-7xl mx-auto flex gap-2 overflow-x-auto hide-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap
                  ${
                    activeTab === tab.id
                      ? 'border-[var(--md-primary-main)] text-[var(--md-primary-main)]'
                      : 'border-transparent text-[var(--md-text-secondary)] hover:text-[var(--md-text-primary)]'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span className={typography.labelLarge}>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'overview' && <OverviewTab />}
            {activeTab === 'structure' && (
              <StructureTab
                expandedFolders={expandedFolders}
                toggleFolder={toggleFolder}
              />
            )}
            {activeTab === 'components' && <ComponentsTab searchQuery={searchQuery} />}
            {activeTab === 'apis' && <APIsTab searchQuery={searchQuery} />}
            {activeTab === 'resources' && <ResourcesTab />}
            {activeTab === 'design' && <DesignSystemTab />}
            {activeTab === 'config' && <ConfigTab />}
            {activeTab === 'deployment' && <DeploymentTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// Overview Tab Component
function OverviewTab() {
  return (
    <div className="space-y-6">
      <div className="md-card-elevated">
        <h2 className={`${typography.headlineMedium} mb-4`}>
          Bem-vindo ao ARBORIS AI OS 1
        </h2>
        <p className={`${typography.bodyLarge} text-[var(--md-text-secondary)] mb-4`}>
          Este portal contém toda a documentação técnica e arquitetural do sistema.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="p-4 rounded-lg bg-[var(--md-primary-container)] border border-[var(--md-primary-main)]">
            <div className="text-3xl font-bold text-[var(--md-primary-main)] mb-2">106</div>
            <div className={typography.bodyMedium}>Arquivos totais</div>
          </div>
          <div className="p-4 rounded-lg bg-[var(--md-secondary-container)] border border-[var(--md-secondary-main)]">
            <div className="text-3xl font-bold text-[var(--md-secondary-main)] mb-2">45+</div>
            <div className={typography.bodyMedium}>Componentes React</div>
          </div>
          <div className="p-4 rounded-lg bg-[var(--md-primary-container)] border border-[var(--md-primary-main)]">
            <div className="text-3xl font-bold text-[var(--md-primary-main)] mb-2">15+</div>
            <div className={typography.bodyMedium}>API Routes</div>
          </div>
        </div>
      </div>

      <div className="md-card-elevated">
        <h3 className={`${typography.titleLarge} mb-4`}>🎯 Funcionalidades Principais</h3>
        <div className="space-y-3">
          <FeatureItem
            title="Análise de Plantas"
            description="Sistema de identificação botânica com Google Gemini Vision"
            status="active"
          />
          <FeatureItem
            title="Análise de Saúde"
            description="Diagnóstico médico diferencial com recomendações"
            status="active"
          />
          <FeatureItem
            title="Sensores de Dispositivo"
            description="GPS, giroscópio, luz ambiente e acelerômetro"
            status="active"
          />
          <FeatureItem
            title="ML Local"
            description="Cache de modelos e análise offline"
            status="active"
          />
          <FeatureItem
            title="Material Design 3"
            description="Sistema de design completo Google"
            status="active"
          />
        </div>
      </div>

      <div className="md-card-elevated">
        <h3 className={`${typography.titleLarge} mb-4`}>📚 Quick Links</h3>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="justify-start">
            <FileCode className="w-4 h-4 mr-2" />
            Checklist Status
          </Button>
          <Button variant="outline" className="justify-start">
            <Rocket className="w-4 h-4 mr-2" />
            Deployment Guide
          </Button>
          <Button variant="outline" className="justify-start">
            <Palette className="w-4 h-4 mr-2" />
            Design Tokens
          </Button>
          <Button variant="outline" className="justify-start">
            <Network className="w-4 h-4 mr-2" />
            API Documentation
          </Button>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({
  title,
  description,
  status,
}: {
  title: string;
  description: string;
  status: 'active' | 'inactive';
}) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-[var(--md-surface-elevated1)]">
      {status === 'active' ? (
        <CheckCircle2 className="w-5 h-5 text-[var(--md-success)] flex-shrink-0 mt-0.5" />
      ) : (
        <AlertCircle className="w-5 h-5 text-[var(--md-warning)] flex-shrink-0 mt-0.5" />
      )}
      <div>
        <div className={`${typography.titleSmall} mb-1`}>{title}</div>
        <div className={`${typography.bodySmall} text-[var(--md-text-secondary)]`}>
          {description}
        </div>
      </div>
    </div>
  );
}

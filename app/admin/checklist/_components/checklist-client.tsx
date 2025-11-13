
'use client';

import { useState, useEffect } from 'react';
import { Session } from 'next-auth';
import { materialColors, typography, elevation } from '@/lib/material-colors';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, X, AlertCircle, Wrench, Trash2, Edit, 
  ChevronDown, ChevronUp, Save, RefreshCw,
  Shield, Scan, Activity, BarChart3, Clock,
  Users, Book, Cpu, Zap, Globe
} from 'lucide-react';

interface ChecklistItem {
  id: string;
  category: string;
  feature: string;
  description: string;
  status: 'ok' | 'incomplete' | 'broken' | 'missing' | 'unchecked';
  action: 'none' | 'fix' | 'modify' | 'delete';
  notes: string;
  testUrl?: string;
}

interface ChecklistClientProps {
  session: Session | null;
}

const initialChecklist: ChecklistItem[] = [
  // AUTENTICAÇÃO
  {
    id: 'auth-1',
    category: 'Autenticação',
    feature: 'Login com Email/Senha',
    description: 'Sistema de login com credenciais',
    status: 'unchecked',
    action: 'none',
    notes: '',
    testUrl: '/auth/signin'
  },
  {
    id: 'auth-2',
    category: 'Autenticação',
    feature: 'Login com Google SSO',
    description: 'Autenticação via Google',
    status: 'unchecked',
    action: 'none',
    notes: '',
    testUrl: '/auth/signin'
  },
  {
    id: 'auth-3',
    category: 'Autenticação',
    feature: 'Guest Login',
    description: 'Acesso como visitante',
    status: 'unchecked',
    action: 'none',
    notes: '',
    testUrl: '/auth/signin'
  },
  {
    id: 'auth-4',
    category: 'Autenticação',
    feature: 'Logout',
    description: 'Sair do sistema',
    status: 'unchecked',
    action: 'none',
    notes: ''
  },
  {
    id: 'auth-5',
    category: 'Autenticação',
    feature: 'Proteção de Rotas',
    description: 'Redirecionamento de não autenticados',
    status: 'unchecked',
    action: 'none',
    notes: ''
  },

  // EXPLORATOR
  {
    id: 'exp-1',
    category: 'EXPLORATOR',
    feature: 'Questionário Inicial',
    description: 'Duas perguntas estratégicas',
    status: 'unchecked',
    action: 'none',
    notes: '',
    testUrl: '/explorator'
  },
  {
    id: 'exp-2',
    category: 'EXPLORATOR',
    feature: 'Câmera - Captura de Foto',
    description: 'Tirar foto com câmera do dispositivo',
    status: 'unchecked',
    action: 'none',
    notes: '',
    testUrl: '/explorator'
  },
  {
    id: 'exp-3',
    category: 'EXPLORATOR',
    feature: 'Câmera - Upload de Imagem',
    description: 'Fazer upload de imagem da galeria',
    status: 'unchecked',
    action: 'none',
    notes: '',
    testUrl: '/explorator'
  },
  {
    id: 'exp-4',
    category: 'EXPLORATOR',
    feature: 'Zoom da Câmera',
    description: 'Controle de zoom',
    status: 'unchecked',
    action: 'none',
    notes: '',
    testUrl: '/explorator'
  },
  {
    id: 'exp-5',
    category: 'EXPLORATOR',
    feature: 'Contraste da Câmera',
    description: 'Ajuste de contraste',
    status: 'unchecked',
    action: 'none',
    notes: '',
    testUrl: '/explorator'
  },
  {
    id: 'exp-6',
    category: 'EXPLORATOR',
    feature: 'Análise de Plantas',
    description: 'Identificação de plantas via IA',
    status: 'unchecked',
    action: 'none',
    notes: '',
    testUrl: '/explorator'
  },
  {
    id: 'exp-7',
    category: 'EXPLORATOR',
    feature: 'Análise de Saúde',
    description: 'Diagnóstico médico via IA',
    status: 'unchecked',
    action: 'none',
    notes: '',
    testUrl: '/explorator'
  },
  {
    id: 'exp-8',
    category: 'EXPLORATOR',
    feature: 'Display de Resultados',
    description: 'Visualização de análises',
    status: 'unchecked',
    action: 'none',
    notes: '',
    testUrl: '/explorator'
  },
  {
    id: 'exp-9',
    category: 'EXPLORATOR',
    feature: 'Painel de Sensores',
    description: 'Giroscópio, GPS, Acelerômetro',
    status: 'unchecked',
    action: 'none',
    notes: '',
    testUrl: '/explorator'
  },
  {
    id: 'exp-10',
    category: 'EXPLORATOR',
    feature: 'ML Local Settings',
    description: 'Configuração de processamento local',
    status: 'unchecked',
    action: 'none',
    notes: '',
    testUrl: '/explorator'
  },
  {
    id: 'exp-11',
    category: 'EXPLORATOR',
    feature: 'Overlay de Filtros',
    description: 'Filtros e configurações',
    status: 'unchecked',
    action: 'none',
    notes: '',
    testUrl: '/explorator'
  },

  // HEALTH SYSTEM
  {
    id: 'health-1',
    category: 'Sistema de Saúde',
    feature: 'Diagnóstico via IA',
    description: 'Análise de sintomas e diagnóstico',
    status: 'unchecked',
    action: 'none',
    notes: ''
  },
  {
    id: 'health-2',
    category: 'Sistema de Saúde',
    feature: 'Prescrição Médica',
    description: 'Geração de prescrições',
    status: 'unchecked',
    action: 'none',
    notes: ''
  },
  {
    id: 'health-3',
    category: 'Sistema de Saúde',
    feature: 'Recomendação de Profissionais',
    description: 'Indicação de especialistas',
    status: 'unchecked',
    action: 'none',
    notes: ''
  },
  {
    id: 'health-4',
    category: 'Sistema de Saúde',
    feature: 'Diagnóstico Diferencial',
    description: 'Múltiplas possibilidades diagnósticas',
    status: 'unchecked',
    action: 'none',
    notes: ''
  },
  {
    id: 'health-5',
    category: 'Sistema de Saúde',
    feature: 'Alertas de Emergência',
    description: 'Identificação de casos urgentes',
    status: 'unchecked',
    action: 'none',
    notes: ''
  },

  // DASHBOARD
  {
    id: 'dash-1',
    category: 'Dashboard',
    feature: 'Página Dashboard',
    description: 'Acesso ao dashboard',
    status: 'unchecked',
    action: 'none',
    notes: '',
    testUrl: '/dashboard'
  },
  {
    id: 'dash-2',
    category: 'Dashboard',
    feature: 'Estatísticas',
    description: 'Visualização de estatísticas',
    status: 'unchecked',
    action: 'none',
    notes: '',
    testUrl: '/dashboard'
  },
  {
    id: 'dash-3',
    category: 'Dashboard',
    feature: 'Gráficos',
    description: 'Gráficos de análises',
    status: 'unchecked',
    action: 'none',
    notes: '',
    testUrl: '/dashboard'
  },
  {
    id: 'dash-4',
    category: 'Dashboard',
    feature: 'Widgets Informativos',
    description: 'Cards com informações',
    status: 'unchecked',
    action: 'none',
    notes: '',
    testUrl: '/dashboard'
  },

  // HISTORY
  {
    id: 'hist-1',
    category: 'Histórico',
    feature: 'Página de Histórico',
    description: 'Visualizar análises anteriores',
    status: 'unchecked',
    action: 'none',
    notes: '',
    testUrl: '/history'
  },
  {
    id: 'hist-2',
    category: 'Histórico',
    feature: 'Filtros de Histórico',
    description: 'Filtrar por tipo, data, etc',
    status: 'unchecked',
    action: 'none',
    notes: '',
    testUrl: '/history'
  },
  {
    id: 'hist-3',
    category: 'Histórico',
    feature: 'Comparação de Análises',
    description: 'Comparar múltiplas análises',
    status: 'unchecked',
    action: 'none',
    notes: '',
    testUrl: '/history'
  },
  {
    id: 'hist-4',
    category: 'Histórico',
    feature: 'Exportação (CSV)',
    description: 'Exportar dados em CSV',
    status: 'unchecked',
    action: 'none',
    notes: '',
    testUrl: '/history'
  },
  {
    id: 'hist-5',
    category: 'Histórico',
    feature: 'Exportação (JSON)',
    description: 'Exportar dados em JSON',
    status: 'unchecked',
    action: 'none',
    notes: '',
    testUrl: '/history'
  },
  {
    id: 'hist-6',
    category: 'Histórico',
    feature: 'Exportação (PDF)',
    description: 'Exportar relatório em PDF',
    status: 'unchecked',
    action: 'none',
    notes: '',
    testUrl: '/history'
  },
  {
    id: 'hist-7',
    category: 'Histórico',
    feature: 'Sistema de Compartilhamento',
    description: 'Compartilhar análises',
    status: 'unchecked',
    action: 'none',
    notes: '',
    testUrl: '/history'
  },
  {
    id: 'hist-8',
    category: 'Histórico',
    feature: 'Análise em Lote',
    description: 'Processar múltiplas análises',
    status: 'unchecked',
    action: 'none',
    notes: '',
    testUrl: '/history'
  },

  // COMMUNITY
  {
    id: 'comm-1',
    category: 'Community',
    feature: 'Página Community',
    description: 'Acesso à comunidade',
    status: 'unchecked',
    action: 'none',
    notes: '',
    testUrl: '/community'
  },
  {
    id: 'comm-2',
    category: 'Community',
    feature: 'Feed de Posts',
    description: 'Visualizar posts da comunidade',
    status: 'unchecked',
    action: 'none',
    notes: '',
    testUrl: '/community'
  },
  {
    id: 'comm-3',
    category: 'Community',
    feature: 'Criar Post',
    description: 'Publicar novo post',
    status: 'unchecked',
    action: 'none',
    notes: '',
    testUrl: '/community'
  },

  // CODEX
  {
    id: 'codex-1',
    category: 'Codex',
    feature: 'Página Codex',
    description: 'Base de conhecimento',
    status: 'unchecked',
    action: 'none',
    notes: '',
    testUrl: '/codex'
  },
  {
    id: 'codex-2',
    category: 'Codex',
    feature: 'Busca no Codex',
    description: 'Pesquisar na base de dados',
    status: 'unchecked',
    action: 'none',
    notes: '',
    testUrl: '/codex'
  },
  {
    id: 'codex-3',
    category: 'Codex',
    feature: 'Visualização de Entradas',
    description: 'Ver detalhes de espécies',
    status: 'unchecked',
    action: 'none',
    notes: '',
    testUrl: '/codex'
  },

  // NAVEGAÇÃO E UI
  {
    id: 'nav-1',
    category: 'Navegação/UI',
    feature: 'Menu de Navegação',
    description: 'Menu principal funcional',
    status: 'unchecked',
    action: 'none',
    notes: ''
  },
  {
    id: 'nav-2',
    category: 'Navegação/UI',
    feature: 'Seletor de Idiomas',
    description: 'PT/EN/ES',
    status: 'unchecked',
    action: 'none',
    notes: ''
  },
  {
    id: 'nav-3',
    category: 'Navegação/UI',
    feature: 'Notificações',
    description: 'Sistema de notificações',
    status: 'unchecked',
    action: 'none',
    notes: ''
  },
  {
    id: 'nav-4',
    category: 'Navegação/UI',
    feature: 'Tema Dark (Material Design 3)',
    description: 'Design system implementado',
    status: 'unchecked',
    action: 'none',
    notes: ''
  },
  {
    id: 'nav-5',
    category: 'Navegação/UI',
    feature: 'Animações',
    description: 'Transições suaves',
    status: 'unchecked',
    action: 'none',
    notes: ''
  },
  {
    id: 'nav-6',
    category: 'Navegação/UI',
    feature: 'Responsividade Mobile',
    description: 'Layout adaptado para celular',
    status: 'unchecked',
    action: 'none',
    notes: ''
  },

  // PERFORMANCE
  {
    id: 'perf-1',
    category: 'Performance',
    feature: 'Skeleton Loaders',
    description: 'Loading states',
    status: 'unchecked',
    action: 'none',
    notes: ''
  },
  {
    id: 'perf-2',
    category: 'Performance',
    feature: 'Otimização de Imagens',
    description: 'Compressão e resize',
    status: 'unchecked',
    action: 'none',
    notes: ''
  },
  {
    id: 'perf-3',
    category: 'Performance',
    feature: 'Cache de ML',
    description: 'Cache de análises',
    status: 'unchecked',
    action: 'none',
    notes: ''
  },

  // APIs
  {
    id: 'api-1',
    category: 'APIs',
    feature: 'API /api/analyze-plant',
    description: 'Análise de plantas',
    status: 'unchecked',
    action: 'none',
    notes: ''
  },
  {
    id: 'api-2',
    category: 'APIs',
    feature: 'API /api/analyze-health',
    description: 'Análise de saúde',
    status: 'unchecked',
    action: 'none',
    notes: ''
  },
  {
    id: 'api-3',
    category: 'APIs',
    feature: 'API /api/preferences',
    description: 'Preferências do usuário',
    status: 'unchecked',
    action: 'none',
    notes: ''
  },
  {
    id: 'api-4',
    category: 'APIs',
    feature: 'API /api/export',
    description: 'Exportação de dados',
    status: 'unchecked',
    action: 'none',
    notes: ''
  },
  {
    id: 'api-5',
    category: 'APIs',
    feature: 'API /api/share',
    description: 'Compartilhamento',
    status: 'unchecked',
    action: 'none',
    notes: ''
  },

  // INTEGRAÇÕES
  {
    id: 'int-1',
    category: 'Integrações',
    feature: 'Google Gemini AI',
    description: 'Integração com IA',
    status: 'unchecked',
    action: 'none',
    notes: ''
  },
  {
    id: 'int-2',
    category: 'Integrações',
    feature: 'Google Analytics',
    description: 'Tracking de eventos',
    status: 'unchecked',
    action: 'none',
    notes: ''
  },
  {
    id: 'int-3',
    category: 'Integrações',
    feature: 'S3 Storage',
    description: 'Armazenamento de imagens',
    status: 'unchecked',
    action: 'none',
    notes: ''
  },
  {
    id: 'int-4',
    category: 'Integrações',
    feature: 'Database PostgreSQL',
    description: 'Persistência de dados',
    status: 'unchecked',
    action: 'none',
    notes: ''
  },
];

const categoryIcons: Record<string, any> = {
  'Autenticação': Shield,
  'EXPLORATOR': Scan,
  'Sistema de Saúde': Activity,
  'Dashboard': BarChart3,
  'Histórico': Clock,
  'Community': Users,
  'Codex': Book,
  'Navegação/UI': Globe,
  'Performance': Zap,
  'APIs': Cpu,
  'Integrações': Globe,
};

const statusColors = {
  ok: materialColors.success,
  incomplete: materialColors.warning,
  broken: materialColors.error,
  missing: materialColors.text.disabled,
  unchecked: materialColors.text.secondary,
};

const statusLabels = {
  ok: 'OK',
  incomplete: 'Incompleto',
  broken: 'Quebrado',
  missing: 'Faltando',
  unchecked: 'Não Verificado',
};

const actionLabels = {
  none: 'Nenhuma',
  fix: 'Arrumar',
  modify: 'Modificar',
  delete: 'Excluir',
};

export default function ChecklistClient({ session }: ChecklistClientProps) {
  const [checklist, setChecklist] = useState<ChecklistItem[]>(initialChecklist);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const categories = Array.from(new Set(checklist.map(item => item.category)));

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const updateItem = (id: string, updates: Partial<ChecklistItem>) => {
    setChecklist(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const saveChecklist = async () => {
    setIsSaving(true);
    try {
      // Aqui você pode salvar no localStorage ou em uma API
      localStorage.setItem('arboris_checklist', JSON.stringify(checklist));
      setLastSaved(new Date());
    } catch (error) {
      console.error('Erro ao salvar checklist:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const loadChecklist = () => {
    try {
      const saved = localStorage.getItem('arboris_checklist');
      if (saved) {
        setChecklist(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Erro ao carregar checklist:', error);
    }
  };

  useEffect(() => {
    loadChecklist();
  }, []);

  const filteredChecklist = checklist.filter(item => {
    if (filterCategory !== 'all' && item.category !== filterCategory) return false;
    if (filterStatus !== 'all' && item.status !== filterStatus) return false;
    return true;
  });

  const stats = {
    total: checklist.length,
    ok: checklist.filter(i => i.status === 'ok').length,
    incomplete: checklist.filter(i => i.status === 'incomplete').length,
    broken: checklist.filter(i => i.status === 'broken').length,
    missing: checklist.filter(i => i.status === 'missing').length,
    unchecked: checklist.filter(i => i.status === 'unchecked').length,
    needsAction: checklist.filter(i => i.action !== 'none').length,
  };

  const progress = ((stats.ok / stats.total) * 100).toFixed(1);

  return (
    <div className="min-h-screen bg-[var(--md-surface-base)] pb-24">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[var(--md-surface-elevated2)] border-b border-[var(--md-divider)]">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className={`${typography.headlineSmall} text-[var(--md-text-primary)]`}>
                Checklist Administrativo
              </h1>
              <p className="text-[var(--md-text-secondary)] text-sm mt-1">
                ARBORIS AI OS 1 - Verificação Completa
              </p>
            </div>
            <button
              onClick={saveChecklist}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--md-primary-main)] text-[var(--md-surface-base)] font-medium transition-all active:scale-95"
            >
              {isSaving ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              Salvar
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-[var(--md-surface-elevated1)] rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-[var(--md-primary-main)]">
                {progress}%
              </div>
              <div className="text-xs text-[var(--md-text-secondary)]">Progresso</div>
            </div>
            <div className="bg-[var(--md-surface-elevated1)] rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-[var(--md-success)]">
                {stats.ok}
              </div>
              <div className="text-xs text-[var(--md-text-secondary)]">OK</div>
            </div>
            <div className="bg-[var(--md-surface-elevated1)] rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-[var(--md-error)]">
                {stats.needsAction}
              </div>
              <div className="text-xs text-[var(--md-text-secondary)]">Ações</div>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-2 gap-2">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 rounded-lg bg-[var(--md-surface-elevated1)] text-[var(--md-text-primary)] text-sm border border-[var(--md-divider)]"
            >
              <option value="all">Todas Categorias</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 rounded-lg bg-[var(--md-surface-elevated1)] text-[var(--md-text-primary)] text-sm border border-[var(--md-divider)]"
            >
              <option value="all">Todos Status</option>
              <option value="ok">OK</option>
              <option value="incomplete">Incompleto</option>
              <option value="broken">Quebrado</option>
              <option value="missing">Faltando</option>
              <option value="unchecked">Não Verificado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Checklist por Categoria */}
      <div className="p-4 space-y-4">
        {categories.map(category => {
          const categoryItems = filteredChecklist.filter(item => item.category === category);
          if (categoryItems.length === 0) return null;

          const Icon = categoryIcons[category] || Cpu;
          const isExpanded = expandedCategories.has(category);
          const categoryStats = {
            ok: categoryItems.filter(i => i.status === 'ok').length,
            total: categoryItems.length,
          };

          return (
            <div key={category} className="bg-[var(--md-surface-elevated1)] rounded-xl overflow-hidden">
              <button
                onClick={() => toggleCategory(category)}
                className="w-full p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-6 h-6 text-[var(--md-primary-main)]" />
                  <div className="text-left">
                    <div className="text-[var(--md-text-primary)] font-medium">
                      {category}
                    </div>
                    <div className="text-xs text-[var(--md-text-secondary)]">
                      {categoryStats.ok}/{categoryStats.total} OK
                    </div>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-[var(--md-text-secondary)]" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-[var(--md-text-secondary)]" />
                )}
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="border-t border-[var(--md-divider)] p-4 space-y-4">
                      {categoryItems.map(item => (
                        <div
                          key={item.id}
                          className="bg-[var(--md-surface-base)] rounded-lg p-4 space-y-3"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="font-medium text-[var(--md-text-primary)]">
                                {item.feature}
                              </div>
                              <div className="text-sm text-[var(--md-text-secondary)] mt-1">
                                {item.description}
                              </div>
                              {item.testUrl && (
                                <a
                                  href={item.testUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-[var(--md-primary-main)] mt-1 inline-block"
                                >
                                  Testar →
                                </a>
                              )}
                            </div>
                          </div>

                          {/* Status */}
                          <div>
                            <label className="text-xs text-[var(--md-text-secondary)] block mb-1">
                              Status:
                            </label>
                            <div className="flex gap-2 flex-wrap">
                              {Object.entries(statusLabels).map(([status, label]) => (
                                <button
                                  key={status}
                                  onClick={() => updateItem(item.id, { status: status as any })}
                                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                                    item.status === status
                                      ? 'bg-[var(--md-primary-main)] text-[var(--md-surface-base)]'
                                      : 'bg-[var(--md-surface-elevated1)] text-[var(--md-text-secondary)]'
                                  }`}
                                >
                                  {label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Action */}
                          <div>
                            <label className="text-xs text-[var(--md-text-secondary)] block mb-1">
                              Ação Necessária:
                            </label>
                            <div className="flex gap-2 flex-wrap">
                              {Object.entries(actionLabels).map(([action, label]) => (
                                <button
                                  key={action}
                                  onClick={() => updateItem(item.id, { action: action as any })}
                                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                                    item.action === action
                                      ? 'bg-[var(--md-secondary-main)] text-[var(--md-surface-base)]'
                                      : 'bg-[var(--md-surface-elevated1)] text-[var(--md-text-secondary)]'
                                  }`}
                                >
                                  {label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Notes */}
                          <div>
                            <label className="text-xs text-[var(--md-text-secondary)] block mb-1">
                              Observações:
                            </label>
                            <textarea
                              value={item.notes}
                              onChange={(e) => updateItem(item.id, { notes: e.target.value })}
                              placeholder="Adicione observações, detalhes do problema, etc..."
                              className="w-full px-3 py-2 rounded-lg bg-[var(--md-surface-elevated2)] text-[var(--md-text-primary)] text-sm border border-[var(--md-divider)] resize-none"
                              rows={2}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Last Saved */}
      {lastSaved && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-[var(--md-success)] text-[var(--md-surface-base)] rounded-full text-sm">
          Salvo às {lastSaved.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </div>
      )}
    </div>
  );
}

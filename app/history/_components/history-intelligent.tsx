
'use client';

import { useState, useEffect, useMemo, memo, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  TrendingUp,
  MapPin,
  Clock,
  Filter,
  Download,
  Share2,
  BarChart3,
  PieChart,
  Activity,
  Leaf,
  Target,
  Award,
  GitCompare,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { materialColors, typography, shape } from '@/lib/material-colors';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { format, parseISO, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import LoadingSkeleton from '@/app/explorator/_components/loading-skeleton';

// Lazy load heavy components
const ComparisonView = lazy(() => import('@/app/explorator/_components/comparison-view'));
const ExportModal = lazy(() => import('@/app/explorator/_components/export-modal'));
const ShareModal = lazy(() => import('@/app/explorator/_components/share-modal'));
const AdvancedFilters = lazy(() => import('@/app/explorator/_components/advanced-filters'));

interface HistoryIntelligentProps {
  userProfile: string;
}

interface AnalysisData {
  id: string;
  imageUrl: string;
  plantName: string;
  date: string;
  location?: { lat: number; lng: number };
  confidence: number;
  category: string;
}

export interface FilterCriteria {
  searchText?: string;
  categories?: string[];
  confidenceMin?: number;
  dateRange?: { start: Date; end: Date };
}

// Memoized analysis card component
const AnalysisCard = memo(({ 
  analysis, 
  index, 
  isSelected, 
  selectionMode, 
  onToggle, 
  onShare 
}: { 
  analysis: AnalysisData;
  index: number;
  isSelected: boolean;
  selectionMode: boolean;
  onToggle: () => void;
  onShare: () => void;
}) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.05 }}
    className="flex items-center gap-4 p-4 rounded-xl bg-[var(--md-surface-elevated1)] hover:bg-[var(--md-surface-elevated2)] transition-colors cursor-pointer"
    onClick={() => selectionMode && onToggle()}
    style={{
      border: isSelected ? `2px solid ${materialColors.primary.main}` : 'none',
    }}
  >
    {selectionMode && (
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
        style={{
          backgroundColor: isSelected
            ? materialColors.primary.main
            : materialColors.surface.elevated2,
          border: `2px solid ${isSelected ? materialColors.primary.main : materialColors.divider}`,
        }}
      >
        {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
      </div>
    )}
    <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
      <Image
        src={analysis.imageUrl}
        alt={analysis.plantName}
        fill
        className="object-cover"
        loading="lazy"
      />
    </div>
    <div className="flex-1">
      <h4 className={`${typography.titleMedium} mb-1`}>{analysis.plantName}</h4>
      <div className="flex items-center gap-4 text-sm text-[var(--md-text-secondary)]">
        <span className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          {format(parseISO(analysis.date), "dd 'de' MMMM, HH:mm", { locale: ptBR })}
        </span>
        {analysis.location && (
          <span className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {analysis.location.lat.toFixed(4)}, {analysis.location.lng.toFixed(4)}
          </span>
        )}
      </div>
    </div>
    <div className="flex flex-col items-end gap-2">
      <div
        className={`px-3 py-1 rounded-full text-xs font-medium ${
          analysis.confidence >= 80
            ? 'bg-[var(--md-success)] text-[var(--md-surface-base)]'
            : analysis.confidence >= 50
            ? 'bg-[var(--md-warning)] text-[var(--md-surface-base)]'
            : 'bg-[var(--md-error)] text-[var(--md-surface-base)]'
        }`}
      >
        {analysis.confidence}% confiança
      </div>
      <span className="text-xs text-[var(--md-text-disabled)]">
        {analysis.category}
      </span>
      {!selectionMode && (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onShare();
          }}
          className="mt-2"
        >
          <Share2 className="w-4 h-4" />
        </Button>
      )}
    </div>
  </motion.div>
));

AnalysisCard.displayName = 'AnalysisCard';

function HistoryIntelligent({ userProfile }: HistoryIntelligentProps) {
  const [analyses, setAnalyses] = useState<AnalysisData[]>([]);
  const [filteredAnalyses, setFilteredAnalyses] = useState<AnalysisData[]>([]);
  const [view, setView] = useState<'timeline' | 'heatmap' | 'stats'>('timeline');
  const [loading, setLoading] = useState(true);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [shareItem, setShareItem] = useState<AnalysisData | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterCriteria>({});

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [analyses, activeFilters]);

  const loadHistory = async () => {
    try {
      const response = await fetch('/api/probe/history');
      if (response.ok) {
        const data = await response.json();
        setAnalyses(data.analyses || []);
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...analyses];

    if (activeFilters.searchText) {
      const search = activeFilters.searchText.toLowerCase();
      filtered = filtered.filter((a) =>
        a.plantName.toLowerCase().includes(search)
      );
    }

    if (activeFilters.categories && activeFilters.categories.length > 0) {
      filtered = filtered.filter((a) =>
        activeFilters.categories?.includes(a.category)
      );
    }

    if (activeFilters.confidenceMin) {
      filtered = filtered.filter((a) => a.confidence >= (activeFilters.confidenceMin || 0));
    }

    if (activeFilters.dateRange) {
      filtered = filtered.filter((a) => {
        const date = parseISO(a.date);
        return (
          date >= activeFilters.dateRange!.start && date <= activeFilters.dateRange!.end
        );
      });
    }

    setFilteredAnalyses(filtered);
  };

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleFiltersApply = (filters: FilterCriteria) => {
    setActiveFilters(filters);
  };

  const handleShare = (analysis: AnalysisData) => {
    setShareItem(analysis);
    setShowShare(true);
  };

  const displayAnalyses = Object.keys(activeFilters).length > 0 ? filteredAnalyses : analyses;

  // Memoized statistics calculation
  const stats = useMemo(() => {
    return {
      total: analyses.length,
      thisWeek: analyses.filter((a) => {
        const date = parseISO(a.date);
        const now = new Date();
        const weekStart = startOfWeek(now, { locale: ptBR });
        const weekEnd = endOfWeek(now, { locale: ptBR });
        return date >= weekStart && date <= weekEnd;
      }).length,
      avgConfidence: analyses.length > 0
        ? (analyses.reduce((sum, a) => sum + a.confidence, 0) / analyses.length).toFixed(1)
        : 0,
      topCategory: analyses.length > 0
        ? Object.entries(
            analyses.reduce((acc: any, a) => {
              acc[a.category] = (acc[a.category] || 0) + 1;
              return acc;
            }, {})
          ).sort(([, a]: any, [, b]: any) => b - a)[0]?.[0] || 'N/A'
        : 'N/A',
    };
  }, [analyses]);

  // Memoized heatmap data
  const heatmapData = useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(now, { locale: ptBR });
    const weekEnd = endOfWeek(now, { locale: ptBR });
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

    return days.map((day) => {
      const count = analyses.filter((a) => isSameDay(parseISO(a.date), day)).length;
      return {
        date: day,
        count,
        intensity: Math.min(count / 5, 1),
      };
    });
  }, [analyses]);

  // Memoized profile insights
  const insights = useMemo(() => {
    switch (userProfile) {
      case 'Botânico Profissional':
        return {
          title: 'Análise Científica',
          metrics: [
            { label: 'Espécies Únicas', value: new Set(analyses.map((a) => a.plantName)).size },
            { label: 'Taxa de Precisão', value: `${stats.avgConfidence}%` },
            { label: 'Amostras Coletadas', value: stats.total },
          ],
        };
      case 'Agrônomo Especializado':
        return {
          title: 'Performance Agrícola',
          metrics: [
            { label: 'Culturas Analisadas', value: analyses.length },
            { label: 'Esta Semana', value: stats.thisWeek },
            { label: 'Precisão Média', value: `${stats.avgConfidence}%` },
          ],
        };
      default:
        return {
          title: 'Seu Progresso',
          metrics: [
            { label: 'Explorações', value: stats.total },
            { label: 'Esta Semana', value: stats.thisWeek },
            { label: 'Categoria Top', value: stats.topCategory },
          ],
        };
    }
  }, [userProfile, analyses, stats]);

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="w-full h-full p-6 bg-[var(--md-surface-base)] overflow-y-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className={`${typography.headlineLarge} mb-2`}>Histórico Inteligente</h1>
        <p className={`${typography.bodyLarge} text-[var(--md-text-secondary)]`}>
          {userProfile} • {stats.total} análises realizadas
        </p>
      </div>

      {/* View Selector */}
      <div className="flex gap-2 mb-6">
        <Button
          onClick={() => setView('timeline')}
          variant={view === 'timeline' ? 'default' : 'outline'}
          className="flex-1"
        >
          <Clock className="w-4 h-4 mr-2" />
          Timeline
        </Button>
        <Button
          onClick={() => setView('heatmap')}
          variant={view === 'heatmap' ? 'default' : 'outline'}
          className="flex-1"
        >
          <Activity className="w-4 h-4 mr-2" />
          Mapa de Calor
        </Button>
        <Button
          onClick={() => setView('stats')}
          variant={view === 'stats' ? 'default' : 'outline'}
          className="flex-1"
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          Estatísticas
        </Button>
      </div>

      {/* Profile Insights Card */}
      <div className="mb-6 p-6 rounded-xl bg-gradient-to-br from-[var(--md-primary-container)] to-[var(--md-secondary-container)] border border-[var(--md-primary-main)]">
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-6 h-6 text-[var(--md-primary-main)]" />
          <h3 className={`${typography.titleLarge}`}>{insights.title}</h3>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {insights.metrics.map((metric, index) => (
            <div key={index} className="text-center">
              <div className={`${typography.headlineSmall} text-[var(--md-primary-main)] mb-1`}>
                {metric.value}
              </div>
              <div className={`${typography.bodySmall} text-[var(--md-text-secondary)]`}>
                {metric.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline View */}
      <AnimatePresence mode="wait">
        {view === 'timeline' && (
          <motion.div
            key="timeline"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {analyses.length === 0 ? (
              <div className="text-center py-12">
                <Leaf className="w-16 h-16 mx-auto mb-4 text-[var(--md-text-disabled)]" />
                <p className={`${typography.bodyLarge} text-[var(--md-text-secondary)]`}>
                  Nenhuma análise ainda
                </p>
              </div>
            ) : (
              displayAnalyses.map((analysis, index) => (
                <AnalysisCard
                  key={analysis.id}
                  analysis={analysis}
                  index={index}
                  isSelected={selectedIds.includes(analysis.id)}
                  selectionMode={selectionMode}
                  onToggle={() => toggleSelection(analysis.id)}
                  onShare={() => handleShare(analysis)}
                />
              ))
            )}
          </motion.div>
        )}

        {/* Heatmap View */}
        {view === 'heatmap' && (
          <motion.div
            key="heatmap"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="p-6 rounded-xl bg-[var(--md-surface-elevated1)]">
              <h3 className={`${typography.titleLarge} mb-6`}>Atividade da Semana</h3>
              <div className="grid grid-cols-7 gap-2">
                {heatmapData.map((day, index) => (
                  <div key={index} className="text-center">
                    <div
                      className={`${typography.labelSmall} text-[var(--md-text-secondary)] mb-2`}
                    >
                      {format(day.date, 'EEE', { locale: ptBR })}
                    </div>
                    <div
                      className="aspect-square rounded-lg flex items-center justify-center transition-all hover:scale-110"
                      style={{
                        backgroundColor: `rgba(138, 180, 248, ${day.intensity})`,
                        border: day.count > 0 ? '2px solid var(--md-primary-main)' : 'none',
                      }}
                    >
                      <span className={`${typography.titleMedium} text-[var(--md-surface-base)]`}>
                        {day.count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex items-center justify-center gap-4 text-sm">
                <span className="text-[var(--md-text-secondary)]">Menos</span>
                <div className="flex gap-1">
                  {[0, 0.25, 0.5, 0.75, 1].map((intensity, i) => (
                    <div
                      key={i}
                      className="w-6 h-6 rounded"
                      style={{ backgroundColor: `rgba(138, 180, 248, ${intensity})` }}
                    />
                  ))}
                </div>
                <span className="text-[var(--md-text-secondary)]">Mais</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Stats View */}
        {view === 'stats' && (
          <motion.div
            key="stats"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Total Analyses Card */}
            <div className="p-6 rounded-xl bg-[var(--md-surface-elevated1)]">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`${typography.titleLarge}`}>Total de Análises</h3>
                <Target className="w-6 h-6 text-[var(--md-primary-main)]" />
              </div>
              <div className={`${typography.displayLarge} text-[var(--md-primary-main)] mb-2`}>
                {stats.total}
              </div>
              <p className={`${typography.bodySmall} text-[var(--md-text-secondary)]`}>
                {stats.thisWeek} esta semana
              </p>
            </div>

            {/* Average Confidence Card */}
            <div className="p-6 rounded-xl bg-[var(--md-surface-elevated1)]">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`${typography.titleLarge}`}>Confiança Média</h3>
                <TrendingUp className="w-6 h-6 text-[var(--md-success)]" />
              </div>
              <div className={`${typography.displayLarge} text-[var(--md-success)] mb-2`}>
                {stats.avgConfidence}%
              </div>
              <div className="w-full h-2 bg-[var(--md-surface-base)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--md-success)] rounded-full transition-all"
                  style={{ width: `${stats.avgConfidence}%` }}
                />
              </div>
            </div>

            {/* Categories Distribution Card */}
            <div className="p-6 rounded-xl bg-[var(--md-surface-elevated1)] md:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`${typography.titleLarge}`}>Distribuição por Categoria</h3>
                <PieChart className="w-6 h-6 text-[var(--md-secondary-main)]" />
              </div>
              <div className="space-y-3">
                {Object.entries(
                  analyses.reduce((acc: any, a) => {
                    acc[a.category] = (acc[a.category] || 0) + 1;
                    return acc;
                  }, {})
                )
                  .sort(([, a]: any, [, b]: any) => b - a)
                  .slice(0, 5)
                  .map(([category, count]: any, index) => (
                    <div key={category} className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`${typography.bodyMedium}`}>{category}</span>
                          <span className={`${typography.bodySmall} text-[var(--md-text-secondary)]`}>
                            {count} ({((count / stats.total) * 100).toFixed(0)}%)
                          </span>
                        </div>
                        <div className="w-full h-2 bg-[var(--md-surface-base)] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${(count / stats.total) * 100}%`,
                              backgroundColor: `hsl(${index * 60}, 70%, 60%)`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions Bar */}
      <div className="sticky bottom-0 left-0 right-0 p-4 bg-[var(--md-surface-elevated2)] border-t border-[var(--md-divider)] mt-6 rounded-t-xl">
        <div className="flex gap-3">
          {selectionMode ? (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectionMode(false);
                  setSelectedIds([]);
                }}
                className="flex-1"
              >
                Cancelar ({selectedIds.length})
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowComparison(true)}
                disabled={selectedIds.length < 2}
                className="flex-1"
              >
                <GitCompare className="w-4 h-4 mr-2" />
                Comparar
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowExport(true)}
                disabled={selectedIds.length === 0}
                className="flex-1"
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => setShowFilters(true)}
                className="flex-1"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtros {Object.keys(activeFilters).length > 0 && `(${Object.keys(activeFilters).length})`}
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectionMode(true)}
                className="flex-1"
              >
                <Layers className="w-4 h-4 mr-2" />
                Selecionar
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedIds(displayAnalyses.map((a) => a.id));
                  setShowExport(true);
                }}
                className="flex-1"
                disabled={displayAnalyses.length === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar Tudo
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Modals with lazy loading */}
      <AnimatePresence>
        {showComparison && (
          <Suspense fallback={<LoadingSkeleton />}>
            <ComparisonView
              selectedIds={selectedIds}
              onClose={() => {
                setShowComparison(false);
                setSelectionMode(false);
                setSelectedIds([]);
              }}
            />
          </Suspense>
        )}

        {showExport && (
          <Suspense fallback={<LoadingSkeleton />}>
            <ExportModal
              selectedIds={selectedIds.length > 0 ? selectedIds : displayAnalyses.map((a) => a.id)}
              onClose={() => {
                setShowExport(false);
                if (selectionMode) {
                  setSelectionMode(false);
                  setSelectedIds([]);
                }
              }}
            />
          </Suspense>
        )}

        {showShare && shareItem && (
          <Suspense fallback={<LoadingSkeleton />}>
            <ShareModal
              analysisId={shareItem.id}
              plantName={shareItem.plantName}
              imageUrl={shareItem.imageUrl}
              onClose={() => {
                setShowShare(false);
                setShareItem(null);
              }}
            />
          </Suspense>
        )}

        {showFilters && (
          <Suspense fallback={<LoadingSkeleton />}>
            <AdvancedFilters
              onApply={handleFiltersApply}
              onClose={() => setShowFilters(false)}
            />
          </Suspense>
        )}
      </AnimatePresence>
    </div>
  );
}

export default memo(HistoryIntelligent);

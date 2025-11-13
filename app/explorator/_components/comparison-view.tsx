
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  BarChart3,
  Calendar,
} from 'lucide-react';
import { materialColors, typography, shape } from '@/lib/material-colors';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ComparisonViewProps {
  selectedIds: string[];
  onClose: () => void;
}

interface Analysis {
  id: string;
  imageUrl: string;
  plantName: string;
  scientificName?: string;
  date: string;
  confidence: number;
  healthStatus?: string;
  characteristics?: string[];
  careInstructions?: string;
}

export default function ComparisonView({ selectedIds, onClose }: ComparisonViewProps) {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    loadAnalyses();
  }, [selectedIds]);

  const loadAnalyses = async () => {
    try {
      const promises = selectedIds.map((id) =>
        fetch(`/api/probe/history/${id}`).then((res) => res.json())
      );
      const results = await Promise.all(promises);
      setAnalyses(results);
    } catch (error) {
      console.error('Erro ao carregar análises:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDifferences = () => {
    if (analyses.length < 2) return [];

    const differences = [];
    const first = analyses[0];

    for (let i = 1; i < analyses.length; i++) {
      const current = analyses[i];
      
      if (first.plantName !== current.plantName) {
        differences.push({
          type: 'species',
          message: `Espécies diferentes detectadas: ${first.plantName} vs ${current.plantName}`,
        });
      }

      const confDiff = Math.abs(first.confidence - current.confidence);
      if (confDiff > 20) {
        differences.push({
          type: 'confidence',
          message: `Grande diferença na confiança: ${confDiff.toFixed(1)}%`,
        });
      }

      if (first.healthStatus && current.healthStatus && first.healthStatus !== current.healthStatus) {
        differences.push({
          type: 'health',
          message: `Status de saúde diferente: ${first.healthStatus} vs ${current.healthStatus}`,
        });
      }
    }

    return differences;
  };

  const differences = getDifferences();

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <Sparkles className="h-12 w-12" style={{ color: materialColors.primary.main }} />
          </motion.div>
          <p style={{ color: materialColors.text.secondary }} className={typography.bodyLarge}>
            Carregando comparação...
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm"
    >
      {/* Header */}
      <div
        className="absolute top-0 left-0 right-0 z-10 px-6 py-4"
        style={{ backgroundColor: materialColors.surface.elevated2 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className={typography.headlineSmall} style={{ color: materialColors.text.primary }}>
              Comparação de Análises
            </h2>
            <p className={typography.bodyMedium} style={{ color: materialColors.text.secondary }}>
              {analyses.length} análises selecionadas
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="pt-24 pb-8 px-6 h-full overflow-y-auto">
        {/* Key Differences */}
        {differences.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 rounded-xl"
            style={{
              backgroundColor: materialColors.surface.elevated1,
              border: `1px solid ${materialColors.primary.main}30`,
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="h-5 w-5" style={{ color: materialColors.warning }} />
              <h3 className={typography.titleLarge} style={{ color: materialColors.text.primary }}>
                Diferenças Identificadas
              </h3>
            </div>
            <div className="space-y-2">
              {differences.map((diff, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-lg"
                  style={{ backgroundColor: materialColors.surface.elevated2 }}
                >
                  <TrendingUp className="h-4 w-4 mt-0.5" style={{ color: materialColors.info }} />
                  <p className={typography.bodyMedium} style={{ color: materialColors.text.secondary }}>
                    {diff.message}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {analyses.map((analysis, index) => (
            <motion.div
              key={analysis.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="rounded-xl overflow-hidden"
              style={{
                backgroundColor: materialColors.surface.elevated1,
                border: `2px solid ${materialColors.primary.main}30`,
              }}
            >
              {/* Image */}
              <div className="relative aspect-square bg-gray-800">
                <Image
                  src={analysis.imageUrl}
                  alt={analysis.plantName}
                  fill
                  className="object-cover"
                />
                <div
                  className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: materialColors.primary.container,
                    color: materialColors.primary.main,
                  }}
                >
                  #{index + 1}
                </div>
              </div>

              {/* Info */}
              <div className="p-6 space-y-4">
                <div>
                  <h3 className={typography.titleLarge} style={{ color: materialColors.text.primary }}>
                    {analysis.plantName}
                  </h3>
                  {analysis.scientificName && (
                    <p className={typography.bodySmall} style={{ color: materialColors.text.secondary }}>
                      {analysis.scientificName}
                    </p>
                  )}
                </div>

                {/* Stats */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={typography.bodySmall} style={{ color: materialColors.text.secondary }}>
                      Confiança
                    </span>
                    <span className={typography.labelLarge} style={{ color: materialColors.primary.main }}>
                      {analysis.confidence}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={typography.bodySmall} style={{ color: materialColors.text.secondary }}>
                      Data
                    </span>
                    <span className={typography.labelMedium} style={{ color: materialColors.text.primary }}>
                      {format(parseISO(analysis.date), 'dd MMM yyyy', { locale: ptBR })}
                    </span>
                  </div>

                  {analysis.healthStatus && (
                    <div className="flex items-center justify-between">
                      <span className={typography.bodySmall} style={{ color: materialColors.text.secondary }}>
                        Saúde
                      </span>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" style={{ color: materialColors.success }} />
                        <span className={typography.labelMedium} style={{ color: materialColors.success }}>
                          {analysis.healthStatus}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Characteristics */}
                {analysis.characteristics && analysis.characteristics.length > 0 && (
                  <div className="pt-3 border-t" style={{ borderColor: materialColors.divider }}>
                    <p className={`${typography.labelSmall} mb-2`} style={{ color: materialColors.text.secondary }}>
                      Características
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {analysis.characteristics.slice(0, 3).map((char, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 rounded-md text-xs"
                          style={{
                            backgroundColor: materialColors.surface.elevated2,
                            color: materialColors.text.primary,
                          }}
                        >
                          {char}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Statistics Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 p-6 rounded-xl"
          style={{
            backgroundColor: materialColors.surface.elevated1,
            border: `1px solid ${materialColors.divider}`,
          }}
        >
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="h-5 w-5" style={{ color: materialColors.primary.main }} />
            <h3 className={typography.titleLarge} style={{ color: materialColors.text.primary }}>
              Resumo Estatístico
            </h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className={typography.bodySmall} style={{ color: materialColors.text.secondary }}>
                Análises
              </p>
              <p className={typography.headlineSmall} style={{ color: materialColors.primary.main }}>
                {analyses.length}
              </p>
            </div>

            <div>
              <p className={typography.bodySmall} style={{ color: materialColors.text.secondary }}>
                Confiança Média
              </p>
              <p className={typography.headlineSmall} style={{ color: materialColors.primary.main }}>
                {(analyses.reduce((sum, a) => sum + a.confidence, 0) / analyses.length).toFixed(1)}%
              </p>
            </div>

            <div>
              <p className={typography.bodySmall} style={{ color: materialColors.text.secondary }}>
                Espécies Únicas
              </p>
              <p className={typography.headlineSmall} style={{ color: materialColors.primary.main }}>
                {new Set(analyses.map((a) => a.plantName)).size}
              </p>
            </div>

            <div>
              <p className={typography.bodySmall} style={{ color: materialColors.text.secondary }}>
                Diferenças
              </p>
              <p className={typography.headlineSmall} style={{ color: materialColors.warning }}>
                {differences.length}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

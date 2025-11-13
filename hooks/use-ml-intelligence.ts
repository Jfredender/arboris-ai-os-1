
/**
 * Hook de Inteligência ML
 * Fornece sugestões, padrões e cache inteligente
 */

import { useState, useEffect } from 'react';
import { mlCache } from '@/lib/ml-cache';

export interface MLSuggestion {
  id: string;
  type: 'mode' | 'camera' | 'effect';
  suggestion: string;
  reason: string;
  confidence: number;
}

export interface MLStats {
  totalAnalyses: number;
  totalPatterns: number;
  modeStats: Record<string, number>;
  avgConfidence: number;
  mostUsedMode: string;
}

export function useMLIntelligence() {
  const [suggestions, setSuggestions] = useState<MLSuggestion[]>([]);
  const [stats, setStats] = useState<MLStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar dados iniciais
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [sug, st] = await Promise.all([
        mlCache.getSuggestions(),
        mlCache.getStats(),
      ]);
      setSuggestions(sug);
      setStats(st);
    } catch (error) {
      console.error('Failed to load ML data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Buscar análise similar (cache hit)
  const findSimilarAnalysis = async (imageDataUrl: string, mode: string) => {
    try {
      return await mlCache.findSimilar(imageDataUrl, mode);
    } catch (error) {
      console.error('Failed to find similar:', error);
      return null;
    }
  };

  // Salvar nova análise
  const saveAnalysis = async (data: {
    imageDataUrl: string;
    mode: string;
    result: any;
    confidence: number;
    cameraMode: string;
    effects: string[];
    sensorData?: any;
  }) => {
    try {
      await mlCache.saveAnalysis(data);
      // Recarregar dados
      await loadData();
    } catch (error) {
      console.error('Failed to save analysis:', error);
    }
  };

  // Refresh manual
  const refresh = async () => {
    await loadData();
  };

  return {
    suggestions,
    stats,
    isLoading,
    findSimilarAnalysis,
    saveAnalysis,
    refresh,
  };
}

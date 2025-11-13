
/**
 * ML Pragmático - Sistema de Cache Inteligente
 * Implementa pattern recognition e análise offline
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb';

// Schema do IndexedDB
interface ArborisDB extends DBSchema {
  analyses: {
    key: string;
    value: {
      id: string;
      imageHash: string;
      mode: string;
      result: any;
      confidence: number;
      timestamp: number;
      metadata: {
        cameraMode: string;
        effects: string[];
        sensorData?: any;
      };
    };
    indexes: {
      'by-mode': string;
      'by-confidence': number;
      'by-timestamp': number;
      'by-hash': string;
    };
  };
  patterns: {
    key: string;
    value: {
      id: string;
      pattern: string;
      frequency: number;
      lastSeen: number;
      relatedModes: string[];
      avgConfidence: number;
    };
    indexes: {
      'by-frequency': number;
      'by-mode': string;
    };
  };
  suggestions: {
    key: string;
    value: {
      id: string;
      type: 'mode' | 'camera' | 'effect';
      suggestion: string;
      reason: string;
      confidence: number;
      timestamp: number;
    };
    indexes: {
      'by-type': string;
      'by-confidence': number;
    };
  };
}

class MLCache {
  private db: IDBPDatabase<ArborisDB> | null = null;
  private initPromise: Promise<void> | null = null;

  async init() {
    if (this.db) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      try {
        this.db = await openDB<ArborisDB>('arboris-ml-cache', 1, {
          upgrade(db) {
            // Store de análises
            const analysesStore = db.createObjectStore('analyses', { keyPath: 'id' });
            analysesStore.createIndex('by-mode', 'mode');
            analysesStore.createIndex('by-confidence', 'confidence');
            analysesStore.createIndex('by-timestamp', 'timestamp');
            analysesStore.createIndex('by-hash', 'imageHash');

            // Store de padrões
            const patternsStore = db.createObjectStore('patterns', { keyPath: 'id' });
            patternsStore.createIndex('by-frequency', 'frequency');
            patternsStore.createIndex('by-mode', 'relatedModes', { multiEntry: true });

            // Store de sugestões
            const suggestionsStore = db.createObjectStore('suggestions', { keyPath: 'id' });
            suggestionsStore.createIndex('by-type', 'type');
            suggestionsStore.createIndex('by-confidence', 'confidence');
          },
        });
      } catch (error) {
        console.error('Failed to initialize MLCache:', error);
      }
    })();

    return this.initPromise;
  }

  // Hash simples de imagem para detecção de duplicatas
  async hashImage(dataUrl: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(dataUrl.substring(0, 1000)); // Amostra dos primeiros 1000 chars
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16);
  }

  // Salvar análise no cache
  async saveAnalysis(data: {
    imageDataUrl: string;
    mode: string;
    result: any;
    confidence: number;
    cameraMode: string;
    effects: string[];
    sensorData?: any;
  }) {
    await this.init();
    if (!this.db) return;

    try {
      const imageHash = await this.hashImage(data.imageDataUrl);
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      await this.db.add('analyses', {
        id,
        imageHash,
        mode: data.mode,
        result: data.result,
        confidence: data.confidence,
        timestamp: Date.now(),
        metadata: {
          cameraMode: data.cameraMode,
          effects: data.effects,
          sensorData: data.sensorData,
        },
      });

      // Atualizar padrões
      await this.updatePatterns(data);
      // Gerar sugestões
      await this.generateSuggestions();
    } catch (error) {
      console.error('Failed to save analysis:', error);
    }
  }

  // Buscar análise similar (cache hit)
  async findSimilar(imageDataUrl: string, mode: string): Promise<any | null> {
    await this.init();
    if (!this.db) return null;

    try {
      const imageHash = await this.hashImage(imageDataUrl);
      const tx = this.db.transaction('analyses', 'readonly');
      const index = tx.store.index('by-hash');
      const matches = await index.getAll(imageHash);

      // Filtrar por modo e retornar mais recente com alta confiança
      const modeMatches = matches.filter(a => a.mode === mode && a.confidence > 0.7);
      if (modeMatches.length === 0) return null;

      modeMatches.sort((a, b) => b.timestamp - a.timestamp);
      return modeMatches[0];
    } catch (error) {
      console.error('Failed to find similar:', error);
      return null;
    }
  }

  // Atualizar padrões detectados
  private async updatePatterns(data: any) {
    if (!this.db) return;

    try {
      const patternKey = `${data.mode}-${data.cameraMode}-${data.effects.join('-')}`;
      const existing = await this.db.get('patterns', patternKey);

      if (existing) {
        existing.frequency++;
        existing.lastSeen = Date.now();
        existing.avgConfidence = (existing.avgConfidence + data.confidence) / 2;
        await this.db.put('patterns', existing);
      } else {
        await this.db.add('patterns', {
          id: patternKey,
          pattern: patternKey,
          frequency: 1,
          lastSeen: Date.now(),
          relatedModes: [data.mode],
          avgConfidence: data.confidence,
        });
      }
    } catch (error) {
      console.error('Failed to update patterns:', error);
    }
  }

  // Gerar sugestões inteligentes
  private async generateSuggestions() {
    if (!this.db) return;

    try {
      // Limpar sugestões antigas (>1 hora)
      const tx = this.db.transaction('suggestions', 'readwrite');
      const allSuggestions = await tx.store.getAll();
      const oneHourAgo = Date.now() - 60 * 60 * 1000;

      for (const suggestion of allSuggestions) {
        if (suggestion.timestamp < oneHourAgo) {
          await tx.store.delete(suggestion.id);
        }
      }

      // Analisar padrões e gerar sugestões
      const patterns = await this.db.getAll('patterns');
      patterns.sort((a, b) => b.frequency - a.frequency);

      const topPatterns = patterns.slice(0, 3);
      for (const pattern of topPatterns) {
        const suggestionId = `suggestion-${pattern.id}-${Date.now()}`;
        
        // Sugestão de modo mais usado
        if (pattern.frequency > 3 && pattern.avgConfidence > 0.8) {
          await this.db.put('suggestions', {
            id: suggestionId,
            type: 'mode',
            suggestion: pattern.relatedModes[0],
            reason: `Modo ${pattern.relatedModes[0]} tem alta taxa de sucesso (${Math.round(pattern.avgConfidence * 100)}%)`,
            confidence: pattern.avgConfidence,
            timestamp: Date.now(),
          });
        }
      }
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
    }
  }

  // Obter sugestões atuais
  async getSuggestions(): Promise<any[]> {
    await this.init();
    if (!this.db) return [];

    try {
      const tx = this.db.transaction('suggestions', 'readonly');
      const index = tx.store.index('by-confidence');
      const suggestions = await index.getAll();
      return suggestions.reverse().slice(0, 5); // Top 5 sugestões
    } catch (error) {
      console.error('Failed to get suggestions:', error);
      return [];
    }
  }

  // Estatísticas de uso
  async getStats() {
    await this.init();
    if (!this.db) return null;

    try {
      const analyses = await this.db.getAll('analyses');
      const patterns = await this.db.getAll('patterns');

      const modeStats = analyses.reduce((acc, a) => {
        acc[a.mode] = (acc[a.mode] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const avgConfidence = analyses.reduce((sum, a) => sum + a.confidence, 0) / analyses.length || 0;

      return {
        totalAnalyses: analyses.length,
        totalPatterns: patterns.length,
        modeStats,
        avgConfidence,
        mostUsedMode: Object.entries(modeStats).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Botânica',
      };
    } catch (error) {
      console.error('Failed to get stats:', error);
      return null;
    }
  }

  // Limpar cache antigo (>30 dias)
  async cleanup() {
    await this.init();
    if (!this.db) return;

    try {
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
      const tx = this.db.transaction('analyses', 'readwrite');
      const index = tx.store.index('by-timestamp');
      const oldAnalyses = await index.getAll(IDBKeyRange.upperBound(thirtyDaysAgo));

      for (const analysis of oldAnalyses) {
        await tx.store.delete(analysis.id);
      }
    } catch (error) {
      console.error('Failed to cleanup:', error);
    }
  }
}

export const mlCache = new MLCache();

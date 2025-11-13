
/**
 * ML Local Processing System
 * Enables on-device analysis with offline capabilities
 */

export interface MLModel {
  id: string;
  name: string;
  version: string;
  size: number; // in MB
  cached: boolean;
  lastUsed?: Date;
}

export interface AnalysisResult {
  predictions: Array<{
    label: string;
    confidence: number;
  }>;
  processingTime: number;
  source: 'local' | 'cloud';
  cached: boolean;
}

class MLLocalProcessor {
  private models: Map<string, MLModel> = new Map();
  private cache: Map<string, AnalysisResult> = new Map();
  private dbName = 'ArborisMLCache';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;
  private maxCacheSize = 100 * 1024 * 1024; // 100MB

  constructor() {
    if (typeof window !== 'undefined') {
      this.initDB();
      this.loadAvailableModels();
    }
  }

  // Initialize IndexedDB for model storage
  private async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains('models')) {
          db.createObjectStore('models', { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains('cache')) {
          const cacheStore = db.createObjectStore('cache', { keyPath: 'key' });
          cacheStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  // Load available models list
  private loadAvailableModels(): void {
    this.models.set('plant-classifier-v1', {
      id: 'plant-classifier-v1',
      name: 'Plant Classifier',
      version: '1.0.0',
      size: 5.2,
      cached: false,
    });

    this.models.set('disease-detector-v1', {
      id: 'disease-detector-v1',
      name: 'Disease Detector',
      version: '1.0.0',
      size: 3.8,
      cached: false,
    });

    this.models.set('species-identifier-v1', {
      id: 'species-identifier-v1',
      name: 'Species Identifier',
      version: '1.0.0',
      size: 7.5,
      cached: false,
    });
  }

  // Check if analysis is cached
  async getCachedAnalysis(imageHash: string): Promise<AnalysisResult | null> {
    if (!this.db) {
      await this.initDB();
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        resolve(null);
        return;
      }

      const transaction = this.db.transaction(['cache'], 'readonly');
      const store = transaction.objectStore('cache');
      const request = store.get(imageHash);

      request.onsuccess = () => {
        const result = request.result;
        if (result && Date.now() - result.timestamp < 7 * 24 * 60 * 60 * 1000) {
          // Cache valid for 7 days
          resolve(result.analysis);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  // Save analysis to cache
  async cacheAnalysis(imageHash: string, analysis: AnalysisResult): Promise<void> {
    if (!this.db) {
      await this.initDB();
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        resolve();
        return;
      }

      const transaction = this.db.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      
      store.put({
        key: imageHash,
        analysis,
        timestamp: Date.now(),
      });

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  // Download and cache model
  async downloadModel(modelId: string, onProgress?: (progress: number) => void): Promise<boolean> {
    const model = this.models.get(modelId);
    if (!model) {
      throw new Error(`Model ${modelId} not found`);
    }

    // Simulate model download with progress
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        onProgress?.(progress);
        
        if (progress >= 100) {
          clearInterval(interval);
          model.cached = true;
          model.lastUsed = new Date();
          resolve(true);
        }
      }, 200);
    });
  }

  // Check model availability
  isModelCached(modelId: string): boolean {
    const model = this.models.get(modelId);
    return model?.cached || false;
  }

  // Get all models
  getAvailableModels(): MLModel[] {
    return Array.from(this.models.values());
  }

  // Process image locally (simulated)
  async processImageLocal(
    imageData: string,
    modelId: string = 'plant-classifier-v1'
  ): Promise<AnalysisResult> {
    const model = this.models.get(modelId);
    if (!model) {
      throw new Error(`Model ${modelId} not found`);
    }

    if (!model.cached) {
      throw new Error(`Model ${modelId} not cached. Download it first.`);
    }

    // Simulate local processing
    const startTime = performance.now();
    
    // Generate hash for caching
    const imageHash = await this.hashImage(imageData);
    
    // Check cache first
    const cachedResult = await this.getCachedAnalysis(imageHash);
    if (cachedResult) {
      return { ...cachedResult, cached: true };
    }

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const result: AnalysisResult = {
      predictions: [
        { label: 'Monstera deliciosa', confidence: 0.92 },
        { label: 'Philodendron bipinnatifidum', confidence: 0.76 },
        { label: 'Epipremnum aureum', confidence: 0.65 },
      ],
      processingTime: performance.now() - startTime,
      source: 'local',
      cached: false,
    };

    // Cache result
    await this.cacheAnalysis(imageHash, result);

    return result;
  }

  // Generate image hash for caching
  private async hashImage(imageData: string): Promise<string> {
    const msgBuffer = new TextEncoder().encode(imageData.substring(0, 1000)); // Sample hash
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  // Clear old cache entries
  async clearCache(olderThanDays: number = 7): Promise<number> {
    if (!this.db) {
      await this.initDB();
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        resolve(0);
        return;
      }

      const transaction = this.db.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      const index = store.index('timestamp');
      const cutoffTime = Date.now() - olderThanDays * 24 * 60 * 60 * 1000;

      let deletedCount = 0;
      const request = index.openCursor();

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          if (cursor.value.timestamp < cutoffTime) {
            cursor.delete();
            deletedCount++;
          }
          cursor.continue();
        }
      };

      transaction.oncomplete = () => resolve(deletedCount);
      transaction.onerror = () => reject(transaction.error);
    });
  }

  // Get cache statistics
  async getCacheStats(): Promise<{ count: number; size: number }> {
    if (!this.db) {
      await this.initDB();
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        resolve({ count: 0, size: 0 });
        return;
      }

      const transaction = this.db.transaction(['cache'], 'readonly');
      const store = transaction.objectStore('cache');
      const countRequest = store.count();

      countRequest.onsuccess = () => {
        resolve({
          count: countRequest.result,
          size: 0, // Simplified - would need to calculate actual size
        });
      };

      countRequest.onerror = () => reject(countRequest.error);
    });
  }
}

// Export singleton instance
export const mlLocalProcessor = new MLLocalProcessor();

// Export helper functions
export const isMLLocalSupported = (): boolean => {
  return typeof window !== 'undefined' && 'indexedDB' in window && 'crypto' in window;
};

export const isOffline = (): boolean => {
  return typeof navigator !== 'undefined' && !navigator.onLine;
};

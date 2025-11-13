
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  HardDrive,
  Trash2,
  CheckCircle2,
  Loader2,
  Wifi,
  WifiOff,
  Cpu,
  Database,
  X,
} from 'lucide-react';
import { mlLocalProcessor, isOffline, MLModel } from '@/lib/ml-local';
import { typography } from '@/lib/material-colors';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

interface MLSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MLSettings({ isOpen, onClose }: MLSettingsProps) {
  const [models, setModels] = useState<MLModel[]>([]);
  const [downloadingModel, setDownloadingModel] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [cacheStats, setCacheStats] = useState({ count: 0, size: 0 });
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    loadMLData();
    setOffline(isOffline());

    const handleOnline = () => setOffline(false);
    const handleOffline = () => setOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadMLData = async () => {
    const availableModels = mlLocalProcessor.getAvailableModels();
    setModels(availableModels);

    const stats = await mlLocalProcessor.getCacheStats();
    setCacheStats(stats);
  };

  const handleDownloadModel = async (modelId: string) => {
    setDownloadingModel(modelId);
    setDownloadProgress(0);

    try {
      await mlLocalProcessor.downloadModel(modelId, (progress) => {
        setDownloadProgress(progress);
      });

      toast({
        title: 'Modelo Baixado',
        description: 'O modelo está pronto para uso offline!',
      });

      loadMLData();
    } catch (error) {
      toast({
        title: 'Erro no Download',
        description: 'Não foi possível baixar o modelo.',
        variant: 'destructive',
      });
    } finally {
      setDownloadingModel(null);
      setDownloadProgress(0);
    }
  };

  const handleClearCache = async () => {
    try {
      const deleted = await mlLocalProcessor.clearCache();
      toast({
        title: 'Cache Limpo',
        description: `${deleted} entradas removidas com sucesso.`,
      });
      loadMLData();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível limpar o cache.',
        variant: 'destructive',
      });
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30"
        onClick={onClose}
      />
      
      {/* Panel */}
      <motion.div
        initial={{ x: 300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 300, opacity: 0 }}
        className="absolute top-0 right-0 w-96 h-full bg-[var(--md-surface-elevated2)] border-l border-[var(--md-divider)] p-6 overflow-y-auto z-40"
      >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Cpu className="w-6 h-6 text-[var(--md-primary-main)]" />
          <h3 className={`${typography.titleLarge}`}>ML Local</h3>
        </div>
        <Button 
          onClick={onClose} 
          variant="ghost" 
          size="icon"
          className="hover:bg-[var(--md-error)] hover:text-white transition-colors"
          title="Fechar Painel"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Status Indicator */}
      <div
        className={`p-4 rounded-lg mb-6 ${
          offline
            ? 'bg-[var(--md-warning)] text-[var(--md-surface-base)]'
            : 'bg-[var(--md-success)] text-[var(--md-surface-base)]'
        }`}
      >
        <div className="flex items-center gap-2">
          {offline ? (
            <>
              <WifiOff className="w-5 h-5" />
              <span className={`${typography.titleMedium}`}>Modo Offline</span>
            </>
          ) : (
            <>
              <Wifi className="w-5 h-5" />
              <span className={`${typography.titleMedium}`}>Online</span>
            </>
          )}
        </div>
        <p className={`${typography.bodySmall} mt-1`}>
          {offline
            ? 'Usando processamento local e cache'
            : 'Conectado aos servidores cloud'}
        </p>
      </div>

      {/* Cache Statistics */}
      <div className="p-4 rounded-lg bg-[var(--md-surface-elevated1)] mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Database className="w-5 h-5 text-[var(--md-secondary-main)]" />
          <h4 className={`${typography.titleMedium}`}>Cache Local</h4>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-[var(--md-text-secondary)]">Análises em cache:</span>
            <span className="font-mono">{cacheStats.count}</span>
          </div>
          <Button
            onClick={handleClearCache}
            variant="outline"
            size="sm"
            className="w-full mt-2"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Limpar Cache
          </Button>
        </div>
      </div>

      {/* Available Models */}
      <div>
        <h4 className={`${typography.titleMedium} mb-4`}>Modelos Disponíveis</h4>
        <div className="space-y-3">
          {models.map((model) => (
            <div
              key={model.id}
              className="p-4 rounded-lg bg-[var(--md-surface-elevated1)]"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h5 className={`${typography.titleSmall} mb-1`}>{model.name}</h5>
                  <p className={`${typography.bodySmall} text-[var(--md-text-secondary)]`}>
                    v{model.version} • {model.size} MB
                  </p>
                </div>
                {model.cached && (
                  <CheckCircle2 className="w-5 h-5 text-[var(--md-success)] flex-shrink-0" />
                )}
              </div>

              {downloadingModel === model.id ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className={`${typography.bodySmall}`}>
                      Baixando... {downloadProgress}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[var(--md-surface-base)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[var(--md-primary-main)] rounded-full transition-all"
                      style={{ width: `${downloadProgress}%` }}
                    />
                  </div>
                </div>
              ) : model.cached ? (
                <div className="flex items-center gap-2 text-sm text-[var(--md-success)]">
                  <HardDrive className="w-4 h-4" />
                  <span>Disponível offline</span>
                </div>
              ) : (
                <Button
                  onClick={() => handleDownloadModel(model.id)}
                  size="sm"
                  variant="outline"
                  className="w-full"
                  disabled={downloadingModel !== null}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Baixar para Offline
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 p-4 rounded-lg bg-[var(--md-primary-container)] border border-[var(--md-primary-main)]">
        <p className={`${typography.bodySmall} text-[var(--md-text-secondary)]`}>
          💡 <strong>Dica:</strong> Baixe os modelos enquanto estiver online para usar o
          EXPLORATOR sem conexão com internet.
        </p>
      </div>
    </motion.div>
    </>
  );
}

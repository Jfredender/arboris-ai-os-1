
'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Upload,
  Trash2,
  Play,
  CheckCircle2,
  XCircle,
  Loader2,
  Image as ImageIcon,
  AlertCircle,
} from 'lucide-react';
import { materialColors, typography, shape } from '@/lib/material-colors';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { toast } from '@/components/ui/use-toast';

interface BatchProcessorProps {
  onClose: () => void;
}

interface BatchFile {
  id: string;
  file: File;
  preview: string;
  status: 'pending' | 'processing' | 'success' | 'error';
  progress: number;
  result?: any;
  error?: string;
}

export default function BatchProcessor({ onClose }: BatchProcessorProps) {
  const [files, setFiles] = useState<BatchFile[]>([]);
  const [processing, setProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    
    if (files.length + selectedFiles.length > 20) {
      toast({
        title: 'Limite excedido',
        description: 'Máximo de 20 imagens por lote',
        variant: 'destructive',
      });
      return;
    }

    const newFiles: BatchFile[] = selectedFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
      status: 'pending',
      progress: 0,
    }));

    setFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file) URL.revokeObjectURL(file.preview);
      return prev.filter((f) => f.id !== id);
    });
  };

  const processAll = async () => {
    setProcessing(true);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.status !== 'pending') continue;

      // Update status to processing
      setFiles((prev) =>
        prev.map((f) =>
          f.id === file.id ? { ...f, status: 'processing', progress: 0 } : f
        )
      );

      try {
        const formData = new FormData();
        formData.append('image', file.file);

        // Simulate progress
        const progressInterval = setInterval(() => {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === file.id && f.progress < 90
                ? { ...f, progress: f.progress + 10 }
                : f
            )
          );
        }, 200);

        const response = await fetch('/api/analyze-plant', {
          method: 'POST',
          body: formData,
        });

        clearInterval(progressInterval);

        if (response.ok) {
          const result = await response.json();
          setFiles((prev) =>
            prev.map((f) =>
              f.id === file.id
                ? { ...f, status: 'success', progress: 100, result }
                : f
            )
          );
        } else {
          throw new Error('Analysis failed');
        }
      } catch (error) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id
              ? {
                  ...f,
                  status: 'error',
                  progress: 0,
                  error: 'Falha na análise',
                }
              : f
          )
        );
      }

      // Small delay between requests
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    setProcessing(false);
    
    toast({
      title: 'Processamento concluído',
      description: `${files.filter((f) => f.status === 'success').length}/${files.length} análises bem-sucedidas`,
    });
  };

  const stats = {
    total: files.length,
    pending: files.filter((f) => f.status === 'pending').length,
    processing: files.filter((f) => f.status === 'processing').length,
    success: files.filter((f) => f.status === 'success').length,
    error: files.filter((f) => f.status === 'error').length,
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm"
    >
      <div className="h-full flex flex-col">
        {/* Header */}
        <div
          className="px-6 py-4 border-b"
          style={{
            backgroundColor: materialColors.surface.elevated2,
            borderColor: materialColors.divider,
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className={typography.headlineSmall} style={{ color: materialColors.text.primary }}>
                Análise em Lote
              </h2>
              <p className={typography.bodyMedium} style={{ color: materialColors.text.secondary }}>
                Processe até 20 imagens simultaneamente
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-5 gap-4 mt-4">
            <div className="text-center p-3 rounded-lg" style={{ backgroundColor: materialColors.surface.elevated1 }}>
              <p className={typography.labelSmall} style={{ color: materialColors.text.secondary }}>
                Total
              </p>
              <p className={typography.titleLarge} style={{ color: materialColors.text.primary }}>
                {stats.total}
              </p>
            </div>
            <div className="text-center p-3 rounded-lg" style={{ backgroundColor: materialColors.surface.elevated1 }}>
              <p className={typography.labelSmall} style={{ color: materialColors.text.secondary }}>
                Pendente
              </p>
              <p className={typography.titleLarge} style={{ color: materialColors.text.secondary }}>
                {stats.pending}
              </p>
            </div>
            <div className="text-center p-3 rounded-lg" style={{ backgroundColor: materialColors.surface.elevated1 }}>
              <p className={typography.labelSmall} style={{ color: materialColors.text.secondary }}>
                Processando
              </p>
              <p className={typography.titleLarge} style={{ color: materialColors.info }}>
                {stats.processing}
              </p>
            </div>
            <div className="text-center p-3 rounded-lg" style={{ backgroundColor: materialColors.surface.elevated1 }}>
              <p className={typography.labelSmall} style={{ color: materialColors.text.secondary }}>
                Sucesso
              </p>
              <p className={typography.titleLarge} style={{ color: materialColors.success }}>
                {stats.success}
              </p>
            </div>
            <div className="text-center p-3 rounded-lg" style={{ backgroundColor: materialColors.surface.elevated1 }}>
              <p className={typography.labelSmall} style={{ color: materialColors.text.secondary }}>
                Falhas
              </p>
              <p className={typography.titleLarge} style={{ color: materialColors.error }}>
                {stats.error}
              </p>
            </div>
          </div>
        </div>

        {/* File List */}
        <div className="flex-1 overflow-y-auto p-6">
          {files.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center">
              <ImageIcon className="h-16 w-16 mb-4" style={{ color: materialColors.text.disabled }} />
              <p className={typography.titleMedium} style={{ color: materialColors.text.secondary }}>
                Nenhuma imagem adicionada
              </p>
              <p className={typography.bodySmall} style={{ color: materialColors.text.disabled }}>
                Clique no botão abaixo para adicionar imagens
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {files.map((file) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative rounded-xl overflow-hidden"
                  style={{
                    backgroundColor: materialColors.surface.elevated1,
                    border: `1px solid ${materialColors.divider}`,
                  }}
                >
                  {/* Image */}
                  <div className="relative aspect-square bg-gray-900">
                    <Image
                      src={file.preview}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />

                    {/* Status Overlay */}
                    {file.status !== 'pending' && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                        {file.status === 'processing' && (
                          <div className="text-center">
                            <Loader2
                              className="h-8 w-8 animate-spin mx-auto mb-2"
                              style={{ color: materialColors.primary.main }}
                            />
                            <p className={typography.labelMedium} style={{ color: materialColors.text.primary }}>
                              {file.progress}%
                            </p>
                          </div>
                        )}
                        {file.status === 'success' && (
                          <CheckCircle2 className="h-12 w-12" style={{ color: materialColors.success }} />
                        )}
                        {file.status === 'error' && (
                          <div className="text-center px-4">
                            <XCircle className="h-12 w-12 mx-auto mb-2" style={{ color: materialColors.error }} />
                            <p className={`${typography.bodySmall} text-center`} style={{ color: materialColors.error }}>
                              {file.error}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Remove Button */}
                    {file.status === 'pending' && (
                      <button
                        onClick={() => removeFile(file.id)}
                        className="absolute top-2 right-2 p-1.5 rounded-full transition-colors"
                        style={{
                          backgroundColor: materialColors.surface.elevated2,
                        }}
                      >
                        <Trash2 className="h-4 w-4" style={{ color: materialColors.error }} />
                      </button>
                    )}
                  </div>

                  {/* File Name */}
                  <div className="p-2">
                    <p
                      className={`${typography.bodySmall} truncate`}
                      style={{ color: materialColors.text.primary }}
                    >
                      {file.file.name}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div
          className="px-6 py-4 border-t"
          style={{
            backgroundColor: materialColors.surface.elevated2,
            borderColor: materialColors.divider,
          }}
        >
          <div className="flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFilesSelect}
              className="hidden"
            />
            
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => fileInputRef.current?.click()}
              disabled={processing || files.length >= 20}
            >
              <Upload className="h-4 w-4" />
              Adicionar Imagens
            </Button>

            {files.length > 0 && (
              <Button
                variant="outline"
                onClick={() => {
                  files.forEach((f) => URL.revokeObjectURL(f.preview));
                  setFiles([]);
                }}
                disabled={processing}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}

            <div className="flex-1" />

            <Button
              className="gap-2"
              onClick={processAll}
              disabled={files.length === 0 || processing || stats.pending === 0}
              style={{
                backgroundColor: processing
                  ? materialColors.surface.elevated3
                  : materialColors.primary.main,
              }}
            >
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Processar Tudo
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}


'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  FileText,
  Download,
  Table,
  Image as ImageIcon,
  CheckCircle2,
  Loader2,
  FileSpreadsheet,
} from 'lucide-react';
import { materialColors, typography, shape } from '@/lib/material-colors';
import { Button } from '@/components/ui/button';

interface ExportModalProps {
  selectedIds: string[];
  onClose: () => void;
}

type ExportFormat = 'pdf' | 'csv' | 'json' | 'images';

export default function ExportModal({ selectedIds, onClose }: ExportModalProps) {
  const [format, setFormat] = useState<ExportFormat>('pdf');
  const [includeImages, setIncludeImages] = useState(true);
  const [includeStats, setIncludeStats] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const exportOptions = [
    {
      format: 'pdf' as ExportFormat,
      icon: FileText,
      label: 'PDF Report',
      description: 'Relatório completo com gráficos e imagens',
      color: materialColors.error,
    },
    {
      format: 'csv' as ExportFormat,
      icon: FileSpreadsheet,
      label: 'CSV Spreadsheet',
      description: 'Dados tabulares para Excel/Google Sheets',
      color: materialColors.success,
    },
    {
      format: 'json' as ExportFormat,
      icon: Table,
      label: 'JSON Data',
      description: 'Dados estruturados para desenvolvedores',
      color: materialColors.info,
    },
    {
      format: 'images' as ExportFormat,
      icon: ImageIcon,
      label: 'Image Archive',
      description: 'ZIP com todas as imagens analisadas',
      color: materialColors.warning,
    },
  ];

  const handleExport = async () => {
    setExporting(true);
    setProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Make export request
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: selectedIds,
          format,
          includeImages,
          includeStats,
        }),
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `arboris-export-${Date.now()}.${format === 'images' ? 'zip' : format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        setTimeout(() => {
          onClose();
        }, 1000);
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      console.error('Erro ao exportar:', error);
      setProgress(0);
      setExporting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-2xl rounded-2xl p-8"
        style={{ backgroundColor: materialColors.surface.elevated2 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className={typography.headlineMedium} style={{ color: materialColors.text.primary }}>
              Exportar Análises
            </h2>
            <p className={typography.bodyMedium} style={{ color: materialColors.text.secondary }}>
              {selectedIds.length} análises selecionadas
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Format Selection */}
        <div className="space-y-3 mb-6">
          <p className={typography.labelLarge} style={{ color: materialColors.text.secondary }}>
            Selecione o formato
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {exportOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = format === option.format;

              return (
                <motion.button
                  key={option.format}
                  onClick={() => setFormat(option.format)}
                  className="p-4 rounded-xl text-left transition-all"
                  style={{
                    backgroundColor: isSelected
                      ? `${option.color}20`
                      : materialColors.surface.elevated1,
                    border: `2px solid ${isSelected ? option.color : materialColors.divider}`,
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-start gap-3">
                    <Icon className="h-5 w-5 mt-0.5" style={{ color: option.color }} />
                    <div>
                      <p className={typography.titleMedium} style={{ color: materialColors.text.primary }}>
                        {option.label}
                      </p>
                      <p className={typography.bodySmall} style={{ color: materialColors.text.secondary }}>
                        {option.description}
                      </p>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Options */}
        {(format === 'pdf' || format === 'csv') && (
          <div className="space-y-3 mb-6">
            <p className={typography.labelLarge} style={{ color: materialColors.text.secondary }}>
              Opções
            </p>

            <label
              className="flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-colors"
              style={{ backgroundColor: materialColors.surface.elevated1 }}
            >
              <input
                type="checkbox"
                checked={includeImages}
                onChange={(e) => setIncludeImages(e.target.checked)}
                className="w-5 h-5 rounded accent-blue-500"
              />
              <div>
                <p className={typography.bodyMedium} style={{ color: materialColors.text.primary }}>
                  Incluir imagens
                </p>
                <p className={typography.bodySmall} style={{ color: materialColors.text.secondary }}>
                  Adicionar imagens das análises no relatório
                </p>
              </div>
            </label>

            <label
              className="flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-colors"
              style={{ backgroundColor: materialColors.surface.elevated1 }}
            >
              <input
                type="checkbox"
                checked={includeStats}
                onChange={(e) => setIncludeStats(e.target.checked)}
                className="w-5 h-5 rounded accent-blue-500"
              />
              <div>
                <p className={typography.bodyMedium} style={{ color: materialColors.text.primary }}>
                  Incluir estatísticas
                </p>
                <p className={typography.bodySmall} style={{ color: materialColors.text.secondary }}>
                  Adicionar gráficos e análises estatísticas
                </p>
              </div>
            </label>
          </div>
        )}

        {/* Progress Bar */}
        {exporting && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-6"
          >
            <div className="flex items-center justify-between mb-2">
              <p className={typography.bodySmall} style={{ color: materialColors.text.secondary }}>
                Exportando...
              </p>
              <p className={typography.labelMedium} style={{ color: materialColors.primary.main }}>
                {progress}%
              </p>
            </div>
            <div
              className="h-2 rounded-full overflow-hidden"
              style={{ backgroundColor: materialColors.surface.elevated1 }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: materialColors.primary.main }}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </motion.div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onClose}
            disabled={exporting}
          >
            Cancelar
          </Button>
          <Button
            className="flex-1 gap-2"
            onClick={handleExport}
            disabled={exporting || selectedIds.length === 0}
            style={{
              backgroundColor: exporting
                ? materialColors.surface.elevated3
                : materialColors.primary.main,
            }}
          >
            {exporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Exportando
              </>
            ) : progress === 100 ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Concluído
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Exportar
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

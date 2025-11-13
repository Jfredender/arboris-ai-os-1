
'use client';

import { useState, useEffect, use } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  User,
  TrendingUp,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { materialColors, typography } from '@/lib/material-colors';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from 'next/link';

interface ShareViewProps {
  params: Promise<{ id: string }>;
}

export default function ShareView({ params }: ShareViewProps) {
  const { id } = use(params);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalysis();
  }, [id]);

  const loadAnalysis = async () => {
    try {
      const response = await fetch(`/api/share/${id}`);
      if (response.ok) {
        const json = await response.json();
        setData(json);
      } else {
        setError('Análise não encontrada');
      }
    } catch (error) {
      setError('Erro ao carregar análise');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: materialColors.surface.base }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Loader2 className="h-12 w-12" style={{ color: materialColors.primary.main }} />
        </motion.div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center p-6"
        style={{ backgroundColor: materialColors.surface.base }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className={typography.headlineLarge} style={{ color: materialColors.text.primary }}>
            😕
          </h1>
          <h2
            className={`${typography.headlineMedium} mb-4`}
            style={{ color: materialColors.text.primary }}
          >
            {error || 'Análise não encontrada'}
          </h2>
          <Link href="/">
            <Button className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar ao Início
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: materialColors.surface.base }}
    >
      {/* Header */}
      <div
        className="border-b"
        style={{
          backgroundColor: materialColors.surface.elevated1,
          borderColor: materialColors.divider,
        }}
      >
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="h-6 w-6" style={{ color: materialColors.primary.main }} />
            <span className={typography.titleLarge} style={{ color: materialColors.text.primary }}>
              ARBORIS AI
            </span>
          </div>
          <Link href="/">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Início
            </Button>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid md:grid-cols-2 gap-8"
        >
          {/* Image */}
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-900">
            <Image
              src={data.imageUrl}
              alt={data.plantName}
              fill
              className="object-cover"
            />
          </div>

          {/* Info */}
          <div>
            <div className="mb-6">
              <h1
                className={`${typography.displaySmall} mb-2`}
                style={{ color: materialColors.text.primary }}
              >
                {data.plantName}
              </h1>
              {data.scientificName && (
                <p
                  className={typography.titleMedium}
                  style={{ color: materialColors.text.secondary }}
                >
                  <em>{data.scientificName}</em>
                </p>
              )}
            </div>

            <div
              className="p-6 rounded-xl mb-6"
              style={{
                backgroundColor: materialColors.surface.elevated1,
                border: `1px solid ${materialColors.divider}`,
              }}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" style={{ color: materialColors.primary.main }} />
                    <span className={typography.bodyMedium} style={{ color: materialColors.text.secondary }}>
                      Confiança
                    </span>
                  </div>
                  <span
                    className={typography.titleLarge}
                    style={{ color: materialColors.primary.main }}
                  >
                    {data.confidence}%
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" style={{ color: materialColors.text.secondary }} />
                    <span className={typography.bodyMedium} style={{ color: materialColors.text.secondary }}>
                      Analisado em
                    </span>
                  </div>
                  <span className={typography.bodyMedium} style={{ color: materialColors.text.primary }}>
                    {format(new Date(data.date), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5" style={{ color: materialColors.text.secondary }} />
                    <span className={typography.bodyMedium} style={{ color: materialColors.text.secondary }}>
                      Por
                    </span>
                  </div>
                  <span className={typography.bodyMedium} style={{ color: materialColors.text.primary }}>
                    {data.userName}
                  </span>
                </div>
              </div>
            </div>

            <div
              className="p-6 rounded-xl text-center"
              style={{
                backgroundColor: `${materialColors.primary.main}10`,
                border: `1px solid ${materialColors.primary.main}30`,
              }}
            >
              <p className={typography.bodyMedium} style={{ color: materialColors.text.secondary }}>
                Análise gerada por
              </p>
              <p className={typography.titleLarge} style={{ color: materialColors.primary.main }}>
                ARBORIS AI OS 1
              </p>
              <p className={typography.bodySmall} style={{ color: materialColors.text.disabled }}>
                Sistema Inteligente de Identificação Botânica
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

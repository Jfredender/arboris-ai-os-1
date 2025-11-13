
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Share2,
  Link as LinkIcon,
  Facebook,
  Twitter,
  Mail,
  MessageCircle,
  Copy,
  CheckCircle2,
  QrCode,
} from 'lucide-react';
import { materialColors, typography, shape } from '@/lib/material-colors';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

interface ShareModalProps {
  analysisId: string;
  plantName: string;
  imageUrl: string;
  onClose: () => void;
}

export default function ShareModal({ analysisId, plantName, imageUrl, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [shareUrl] = useState(() => {
    // Generate shareable URL
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `${baseUrl}/share/${analysisId}`;
  });

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: 'Link copiado!',
        description: 'O link foi copiado para a área de transferência',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: 'Erro ao copiar',
        description: 'Não foi possível copiar o link',
        variant: 'destructive',
      });
    }
  };

  const shareOptions = [
    {
      name: 'Facebook',
      icon: Facebook,
      color: '#1877F2',
      action: () => {
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
          '_blank'
        );
      },
    },
    {
      name: 'Twitter',
      icon: Twitter,
      color: '#1DA1F2',
      action: () => {
        window.open(
          `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`Confira esta análise de ${plantName}!`)}`,
          '_blank'
        );
      },
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: '#25D366',
      action: () => {
        window.open(
          `https://wa.me/?text=${encodeURIComponent(`Confira esta análise de ${plantName}: ${shareUrl}`)}`,
          '_blank'
        );
      },
    },
    {
      name: 'Email',
      icon: Mail,
      color: materialColors.info,
      action: () => {
        window.location.href = `mailto:?subject=${encodeURIComponent(`Análise: ${plantName}`)}&body=${encodeURIComponent(`Confira esta análise no ARBORIS AI:\n\n${shareUrl}`)}`;
      },
    },
  ];

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
        className="w-full max-w-md rounded-2xl p-8"
        style={{ backgroundColor: materialColors.surface.elevated2 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Share2 className="h-6 w-6" style={{ color: materialColors.primary.main }} />
            <h2 className={typography.headlineMedium} style={{ color: materialColors.text.primary }}>
              Compartilhar
            </h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Plant Info */}
        <div
          className="mb-6 p-4 rounded-xl flex items-center gap-3"
          style={{ backgroundColor: materialColors.surface.elevated1 }}
        >
          <div
            className="w-16 h-16 rounded-lg bg-cover bg-center"
            style={{ backgroundImage: `url(${imageUrl})` }}
          />
          <div>
            <p className={typography.titleMedium} style={{ color: materialColors.text.primary }}>
              {plantName}
            </p>
            <p className={typography.bodySmall} style={{ color: materialColors.text.secondary }}>
              Análise ARBORIS AI
            </p>
          </div>
        </div>

        {/* Link */}
        <div className="mb-6">
          <label className={`${typography.labelMedium} mb-2 block`} style={{ color: materialColors.text.secondary }}>
            Link de Compartilhamento
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 px-4 py-3 rounded-lg text-sm outline-none"
              style={{
                backgroundColor: materialColors.surface.elevated1,
                color: materialColors.text.primary,
                border: `1px solid ${materialColors.divider}`,
              }}
            />
            <Button
              size="icon"
              onClick={copyToClipboard}
              style={{
                backgroundColor: copied ? materialColors.success : materialColors.primary.main,
              }}
            >
              {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Social Share */}
        <div className="mb-6">
          <label className={`${typography.labelMedium} mb-3 block`} style={{ color: materialColors.text.secondary }}>
            Compartilhar em Redes Sociais
          </label>
          <div className="grid grid-cols-4 gap-3">
            {shareOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.name}
                  onClick={option.action}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl transition-all hover:scale-105"
                  style={{
                    backgroundColor: materialColors.surface.elevated1,
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${option.color}20` }}
                  >
                    <Icon className="h-5 w-5" style={{ color: option.color }} />
                  </div>
                  <span
                    className={typography.bodySmall}
                    style={{ color: materialColors.text.secondary }}
                  >
                    {option.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* QR Code */}
        <div
          className="p-6 rounded-xl text-center"
          style={{
            backgroundColor: materialColors.surface.elevated1,
            border: `1px dashed ${materialColors.divider}`,
          }}
        >
          <QrCode className="h-12 w-12 mx-auto mb-3" style={{ color: materialColors.text.disabled }} />
          <p className={typography.bodySmall} style={{ color: materialColors.text.secondary }}>
            QR Code em desenvolvimento
          </p>
        </div>

        {/* Privacy Note */}
        <p
          className={`${typography.bodySmall} mt-6 text-center`}
          style={{ color: materialColors.text.disabled }}
        >
          🔒 Link público • Pode ser acessado por qualquer pessoa
        </p>
      </motion.div>
    </motion.div>
  );
}

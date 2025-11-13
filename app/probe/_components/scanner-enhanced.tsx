
'use client';

import { useState, useRef } from 'react';
import { Camera, Upload, Loader2, CheckCircle2, XCircle, Share2, Filter, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { materialColors, elevation, motion as motionTokens, shape } from '@/lib/material-colors';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

interface ScannerEnhancedProps {
  onAnalysisComplete?: (result: any) => void;
}

export default function ScannerEnhanced({ onAnalysisComplete }: ScannerEnhancedProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraActive, setCameraActive] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    await analyzeImage(file);
  };

  const analyzeImage = async (file: File) => {
    setIsScanning(true);
    setError(null);
    setProgress(0);
    setResult(null);

    const formData = new FormData();
    formData.append('image', file);

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
      }, 300);

      const response = await fetch('/api/analyze-plant', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        throw new Error('Análise falhou');
      }

      const data = await response.json();
      setResult(data);
      onAnalysisComplete?.(data);
      
      toast({
        title: "Análise Completa",
        description: "A planta foi identificada com sucesso!",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      toast({
        title: "Erro na Análise",
        description: "Não foi possível processar a imagem.",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (err) {
      setError('Não foi possível acessar a câmera');
      toast({
        title: "Erro de Câmera",
        description: "Não foi possível acessar a câmera do dispositivo.",
        variant: "destructive",
      });
    }
  };

  const capturePhoto = async () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(videoRef.current, 0, 0);

    canvas.toBlob(async (blob) => {
      if (blob) {
        const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' });
        setImagePreview(canvas.toDataURL());
        await analyzeImage(file);
      }
    }, 'image/jpeg');

    // Stop camera
    const stream = videoRef.current.srcObject as MediaStream;
    stream?.getTracks().forEach((track) => track.stop());
    setCameraActive(false);
  };

  const handleShare = async () => {
    if (!result || !imagePreview) return;

    try {
      if (navigator.share) {
        await navigator.share({
          title: `Análise: ${result.plantName || 'Planta'}`,
          text: `Confiança: ${result.confidence || 'N/A'}%\n${result.analysis || ''}`,
        });
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(
          `Análise: ${result.plantName || 'Planta'}\nConfiança: ${result.confidence || 'N/A'}%\n${result.analysis || ''}`
        );
        toast({
          title: "Copiado!",
          description: "Resultado copiado para a área de transferência.",
        });
      }
    } catch (err) {
      console.error('Share failed:', err);
    }
  };

  const handleDownload = () => {
    if (!imagePreview) return;

    const link = document.createElement('a');
    link.href = imagePreview;
    link.download = `arboris-scan-${Date.now()}.jpg`;
    link.click();

    toast({
      title: "Download Iniciado",
      description: "A imagem está sendo baixada.",
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6" style={{ backgroundColor: materialColors.surface.base }}>
      {/* Camera View or Image Preview */}
      <motion.div
        className={`relative w-full max-w-2xl aspect-[4/3] ${shape.large} overflow-hidden ${elevation.level2}`}
        style={{ backgroundColor: materialColors.surface.elevated2 }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: motionTokens.duration.medium2 / 1000 }}
      >
        {cameraActive ? (
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
        ) : imagePreview ? (
          <div className="relative w-full h-full">
            <Image src={imagePreview} alt="Preview" fill className="object-cover" />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full">
            <Camera size={64} style={{ color: materialColors.text.disabled }} />
            <p className="mt-4 text-sm" style={{ color: materialColors.text.secondary }}>
              Nenhuma imagem selecionada
            </p>
          </div>
        )}

        {/* Progress Overlay */}
        <AnimatePresence>
          {isScanning && (
            <motion.div
              className="absolute inset-0 flex flex-col items-center justify-center"
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Loader2 size={48} className="animate-spin" style={{ color: materialColors.primary.main }} />
              <div className="mt-6 w-48 h-1 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full"
                  style={{ backgroundColor: materialColors.primary.main }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className="mt-4 text-sm" style={{ color: materialColors.text.primary }}>
                Analisando... {progress}%
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result Overlay */}
        <AnimatePresence>
          {result && !isScanning && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="text-center px-6">
                <CheckCircle2 size={64} style={{ color: materialColors.success }} className="mx-auto" />
                <h3 className="mt-4 text-xl font-medium" style={{ color: materialColors.text.primary }}>
                  Análise Completa
                </h3>
                <p className="mt-2 text-sm" style={{ color: materialColors.text.secondary }}>
                  {result.plantName || 'Planta identificada com sucesso'}
                </p>
                <div className="mt-6 flex gap-3 justify-center">
                  <Button
                    size="sm"
                    onClick={() => setResult(null)}
                    style={{ backgroundColor: materialColors.primary.main, color: '#121212' }}
                  >
                    Nova Análise
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleShare}
                    style={{ borderColor: materialColors.divider, color: materialColors.text.primary }}
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Compartilhar
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Overlay */}
        <AnimatePresence>
          {error && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="text-center px-6">
                <XCircle size={64} style={{ color: materialColors.error }} className="mx-auto" />
                <h3 className="mt-4 text-xl font-medium" style={{ color: materialColors.text.primary }}>
                  Erro na Análise
                </h3>
                <p className="mt-2 text-sm" style={{ color: materialColors.text.secondary }}>
                  {error}
                </p>
                <Button
                  size="sm"
                  className="mt-6"
                  onClick={() => setError(null)}
                  style={{ backgroundColor: materialColors.error, color: '#121212' }}
                >
                  Tentar Novamente
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Action Buttons */}
      <div className="flex gap-4 mt-8">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Upload FAB */}
        <motion.button
          className={`w-14 h-14 ${shape.large} ${elevation.level3} flex items-center justify-center`}
          style={{ backgroundColor: materialColors.surface.elevated2 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => fileInputRef.current?.click()}
          disabled={isScanning}
        >
          <Upload size={24} style={{ color: materialColors.primary.main }} />
        </motion.button>

        {/* Camera FAB */}
        <motion.button
          className={`w-16 h-16 ${shape.full} ${elevation.level3} flex items-center justify-center`}
          style={{ backgroundColor: materialColors.primary.main }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={cameraActive ? capturePhoto : startCamera}
          disabled={isScanning}
        >
          <Camera size={28} style={{ color: '#121212' }} />
        </motion.button>

        {/* Download FAB */}
        {imagePreview && !isScanning && (
          <motion.button
            className={`w-14 h-14 ${shape.large} ${elevation.level3} flex items-center justify-center`}
            style={{ backgroundColor: materialColors.surface.elevated2 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDownload}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <Download size={24} style={{ color: materialColors.secondary.main }} />
          </motion.button>
        )}
      </div>

      {/* Result Card */}
      <AnimatePresence>
        {result && (
          <motion.div
            className={`mt-8 w-full max-w-2xl p-6 ${shape.medium} ${elevation.level2}`}
            style={{ backgroundColor: materialColors.surface.elevated1 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium" style={{ color: materialColors.text.primary }}>
                Resultado da Análise
              </h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleShare}
                style={{ color: materialColors.primary.main }}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Compartilhar
              </Button>
            </div>
            <div className="space-y-3">
              <div className={`p-3 ${shape.small}`} style={{ backgroundColor: materialColors.surface.elevated2 }}>
                <p className="text-xs font-medium" style={{ color: materialColors.text.secondary }}>
                  Nome Científico
                </p>
                <p className="text-sm mt-1" style={{ color: materialColors.text.primary }}>
                  {result.plantName || 'N/A'}
                </p>
              </div>
              <div className={`p-3 ${shape.small}`} style={{ backgroundColor: materialColors.surface.elevated2 }}>
                <p className="text-xs font-medium" style={{ color: materialColors.text.secondary }}>
                  Confiança da IA
                </p>
                <p className="text-sm mt-1" style={{ color: materialColors.text.primary }}>
                  {result.confidence || 'N/A'}%
                </p>
              </div>
              <div className={`p-3 ${shape.small}`} style={{ backgroundColor: materialColors.surface.elevated2 }}>
                <p className="text-xs font-medium mb-2" style={{ color: materialColors.text.secondary }}>
                  Análise Completa
                </p>
                <p className="text-sm leading-relaxed" style={{ color: materialColors.text.primary }}>
                  {result.analysis || 'Nenhuma análise disponível'}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

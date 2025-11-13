
'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  Upload, 
  Settings, 
  Filter, 
  History, 
  Download,
  Share2,
  Zap,
  Layers,
  Info,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Grid3x3,
  Sun,
  Moon,
  Sparkles,
  Loader2,
  CheckCircle2,
  XCircle,
  Activity,
  Cpu,
} from 'lucide-react';
import SensorPanel from './sensor-panel';
import MLSettings from './ml-settings';
import HealthResultDisplay from './health-result-display';
import { materialColors, elevation, motion as motionTokens, typography, shape } from '@/lib/material-colors';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

interface ExploratorMainProps {
  userProfile: string;
  activeTools: string[];
  onConfigureTools: () => void;
}

type OverlayType = 'settings' | 'filters' | 'history' | 'tools' | 'sensors' | 'ml-settings' | null;

export default function ExploratorMain({ userProfile, activeTools, onConfigureTools }: ExploratorMainProps) {
  const [activeOverlay, setActiveOverlay] = useState<OverlayType>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [gridOverlay, setGridOverlay] = useState(false);
  const [showHealthResult, setShowHealthResult] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [cameraInitializing, setCameraInitializing] = useState(false);

  // Detectar se é análise de saúde baseado nas ferramentas ativas
  const isHealthMode = activeTools.includes('health-diagnostics');

  // Close panel on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveOverlay(null);
        setShowHealthResult(false);
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  // Auto-inicializar câmera ao montar o componente
  useEffect(() => {
    const initializeCamera = async () => {
      setCameraInitializing(true);
      
      // Pequeno delay para garantir que o videoRef está renderizado
      await new Promise(resolve => setTimeout(resolve, 100));
      
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          
          // CRÍTICO: Aguardar o play() para garantir que o vídeo inicia
          try {
            await videoRef.current.play();
            setCameraActive(true);
            toast({
              title: "Câmera Ativada",
              description: "Sistema EXPLORATOR pronto para análise",
            });
          } catch (playError) {
            console.error('Erro ao iniciar reprodução:', playError);
            throw playError;
          }
        }
      } catch (err) {
        console.error('Erro ao inicializar câmera:', err);
        toast({
          title: "Câmera Indisponível",
          description: "Você pode carregar uma imagem manualmente",
          variant: "destructive",
        });
      } finally {
        setCameraInitializing(false);
      }
    };

    initializeCamera();

    // Cleanup: desligar câmera ao desmontar
    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []); // Executar apenas uma vez ao montar

  // Scanner Functions
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

    // Para modo saúde, adicionar campo de sintomas (pode ser expandido futuramente)
    if (isHealthMode) {
      formData.append('symptoms', 'Análise visual da condição');
      formData.append('additionalInfo', 'Análise solicitada via EXPLORATOR');
    }

    try {
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);

      // Escolher API baseado no modo
      const apiEndpoint = isHealthMode ? '/api/analyze-health' : '/api/analyze-plant';
      
      const response = await fetch(apiEndpoint, {
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
      
      // Para modo saúde, mostrar resultado especializado
      if (isHealthMode) {
        setShowHealthResult(true);
        toast({
          title: "Análise de Saúde Completa",
          description: `Especialidade: ${data.specialtyArea}`,
        });
      } else {
        toast({
          title: "Análise Completa",
          description: "Identificação realizada com sucesso!",
        });
      }
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
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // CRÍTICO: Aguardar o play() para garantir que o vídeo inicia
        await videoRef.current.play();
        
        setCameraActive(true);
        toast({
          title: "Câmera Ativada",
          description: "Aponte para o objeto que deseja analisar",
        });
      }
    } catch (err) {
      console.error('Erro ao iniciar câmera:', err);
      toast({
        title: "Erro de Câmera",
        description: "Não foi possível acessar a câmera",
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
    if (!ctx) return;

    // Aplicar configurações (zoom, brightness, contrast)
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
    
    // Calcular dimensões para zoom
    const scaledWidth = canvas.width / zoom;
    const scaledHeight = canvas.height / zoom;
    const offsetX = (canvas.width - scaledWidth) / 2;
    const offsetY = (canvas.height - scaledHeight) / 2;

    // Desenhar imagem com zoom aplicado
    ctx.drawImage(
      videoRef.current,
      offsetX,
      offsetY,
      scaledWidth,
      scaledHeight,
      0,
      0,
      canvas.width,
      canvas.height
    );

    canvas.toBlob(async (blob) => {
      if (blob) {
        const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' });
        const dataUrl = canvas.toDataURL('image/jpeg');
        setImagePreview(dataUrl);
        
        toast({
          title: "Foto Capturada",
          description: "Iniciando análise com configurações aplicadas...",
        });
        
        await analyzeImage(file);
      }
    }, 'image/jpeg', 0.95);
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Overlay Components
  const SettingsOverlay = () => (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      className="absolute top-0 right-0 w-80 h-full bg-[var(--md-surface-elevated2)] border-l border-[var(--md-divider)] p-6 overflow-y-auto"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className={`${typography.titleLarge}`}>Configurações</h3>
        <Button
          onClick={() => setActiveOverlay(null)}
          variant="ghost"
          size="icon"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      <div className="space-y-6">
        <div>
          <label className={`${typography.labelMedium} text-[var(--md-text-secondary)] mb-2 block`}>
            Perfil Ativo
          </label>
          <div className="p-3 rounded-lg bg-[var(--md-primary-container)] border border-[var(--md-primary-main)]">
            <p className={`${typography.bodyMedium} text-[var(--md-primary-main)]`}>
              {userProfile}
            </p>
          </div>
        </div>

        <div>
          <label className={`${typography.labelMedium} text-[var(--md-text-secondary)] mb-2 block`}>
            Zoom: {zoom.toFixed(1)}x
          </label>
          <input
            type="range"
            min="1"
            max="3"
            step="0.1"
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <label className={`${typography.labelMedium} text-[var(--md-text-secondary)] mb-2 block`}>
            Brilho: {brightness}%
          </label>
          <input
            type="range"
            min="50"
            max="150"
            value={brightness}
            onChange={(e) => setBrightness(parseInt(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <label className={`${typography.labelMedium} text-[var(--md-text-secondary)] mb-2 block`}>
            Contraste: {contrast}%
          </label>
          <input
            type="range"
            min="50"
            max="150"
            value={contrast}
            onChange={(e) => setContrast(parseInt(e.target.value))}
            className="w-full"
          />
        </div>

        <div className="flex items-center justify-between">
          <span className={`${typography.bodyMedium}`}>Grade de Auxílio</span>
          <Button
            onClick={() => setGridOverlay(!gridOverlay)}
            variant={gridOverlay ? "default" : "outline"}
            size="sm"
          >
            <Grid3x3 className="w-4 h-4" />
          </Button>
        </div>

        <Button
          onClick={onConfigureTools}
          className="w-full"
          variant="outline"
        >
          <Settings className="w-4 h-4 mr-2" />
          Gerenciar Ferramentas
        </Button>
      </div>
    </motion.div>
  );

  const FiltersOverlay = () => (
    <motion.div
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -300, opacity: 0 }}
      className="absolute top-0 left-0 w-80 h-full bg-[var(--md-surface-elevated2)] border-r border-[var(--md-divider)] p-6 overflow-y-auto"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className={`${typography.titleLarge}`}>Filtros</h3>
        <Button
          onClick={() => setActiveOverlay(null)}
          variant="ghost"
          size="icon"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      <div className="space-y-4">
        <Button className="w-full justify-start" variant="outline">
          <Sun className="w-4 h-4 mr-2" />
          Modo Diurno
        </Button>
        <Button className="w-full justify-start" variant="outline">
          <Moon className="w-4 h-4 mr-2" />
          Modo Noturno
        </Button>
        <Button className="w-full justify-start" variant="outline">
          <Sparkles className="w-4 h-4 mr-2" />
          Realce de Detalhes
        </Button>
        <Button className="w-full justify-start" variant="outline">
          <Layers className="w-4 h-4 mr-2" />
          Análise em Camadas
        </Button>
      </div>
    </motion.div>
  );

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen bg-[var(--md-surface-base)] overflow-hidden"
    >
      {/* Main Scanner Area */}
      <div className="absolute inset-0">
        {cameraActive ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            style={{
              transform: `scale(${zoom})`,
              filter: `brightness(${brightness}%) contrast(${contrast}%)`,
            }}
          />
        ) : imagePreview ? (
          <div className="relative w-full h-full flex items-center justify-center bg-black">
            <Image
              src={imagePreview}
              alt="Preview"
              fill
              className="object-contain"
              style={{
                transform: `scale(${zoom})`,
                filter: `brightness(${brightness}%) contrast(${contrast}%)`,
              }}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <div className="text-center space-y-6">
              {cameraInitializing ? (
                <>
                  <Loader2 className="w-24 h-24 mx-auto text-[var(--md-primary-main)] animate-spin" />
                  <div>
                    <h2 className={`${typography.headlineMedium} mb-2`}>
                      Ativando Câmera...
                    </h2>
                    <p className={`${typography.bodyLarge} text-[var(--md-text-secondary)]`}>
                      Aguarde enquanto inicializamos o sistema
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <Camera className="w-24 h-24 mx-auto text-[var(--md-text-disabled)]" />
                  <div>
                    <h2 className={`${typography.headlineMedium} mb-2`}>
                      Pronto para Explorar
                    </h2>
                    <p className={`${typography.bodyLarge} text-[var(--md-text-secondary)]`}>
                      Carregue uma imagem para análise
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Grid Overlay */}
        {gridOverlay && (
          <div className="absolute inset-0 pointer-events-none">
            <svg className="w-full h-full">
              <defs>
                <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                  <path
                    d="M 50 0 L 0 0 0 50"
                    fill="none"
                    stroke="rgba(138, 180, 248, 0.3)"
                    strokeWidth="1"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
        )}

        {/* Scanning Progress */}
        {isScanning && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-[var(--md-surface-elevated2)] rounded-xl p-8 max-w-md w-full mx-6">
              <div className="flex items-center gap-3 mb-4">
                <Loader2 className="w-6 h-6 animate-spin text-[var(--md-primary-main)]" />
                <h3 className={`${typography.titleLarge}`}>Analisando...</h3>
              </div>
              <div className="w-full h-2 bg-[var(--md-surface-base)] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-gradient-to-r from-[var(--md-primary-main)] to-[var(--md-secondary-main)]"
                />
              </div>
              <p className={`${typography.bodySmall} text-[var(--md-text-secondary)] mt-2`}>
                {progress}% completo
              </p>
            </div>
          </div>
        )}

        {/* Result Display */}
        <AnimatePresence>
          {result && !isScanning && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="absolute bottom-0 left-0 right-0 bg-[var(--md-surface-elevated2)] border-t border-[var(--md-divider)] p-6 max-h-[50vh] overflow-y-auto"
            >
              <div className="flex items-start gap-3 mb-4">
                <CheckCircle2 className="w-6 h-6 text-[var(--md-success)] flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className={`${typography.titleLarge} mb-2`}>
                    Análise Completa
                  </h3>
                  <p className={`${typography.bodyMedium} text-[var(--md-text-secondary)] whitespace-pre-wrap`}>
                    {result.analysis || 'Resultado disponível'}
                  </p>
                </div>
                <Button
                  onClick={() => setResult(null)}
                  variant="ghost"
                  size="icon"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Baixar
                </Button>
                <Button size="sm" variant="outline">
                  <Share2 className="w-4 h-4 mr-2" />
                  Compartilhar
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Top Bar - Profile & Tools */}
      <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/70 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-[var(--md-primary-main)]" />
            <div>
              <p className={`${typography.labelSmall} text-[var(--md-text-secondary)]`}>
                EXPLORATOR
              </p>
              <p className={`${typography.bodySmall} text-white`}>
                {userProfile}
              </p>
            </div>
          </div>
          <Button
            onClick={toggleFullscreen}
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Left Toolbar */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-2">
        <Button
          onClick={() => setActiveOverlay(activeOverlay === 'filters' ? null : 'filters')}
          size="icon"
          className={`md-fab w-12 h-12 ${
            activeOverlay === 'filters' 
              ? 'bg-[var(--md-primary-main)]' 
              : 'bg-[var(--md-surface-elevated2)]'
          }`}
        >
          <Filter className="w-5 h-5" />
        </Button>
        <Button
          onClick={() => setActiveOverlay(activeOverlay === 'sensors' ? null : 'sensors')}
          size="icon"
          className={`md-fab w-12 h-12 ${
            activeOverlay === 'sensors' 
              ? 'bg-[var(--md-secondary-main)]' 
              : 'bg-[var(--md-surface-elevated2)]'
          }`}
        >
          <Activity className="w-5 h-5" />
        </Button>
        <Button
          onClick={() => setZoom((z) => Math.min(z + 0.5, 3))}
          size="icon"
          className="md-fab w-12 h-12 bg-[var(--md-surface-elevated2)]"
        >
          <ZoomIn className="w-5 h-5" />
        </Button>
        <Button
          onClick={() => setZoom((z) => Math.max(z - 0.5, 1))}
          size="icon"
          className="md-fab w-12 h-12 bg-[var(--md-surface-elevated2)]"
        >
          <ZoomOut className="w-5 h-5" />
        </Button>
      </div>

      {/* Right Toolbar */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2">
        <Button
          onClick={() => setActiveOverlay(activeOverlay === 'settings' ? null : 'settings')}
          size="icon"
          className={`md-fab w-12 h-12 ${
            activeOverlay === 'settings' 
              ? 'bg-[var(--md-primary-main)]' 
              : 'bg-[var(--md-surface-elevated2)]'
          }`}
        >
          <Settings className="w-5 h-5" />
        </Button>
        <Button
          onClick={() => setActiveOverlay(activeOverlay === 'ml-settings' ? null : 'ml-settings')}
          size="icon"
          className={`md-fab w-12 h-12 ${
            activeOverlay === 'ml-settings' 
              ? 'bg-[var(--md-secondary-main)]' 
              : 'bg-[var(--md-surface-elevated2)]'
          }`}
        >
          <Cpu className="w-5 h-5" />
        </Button>
        <Button
          onClick={() => setActiveOverlay(activeOverlay === 'history' ? null : 'history')}
          size="icon"
          className={`md-fab w-12 h-12 ${
            activeOverlay === 'history' 
              ? 'bg-[var(--md-primary-main)]' 
              : 'bg-[var(--md-surface-elevated2)]'
          }`}
        >
          <History className="w-5 h-5" />
        </Button>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <Button
          onClick={() => fileInputRef.current?.click()}
          size="icon"
          className="md-fab w-16 h-16 bg-[var(--md-surface-elevated2)]"
          disabled={isScanning}
        >
          <Upload className="w-6 h-6" />
        </Button>

        <Button
          onClick={cameraActive ? capturePhoto : startCamera}
          size="icon"
          className="md-fab w-20 h-20 bg-[var(--md-primary-main)] hover:bg-[var(--md-primary-dark)] relative group"
          disabled={isScanning || cameraInitializing}
        >
          {isScanning ? (
            <Loader2 className="w-8 h-8 animate-spin" />
          ) : cameraActive ? (
            <>
              <Camera className="w-8 h-8" />
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs font-bold text-[var(--md-primary-main)] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                SCANN
              </span>
            </>
          ) : (
            <Camera className="w-8 h-8" />
          )}
        </Button>

        {cameraActive && (
          <Button
            onClick={stopCamera}
            size="icon"
            className="md-fab w-16 h-16 bg-[var(--md-error)]"
          >
            <X className="w-6 h-6" />
          </Button>
        )}
      </div>

      {/* Overlays */}
      <AnimatePresence>
        {activeOverlay === 'settings' && <SettingsOverlay />}
        {activeOverlay === 'filters' && <FiltersOverlay />}
        {activeOverlay === 'sensors' && (
          <SensorPanel
            isOpen={activeOverlay === 'sensors'}
            onClose={() => setActiveOverlay(null)}
          />
        )}
        {activeOverlay === 'ml-settings' && (
          <MLSettings
            isOpen={activeOverlay === 'ml-settings'}
            onClose={() => setActiveOverlay(null)}
          />
        )}
        {showHealthResult && result && (
          <HealthResultDisplay
            result={result}
            onClose={() => setShowHealthResult(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

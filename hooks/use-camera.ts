
'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

export type CameraMode = 'macro' | 'standard' | 'selfie' | 'telescope';
export type CameraEffect = 'nitidezIA' | 'exposicao' | 'contraste' | 'realceIA' | 'visaoNoturna' | 'termal';

export interface CameraState {
  isActive: boolean;
  isCapturing: boolean;
  stream: MediaStream | null;
  error: string | null;
  facingMode: 'user' | 'environment';
  zoom: number;
}

export const useCameraAccess = () => {
  const [cameraState, setCameraState] = useState<CameraState>({
    isActive: false,
    isCapturing: false,
    stream: null,
    error: null,
    facingMode: 'environment',
    zoom: 1,
  });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Configurações de câmera baseadas no modo
  const getCameraConstraints = useCallback((mode: CameraMode): MediaStreamConstraints => {
    const baseConstraints: MediaStreamConstraints = {
      audio: false,
      video: {
        facingMode: cameraState.facingMode,
        width: { ideal: 1920 },
        height: { ideal: 1080 },
      },
    };

    switch (mode) {
      case 'macro':
        return {
          ...baseConstraints,
          video: {
            ...baseConstraints.video as MediaTrackConstraints,
            // focusMode e focusDistance são experimentais e não suportados em TypeScript
          },
        };
      case 'telescope':
        return {
          ...baseConstraints,
          video: {
            ...baseConstraints.video as MediaTrackConstraints,
            // zoom é experimental e configurado dinamicamente via setZoom
          },
        };
      case 'selfie':
        return {
          ...baseConstraints,
          video: {
            ...baseConstraints.video as MediaTrackConstraints,
            facingMode: 'user',
          },
        };
      default:
        return baseConstraints;
    }
  }, [cameraState.facingMode]);

  // Iniciar câmera
  const startCamera = useCallback(async (mode: CameraMode = 'standard') => {
    try {
      setCameraState(prev => ({ ...prev, error: null, isCapturing: true }));

      // Parar stream anterior se existir
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const constraints = getCameraConstraints(mode);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setCameraState(prev => ({
        ...prev,
        isActive: true,
        isCapturing: false,
        stream,
        facingMode: mode === 'selfie' ? 'user' : 'environment',
      }));

      return stream;
    } catch (error) {
      console.error('Erro ao acessar câmera:', error);
      setCameraState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro ao acessar câmera',
        isCapturing: false,
        isActive: false,
      }));
      return null;
    }
  }, [getCameraConstraints]);

  // Parar câmera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraState(prev => ({
      ...prev,
      isActive: false,
      stream: null,
    }));
  }, []);

  // Trocar entre câmera frontal e traseira
  const switchCamera = useCallback(async (mode: CameraMode) => {
    if (cameraState.isActive) {
      await stopCamera();
      await startCamera(mode);
    }
  }, [cameraState.isActive, stopCamera, startCamera]);

  // Capturar foto
  const capturePhoto = useCallback((appliedEffects: CameraEffect[] = []): string | null => {
    if (!videoRef.current || !cameraState.isActive) {
      return null;
    }

    const canvas = canvasRef.current || document.createElement('canvas');
    const video = videoRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Desenhar frame do vídeo
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Aplicar efeitos
    if (appliedEffects.length > 0) {
      applyEffectsToCanvas(ctx, canvas, appliedEffects);
    }

    return canvas.toDataURL('image/jpeg', 0.95);
  }, [cameraState.isActive]);

  // Aplicar efeitos ao canvas
  const applyEffectsToCanvas = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    effects: CameraEffect[]
  ) => {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    effects.forEach(effect => {
      switch (effect) {
        case 'nitidezIA':
          // Aplicar filtro de nitidez com IA
          ctx.filter = 'contrast(1.2) brightness(1.1) saturate(1.1)';
          break;
        case 'termal':
          // Efeito térmico (tons de vermelho/laranja)
          for (let i = 0; i < data.length; i += 4) {
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            data[i] = Math.min(255, avg * 1.5); // R
            data[i + 1] = avg * 0.5; // G
            data[i + 2] = 0; // B
          }
          break;
        case 'contraste':
          ctx.filter = 'contrast(1.8) brightness(1.2)';
          break;
        case 'realceIA':
          ctx.filter = 'saturate(1.5) contrast(1.3)';
          break;
        case 'exposicao':
          ctx.filter = 'brightness(1.3)';
          break;
        case 'visaoNoturna':
          ctx.filter = 'grayscale(0.5) brightness(1.4) hue-rotate(90deg)';
          break;
      }
    });

    ctx.putImageData(imageData, 0, 0);
  };

  // Ajustar zoom
  const setZoom = useCallback((zoomLevel: number) => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      const capabilities = videoTrack.getCapabilities() as any;

      if (capabilities.zoom) {
        // @ts-ignore - zoom é uma propriedade experimental do MediaStreamTrack
        videoTrack.applyConstraints({
          // @ts-ignore
          advanced: [{ zoom: Math.max(1, Math.min(zoomLevel, capabilities.zoom.max)) }],
        }).catch((err: Error) => {
          console.warn('Zoom não suportado:', err);
        });

        setCameraState(prev => ({ ...prev, zoom: zoomLevel }));
      }
    }
  }, []);

  // Limpar ao desmontar
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return {
    cameraState,
    videoRef,
    canvasRef,
    startCamera,
    stopCamera,
    switchCamera,
    capturePhoto,
    setZoom,
  };
};

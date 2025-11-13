
'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Navigation,
  Gauge,
  Sun,
  Compass,
  MapPin,
  Activity,
  Zap,
  AlertCircle,
  CheckCircle2,
  X,
} from 'lucide-react';
import { useDeviceSensorsEnhanced } from '@/hooks/use-device-sensors-enhanced';
import { typography } from '@/lib/material-colors';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

interface SensorPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SensorPanel({ isOpen, onClose }: SensorPanelProps) {
  const {
    sensorData,
    permissions,
    isActive,
    startSensors,
    stopSensors,
    requestGPSPermission,
    requestMotionPermission,
  } = useDeviceSensorsEnhanced();

  useEffect(() => {
    if (isOpen && !isActive) {
      startSensors();
    }

    return () => {
      if (isActive) {
        stopSensors();
      }
    };
  }, [isOpen]);

  const handleActivateSensors = async () => {
    await startSensors();
    toast({
      title: 'Sensores Ativados',
      description: 'Todos os sensores disponíveis foram ativados',
    });
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
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -300, opacity: 0 }}
        className="absolute top-0 left-0 w-80 h-full bg-[var(--md-surface-elevated2)] border-r border-[var(--md-divider)] p-6 overflow-y-auto z-40"
      >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Activity className="w-6 h-6 text-[var(--md-primary-main)]" />
          <h3 className={`${typography.titleLarge}`}>Sensores</h3>
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

      {/* Activation Button */}
      {!isActive && (
        <Button
          onClick={handleActivateSensors}
          className="w-full mb-6 bg-[var(--md-primary-main)] hover:bg-[var(--md-primary-dark)] text-[var(--md-surface-base)]"
        >
          <Zap className="w-4 h-4 mr-2" />
          Ativar Sensores
        </Button>
      )}

      {/* GPS Section */}
      <div className="mb-6 p-4 rounded-lg bg-[var(--md-surface-elevated1)]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[var(--md-secondary-main)]" />
            <span className={`${typography.titleMedium}`}>GPS</span>
          </div>
          {permissions.gps === 'granted' ? (
            <CheckCircle2 className="w-5 h-5 text-[var(--md-success)]" />
          ) : (
            <Button
              onClick={requestGPSPermission}
              size="sm"
              variant="outline"
            >
              Ativar
            </Button>
          )}
        </div>

        {sensorData.gps.latitude && sensorData.gps.longitude ? (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--md-text-secondary)]">Latitude:</span>
              <span className="font-mono">{sensorData.gps.latitude.toFixed(6)}°</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--md-text-secondary)]">Longitude:</span>
              <span className="font-mono">{sensorData.gps.longitude.toFixed(6)}°</span>
            </div>
            {sensorData.gps.altitude && (
              <div className="flex justify-between">
                <span className="text-[var(--md-text-secondary)]">Altitude:</span>
                <span className="font-mono">{sensorData.gps.altitude.toFixed(1)}m</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-[var(--md-text-secondary)]">Precisão:</span>
              <span className="font-mono">{sensorData.gps.accuracy?.toFixed(1)}m</span>
            </div>
          </div>
        ) : (
          <p className={`${typography.bodySmall} text-[var(--md-text-disabled)]`}>
            Aguardando localização...
          </p>
        )}
      </div>

      {/* Compass Section */}
      <div className="mb-6 p-4 rounded-lg bg-[var(--md-surface-elevated1)]">
        <div className="flex items-center gap-2 mb-3">
          <Compass className="w-5 h-5 text-[var(--md-primary-main)]" />
          <span className={`${typography.titleMedium}`}>Bússola</span>
        </div>

        {sensorData.compass.heading !== null ? (
          <div className="flex items-center justify-center">
            <div className="relative w-32 h-32">
              <motion.div
                animate={{ rotate: -sensorData.compass.heading }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <Navigation className="w-16 h-16 text-[var(--md-primary-main)]" />
              </motion.div>
              <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold">
                {sensorData.compass.direction}
              </div>
            </div>
          </div>
        ) : (
          <p className={`${typography.bodySmall} text-[var(--md-text-disabled)]`}>
            Aguardando orientação...
          </p>
        )}
      </div>

      {/* Gyroscope Section */}
      <div className="mb-6 p-4 rounded-lg bg-[var(--md-surface-elevated1)]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Gauge className="w-5 h-5 text-[var(--md-warning)]" />
            <span className={`${typography.titleMedium}`}>Giroscópio</span>
          </div>
          {permissions.motion === 'granted' ? (
            <CheckCircle2 className="w-5 h-5 text-[var(--md-success)]" />
          ) : (
            <Button
              onClick={requestMotionPermission}
              size="sm"
              variant="outline"
            >
              Ativar
            </Button>
          )}
        </div>

        {sensorData.gyroscope.alpha !== null ? (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--md-text-secondary)]">Alpha (Z):</span>
              <span className="font-mono">{sensorData.gyroscope.alpha.toFixed(1)}°</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--md-text-secondary)]">Beta (X):</span>
              <span className="font-mono">{sensorData.gyroscope.beta?.toFixed(1)}°</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--md-text-secondary)]">Gamma (Y):</span>
              <span className="font-mono">{sensorData.gyroscope.gamma?.toFixed(1)}°</span>
            </div>
          </div>
        ) : (
          <p className={`${typography.bodySmall} text-[var(--md-text-disabled)]`}>
            Aguardando dados...
          </p>
        )}
      </div>

      {/* Ambient Light Section */}
      <div className="mb-6 p-4 rounded-lg bg-[var(--md-surface-elevated1)]">
        <div className="flex items-center gap-2 mb-3">
          <Sun className="w-5 h-5 text-[var(--md-warning)]" />
          <span className={`${typography.titleMedium}`}>Luz Ambiente</span>
        </div>

        {sensorData.ambientLight.lux !== null ? (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--md-text-secondary)]">Intensidade:</span>
              <span className="font-mono">{sensorData.ambientLight.lux.toFixed(0)} lux</span>
            </div>
            <div
              className={`p-2 rounded text-center text-sm font-medium ${
                sensorData.ambientLight.recommendation === 'optimal'
                  ? 'bg-[var(--md-success)] text-[var(--md-surface-base)]'
                  : sensorData.ambientLight.recommendation === 'low'
                  ? 'bg-[var(--md-warning)] text-[var(--md-surface-base)]'
                  : 'bg-[var(--md-error)] text-[var(--md-surface-base)]'
              }`}
            >
              {sensorData.ambientLight.recommendation === 'optimal' && '✓ Iluminação Ideal'}
              {sensorData.ambientLight.recommendation === 'low' && '⚠ Pouca Luz'}
              {sensorData.ambientLight.recommendation === 'high' && '⚠ Luz Excessiva'}
            </div>
          </div>
        ) : (
          <p className={`${typography.bodySmall} text-[var(--md-text-disabled)]`}>
            Sensor não disponível
          </p>
        )}
      </div>

      {/* Status Summary */}
      <div className="p-4 rounded-lg bg-[var(--md-primary-container)]">
        <p className={`${typography.labelSmall} text-[var(--md-text-secondary)] mb-2`}>
          Status dos Sensores
        </p>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span>GPS:</span>
            <span className={permissions.gps === 'granted' ? 'text-[var(--md-success)]' : ''}>
              {permissions.gps}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Movimento:</span>
            <span className={permissions.motion === 'granted' ? 'text-[var(--md-success)]' : ''}>
              {permissions.motion}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Luz:</span>
            <span className={permissions.light === 'granted' ? 'text-[var(--md-success)]' : ''}>
              {permissions.light}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
    </>
  );
}

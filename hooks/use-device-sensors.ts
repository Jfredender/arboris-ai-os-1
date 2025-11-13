
'use client';

import { useState, useEffect, useCallback } from 'react';

// Extensão do tipo DeviceOrientationEvent para incluir propriedades webkit (iOS)
interface ExtendedDeviceOrientationEvent extends DeviceOrientationEvent {
  webkitCompassHeading?: number;
}

// Tipos para dados de sensores
export interface SensorData {
  // Giroscópio (orientação do dispositivo)
  orientation: {
    alpha: number; // Rotação Z (0-360°)
    beta: number;  // Rotação X (-180 a 180°)
    gamma: number; // Rotação Y (-90 a 90°)
    heading: number; // Direção cardinal (0-360°, 0=Norte)
  } | null;
  
  // GPS (localização)
  location: {
    latitude: number;
    longitude: number;
    altitude: number | null;
    accuracy: number;
    speed: number | null;
    heading: number | null;
  } | null;
  
  // Acelerômetro (movimento)
  acceleration: {
    x: number;
    y: number;
    z: number;
  } | null;
  
  // Status dos sensores
  status: {
    orientationAvailable: boolean;
    locationAvailable: boolean;
    accelerationAvailable: boolean;
    permissionGranted: boolean;
  };
}

export const useDeviceSensors = () => {
  const [sensorData, setSensorData] = useState<SensorData>({
    orientation: null,
    location: null,
    acceleration: null,
    status: {
      orientationAvailable: false,
      locationAvailable: false,
      accelerationAvailable: false,
      permissionGranted: false,
    },
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Solicitar permissões (iOS 13+)
  const requestPermissions = useCallback(async () => {
    if (typeof window === 'undefined') return false;

    try {
      // iOS 13+ requer permissão explícita
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        if (permission !== 'granted') {
          setError('Permissão de sensores negada');
          return false;
        }
      }

      setSensorData(prev => ({
        ...prev,
        status: { ...prev.status, permissionGranted: true },
      }));
      return true;
    } catch (err) {
      console.error('Erro ao solicitar permissões:', err);
      setError('Erro ao acessar sensores');
      return false;
    }
  }, []);

  // Handler para orientação (giroscópio)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOrientation = (event: DeviceOrientationEvent) => {
      const extendedEvent = event as ExtendedDeviceOrientationEvent;
      const { alpha, beta, gamma } = event;
      
      if (alpha !== null && beta !== null && gamma !== null) {
        // Calcular direção cardinal (heading)
        let heading = alpha;
        if (extendedEvent.webkitCompassHeading) {
          heading = extendedEvent.webkitCompassHeading; // iOS
        }

        setSensorData(prev => ({
          ...prev,
          orientation: {
            alpha: Math.round(alpha * 10) / 10,
            beta: Math.round(beta * 10) / 10,
            gamma: Math.round(gamma * 10) / 10,
            heading: Math.round(heading * 10) / 10,
          },
          status: { ...prev.status, orientationAvailable: true },
        }));
      }
    };

    window.addEventListener('deviceorientation', handleOrientation);
    
    // Testar disponibilidade após 1s
    setTimeout(() => {
      setSensorData(prev => {
        if (!prev.orientation) {
          return {
            ...prev,
            status: { ...prev.status, orientationAvailable: false },
          };
        }
        return prev;
      });
    }, 1000);

    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, []);

  // Handler para GPS
  useEffect(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setIsLoading(false);
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, altitude, accuracy, speed, heading } = position.coords;
        
        setSensorData(prev => ({
          ...prev,
          location: {
            latitude: Math.round(latitude * 1000000) / 1000000,
            longitude: Math.round(longitude * 1000000) / 1000000,
            altitude: altitude ? Math.round(altitude * 10) / 10 : null,
            accuracy: Math.round(accuracy * 10) / 10,
            speed: speed ? Math.round(speed * 10) / 10 : null,
            heading: heading ? Math.round(heading * 10) / 10 : null,
          },
          status: { ...prev.status, locationAvailable: true },
        }));
        setIsLoading(false);
      },
      (err) => {
        console.error('Erro GPS:', err);
        setError(`GPS: ${err.message}`);
        setSensorData(prev => ({
          ...prev,
          status: { ...prev.status, locationAvailable: false },
        }));
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // Handler para acelerômetro
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleMotion = (event: DeviceMotionEvent) => {
      const acc = event.accelerationIncludingGravity;
      
      if (acc && acc.x !== null && acc.y !== null && acc.z !== null) {
        setSensorData(prev => ({
          ...prev,
          acceleration: {
            x: Math.round(acc.x! * 100) / 100,
            y: Math.round(acc.y! * 100) / 100,
            z: Math.round(acc.z! * 100) / 100,
          },
          status: { ...prev.status, accelerationAvailable: true },
        }));
      }
    };

    window.addEventListener('devicemotion', handleMotion);

    return () => window.removeEventListener('devicemotion', handleMotion);
  }, []);

  return {
    sensorData,
    isLoading,
    error,
    requestPermissions,
    // Helpers
    hasAnySensor: Object.values(sensorData.status).some(v => v === true),
    compassHeading: sensorData.orientation?.heading ?? null,
    gpsCoordinates: sensorData.location 
      ? `${sensorData.location.latitude.toFixed(6)}, ${sensorData.location.longitude.toFixed(6)}`
      : null,
  };
};

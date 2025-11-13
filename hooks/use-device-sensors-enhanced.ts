
'use client';

import { useState, useEffect } from 'react';

interface SensorData {
  // GPS Data
  gps: {
    latitude: number | null;
    longitude: number | null;
    altitude: number | null;
    accuracy: number | null;
    heading: number | null;
    speed: number | null;
  };
  
  // Gyroscope Data
  gyroscope: {
    alpha: number | null; // Rotation around Z axis (0-360)
    beta: number | null;  // Rotation around X axis (-180 to 180)
    gamma: number | null; // Rotation around Y axis (-90 to 90)
  };
  
  // Accelerometer Data
  accelerometer: {
    x: number | null;
    y: number | null;
    z: number | null;
  };
  
  // Ambient Light
  ambientLight: {
    lux: number | null;
    recommendation: 'low' | 'optimal' | 'high' | null;
  };
  
  // Compass
  compass: {
    heading: number | null; // 0-360 degrees
    direction: 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW' | null;
  };
}

interface SensorPermissions {
  gps: 'granted' | 'denied' | 'prompt' | 'not-supported';
  motion: 'granted' | 'denied' | 'prompt' | 'not-supported';
  light: 'granted' | 'denied' | 'prompt' | 'not-supported';
}

export function useDeviceSensorsEnhanced() {
  const [sensorData, setSensorData] = useState<SensorData>({
    gps: {
      latitude: null,
      longitude: null,
      altitude: null,
      accuracy: null,
      heading: null,
      speed: null,
    },
    gyroscope: {
      alpha: null,
      beta: null,
      gamma: null,
    },
    accelerometer: {
      x: null,
      y: null,
      z: null,
    },
    ambientLight: {
      lux: null,
      recommendation: null,
    },
    compass: {
      heading: null,
      direction: null,
    },
  });

  const [permissions, setPermissions] = useState<SensorPermissions>({
    gps: 'prompt',
    motion: 'prompt',
    light: 'not-supported',
  });

  const [isActive, setIsActive] = useState(false);

  // Helper: Get compass direction from heading
  const getCompassDirection = (heading: number): 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW' => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'] as const;
    const index = Math.round(heading / 45) % 8;
    return directions[index];
  };

  // Helper: Get light recommendation
  const getLightRecommendation = (lux: number): 'low' | 'optimal' | 'high' => {
    if (lux < 200) return 'low';
    if (lux > 1000) return 'high';
    return 'optimal';
  };

  // Request GPS Permission
  const requestGPSPermission = async () => {
    if (!('geolocation' in navigator)) {
      setPermissions((prev) => ({ ...prev, gps: 'not-supported' }));
      return false;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      setPermissions((prev) => ({ ...prev, gps: 'granted' }));
      updateGPSData(position);
      return true;
    } catch (error) {
      setPermissions((prev) => ({ ...prev, gps: 'denied' }));
      return false;
    }
  };

  // Request Motion Permission (iOS)
  const requestMotionPermission = async () => {
    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      try {
        const permission = await (DeviceMotionEvent as any).requestPermission();
        setPermissions((prev) => ({ ...prev, motion: permission }));
        return permission === 'granted';
      } catch (error) {
        setPermissions((prev) => ({ ...prev, motion: 'denied' }));
        return false;
      }
    } else {
      setPermissions((prev) => ({ ...prev, motion: 'granted' }));
      return true;
    }
  };

  // Update GPS Data
  const updateGPSData = (position: GeolocationPosition) => {
    setSensorData((prev) => ({
      ...prev,
      gps: {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        altitude: position.coords.altitude,
        accuracy: position.coords.accuracy,
        heading: position.coords.heading,
        speed: position.coords.speed,
      },
    }));
  };

  // Start GPS Tracking
  const startGPS = () => {
    if (permissions.gps !== 'granted') {
      requestGPSPermission();
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      updateGPSData,
      (error) => console.error('GPS Error:', error),
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  };

  // Handle Device Orientation (Gyroscope + Compass)
  const handleOrientation = (event: DeviceOrientationEvent) => {
    const { alpha, beta, gamma } = event;

    setSensorData((prev) => ({
      ...prev,
      gyroscope: {
        alpha: alpha || 0,
        beta: beta || 0,
        gamma: gamma || 0,
      },
      compass: {
        heading: alpha || 0,
        direction: getCompassDirection(alpha || 0),
      },
    }));
  };

  // Handle Device Motion (Accelerometer)
  const handleMotion = (event: DeviceMotionEvent) => {
    const { x, y, z } = event.acceleration || {};

    setSensorData((prev) => ({
      ...prev,
      accelerometer: {
        x: x || 0,
        y: y || 0,
        z: z || 0,
      },
    }));
  };

  // Handle Ambient Light
  const handleLightSensor = (event: any) => {
    const lux = event.illuminance || event.value;

    setSensorData((prev) => ({
      ...prev,
      ambientLight: {
        lux,
        recommendation: getLightRecommendation(lux),
      },
    }));
  };

  // Start All Sensors
  const startSensors = async () => {
    setIsActive(true);

    // Start GPS
    const gpsCleanup = startGPS();

    // Start Motion/Orientation
    if (permissions.motion === 'granted' || permissions.motion === 'prompt') {
      await requestMotionPermission();
    }

    window.addEventListener('deviceorientation', handleOrientation);
    window.addEventListener('devicemotion', handleMotion);

    // Try Ambient Light Sensor (experimental)
    if ('AmbientLightSensor' in window) {
      try {
        const sensor = new (window as any).AmbientLightSensor();
        sensor.addEventListener('reading', () => {
          handleLightSensor({ illuminance: sensor.illuminance });
        });
        sensor.start();
        setPermissions((prev) => ({ ...prev, light: 'granted' }));
      } catch (error) {
        console.log('Ambient Light Sensor not available');
      }
    }

    return () => {
      gpsCleanup?.();
      window.removeEventListener('deviceorientation', handleOrientation);
      window.removeEventListener('devicemotion', handleMotion);
    };
  };

  // Stop All Sensors
  const stopSensors = () => {
    setIsActive(false);
    window.removeEventListener('deviceorientation', handleOrientation);
    window.removeEventListener('devicemotion', handleMotion);
  };

  return {
    sensorData,
    permissions,
    isActive,
    startSensors,
    stopSensors,
    requestGPSPermission,
    requestMotionPermission,
  };
}

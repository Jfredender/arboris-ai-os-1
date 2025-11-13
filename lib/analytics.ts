
/**
 * ARBORIS AI - Google Analytics Configuration
 * Implements GA4 tracking with custom events for EXPLORATOR F-47
 */

// Environment variable for GA4 Measurement ID
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-PLACEHOLDER123';

// Check if analytics is enabled (disabled in development)
export const isAnalyticsEnabled = () => {
  return (
    typeof window !== 'undefined' &&
    process.env.NODE_ENV === 'production' &&
    GA_MEASUREMENT_ID !== 'G-PLACEHOLDER123'
  );
};

// Type definitions for GA4 events
export interface GAEvent {
  action: string;
  category?: string;
  label?: string;
  value?: number;
}

/**
 * Track custom GA4 event
 */
export const trackEvent = ({ action, category, label, value }: GAEvent) => {
  if (!isAnalyticsEnabled() || typeof window.gtag !== 'function') return;

  window.gtag('event', action, {
    event_category: category || 'engagement',
    event_label: label,
    value: value,
  });
};

/**
 * Track EXPLORATOR mode selection
 */
export const trackModeSelection = (mode: string) => {
  trackEvent({
    action: 'mode_selected',
    category: 'explorator',
    label: mode,
  });
};

/**
 * Track analysis/scan completion
 */
export const trackAnalysis = (mode: string, success: boolean) => {
  trackEvent({
    action: 'analysis_completed',
    category: 'explorator',
    label: `${mode}_${success ? 'success' : 'failure'}`,
    value: success ? 1 : 0,
  });
};

/**
 * Track camera mode changes
 */
export const trackCameraMode = (cameraMode: string) => {
  trackEvent({
    action: 'camera_mode_changed',
    category: 'explorator',
    label: cameraMode,
  });
};

/**
 * Track tool usage
 */
export const trackToolUsage = (toolName: string) => {
  trackEvent({
    action: 'tool_used',
    category: 'explorator_tools',
    label: toolName,
  });
};

/**
 * Track sensor activation
 */
export const trackSensorActivation = (sensorType: string) => {
  trackEvent({
    action: 'sensor_activated',
    category: 'device_sensors',
    label: sensorType,
  });
};

/**
 * Track language change
 */
export const trackLanguageChange = (locale: string) => {
  trackEvent({
    action: 'language_changed',
    category: 'i18n',
    label: locale,
  });
};

/**
 * Track authentication events
 */
export const trackAuth = (method: string, success: boolean) => {
  trackEvent({
    action: success ? 'login_success' : 'login_failure',
    category: 'authentication',
    label: method,
    value: success ? 1 : 0,
  });
};

/**
 * Track page views (automatic with Next.js routing)
 */
export const trackPageView = (url: string) => {
  if (!isAnalyticsEnabled() || typeof window.gtag !== 'function') return;

  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: url,
  });
};

// Extend Window interface for TypeScript
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

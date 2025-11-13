
/**
 * ARBORIS AI - Google Analytics Component
 * Implements GA4 using @next/third-parties for optimal performance
 */

'use client';

import { GoogleAnalytics as NextGoogleAnalytics } from '@next/third-parties/google';
import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { GA_MEASUREMENT_ID, isAnalyticsEnabled, trackPageView } from '@/lib/analytics';

export function GoogleAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Track page views on route changes
  useEffect(() => {
    if (!isAnalyticsEnabled()) return;

    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    trackPageView(url);
  }, [pathname, searchParams]);

  // Don't render in development or if analytics is disabled
  if (!isAnalyticsEnabled()) {
    return null;
  }

  return <NextGoogleAnalytics gaId={GA_MEASUREMENT_ID} />;
}

/**
 * Web Vitals Reporter
 * Tracks Core Web Vitals to GA4
 */
export function reportWebVitals(metric: any) {
  if (!isAnalyticsEnabled() || typeof window.gtag !== 'function') return;

  window.gtag('event', metric.name, {
    event_category: 'Web Vitals',
    value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
    event_label: metric.id,
    non_interaction: true,
  });
}

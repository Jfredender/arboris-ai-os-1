
'use client';

import { motion } from 'framer-motion';
import { materialColors } from '@/lib/material-colors';
import { Skeleton } from '@/components/ui/skeleton';

export default function LoadingSkeleton() {
  return (
    <div className="w-full h-screen bg-[var(--md-surface-base)] p-6">
      {/* Header Skeleton */}
      <div className="mb-6">
        <Skeleton className="h-10 w-64 mb-2" style={{ backgroundColor: materialColors.surface.elevated1 }} />
        <Skeleton className="h-4 w-48" style={{ backgroundColor: materialColors.surface.elevated1 }} />
      </div>

      {/* Main Content Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-xl p-6"
            style={{ backgroundColor: materialColors.surface.elevated1 }}
          >
            <Skeleton className="h-48 w-full mb-4" style={{ backgroundColor: materialColors.surface.elevated2 }} />
            <Skeleton className="h-6 w-3/4 mb-2" style={{ backgroundColor: materialColors.surface.elevated2 }} />
            <Skeleton className="h-4 w-1/2" style={{ backgroundColor: materialColors.surface.elevated2 }} />
          </motion.div>
        ))}
      </div>

      {/* Bottom Actions Skeleton */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
        {[1, 2, 3].map((i) => (
          <Skeleton
            key={i}
            className="h-12 w-12 rounded-full"
            style={{ backgroundColor: materialColors.surface.elevated1 }}
          />
        ))}
      </div>
    </div>
  );
}

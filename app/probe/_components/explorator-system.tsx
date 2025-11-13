'use client';

import ScannerEnhanced from './scanner-enhanced';
import { Session } from 'next-auth';

interface ExploratorSystemProps {
  session: Session | null;
}

export function ExploratorSystem({ session }: ExploratorSystemProps) {
  return <ScannerEnhanced />;
}

export default ExploratorSystem;

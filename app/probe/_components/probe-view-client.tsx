"use client";

import { Session } from "next-auth";
import { motion } from "framer-motion";
import { Home, LogOut, History, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ExploratorSystem } from "./explorator-system";
import { materialColors, elevation } from "@/lib/material-colors";

interface ProbeViewClientProps {
  session: Session;
}

export default function ProbeViewClient({ session }: ProbeViewClientProps) {
  const router = useRouter();

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ backgroundColor: materialColors.surface.base }}>
      {/* Material Design 3 App Bar */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 ${elevation.level2}`}
        style={{
          backgroundColor: materialColors.surface.elevated1,
          borderBottom: `1px solid ${materialColors.divider}`,
        }}
      >
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/dashboard')}
            style={{ color: materialColors.primary.main }}
          >
            <Home className="w-5 h-5" />
          </Button>

          <div>
            <div className="text-sm font-semibold" style={{ color: materialColors.text.primary }}>
              Scanner
            </div>
            <div className="text-xs" style={{ color: materialColors.text.secondary }}>
              Análise de Plantas
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/history')}
            className="flex items-center gap-2"
            style={{ color: materialColors.text.secondary }}
          >
            <History className="w-4 h-4" />
            Histórico
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/codex')}
            className="flex items-center gap-2"
            style={{ color: materialColors.text.secondary }}
          >
            <BookOpen className="w-4 h-4" />
            Codex
          </Button>

          <div className="h-6 w-px" style={{ backgroundColor: materialColors.divider }} />

          <div className="text-sm" style={{ color: materialColors.text.secondary }}>
            {session?.user?.name || session?.user?.email || 'Guest'}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => signOut({ callbackUrl: '/auth/signin' })}
            style={{ color: materialColors.error }}
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="pt-20">
        <ExploratorSystem session={session} />
      </div>
    </div>
  );
}

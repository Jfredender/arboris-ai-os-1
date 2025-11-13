
"use client";

import { useState, useEffect } from "react";
import { Session } from "next-auth";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Leaf, 
  MessageCircle, 
  Upload, 
  Camera, 
  TrendingUp, 
  Brain,
  Settings,
  LogOut,
  User,
  Sparkles,
  Scan,
  BookOpen
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import NavigationHeader from "./navigation-header";
import PlantAnalysisCard from "./plant-analysis-card";
import ChatInterfaceCard from "./chat-interface-card";
import QuickStatsCard from "./quick-stats-card";

interface DashboardClientProps {
  session: Session;
}

export default function DashboardClient({ session }: DashboardClientProps) {
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const welcomeMessage = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/auth/signin" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--negro-vacuo)] via-[var(--azul-noite-profundo)] to-[var(--negro-vacuo)]">
      <NavigationHeader user={session.user} onSignOut={handleSignOut} />
      
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center space-x-3">
            <motion.div
              className="w-12 h-12 rounded-full bg-gradient-to-r from-[var(--azul-genese)] to-[var(--verde-simbionte)] flex items-center justify-center"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Leaf className="w-6 h-6 text-white" />
            </motion.div>
            <h1 className="text-4xl font-bold text-[var(--branco-estelar)]">
              {welcomeMessage()}, {session.user?.name?.split(' ')[0] || 'Explorer'}
            </h1>
          </div>
          <p className="text-xl text-[var(--cinza-tatico-claro)] max-w-2xl mx-auto">
            Welcome to ARBORIS AI OS 1 - Your advanced plant intelligence companion
          </p>
        </motion.div>

        {/* Quick Stats */}
        <QuickStatsCard />

        {/* Main Features Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Plant Analysis */}
          <div id="plant-analysis-card">
            <PlantAnalysisCard />
          </div>
          
          {/* Chat Interface */}
          <div id="chat-interface-card">
            <ChatInterfaceCard />
          </div>
        </div>

        {/* Recent Activity & Features */}
        <div className="grid md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Card className="bg-[var(--negro-vacuo)]/60 backdrop-blur-sm border-[var(--verde-floresta)]/30 hover:border-[var(--verde-floresta)]/60 transition-all duration-300 hover:shadow-lg hover:shadow-[var(--verde-floresta)]/20">
              <CardHeader>
                <CardTitle className="flex items-center text-[var(--branco-estelar)]">
                  <TrendingUp className="w-5 h-5 mr-2 text-[var(--verde-floresta)]" />
                  Analysis Trends
                </CardTitle>
                <CardDescription className="text-[var(--cinza-tatico-claro)]">
                  Track your plant health insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--cinza-tatico-claro)]">Health Score</span>
                    <span className="text-[var(--verde-simbionte)] font-semibold">94%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--cinza-tatico-claro)]">Analyses</span>
                    <span className="text-[var(--azul-genese)] font-semibold">12</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--cinza-tatico-claro)]">Accuracy</span>
                    <span className="text-[var(--ambar-evolucao)] font-semibold">98.5%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <Card className="bg-[var(--negro-vacuo)]/60 backdrop-blur-sm border-[var(--magenta-exotico)]/30 hover:border-[var(--magenta-exotico)]/60 transition-all duration-300 hover:shadow-lg hover:shadow-[var(--magenta-exotico)]/20">
              <CardHeader>
                <CardTitle className="flex items-center text-[var(--branco-estelar)]">
                  <Brain className="w-5 h-5 mr-2 text-[var(--magenta-exotico)]" />
                  AI Insights
                </CardTitle>
                <CardDescription className="text-[var(--cinza-tatico-claro)]">
                  Latest AI discoveries
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm text-[var(--cinza-tatico-claro)]">
                    <span className="text-[var(--verde-simbionte)]">→</span> Optimal watering detected
                  </div>
                  <div className="text-sm text-[var(--cinza-tatico-claro)]">
                    <span className="text-[var(--ambar-evolucao)]">→</span> Growth pattern identified
                  </div>
                  <div className="text-sm text-[var(--cinza-tatico-claro)]">
                    <span className="text-[var(--azul-genese)]">→</span> Health optimization ready
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <Card className="bg-[var(--negro-vacuo)]/60 backdrop-blur-sm border-[var(--azul-genese)]/30 hover:border-[var(--azul-genese)]/60 transition-all duration-300 hover:shadow-lg hover:shadow-[var(--azul-genese)]/20">
              <CardHeader>
                <CardTitle className="flex items-center text-[var(--branco-estelar)]">
                  <Sparkles className="w-5 h-5 mr-2 text-[var(--azul-genese)]" />
                  Quick Actions
                </CardTitle>
                <CardDescription className="text-[var(--cinza-tatico-claro)]">
                  Shortcut to common tasks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    document.getElementById("plant-analysis-card")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="w-full justify-start text-[var(--cinza-tatico-claro)] hover:text-[var(--branco-estelar)] hover:bg-[var(--azul-genese)]/10 cursor-pointer"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Quick Scan
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    document.getElementById("chat-interface-card")?.scrollIntoView({ behavior: "smooth" });
                    // Focus the chat input after scrolling
                    setTimeout(() => {
                      const chatInput = document.querySelector('input[placeholder*="Ask ARBORIS"]') as HTMLInputElement;
                      chatInput?.focus?.();
                    }, 500);
                  }}
                  className="w-full justify-start text-[var(--cinza-tatico-claro)] hover:text-[var(--branco-estelar)] hover:bg-[var(--verde-simbionte)]/10 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Ask AI
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/explorator')}
                  className="w-full justify-start text-[var(--cinza-tatico-claro)] hover:text-[var(--branco-estelar)] hover:bg-[var(--azul-genese)]/10 cursor-pointer"
                >
                  <Scan className="w-4 h-4 mr-2" />
                  EXPLORATOR
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/codex')}
                  className="w-full justify-start text-[var(--cinza-tatico-claro)] hover:text-[var(--branco-estelar)] hover:bg-[var(--roxo-genesis)]/10 cursor-pointer"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Codex Botânicus
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => alert("Settings feature coming soon!")}
                  className="w-full justify-start text-[var(--cinza-tatico-claro)] hover:text-[var(--branco-estelar)] hover:bg-[var(--magenta-exotico)]/10 cursor-pointer"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

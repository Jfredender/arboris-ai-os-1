
"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Camera, MessageCircle, Leaf, Activity, Target } from "lucide-react";
import { useEffect, useState } from "react";

export default function QuickStatsCard() {
  const [counts, setCounts] = useState({
    analyses: 0,
    chats: 0,
    accuracy: 0,
    health: 0
  });

  const targetValues = {
    analyses: 12,
    chats: 8,
    accuracy: 98.5,
    health: 94
  };

  useEffect(() => {
    const duration = 2000; // 2 seconds
    const steps = 60;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      
      setCounts({
        analyses: Math.round(targetValues.analyses * progress),
        chats: Math.round(targetValues.chats * progress),
        accuracy: Math.round(targetValues.accuracy * progress * 10) / 10,
        health: Math.round(targetValues.health * progress)
      });

      if (currentStep >= steps) {
        clearInterval(interval);
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, []);

  const stats = [
    {
      icon: Camera,
      label: "Plant Analyses",
      value: counts.analyses.toString(),
      color: "var(--azul-genese)",
      bgColor: "var(--azul-genese)/10",
      borderColor: "var(--azul-genese)/30"
    },
    {
      icon: MessageCircle,
      label: "AI Conversations",
      value: counts.chats.toString(),
      color: "var(--verde-simbionte)",
      bgColor: "var(--verde-simbionte)/10",
      borderColor: "var(--verde-simbionte)/30"
    },
    {
      icon: Target,
      label: "Accuracy Rate",
      value: `${counts.accuracy}%`,
      color: "var(--ambar-evolucao)",
      bgColor: "var(--ambar-evolucao)/10",
      borderColor: "var(--ambar-evolucao)/30"
    },
    {
      icon: Activity,
      label: "Health Score",
      value: `${counts.health}%`,
      color: "var(--magenta-exotico)",
      bgColor: "var(--magenta-exotico)/10",
      borderColor: "var(--magenta-exotico)/30"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="grid grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
        >
          <Card 
            className="bg-[var(--negro-vacuo)]/60 backdrop-blur-sm border-opacity-30 hover:border-opacity-60 transition-all duration-300 hover:shadow-lg"
            style={{ 
              borderColor: stat.borderColor,
              ['--hover-shadow' as any]: `${stat.color}/20`
            }}
          >
            <CardContent className="p-6 text-center space-y-3">
              <motion.div
                className="mx-auto w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: stat.bgColor }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <stat.icon 
                  className="w-6 h-6" 
                  style={{ color: stat.color }}
                />
              </motion.div>
              
              <div>
                <motion.div
                  className="text-2xl font-bold text-[var(--branco-estelar)] mb-1"
                  style={{ color: stat.color }}
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity, 
                    repeatType: "reverse",
                    ease: "easeInOut"
                  }}
                >
                  {stat.value}
                </motion.div>
                <div className="text-sm text-[var(--cinza-tatico-claro)] font-medium">
                  {stat.label}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}

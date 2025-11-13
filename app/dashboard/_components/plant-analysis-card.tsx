
"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Upload, Loader2, CheckCircle, AlertTriangle, Leaf } from "lucide-react";
import { Progress } from "@/components/ui/progress";
// import { getProgressColor } from "@/lib/colors";
import Image from "next/image";

export default function PlantAnalysisCard() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analysisState, setAnalysisState] = useState<'idle' | 'scanning' | 'detecting' | 'complete'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) {
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Start analysis
    await analyzeImage(file);
  };

  const analyzeImage = async (file: File) => {
    setIsAnalyzing(true);
    setProgress(0);
    setAnalysisState('scanning');
    setAnalysisResult(null);

    try {
      const formData = new FormData();
      formData.append('image', file);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 15;
        });
      }, 200);

      // Change states during analysis
      setTimeout(() => setAnalysisState('detecting'), 1000);

      const response = await fetch('/api/analyze-plant', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const result = await response.json();
      setAnalysisResult(result);
      setAnalysisState('complete');
      
    } catch (error) {
      console.error('Analysis error:', error);
      setAnalysisResult({ error: 'Analysis failed. Please try again.' });
      setAnalysisState('complete');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setSelectedImage(null);
    setAnalysisResult(null);
    setProgress(0);
    setAnalysisState('idle');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getStateColor = () => {
    switch (analysisState) {
      case 'scanning': return 'var(--magenta-exotico)';
      case 'detecting': return 'var(--verde-simbionte)';
      case 'complete': return 'var(--azul-genese)';
      default: return 'var(--azul-genese)';
    }
  };

  const getStateText = () => {
    switch (analysisState) {
      case 'scanning': return 'Scanning plant structure...';
      case 'detecting': return 'Detecting plant characteristics...';
      case 'complete': return 'Analysis complete!';
      default: return 'Ready for analysis';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="bg-[var(--negro-vacuo)]/60 backdrop-blur-sm border-[var(--azul-genese)]/30 hover:border-[var(--azul-genese)]/60 transition-all duration-300 hover:shadow-lg hover:shadow-[var(--azul-genese)]/20">
        <CardHeader>
          <CardTitle className="flex items-center text-[var(--branco-estelar)]">
            <motion.div
              animate={{ 
                color: getStateColor(),
                rotate: analysisState === 'scanning' ? [0, 360] : 0 
              }}
              transition={{ 
                color: { duration: 0.5 },
                rotate: { duration: 2, repeat: analysisState === 'scanning' ? Infinity : 0 }
              }}
            >
              <Camera className="w-5 h-5 mr-2" />
            </motion.div>
            Plant Analysis
          </CardTitle>
          <CardDescription className="text-[var(--cinza-tatico-claro)]">
            Upload an image for AI-powered plant identification and health assessment
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Upload Area */}
          {!selectedImage && (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
                isAnalyzing 
                  ? 'border-[var(--magenta-exotico)]/50 bg-[var(--magenta-exotico)]/5' 
                  : 'border-[var(--azul-genese)]/30 hover:border-[var(--azul-genese)]/60 bg-[var(--azul-genese)]/5 hover:bg-[var(--azul-genese)]/10'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isAnalyzing}
              />
              
              <div className="space-y-4">
                <motion.div
                  className="mx-auto w-16 h-16 rounded-full bg-[var(--azul-genese)]/20 flex items-center justify-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isAnalyzing ? (
                    <Loader2 className="w-8 h-8 text-[var(--magenta-exotico)] animate-spin" />
                  ) : (
                    <Upload className="w-8 h-8 text-[var(--azul-genese)]" />
                  )}
                </motion.div>
                
                <div>
                  <h3 className="text-lg font-semibold text-[var(--branco-estelar)] mb-2">
                    {getStateText()}
                  </h3>
                  <p className="text-[var(--cinza-tatico-claro)] text-sm mb-4">
                    Drag and drop an image here, or click to select
                  </p>
                  
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isAnalyzing}
                    className="bg-[var(--azul-genese)] hover:bg-[var(--azul-genese)]/80 text-white"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Select Image
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Image Preview & Progress */}
          {selectedImage && (
            <div className="space-y-4">
              <div className="relative aspect-video rounded-lg overflow-hidden bg-[var(--azul-noite-profundo)]/50">
                <Image
                  src={selectedImage}
                  alt="Plant to analyze"
                  fill
                  className="object-cover"
                />
                {isAnalyzing && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-center space-y-3">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="mx-auto"
                      >
                        <Leaf className="w-8 h-8 text-[var(--verde-simbionte)]" />
                      </motion.div>
                      <p className="text-white text-sm font-medium">
                        {getStateText()}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {isAnalyzing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--cinza-tatico-claro)]">Analysis Progress</span>
                    <span className="text-[var(--branco-estelar)] font-medium">{Math.round(progress)}%</span>
                  </div>
                  <Progress 
                    value={progress} 
                    className={`h-2 bg-gray-700`}
                    style={{
                      '--progress-color': '#8AB4F8'
                    } as React.CSSProperties}
                  />
                </div>
              )}

              {!isAnalyzing && (
                <Button
                  onClick={resetAnalysis}
                  variant="outline"
                  size="sm"
                  className="border-[var(--azul-genese)]/30 text-[var(--azul-genese)] hover:bg-[var(--azul-genese)]/10"
                >
                  Try Another Image
                </Button>
              )}
            </div>
          )}

          {/* Analysis Results */}
          {analysisResult && !isAnalyzing && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              {analysisResult.error ? (
                <div className="bg-[var(--vermelho-apice)]/10 border border-[var(--vermelho-apice)]/30 rounded-lg p-4">
                  <div className="flex items-center">
                    <AlertTriangle className="w-5 h-5 text-[var(--vermelho-apice)] mr-2" />
                    <span className="text-[var(--vermelho-apice)] font-medium">
                      {analysisResult.error}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="bg-[var(--verde-simbionte)]/10 border border-[var(--verde-simbionte)]/30 rounded-lg p-4 space-y-3">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-[var(--verde-simbionte)] mr-2" />
                    <span className="text-[var(--verde-simbionte)] font-medium">
                      Analysis Complete
                    </span>
                  </div>
                  
                  {analysisResult.plantName && (
                    <div>
                      <h4 className="font-semibold text-[var(--branco-estelar)] mb-1">
                        Plant Identified: {analysisResult.plantName}
                      </h4>
                      {analysisResult.plantSpecies && (
                        <p className="text-sm text-[var(--cinza-tatico-claro)] italic">
                          {analysisResult.plantSpecies}
                        </p>
                      )}
                    </div>
                  )}
                  
                  {analysisResult.confidence && (
                    <div>
                      <span className="text-sm text-[var(--cinza-tatico-claro)]">
                        Confidence: {Math.round(analysisResult.confidence * 100)}%
                      </span>
                    </div>
                  )}

                  {analysisResult.healthStatus && (
                    <div>
                      <h4 className="font-semibold text-[var(--branco-estelar)] mb-1">
                        Health Status
                      </h4>
                      <p className="text-sm text-[var(--cinza-tatico-claro)]">
                        {analysisResult.healthStatus}
                      </p>
                    </div>
                  )}

                  {analysisResult.analysis && (
                    <div>
                      <h4 className="font-semibold text-[var(--branco-estelar)] mb-1">
                        Analysis
                      </h4>
                      <p className="text-sm text-[var(--cinza-tatico-claro)] whitespace-pre-wrap">
                        {analysisResult.analysis}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

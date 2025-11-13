
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf, Chrome, User, Mail, Lock, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { trackAuth } from "@/lib/analytics";

export default function SignInForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGuestLoading, setIsGuestLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid credentials");
        trackAuth("credentials", false);
      } else {
        trackAuth("credentials", true);
        router.replace("/explorator");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
      trackAuth("credentials", false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      await signIn("google", { callbackUrl: "/explorator" });
      trackAuth("google", true);
    } catch (error) {
      setError("Google sign-in failed");
      trackAuth("google", false);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setIsGuestLoading(true);
    try {
      const response = await fetch("/api/auth/guest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      
      if (response.ok) {
        const data = await response.json();
        const result = await signIn("credentials", {
          email: data.email,
          password: data.password,
          redirect: false,
        });
        
        if (!result?.error) {
          trackAuth("guest", true);
          router.replace("/explorator");
        } else {
          trackAuth("guest", false);
        }
      }
    } catch (error) {
      setError("Guest login failed");
      trackAuth("guest", false);
    } finally {
      setIsGuestLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-[var(--negro-vacuo)]/80 backdrop-blur-sm border-[var(--azul-genese)]/30 shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <motion.div
            className="mx-auto w-16 h-16 rounded-full bg-gradient-to-r from-[var(--azul-genese)] to-[var(--verde-simbionte)] flex items-center justify-center"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <Leaf className="w-8 h-8 text-white" />
          </motion.div>
          
          <div>
            <CardTitle className="text-3xl font-bold text-[var(--branco-estelar)] mb-2">
              ARBORIS AI OS 1
            </CardTitle>
            <CardDescription className="text-[var(--cinza-tatico-claro)] text-lg">
              Advanced Plant Intelligence System
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--azul-genese)] w-4 h-4" />
                <Input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-10 bg-[var(--azul-noite-profundo)]/50 border-[var(--azul-genese)]/30 text-[var(--branco-estelar)] placeholder-[var(--cinza-tatico-claro)] focus:border-[var(--azul-genese)] focus:ring-[var(--azul-genese)]"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--azul-genese)] w-4 h-4" />
                <Input
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-10 bg-[var(--azul-noite-profundo)]/50 border-[var(--azul-genese)]/30 text-[var(--branco-estelar)] placeholder-[var(--cinza-tatico-claro)] focus:border-[var(--azul-genese)] focus:ring-[var(--azul-genese)]"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="text-[var(--vermelho-apice)] text-sm text-center bg-[var(--vermelho-apice)]/10 p-2 rounded">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[var(--azul-genese)] hover:bg-[var(--azul-genese)]/80 text-white font-medium py-3 transition-all duration-200 hover:shadow-lg hover:shadow-[var(--azul-genese)]/25"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--cinza-tatico-escuro)]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[var(--negro-vacuo)] text-[var(--cinza-tatico-claro)]">Or continue with</span>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
              className="w-full border-[var(--verde-simbionte)]/30 bg-[var(--verde-simbionte)]/5 hover:bg-[var(--verde-simbionte)]/10 text-[var(--branco-estelar)] font-medium py-3 transition-all duration-200 hover:border-[var(--verde-simbionte)]/50"
            >
              {isGoogleLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Chrome className="w-4 h-4 mr-2" />
                  Continue with Google
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleGuestLogin}
              disabled={isGuestLoading}
              className="w-full border-[var(--magenta-exotico)]/30 bg-[var(--magenta-exotico)]/5 hover:bg-[var(--magenta-exotico)]/10 text-[var(--branco-estelar)] font-medium py-3 transition-all duration-200 hover:border-[var(--magenta-exotico)]/50"
            >
              {isGuestLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Guest Session...
                </>
              ) : (
                <>
                  <User className="w-4 h-4 mr-2" />
                  Continue as Guest
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

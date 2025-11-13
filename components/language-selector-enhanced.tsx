'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Check } from 'lucide-react';
import { useTranslations } from '@/lib/i18n/use-translations';
import { materialColors, elevation, shape, motion as motionTokens } from '@/lib/material-colors';
import { trackLanguageChange } from '@/lib/analytics';
import type { Locale } from '@/lib/i18n/config';

const languages = [
  { code: 'pt' as Locale, name: 'Português', flag: '🇧🇷', nativeName: 'Português' },
  { code: 'en' as Locale, name: 'English', flag: '🇺🇸', nativeName: 'English' },
  { code: 'es' as Locale, name: 'Spanish', flag: '🇪🇸', nativeName: 'Español' },
];

export function LanguageSelectorEnhanced() {
  const { locale, setLocale } = useTranslations();
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const currentLang = languages.find(lang => lang.code === locale) || languages[0];


  return (
    <div className="fixed top-4 right-4 z-50">
      <motion.div
        className="relative"
        onHoverStart={() => setIsOpen(true)}
        onHoverEnd={() => setIsOpen(false)}
      >
        {/* Main Button */}
        <motion.button
          className={`flex items-center gap-3 px-4 py-2.5 ${shape.full} ${elevation.level2} text-sm transition-all`}
          style={{
            backgroundColor: materialColors.surface.elevated2,
            color: materialColors.text.primary,
            border: `1px solid ${isOpen ? materialColors.primary.main : materialColors.divider}`,
          }}
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: motionTokens.duration.short4 / 1000 }}
          >
            <Globe className="w-5 h-5" style={{ color: materialColors.primary.main }} />
          </motion.div>
          <span className="text-xl">{currentLang.flag}</span>
          <span className="font-medium hidden sm:inline">{currentLang.nativeName}</span>
          <span className="font-medium sm:hidden">{currentLang.code.toUpperCase()}</span>
        </motion.button>

        {/* Dropdown Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: motionTokens.duration.short4 / 1000 }}
              className={`absolute top-full right-0 mt-2 ${shape.medium} ${elevation.level3} overflow-hidden`}
              style={{
                backgroundColor: materialColors.surface.elevated2,
                border: `1px solid ${materialColors.divider}`,
                minWidth: '220px',
              }}
            >
              {languages.map((lang, index) => {
                const isActive = lang.code === locale;
                
                return (
                  <motion.button
                    key={lang.code}
                    className="w-full flex items-center justify-between gap-3 px-5 py-3 text-sm transition-all"
                    style={{
                      backgroundColor: isActive ? materialColors.primary.container : 'transparent',
                      color: isActive ? materialColors.primary.main : materialColors.text.secondary,
                      borderBottom: index < languages.length - 1 ? `1px solid ${materialColors.divider}` : 'none',
                    }}
                    onClick={() => {
                      setLocale(lang.code);
                      trackLanguageChange(lang.code);
                      setIsOpen(false);
                    }}
                    whileHover={{
                      backgroundColor: materialColors.glass.light,
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{lang.flag}</span>
                      <div className="text-left">
                        <div className="font-medium">{lang.nativeName}</div>
                        <div className="text-xs" style={{ color: materialColors.text.disabled }}>
                          {lang.name}
                        </div>
                      </div>
                    </div>
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      >
                        <Check 
                          className="w-5 h-5"
                          style={{ color: materialColors.primary.main }}
                        />
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
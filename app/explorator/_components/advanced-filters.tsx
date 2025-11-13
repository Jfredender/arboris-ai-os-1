
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Calendar, Tag, TrendingUp, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { materialColors, typography } from '@/lib/material-colors';

export interface FilterCriteria {
  searchText?: string;
  categories?: string[];
  confidenceMin?: number;
  dateRange?: { start: Date; end: Date };
}

interface AdvancedFiltersProps {
  onApply: (filters: FilterCriteria) => void;
  onClose: () => void;
}

export default function AdvancedFilters({ onApply, onClose }: AdvancedFiltersProps) {
  const [searchText, setSearchText] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [confidenceMin, setConfidenceMin] = useState(0);

  const categories = ['Árvore', 'Arbusto', 'Erva', 'Flor', 'Suculenta', 'Aquática'];

  const handleApply = () => {
    const filters: FilterCriteria = {};
    
    if (searchText) filters.searchText = searchText;
    if (selectedCategories.length > 0) filters.categories = selectedCategories;
    if (confidenceMin > 0) filters.confidenceMin = confidenceMin;

    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    setSearchText('');
    setSelectedCategories([]);
    setConfidenceMin(0);
    onApply({});
    onClose();
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-[var(--md-surface-elevated2)] rounded-2xl p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className={`${typography.titleLarge}`}>Filtros Avançados</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Search Text */}
        <div className="mb-6">
          <label className={`${typography.bodyMedium} mb-2 flex items-center gap-2`}>
            <Search className="w-4 h-4 text-[var(--md-primary-main)]" />
            Buscar por nome
          </label>
          <Input
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Digite o nome da planta..."
            className="w-full"
          />
        </div>

        {/* Categories */}
        <div className="mb-6">
          <label className={`${typography.bodyMedium} mb-3 flex items-center gap-2`}>
            <Tag className="w-4 h-4 text-[var(--md-primary-main)]" />
            Categorias
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const isSelected = selectedCategories.includes(category);
              return (
                <Button
                  key={category}
                  variant={isSelected ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleCategory(category)}
                  className="transition-all"
                >
                  {category}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Confidence Range */}
        <div className="mb-6">
          <label className={`${typography.bodyMedium} mb-2 flex items-center gap-2`}>
            <TrendingUp className="w-4 h-4 text-[var(--md-primary-main)]" />
            Confiança mínima: {confidenceMin}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            step="10"
            value={confidenceMin}
            onChange={(e) => setConfidenceMin(Number(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-[var(--md-text-secondary)] mt-1">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleReset} className="flex-1">
            Limpar
          </Button>
          <Button onClick={handleApply} className="flex-1">
            Aplicar Filtros
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

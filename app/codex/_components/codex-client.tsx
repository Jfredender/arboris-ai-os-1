
'use client';

import { useState, useEffect } from 'react';
import { Session } from 'next-auth';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Search, 
  Filter, 
  Grid, 
  List,
  Plus,
  Eye,
  Clock,
  Tag,
  TrendingUp,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

interface CodexClientProps {
  session: Session;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  articleCount?: number;
}

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string;
  category: {
    name: string;
    color: string;
  };
  author: {
    name: string;
    image: string;
  };
  tags: string[];
  views: number;
  createdAt: string;
}

export default function CodexClient({ session }: CodexClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categories, setCategories] = useState<Category[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [selectedCategory]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load categories
      const categoriesRes = await fetch('/api/codex/categories');
      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData);
      }

      // Load articles
      const articlesRes = await fetch(
        selectedCategory === 'all' 
          ? '/api/codex/articles' 
          : `/api/codex/articles?category=${selectedCategory}`
      );
      if (articlesRes.ok) {
        const articlesData = await articlesRes.json();
        setArticles(articlesData);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[var(--preto-origem)]">
      {/* Header with Glassmorphism */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-[var(--preto-origem)]/80 border-b border-[var(--azul-genese)]/20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push('/dashboard')}
                className="hover:bg-[var(--azul-genese)]/10"
              >
                <ArrowLeft className="w-5 h-5 text-[var(--azul-genese)]" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-[var(--azul-genese)] to-[var(--roxo-genesis)] shadow-lg shadow-[var(--azul-genese)]/20">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-[var(--azul-genese)] via-[var(--roxo-genesis)] to-[var(--verde-simbionte)] bg-clip-text text-transparent">
                    CODEX BOTÂNICUS
                  </h1>
                  <p className="text-sm text-[var(--cinza-penumbra)]">
                    Biblioteca de Conhecimento Universal
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setViewMode('grid')}
                className={`${
                  viewMode === 'grid'
                    ? 'bg-[var(--azul-genese)]/20 border-[var(--azul-genese)]'
                    : 'border-[var(--cinza-penumbra)]/30'
                }`}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setViewMode('list')}
                className={`${
                  viewMode === 'list'
                    ? 'bg-[var(--azul-genese)]/20 border-[var(--azul-genese)]'
                    : 'border-[var(--cinza-penumbra)]/30'
                }`}
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                className="bg-gradient-to-r from-[var(--azul-genese)] to-[var(--roxo-genesis)] hover:shadow-lg hover:shadow-[var(--azul-genese)]/50 transition-all"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Artigo
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--cinza-penumbra)]" />
            <Input
              type="text"
              placeholder="Buscar conhecimento..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-6 bg-[var(--preto-vazio)]/50 border-[var(--azul-genese)]/30 focus:border-[var(--azul-genese)] text-white placeholder:text-[var(--cinza-penumbra)]"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 hover:bg-[var(--azul-genese)]/10"
            >
              <Filter className="w-5 h-5 text-[var(--azul-genese)]" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Categories */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="p-4 bg-gradient-to-br from-[var(--preto-vazio)]/50 to-[var(--preto-origem)]/30 backdrop-blur-xl border-[var(--azul-genese)]/20">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Filter className="w-5 h-5 text-[var(--azul-genese)]" />
                Categorias
              </h3>
              
              <button
                onClick={() => setSelectedCategory('all')}
                className={`w-full text-left px-4 py-3 rounded-lg mb-2 transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-gradient-to-r from-[var(--azul-genese)]/20 to-[var(--roxo-genesis)]/20 border-l-4 border-[var(--azul-genese)]'
                    : 'hover:bg-[var(--azul-genese)]/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium">Todas</span>
                  <span className="text-xs text-[var(--cinza-penumbra)]">
                    {articles.length}
                  </span>
                </div>
              </button>

              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.slug)}
                  className={`w-full text-left px-4 py-3 rounded-lg mb-2 transition-all ${
                    selectedCategory === category.slug
                      ? `bg-gradient-to-r from-[${category.color}]/20 to-[var(--roxo-genesis)]/20 border-l-4`
                      : 'hover:bg-[var(--azul-genese)]/10'
                  }`}
                  style={{
                    borderLeftColor: selectedCategory === category.slug ? category.color : 'transparent'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">{category.name}</span>
                    <span className="text-xs text-[var(--cinza-penumbra)]">
                      {category.articleCount || 0}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--cinza-penumbra)] mt-1 line-clamp-2">
                    {category.description}
                  </p>
                </button>
              ))}
            </Card>

            {/* Stats Card */}
            <Card className="p-4 bg-gradient-to-br from-[var(--preto-vazio)]/50 to-[var(--preto-origem)]/30 backdrop-blur-xl border-[var(--azul-genese)]/20">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[var(--verde-simbionte)]" />
                Estatísticas
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--cinza-penumbra)] text-sm">Total de Artigos</span>
                  <span className="text-white font-semibold">{articles.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--cinza-penumbra)] text-sm">Categorias</span>
                  <span className="text-white font-semibold">{categories.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--cinza-penumbra)] text-sm">Visualizações</span>
                  <span className="text-white font-semibold">
                    {articles.reduce((sum, a) => sum + a.views, 0)}
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* Articles Grid/List */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center gap-4">
                  <Sparkles className="w-12 h-12 text-[var(--azul-genese)] animate-pulse" />
                  <p className="text-[var(--cinza-penumbra)]">Carregando conhecimento...</p>
                </div>
              </div>
            ) : filteredArticles.length === 0 ? (
              <Card className="p-12 bg-gradient-to-br from-[var(--preto-vazio)]/50 to-[var(--preto-origem)]/30 backdrop-blur-xl border-[var(--azul-genese)]/20">
                <div className="flex flex-col items-center gap-4 text-center">
                  <BookOpen className="w-16 h-16 text-[var(--cinza-penumbra)]" />
                  <h3 className="text-xl font-semibold text-white">
                    Nenhum artigo encontrado
                  </h3>
                  <p className="text-[var(--cinza-penumbra)] max-w-md">
                    Não há artigos disponíveis nesta categoria ou que correspondam à sua busca.
                  </p>
                  <Button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                    }}
                    className="mt-4 bg-gradient-to-r from-[var(--azul-genese)] to-[var(--roxo-genesis)]"
                  >
                    Ver todos os artigos
                  </Button>
                </div>
              </Card>
            ) : (
              <div className={`${
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 gap-6'
                  : 'space-y-4'
              }`}>
                {filteredArticles.map((article, index) => (
                  <motion.div
                    key={article.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="group overflow-hidden bg-gradient-to-br from-[var(--preto-vazio)]/50 to-[var(--preto-origem)]/30 backdrop-blur-xl border-[var(--azul-genese)]/20 hover:border-[var(--azul-genese)]/60 transition-all hover:shadow-lg hover:shadow-[var(--azul-genese)]/20 cursor-pointer">
                      {viewMode === 'grid' ? (
                        <div onClick={() => router.push(`/codex/${article.slug}`)}>
                          {/* Cover Image */}
                          {article.coverImage && (
                            <div className="relative h-48 overflow-hidden">
                              <div 
                                className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-500"
                                style={{ backgroundImage: `url(${article.coverImage})` }}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-[var(--preto-origem)] via-transparent to-transparent" />
                              <div 
                                className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold text-white"
                                style={{ backgroundColor: article.category.color }}
                              >
                                {article.category.name}
                              </div>
                            </div>
                          )}

                          {/* Content */}
                          <div className="p-6">
                            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[var(--azul-genese)] transition-colors line-clamp-2">
                              {article.title}
                            </h3>
                            <p className="text-[var(--cinza-penumbra)] text-sm mb-4 line-clamp-3">
                              {article.excerpt}
                            </p>

                            {/* Tags */}
                            {article.tags.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-4">
                                {article.tags.slice(0, 3).map((tag) => (
                                  <span
                                    key={tag}
                                    className="px-2 py-1 rounded-md text-xs bg-[var(--azul-genese)]/10 text-[var(--azul-genese)] border border-[var(--azul-genese)]/30"
                                  >
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Footer */}
                            <div className="flex items-center justify-between pt-4 border-t border-[var(--cinza-penumbra)]/20">
                              <div className="flex items-center gap-2">
                                {article.author.image && (
                                  <div className="w-6 h-6 rounded-full overflow-hidden">
                                    <div
                                      className="w-full h-full bg-cover bg-center"
                                      style={{ backgroundImage: `url(${article.author.image})` }}
                                    />
                                  </div>
                                )}
                                <span className="text-xs text-[var(--cinza-penumbra)]">
                                  {article.author.name}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-[var(--cinza-penumbra)]">
                                <span className="flex items-center gap-1">
                                  <Eye className="w-3 h-3" />
                                  {article.views}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {new Date(article.createdAt).toLocaleDateString('pt-BR')}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div 
                          className="flex gap-4 p-4"
                          onClick={() => router.push(`/codex/${article.slug}`)}
                        >
                          {/* Thumbnail */}
                          {article.coverImage && (
                            <div className="relative w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden">
                              <div
                                className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-500"
                                style={{ backgroundImage: `url(${article.coverImage})` }}
                              />
                            </div>
                          )}

                          {/* Content */}
                          <div className="flex-1">
                            <div 
                              className="inline-block px-2 py-1 rounded-full text-xs font-semibold text-white mb-2"
                              style={{ backgroundColor: article.category.color }}
                            >
                              {article.category.name}
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[var(--azul-genese)] transition-colors">
                              {article.title}
                            </h3>
                            <p className="text-[var(--cinza-penumbra)] text-sm mb-3 line-clamp-2">
                              {article.excerpt}
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {article.author.image && (
                                  <div className="w-6 h-6 rounded-full overflow-hidden">
                                    <div
                                      className="w-full h-full bg-cover bg-center"
                                      style={{ backgroundImage: `url(${article.author.image})` }}
                                    />
                                  </div>
                                )}
                                <span className="text-xs text-[var(--cinza-penumbra)]">
                                  {article.author.name}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-[var(--cinza-penumbra)]">
                                <span className="flex items-center gap-1">
                                  <Eye className="w-3 h-3" />
                                  {article.views}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {new Date(article.createdAt).toLocaleDateString('pt-BR')}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

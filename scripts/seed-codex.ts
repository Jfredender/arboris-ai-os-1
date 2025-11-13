
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedCodex() {
  console.log('🌱 Seeding Codex data...');

  // Create categories
  const categories = [
    {
      name: 'Identificação de Plantas',
      slug: 'identificacao',
      description: 'Guias completos para identificação de espécies vegetais',
      icon: '🔍',
      color: '#00F5A0'
    },
    {
      name: 'Cuidados e Manutenção',
      slug: 'cuidados',
      description: 'Melhores práticas para saúde e crescimento',
      icon: '🌿',
      color: '#00D9FF'
    },
    {
      name: 'Doenças e Pragas',
      slug: 'doencas',
      description: 'Diagnóstico e tratamento de problemas comuns',
      icon: '🐛',
      color: '#FF6B6B'
    },
    {
      name: 'Botânica Avançada',
      slug: 'botanica',
      description: 'Conhecimento científico aprofundado',
      icon: '🔬',
      color: '#9D4EDD'
    },
    {
      name: 'Sustentabilidade',
      slug: 'sustentabilidade',
      description: 'Práticas ecológicas e conservação',
      icon: '🌍',
      color: '#06FFA5'
    }
  ];

  for (const cat of categories) {
    await prisma.codexCategory.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat
    });
  }

  // Get or create admin user
  let adminUser = await prisma.user.findFirst({
    where: { email: 'guest@arboris.ai' }
  });

  if (!adminUser) {
    // Try to find any user
    adminUser = await prisma.user.findFirst();
    
    if (!adminUser) {
      // Create a default user for seeding
      adminUser = await prisma.user.create({
        data: {
          email: 'guest@arboris.ai',
          name: 'ARBORIS Guest',
          role: 'user'
        }
      });
    }
  }

  // Create sample articles
  const identCategory = await prisma.codexCategory.findUnique({
    where: { slug: 'identificacao' }
  });

  const cuidadosCategory = await prisma.codexCategory.findUnique({
    where: { slug: 'cuidados' }
  });

  if (identCategory && cuidadosCategory) {
    const articles = [
      {
        title: 'Guia Completo: Identificação de Plantas Nativas Brasileiras',
        slug: 'guia-identificacao-plantas-nativas',
        excerpt: 'Aprenda a identificar as principais espécies de plantas nativas do Brasil através de características morfológicas, habitat e distribuição geográfica.',
        content: `# Guia Completo: Identificação de Plantas Nativas Brasileiras

## Introdução

A flora brasileira é uma das mais ricas e diversificadas do planeta, com mais de 46.000 espécies catalogadas. Este guia oferece uma introdução prática para identificação de plantas nativas.

## Características Morfológicas

### Folhas
- **Forma**: Observe se as folhas são simples ou compostas
- **Margem**: Pode ser lisa, serrilhada ou lobada
- **Nervação**: Padrão das veias nas folhas

### Flores
- **Simetria**: Radial ou bilateral
- **Número de pétalas**: Importante para classificação
- **Cor**: Indicador de polinizadores

### Frutos
- **Tipo**: Carnoso ou seco
- **Dispersão**: Por animais, vento ou água

## Principais Famílias

### Fabaceae (Leguminosas)
Características marcantes:
- Folhas compostas
- Frutos do tipo vagem
- Fixação de nitrogênio

### Myrtaceae
- Folhas aromáticas
- Flores com muitos estames
- Frutos tipo baga

## Ferramentas de Identificação

1. **Chaves Dicotômicas**: Método tradicional
2. **Aplicativos Mobile**: ARBORIS AI Probe
3. **Herbários**: Consulta especializada

## Conservação

É fundamental registrar e proteger nossas espécies nativas. Use a identificação como ferramenta de conservação.`,
        coverImage: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=800',
        categoryId: identCategory.id,
        authorId: adminUser.id,
        tags: ['identificação', 'nativas', 'brasil', 'morfologia'],
        isPublished: true
      },
      {
        title: 'Calendário Anual de Cuidados com Plantas Ornamentais',
        slug: 'calendario-cuidados-ornamentais',
        excerpt: 'Um guia sazonal completo para manter suas plantas ornamentais saudáveis durante todo o ano, com dicas específicas para cada estação.',
        content: `# Calendário Anual de Cuidados com Plantas Ornamentais

## Primavera (Setembro - Novembro)

### Atividades Principais
- 🌱 **Plantio**: Época ideal para novas mudas
- ✂️ **Poda**: Remover galhos secos do inverno
- 💧 **Rega**: Aumentar frequência gradualmente
- 🌿 **Adubação**: Fertilizante NPK 10-10-10

### Espécies em Destaque
- Rosas
- Azaleias
- Begônias

## Verão (Dezembro - Fevereiro)

### Cuidados Intensivos
- 💦 **Rega**: 2-3 vezes ao dia em dias quentes
- ☀️ **Proteção**: Sombrite para espécies sensíveis
- 🐛 **Monitoramento**: Vigilância contra pragas
- 🌊 **Drenagem**: Evitar encharcamento

### Atenção Especial
- Hidratação de folhagens
- Controle de fungos
- Mulching para retenção de umidade

## Outono (Março - Maio)

### Preparação para Inverno
- 🍂 **Limpeza**: Remoção de folhas secas
- 🌱 **Divisão**: Plantas perenes
- 💧 **Redução de Rega**: Gradualmente
- 🌿 **Adubação Orgânica**: Compostagem

## Inverno (Junho - Agosto)

### Manutenção Reduzida
- ❄️ **Proteção**: Geadas em regiões frias
- 💧 **Rega Mínima**: Apenas quando necessário
- 🌱 **Planejamento**: Próxima temporada
- ✂️ **Poda de Formação**: Árvores e arbustos

## Dicas Gerais

### Observação Diária
- Verifique sinais de estresse
- Monitore pragas e doenças
- Ajuste cuidados conforme necessário

### Ferramentas Essenciais
- Tesoura de poda afiada
- Regador com bico fino
- Termômetro de solo
- Medidor de pH`,
        coverImage: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800',
        categoryId: cuidadosCategory.id,
        authorId: adminUser.id,
        tags: ['cuidados', 'ornamentais', 'calendário', 'sazonal'],
        isPublished: true
      }
    ];

    for (const article of articles) {
      await prisma.codexArticle.upsert({
        where: { slug: article.slug },
        update: {},
        create: article
      });
    }
  }

  console.log('✅ Codex data seeded successfully!');
}

seedCodex()
  .catch((e) => {
    console.error('❌ Error seeding Codex:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


'use client';

import { useState } from 'react';
import { ChevronRight, ChevronDown, CheckCircle2, AlertCircle, Circle } from 'lucide-react';
import { typography } from '@/lib/material-colors';

// Structure Tab
export function StructureTab({
  expandedFolders,
  toggleFolder,
}: {
  expandedFolders: Set<string>;
  toggleFolder: (folder: string) => void;
}) {
  const structure = {
    'nextjs_space': {
      'app': {
        'admin': ['checklist', 'vulcano'],
        'api': [
          'analyze-health',
          'analyze-plant',
          'auth',
          'chat',
          'codex',
          'export',
          'notifications',
          'preferences',
          'probe',
          'share',
          'signup',
        ],
        'auth/signin': ['_components', 'page.tsx'],
        'codex': ['_components', 'page.tsx'],
        'community': ['_components', 'page.tsx'],
        'dashboard': ['_components', 'page.tsx', 'loading.tsx'],
        'explorator': ['_components', 'page.tsx', 'loading.tsx'],
        'history': ['_components', 'page.tsx', 'loading.tsx'],
        'probe': ['_components', 'page.tsx'],
        'share/[id]': ['page.tsx'],
        files: ['globals.css', 'layout.tsx', 'page.tsx'],
      },
      'components': {
        'ui': ['45+ shadcn components'],
        files: [
          'google-analytics.tsx',
          'language-selector-enhanced.tsx',
          'notifications-panel.tsx',
          'providers.tsx',
          'theme-provider.tsx',
        ],
      },
      'hooks': [
        'use-camera.ts',
        'use-device-sensors-enhanced.ts',
        'use-device-sensors.ts',
        'use-ml-intelligence.ts',
        'use-toast.ts',
      ],
      'lib': {
        'i18n': ['config.ts', 'index.ts', 'translations.ts', 'use-translations.tsx'],
        files: [
          'analytics.ts',
          'auth-options.ts',
          'aws-config.ts',
          'db.ts',
          'gemini.ts',
          'image-optimizer.ts',
          'material-colors.ts',
          'ml-cache.ts',
          'ml-local.ts',
          's3.ts',
          'types.ts',
          'utils.ts',
        ],
      },
      'prisma': ['schema.prisma'],
      'public': ['favicon.svg', 'manifest.json', 'og-image.png', 'robots.txt', 'sw.js'],
      'scripts': ['seed-codex.ts', 'seed.ts'],
      files: [
        'next.config.js',
        'package.json',
        'postcss.config.js',
        'tailwind.config.ts',
        'tsconfig.json',
      ],
    },
  };

  return (
    <div className="space-y-6">
      <div className="md-card-elevated">
        <h2 className={`${typography.headlineMedium} mb-4`}>📂 Estrutura do Projeto</h2>
        <p className={`${typography.bodyLarge} text-[var(--md-text-secondary)] mb-6`}>
          Arquitetura completa do ARBORIS AI OS 1
        </p>

        <div className="space-y-2">
          <FolderItem
            name="nextjs_space"
            isExpanded={expandedFolders.has('nextjs_space')}
            onToggle={() => toggleFolder('nextjs_space')}
            level={0}
          >
            <FolderItem
              name="app"
              isExpanded={expandedFolders.has('app')}
              onToggle={() => toggleFolder('app')}
              level={1}
            >
              <FolderItem name="admin" level={2} count="2 folders" />
              <FolderItem name="api" level={2} count="11 routes" />
              <FolderItem name="auth/signin" level={2} count="2 files" />
              <FolderItem name="codex" level={2} count="2 files" />
              <FolderItem name="community" level={2} count="2 files" />
              <FolderItem name="dashboard" level={2} count="3 files" />
              <FolderItem name="explorator" level={2} count="3 files" />
              <FolderItem name="history" level={2} count="3 files" />
              <FolderItem name="probe" level={2} count="2 files" />
              <FileItem name="globals.css" level={2} />
              <FileItem name="layout.tsx" level={2} />
              <FileItem name="page.tsx" level={2} />
            </FolderItem>

            <FolderItem name="components" level={1} count="50+ files" />
            <FolderItem name="hooks" level={1} count="5 files" />
            <FolderItem name="lib" level={1} count="15+ files" />
            <FolderItem name="prisma" level={1} count="1 file" />
            <FolderItem name="public" level={1} count="5 files" />
            <FolderItem name="scripts" level={1} count="2 files" />
          </FolderItem>
        </div>
      </div>

      <div className="md-card-elevated">
        <h3 className={`${typography.titleLarge} mb-4`}>📊 Estatísticas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total de Arquivos" value="106" />
          <StatCard label="Componentes React" value="45+" />
          <StatCard label="API Routes" value="15+" />
          <StatCard label="Hooks Customizados" value="5" />
        </div>
      </div>
    </div>
  );
}

// Components Tab
export function ComponentsTab({ searchQuery }: { searchQuery: string }) {
  const components = [
    {
      name: 'ExploratorMain',
      path: 'app/explorator/_components/explorator-main.tsx',
      description: 'Core scanner interface with camera, ML, and sensors integration',
      props: ['session', 'preferences'],
      status: 'active',
    },
    {
      name: 'SensorPanel',
      path: 'app/explorator/_components/sensor-panel.tsx',
      description: 'Device sensors display (GPS, gyroscope, light)',
      props: ['isOpen', 'onClose'],
      status: 'active',
    },
    {
      name: 'MLSettings',
      path: 'app/explorator/_components/ml-settings.tsx',
      description: 'Local ML model management and offline capabilities',
      props: ['isOpen', 'onClose'],
      status: 'active',
    },
    {
      name: 'HealthResultDisplay',
      path: 'app/explorator/_components/health-result-display.tsx',
      description: 'Medical analysis results visualization',
      props: ['result', 'onClose'],
      status: 'active',
    },
    {
      name: 'DashboardClient',
      path: 'app/dashboard/_components/dashboard-client.tsx',
      description: 'Main dashboard interface with Material Design 3',
      props: ['session'],
      status: 'active',
    },
    {
      name: 'PlantAnalysisCard',
      path: 'app/dashboard/_components/plant-analysis-card.tsx',
      description: 'Plant analysis interface with Gemini Vision',
      props: ['userId'],
      status: 'active',
    },
    {
      name: 'ChatInterfaceCard',
      path: 'app/dashboard/_components/chat-interface-card.tsx',
      description: 'AI chat system with streaming responses',
      props: ['userId'],
      status: 'active',
    },
    {
      name: 'ChecklistClient',
      path: 'app/admin/checklist/_components/checklist-client.tsx',
      description: 'Administrative verification checklist system',
      props: ['session'],
      status: 'active',
    },
  ];

  const filtered = components.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="md-card-elevated">
        <h2 className={`${typography.headlineMedium} mb-4`}>🧩 Componentes Principais</h2>
        <p className={`${typography.bodyLarge} text-[var(--md-text-secondary)] mb-6`}>
          {filtered.length} componentes encontrados
        </p>

        <div className="space-y-4">
          {filtered.map((component) => (
            <div
              key={component.name}
              className="p-4 rounded-lg bg-[var(--md-surface-elevated1)] border border-[var(--md-divider)]"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className={`${typography.titleMedium} text-[var(--md-primary-main)] mb-1`}>
                    {component.name}
                  </h3>
                  <p className={`${typography.bodySmall} text-[var(--md-text-secondary)]`}>
                    {component.path}
                  </p>
                </div>
                <CheckCircle2 className="w-5 h-5 text-[var(--md-success)] flex-shrink-0" />
              </div>
              <p className={`${typography.bodyMedium} mb-3`}>{component.description}</p>
              <div className="flex flex-wrap gap-2">
                {component.props.map((prop) => (
                  <span
                    key={prop}
                    className="px-2 py-1 rounded text-xs bg-[var(--md-primary-container)] text-[var(--md-primary-main)]"
                  >
                    {prop}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// APIs Tab
export function APIsTab({ searchQuery }: { searchQuery: string }) {
  const apis = [
    {
      route: '/api/analyze-plant',
      method: 'POST',
      description: 'Botanical analysis using Google Gemini Vision',
      auth: true,
      request: '{ image: File, userId: string }',
      response: 'Analysis with species, health, recommendations',
    },
    {
      route: '/api/analyze-health',
      method: 'POST',
      description: 'Medical diagnosis with differential analysis',
      auth: true,
      request: '{ symptoms: string[], image?: File }',
      response: 'Diagnosis, prescriptions, professional recommendations',
    },
    {
      route: '/api/chat',
      method: 'POST',
      description: 'Streaming AI chat with Gemini Pro',
      auth: true,
      request: '{ message: string, history: Message[] }',
      response: 'Streaming text response',
    },
    {
      route: '/api/preferences',
      method: 'GET/POST',
      description: 'User preference management',
      auth: true,
      request: '{ preferences: JSON }',
      response: 'User preferences object',
    },
    {
      route: '/api/probe/history',
      method: 'GET',
      description: 'User analysis history retrieval',
      auth: true,
      request: '{}',
      response: 'Array of PlantAnalysis objects',
    },
    {
      route: '/api/auth/[...nextauth]',
      method: 'ALL',
      description: 'NextAuth authentication endpoints',
      auth: false,
      request: 'Various auth flows',
      response: 'Session/user data',
    },
    {
      route: '/api/notifications',
      method: 'GET/POST',
      description: 'User notification management',
      auth: true,
      request: '{ notification: object }',
      response: 'Notifications array',
    },
    {
      route: '/api/codex/articles',
      method: 'GET',
      description: 'Botanical knowledge base articles',
      auth: false,
      request: '{ category?: string }',
      response: 'Articles array',
    },
  ];

  const filtered = apis.filter(
    (api) =>
      api.route.toLowerCase().includes(searchQuery.toLowerCase()) ||
      api.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="md-card-elevated">
        <h2 className={`${typography.headlineMedium} mb-4`}>🔌 API Routes</h2>
        <p className={`${typography.bodyLarge} text-[var(--md-text-secondary)] mb-6`}>
          {filtered.length} endpoints disponíveis
        </p>

        <div className="space-y-4">
          {filtered.map((api) => (
            <div
              key={api.route}
              className="p-4 rounded-lg bg-[var(--md-surface-elevated1)] border border-[var(--md-divider)]"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-bold ${
                      api.method === 'POST'
                        ? 'bg-[var(--md-secondary-container)] text-[var(--md-secondary-main)]'
                        : api.method === 'GET'
                        ? 'bg-[var(--md-primary-container)] text-[var(--md-primary-main)]'
                        : 'bg-[var(--md-surface-elevated2)] text-[var(--md-text-secondary)]'
                    }`}
                  >
                    {api.method}
                  </span>
                  <code className={`${typography.labelLarge} text-[var(--md-primary-main)]`}>
                    {api.route}
                  </code>
                </div>
                {api.auth && (
                  <span className="text-xs px-2 py-1 rounded bg-[var(--md-warning)] text-[var(--md-surface-base)]">
                    🔒 AUTH
                  </span>
                )}
              </div>
              <p className={`${typography.bodyMedium} mb-3`}>{api.description}</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className={`${typography.labelSmall} text-[var(--md-text-secondary)] mb-1`}>
                    Request
                  </div>
                  <code className={`${typography.bodySmall} block p-2 rounded bg-[var(--md-surface-elevated2)]`}>
                    {api.request}
                  </code>
                </div>
                <div>
                  <div className={`${typography.labelSmall} text-[var(--md-text-secondary)] mb-1`}>
                    Response
                  </div>
                  <code className={`${typography.bodySmall} block p-2 rounded bg-[var(--md-surface-elevated2)]`}>
                    {api.response}
                  </code>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Resources Tab - System Resource Map
export function ResourcesTab() {
  return (
    <div className="space-y-6">
      <div className="md-card-elevated">
        <h2 className={`${typography.headlineMedium} mb-4`}>🗺️ Mapa de Recursos do Sistema</h2>
        <p className={`${typography.bodyLarge} text-[var(--md-text-secondary)] mb-6`}>
          Status de todos os recursos e funcionalidades do ARBORIS AI
        </p>

        <div className="space-y-6">
          <ResourceGroup
            title="📸 SISTEMA DE ANÁLISE BOTÂNICA"
            resources={[
              { name: 'Identificação de Plantas (Gemini Vision)', status: 'active' },
              { name: 'Análise de Saúde Vegetal', status: 'active' },
              { name: 'Recomendações de Cuidado', status: 'active' },
              { name: 'Histórico de Scans', status: 'active' },
              { name: 'Exportação de Dados (CSV/JSON)', status: 'active' },
            ]}
          />

          <ResourceGroup
            title="🏥 SISTEMA DE ANÁLISE MÉDICA"
            resources={[
              { name: 'Diagnóstico por Sintomas', status: 'active' },
              { name: 'Análise Diferencial', status: 'active' },
              { name: 'Recomendações de Tratamento', status: 'active' },
              { name: 'Base de Profissionais', status: 'active' },
              { name: 'Alertas de Emergência', status: 'active' },
            ]}
          />

          <ResourceGroup
            title="🎯 SENSORES DE DISPOSITIVO"
            resources={[
              { name: 'GPS/Localização', status: 'active' },
              { name: 'Giroscópio/Orientação', status: 'active' },
              { name: 'Luz Ambiente', status: 'active' },
              { name: 'Acelerômetro', status: 'active' },
              { name: 'Magnetômetro', status: 'experimental' },
            ]}
          />

          <ResourceGroup
            title="🤖 ML & INTELIGÊNCIA"
            resources={[
              { name: 'Gemini Pro Vision (Cloud)', status: 'active' },
              { name: 'Cache Local (IndexedDB)', status: 'active' },
              { name: 'Análise Offline (Simulada)', status: 'active' },
              { name: 'Modelos On-Device', status: 'future' },
            ]}
          />

          <ResourceGroup
            title="💬 SISTEMA DE CHAT"
            resources={[
              { name: 'Gemini Pro Chat', status: 'active' },
              { name: 'Streaming Responses', status: 'active' },
              { name: 'Histórico de Conversas', status: 'active' },
              { name: 'Context Management', status: 'active' },
            ]}
          />

          <ResourceGroup
            title="🎨 INTERFACE & UX"
            resources={[
              { name: 'Material Design 3', status: 'active' },
              { name: 'Dark Theme (Google)', status: 'active' },
              { name: 'Animações Framer Motion', status: 'active' },
              { name: 'Responsivo Mobile-First', status: 'active' },
              { name: 'i18n (PT/EN/ES)', status: 'active' },
            ]}
          />

          <ResourceGroup
            title="🔐 AUTENTICAÇÃO"
            resources={[
              { name: 'NextAuth (Email/Password)', status: 'active' },
              { name: 'Google SSO', status: 'active' },
              { name: 'Guest Mode', status: 'active' },
              { name: 'Session Management', status: 'active' },
            ]}
          />

          <ResourceGroup
            title="💾 ARMAZENAMENTO"
            resources={[
              { name: 'PostgreSQL (Prisma)', status: 'active' },
              { name: 'User Preferences', status: 'active' },
              { name: 'Analysis History', status: 'active' },
              { name: 'Chat Messages', status: 'active' },
              { name: 'Health Records', status: 'active' },
            ]}
          />

          <ResourceGroup
            title="📊 ANALYTICS"
            resources={[
              { name: 'Google Analytics GA4', status: 'active' },
              { name: 'Event Tracking', status: 'active' },
              { name: 'Web Vitals Monitoring', status: 'active' },
              { name: 'Error Logging', status: 'active' },
            ]}
          />

          <ResourceGroup
            title="🌐 DEPLOYMENT"
            resources={[
              { name: 'Next.js 14 App Router', status: 'active' },
              { name: 'Vercel/Abacus.AI Ready', status: 'active' },
              { name: 'Custom Domain Support', status: 'active' },
              { name: 'Environment Management', status: 'active' },
            ]}
          />
        </div>
      </div>
    </div>
  );
}

function ResourceGroup({
  title,
  resources,
}: {
  title: string;
  resources: Array<{ name: string; status: 'active' | 'inactive' | 'experimental' | 'future' }>;
}) {
  return (
    <div className="p-4 rounded-lg bg-[var(--md-surface-elevated1)] border border-[var(--md-divider)]">
      <h3 className={`${typography.titleMedium} mb-3`}>{title}</h3>
      <div className="space-y-2">
        {resources.map((resource) => (
          <div key={resource.name} className="flex items-center justify-between">
            <span className={typography.bodyMedium}>{resource.name}</span>
            <span
              className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs ${
                resource.status === 'active'
                  ? 'bg-[var(--md-success)]/20 text-[var(--md-success)]'
                  : resource.status === 'experimental'
                  ? 'bg-[var(--md-warning)]/20 text-[var(--md-warning)]'
                  : resource.status === 'future'
                  ? 'bg-[var(--md-info)]/20 text-[var(--md-info)]'
                  : 'bg-[var(--md-error)]/20 text-[var(--md-error)]'
              }`}
            >
              {resource.status === 'active' ? (
                <>
                  <CheckCircle2 className="w-3 h-3" />
                  ATIVO
                </>
              ) : resource.status === 'experimental' ? (
                <>
                  <AlertCircle className="w-3 h-3" />
                  EXPERIMENTAL
                </>
              ) : resource.status === 'future' ? (
                <>
                  <Circle className="w-3 h-3" />
                  FUTURO
                </>
              ) : (
                <>
                  <Circle className="w-3 h-3" />
                  INATIVO
                </>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Design System Tab
export function DesignSystemTab() {
  return (
    <div className="space-y-6">
      <div className="md-card-elevated">
        <h2 className={`${typography.headlineMedium} mb-4`}>🎨 Material Design 3</h2>
        <p className={`${typography.bodyLarge} text-[var(--md-text-secondary)] mb-6`}>
          Sistema de design completo baseado no Google Material Design 3
        </p>

        {/* Color System */}
        <div className="mb-8">
          <h3 className={`${typography.titleLarge} mb-4`}>Color Tokens</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ColorSwatch name="Primary" color="var(--md-primary-main)" hex="#8AB4F8" />
            <ColorSwatch name="Secondary" color="var(--md-secondary-main)" hex="#81C995" />
            <ColorSwatch name="Error" color="var(--md-error)" hex="#F28B82" />
            <ColorSwatch name="Warning" color="var(--md-warning)" hex="#FDD663" />
            <ColorSwatch name="Success" color="var(--md-success)" hex="#81C995" />
            <ColorSwatch name="Info" color="var(--md-info)" hex="#8AB4F8" />
          </div>
        </div>

        {/* Typography */}
        <div className="mb-8">
          <h3 className={`${typography.titleLarge} mb-4`}>Typography Scale</h3>
          <div className="space-y-3">
            <TypeExample type="Display Large" className={typography.displayLarge} />
            <TypeExample type="Headline Medium" className={typography.headlineMedium} />
            <TypeExample type="Title Large" className={typography.titleLarge} />
            <TypeExample type="Body Large" className={typography.bodyLarge} />
            <TypeExample type="Label Medium" className={typography.labelMedium} />
          </div>
        </div>

        {/* Elevation */}
        <div>
          <h3 className={`${typography.titleLarge} mb-4`}>Elevation System</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <ElevationCard level="Level 1" className="shadow-md" />
            <ElevationCard level="Level 2" className="shadow-lg" />
            <ElevationCard level="Level 3" className="shadow-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ColorSwatch({ name, color, hex }: { name: string; color: string; hex: string }) {
  return (
    <div>
      <div
        className="w-full h-20 rounded-lg mb-2 border border-[var(--md-divider)]"
        style={{ backgroundColor: color }}
      />
      <div className={typography.labelMedium}>{name}</div>
      <div className={`${typography.bodySmall} text-[var(--md-text-secondary)]`}>{hex}</div>
    </div>
  );
}

function TypeExample({ type, className }: { type: string; className: string }) {
  return (
    <div className="p-3 rounded-lg bg-[var(--md-surface-elevated1)]">
      <div className={`${typography.labelSmall} text-[var(--md-text-secondary)] mb-1`}>{type}</div>
      <div className={className}>The quick brown fox jumps over the lazy dog</div>
    </div>
  );
}

function ElevationCard({ level, className }: { level: string; className: string }) {
  return (
    <div className={`p-6 rounded-lg bg-[var(--md-surface-elevated1)] ${className}`}>
      <div className={typography.titleSmall}>{level}</div>
    </div>
  );
}

// Config Tab
export function ConfigTab() {
  return (
    <div className="space-y-6">
      <div className="md-card-elevated">
        <h2 className={`${typography.headlineMedium} mb-4`}>⚙️ Configurações do Sistema</h2>
        <p className={`${typography.bodyLarge} text-[var(--md-text-secondary)] mb-6`}>
          Variáveis de ambiente e integrações ativas
        </p>

        <div className="space-y-6">
          <ConfigSection
            title="🔑 APIs Configuradas"
            items={[
              { key: 'GOOGLE_GEMINI_API_KEY', status: 'configured', description: 'Google Gemini AI' },
              { key: 'NEXTAUTH_SECRET', status: 'configured', description: 'Authentication secret' },
              { key: 'NEXTAUTH_URL', status: 'configured', description: 'Base URL for auth' },
              { key: 'GOOGLE_CLIENT_ID', status: 'configured', description: 'Google OAuth' },
              { key: 'GOOGLE_CLIENT_SECRET', status: 'configured', description: 'Google OAuth secret' },
            ]}
          />

          <ConfigSection
            title="💾 Database"
            items={[
              { key: 'DATABASE_URL', status: 'configured', description: 'PostgreSQL connection' },
              { key: 'Prisma ORM', status: 'active', description: 'Type-safe database client' },
            ]}
          />

          <ConfigSection
            title="📊 Analytics"
            items={[
              {
                key: 'NEXT_PUBLIC_GA_MEASUREMENT_ID',
                status: 'configured',
                description: 'Google Analytics GA4',
              },
            ]}
          />

          <ConfigSection
            title="🌐 Deployment"
            items={[
              { key: 'Hostname', status: 'configured', description: 'arboris.abacusai.app' },
              { key: 'Environment', status: 'production', description: 'Next.js 14 App Router' },
            ]}
          />
        </div>
      </div>
    </div>
  );
}

function ConfigSection({
  title,
  items,
}: {
  title: string;
  items: Array<{ key: string; status: string; description: string }>;
}) {
  return (
    <div className="p-4 rounded-lg bg-[var(--md-surface-elevated1)] border border-[var(--md-divider)]">
      <h3 className={`${typography.titleMedium} mb-3`}>{title}</h3>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.key} className="flex items-center justify-between p-2 rounded bg-[var(--md-surface-elevated2)]">
            <div>
              <div className={`${typography.labelMedium} font-mono`}>{item.key}</div>
              <div className={`${typography.bodySmall} text-[var(--md-text-secondary)]`}>
                {item.description}
              </div>
            </div>
            <span className="px-2 py-1 rounded text-xs bg-[var(--md-success)]/20 text-[var(--md-success)]">
              {item.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Deployment Tab
export function DeploymentTab() {
  return (
    <div className="space-y-6">
      <div className="md-card-elevated">
        <h2 className={`${typography.headlineMedium} mb-4`}>🚀 Processo de Deployment</h2>
        <p className={`${typography.bodyLarge} text-[var(--md-text-secondary)] mb-6`}>
          Guia completo de build, teste e deploy
        </p>

        <div className="space-y-6">
          <DeploymentStep
            number={1}
            title="Build & Compile"
            description="Compilar TypeScript e gerar bundle de produção"
            commands={['cd nextjs_space', 'yarn build']}
          />

          <DeploymentStep
            number={2}
            title="Database Migration"
            description="Aplicar schema do Prisma e seed de dados"
            commands={['yarn prisma generate', 'yarn prisma db push', 'yarn prisma db seed']}
          />

          <DeploymentStep
            number={3}
            title="Environment Variables"
            description="Verificar todas as variáveis necessárias"
            commands={[
              'GOOGLE_GEMINI_API_KEY',
              'DATABASE_URL',
              'NEXTAUTH_SECRET',
              'NEXTAUTH_URL',
              'GOOGLE_CLIENT_ID',
              'GOOGLE_CLIENT_SECRET',
            ]}
          />

          <DeploymentStep
            number={4}
            title="Deploy to Production"
            description="Deploy via Abacus.AI platform"
            commands={['Platform handles build automatically', 'Custom domain: arboris.ai']}
          />

          <DeploymentStep
            number={5}
            title="Post-Deploy Verification"
            description="Verificar funcionalidades críticas"
            commands={[
              'Test authentication flow',
              'Test camera permissions',
              'Test Gemini API integration',
              'Verify database connections',
            ]}
          />
        </div>
      </div>

      <div className="md-card-elevated">
        <h3 className={`${typography.titleLarge} mb-4`}>📝 Rollback Procedure</h3>
        <ol className="space-y-2 list-decimal list-inside">
          <li className={typography.bodyMedium}>Access Abacus.AI console</li>
          <li className={typography.bodyMedium}>Navigate to deployment history</li>
          <li className={typography.bodyMedium}>Select previous stable checkpoint</li>
          <li className={typography.bodyMedium}>Click "Restore" to rollback</li>
        </ol>
      </div>
    </div>
  );
}

function DeploymentStep({
  number,
  title,
  description,
  commands,
}: {
  number: number;
  title: string;
  description: string;
  commands: string[];
}) {
  return (
    <div className="p-4 rounded-lg bg-[var(--md-surface-elevated1)] border border-[var(--md-divider)]">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--md-primary-main)] text-[var(--md-surface-base)] flex items-center justify-center font-bold">
          {number}
        </div>
        <div className="flex-1">
          <h4 className={`${typography.titleMedium} mb-1`}>{title}</h4>
          <p className={`${typography.bodyMedium} text-[var(--md-text-secondary)] mb-3`}>
            {description}
          </p>
          <div className="space-y-1">
            {commands.map((cmd, idx) => (
              <code
                key={idx}
                className={`block p-2 rounded bg-[var(--md-surface-elevated2)] ${typography.bodySmall} font-mono`}
              >
                {cmd}
              </code>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper components
function FolderItem({
  name,
  isExpanded,
  onToggle,
  level,
  count,
  children,
}: {
  name: string;
  isExpanded?: boolean;
  onToggle?: () => void;
  level: number;
  count?: string;
  children?: React.ReactNode;
}) {
  const hasChildren = !!children;
  const paddingLeft = level * 20;

  return (
    <div>
      <div
        className={`flex items-center gap-2 py-2 px-3 rounded hover:bg-[var(--md-surface-elevated1)] cursor-pointer`}
        style={{ paddingLeft: `${paddingLeft}px` }}
        onClick={hasChildren ? onToggle : undefined}
      >
        {hasChildren ? (
          isExpanded ? (
            <ChevronDown className="w-4 h-4 text-[var(--md-text-secondary)]" />
          ) : (
            <ChevronRight className="w-4 h-4 text-[var(--md-text-secondary)]" />
          )
        ) : (
          <div className="w-4" />
        )}
        <span className={`${typography.bodyMedium} text-[var(--md-primary-main)]`}>📁 {name}</span>
        {count && (
          <span className={`${typography.bodySmall} text-[var(--md-text-secondary)] ml-auto`}>
            {count}
          </span>
        )}
      </div>
      {hasChildren && isExpanded && <div>{children}</div>}
    </div>
  );
}

function FileItem({ name, level }: { name: string; level: number }) {
  const paddingLeft = level * 20 + 24;

  return (
    <div
      className={`flex items-center gap-2 py-2 px-3 rounded hover:bg-[var(--md-surface-elevated1)]`}
      style={{ paddingLeft: `${paddingLeft}px` }}
    >
      <span className={`${typography.bodyMedium} text-[var(--md-text-secondary)]`}>📄 {name}</span>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4 rounded-lg bg-[var(--md-primary-container)] border border-[var(--md-primary-main)]">
      <div className="text-2xl font-bold text-[var(--md-primary-main)] mb-1">{value}</div>
      <div className={`${typography.bodySmall} text-[var(--md-text-secondary)]`}>{label}</div>
    </div>
  );
}

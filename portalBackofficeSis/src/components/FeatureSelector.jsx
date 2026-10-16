import { useState } from 'react';
import { ChevronDown, ChevronRight, Check } from 'lucide-react';

// Estrutura completa de funcionalidades organizadas por categoria
const FEATURE_CATEGORIES = [
  {
    id: 'tickets',
    name: 'Gestão de Tickets',
    icon: '🎫',
    features: [
      { key: 'tickets_basic', label: 'Tickets Básicos', description: 'Criação e gestão básica de tickets' },
      { key: 'tickets_advanced', label: 'Tickets Avançados', description: 'Merge, transfer, relationships' },
      { key: 'tickets_approval', label: 'Sistema de Aprovação', description: 'Workflow de aprovação de tickets' },
      { key: 'tickets_internal_notes', label: 'Notas Internas', description: 'Notas privadas em tickets' },
      { key: 'tickets_watchers', label: 'Observadores', description: 'Sistema de watchers' },
      { key: 'tickets_custom_fields', label: 'Campos Personalizados', description: 'Campos customizados' },
      { key: 'tickets_bulk_actions', label: 'Ações em Massa', description: 'Operações em lote' }
    ]
  },
  {
    id: 'communication',
    name: 'Comunicação',
    icon: '💬',
    features: [
      { key: 'email_integration', label: 'Integração Email', description: 'IMAP/SMTP integration' },
      { key: 'email_templates', label: 'Templates de Email', description: 'Templates personalizados' },
      { key: 'comments', label: 'Comentários', description: 'Sistema de comentários' },
      { key: 'attachments', label: 'Anexos', description: 'Upload de arquivos' },
      { key: 'notifications', label: 'Notificações', description: 'Sistema de notificações' },
      { key: 'notifications_email', label: 'Notificações por Email', description: 'Alertas por email' },
      { key: 'notifications_in_app', label: 'Notificações In-App', description: 'Alertas no sistema' }
    ]
  },
  {
    id: 'knowledge',
    name: 'Base de Conhecimento',
    icon: '📚',
    features: [
      { key: 'knowledge_base', label: 'Base de Conhecimento', description: 'Sistema de artigos' },
      { key: 'knowledge_categories', label: 'Categorias', description: 'Organização por categorias' },
      { key: 'knowledge_search', label: 'Busca', description: 'Busca em artigos' },
      { key: 'knowledge_public', label: 'Artigos Públicos', description: 'Artigos para clientes' },
      { key: 'knowledge_internal', label: 'Artigos Internos', description: 'Artigos privados' }
    ]
  },
  {
    id: 'catalog',
    name: 'Catálogo de Serviços',
    icon: '📋',
    features: [
      { key: 'service_catalog', label: 'Catálogo de Serviços', description: 'Catálogo completo' },
      { key: 'catalog_categories', label: 'Categorias', description: 'Organização do catálogo' },
      { key: 'catalog_items', label: 'Itens', description: 'Itens do catálogo' },
      { key: 'catalog_requests', label: 'Solicitações', description: 'Requests via catálogo' },
      { key: 'catalog_approval_workflow', label: 'Workflow de Aprovação', description: 'Aprovações automáticas' },
      { key: 'catalog_access_control', label: 'Controle de Acesso', description: 'Acesso por cliente' }
    ]
  },
  {
    id: 'sla',
    name: 'SLA',
    icon: '⏱️',
    features: [
      { key: 'sla_management', label: 'Gestão de SLA', description: 'Configuração de SLAs' },
      { key: 'sla_tracking', label: 'Rastreamento', description: 'Tracking de SLA' },
      { key: 'sla_alerts', label: 'Alertas', description: 'Alertas de violação' },
      { key: 'sla_reports', label: 'Relatórios', description: 'Reports de SLA' },
      { key: 'sla_business_hours', label: 'Horário Comercial', description: 'Business hours' }
    ]
  },
  {
    id: 'users',
    name: 'Gestão de Usuários',
    icon: '👥',
    features: [
      { key: 'users_management', label: 'Gestão de Usuários', description: 'CRUD de usuários' },
      { key: 'users_roles', label: 'Roles e Permissões', description: 'Sistema RBAC' },
      { key: 'users_departments', label: 'Departamentos', description: 'Organização por departamento' },
      { key: 'users_directions', label: 'Direções', description: 'Direções organizacionais' },
      { key: 'users_sections', label: 'Seções', description: 'Seções de trabalho' },
      { key: 'users_hierarchy', label: 'Hierarquia', description: 'Estrutura hierárquica' }
    ]
  },
  {
    id: 'clients',
    name: 'Clientes B2B',
    icon: '🏢',
    features: [
      { key: 'clients_management', label: 'Gestão de Clientes', description: 'CRUD de clientes' },
      { key: 'clients_users', label: 'Usuários de Clientes', description: 'Gestão de users' },
      { key: 'clients_portal', label: 'Portal do Cliente', description: 'Portal dedicado' },
      { key: 'clients_hierarchy', label: 'Hierarquia', description: 'Estrutura de clientes' },
      { key: 'clients_contracts', label: 'Contratos', description: 'Gestão de contratos' }
    ]
  },
  {
    id: 'reports',
    name: 'Relatórios e Analytics',
    icon: '📊',
    features: [
      { key: 'reports_basic', label: 'Relatórios Básicos', description: 'Reports simples' },
      { key: 'reports_advanced', label: 'Relatórios Avançados', description: 'Reports complexos' },
      { key: 'reports_custom', label: 'Relatórios Personalizados', description: 'Custom reports' },
      { key: 'reports_export', label: 'Exportação', description: 'Export PDF/Excel' },
      { key: 'reports_scheduling', label: 'Agendamento', description: 'Reports agendados' },
      { key: 'analytics_dashboard', label: 'Dashboard Analytics', description: 'Dashboards interativos' },
      { key: 'analytics_realtime', label: 'Analytics Tempo Real', description: 'Dados em tempo real' }
    ]
  },
  {
    id: 'automation',
    name: 'Automação',
    icon: '🤖',
    features: [
      { key: 'automation_rules', label: 'Regras de Automação', description: 'Rules engine' },
      { key: 'automation_triggers', label: 'Triggers', description: 'Event triggers' },
      { key: 'automation_workflows', label: 'Workflows', description: 'Workflow automation' },
      { key: 'automation_macros', label: 'Macros', description: 'Ações rápidas' },
      { key: 'automation_scheduled_tasks', label: 'Tarefas Agendadas', description: 'Scheduled jobs' }
    ]
  },
  {
    id: 'time',
    name: 'Gestão de Tempo',
    icon: '⏰',
    features: [
      { key: 'time_tracking', label: 'Rastreamento de Tempo', description: 'Time tracking' },
      { key: 'time_entries', label: 'Lançamento de Horas', description: 'Time entries' },
      { key: 'hours_bank', label: 'Bolsa de Horas', description: 'Hours bank' },
      { key: 'hours_reports', label: 'Relatórios de Horas', description: 'Time reports' },
      { key: 'hours_billing', label: 'Faturamento de Horas', description: 'Billable hours' }
    ]
  },
  {
    id: 'inventory',
    name: 'Inventário de Ativos',
    icon: '💻',
    features: [
      { key: 'inventory_management', label: 'Gestão de Inventário', description: 'Asset management' },
      { key: 'inventory_assets', label: 'Ativos de TI', description: 'IT assets' },
      { key: 'inventory_tracking', label: 'Rastreamento', description: 'Asset tracking' },
      { key: 'inventory_reports', label: 'Relatórios', description: 'Inventory reports' },
      { key: 'inventory_auto_discovery', label: 'Descoberta Automática', description: 'Auto-discovery' }
    ]
  },
  {
    id: 'remote',
    name: 'Acesso Remoto',
    icon: '🖥️',
    features: [
      { key: 'remote_access', label: 'Acesso Remoto', description: 'Remote access' },
      { key: 'remote_desktop', label: 'Desktop Remoto', description: 'Remote desktop' },
      { key: 'remote_support', label: 'Suporte Remoto', description: 'Remote support' },
      { key: 'remote_audit', label: 'Auditoria', description: 'Access audit' }
    ]
  },
  {
    id: 'integrations',
    name: 'Integrações',
    icon: '🔌',
    features: [
      { key: 'api_access', label: 'Acesso à API', description: 'REST API' },
      { key: 'api_webhooks', label: 'Webhooks', description: 'Event webhooks' },
      { key: 'integrations_slack', label: 'Slack', description: 'Slack integration' },
      { key: 'integrations_teams', label: 'Teams', description: 'MS Teams integration' },
      { key: 'integrations_jira', label: 'Jira', description: 'Jira integration' },
      { key: 'integrations_custom', label: 'Integrações Personalizadas', description: 'Custom integrations' }
    ]
  },
  {
    id: 'security',
    name: 'Segurança e Auditoria',
    icon: '🔒',
    features: [
      { key: 'audit_logs', label: 'Logs de Auditoria', description: 'Audit trail' },
      { key: 'security_2fa', label: '2FA', description: 'Two-factor auth' },
      { key: 'security_ip_whitelist', label: 'IP Whitelist', description: 'IP restrictions' },
      { key: 'security_session_management', label: 'Gestão de Sessões', description: 'Session control' },
      { key: 'security_rbac', label: 'RBAC', description: 'Role-based access' },
      { key: 'security_data_encryption', label: 'Criptografia', description: 'Data encryption' }
    ]
  },
  {
    id: 'customization',
    name: 'Personalização',
    icon: '🎨',
    features: [
      { key: 'white_label', label: 'White Label', description: 'Marca própria' },
      { key: 'custom_branding', label: 'Branding Personalizado', description: 'Custom branding' },
      { key: 'custom_domain', label: 'Domínio Personalizado', description: 'Custom domain' },
      { key: 'custom_themes', label: 'Temas Personalizados', description: 'Custom themes' },
      { key: 'custom_fields', label: 'Campos Personalizados', description: 'Custom fields' },
      { key: 'custom_statuses', label: 'Status Personalizados', description: 'Custom statuses' }
    ]
  },
  {
    id: 'priorities',
    name: 'Prioridades e Tipos',
    icon: '🏷️',
    features: [
      { key: 'priorities_management', label: 'Gestão de Prioridades', description: 'Priority management' },
      { key: 'types_management', label: 'Gestão de Tipos', description: 'Type management' },
      { key: 'priorities_custom', label: 'Prioridades Personalizadas', description: 'Custom priorities' },
      { key: 'types_custom', label: 'Tipos Personalizados', description: 'Custom types' }
    ]
  },
  {
    id: 'tags',
    name: 'Tags e Categorização',
    icon: '🏷️',
    features: [
      { key: 'tags_management', label: 'Gestão de Tags', description: 'Tag management' },
      { key: 'tags_auto_tagging', label: 'Auto-tagging', description: 'Automatic tagging' },
      { key: 'categories_management', label: 'Gestão de Categorias', description: 'Category management' }
    ]
  },
  {
    id: 'templates',
    name: 'Templates',
    icon: '📝',
    features: [
      { key: 'templates_tickets', label: 'Templates de Tickets', description: 'Ticket templates' },
      { key: 'templates_responses', label: 'Templates de Respostas', description: 'Response templates' },
      { key: 'templates_email', label: 'Templates de Email', description: 'Email templates' },
      { key: 'templates_custom', label: 'Templates Personalizados', description: 'Custom templates' }
    ]
  },
  {
    id: 'gamification',
    name: 'Gamificação',
    icon: '🎮',
    features: [
      { key: 'gamification', label: 'Sistema de Gamificação', description: 'Gamification system' },
      { key: 'gamification_badges', label: 'Badges', description: 'Achievements' },
      { key: 'gamification_points', label: 'Sistema de Pontos', description: 'Points system' },
      { key: 'gamification_leaderboard', label: 'Ranking', description: 'Leaderboard' }
    ]
  },
  {
    id: 'status_page',
    name: 'Status Page',
    icon: '📡',
    features: [
      { key: 'status_page', label: 'Página de Status', description: 'Status page' },
      { key: 'status_incidents', label: 'Gestão de Incidentes', description: 'Incident management' },
      { key: 'status_maintenance', label: 'Manutenções', description: 'Maintenance windows' },
      { key: 'status_notifications', label: 'Notificações', description: 'Status notifications' }
    ]
  },
  {
    id: 'multi_tenant',
    name: 'Multi-Tenant',
    icon: '🏗️',
    features: [
      { key: 'multi_tenant', label: 'Multi-Tenant', description: 'Multi-tenancy support' },
      { key: 'multi_organization', label: 'Múltiplas Organizações', description: 'Multiple orgs' },
      { key: 'multi_context', label: 'Múltiplos Contextos', description: 'Context switching' },
      { key: 'tenant_isolation', label: 'Isolamento de Dados', description: 'Data isolation' }
    ]
  },
  {
    id: 'support',
    name: 'Suporte',
    icon: '🆘',
    features: [
      { key: 'support_priority', label: 'Suporte Prioritário', description: 'Priority support' },
      { key: 'support_dedicated', label: 'Suporte Dedicado', description: 'Dedicated support' },
      { key: 'support_24x7', label: 'Suporte 24/7', description: '24/7 support' },
      { key: 'support_phone', label: 'Suporte por Telefone', description: 'Phone support' },
      { key: 'support_chat', label: 'Chat de Suporte', description: 'Live chat' }
    ]
  },
  {
    id: 'projects',
    name: 'Projetos e Tarefas',
    icon: '📁',
    features: [
      { key: 'projects_management', label: 'Gestão de Projetos', description: 'Project management' },
      { key: 'tasks_management', label: 'Gestão de Tarefas', description: 'Task management' },
      { key: 'tasks_collaboration', label: 'Colaboração', description: 'Team collaboration' },
      { key: 'tasks_tracking', label: 'Rastreamento', description: 'Task tracking' }
    ]
  },
  {
    id: 'billing',
    name: 'Pagamentos e Faturamento',
    icon: '💳',
    features: [
      { key: 'billing_management', label: 'Gestão de Faturamento', description: 'Billing management' },
      { key: 'billing_invoices', label: 'Faturas', description: 'Invoice generation' },
      { key: 'billing_payments', label: 'Pagamentos', description: 'Payment processing' },
      { key: 'billing_subscriptions', label: 'Assinaturas', description: 'Subscription management' }
    ]
  }
];

const FeatureSelector = ({ selectedFeatures = {}, onChange }) => {
  const [expandedCategories, setExpandedCategories] = useState({});
  const [selectAllMode, setSelectAllMode] = useState(false);

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const handleFeatureChange = (featureKey, checked) => {
    onChange({
      ...selectedFeatures,
      [featureKey]: checked
    });
  };

  const handleCategoryToggle = (category, checked) => {
    const updates = {};
    category.features.forEach(feature => {
      updates[feature.key] = checked;
    });
    onChange({
      ...selectedFeatures,
      ...updates
    });
  };

  const handleSelectAll = () => {
    const allFeatures = {};
    FEATURE_CATEGORIES.forEach(category => {
      category.features.forEach(feature => {
        allFeatures[feature.key] = true;
      });
    });
    onChange(allFeatures);
    setSelectAllMode(true);
  };

  const handleDeselectAll = () => {
    const allFeatures = {};
    FEATURE_CATEGORIES.forEach(category => {
      category.features.forEach(feature => {
        allFeatures[feature.key] = false;
      });
    });
    onChange(allFeatures);
    setSelectAllMode(false);
  };

  const getCategoryStats = (category) => {
    const total = category.features.length;
    const selected = category.features.filter(f => selectedFeatures[f.key]).length;
    return { total, selected };
  };

  const totalFeatures = FEATURE_CATEGORIES.reduce((sum, cat) => sum + cat.features.length, 0);
  const selectedCount = Object.values(selectedFeatures).filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Header com estatísticas */}
      <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Funcionalidades do Sistema
          </h3>
          <div className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
            {selectedCount} / {totalFeatures} selecionadas
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSelectAll}
            className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
          >
            Selecionar Todas
          </button>
          <button
            type="button"
            onClick={handleDeselectAll}
            className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            Desmarcar Todas
          </button>
        </div>
      </div>

      {/* Lista de categorias */}
      <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
        {FEATURE_CATEGORIES.map(category => {
          const { total, selected } = getCategoryStats(category);
          const isExpanded = expandedCategories[category.id];
          const allSelected = selected === total;
          const someSelected = selected > 0 && selected < total;

          return (
            <div key={category.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              {/* Category Header */}
              <div className="bg-gray-50 dark:bg-gray-800 p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <button
                      type="button"
                      onClick={() => toggleCategory(category.id)}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5" />
                      ) : (
                        <ChevronRight className="w-5 h-5" />
                      )}
                    </button>
                    <span className="text-2xl">{category.icon}</span>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {category.name}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {selected} de {total} selecionadas
                      </p>
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={input => {
                        if (input) input.indeterminate = someSelected;
                      }}
                      onChange={(e) => handleCategoryToggle(category, e.target.checked)}
                      className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {allSelected ? 'Todas' : someSelected ? 'Algumas' : 'Nenhuma'}
                    </span>
                  </label>
                </div>
              </div>

              {/* Category Features */}
              {isExpanded && (
                <div className="p-3 space-y-2 bg-white dark:bg-gray-900">
                  {category.features.map(feature => (
                    <label
                      key={feature.key}
                      className="flex items-start gap-3 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                    >
                      <div className="relative flex items-center justify-center mt-0.5">
                        <input
                          type="checkbox"
                          checked={selectedFeatures[feature.key] || false}
                          onChange={(e) => handleFeatureChange(feature.key, e.target.checked)}
                          className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                        />
                        {selectedFeatures[feature.key] && (
                          <Check className="w-3 h-3 text-white absolute pointer-events-none" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-gray-900 dark:text-white">
                          {feature.label}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {feature.description}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FeatureSelector;

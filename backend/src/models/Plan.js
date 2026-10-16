import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Plan = sequelize.define('Plan', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      len: [2, 50]
    },
    comment: 'Nome do plano (starter, professional, enterprise)'
  },
  displayName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'display_name',
    comment: 'Nome de exibição (Iniciante, Profissional, Empresarial)'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Descrição detalhada do plano'
  },
  // Preços
  monthlyPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    field: 'monthly_price',
    comment: 'Preço mensal em euros'
  },
  yearlyPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    field: 'yearly_price',
    comment: 'Preço anual (com desconto)'
  },
  currency: {
    type: DataTypes.STRING(3),
    allowNull: false,
    defaultValue: 'EUR',
    comment: 'Moeda do preço (EUR, USD, BRL, AOA, etc.)'
  },
  // Limites de recursos
  maxUsers: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 10,
    field: 'max_users',
    comment: 'Máximo de usuários da organização'
  },
  maxClients: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 50,
    field: 'max_clients',
    comment: 'Máximo de clientes'
  },
  maxTicketsPerMonth: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'max_tickets_per_month',
    comment: 'Limite de tickets por mês (null = ilimitado)'
  },
  maxStorageGB: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 5,
    field: 'max_storage_gb',
    comment: 'Limite de armazenamento em GB'
  },
  maxAttachmentSizeMB: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 10,
    field: 'max_attachment_size_mb',
    comment: 'Tamanho máximo de anexos em MB'
  },
  // Features disponíveis (flags booleanas) - ESTRUTURA COMPLETA
  features: {
    type: DataTypes.JSONB,
    defaultValue: {
      // === GESTÃO DE TICKETS ===
      tickets_basic: true,
      tickets_advanced: false,
      tickets_approval: false,
      tickets_internal_notes: true,
      tickets_watchers: false,
      tickets_custom_fields: false,
      tickets_bulk_actions: false,

      // === COMUNICAÇÃO ===
      email_integration: true,
      email_templates: false,
      comments: true,
      attachments: true,
      notifications: true,
      notifications_email: true,
      notifications_in_app: true,

      // === BASE DE CONHECIMENTO ===
      knowledge_base: false,
      knowledge_categories: false,
      knowledge_search: false,
      knowledge_public: false,
      knowledge_internal: false,

      // === CATÁLOGO DE SERVIÇOS ===
      service_catalog: false,
      catalog_categories: false,
      catalog_items: false,
      catalog_requests: false,
      catalog_approval_workflow: false,
      catalog_access_control: false,

      // === SLA ===
      sla_management: false,
      sla_tracking: false,
      sla_alerts: false,
      sla_reports: false,
      sla_business_hours: false,

      // === GESTÃO DE USUÁRIOS ===
      users_management: true,
      users_roles: true,
      users_departments: false,
      users_directions: false,
      users_sections: false,
      users_hierarchy: false,

      // === CLIENTES B2B ===
      clients_management: true,
      clients_users: true,
      clients_portal: true,
      clients_hierarchy: false,
      clients_contracts: false,

      // === RELATÓRIOS E ANALYTICS ===
      reports_basic: false,
      reports_advanced: false,
      reports_custom: false,
      reports_export: false,
      reports_scheduling: false,
      analytics_dashboard: false,
      analytics_realtime: false,

      // === AUTOMAÇÃO ===
      automation_rules: false,
      automation_triggers: false,
      automation_workflows: false,
      automation_macros: false,
      automation_scheduled_tasks: false,

      // === GESTÃO DE TEMPO ===
      time_tracking: false,
      time_entries: false,
      hours_bank: false,
      hours_reports: false,
      hours_billing: false,

      // === INVENTÁRIO DE ATIVOS ===
      inventory_management: false,
      inventory_assets: false,
      inventory_tracking: false,
      inventory_reports: false,
      inventory_auto_discovery: false,

      // === ACESSO REMOTO ===
      remote_access: false,
      remote_desktop: false,
      remote_support: false,
      remote_audit: false,

      // === INTEGRAÇÕES ===
      api_access: false,
      api_webhooks: false,
      integrations_slack: false,
      integrations_teams: false,
      integrations_jira: false,
      integrations_custom: false,

      // === SEGURANÇA E AUDITORIA ===
      audit_logs: false,
      security_2fa: false,
      security_ip_whitelist: false,
      security_session_management: true,
      security_rbac: true,
      security_data_encryption: true,

      // === PERSONALIZAÇÃO ===
      white_label: false,
      custom_branding: false,
      custom_domain: false,
      custom_themes: false,
      custom_fields: false,
      custom_statuses: false,

      // === PRIORIDADES E TIPOS ===
      priorities_management: true,
      types_management: true,
      priorities_custom: false,
      types_custom: false,

      // === TAGS E CATEGORIZAÇÃO ===
      tags_management: false,
      tags_auto_tagging: false,
      categories_management: true,

      // === TEMPLATES ===
      templates_tickets: false,
      templates_responses: false,
      templates_email: false,
      templates_custom: false,

      // === GAMIFICAÇÃO ===
      gamification: false,
      gamification_badges: false,
      gamification_points: false,
      gamification_leaderboard: false,

      // === STATUS PAGE ===
      status_page: false,
      status_incidents: false,
      status_maintenance: false,
      status_notifications: false,

      // === MULTI-TENANT ===
      multi_tenant: true,
      multi_organization: false,
      multi_context: true,
      tenant_isolation: true,

      // === SUPORTE ===
      support_priority: false,
      support_dedicated: false,
      support_24x7: false,
      support_phone: false,
      support_chat: false,

      // === PROJETOS E TAREFAS ===
      projects_management: false,
      tasks_management: false,
      tasks_collaboration: false,
      tasks_tracking: false,

      // === PAGAMENTOS E FATURAMENTO ===
      billing_management: false,
      billing_invoices: false,
      billing_payments: false,
      billing_subscriptions: false
    },
    comment: 'Features habilitadas no plano (controle granular de funcionalidades)'
  },
  // Features em texto livre (para exibição na landing page)
  featuresText: {
    type: DataTypes.JSONB,
    defaultValue: [],
    field: 'features_text',
    comment: 'Lista de funcionalidades em texto para exibição'
  },
  // Trial
  trialDays: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 14,
    field: 'trial_days',
    comment: 'Dias de trial gratuito'
  },
  // Status
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active',
    comment: 'Se o plano está ativo para novas contratações'
  },
  isDefault: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_default',
    comment: 'Se é o plano padrão para novos signups'
  },
  // Ordem de exibição
  sortOrder: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'sort_order',
    comment: 'Ordem de exibição nos planos'
  }
}, {
  tableName: 'plans',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['name'], unique: true },
    { fields: ['is_active'] },
    { fields: ['is_default'] },
    { fields: ['sort_order'] }
  ]
});

export default Plan;

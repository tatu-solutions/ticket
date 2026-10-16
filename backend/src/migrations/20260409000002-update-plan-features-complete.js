/**
 * Migration: Atualizar estrutura de features dos planos
 * 
 * Adiciona todas as funcionalidades do sistema ao campo features dos planos
 * para permitir controle granular de acesso por plano
 */

export async function up(queryInterface, Sequelize) {
  const transaction = await queryInterface.sequelize.transaction();
  
  try {
    console.log('🔄 Atualizando estrutura de features dos planos...');

    // Definir estrutura completa de features
    const defaultFeatures = {
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
    };

    // Buscar todos os planos existentes
    const plans = await queryInterface.sequelize.query(
      'SELECT id, name, features FROM plans',
      { type: Sequelize.QueryTypes.SELECT, transaction }
    );

    console.log(`📋 Encontrados ${plans.length} planos para atualizar`);

    // Atualizar cada plano mantendo features existentes e adicionando novas
    for (const plan of plans) {
      const currentFeatures = plan.features || {};
      const updatedFeatures = { ...defaultFeatures, ...currentFeatures };

      await queryInterface.sequelize.query(
        'UPDATE plans SET features = :features WHERE id = :id',
        {
          replacements: {
            id: plan.id,
            features: JSON.stringify(updatedFeatures)
          },
          transaction
        }
      );

      console.log(`✅ Plano "${plan.name}" atualizado com ${Object.keys(updatedFeatures).length} features`);
    }

    await transaction.commit();
    console.log('✅ Migration concluída com sucesso!');
  } catch (error) {
    await transaction.rollback();
    console.error('❌ Erro na migration:', error);
    throw error;
  }
}

export async function down(queryInterface, Sequelize) {
  const transaction = await queryInterface.sequelize.transaction();
  
  try {
    console.log('🔄 Revertendo features dos planos para estrutura antiga...');

    // Estrutura antiga simplificada
    const oldFeatures = {
      basicTicketing: true,
      emailIntegration: true,
      knowledgeBase: false,
      slaManagement: false,
      reporting: false,
      automation: false,
      apiAccess: false,
      whiteLabel: false,
      prioritySupport: false,
      customFields: false,
      workflows: false,
      integrations: false
    };

    await queryInterface.sequelize.query(
      'UPDATE plans SET features = :features',
      {
        replacements: {
          features: JSON.stringify(oldFeatures)
        },
        transaction
      }
    );

    await transaction.commit();
    console.log('✅ Rollback concluído!');
  } catch (error) {
    await transaction.rollback();
    console.error('❌ Erro no rollback:', error);
    throw error;
  }
}

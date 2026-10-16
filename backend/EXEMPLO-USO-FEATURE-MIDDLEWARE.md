# Exemplo de Uso: Middleware de Validação de Features

## 📋 Visão Geral

Este documento mostra como proteger rotas do sistema usando o middleware `requireFeature` para validar se a organização tem acesso às funcionalidades baseado no plano de assinatura.

## 🔧 Importação

```javascript
import { requireFeature, requireResourceLimit, attachPlanInfo } from '../middleware/requireFeature.js';
import { authenticate } from '../middleware/auth.js';
```

## 📚 Exemplos de Uso

### 1. Proteger Rota com Feature Única

```javascript
// routes/knowledgeRoutes.js
import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { requireFeature } from '../middleware/requireFeature.js';
import knowledgeController from '../controllers/knowledgeController.js';

const router = express.Router();

// Requer a feature 'knowledge_base'
router.get('/articles',
  authenticate,
  requireFeature('knowledge_base'),
  knowledgeController.getArticles
);

router.post('/articles',
  authenticate,
  requireFeature('knowledge_base'),
  knowledgeController.createArticle
);

export default router;
```

### 2. Proteger com Múltiplas Features (Todas Requeridas)

```javascript
// routes/automationRoutes.js
router.post('/workflows',
  authenticate,
  requireFeature(['automation_workflows', 'automation_rules']),
  automationController.createWorkflow
);

// Requer automation_workflows E automation_rules
```

### 3. Proteger com Múltiplas Features (Pelo Menos Uma)

```javascript
// routes/reportRoutes.js
router.get('/reports',
  authenticate,
  requireFeature(['reports_basic', 'reports_advanced'], { requireAll: false }),
  reportController.getReports
);

// Requer reports_basic OU reports_advanced
```

### 4. Verificar Limites de Recursos

```javascript
// routes/userRoutes.js
import OrganizationUser from '../models/OrganizationUser.js';

router.post('/users',
  authenticate,
  requireResourceLimit('maxUsers', async (req) => {
    // Retorna a contagem atual de usuários
    return await OrganizationUser.count({
      where: { organizationId: req.user.organizationId }
    });
  }),
  userController.createUser
);
```

### 5. Adicionar Informações do Plano ao Request

```javascript
// routes/dashboardRoutes.js
router.get('/dashboard',
  authenticate,
  attachPlanInfo,
  (req, res) => {
    // req.planInfo contém informações do plano
    res.json({
      dashboard: getDashboardData(),
      plan: req.planInfo // Informações do plano disponíveis
    });
  }
);
```

## 🎯 Aplicação em Módulos Específicos

### Base de Conhecimento

```javascript
// routes/knowledgeRoutes.js
router.get('/articles', 
  authenticate, 
  requireFeature('knowledge_base'),
  knowledgeController.getArticles
);

router.get('/articles/search', 
  authenticate, 
  requireFeature('knowledge_search'),
  knowledgeController.searchArticles
);

router.get('/articles/public', 
  requireFeature('knowledge_public'),
  knowledgeController.getPublicArticles
);
```

### Catálogo de Serviços

```javascript
// routes/catalogRoutes.js
router.get('/catalog', 
  authenticate, 
  requireFeature('service_catalog'),
  catalogController.getCatalog
);

router.post('/catalog/requests', 
  authenticate, 
  requireFeature(['service_catalog', 'catalog_requests']),
  catalogController.createRequest
);

router.post('/catalog/requests/:id/approve', 
  authenticate, 
  requireFeature('catalog_approval_workflow'),
  catalogController.approveRequest
);
```

### SLA

```javascript
// routes/slaRoutes.js
router.get('/sla', 
  authenticate, 
  requireFeature('sla_management'),
  slaController.getSLAs
);

router.get('/sla/tracking', 
  authenticate, 
  requireFeature('sla_tracking'),
  slaController.getTracking
);

router.get('/sla/reports', 
  authenticate, 
  requireFeature('sla_reports'),
  slaController.getReports
);
```

### Relatórios

```javascript
// routes/reportRoutes.js
router.get('/reports/basic', 
  authenticate, 
  requireFeature('reports_basic'),
  reportController.getBasicReports
);

router.get('/reports/advanced', 
  authenticate, 
  requireFeature('reports_advanced'),
  reportController.getAdvancedReports
);

router.post('/reports/custom', 
  authenticate, 
  requireFeature('reports_custom'),
  reportController.createCustomReport
);

router.post('/reports/schedule', 
  authenticate, 
  requireFeature('reports_scheduling'),
  reportController.scheduleReport
);
```

### Automação

```javascript
// routes/automationRoutes.js
router.post('/automation/rules', 
  authenticate, 
  requireFeature('automation_rules'),
  automationController.createRule
);

router.post('/automation/workflows', 
  authenticate, 
  requireFeature('automation_workflows'),
  automationController.createWorkflow
);

router.post('/automation/macros', 
  authenticate, 
  requireFeature('automation_macros'),
  automationController.createMacro
);
```

### Gestão de Tempo

```javascript
// routes/timeTrackingRoutes.js
router.post('/time/entries', 
  authenticate, 
  requireFeature('time_tracking'),
  timeController.createEntry
);

router.get('/time/reports', 
  authenticate, 
  requireFeature('hours_reports'),
  timeController.getReports
);

router.post('/time/billing', 
  authenticate, 
  requireFeature('hours_billing'),
  timeController.generateBilling
);
```

### Inventário

```javascript
// routes/inventoryRoutes.js
router.get('/inventory/assets', 
  authenticate, 
  requireFeature('inventory_management'),
  inventoryController.getAssets
);

router.post('/inventory/discover', 
  authenticate, 
  requireFeature('inventory_auto_discovery'),
  inventoryController.autoDiscover
);
```

### Acesso Remoto

```javascript
// routes/remoteAccessRoutes.js
router.post('/remote/sessions', 
  authenticate, 
  requireFeature('remote_access'),
  remoteController.createSession
);

router.get('/remote/audit', 
  authenticate, 
  requireFeature('remote_audit'),
  remoteController.getAuditLogs
);
```

### Integrações

```javascript
// routes/integrationRoutes.js
router.get('/integrations/webhooks', 
  authenticate, 
  requireFeature('api_webhooks'),
  integrationController.getWebhooks
);

router.post('/integrations/slack', 
  authenticate, 
  requireFeature('integrations_slack'),
  integrationController.connectSlack
);
```

### Segurança

```javascript
// routes/securityRoutes.js
router.get('/security/audit-logs', 
  authenticate, 
  requireFeature('audit_logs'),
  securityController.getAuditLogs
);

router.post('/security/2fa/enable', 
  authenticate, 
  requireFeature('security_2fa'),
  securityController.enable2FA
);

router.post('/security/ip-whitelist', 
  authenticate, 
  requireFeature('security_ip_whitelist'),
  securityController.addIPWhitelist
);
```

### Personalização

```javascript
// routes/customizationRoutes.js
router.post('/customization/branding', 
  authenticate, 
  requireFeature('custom_branding'),
  customizationController.updateBranding
);

router.post('/customization/domain', 
  authenticate, 
  requireFeature('custom_domain'),
  customizationController.setCustomDomain
);

router.post('/customization/themes', 
  authenticate, 
  requireFeature('custom_themes'),
  customizationController.createTheme
);
```

## 🔍 Verificação Programática

Você também pode verificar features programaticamente dentro de controllers:

```javascript
// controllers/ticketController.js
import featureAccessService from '../services/featureAccessService.js';

export const createTicket = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;
    
    // Verificar se tem acesso a campos personalizados
    const hasCustomFields = await featureAccessService.checkFeatureAccess(
      organizationId,
      'tickets_custom_fields'
    );
    
    if (hasCustomFields && req.body.customFields) {
      // Processar campos personalizados
      ticket.customFields = req.body.customFields;
    }
    
    // Verificar se tem acesso a aprovação
    const hasApproval = await featureAccessService.checkFeatureAccess(
      organizationId,
      'tickets_approval'
    );
    
    if (hasApproval && req.body.requiresApproval) {
      ticket.status = 'aguardando_aprovacao';
    }
    
    await ticket.save();
    
    res.json({ ticket });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

## 📊 Resposta de Erro

Quando uma feature não está disponível, o middleware retorna:

```json
{
  "error": "Funcionalidade não disponível",
  "message": "Seu plano não inclui as funcionalidades necessárias: knowledge_base",
  "missingFeatures": ["knowledge_base"],
  "upgrade": true,
  "upgradeMessage": "Faça upgrade do seu plano para acessar esta funcionalidade"
}
```

## 🎯 Boas Práticas

1. **Sempre use `authenticate` antes de `requireFeature`**
   ```javascript
   router.get('/protected',
     authenticate,        // Primeiro autenticar
     requireFeature('...'), // Depois verificar feature
     controller.action
   );
   ```

2. **Combine com validação de limites quando necessário**
   ```javascript
   router.post('/users',
     authenticate,
     requireFeature('users_management'),
     requireResourceLimit('maxUsers', getCount),
     controller.createUser
   );
   ```

3. **Use `attachPlanInfo` para endpoints que exibem informações do plano**
   ```javascript
   router.get('/settings',
     authenticate,
     attachPlanInfo,
     controller.getSettings
   );
   ```

4. **Agrupe features relacionadas**
   ```javascript
   // Requer todas as features de automação
   router.post('/automation/advanced',
     authenticate,
     requireFeature([
       'automation_rules',
       'automation_workflows',
       'automation_triggers'
     ]),
     controller.createAdvancedAutomation
   );
   ```

## 🚀 Próximos Passos

1. Aplicar middleware em todas as rotas que requerem features específicas
2. Atualizar frontend para exibir mensagens de upgrade quando necessário
3. Criar página de comparação de planos no portal
4. Implementar sistema de notificação quando limites estão próximos

---

**Documentação criada em**: 2026-04-09
**Versão**: 1.0.0

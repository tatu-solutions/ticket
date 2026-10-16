import featureAccessService from '../services/featureAccessService.js';
import logger from '../config/logger.js';

/**
 * Middleware para proteger rotas que requerem features específicas do plano
 * 
 * @param {string|string[]} featureName - Nome da feature ou array de features requeridas
 * @param {Object} options - Opções adicionais
 * @param {boolean} options.requireAll - Se true, requer todas as features. Se false, requer pelo menos uma (default: true)
 * 
 * @example
 * // Requer uma feature específica
 * router.get('/knowledge/articles', 
 *   authenticate, 
 *   requireFeature('knowledge_base'),
 *   controller.getArticles
 * );
 * 
 * @example
 * // Requer múltiplas features (todas)
 * router.post('/automation/rules',
 *   authenticate,
 *   requireFeature(['automation_rules', 'automation_workflows']),
 *   controller.createRule
 * );
 * 
 * @example
 * // Requer pelo menos uma das features
 * router.get('/reports',
 *   authenticate,
 *   requireFeature(['reports_basic', 'reports_advanced'], { requireAll: false }),
 *   controller.getReports
 * );
 */
export const requireFeature = (featureName, options = {}) => {
  const { requireAll = true } = options;

  return async (req, res, next) => {
    try {
      // Verificar se o usuário está autenticado
      if (!req.user) {
        return res.status(401).json({
          error: 'Não autenticado',
          message: 'Você precisa estar autenticado para acessar este recurso'
        });
      }

      // Obter organizationId do contexto do usuário
      const organizationId = req.user.organizationId || req.user.contextId;

      if (!organizationId) {
        logger.warn('Usuário sem organizationId no contexto:', req.user);
        return res.status(403).json({
          error: 'Contexto inválido',
          message: 'Não foi possível identificar sua organização'
        });
      }

      // Normalizar featureName para array
      const features = Array.isArray(featureName) ? featureName : [featureName];

      // Verificar acesso às features
      const accessResults = await featureAccessService.checkMultipleFeatures(
        organizationId,
        features
      );

      // Determinar se tem acesso baseado nas opções
      let hasAccess = false;
      
      if (requireAll) {
        // Requer todas as features
        hasAccess = features.every(f => accessResults[f] === true);
      } else {
        // Requer pelo menos uma feature
        hasAccess = features.some(f => accessResults[f] === true);
      }

      if (!hasAccess) {
        const missingFeatures = features.filter(f => !accessResults[f]);
        
        logger.warn(`Acesso negado - Features faltando:`, {
          organizationId,
          missingFeatures,
          user: req.user.id
        });

        return res.status(403).json({
          error: 'Funcionalidade não disponível',
          message: requireAll 
            ? `Seu plano não inclui as funcionalidades necessárias: ${missingFeatures.join(', ')}`
            : `Seu plano não inclui nenhuma das funcionalidades necessárias`,
          missingFeatures,
          upgrade: true,
          upgradeMessage: 'Faça upgrade do seu plano para acessar esta funcionalidade'
        });
      }

      // Adicionar informações de features ao request para uso posterior
      req.features = accessResults;
      req.organizationId = organizationId;

      next();
    } catch (error) {
      logger.error('Erro no middleware requireFeature:', error);
      return res.status(500).json({
        error: 'Erro ao verificar permissões',
        message: 'Ocorreu um erro ao validar o acesso à funcionalidade'
      });
    }
  };
};

/**
 * Middleware para verificar limites de recursos
 * 
 * @param {string} limitType - Tipo de limite (maxUsers, maxClients, etc)
 * @param {Function} getCurrentCount - Função que retorna a contagem atual (recebe req)
 * 
 * @example
 * router.post('/users',
 *   authenticate,
 *   requireResourceLimit('maxUsers', async (req) => {
 *     return await User.count({ where: { organizationId: req.user.organizationId }});
 *   }),
 *   controller.createUser
 * );
 */
export const requireResourceLimit = (limitType, getCurrentCount) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Não autenticado'
        });
      }

      const organizationId = req.user.organizationId || req.user.contextId;

      if (!organizationId) {
        return res.status(403).json({
          error: 'Contexto inválido'
        });
      }

      // Obter contagem atual
      const currentCount = await getCurrentCount(req);

      // Verificar limite
      const limitCheck = await featureAccessService.checkResourceLimit(
        organizationId,
        limitType,
        currentCount
      );

      if (!limitCheck.allowed) {
        logger.warn(`Limite de recurso atingido:`, {
          organizationId,
          limitType,
          limit: limitCheck.limit,
          current: limitCheck.current
        });

        return res.status(403).json({
          error: 'Limite atingido',
          message: limitCheck.message,
          limit: limitCheck.limit,
          current: limitCheck.current,
          upgrade: true,
          upgradeMessage: 'Faça upgrade do seu plano para aumentar este limite'
        });
      }

      // Adicionar informações de limite ao request
      req.resourceLimit = limitCheck;

      next();
    } catch (error) {
      logger.error('Erro no middleware requireResourceLimit:', error);
      return res.status(500).json({
        error: 'Erro ao verificar limites'
      });
    }
  };
};

/**
 * Middleware para adicionar informações do plano ao request
 * Útil para endpoints que precisam exibir informações do plano
 */
export const attachPlanInfo = async (req, res, next) => {
  try {
    if (!req.user) {
      return next();
    }

    const organizationId = req.user.organizationId || req.user.contextId;

    if (!organizationId) {
      return next();
    }

    const planInfo = await featureAccessService.getOrganizationPlanInfo(organizationId);
    
    if (planInfo) {
      req.planInfo = planInfo;
    }

    next();
  } catch (error) {
    logger.error('Erro no middleware attachPlanInfo:', error);
    // Não bloqueia a requisição, apenas loga o erro
    next();
  }
};

export default {
  requireFeature,
  requireResourceLimit,
  attachPlanInfo
};

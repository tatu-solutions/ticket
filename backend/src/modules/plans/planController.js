import featureAccessService from '../../services/featureAccessService.js';
import Plan from '../../models/Plan.js';
import Subscription from '../../models/Subscription.js';
import Organization from '../../modules/organizations/organizationModel.js';
import logger from '../../config/logger.js';

/**
 * Busca informações do plano atual da organização
 */
export const getOrganizationPlan = async (req, res) => {
  try {
    const organizationId = req.user.organizationId || req.user.contextId;

    if (!organizationId) {
      return res.status(400).json({
        error: 'Organização não identificada'
      });
    }

    const planInfo = await featureAccessService.getOrganizationPlanInfo(organizationId);

    if (!planInfo) {
      return res.status(404).json({
        error: 'Plano não encontrado',
        message: 'Nenhum plano ativo encontrado para esta organização'
      });
    }

    res.json(planInfo);
  } catch (error) {
    logger.error('Erro ao buscar plano da organização:', error);
    res.status(500).json({
      error: 'Erro ao buscar plano',
      message: error.message
    });
  }
};

/**
 * Busca features disponíveis para a organização
 */
export const getOrganizationFeatures = async (req, res) => {
  try {
    const organizationId = req.user.organizationId || req.user.contextId;

    if (!organizationId) {
      return res.status(400).json({
        error: 'Organização não identificada'
      });
    }

    const features = await featureAccessService.getOrganizationFeatures(organizationId);

    res.json({ features });
  } catch (error) {
    logger.error('Erro ao buscar features:', error);
    res.status(500).json({
      error: 'Erro ao buscar features',
      message: error.message
    });
  }
};

/**
 * Verifica acesso a uma feature específica
 */
export const checkFeatureAccess = async (req, res) => {
  try {
    const { featureName } = req.params;
    const organizationId = req.user.organizationId || req.user.contextId;

    if (!organizationId) {
      return res.status(400).json({
        error: 'Organização não identificada'
      });
    }

    const hasAccess = await featureAccessService.checkFeatureAccess(
      organizationId,
      featureName
    );

    res.json({
      featureName,
      hasAccess
    });
  } catch (error) {
    logger.error('Erro ao verificar feature:', error);
    res.status(500).json({
      error: 'Erro ao verificar feature',
      message: error.message
    });
  }
};

/**
 * Verifica acesso a múltiplas features
 */
export const checkMultipleFeatures = async (req, res) => {
  try {
    const { features } = req.body;
    const organizationId = req.user.organizationId || req.user.contextId;

    if (!organizationId) {
      return res.status(400).json({
        error: 'Organização não identificada'
      });
    }

    if (!Array.isArray(features)) {
      return res.status(400).json({
        error: 'Features deve ser um array'
      });
    }

    const accessResults = await featureAccessService.checkMultipleFeatures(
      organizationId,
      features
    );

    res.json({ features: accessResults });
  } catch (error) {
    logger.error('Erro ao verificar múltiplas features:', error);
    res.status(500).json({
      error: 'Erro ao verificar features',
      message: error.message
    });
  }
};

/**
 * Busca informações de uso e limites
 */
export const getUsageInfo = async (req, res) => {
  try {
    const organizationId = req.user.organizationId || req.user.contextId;

    if (!organizationId) {
      return res.status(400).json({
        error: 'Organização não identificada'
      });
    }

    const planInfo = await featureAccessService.getOrganizationPlanInfo(organizationId);

    if (!planInfo) {
      return res.status(404).json({
        error: 'Plano não encontrado'
      });
    }

    // Buscar contagens atuais (você pode expandir isso conforme necessário)
    const usage = {
      users: {
        current: 0, // TODO: Implementar contagem real
        limit: planInfo.limits.maxUsers,
        percentage: 0
      },
      clients: {
        current: 0, // TODO: Implementar contagem real
        limit: planInfo.limits.maxClients,
        percentage: 0
      },
      storage: {
        current: 0, // TODO: Implementar contagem real
        limit: planInfo.limits.maxStorageGB,
        unit: 'GB',
        percentage: 0
      },
      tickets: {
        current: 0, // TODO: Implementar contagem real
        limit: planInfo.limits.maxTicketsPerMonth,
        period: 'month',
        percentage: 0
      }
    };

    res.json({
      plan: planInfo,
      usage
    });
  } catch (error) {
    logger.error('Erro ao buscar informações de uso:', error);
    res.status(500).json({
      error: 'Erro ao buscar informações de uso',
      message: error.message
    });
  }
};

/**
 * Busca planos disponíveis para upgrade
 */
export const getAvailablePlans = async (req, res) => {
  try {
    const plans = await Plan.findAll({
      where: { isActive: true },
      order: [['sortOrder', 'ASC'], ['monthlyPrice', 'ASC']],
      attributes: [
        'id',
        'name',
        'displayName',
        'description',
        'monthlyPrice',
        'yearlyPrice',
        'currency',
        'maxUsers',
        'maxClients',
        'maxStorageGB',
        'maxTicketsPerMonth',
        'maxAttachmentSizeMB',
        'features',
        'featuresText',
        'trialDays'
      ]
    });

    res.json({ plans });
  } catch (error) {
    logger.error('Erro ao buscar planos disponíveis:', error);
    res.status(500).json({
      error: 'Erro ao buscar planos',
      message: error.message
    });
  }
};

export default {
  getOrganizationPlan,
  getOrganizationFeatures,
  checkFeatureAccess,
  checkMultipleFeatures,
  getUsageInfo,
  getAvailablePlans
};

/**
 * CRUD de Planos para Backoffice (Provider)
 */

/**
 * Listar todos os planos (para backoffice)
 */
export const getPlans = async (req, res) => {
  try {
    const plans = await Plan.findAll({
      order: [['sortOrder', 'ASC'], ['monthlyPrice', 'ASC']]
    });

    // Contar subscriptions por plano
    const plansWithCount = await Promise.all(
      plans.map(async (plan) => {
        const subscriptionCount = await Subscription.count({
          where: { planId: plan.id, status: 'active' }
        });

        return {
          ...plan.toJSON(),
          organizationCount: subscriptionCount
        };
      })
    );

    res.json({ plans: plansWithCount });
  } catch (error) {
    logger.error('Erro ao listar planos:', error);
    res.status(500).json({
      error: 'Erro ao listar planos',
      message: error.message
    });
  }
};

/**
 * Buscar plano por ID (para backoffice)
 */
export const getPlanById = async (req, res) => {
  try {
    const { id } = req.params;

    const plan = await Plan.findByPk(id);

    if (!plan) {
      return res.status(404).json({
        error: 'Plano não encontrado'
      });
    }

    // Contar subscriptions
    const subscriptionCount = await Subscription.count({
      where: { planId: id, status: 'active' }
    });

    res.json({
      plan: {
        ...plan.toJSON(),
        organizationCount: subscriptionCount
      }
    });
  } catch (error) {
    logger.error('Erro ao buscar plano:', error);
    res.status(500).json({
      error: 'Erro ao buscar plano',
      message: error.message
    });
  }
};

/**
 * Criar novo plano (para backoffice)
 */
export const createPlan = async (req, res) => {
  try {
    const planData = req.body;

    // Validar dados obrigatórios
    if (!planData.name || !planData.displayName) {
      return res.status(400).json({
        error: 'Nome e nome de exibição são obrigatórios'
      });
    }

    // Verificar se já existe plano com esse nome
    const existingPlan = await Plan.findOne({
      where: { name: planData.name }
    });

    if (existingPlan) {
      return res.status(400).json({
        error: 'Já existe um plano com este nome'
      });
    }

    const plan = await Plan.create(planData);

    logger.info(`Plano criado: ${plan.name} (${plan.id})`);

    res.status(201).json({ plan });
  } catch (error) {
    logger.error('Erro ao criar plano:', error);
    res.status(500).json({
      error: 'Erro ao criar plano',
      message: error.message
    });
  }
};

/**
 * Atualizar plano (para backoffice)
 */
export const updatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const planData = req.body;

    const plan = await Plan.findByPk(id);

    if (!plan) {
      return res.status(404).json({
        error: 'Plano não encontrado'
      });
    }

    // Não permitir alterar o nome se já tem subscriptions ativas
    if (planData.name && planData.name !== plan.name) {
      const subscriptionCount = await Subscription.count({
        where: { planId: id, status: 'active' }
      });

      if (subscriptionCount > 0) {
        return res.status(400).json({
          error: 'Não é possível alterar o nome de um plano com assinaturas ativas'
        });
      }
    }

    await plan.update(planData);

    logger.info(`Plano atualizado: ${plan.name} (${plan.id})`);

    res.json({ plan });
  } catch (error) {
    logger.error('Erro ao atualizar plano:', error);
    res.status(500).json({
      error: 'Erro ao atualizar plano',
      message: error.message
    });
  }
};

/**
 * Deletar plano (para backoffice)
 */
export const deletePlan = async (req, res) => {
  try {
    const { id } = req.params;

    const plan = await Plan.findByPk(id);

    if (!plan) {
      return res.status(404).json({
        error: 'Plano não encontrado'
      });
    }

    // Verificar se tem subscriptions ativas
    const subscriptionCount = await Subscription.count({
      where: { planId: id, status: 'active' }
    });

    if (subscriptionCount > 0) {
      return res.status(400).json({
        error: 'Não é possível deletar um plano com assinaturas ativas',
        message: `Este plano tem ${subscriptionCount} assinatura(s) ativa(s)`
      });
    }

    await plan.destroy();

    logger.info(`Plano deletado: ${plan.name} (${plan.id})`);

    res.json({
      success: true,
      message: 'Plano deletado com sucesso'
    });
  } catch (error) {
    logger.error('Erro ao deletar plano:', error);
    res.status(500).json({
      error: 'Erro ao deletar plano',
      message: error.message
    });
  }
};

/**
 * Ativar plano (para backoffice)
 */
export const activatePlan = async (req, res) => {
  try {
    const { id } = req.params;

    const plan = await Plan.findByPk(id);

    if (!plan) {
      return res.status(404).json({
        error: 'Plano não encontrado'
      });
    }

    await plan.update({ isActive: true });

    logger.info(`Plano ativado: ${plan.name} (${plan.id})`);

    res.json({ plan });
  } catch (error) {
    logger.error('Erro ao ativar plano:', error);
    res.status(500).json({
      error: 'Erro ao ativar plano',
      message: error.message
    });
  }
};

/**
 * Desativar plano (para backoffice)
 */
export const deactivatePlan = async (req, res) => {
  try {
    const { id } = req.params;

    const plan = await Plan.findByPk(id);

    if (!plan) {
      return res.status(404).json({
        error: 'Plano não encontrado'
      });
    }

    await plan.update({ isActive: false });

    logger.info(`Plano desativado: ${plan.name} (${plan.id})`);

    res.json({ plan });
  } catch (error) {
    logger.error('Erro ao desativar plano:', error);
    res.status(500).json({
      error: 'Erro ao desativar plano',
      message: error.message
    });
  }
};

/**
 * Buscar subscriptions de um plano (para backoffice)
 */
export const getPlanSubscriptions = async (req, res) => {
  try {
    const { id } = req.params;

    const plan = await Plan.findByPk(id);

    if (!plan) {
      return res.status(404).json({
        error: 'Plano não encontrado'
      });
    }

    const subscriptions = await Subscription.findAll({
      where: { planId: id },
      include: [{
        model: Organization,
        as: 'organization',
        attributes: ['id', 'name', 'slug']
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json({ subscriptions });
  } catch (error) {
    logger.error('Erro ao buscar subscriptions do plano:', error);
    res.status(500).json({
      error: 'Erro ao buscar subscriptions',
      message: error.message
    });
  }
};

/**
 * Buscar planos públicos (para landing page)
 */
export const getPublicPlans = async (req, res) => {
  try {
    const plans = await Plan.findAll({
      where: { isActive: true },
      order: [['sortOrder', 'ASC'], ['monthlyPrice', 'ASC']],
      attributes: [
        'id',
        'name',
        'displayName',
        'description',
        'monthlyPrice',
        'yearlyPrice',
        'currency',
        'maxUsers',
        'maxClients',
        'maxStorageGB',
        'maxTicketsPerMonth',
        'featuresText',
        'trialDays',
        'isDefault'
      ]
    });

    res.json({ plans });
  } catch (error) {
    logger.error('Erro ao buscar planos públicos:', error);
    res.status(500).json({
      error: 'Erro ao buscar planos',
      message: error.message
    });
  }
};
